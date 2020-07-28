import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Form, Toast, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import './component.css'

const OrgEntry = function({ entry, callback}) {
    return (
        <Dropdown.Item onSelect={()=>callback(entry)}> {entry.org.code} {entry.org.name}</Dropdown.Item>
    )
}

const ToastSelected = function({org, callback}){
	return (
		<Toast onClose={()=>callback(org)}>
			<Toast.Header></Toast.Header>
			<Toast.Body>{org.org.code} ({org.org.shortName})</Toast.Body>
		</Toast>
	)
}

export default class OrgDropdown extends Component {
    constructor(props) {
        super(props);
        this.getList = this.getList.bind(this);
	this.getEntries = this.getEntries.bind(this);
	    this.addSelected = this.addSelected.bind(this);
	    this.removeSelected = this.removeSelected.bind(this);

        this.state = {
            orgList: [],
	    selectedOrgs: []
        };
    }

    getList(term) {
        const searchUri = `https://beta.sam.gov/api/prod/federalorganizations/v1/search?q=${term}&pageNum=1&pageSize=25&orderBy=type&ascending=asc&levels=1,2&status=active&searchType=general&depth=&exclusive=`

        axios.get(searchUri)
            .then(result => {
                this.setState({ orgList: result.data._embedded });
            })
            .catch(err => console.log(err));
    }

    getEntries() {
	    return this.state.orgList.map(currentEntry => {
		    return <OrgEntry entry={currentEntry} callback={this.addSelected} key={currentEntry.org.orgKey} />  
	    })
    }

	getSelected() {
		return this.state.selectedOrgs.map(currentOrg => {
			return <ToastSelected org={currentOrg} callback={this.removeSelected}/>
		})
	}

	removeSelected(val){

		const index = this.state.selectedOrgs.indexOf(val);
		this.setState(prev =>({
			selectedOrgs: prev.selectedOrgs.splice(index,index+1)
		}))
		this.props.defaultHandler(this.state.selectedOrgs);
	}

    componentDidMount(){
	this.getList('');
    }


	addSelected(val){
		if(!this.state.selectedOrgs.includes(val))
		this.setState(prev =>({
			selectedOrgs: [...prev.selectedOrgs, val]
		}))
	}


    render() {
        return (
		<Row>
		<Col>
                <Dropdown>
                    <Dropdown.Toggle variant='secondary' >
                        Search Organization
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Form.Control
                            autoFocus
                            className="mx-3 my-2 w-auto"
                            placeholder="Enter Code or Name"
                            onChange={(e)=> {this.getList(e.target.value)}}
                        />
			{this.getEntries()}
                    </Dropdown.Menu>
                </Dropdown>
		</Col>
		<Col>
			{this.getSelected()}
		</Col>
		</Row>
        )
    }
}
