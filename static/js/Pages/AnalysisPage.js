import React, { Component} from "react";
import {Grid, Row, Col, Well, Button } from 'react-bootstrap';
import { makeWidthFlexible, Sankey } from 'react-vis';
import HeaderView from '../components/HeaderView';

import io from 'socket.io-client';
let socket = io('http://' + document.domain + ':' + location.port + '/analysis');

import '../../css/AnalysisPage.css';

const nodes = [{'name': 'Bacteria'}, {'name': 'Terrabacteria group'}, {'name': 'Firmicutes'}, {'name': 'Bacilli'}, {'name': 'Bacillales'}, {'name': 'Bacillaceae'}, {'name': 'Bacillus'}, {'name': 'Bacillus cereus group'}, {'name': 'Bacillus anthracis'}, {'name': 'B.anthracis Ames Coadunate'}, {'name': 'B.anthracis A2012 Coadunate'}];
const links = [{'source': 0, 'target': 1, 'value': 20}, {'source': 1, 'target': 2, 'value': 10}, {'source': 2, 'target': 3, 'value': 20}, {'source': 3, 'target': 4, 'value': 10}, {'source': 4, 'target': 5, 'value': 20}, {'source': 5, 'target': 6, 'value': 10}, {'source': 6, 'target': 7, 'value': 20}, {'source': 7, 'target': 8, 'value': 20}, {'source': 8, 'target': 9, 'value': 10}, {'source': 8, 'target': 10, 'value': 2}];



const SankeyPlot = ({ width }) =>
            <Sankey
              nodes={nodes}
              links={links}
              width={width}
              height={200}
              layout={1}
            />
SankeyPlot.propTypes = { width: React.PropTypes.number }
const FlexSankeyPlot = makeWidthFlexible(SankeyPlot)



class AnalysisPage extends Component {

    componentDidMount(){
      socket.on('good',function(){
          console.log("Good, it works")
          // $.get(window.location.href + 'analysis')
      });
      socket.on('connect',function(){
        console.log("CONNECTIOAN")
      })
      socket.on('created_fastq', function(msg){
        console.log(msg.path);
      });
      socket.on('my response',function(msg){
        console.log("MY RESP")
      })
    }

    TestSocket(e){
      e.preventDefault();
      console.log("Inside TestSocket")
      socket.emit('something',{'data': 'data'})
      socket.on('resp_something',function(msg){
        console.log("Response from server about something.")
      })
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
                      <Button bsStyle="primary" type="submit" className="pull-right" onClick={this.TestSocket.bind(this)}>Do Something</Button>
                      </Well>
                    </Col>
                    <Col md={12}>
                      <Col md={8}>
                        <FlexSankeyPlot />
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
