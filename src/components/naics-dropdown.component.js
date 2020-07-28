import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Form, Toast, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import './component.css'

const NaicsEntry = function({ entry, callback}) {
    return (
        <Dropdown.Item onSelect={()=>callback(entry)}> {entry.naicsCode} {entry.naicsTitle}</Dropdown.Item>
    )
}

const ToastSelected = function({naics, callback}){
	return (
		<Toast onClose={()=>callback(naics)}>
			<Toast.Header></Toast.Header>
			<Toast.Body>{naics.naicsCode} ({naics.naicsTitle})</Toast.Body>
		</Toast>
	)
}

export default class NaicsDropdown extends Component {
    constructor(props) {
        super(props);
        this.getList = this.getList.bind(this);
	this.getEntries = this.getEntries.bind(this);
	    this.addSelected = this.addSelected.bind(this);
	    this.removeSelected = this.removeSelected.bind(this);

        this.state = {
            naicsList: [],
	    selectedNaics: props.defaultVal
        };
    }

    getList(term) {
        const searchUri =  `https://beta.sam.gov/api/prod/locationservices/v1/api/naics?q=${term}&active=Y`

        axios.get(searchUri)
            .then(result => {
                this.setState({ naicsList: result.data._embedded.nAICSList.splice(0,100) });
            })
            .catch(err =>{ 
		    console.log(err)
		    this.setState({ naicsList: [] });
	    });
    }

    getEntries() {
	    return this.state.naicsList.map(currentEntry => {
		    return <NaicsEntry entry={currentEntry} callback={this.addSelected} key={currentEntry.naicsId} />  
	    })
    }

	getSelected() {
		return this.state.selectedNaics.map(currentNaics => {
			return <ToastSelected naics={currentNaics} callback={this.removeSelected}/>
		})
	}

	removeSelected(val){

		const index = this.state.selectedNaics.indexOf(val);
		this.setState(prev =>({
			selectedNaics: prev.selectedNaics.splice(index,index+1)
		}))
		this.props.setHandler(this.state.selectedNaics);
	}

    componentDidMount(){
	this.getList('');
    }


	addSelected(val){
		if(!this.state.selectedNaics.includes(val))
		this.setState(prev =>({
			selectedNaics: [...prev.selectedNaics, val]
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
