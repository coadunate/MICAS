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


// Dimensions of sunburst.
var sunWidth = 750;
var sunHeight = 600;
var sunRadius = Math.min(sunWidth, sunHeight) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 75, h: 30, s: 3, t: 10
};

// Mapping of step names to colors.
var colors = {
  "home": "#5687d1",
  "product": "#7b615c",
  "search": "#de783b",
  "account": "#6ab975",
  "other": "#a173d1",
  "end": "#bbbbbb"
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;



var my_sankey = d3.sankey()
  .size([width, height])
  .nodeWidth(15)
  .nodePadding(10);

var path = my_sankey.link();


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

      var sunSvgNode = ReactFauxDOM.createElement('div');

      var vis = d3.select(sunSvgNode).append("svg:svg")
          .attr("width", sunWidth)
          .attr("height", sunHeight)
          .attr("style","border:1px solid black")
          .append("svg:g")
          .attr("id", "container")
          .attr("transform", "translate(" + sunWidth / 2 + "," + sunHeight / 2 + ")");

      var partition = d3.layout.partition()
          .size([2 * Math.PI, sunRadius * sunRadius])
          .value(function(d) { return d.size; });

      var arc = d3.svg.arc()
          .startAngle(function(d) { return d.x; })
          .endAngle(function(d) { return d.x + d.dx; })
          .innerRadius(function(d) { return Math.sqrt(d.y); })
          .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

      // Use d3.text and d3.csv.parseRows so that we do not need to have a header
      // row, and can receive the csv as an array of arrays.
      d3.text("https://gist.github.com/kerryrodden/7090426/raw/30b495f635f3abd3e75ab7e3d7a954bc5b6f0c3b/visit-sequences.csv", function(text) {
        var csv = d3.csv.parseRows(text);
        var json = buildHierarchy(csv);
        createVisualization(json);
      });

      // Main function to draw and set up the visualization, once we have the data.
      function createVisualization(json) {

        // Basic setup of page elements.
        initializeBreadcrumbTrail();
        drawLegend();
        d3.select("#togglelegend").on("click", toggleLegend);

        // Bounding circle underneath the sunburst, to make it easier to detect
        // when the mouse leaves the parent g.
        vis.append("svg:circle")
            .attr("r", sunRadius)
            .style("opacity", 0);

        // For efficiency, filter nodes to keep only those large enough to see.
        var nodes = partition.nodes(json)
            .filter(function(d) {
            return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
            });

        var path = vis.data([json]).selectAll("path")
            .data(nodes)
            .enter().append("svg:path")
            .attr("display", function(d) { return d.depth ? null : "none"; })
            .attr("d", arc)
            .attr("fill-rule", "evenodd")
            .style("fill", function(d) { return colors[d.name]; })
            .style("opacity", 1)
            .on("mouseover", mouseover);

        // Add the mouseleave handler to the bounding circle.
        d3.select("#container").on("mouseleave", mouseleave);

        // Get total size of the tree = value of root node from partition.
        totalSize = path.node().__data__.value;
       };

      // Fade all but the current sequence, and show it in the breadcrumb trail.
      function mouseover(d) {

        var percentage = (100 * d.value / totalSize).toPrecision(3);
        var percentageString = percentage + "%";
        if (percentage < 0.1) {
          percentageString = "< 0.1%";
        }

        d3.select("#percentage")
            .text(percentageString);

        d3.select("#explanation")
            .style("visibility", "");

        var sequenceArray = getAncestors(d);
        updateBreadcrumbs(sequenceArray, percentageString);

        // Fade all the segments.
        d3.selectAll("path")
            .style("opacity", 0.3);

        // Then highlight only those that are an ancestor of the current segment.
        vis.selectAll("path")
            .filter(function(node) {
                      return (sequenceArray.indexOf(node) >= 0);
                    })
            .style("opacity", 1);
      }

      // Restore everything to full opacity when moving off the visualization.
      function mouseleave(d) {

        // Hide the breadcrumb trail
        d3.select("#trail")
            .style("visibility", "hidden");

        // Deactivate all segments during transition.
        d3.selectAll("path").on("mouseover", null);

        // Transition each segment to full opacity and then reactivate it.
        d3.selectAll("path")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .each("end", function() {
                    d3.select(this).on("mouseover", mouseover);
                  });

        d3.select("#explanation")
            .style("visibility", "hidden");
      }

      // Given a node in a partition layout, return an array of all of its ancestor
      // nodes, highest first, but excluding the root.
      function getAncestors(node) {
        var path = [];
        var current = node;
        while (current.parent) {
          path.unshift(current);
          current = current.parent;
        }
        return path;
      }

      function initializeBreadcrumbTrail() {
        // Add the svg area.
        var trail = d3.select("#sequence").append("svg:svg")
            .attr("width", sunWidth)
            .attr("height", 50)
            .attr("id", "trail");
        // Add the label at the end, for the percentage.
        trail.append("svg:text")
          .attr("id", "endlabel")
          .style("fill", "#000");
      }

      // Generate a string that describes the points of a breadcrumb polygon.
      function breadcrumbPoints(d, i) {
        var points = [];
        points.push("0,0");
        points.push(b.w + ",0");
        points.push(b.w + b.t + "," + (b.h / 2));
        points.push(b.w + "," + b.h);
        points.push("0," + b.h);
        if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
          points.push(b.t + "," + (b.h / 2));
        }
        return points.join(" ");
      }

      // Update the breadcrumb trail to show the current sequence and percentage.
      function updateBreadcrumbs(nodeArray, percentageString) {

        // Data join; key function combines name and depth (= position in sequence).
        var g = d3.select("#trail")
            .selectAll("g")
            .data(nodeArray, function(d) { return d.name + d.depth; });

        // Add breadcrumb and label for entering nodes.
        var entering = g.enter().append("svg:g");

        entering.append("svg:polygon")
            .attr("points", breadcrumbPoints)
            .style("fill", function(d) { return colors[d.name]; });

        entering.append("svg:text")
            .attr("x", (b.w + b.t) / 2)
            .attr("y", b.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.name; });

        // Set position for entering and updating nodes.
        g.attr("transform", function(d, i) {
          return "translate(" + i * (b.w + b.s) + ", 0)";
        });

        // Remove exiting nodes.
        g.exit().remove();

        // Now move and update the percentage at the end.
        d3.select("#trail").select("#endlabel")
            .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
            .attr("y", b.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(percentageString);

        // Make the breadcrumb trail visible, if it's hidden.
        d3.select("#trail")
            .style("visibility", "");

      }

      function drawLegend() {

        // Dimensions of legend item: width, height, spacing, radius of rounded rect.
        var li = {
          w: 75, h: 30, s: 3, r: 3
        };

        var legend = d3.select("#legend").append("svg:svg")
            .attr("width", li.w)
            .attr("height", d3.keys(colors).length * (li.h + li.s));

        var g = legend.selectAll("g")
            .data(d3.entries(colors))
            .enter().append("svg:g")
            .attr("transform", function(d, i) {
                    return "translate(0," + i * (li.h + li.s) + ")";
                 });

        g.append("svg:rect")
            .attr("rx", li.r)
            .attr("ry", li.r)
            .attr("width", li.w)
            .attr("height", li.h)
            .style("fill", function(d) { return d.value; });

        g.append("svg:text")
            .attr("x", li.w / 2)
            .attr("y", li.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.key; });
      }

      function toggleLegend() {
        var legend = d3.select("#legend");
        if (legend.style("visibility") == "hidden") {
          legend.style("visibility", "");
        } else {
          legend.style("visibility", "hidden");
        }
      }

      // Take a 2-column CSV and transform it into a hierarchical structure suitable
      // for a partition layout. The first column is a sequence of step names, from
      // root to leaf, separated by hyphens. The second column is a count of how
      // often that sequence occurred.
      function buildHierarchy(csv) {
        var root = {"name": "root", "children": []};
        for (var i = 0; i < csv.length; i++) {
          var sequence = csv[i][0];
          var size = +csv[i][1];
          if (isNaN(size)) { // e.g. if this is a header row
            continue;
          }
          var parts = sequence.split("-");
          var currentNode = root;
          for (var j = 0; j < parts.length; j++) {
            var children = currentNode["children"];
            var nodeName = parts[j];
            var childNode;
            if (j + 1 < parts.length) {
         // Not yet at the end of the sequence; move down the tree.
       	var foundChild = false;
       	for (var k = 0; k < children.length; k++) {
       	  if (children[k]["name"] == nodeName) {
       	    childNode = children[k];
       	    foundChild = true;
       	    break;
       	  }
       	}
        // If we don't already have a child node for this branch, create it.
       	if (!foundChild) {
       	  childNode = {"name": nodeName, "children": []};
       	  children.push(childNode);
       	}
       	currentNode = childNode;
            } else {
       	// Reached the end of the sequence; create a leaf node.
       	childNode = {"name": nodeName, "size": size};
       	children.push(childNode);
            }
          }
        }
        return root;
      };



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
        .text((d) => {return d.name})
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
                <Col lg={12}>
                    <XYPlot
                      width={window.innerWidth}
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
