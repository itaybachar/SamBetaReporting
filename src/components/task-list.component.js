import React, { Component } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import TaskModal from './task-modal.component';

const Task = function ({ task, updateTable, deleteTask }) {
	
    return (
        <tr>
            <td>{task.keywords}</td>
            <td>{task.frequency} days</td>
            <td>
	    {task.naics.map(cur => {
			return `${cur.naicsTitle}(${cur.naicsCode})`;
		    }).join(', ')}
			    </td>
            <td>
		{task.org.map(cur => {
			return `${cur.org.shortName}(${cur.org.code})`
		}).join(', ')
		}
	    </td>
            <td>{task.email}</td>
            <td>
	    	<TaskModal task={task} reloadTable={updateTable} newTask={false} />
            </td>
            <td>
                <Button className="btn btn-dark" onClick={() => deleteTask(task._id)} >Delete</Button>
            </td>
        </tr>
    )
}

export default class TaskList extends Component {
    constructor(props) {
        super(props);

        this.updateTable = this.updateTable.bind(this);

        this.deleteTask = this.deleteTask.bind(this);

        this.state = { tasks: [] };
    }

    updateTable() {
        axios.get('http://192.168.0.170:5000/tasks/')
            .then(response => {
		    this.setState({ tasks: response.data }) })
            .catch(err => console.log(err));
    }

    componentDidMount() {
        this.updateTable();
    }

    deleteTask(id) {
        axios.delete('http://192.168.0.170:5000/tasks/' + id)
            .then(res => this.updateTable())
            .catch(err => console.log(err));
    }

    taskList() {
        return this.state.tasks.map(currentTask => {
            return <Task task={currentTask} updateTable={this.updateTable} deleteTask={this.deleteTask} key={currentTask._id} />
        });
    }

    render() {
        return (
            <div>
                <div className="modal-footer d-flex justify-content-center">
	    		<TaskModal reloadTable={this.updateTable} newTask={true} />
                </div>
                <Table striped bordered hover variant="dark">
                    <thead>
                        <tr>
                            <th >Keywords</th>
                            <th >Frequency</th>
                            <th >NAICS</th>
                            <th >Organization ID</th>
                            <th >Email</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.taskList()}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Keywords</th>
                            <th>Frequency</th>
                            <th>NAICS</th>
                            <th>Organization ID</th>
                            <th>Email</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </tfoot>
                </Table>
            </div>
        )
    }
}
