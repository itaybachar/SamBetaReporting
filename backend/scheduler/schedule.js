const cron = require('node-cron');
let Task = require('../models/task.model');
const axios = require('axios');
const mailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

var currentTasks = {};

let transport = mailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'sambeta.noreply@gmail.com',
		pass: '123698745Asdf'
	}});


function startupTasks() {
	Task.find()
	.then(tasks => {
		tasks.forEach(e => addTask(e));
	})
	.catch(err => console.log('Error: ' + err))
}

function addTask(task) {
	const cronSchedule = `0 17 */${task.frequency} * *`
	const cronSchedule1 = `*/1 * * * *`
	console.log('startcron');
	currentTasks[task._id] = cron.schedule( cronSchedule1, () => { getResults(task) });

}

function removeTask(taskId) {
	console.log('remove');
	if(currentTasks[taskId])
		currentTasks[taskId].destroy();
}

function updateTask(task){
	console.log('update task')
	removeTask(task._id);
	addTask(task);
}

function getResults(task) {
	var results = [];
	const { to, from } = getDates(Number(task.frequency));
	const keywords = task.keywords.replace(',','').replace(' ','%20');
	const naics = task.naics.map(cur => {return cur.naicsCode}).join(',');
	const org = task.org.map(cur=> {return `${cur.org.orgKey}`}).join(',');
	var page = 0;
	console.log(org);
	var uri = `https://beta.sam.gov/api/prod/sgs/v1/search/?q=${keywords}&naics=${naics}&modified_date.to=${to}&modified_date.from=${from}&index=opp&sort=-relevance&mode=search&is_active=true&page=${page}`

	axios.get(uri)
	.then(result => {
		sendEmail(task,result.data);	
	})
	.catch(err => console.log(err));
}

function sendEmail(task,result) {
	console.log(result)
	let file = getHtml(result);

	let message  = {
		from: '',
		to: task.email,
		subject: 'Sam Beta Listings',
		text: 'This periods listings',
		attachments: [
			{
				filename: 'listings.html',
				content: file
			}
		]
	};

	transport.sendMail(message, function(e) 
		{
			if(e)
				console.log(e);
			return;
		}
	);

}

function getHtml(result) {
	let template = fs.readFileSync(path.join(__dirname,'./example.html')).toString();

	let page = template.replace('<ROOT>', result._embedded.results.map(cur => {
		return `<tr><td><a href='https://beta.sam.gov/opp/${cur._id}/view#description'><div>${cur.title}</div></a></td><td>${cur.descriptions[0].content}</td></tr>`
	}).join(''));

	console.log(page);
	return page;

}

function getDates(interval) {
	let date = new Date();
	let month = ('0' + (date.getMonth() +1)).slice(-2);
	let day = ('0' + date.getDate()).slice(-2);
	const to = `${date.getFullYear()}-${month}-${day}-17:00`;

	date.setDate(date.getDate()-2);
	month = ('0' + (date.getMonth() +1)).slice(-2);
	day = ('0' + date.getDate()).slice(-2);
	const from = `${date.getFullYear()}-${month}-${day}-17:00`;
	return { to , from };
}

exports.startupTasks = startupTasks;
exports.addTask = addTask;
exports.removeTask = removeTask;
exports.updateTask = updateTask;
