import React, {FunctionComponent} from 'react';
import {IMicas} from "./home.interfaces";
import {gotoLoc} from "../../utils/utils";

const micas_config: IMicas = {
    title: "Welcome to Micas",
    tagline: "A software by <i>Coadunate</i> lab",
    description: "MinION Classification & Alerting System is a web application " +
        "meant to be run simultaneously with the MinION DNA sequencer. This app " +
        "provides an alerting system through which a scientist performing DNA " +
        "sequencing runs could be notified through their email or text message. " +
        "The alerts could be set to respond to any particular sequences of " +
        "interest arising in their sample. Our team believes that this will " +
        "enable researchers to use their time more efficiently by allowing them " +
        "to focus on more important matters in the meantime, rather than waiting " +
        "around for significant sequences.",
    version: '0.0.1'
}

const HomeComponent: FunctionComponent = () => {
    return (
        <div className="container-fluid text-center">
            <div className="vspacer-20"/>
            <h1 className="font-weight-bold">{micas_config.title} -
                v{micas_config.version}</h1>
            <p className="text-muted"
               dangerouslySetInnerHTML={{__html: micas_config.tagline}}/>
            <div className="vspacer-50"/>
            <div className="col-lg-5 mx-auto">
                <p className="lead">
                    {micas_config.description}
                </p>
            </div>
            <div className="vspacer-100"/>
            <div
                className="container d-flex flex-column col-lg-2">
                <button onClick={() => gotoLoc('/setup')}
                        className="btn btn-info mb-2">Setup
                </button>
                <button onClick={() => gotoLoc('/analysis')}
                        className="btn btn-info mb-2">Analysis
                </button>
            </div>
        </div>
    );
}

export default HomeComponent;
