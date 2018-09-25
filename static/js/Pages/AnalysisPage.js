import React, { Component} from "react";
import {Grid, Row, Col, Well, Button } from 'react-bootstrap';
import {ListGroup, ListGroupItem, FormControl} from 'react-bootstrap'
import { makeWidthFlexible, Sankey } from 'react-vis';
import HeaderView from '../components/HeaderView';
import { LabelSeries } from 'react-vis'
import { Dot } from 'react-animated-dots';
import 'react-vis/dist/style.css';
import ReactFauxDOM from 'react-faux-dom';
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries,
  VerticalGridLines,
  HorizontalBarSeries,
  RadialChart,
  Hint
} from 'react-vis'


import Sunburst from '../components/Sunburst';
import { hierarchy } from 'd3-hierarchy';

var $ = require('jquery');

import io from 'socket.io-client';

let socket = io('http://' + document.domain + ':' + location.port + '/analysis');

import '../../css/AnalysisPage.css';


const BarSeries = HorizontalBarSeries;

import d3 from 'd3';
import sankey from 'd3-plugins-sankey';
let _ = require('underscore');
var cloneDeep = require('lodash.clonedeep');
import { scaleOrdinal, schemeCategory10 } from 'd3-scale';

const color = scaleOrdinal(schemeCategory10);

var margin = { top: 10, right: 0, bottom: 10, left: 0 };
var width = window.innerWidth - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;


var my_sankey = d3.sankey()
  .size([width, height])
  .nodeWidth(15)
  .nodePadding(10);

var path = my_sankey.link();

const sun_data =  {
 "name": "Root",
 "children": [
  {
   "name": "CLASSIFIED",
   "hex": "#12939A",
   "size": 20,
   "children": [
    {"name": "Proteobacteria", "hex": "#12939A", "size": 5},
    {
      "name": "Spirochaetes",
      "hex": "#12939A",
      "size": 2,
      "children": [
        {"name": "Alert 1", "hex": "#FF8800", "size": 14}
      ]
    },
    {'name': 'p_Verrucomicrobia', 'size': 4}, {'name': 'p_Tenericutes', 'size': 5},
    {'name': 'p_Spirochaetes', 'size': 5}, {'name': 'p_Cyanobacteria', 'size': 9},
    {'name': 'p_Euryarchaeota', 'size': 12}, {'name': 'p_Bacteroidetes', 'size': 25},
    {'name': 'p_Actinobacteria', 'size': 112}, {'name': 'p_Chordata', 'size': 234},
    {'name': 'p_Firmicutes', 'size': 29048},
    {'name': 'p_Proteobacteria', 'size': 38614},
   ]
  },
  {
   "name": "UNPROCESSED",
   "size": 50
  }
 ]
}

const root = hierarchy(sun_data)
  .sum(d => d.size) //size)
  //.sum(d => 1) // count
  //.sort((a, b) => b.value - a.value);

function buildValue(hoveredCell) {
  const {radius, angle, angle0} = hoveredCell;
  const truedAngle = (angle + angle0) / 2;
  return {
    x: radius * Math.cos(truedAngle),
    y: radius * Math.sin(truedAngle)
  };
}

const tipStyle = {
  display: 'flex',
  color: '#fff',
  background: '#000',
  alignItems: 'center',
  padding: '5px'
};
const boxStyle = {height: '10px', width: '10px'};

const LABEL_STYLE = {
  fontSize: '15px',
  textAnchor: 'middle'
};


class AnalysisPage extends Component {

    constructor(props){
      super(props);
      this.state = {
        databaseDownloaded: true,
        databaseDownloadTimer: null,
        timelineInfo: {
          num_total_reads: 0,
          num_classified_reads: 0
        },
        alertsInfo: {
          alerts: [],
          seqs_threshold: 100
        },
        sankeyData: {
          nodes: [],
          links: []
        },
        sankeyFilterValue: 0
      }

    }

    updateSankeyFilter = (e) => {
      var value = e.target.value
      socket.emit('update_sankey_filter',this.props.appLocation,value)
      this.setState({ sankeyFilterValue: value })

    }

    updateSankey = (app_location) => {
      let url = '/get_sankey_data?app_location=' + app_location
      $.getJSON(url, (response) => {
        if(response.status == 200){
          var newSankeyData = {
            nodes: response.nodes,
            links: response.links
          }
          this.setState({ sankeyData: newSankeyData })
        }else{
          console.log("->" + response.status)
        }
      });

    }

