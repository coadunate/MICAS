import React, { Component} from "react";
import {Grid, Row, Col, Well } from 'react-bootstrap';

import { makeWidthFlexible, Sankey } from 'react-vis';

import HeaderView from './components/HeaderView';

import io from 'socket.io-client';
let socket = io('http://' + document.domain + ':' + location.port + '/analysis');

import '../css/AnalysisPage.css';


const nodes = [{'name': 'Viruses'}, {'name': 'dsDNA viruses, no RNA stage'}, {'name': 'Caudovirales'}, {'name': 'Siphoviridae'}, {'name': 'Lambdavirus'}, {'name': 'Escherichia virus Lambda'}, {'name': 'Viruses'}, {'name': 'dsDNA viruses, no RNA stage'}, {'name': 'Caudovirales'}, {'name': 'Siphoviridae'}, {'name': 'Lambdavirus'}, {'name': 'Escherichia virus Lambda'}];
const links = [{'target': 1, 'source': 0, 'value': 20}, {'target': 2, 'source': 1, 'value': 20}, {'target': 3, 'source': 2, 'value': 20}, {'target': 4, 'source': 3, 'value': 20}, {'target': 5, 'source': 4, 'value': 20}, {'target': 7, 'source': 6, 'value': 20}, {'target': 8, 'source': 7, 'value': 20}, {'target': 9, 'source': 8, 'value': 20}, {'target': 10, 'source': 9, 'value': 20}, {'target': 11, 'source': 10, 'value': 20}];


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
                        <Well ref={'SankeyContainer'}>
                        <FlexSankeyPlot />
                        </Well>
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
