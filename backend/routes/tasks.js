const router = require('express').Router();
let Task = require('../models/task.model');

router.route('/').get((req,res) => {
    Task.find()
    .then(tasks => res.json(tasks))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req,res) => {
    const keywords = req.body.keywords;
    const frequency = req.body.frequency;
    const org_id = req.body.org_id;
    const naics = req.body.naics;
    const email = req.body.email;

    const newTask = new Task({keywords, frequency, org_id, naics, email});

    newTask.save()
    .then(tasks => res.json('User Added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req,res) => {
    Task.findById(req.params.id)
    .then(task => res.json(task))
    .catch(err => res.status(400).json('Error: ' + err));
})

router.route('/:id').delete((req,res) => {
    Task.findByIdAndDelete(req.params.id)
    .then(() => res.json('Task Deleted!'))
    .catch(err => res.status(400).json('Error: ' + err));
})

router.route('/update/:id').post((req,res) => {
     Task.findById(req.params.id)
    .then(task => {
        task.keywords = req.body.keywords;
        task.frequency = req.body.frequency;
        task.org_id = req.body.org_id;
        task.naics = req.body.naics;
        task.email = req.body.email;

        task.save()
        .then(() => res.json('Task Updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
})

module.exports = router;