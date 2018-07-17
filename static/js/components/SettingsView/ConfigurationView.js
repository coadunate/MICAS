import React, { Component } from 'react';
import { Well, Row, Col, FormGroup, FormControl } from 'react-bootstrap';

var $ = require('jquery');


class ConfigurationView extends Component {
  constructor(props){
    super(props);

    this.state = { minion_read_location: '/dev/null', app_location: '/dev/null' }
  }

  handleChange(type,e){
    if(type === "minION"){
      this.setState({ minion_read_location: e.target.value });
      this.props.changeLocation(e.target.value,this.state.app_location);
    } else if(type === "App"){
      this.setState({ app_location: e.target.value });
      this.props.changeLocation(this.state.minion_read_location,e.target.value);
    }
  }

  render(){
    return(
      <div>
        <Row>
          <Col md={4}>
            <b>MinION Reads Directory:</b>
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
            <b>{this.props.appname} Data Directory:</b>
          </Col>
          <Col md={4}>
            <FormGroup controlId="formInlineApp">
              <FormControl type="text" placeholder={'/path/to/'+ this.props.appname.toLowerCase() + '_data' } value={ this.state.app_location } onChange={ this.handleChange.bind(this,"App") } />
            </FormGroup>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={4}>
            <b>Query Sequences:</b>
          </Col>
          <Col md={4}>
            <FormGroup controlId="formControlsSelectMultiple">
              <FormControl componentClass="select" multiple>
                <option value="0">Salmonella e. subsp</option>
                <option value="1">Saccharomyces cerevisiae</option>
                <option value="2">Theileria parva</option>
              </FormControl>
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ConfigurationView;
