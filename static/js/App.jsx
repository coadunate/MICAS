import React, { Component} from "react";
import {Grid, Row, Col } from 'react-bootstrap'

import Header from './components/HeaderView';
import DatabaseSelector from './components/DatabaseSelectorView';

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
                    <Header name={this.props.name}/>
                    <DatabaseSelector />
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
