import React, { Component } from 'react';
import { Col, Row, Radio, Button, Well } from 'react-bootstrap';
import { FormGroup, FormControl } from 'react-bootstrap';

import PreExistingDatabase from './DatabaseView/PreExistingDatabaseView';
import CustomDatabase from './DatabaseView/CustomDatabaseView';
import ChooseDirectoryView from './ChooseDirectoryView';

import '../../css/DatabaseSelector.css';

var $ = require('jquery');

/**
* DatabaseSelectorView class contains the functiaonlity and the U.I for the
* two database creation methods.
*/
class DatabaseSelectorView extends Component {

  constructor(props){
    super(props)

    this.state = {
      minion_read_location: '/dev/null',
      xWIMP_location: '/dev/null',
      selectedDB: 'preDB',
      showLoading: false,
      preDB: {
        bacteria: true,
        archaea: false,
        virus: false
      }
    }

    // Function Binding to preserve `this` keyword.
    this.updatePreDatabases.bind(this);
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
  * updateLocations -- UPdates the locatiosn for minION and xWIMP locations.
  */
  updateLocations = (minION_location, xwimp_location) =>
    this.setState({
          minion_read_location: minION_location,
          xWIMP_location: xwimp_location
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
    var location_data = {
        "minION": this.state.minion_read_location,
        "xWIMP": this.state.xWIMP_location
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
    if(this.state.selectedDB === 'preDB'){
      // if user has selected pre-exisiting database
      if(this.validateLocations()){

        var predb = {
          minion: this.state.minion_read_location,
          xwimp: this.state.xWIMP_location,
          bacteria: this.state.preDB.bacteria,
          archaea: this.state.preDB.archaea,
          virus: this.state.preDB.virus
        };

        $.post(window.location.href + 'download_database', predb, (data) => {

        });
      }
    }
  }

  /**
  * render -- renders the U.I for DatabaseSelectorView
  */
  render(){

    // Logic statement to determine whether or not the "Next" button should be
    // disabled.
    let disableNext  = this.state.preDB.bacteria == false &&
                       this.state.preDB.archaea == false &&
                       this.state.preDB.virus == false

    return(
      <form className="go-left" onSubmit={this.createDatabase.bind(this)}>
        <Col md={12}>
          <ChooseDirectoryView changeLocation={this.updateLocations} />
          <hr />
          <Row>
            <Col md={4}></Col>
            <Col md={4}>
              { this.state.showLoading && <div className="text-center loadingIcon"></div> }
            </Col>
            <Col md={4}></Col>
          </Row>
          <Row>
            <Radio name="radioGroup" value="preDB" checked={this.state.selectedDB === 'preDB'} onChange={(e) => { this.setState({ selectedDB: 'preDB' }) }}>
              Pre-Existing Databases
            </Radio>
          </Row>
          <Row>
          minION: { this.state.minion_read_location } ---- xWIMP: { this.state.xWIMP_location } Bacteria: { this.state.preDB.bacteria ? 'YES' : 'NO' } ---- Archaea: { this.state.preDB.archaea ? 'YES' : 'NO' } ---- Virus { this.state.preDB.virus ? 'YES' : 'NO'}
          </Row>
          <Row>
            <PreExistingDatabase currentDBState={this.state.preDB} changeDBState={ this.updatePreDatabases }/>
          </Row>
          <br />
          <Row>
            <Radio name="radioGroup" value="customDB" checked={this.state.selectedDB === 'customDB'} onChange={(e) => { this.setState({ selectedDB: 'customDB'}) }}>
              Custom Database
            </Radio>
          </Row>
          <Row>
            <CustomDatabase/>
          </Row>
          <Row>
            <Button bsStyle="primary" type="submit" className="pull-right" disabled={disableNext} onClick={this.showLoading.bind(this)}>Next</Button>
          </Row>
        </Col>
      </form>
    );
  }
}

export default DatabaseSelectorView;
