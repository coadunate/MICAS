import React, { Component} from "react";
import {Grid, Row, Col, Well } from 'react-bootstrap';

import HeaderView from './components/HeaderView';

import io from 'socket.io-client';
let socket = io('http://' + document.domain + ':' + location.port + '/analysis');

import '../css/AnalysisPage.css';

class AnalysisPage extends Component {

    componentDidMount(){
      socket.on('created_fastq', function(msg){
        console.log(msg.path);
      });
    }

    render () {
        return (
          <div className="SetupPage">
            <Grid fluid={true}>
              <div className="walk"></div>
              <Row className="show-grid">
                <Col md={12}>
                  <Col md={1} />
                  <Col md={10}>
                    <HeaderView name={this.props.name}/>
                    <Col md={12}>
                      <Well>
                      <h4>Timeline</h4>
                      <hr />
                      </Well>
                    </Col>
                    <Col md={12}>
                      <Col md={8}>
                        <Well className="SankeyPlotArea" />
                      </Col>
                      <Col md={4}>
                        <Row>
                          <Well>
                            <h4>Application Log</h4>
                            <hr />
                          </Well>
                        </Row>
                      </Col>
                    </Col>
                  </Col>
                  <Col md={1} />
                </Col>
              </Row>
            </Grid>
          </div>
        );
    }
}

export default AnalysisPage;
