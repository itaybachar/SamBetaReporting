const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    keywords: {type: String, required: true, trim: true},
    frequency: {type: String, required: true, trim: true},
    org_id: {type: Number, required: true, trim: true},
    naics: {type: Number, required: true, trim: true},
    email: {type: String, required: true, trim: true}
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;