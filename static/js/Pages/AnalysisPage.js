import React, { Component} from "react";
import {Grid, Row, Col, Well, Button } from 'react-bootstrap';
import {ListGroup, ListGroupItem} from 'react-bootstrap'
import { makeWidthFlexible, Sankey } from 'react-vis';
import HeaderView from '../components/HeaderView';

import { Dot } from 'react-animated-dots';

import Timeline from 'react-visjs-timeline'

var $ = require('jquery');

import FusionCharts from 'fusioncharts/core';
import Column2D from 'fusioncharts/viz/column2d';
import ReactFC from 'react-fusioncharts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.ocean';

ReactFC.fcRoot(FusionCharts, Column2D, FusionTheme);


import io from 'socket.io-client';

let socket = io('http://' + document.domain + ':' + location.port + '/analysis');

import '../../css/AnalysisPage.css';


class AnalysisPage extends Component {

    constructor(props){
      super(props);
      this.state = {
        databaseDownloaded: true,
        databaseDownloadTimer: null,
        alertsInfo: {
          alerts: [],
          seqs_threshold: 100
        },
        sankeyData: {
          nodes: [],
          links: []
        },
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
            seqs_threshold: 100
          }
          this.setState({ alertsInfo: newAlertInfo })
        }
      });
    }

    componentDidMount(){

      window.onresize = () => {
       this.setState({windowWidth: this.refs.root.offsetWidth});
      };

      function updateAnalysis(that){
        setTimeout(() => {
          that.updateSankey(that.props.appLocation)
          that.updateAlertInfo(that.props.appLocation)
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

    render () {

        var SankeyPlot = ({ width }) =>
                  <Sankey
                    nodes={this.state.sankeyData.nodes}
                    links={this.state.sankeyData.links}
                    width={width}
                    height={200}
                    layout={1}
                  />
        SankeyPlot.propTypes = { width: React.PropTypes.number }
        var FlexSankeyPlot = makeWidthFlexible(SankeyPlot)

        var downloadDatabase = this.state.databaseDownloaded;
        const options = {
          rtl: false,
          start: this.props.startTime

        }
        const items = [
          {
            start: this.props.startTime,
            end: new Date(this.props.startTime.getTime()),  // end is optional
            content: '<strong>MICAS</strong>',
            style: "border: 1px solid black;background-color:#3988FE;color:white;"
          },
          {
            start: this.props.startTime,
            end: new Date(this.props.startTime.getTime() + 0.25*60000),  // end is optional
            content: '<strong>MinION</strong>',
            style: "border: 1px solid black;background-color:#38818A;color:white;"
          }
        ]

        var alertdata = []

        this.state.alertsInfo.alerts.map( (sequence) => {
            alertdata.push({"label": sequence.name, "value": sequence.num_reads})
        })

        const chartConfigs = {
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
                            <Timeline
                              options={options}
                              items={items}
                            />
                          </Well>
                        </Col>
                        <Col md={12}>
                          <Well>
                            <h4>Alerts</h4>
                            <ReactFC {...chartConfigs} />
                          </Well>
                        </Col>
                        <Col md={12}>
                          <Well style={{ height: '25vh'}}>
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
                          </Well>
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
