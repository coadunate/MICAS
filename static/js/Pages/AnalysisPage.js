import React, { Component} from "react";
import {Grid, Row, Col, Well, Button } from 'react-bootstrap';
import {ListGroup, ListGroupItem} from 'react-bootstrap'
import { makeWidthFlexible, Sankey } from 'react-vis';
import HeaderView from '../components/HeaderView';
import Hint from 'react-vis/dist/plot/hint'
import { LabelSeries } from 'react-vis'
import {Sunburst} from 'react-vis';
import { Dot } from 'react-animated-dots';
import {curveCatmullRom} from 'd3-shape';
import 'react-vis/dist/style.css';
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries,
  VerticalGridLines,
  HorizontalBarSeries
} from 'react-vis'

var $ = require('jquery');


import io from 'socket.io-client';

let socket = io('http://' + document.domain + ':' + location.port + '/analysis');

import '../../css/AnalysisPage.css';


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
   "name": "analytics",
   "hex": "#12939A",
   "children": [
    {
     "name": "cluster",
     "children": [
      {"name": "AgglomerativeCluster", "hex": "#12939A", "value": 3938},
      {"name": "CommunityStructure", "hex": "#12939A", "value": 3812},
      {"name": "HierarchicalCluster", "hex": "#12939A", "value": 6714},
      {"name": "MergeEdge", "hex": "#12939A", "value": 743}
     ]
    },
    {
     "name": "graph",
     "children": [
      {"name": "BetweennessCentrality", "hex": "#12939A", "value": 3534},
      {"name": "LinkDistance", "hex": "#12939A", "value": 5731},
      {"name": "MaxFlowMinCut", "hex": "#12939A", "value": 7840},
      {"name": "ShortestPaths", "hex": "#12939A", "value": 5914},
      {"name": "SpanningTree", "hex": "#12939A", "value": 3416}
     ]
    },
    {
     "name": "optimization",
     "children": [
      {"name": "AspectRatioBanker", "hex": "#12939A", "value": 7074}
     ]
    }
   ]
  },
  {
   "name": "animate",
   "children": [
    {"name": "Easing", "hex": "#12939A", "value": 17010},
    {"name": "FunctionSequence", "hex": "#12939A", "value": 5842},
    {
     "name": "interpolate",
     "children": [
      {"name": "ArrayInterpolator", "hex": "#12939A", "value": 1983},
      {"name": "hexInterpolator", "hex": "#12939A", "value": 2047},
      {"name": "DateInterpolator", "hex": "#12939A", "value": 1375},
      {"name": "Interpolator", "hex": "#12939A", "value": 8746},
      {"name": "MatrixInterpolator", "hex": "#12939A", "value": 2202},
      {"name": "NumberInterpolator", "hex": "#12939A", "value": 1382},
      {"name": "ObjectInterpolator", "hex": "#12939A", "value": 1629},
      {"name": "PointInterpolator", "hex": "#12939A", "value": 1675},
      {"name": "RectangleInterpolator", "hex": "#12939A", "value": 2042}
     ]
    },
    {"name": "ISchedulable", "hex": "#12939A", "value": 1041},
    {"name": "Parallel", "hex": "#12939A", "value": 5176},
    {"name": "Pause", "hex": "#12939A", "value": 449},
    {"name": "Scheduler", "hex": "#12939A", "value": 5593},
    {"name": "Sequence", "hex": "#12939A", "value": 5534},
    {"name": "Transition", "hex": "#12939A", "value": 9201},
    {"name": "Transitioner", "hex": "#12939A", "value": 19975},
    {"name": "TransitionEvent", "hex": "#12939A", "value": 1116},
    {"name": "Neonate", "hex": "#12939A", "value": 6006}
   ]
  },
  {
   "name": "data",
   "children": [
    {
     "name": "converters",
     "children": [
      {"name": "Converters", "hex": "#12939A", "value": 721},
      {"name": "DelimitedTextConverter", "hex": "#12939A", "value": 4294},
      {"name": "GraphMLConverter", "hex": "#12939A", "value": 9800},
      {"name": "IDataConverter", "hex": "#12939A", "value": 1314},
      {"name": "JSONConverter", "hex": "#12939A", "value": 2220}
     ]
    },
    {"name": "DataField", "hex": "#12939A", "value": 1759},
    {"name": "DataSchema", "hex": "#12939A", "value": 2165},
    {"name": "DataSet", "hex": "#12939A", "value": 586},
    {"name": "DataSource", "hex": "#12939A", "value": 3331},
    {"name": "DataTable", "hex": "#12939A", "value": 772},
    {"name": "DataUtil", "hex": "#12939A", "value": 3322}
   ]
  },
  {
   "name": "display",
   "children": [
    {"name": "DirtySprite", "hex": "#12939A", "value": 8833},
    {"name": "LineSprite", "hex": "#12939A", "value": 1732},
    {"name": "RectSprite", "hex": "#12939A", "value": 3623},
    {"name": "TextSprite", "hex": "#12939A", "value": 10066}
   ]
  },
  {
   "name": "flex",
   "children": [
    {"name": "FlareVis", "hex": "#12939A", "value": 4116}
   ]
  },
  {
   "name": "physics",
   "children": [
    {"name": "DragForce", "hex": "#12939A", "value": 1082},
    {"name": "GravityForce", "hex": "#12939A", "value": 1336},
    {"name": "IForce", "hex": "#12939A", "value": 319},
    {"name": "NBodyForce", "hex": "#12939A", "value": 10498},
    {"name": "Particle", "hex": "#12939A", "value": 2822},
    {"name": "Simulation", "hex": "#12939A", "value": 9983},
    {"name": "Spring", "hex": "#12939A", "value": 2213},
    {"name": "SpringForce", "hex": "#12939A", "value": 1681}
   ]
  },
  {
   "name": "query",
   "children": [
    {"name": "AggregateExpression", "hex": "#12939A", "value": 1616},
    {"name": "And", "hex": "#12939A", "value": 1027},
    {"name": "Arithmetic", "hex": "#12939A", "value": 3891},
    {"name": "Average", "hex": "#12939A", "value": 891},
    {"name": "BinaryExpression", "hex": "#12939A", "value": 2893},
    {"name": "Comparison", "hex": "#12939A", "value": 5103},
    {"name": "CompositeExpression", "hex": "#12939A", "value": 3677},
    {"name": "Count", "hex": "#12939A", "value": 781},
    {"name": "DateUtil", "hex": "#12939A", "value": 4141},
    {"name": "Distinct", "hex": "#12939A", "value": 933},
    {"name": "Expression", "hex": "#12939A", "value": 5130},
    {"name": "ExpressionIterator", "hex": "#12939A", "value": 3617},
    {"name": "Fn", "hex": "#12939A", "value": 3240},
    {"name": "If", "hex": "#12939A", "value": 2732},
    {"name": "IsA", "hex": "#12939A", "value": 2039},
    {"name": "Literal", "hex": "#12939A", "value": 1214},
    {"name": "Match", "hex": "#12939A", "value": 3748},
    {"name": "Maximum", "hex": "#12939A", "value": 843},
    {
     "name": "methods",
     "children": [
      {"name": "add", "hex": "#12939A", "value": 593},
      {"name": "and", "hex": "#12939A", "value": 330},
      {"name": "average", "hex": "#12939A", "value": 287},
      {"name": "count", "hex": "#12939A", "value": 277},
      {"name": "distinct", "hex": "#12939A", "value": 292},
      {"name": "div", "hex": "#12939A", "value": 595},
      {"name": "eq", "hex": "#12939A", "value": 594},
      {"name": "fn", "hex": "#12939A", "value": 460},
      {"name": "gt", "hex": "#12939A", "value": 603},
      {"name": "gte", "hex": "#12939A", "value": 625},
      {"name": "iff", "hex": "#12939A", "value": 748},
      {"name": "isa", "hex": "#12939A", "value": 461},
      {"name": "lt", "hex": "#12939A", "value": 597},
      {"name": "lte", "hex": "#12939A", "value": 619},
      {"name": "max", "hex": "#12939A", "value": 283},
      {"name": "min", "hex": "#12939A", "value": 283},
      {"name": "mod", "hex": "#12939A", "value": 591},
      {"name": "mul", "hex": "#12939A", "value": 603},
      {"name": "neq", "hex": "#12939A", "value": 599},
      {"name": "not", "hex": "#12939A", "value": 386},
      {"name": "or", "hex": "#12939A", "value": 323},
      {"name": "orderby", "hex": "#12939A", "value": 307},
      {"name": "range", "hex": "#12939A", "value": 772},
      {"name": "select", "hex": "#12939A", "value": 296},
      {"name": "stddev", "hex": "#12939A", "value": 363},
      {"name": "sub", "hex": "#12939A", "value": 600},
      {"name": "sum", "hex": "#12939A", "value": 280},
      {"name": "update", "hex": "#12939A", "value": 307},
      {"name": "variance", "hex": "#12939A", "value": 335},
      {"name": "where", "hex": "#12939A", "value": 299},
      {"name": "xor", "hex": "#12939A", "value": 354},
      {"name": "_", "hex": "#12939A", "value": 264}
     ]
    },
    {"name": "Minimum", "hex": "#12939A", "value": 843},
    {"name": "Not", "hex": "#12939A", "value": 1554},
    {"name": "Or", "hex": "#12939A", "value": 970},
    {"name": "Query", "hex": "#12939A", "value": 13896},
    {"name": "Range", "hex": "#12939A", "value": 1594},
    {"name": "StringUtil", "hex": "#12939A", "value": 4130},
    {"name": "Sum", "hex": "#12939A", "value": 791},
    {"name": "Variable", "hex": "#12939A", "value": 1124},
    {"name": "Variance", "hex": "#12939A", "value": 1876},
    {"name": "Xor", "hex": "#12939A", "value": 1101}
   ]
  },
  {
   "name": "scale",
   "children": [
    {"name": "IScaleMap", "hex": "#FF9833", "value": 2105},
    {"name": "LinearScale", "hex": "#FF9833", "value": 1316},
    {"name": "LogScale", "hex": "#FF9833", "value": 3151},
    {"name": "OrdinalScale", "hex": "#FF9833", "value": 3770},
    {"name": "QuantileScale", "hex": "#1A3177", "value": 2435},
    {"name": "QuantitativeScale", "hex": "#FF9833", "value": 4839},
    {"name": "RootScale", "hex": "#FF9833", "value": 1756},
    {"name": "Scale", "hex": "#FF9833", "value": 4268},
    {"name": "ScaleType", "hex": "#FF9833", "value": 1821},
    {"name": "TimeScale", "hex": "#FF9833", "value": 5833}
   ]
  },
  {
   "name": "util",
   "children": [
    {"name": "Arrays", "hex": "#12939A", "value": 8258},
    {"name": "hexs", "hex": "#12939A", "value": 10001},
    {"name": "Dates", "hex": "#12939A", "value": 8217},
    {"name": "Displays", "hex": "#12939A", "value": 12555},
    {"name": "Filter", "hex": "#12939A", "value": 2324},
    {"name": "Geometry", "hex": "#12939A", "value": 10993},
    {
     "name": "heap",
     "children": [
      {"name": "FibonacciHeap", "hex": "#12939A", "value": 9354},
      {"name": "HeapNode", "hex": "#12939A", "value": 1233}
     ]
    },
    {"name": "IEvaluable", "hex": "#12939A", "value": 335},
    {"name": "IPredicate", "hex": "#12939A", "value": 383},
    {"name": "IValueProxy", "hex": "#12939A", "value": 874},
    {
     "name": "math",
     "children": [
      {"name": "DenseMatrix", "hex": "#12939A", "value": 3165},
      {"name": "IMatrix", "hex": "#12939A", "value": 2815},
      {"name": "SparseMatrix", "hex": "#12939A", "value": 3366}
     ]
    },
    {"name": "Maths", "hex": "#12939A", "value": 17705},
    {"name": "Orientation", "hex": "#12939A", "value": 1486},
    {
     "name": "palette",
     "children": [
      {"name": "hexPalette", "hex": "#12939A", "value": 6367},
      {"name": "Palette", "hex": "#12939A", "value": 1229},
      {"name": "ShapePalette", "hex": "#12939A", "value": 2059},
      {"name": "valuePalette", "hex": "#12939A", "value": 2291}
     ]
    },
    {"name": "Property", "hex": "#12939A", "value": 5559},
    {"name": "Shapes", "hex": "#12939A", "value": 19118},
    {"name": "Sort", "hex": "#12939A", "value": 6887},
    {"name": "Stats", "hex": "#12939A", "value": 6557},
    {"name": "Strings", "hex": "#12939A", "value": 22026}
   ]
  },
  {
   "name": "vis",
   "children": [
    {
     "name": "axis",
     "children": [
      {"name": "Axes", "hex": "#12939A", "value": 1302},
      {"name": "Axis", "hex": "#12939A", "value": 24593},
      {"name": "AxisGridLine", "hex": "#12939A", "value": 652},
      {"name": "AxisLabel", "hex": "#12939A", "value": 636},
      {"name": "CartesianAxes", "hex": "#12939A", "value": 6703}
     ]
    },
    {
     "name": "controls",
     "children": [
      {"name": "AnchorControl", "hex": "#12939A", "value": 2138},
      {"name": "ClickControl", "hex": "#12939A", "value": 3824},
      {"name": "Control", "hex": "#12939A", "value": 1353},
      {"name": "ControlList", "hex": "#12939A", "value": 4665},
      {"name": "DragControl", "hex": "#12939A", "value": 2649},
      {"name": "ExpandControl", "hex": "#12939A", "value": 2832},
      {"name": "HoverControl", "hex": "#12939A", "value": 4896},
      {"name": "IControl", "hex": "#12939A", "value": 763},
      {"name": "PanZoomControl", "hex": "#12939A", "value": 5222},
      {"name": "SelectionControl", "hex": "#12939A", "value": 7862},
      {"name": "TooltipControl", "hex": "#12939A", "value": 8435}
     ]
    },
    {
     "name": "data",
     "children": [
      {"name": "Data", "hex": "#12939A", "value": 20544},
      {"name": "DataList", "hex": "#12939A", "value": 19788},
      {"name": "DataSprite", "hex": "#12939A", "value": 10349},
      {"name": "EdgeSprite", "hex": "#12939A", "value": 3301},
      {"name": "NodeSprite", "hex": "#12939A", "value": 19382},
      {
       "name": "render",
       "children": [
        {"name": "ArrowType", "hex": "#12939A", "value": 698},
        {"name": "EdgeRenderer", "hex": "#12939A", "value": 5569},
        {"name": "IRenderer", "hex": "#12939A", "value": 353},
        {"name": "ShapeRenderer", "hex": "#12939A", "value": 2247}
       ]
      },
      {"name": "ScaleBinding", "hex": "#12939A", "value": 11275},
      {"name": "Tree", "hex": "#12939A", "value": 7147},
      {"name": "TreeBuilder", "hex": "#12939A", "value": 9930}
     ]
    },
    {
     "name": "events",
     "children": [
      {"name": "DataEvent", "hex": "#12939A", "value": 2313},
      {"name": "SelectionEvent", "hex": "#12939A", "value": 1880},
      {"name": "TooltipEvent", "hex": "#12939A", "value": 1701},
      {"name": "VisualizationEvent", "hex": "#12939A", "value": 1117}
     ]
    },
    {
     "name": "legend",
     "children": [
      {"name": "Legend", "hex": "#12939A", "value": 20859},
      {"name": "LegendItem", "hex": "#12939A", "value": 4614},
      {"name": "LegendRange", "hex": "#12939A", "value": 10530}
     ]
    },
    {
     "name": "operator",
     "children": [
      {
       "name": "distortion",
       "children": [
        {"name": "BifocalDistortion", "hex": "#12939A", "value": 4461},
        {"name": "Distortion", "hex": "#12939A", "value": 6314},
        {"name": "FisheyeDistortion", "hex": "#12939A", "value": 3444}
       ]
      },
      {
       "name": "encoder",
       "children": [
        {"name": "hexEncoder", "hex": "#12939A", "value": 3179},
        {"name": "Encoder", "hex": "#12939A", "value": 4060},
        {"name": "PropertyEncoder", "hex": "#12939A", "value": 4138},
        {"name": "ShapeEncoder", "hex": "#12939A", "value": 1690},
        {"name": "valueEncoder", "hex": "#12939A", "value": 1830}
       ]
      },
      {
       "name": "filter",
       "children": [
        {"name": "FisheyeTreeFilter", "hex": "#12939A", "value": 5219},
        {"name": "GraphDistanceFilter", "hex": "#12939A", "value": 3165},
        {"name": "VisibilityFilter", "hex": "#12939A", "value": 3509}
       ]
      },
      {"name": "IOperator", "hex": "#12939A", "value": 1286},
      {
       "name": "label",
       "children": [
        {"name": "Labeler", "hex": "#12939A", "value": 9956},
        {"name": "RadialLabeler", "hex": "#12939A", "value": 3899},
        {"name": "StackedAreaLabeler", "hex": "#12939A", "value": 3202}
       ]
      },
      {
       "name": "layout",
       "children": [
        {"name": "AxisLayout", "hex": "#12939A", "value": 6725},
        {"name": "BundledEdgeRouter", "hex": "#12939A", "value": 3727},
        {"name": "CircleLayout", "hex": "#12939A", "value": 9317},
        {"name": "CirclePackingLayout", "hex": "#12939A", "value": 12003},
        {"name": "DendrogramLayout", "hex": "#12939A", "value": 4853},
        {"name": "ForceDirectedLayout", "hex": "#12939A", "value": 8411},
        {"name": "IcicleTreeLayout", "hex": "#12939A", "value": 4864},
        {"name": "IndentedTreeLayout", "hex": "#12939A", "value": 3174},
        {"name": "Layout", "hex": "#12939A", "value": 7881},
        {"name": "NodeLinkTreeLayout", "hex": "#12939A", "value": 12870},
        {"name": "PieLayout", "hex": "#12939A", "value": 2728},
        {"name": "RadialTreeLayout", "hex": "#12939A", "value": 12348},
        {"name": "RandomLayout", "hex": "#12939A", "value": 870},
        {"name": "StackedAreaLayout", "hex": "#12939A", "value": 9121},
        {"name": "TreeMapLayout", "hex": "#12939A", "value": 9191}
       ]
      },
      {"name": "Operator", "hex": "#12939A", "value": 2490},
      {"name": "OperatorList", "hex": "#12939A", "value": 5248},
      {"name": "OperatorSequence", "hex": "#12939A", "value": 4190},
      {"name": "OperatorSwitch", "hex": "#12939A", "value": 2581},
      {"name": "SortOperator", "hex": "#12939A", "value": 2023}
     ]
    },
    {"name": "Visualization", "hex": "#12939A", "value": 16540}
   ]
  }
 ]
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
  fontSize: '8px',
  textAnchor: 'middle'
};

