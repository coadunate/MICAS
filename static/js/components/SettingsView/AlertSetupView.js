import React, { Component } from 'react';
import { Well, Row, Col, FormGroup, FormControl, Button } from 'react-bootstrap';


import AlertSequences from './AlertSequences';


// import {ReactSelectize, SimpleSelect, MultiSelect} from 'react-selectize';

import '../../../css/Alert.css';

var $ = require('jquery');


class AlertSetupView extends Component {
  constructor(props){
    super(props);

    this.state = {
      phone_number: '',
      email_address: '',
      alert_sequence_threshold: 100,
      alert_sequences: [],
      isAlertSequencesDisabled: false }
  }

  handleChange(type,e){
    let newState = this.state;
    if(type === "phoneNumber"){
      newState.phone_number = e.target.value;

      this.setState(newState);
      this.props.changeAlertInfo(newState);

    } else if(type === "emailAddress"){
      newState.email_address = e.target.value;

      this.setState(newState);
      this.props.changeAlertInfo(newState);

    } else if (type == "alertSequenceThreshold"){
      newState.alert_sequence_threshold = e.target.value;

      this.setState(newState);
      this.props.changeAlertInfo(newState);
    }
  }

  updateAlertSequences(selectedSequences){
    let newState = this.state;

    newState.alert_sequences = selectedSequences
    this.setState(newState)
    this.props.changeAlertInfo(newState)
  }

  render(){
    return(
      <div>
        <Row>
          <Col md={4}>
            <b>Phone #:</b>
          </Col>
          <Col md={4}>
            <FormGroup controlId="formInlinePhoneNumber">
              <FormControl type="tel" placeholder="123-456-7890"  value={ this.state.phone_number } onChange={ this.handleChange.bind(this,"phoneNumber") }/>
            </FormGroup>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={4}>
            <b>Email Address:</b>
          </Col>
          <Col md={4}>
            <FormGroup controlId="formInlineEmailAddress">
              <FormControl type="email" placeholder="someone@company.com" value={ this.state.email_address } onChange={ this.handleChange.bind(this,"emailAddress") } />
            </FormGroup>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={4}>
            <b>Alert Sequences:</b>
          </Col>
          <Col md={4}>
            <AlertSequences changeAlertSequences={ this.updateAlertSequences.bind(this) } />
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={4}>
            <b>Alert Threshold (# of reads):</b>
          </Col>
          <Col md={4}>
            <FormGroup controlId="formInlineQueryThreshold">
              <FormControl type="number" placeholder="# of reads" value={ this.state.alert_sequence_threshold } onChange={ this.handleChange.bind(this,"alertSequenceThreshold") } />
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }
}

export default AlertSetupView;
