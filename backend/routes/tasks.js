const router = require('express').Router();
let Task = require('../models/task.model');
const scheduler = require('../scheduler/schedule');

router.route('/').get((req, res) => {
    Task.find()
        .then(tasks => res.json(tasks))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const keywords = req.body.keywords;
    const frequency = req.body.frequency;
    const org = req.body.org;
    const naics = req.body.naics;
    const email = req.body.email;

    const newTask = new Task({ keywords, frequency, org, naics, email });

    newTask.save()
        .then(tasks => res.json('User Added!'))
        .catch(err => res.status(400).json('Error: ' + err));

    scheduler.addTask(newTask);
});

router.route('/:id').get((req, res) => {
    Task.findById(req.params.id)
        .then(task => res.json(task))
        .catch(err => res.status(400).json('Error: ' + err));
})

router.route('/:id').delete((req, res) => {
    Task.findByIdAndDelete(req.params.id)
        .then(() => res.json('Task Deleted!'))
        .catch(err => res.status(400).json('Error: ' + err));

    scheduler.removeTask(req.params.id);
})

router.route('/update/:id').post((req, res) => {
    Task.findById(req.params.id)
        .then(task => {
            task.keywords = req.body.keywords;
            task.frequency = req.body.frequency;
            task.org = req.body.org;
            task.naics = req.body.naics;
            task.email = req.body.email;

            scheduler.updateTask(task);

            task.save()
                .then(() => res.json('Task Updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
})

module.exports = router;
