import React, { Component } from 'react';
import { Well, Row, Col, FormGroup, FormControl } from 'react-bootstrap';

var $ = require('jquery');


class AlertView extends Component {
  constructor(props){
    super(props);

    this.state = { phone_number: '', email_address: '', query_threshold: 100  }
  }

  handleChange(type,e){
    if(type === "phoneNumber"){
      this.setState({ phone_number: e.target.value });
      this.props.changeAlertInfo(this.state);
    } else if(type === "emailAddress"){
      this.setState({ email_address: e.target.value });
      this.props.changeAlertInfo(this.state);
    } else if (type == "queryThreshold"){
      this.setState({ query_threshold: e.target.value });
      this.props.changeAlertInfo(this.state);
    }
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
            <b>Query Threshold:</b>
          </Col>
          <Col md={4}>
            <FormGroup controlId="formInlineQueryThreshold">
              <FormControl type="number" placeholder="# of reads" value={ this.state.query_threshold } onChange={ this.handleChange.bind(this,"queryThreshold") } />
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }
}

export default AlertView;
