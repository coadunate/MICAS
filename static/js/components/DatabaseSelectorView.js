import React, { Component } from 'react';
import { Col, FormGroup, Radio, Button } from 'react-bootstrap'
//import shell from 'shelljs';

import PreExistingDatabase from './DatabaseView/PreExistingDatabaseView';
import CustomDatabase from './DatabaseView/CustomDatabaseView';

import '../../css/DatabaseSelector.css';

var $ = require('jquery');


class DatabaseSelector extends Component {

  constructor(props){
    super(props)

    this.state = { selectedDB: 'preDB', preDB: { bacteria: true, archaea: false, virus: false } }
    this.updatePreDatabases.bind(this);
  }

  updatePreDatabases(dbState){
    this.setState({ preDB: dbState });
  }

  createDatabase(e){
    e.preventDefault();
    if(this.state.selectedDB === 'preDB'){
      // if user has selected pre-exisiting database
      $.get(window.location.href + 'create_pre_db', (data) => {
            console.log(data);
      });
    }
  }

  render(){
    let allPreDBFalse  = this.state.preDB.bacteria == false && this.state.preDB.archaea == false && this.state.preDB.virus == false;
    // let shell = require('shelljs');
    // // let string = shell.cat('/Users/tayabsoomro/shell.txt');
    // // console.log(string);
    // shell.exec(`node --version`, () => {
    //     console.log("Created react app")
    //     resolve(true)
    //   })
    return(
      <Col md={12}>

          <form onSubmit={this.createDatabase.bind(this)}>
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
              <Button bsStyle="primary" type="submit" className="pull-right" disabled={allPreDBFalse}>Next</Button>
            </FormGroup>
          </form>

      </Col>
    );
  }
}

export default DatabaseSelector;
