const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    keywords: {type: String, trim: true},
    frequency: {type: String, required: true, trim: true},
    org: {type: Array, trim: true},
    naics: {type: Array, trim: true},
    email: {type: String, required: true, trim: true}
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
