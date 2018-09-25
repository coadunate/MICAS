import React, { Component} from "react";
import {Grid, Row, Col, Well, Button } from 'react-bootstrap';
import {ListGroup, ListGroupItem} from 'react-bootstrap'
import { makeWidthFlexible, Sankey } from 'react-vis';
import HeaderView from '../components/HeaderView';
import KronaView from '../components/KronaView';
import Hint from 'react-vis/dist/plot/hint'
import { LabelSeries } from 'react-vis'
import {Sunburst} from 'react-vis';
import { Dot } from 'react-animated-dots';
import {curveCatmullRom} from 'd3-shape';
import 'react-vis/dist/style.css';
import ReactFauxDOM from 'react-faux-dom';
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries,
  VerticalGridLines,
  HorizontalBarSeries
} from 'react-vis'

var margin = { top: 10, right: 0, bottom: 10, left: 0 };
var width = 690 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var $ = require('jquery');

import io from 'socket.io-client';

let socket = io('http://' + document.domain + ':' + location.port + '/analysis');

import '../../css/AnalysisPage.css';

import d3 from 'd3';
import sankey from 'd3-plugins-sankey';
let _ = require('underscore');
var cloneDeep = require('lodash.clonedeep');

var color = function(){
  const color = d3.scale.ordinal(d3.schemeCategory10);
  return name => color(name.replace(/ .*/, ""));
}

var my_sankey = d3.sankey()
  .size([width, height])
  .nodeWidth(15)
  .nodePadding(10);

var path = my_sankey.link();



const BarSeries = HorizontalBarSeries;

const COLORS = [
  '#cd3b54',
  '#59b953',
  '#ba4fb9',
  '#99b53e',
  '#7f61d3',
  '#c9a83a',
  '#626dbc',
  '#e08b39',
  '#5ea0d8',
  '#cf4d2a',
  '#4fb79b',
  '#d24691',
  '#528240',
  '#c388d2',
  '#80742b',
  '#9c4a6d',
  '#caaa70',
  '#e0829f',
  '#9d5d30',
  '#dc7666'
];


const D3FlareData = {
 "children": [
  {
   "name": "CLASSIFIED",
   "hex": "#12939A",
   "value": 20,
   "children": [
    {"name": "Proteobacteria", "hex": "#12939A", "value": 5},
    {
      "name": "Spirochaetes",
      "hex": "#12939A",
      "value": 2,
      "children": [
        {"name": "Alert 1", "hex": "#FF8800", "value": 14}
      ]
    },
    {"name": "Fusobacteria", "hex": "#12939A", "value": 7},
    {"name": "Acidobacteria", "hex": "#12939A", "value": 8},
    {"name": "Thermodesulfobacteria", "hex": "#12939A", "value": 12},
    {"name": "Euryarchaeota", "hex": "#12939A", "value": 12},
   ]
  },
  {
   "name": "UNPROCESSED",
   "value": 50
  }
 ]
}

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

function getKeyPath(node) {
  if (!node.parent) {
    return ['All'];
  }

  return [node.data && node.data.name || node.name].concat(getKeyPath(node.parent));
}

function updateData(data, keyPath) {
  if (data.children) {
    data.children.map(child => updateData(child, keyPath));
  }
  // add a fill to all the uncolored cells
  if (!data.hex) {
    data.style = {
      fill: COLORS[5]
    };
  }
  data.style = {
    ...data.style,
    fillOpacity: keyPath && !keyPath[data.name] ? 0.2 : 1
  };

  return data;
}

