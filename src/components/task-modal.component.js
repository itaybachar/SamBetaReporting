import React, { Component } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import OrgDropdown from './org-dropdown.component';
import NaicsDropdown from './naics-dropdown.component';
import axios from 'axios';

export default class TaskModal extends Component {
	constructor(props) {
		super(props);
		
		this.setKeywords = this.setKeywords.bind(this);
		this.setFrequency = this.setFrequency.bind(this);
		this.setOrg = this.setOrg.bind(this);
		this.setNaics = this.setNaics.bind(this);
		this.setEmail = this.setEmail.bind(this);
		this.submitTask = this.submitTask.bind(this);

		if(props.newTask) {
			this.state = {
            			keywords: ' ',
            			frequency: '1',
            			org: [],
            			naics: [],
            			email: ' ',
            			show: false,
				btnText: 'Add',
				uri='http://192.168.0.170:5000/tasks/add'

			}
		} 
		else {
			this.state = {
			        keywords: this.props.task.keywords,
            			frequency: this.props.task.frequency,
            			org: this.props.task.org,
            			naics: this.props.task.naics,
            			email: this.props.task.email,
            			show: false,
				btnText: 'Edit'
				uri=`http://192.168.0.170:5000/tasks/update/{this.props.task._id}`
			}
		}
	}
	
	setKeywords(e) {
		this.setState({ keywords: e.target.value });
	}

	setFrequency(e) {
		this.setState({ frequency: e.target.value });
	}
	
	setOrg(e) {
		this.setState({ org: e.orgList });
	}

	setNaics(e) {
		this.setState({ naics: e.naicsList });
	}
	
	setEmail(e) {
		this.setState({ email: e.target.valued });
	}

	submitTask(e) {
		axios.post({this.state.uri},this.state)
		.then(response => {
			this.setState({ show:false });
			this.props.reloadTable();
		})
		.catch(err => console.log(err));
	}

	render(
		<>
			<Button className='btn btn-dark' onClick={() =>this.setState({ show:true })} >
				{this.state.btnText} Task	
			</Button>

			<Modal show={this.state.show} onHide={() => this.setState({ show: false })} backdrop='static' keyboard={false}>
				<Modal.Header closeButton>
					<h4 className='modal-title w-100 font-weight-bold'> {this.state.btnText} Task</h4>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group controlId='keyboards'>
							<Form.Label>Keywords</Form.Label>
							<Form.Control placeholder='Keywords' onChange{(e) => {this.setKeywords(e)}} />
							<Form.Text className='text-muted'>Comma Separated</Form.Text>
						</Form.Group>
						<NaicsDropdown defaultVal={this.state.naics} setHandler={this.setNaics}/>
						<OrgDropdown defaultVal={this.state.org} setHandler={this.setOrg}/>
						<Form.Group controlId='frequency'>
							<Form.Label>Frequency</Form.Label>
							<Form.Control as='select' defaultValue={this.state.frequency} onChange={(e) => {this.setFrequency(e)}}>
						
                                    				<option>1</option>
                                    				<option>2</option>
                                    				<option>3</option>
								<option>7</option>
                                    				<option>30</option>
                                    				<option>90</option>
                                    				<option>365</option>
                                			</Form.Control>
							<Form.Text className='text-muted'>Update Frequency</Form.Text>
						</Form.Group>
						<Form.Group controlId='formBasicEmail'>
							<Form.Label>Email Address</Form.Label>
							<Form.Control type='email' placeholder='Enter Email' onChange={(e) => {this.setEmail(e)}}/>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant='secondary' onClick={() => this.setState({ show: false })}>Close</Button>
					<Button variant='primary' onClick{() => this.submitForm()}>Submit</Button>
				</Modal.Footer>
			</Modal>
		</>
	)

}
