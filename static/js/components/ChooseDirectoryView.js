import React, { Component } from 'react';
import { Well, Row, Col, FormGroup, FormControl } from 'react-bootstrap';

var $ = require('jquery');


class ChooseDirectoryView extends Component {
  constructor(props){
    super(props);

    this.state = { minion_read_location: '/dev/null', xWIMP_location: '/dev/null' }
  }

  handleChange(type,e){
    if(type === "minION"){
      this.setState({ minion_read_location: e.target.value });
      this.props.changeLocation(e.target.value,this.state.xWIMP_location);
    } else if(type === "xWIMP"){
      this.setState({ xWIMP_location: e.target.value });
      this.props.changeLocation(this.state.minion_read_location,e.target.value);
    }
  }

  render(){
    return(
      <Well>
        <Row>
          <Col md={4}>
            <b>minION Reads Directory:</b>
          </Col>
          <Col md={4}>
            <FormGroup controlId="formInlineMinIONReads">
              <FormControl type="text" placeholder="/path/to/reads/"  value={ this.state.minion_read_location } onChange={ this.handleChange.bind(this,"minION") }/>
            </FormGroup>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={4}>
            <b>xWIMP Data Directory:</b>
          </Col>
          <Col md={4}>
            <FormGroup controlId="formInlineXWIMP">
              <FormControl type="text" placeholder="/path/to/xWIMP/" value={ this.state.xWIMP_location } onChange={ this.handleChange.bind(this,"xWIMP") } />
            </FormGroup>
          </Col>
        </Row>
      </Well>
    );
  }
}

export default ChooseDirectoryView;