const decoratedData = updateData(D3FlareData, false);

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
        pathValue: false,
        data: decoratedData,
        finalValue: 'ALL',
        clicked: false
      }

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


      return svgNode.toReact();
    }
    // render () {
    //     const {activeLink} = this.state;
    //
    //     var SankeyPlot = ({ width }) =>
    //             <Sankey
    //               style={{
    //                 height: "auto",
    //                 minHeight: "550%",
    //                 paddingTop: "100px"
    //               }}
    //               nodes={this.state.sankeyData.nodes}
    //               links={this.state.sankeyData.links}
    //               width={width}
    //               height={200}
    //               layout={2}
    //               align="center"
    //               hideLabels={false}
    //               labelRotation={-45}
    //               nodePadding={2}
    //               nodeWidth={5}
    //             >
    //             </Sankey>
    //
    //     SankeyPlot.propTypes = { width: React.PropTypes.number }
    //     var FlexSankeyPlot = makeWidthFlexible(SankeyPlot)
    //
    //     var downloadDatabase = this.state.databaseDownloaded;
    //
    //     var alertdata = []
    //
    //     this.state.alertsInfo.alerts.map( (sequence) => {
    //         alertdata.push(<BarSeries key={sequence.name} onValueClick={(datapoint, event)=>{ return (<Hint x={10} y={10} value={ tayab } style={{fontSize: 14}}/>) }} data={[{"y": sequence.name, "x": sequence.num_reads}]} />)
    //     })
    //
    //     var thresholdlinedata = []
    //     this.state.alertsInfo.alerts.map( (sequence) => {
    //       thresholdlinedata.push({"y": sequence.name, "x": this.state.alertsInfo.seqs_threshold })
    //     })
    //
    //     if(downloadDatabase){
    //       const {clicked, data, finalValue, pathValue} = this.state;
    //       return (
    //
    //         <div className="SetupPage">
    //
    //             <Grid fluid={true}>
    //               <div className="walk"></div>
    //               <Row className="show-grid">
    //                 <Col md={12}>
    //                   <Col md={1} />
    //                   <Col md={10}>
    //                     <HeaderView name={this.props.name}/>
    //                   </Col>
    //                   <Col md={1} />
    //                 </Col>
    //               </Row>
    //               <Row>
    //                 <Col md={12}>
    //                   <Well style={{ minHeight: "300px"}}>
    //                     <Col md={4}></Col>
    //                     <Col md={4}>
    //                       <Sunburst
    //                         animation
    //                         className="basic-sunburst-example"
    //                         hideRootNode
    //                         onValueMouseOver={node => {
    //                           if (clicked) {
    //                             return;
    //                           }
    //                           const path = getKeyPath(node).reverse();
    //                           const pathAsMap = path.reduce((res, row) => {
    //                             res[row] = true;
    //                             return res;
    //                           }, {});
    //                           this.setState({
    //                             finalValue: path[path.length - 1],
    //                             pathValue: path.join(' > '),
    //                             data: updateData(decoratedData, pathAsMap)
    //                           });
    //                         }}
    //                         onValueMouseOut={() => clicked ? () => {} : this.setState({
    //                           pathValue: false,
    //                           finalValue: false,
    //                           data: updateData(decoratedData, false)
    //                         })}
    //                         onValueClick={() => this.setState({clicked: !clicked})}
    //                         style={{
    //                           stroke: '#ddd',
    //                           strokeOpacity: 0.3,
    //                           strokeWidth: '0.5'
    //                         }}
    //                         colorType="literal"
    //                         getSize={d => d.value}
    //                         getColor={d => d.hex}
    //                         data={data}
    //                         height={300}
    //                         width={350}>
    //                         {finalValue && <LabelSeries data={[
    //                           {x: 0, y: 0, label: finalValue, style: LABEL_STYLE}
    //                         ]} />}
    //
    //                       </Sunburst>
    //                     </Col>
    //                     <Col md={4}></Col>
    //                   </Well>
    //                 </Col>
    //               </Row>
    //               <Row>
    //                 <Col md={12}>
    //                   <Well>
    //                     <h4>Alerts</h4>
    //                     <XYPlot
    //                       width={780}
    //                       height={300}
    //                       margin={{left: 180, right: 10, top: 10, bottom: 40}}
    //                       yType="ordinal">
    //                       <VerticalGridLines />
    //                       <HorizontalGridLines />
    //                       <XAxis />
    //                       <YAxis />
    //                       {alertdata}
    //                       <LineSeries color="red" data={thresholdlinedata}/>
    //                     </XYPlot>
    //                   </Well>
    //                 </Col>
    //               </Row>
    //               <Row>
    //                 <Col md={12}>
    //                   <div style={{ height: '30vh'}}>
    //                     { this.state.sankeyData.nodes.length > 0 &&
    //                       <FlexSankeyPlot />
    //                     }
    //                     {
    //                       this.state.sankeyData.nodes.length == 0 &&
    //                       <div>
    //                         <br />
    //                         <h3>No significant data has been reported for snakey plot yet</h3>
    //                       </div>
    //                     }
    //                   </div>
    //                 </Col>
    //               </Row>
    //             </Grid>
    //           </div>
    //       );
    //     }else{
    //       return (
    //         <div>
    //           <Col md={12}>
    //             <Well style={{top:'0', bottom:'0', left:'0', right:'0', minHeight: window.innerHeight + 'px', position: 'absolute'}}>
    //               <h3 className="text-center" style={{ marginTop: window.innerHeight/2 + 'px'}}>
    //                 The database is still downloading
    //                 <Dot><span style={{ fontSize: '40px' }} >.</span></Dot>
    //                 <Dot><span style={{ fontSize: '40px' }} >.</span></Dot>
    //                 <Dot><span style={{ fontSize: '40px' }} >.</span></Dot>
    //               </h3>
    //             </Well>
    //           </Col>
    //         </div>
    //       );
    //     }
    // }
}

export default AnalysisPage;
