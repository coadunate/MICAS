import React, { Component } from 'react';
import { Col, FormGroup, Radio, Button } from 'react-bootstrap'

import PreExistingDatabase from './DatabaseView/PreExistingDatabaseView';
import CustomDatabase from './DatabaseView/CustomDatabaseView';

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
      selectedDB: 'preDB',
      preDB: {
        bacteria: true,
        archaea: false,
        virus: false
      }
    }

    // Function Binding to preserve `this` keyword.
    this.updatePreDatabases.bind(this);
    this.createDatabase.bind(this);
  }

  /**
  * updatePreDatabases -- Updates the selected pre-exisiting databases from the
  * checkbox.
  */
  updatePreDatabases = (dbState) => this.setState({ preDB: dbState });

  /**
  * createDatabase -- Creates a new database from the configuration
  * user has provided through the form.
  */
  createDatabase(e){
    e.preventDefault();
    if(this.state.selectedDB === 'preDB'){
      // if user has selected pre-exisiting database
      $.get(window.location.href + 'create_pre_db', (data) => {
            console.log(data);
      });
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
      <Col md={12}>

          <form onSubmit={this.createDatabase}>
            <FormGroup className="go-left">
              <Radio name="radioGroup" value="preDB" checked={this.state.selectedDB === 'preDB'} onChange={(e) => { this.setState({ selectedDB: 'preDB' }) }}>
                Pre-Existing Databases
              </Radio>
              Bacteria: { this.state.preDB.bacteria ? 'YES' : 'NO' } ---- Archaea: { this.state.preDB.archaea ? 'YES' : 'NO' } ---- Virus { this.state.preDB.virus ? 'YES' : 'NO'}
              <PreExistingDatabase currentDBState={this.state.preDB} changeDBState={ this.updatePreDatabases }/>
              <br />
              <Radio name="radioGroup" value="customDB" checked={this.state.selectedDB === 'customDB'} onChange={(e) => { this.setState({ selectedDB: 'customDB'}) }}>
                Custom Database
              </Radio>
              <CustomDatabase/>
              <Button bsStyle="primary" type="submit" className="pull-right" disabled={disableNext}>Next</Button>
            </FormGroup>
          </form>

      </Col>
    );
  }
}

export default DatabaseSelectorView;
