import React, { Component} from "react";
import {Grid, Row, Col, Well, Button } from 'react-bootstrap';
import {ListGroup, ListGroupItem} from 'react-bootstrap'
import { makeWidthFlexible, Sankey } from 'react-vis';
import HeaderView from '../components/HeaderView';
import Hint from 'react-vis/dist/plot/hint'

import { Dot } from 'react-animated-dots';

import Timeline from 'react-visjs-timeline'

var $ = require('jquery');

import FusionCharts from 'fusioncharts/core';
import Column2D from 'fusioncharts/viz/column2d';
import Bar2D from 'fusioncharts/viz/bar2d';
import ReactFC from 'react-fusioncharts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.ocean';

ReactFC.fcRoot(FusionCharts, Column2D, FusionTheme, Bar2D);

import io from 'socket.io-client';

let socket = io('http://' + document.domain + ':' + location.port + '/analysis');

import '../../css/AnalysisPage.css';


const BLURRED_LINK_OPACITY = 0.3;
const FOCUSED_LINK_OPACITY = 0.6;

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
        activeLink: null,
        windowWidth: 500
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


      // (function pollServerForDownloadStatus() {
      //   let url = '/is_database_downloaded?app_location=' + app_location
      //   var _that = that;
      //   $.getJSON(url, (response) => {
      //     if(response.status == 200){
      //       _that.setState({ databaseDownloaded: true })
      //       if(_that.state.databaseDownloaded){
      //         clearTimeout(_that.state.databaseDownloadTimer)
      //       }
      //     }
      //     _that.state.databaseDownloadTimer = setTimeout(pollServerForDownloadStatus, 1000);
      //   });
      // }());


      socket.emit('start_fastq_file_listener',this.props.appLocation,this.props.minionLocation)

    }


    _renderHint() {
      const {activeLink} = this.state;

      // calculate center x,y position of link for positioning of hint
      const x = activeLink.source.x1 + ((activeLink.target.x0 - activeLink.source.x1) / 2);
      const y = activeLink.y0 - ((activeLink.y0 - activeLink.y1) / 2);

      const hintValue = {
        [`${activeLink.source.name} ➞ ${activeLink.target.name}`]: activeLink.value
      };

      return (
        <Hint x={x} y={y} value={hintValue} />
      );
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
                  align="center"
                  hideLabels={false}
                  labelRotation={-45}
                  nodePadding={85}
                  nodeWidth={5}
                >
                </Sankey>

        SankeyPlot.propTypes = { width: React.PropTypes.number }
        var FlexSankeyPlot = makeWidthFlexible(SankeyPlot)

        var downloadDatabase = this.state.databaseDownloaded;
        const options = {
          rtl: false,
          start: Date("2018-08-24T20:07:17.487Z")

        }
        const items = [
          {
            start: Date("2018-08-24T20:07:17.487Z"),
            end: Date("2018-08-24T20:08:17.487Z"),  // end is optional
            content: '<strong>MICAS</strong>',
            style: "border: 1px solid black;background-color:#3988FE;color:white;"
          },
          {
            start: Date("2018-08-24T20:07:17.487Z"),
            end: Date("2018-08-24T20:10:17.487Z"),  // end is optional
            content: '<strong>MinION</strong>',
            style: "border: 1px solid black;background-color:#38818A;color:white;"
          }
        ]


        var alertdata = []

        this.state.alertsInfo.alerts.map( (sequence) => {
            alertdata.push({"label": sequence.name, "value": sequence.num_reads})
        })
        const timelineChartConfig = {
          type: 'bar2d',
          width: '700',
          height: '200',
          dataFormat: 'json',
          dataSource: {
            "chart": {
              "plottooltext": "Number of reads",
              "theme": "ocean",
            },
            "data": [
              {
                "label": "MinION",
                "value": this.state.timelineInfo.num_total_reads,
                "color": "#088A68"
              },
              {
                "label": "MICAS",
                "value": this.state.timelineInfo.num_classified_reads,
                "color": "#58ACFA"
              }
            ]
          }
        }

        const alertChartConfigs = {
            type: 'column2d',
            width: '700',
            height: '400',
            dataFormat: 'json',
            dataSource: {
                "chart": {
                    "caption": "Alert Sequences Status",
                    "xAxisName": "Sequences",
                    "yAxisName": "Number of reads",
                    "theme": "ocean"
                },
                "data": alertdata,
                "trendlines": [
                    {
                        "line": [
                            {
                                "startvalue": this.state.alertsInfo.seqs_threshold.toString(),
                                "color": "#FF0000",
                                "valueOnRight": "1",
                                "displayvalue": "Read Threshold"
                            }
                        ]
                    }
                ]
            },
        };

        if(downloadDatabase){
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
                            
                            <ReactFC {...timelineChartConfig} />
                          </Well>
                        </Col>
                        <Col md={12}>
                          <Well>
                            <h4>Alerts</h4>
                            <ReactFC {...alertChartConfigs} />
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
