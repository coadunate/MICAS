import React, { Component} from "react";
import {Grid, Row, Col } from 'react-bootstrap'

import HeaderView from '../components/HeaderView';
import SettingsView from '../components/SettingsView';

import '../../css/SetupPage.css';

class SetupPage extends Component {
    render () {
        return (
          <div className="SetupPage">
            <Col md={12}><div className="walk"></div></Col>
            <Col md={12}>
              <HeaderView />
            </Col>
            <Col md={12}>
              <SettingsView appname={this.props.name} />
            </Col>
          </div>
        );
    }
}

export default SetupPage;
