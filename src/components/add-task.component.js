import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import { Modal, Form } from 'react-bootstrap';
import OrgDropdown from './org-dropdown.component.js'
import NaicsDropdown from './naics-dropdown.component.js'
import axios from 'axios';

export default class AddTask extends Component {
    constructor(props) {
        super(props);

        this.addTask = this.addTask.bind(this);
        this.updateKeywords = this.updateKeywords.bind(this);
        this.updateFrequency = this.updateFrequency.bind(this);
        this.updateOrg = this.updateOrg.bind(this);
        this.updateNaics = this.updateNaics.bind(this);
        this.updateEmail = this.updateEmail.bind(this);

        this.state = {
            keywords: ' ',
            frequency: '1',
            org_id: null,
            naics: null,
            email: ' ',
            show: false
        }
    }

    addTask() {
        axios.post('http://192.168.0.170:5000/tasks/add',this.state)
        .then(response => { 
            this.setState({ show: false });
            this.props.reloadTable();
         })
        .catch(err => console.log(err));
    }

        
    updateKeywords(event){
        this.setState({keywords: event.target.value});
    }

    updateFrequency(event){
        this.setState({frequency: event.target.value});
    }

    updateOrg(event){
        this.setState({org_id: event.target.value});
    }

    updateNaics(event){
        this.setState({naics: event.target.value});
    }

    updateEmail(event){
        this.setState({email: event.target.value});
    }

    render() {
        return (
            <>
                <Button className="btn btn-dark" onClick={() => this.setState({ show: true })} >
                    Add Task
                </Button>

                <Modal show={this.state.show} onHide={() => this.setState({ show: false })} backdrop="static" keyboard={false}>
                    <Modal.Header closeButton>
                        <h4 className="modal-title w-100 font-weight-bold">Add Task</h4>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="keywords">
                                <Form.Label>Keywords</Form.Label>
                                <Form.Control placeholder="Keywords" onChange={(event)=>{this.updateKeywords(event)}}/>
                                <Form.Text className="text-muted">
                                    Comma Separated
                                </Form.Text>
                            </Form.Group>

                            <Form.Group controlId="naics">
                                <Form.Label>NAICS</Form.Label>
                                <Form.Control placeholder="NAICS" type='number' onChange={(event)=>{this.updateNaics(event)}}/>
                            </Form.Group>
				<NaicsDropdown></NaicsDropdown>

                            <Form.Group controlId="orgid">
                                <Form.Label>Organization ID</Form.Label>
                                <Form.Control placeholder="Organization ID" type='number' onChange={(event)=>{this.updateOrg(event)}}/>
                            </Form.Group>
                            <OrgDropdown></OrgDropdown>

                            <Form.Group controlId="frequency">
                                <Form.Label>Frequency</Form.Label>
                                <Form.Control as="select" defaultValue='1' onChange={(event)=>{this.updateFrequency(event)}}>
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>7</option>
                                    <option>30</option>
                                    <option>90</option>
                                    <option>365</option>
                                </Form.Control>
                                <Form.Text className="text-muted">
                                    How often to check for updates
                                </Form.Text>
                            </Form.Group>

                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control type="email" placeholder="Enter email" onChange={(event)=>{this.updateEmail(event)}}/>
                            </Form.Group>
                        </Form>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={() => this.setState({ show: false })} >Close</Button>
                        <Button variant='primary' onClick={() => this.addTask()} >Submit</Button>
                    </Modal.Footer>
                </Modal>

            </>
        )
    }
}
