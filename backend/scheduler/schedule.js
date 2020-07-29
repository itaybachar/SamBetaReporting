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
	switch(task.frequency) {
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
	currentTasks[task._id] = cron.schedule( cronSchedule, () => { getResults(task) });

}

function removeTask(taskId) {
	if(currentTasks[taskId])
		currentTasks[taskId].destroy();
}

function updateTask(task){
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
	var uri = `https://beta.sam.gov/api/prod/sgs/v1/search/?q=${keywords}&modified_date.to=${to}&modified_date.from=${from}&index=opp&sort=-relevance&mode=search&is_active=true&page=${page}`
	if(task.org.length>0)
		uri = uri.concat(`&organization_id=${org}`)
	if(task.naics.length>0)
		uri = uri.concat(`&naics=${naics}`);
	console.log(uri);

	axios.get(uri)
	.then(result => {
		sendEmail(task,result.data);	
	})
	.catch(err => console.log(err));
}

function sendEmail(task,result) {
	let file = getHtml(result);

	let message  = {
		from: 'Automated Message',
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

	transporter.sendMail(message, function(e) 
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

	return page;

}

function getDates(interval) {
	let date = new Date();
	let month = ('0' + (date.getMonth() +1)).slice(-2);
	let day = ('0' + date.getDate()).slice(-2);
	const to = `${date.getFullYear()}-${month}-${day}-17:00`;
	date.setDate(date.getDate()-interval);
	month = ('0' + (date.getMonth() +1)).slice(-2);
	day = ('0' + date.getDate()).slice(-2);
	const from = `${date.getFullYear()}-${month}-${day}-17:00`;
	return { to , from };
}

exports.startupTasks = startupTasks;
exports.addTask = addTask;
exports.removeTask = removeTask;
exports.updateTask = updateTask;