function getKeyPath(node) {
  if (!node.parent) {
    return ['root'];
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
        finalValue: 'SUNBURST',
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

    render () {
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
                  align="left"
                  hideLabels={false}
                  labelRotation={-45}
                  nodePadding={85}
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
          const {clicked, data, finalValue, pathValue} = this.state;
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
                            <div>{clicked ? 'click to unlock selection' : 'click to lock selection'}</div>
                            <Sunburst
                              animation
                              className="basic-sunburst-example"
                              hideRootNode
                              onValueMouseOver={node => {
                                if (clicked) {
                                  return;
                                }
                                const path = getKeyPath(node).reverse();
                                const pathAsMap = path.reduce((res, row) => {
                                  res[row] = true;
                                  return res;
                                }, {});
                                this.setState({
                                  finalValue: path[path.length - 1],
                                  pathValue: path.join(' > '),
                                  data: updateData(decoratedData, pathAsMap)
                                });
                              }}
                              onValueMouseOut={() => clicked ? () => {} : this.setState({
                                pathValue: false,
                                finalValue: false,
                                data: updateData(decoratedData, false)
                              })}
                              onValueClick={() => this.setState({clicked: !clicked})}
                              style={{
                                stroke: '#ddd',
                                strokeOpacity: 0.3,
                                strokeWidth: '0.5'
                              }}
                              colorType="literal"
                              getSize={d => d.value}
                              getColor={d => d.hex}
                              data={data}
                              height={300}
                              width={350}>
                              {finalValue && <LabelSeries data={[
                                {x: 0, y: 0, label: finalValue, style: LABEL_STYLE}
                              ]} />}
                            </Sunburst>
                            <div className="basic-sunburst-example-path-name">{pathValue}</div>
                          </Well>
                        </Col>
                        <Col md={12}>
                          <Well>
                            <h4>Alerts</h4>
                            <XYPlot
                              width={800}
                              height={300}
                              margin={{left: 190, right: 10, top: 10, bottom: 40}}
                              yType="ordinal">
                              <VerticalGridLines />
                              <HorizontalGridLines />
                              <XAxis />
                              <YAxis />
                              {alertdata}
                              <LineSeries color="red" data={thresholdlinedata}/>
                            </XYPlot>
                          </Well>
                        </Col>
                        <Col md={12}>
                          <div style={{ height: '30vh'}}>
                            { this.state.sankeyData.nodes.length > 0 &&
                              <FlexSankeyPlot />
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
                      </Col>
                      <Col md={1} />
                    </Col>
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
