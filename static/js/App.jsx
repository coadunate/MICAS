import React, { Component} from "react";
import {Grid, Row, Col } from 'react-bootstrap'

import HeaderView from './components/HeaderView';
import DatabaseSelectorView from './components/DatabaseSelectorView';

import '../css/App.css';

class App extends Component {
    render () {
        return (
          <div className="App">
            <Grid fluid={true}>
              <div className="walk"></div>
              <Row className="show-grid">
                <Col md={12}>
                  <Col md={2}></Col>
                  <Col md={8}>
                    <HeaderView name={this.props.name}/>
                    <DatabaseSelectorView />
                  </Col>
                  <Col md={2}></Col>
                </Col>
              </Row>
            </Grid>
          </div>
        );
    }
}

export default App;
