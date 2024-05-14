import React, { FunctionComponent } from 'react';
import { IMicas } from "./home.interfaces";
import { gotoLoc } from "../../utils/utils";

const micas_config: IMicas = {
    title: "Welcome to MICAS",
    tagline: "MinION Classification & Alerting System",
    description: "MinION Classification & Alerting System (MICAS) is a web application " +
        "designed to operate in conjunction with the MinION DNA sequencer. This application " +
        "provides a sophisticated alerting system that notifies scientists during DNA sequencing runs " +
        "through log files or GUI-based messages. Alerts can be configured to respond to specific " +
        "sequences of interest detected in samples, allowing researchers to focus on other critical tasks " +
        "without constantly monitoring the sequencing process.",
    version: '0.0.2'
};

const HomeComponent: FunctionComponent = () => {
    return (
        <div className="container-fluid text-center py-5">
            <div className="my-5">
                <h1 className="display-4 font-weight-bold">
                    {micas_config.title} - v{micas_config.version}
                </h1>
            </div>
            <div className="my-5">
                <div className="col-lg-8 mx-auto">
                    <p className="lead">
                        {micas_config.description}
                    </p>
                </div>
            </div>
            <div className="my-5">
                <div className="d-flex justify-content-center align-items-center">
                    <div className="text-center mx-3">
                        <button onClick={() => gotoLoc('/setup')}
                                className="btn btn-info btn-lg mb-2">Setup
                        </button>
                        <p className="text-muted">Click here to setup your analysis environment.</p>
                    </div>
                    <div className="text-center mx-3">
                        <button onClick={() => gotoLoc('/analysis')}
                                className="btn btn-info btn-lg mb-2">Analysis
                        </button>
                        <p className="text-muted">Click here to view and manage your analyses.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeComponent;