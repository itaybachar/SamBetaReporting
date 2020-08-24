const cron = require('node-cron');
let Task = require('../models/task.model');
const axios = require('axios');
const mailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const login = require('../credentials').login;

var currentTasks = {};


const transporter = mailer.createTransport({
service: 'gmail',
             auth: {
user: login.user,
      pass: login.pass
             }
});

function startupTasks() {
    Task.find()
        .then(tasks => {
            tasks.forEach(e => addTask(e));
        })
    .catch(err => console.log('Error: ' + err))
}

function addTask(task) {
    var cronSchedule;
    switch (task.frequency) {
        case '90':
            cronSchedule = `0 17 * */3 *`;
            break;
        case '365':
            cronSchedule = `0 17 * */12 *`;
            break;
        default:
            cronSchedule = `0 17 */${task.frequency} * *`;
            break;

    }
    currentTasks[task._id] = cron.schedule(cronSchedule, () => { processTask(task) });

    //Actuall execute tast whenever Added
    //Create a copy of the task in order to get last weeks results
    let taskDup = JSON.parse(JSON.stringify(task));
    taskDup.frequency = 7; 
    processTask(taskDup);
}

function removeTask(taskId) {
    if (currentTasks[taskId])
        currentTasks[taskId].destroy();
}

function updateTask(task) {
    removeTask(task._id);
    addTask(task);
}

function processTask(task) {
    //Building the URI
    const { to, from } = getDates(Number(task.frequency));
    const keywords = task.keywords.replace(',', '%20').replace(' ', '%20');
    const naics = task.naics.map(cur => { return cur.naicsCode }).join(',');
    const org = task.org.map(cur => { return `${cur.org.orgKey}` }).join(',');
    var baseUri = `https://beta.sam.gov/api/prod/sgs/v1/search/?q=${keywords}&publish_date.to=${to}&publish_date.from=${from}&index=opp&sort=-relevance&mode=search&is_active=true`
        console.log(baseUri);
        if (task.org.length > 0)
            baseUri = baseUri.concat(`&organization_id=${org}`)
                if (task.naics.length > 0)
                    baseUri = baseUri.concat(`&naics=${naics}`);

    //Getting the results
    var results = [];
    getFirstResult(baseUri)
        .then(first => {
            if(typeof first.data._embedded.results != 'undefined')
            {
                results = first.data._embedded.results;
                getResults(baseUri, Number(first.data.page.totalPages))
                    .then(res => {
                        //Build result array
                        res.forEach(cur => results.push(...cur.data._embedded.results));

                        //Sending Email
                        sendEmail(task, task.keywords, naics, org, results);
                    })
                .catch(err => console.log(err));
            } else
            {
                console.log('No results found!');
            }
        })
    .catch(err => console.log(err));

}

async function getFirstResult(uri) {
    return axios.get(uri + '&page=0');
}

function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}

async function getResults(baseUri, maxPages) {
    var results = [];

    for (var i = 1; i < maxPages; i++) {
        let uri = baseUri + `&page=${i}`;
        await delay(1500);
        let data = await axios.get(uri);
        results.push(data);
    }
    return results;
}

function sendEmail(task, keywords, naics, org, results) {
    let file = getHtml(results);

    let message = {
from: 'Automated Message',
      to: task.email,
      subject: `Sam Beta Listings for ${new Date().toString()}`,
      text: `This periods listings has ${results.length} result/s for task:\nKeywords: ${keywords}\nNAICS: ${naics}\nOrganization Id: ${org}`,
      attachments: [
      {
filename: 'listings.html',
          content: file
      }
      ]
    };

    transporter.sendMail(message, function (e) {
        if (e)
            console.log(e);
        return;
    }
    );

}

function getHtml(results) {
    let template = fs.readFileSync(path.join(__dirname, './example.html')).toString();

    let page = template.replace('<ROOT>', results.map((cur, index) => {
        let entry = `<tr><td>${index + 1}</td><td><a href='https://beta.sam.gov/opp/${cur._id}/view#description'><div>${cur.title}</div></a></td>`;
        if (cur.descriptions && cur.descriptions.length > 0)
            entry += `<td>${cur.descriptions[0].content}</td></tr>`;
        else
            entry += '<td>No Description</td>'
                return entry;
    }).join(''));

    return page;

}

function getDates(interval) {
    let date = new Date();
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let day = ('0' + date.getDate()).slice(-2);
    const to = `${date.getFullYear()}-${month}-${day}-04:00`;
    date.setDate(date.getDate() - interval);
    month = ('0' + (date.getMonth() + 1)).slice(-2);
    day = ('0' + date.getDate()).slice(-2);
    const from = `${date.getFullYear()}-${month}-${day}-04:00`;
    return { to, from };
}

exports.startupTasks = startupTasks;
exports.addTask = addTask;
exports.removeTask = removeTask;
exports.updateTask = updateTask;