    updateAlertInfo = (app_location) => {
      let url = '/get_alert_info?app_location=' + app_location
      $.getJSON(url, (response) => {
        if(response.status == 200){
          var newAlertInfo = {
            alerts: response.alerts,
            seqs_threshold: response.alert_sequences_threshold
          }
          this.setState({ alertsInfo: newAlertInfo })
        }
      });
    }

    updateTimelineInfo = (app_location) => {
      let url = '/get_timeline_info?app_location=' + app_location
      $.getJSON(url, (response) => {
        if(response.status == 200){
          var newTimelineInfo = {
            num_total_reads: response.num_total_reads,
            num_classified_reads: response.num_classified_reads
          }
          this.setState({ timelineInfo: newTimelineInfo })
        }
      })
    }

    componentDidMount(){
      socket.emit('update_sankey_filter',this.props.appLocation,0)
      window.onresize = () => {
       // this.setState({windowWidth: this.refs.root.offsetWidth});
      };

      function updateAnalysis(that){
        setTimeout(() => {
          that.updateSankey(that.props.appLocation)
          that.updateAlertInfo(that.props.appLocation)
          that.updateTimelineInfo(that.props.appLocation)
          updateAnalysis(that)
        },5000)
      }

      updateAnalysis(this)


      socket.emit('start_fastq_file_listener',this.props.appLocation,this.props.minionLocation)

    }
    render() {

      var graph = {
        nodes: cloneDeep(this.state.sankeyData.nodes),
        links: cloneDeep(this.state.sankeyData.links)
      };

      var getId = (function () {
        var incrementingId = 0;
        return function(element) {
          if (!element.id) {
            element.id = "id_" + incrementingId++;
            // Possibly add a check if this ID really is unique
          }
          return element.id;
        };
      }());

      my_sankey.nodes(graph.nodes)
        .links(graph.links)
        .layout(32);


      var svgNode = ReactFauxDOM.createElement('div');

      var svg = d3.select(svgNode).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      // Add links
      var link = svg.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", (d) => Math.max(1, d.dy))


      // add link titles
      link.append("title")
        .text((d) => d.source.name + " → " + d.target.name + "\n Weight: " + d.value);


      // Add nodes
      var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("fill",(d) => color(d.name))
        .attr("transform", (d) => "translate(" + d.x + "," + d.y + ")")

      // add nodes rect
      node.append("rect")
        .attr("height", (d) => d.dy)
        .attr("width", my_sankey.nodeWidth())
        .append("title")
        .text((d) => d.name + "\n" + d.value);

      // add nodes text
      node.append("text")
        .attr("x", -6)
        .attr("y", (d) => d.dy / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text((d) => d.name)
        .filter((d) => d.x < width / 2)
        .attr("x", 6 + my_sankey.nodeWidth())
        .attr("text-anchor", "start");

      const {activeLink} = this.state;


      var SankeyPlot = ({ width }) =>
              <Sankey
                style={{
                  height: "auto",
                  minHeight: "550%",
                  paddingTop: "100px"
                }}
                nodes={this.state.sankeyData.nodes}
                links={this.state.sankeyData.links}
                width={width}
                height={200}
                layout={2}
                align="center"
                hideLabels={false}
                labelRotation={-45}
                nodePadding={2}
                nodeWidth={5}
              >
              </Sankey>

      SankeyPlot.propTypes = { width: React.PropTypes.number }
      var FlexSankeyPlot = makeWidthFlexible(SankeyPlot)

      var downloadDatabase = this.state.databaseDownloaded;

      var alertdata = []

      this.state.alertsInfo.alerts.map( (sequence) => {
          alertdata.push(<BarSeries key={sequence.name} onValueClick={(datapoint, event)=>{ return (<Hint x={10} y={10} value={ tayab } style={{fontSize: 14}}/>) }} data={[{"y": sequence.name, "x": sequence.num_reads}]} />)
      })

      var thresholdlinedata = []
      this.state.alertsInfo.alerts.map( (sequence) => {
        thresholdlinedata.push({"y": sequence.name, "x": this.state.alertsInfo.seqs_threshold })
      })

      if(downloadDatabase){
        return (

          <div className="SetupPage">
            <Grid fluid={true}>
              <Row>
                <Col lg={4}>
                    <Sunburst root={root} width={650} height={600} />
                  </Col>
                  <Col lg={8}>
                      <XYPlot
                        width={window.innerWidth/2}
                        height={300}
                        margin={{left: 210, right: 10, top: 10, bottom: 90}}
                        yType="ordinal">
                        <VerticalGridLines />
                        <HorizontalGridLines />
                        <XAxis />
                        <YAxis
                          tickLabelAngle={0}
                          tickFormat={ (t,i) => {
                            var rest = t.split(" ")
                            var first = rest[0] + " " + rest[1] + " "
                            var final = ""
                            for(var i = 2; i < rest.length; i++){
                              final += rest[i] + " "
                            }
                            return(<tspan><tspan x="0" dy="1em"><tspan style={{ fontStyle: "italic"}}>{ first}</tspan> { final }</tspan></tspan>)
                          }}
                        />{alertdata}
                        <LineSeries color="red" data={thresholdlinedata}/>
                      </XYPlot>
                  </Col>
              </Row>
              <Row>
                <Col md={12}>
                <FormControl
                    type="number"
                    min="0"
                    step="50"
                    value={this.state.sankeyFilterValue}
                    onChange={this.updateSankeyFilter}
                  />
                </Col>
              </Row>
              <Row>
                <div style={{ minHeight: '50vh'}}>
                  { this.state.sankeyData.nodes.length > 0 &&
                    svgNode.toReact()
                  }
                  {
                    this.state.sankeyData.nodes.length == 0 &&
                    <div>
                      <br />
                      <h3>No significant data has been reported for Sankey plot yet</h3>
                    </div>
                  }
                </div>
              </Row>
            </Grid>
          </div>
          /*{<div className="SetupPage">

              <Grid fluid={true}>
                <div className="walk"></div>
                <Row className="show-grid">
                  <Col md={12}>
                    <Col md={1} />
                    <Col md={10}>
                      <HeaderView name={this.props.name}/>
                    </Col>
                    <Col md={1} />
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <div style={{ minHeight: "250px"}}>
                      <Sunburst root={root} width={600} height={600} />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <div>
                      <h4>Alerts</h4>
                      <XYPlot
                        width={window.innerWidth-150}
                        height={300}
                        margin={{left: 210, right: 10, top: 10, bottom: 90}}
                        yType="ordinal">
                        <VerticalGridLines />
                        <HorizontalGridLines />
                        <XAxis />
                        <YAxis
                          tickLabelAngle={0}
                          tickFormat={ (t,i) => {
                            var rest = t.split(" ")
                            var first = rest[0] + " " + rest[1] + " "
                            var final = ""
                            for(var i = 2; i < rest.length; i++){
                              final += rest[i] + " "
                            }
                            return(<tspan><tspan x="0" dy="1em"><tspan style={{ fontStyle: "italic"}}>{ first}</tspan> { final }</tspan></tspan>)
                          }}
                        />
                        {alertdata}
                        <LineSeries color="red" data={thresholdlinedata}/>
                      </XYPlot>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <input
                    id="typeinp"
                    type="range"
                    min="0" max="100000"
                    value={this.state.sankeyFilterValue}
                    onChange={this.updateSankeyFilter}
                    step="1"/>
                </Row>
                <Row>
                  <Col md={12}>
                    <div style={{ minHeight: '50vh'}}>
                      { this.state.sankeyData.nodes.length > 0 &&
                        svgNode.toReact()
                      }
                      {
                        this.state.sankeyData.nodes.length == 0 &&
                        <div>
                          <br />
                          <h3>No significant data has been reported for snakey plot yet</h3>
                        </div>
                      }
                    </div>
                  </Col>
                </Row>
              </Grid>
            </div> }*/
        );
      }else{
        return (
          <div>
            <Col md={12}>
              <Well style={{top:'0', bottom:'0', left:'0', right:'0', minHeight: window.innerHeight + 'px', position: 'absolute'}}>
                <h3 className="text-center" style={{ marginTop: window.innerHeight/2 + 'px'}}>
                  The database is still downloading
                  <Dot><span style={{ fontSize: '40px' }} >.</span></Dot>
                  <Dot><span style={{ fontSize: '40px' }} >.</span></Dot>
                  <Dot><span style={{ fontSize: '40px' }} >.</span></Dot>
                </h3>
              </Well>
            </Col>
          </div>
        );
      }
    }
}

export default AnalysisPage;
