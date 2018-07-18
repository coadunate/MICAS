import React, { Component } from 'react';
import { Col, Row, Radio, Button, Well } from 'react-bootstrap';
import { FormGroup, FormControl } from 'react-bootstrap';

import NCBIDatabaseView from './SettingsView/DatabaseView/NCBIDatabaseView';
import AdditionalDatabaseView from './SettingsView/DatabaseView/AdditionalDatabaseView';
import ConfigurationView from './SettingsView/ConfigurationView';
import Alert from './SettingsView/Alert';

import '../../css/SettingsView.css';

import axios from 'axios';

var $ = require('jquery');

import io from 'socket.io-client';
let socket = io('http://' + document.domain + ':' + location.port + '/');

/**
* DatabaseSelectorView class contains the functiaonlity and the U.I for the
* two database creation methods.
*/
class SettingsView extends Component {

  constructor(props){
    super(props)

    this.state = {
      minion_read_location: '/dev/null',
      app_location: '/dev/null',
      showLoading: false,
      queries: [],
      alertInfo: {
        phone: null,
        email: null
      },
      preDB: {
        bacteria: true,
        archaea: false,
        virus: false
      }
    }

    // Function Binding to preserve `this` keyword.
    this.updatePreDatabases.bind(this);
    this.updateQueries.bind(this);
    this.createDatabase.bind(this);
    this.updateLocations.bind(this);
    this.validateLocations.bind(this);
  }

  /**
  * updatePreDatabases -- Updates the selected pre-exisiting databases from the
  * checkbox.
  */
  updatePreDatabases = (dbState) => this.setState({ preDB: dbState });

  /**
  * updateQueries -- Updates the queries information.
  */
  updateQueries = (newQueries) => this.setState({ queries: newQueries })

  /**
  * updateAlertInfo -- Updates the alert information for the user
  */
  updateAlertInfo = (newAlertInfo) => this.setState({ alertInfo: newAlertInfo })

  /**
  * updateLocations -- UPdates the locatiosn for minION and app locations.
  */
  updateLocations = (minION_location, _app_location) =>
    this.setState({
          minion_read_location: minION_location,
          app_location: _app_location
        });

  /**
  * Shows the loading GIF while the database is being downloaded.
  */
  showLoading = () => this.setState({ showLoading: true });

  /**
  * validateLocations -- validates the user-typed
  */
  validateLocations(){
    var validityCheck = false;
    var queryFiles = ""
    this.state.queries.map(query => {queryFiles += query.file + ';'})
    var location_data = {
        "minION": this.state.minion_read_location,
        "App": this.state.app_location,
        "Queries": queryFiles
    }
    // $.post(window.location.href + 'validate_locations', location_data, (data) => {
    //   data = JSON.parse(data);
    //   return data.code == 0 ? true : false;
    // });
    $.ajax({
      type: 'POST',
      url: window.location.href + 'validate_locations',
      data: location_data,
      success: (data) => {
        data = JSON.parse(data);
        validityCheck = data.code == 0 ? true : false;
      },
      async:false
    });
    return validityCheck;
  }

  /**
  * createDatabase -- Creates a new database from the configuration
  * user has provided through the form.
  */
  createDatabase(e){
    e.preventDefault();

    // if user has selected pre-exisiting database
    if(this.validateLocations()){

      var dbinfo = {
        minion: this.state.minion_read_location,
        app_location: this.state.app_location,
        bacteria: this.state.preDB.bacteria,
        archaea: this.state.preDB.archaea,
        virus: this.state.preDB.virus
      };

      console.log(this.state.queries)

      socket.emit('download_database',dbinfo,this.state.queries)
      socket.on('go_to_analysis',function(data){
          window.location = data.url
      });

      // $.post(window.location.href + 'download_database', predb, (data) => {
      //
      // });
    }

  }

  /**
  * render -- renders the U.I for DatabaseSelectorView
  */
  render(){

    return(

      <Col md={12}>
        <form name="settingsForm" autoComplete="off" className="go-left" onSubmit={this.createDatabase.bind(this)}>
          <Row><h3>Database Selection</h3></Row>
          <Well>
            <Row>
              <NCBIDatabaseView currentDBState={this.state.preDB} changeDBState={ this.updatePreDatabases }/>
            </Row>
            <br />
            <Row>
              <AdditionalDatabaseView currentQueryState={this.state.queries} changeQueryState={ this.updateQueries }/>
            </Row>
          </Well>
          <Row><h3>Configuration</h3></Row>
          <Well>
            <Row>
              <Col md={12}><ConfigurationView appname={this.props.appname} changeLocation={this.updateLocations} /></Col>
            </Row>
          </Well>
          <Row><h3>Alert</h3></Row>
          <Well>
            <Row>
              <Col md={12}><Alert appname={this.props.appname} changeAlertInfo={this.updateAlertInfo} /></Col>
            </Row>
          </Well>
          <Row>
            <Button bsStyle="primary" type="submit" className="pull-right" onClick={this.showLoading.bind(this)}><i className="fa fa-database"></i> Create Database</Button>
          </Row>
        </form>
      </Col>
    );
  }
}

export default SettingsView;
