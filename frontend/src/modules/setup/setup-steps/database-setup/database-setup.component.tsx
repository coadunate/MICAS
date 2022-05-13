import React, {FunctionComponent, useState} from 'react';
import AdditionalSequencesSetupComponent from "./additional-sequences-setup/additional-sequences-setup.component";
import {ILocationConfig} from "./database-setup.interfaces";
import {IAdditionalSequences} from "./additional-sequences-setup/additional-sequences-setup.interfaces";
import {IDatabaseSetupProps} from '../../setup.interfaces';
import LocationsSetupComponent from "./locations-setup/locations-setup.component";
import AlertConfigurationComponent from "./alert-configuration/alert-configuration.component";
import {IAlertConfig} from "./alert-configuration/alert-configuration.interfaces"

const initial_additional_sequences_config: IAdditionalSequences = {
    queries: []
}

const initial_location_config: ILocationConfig = {
    minionLocation: "",
    micasLocation: ""
}

const initial_alert_config: IAlertConfig ={
    email: ""
}

const DatabaseSetupComponent:
    FunctionComponent<IDatabaseSetupProps> = ({advanceStep, update}) => {
    const [additionalSequences, setAdditionalSequences] = useState(initial_additional_sequences_config);
    const [locationConfig, setLocationConfig] = useState(initial_location_config);
    const [alertConfig, setAlertConfig] = useState(initial_alert_config);

    const updateDatabaseSetupConfiguration = () => {

        update({queries: additionalSequences, locations: locationConfig, alert: alertConfig});

        advanceStep();
    }

    return (
        <div
            className="container-fluid vspacer-100 d-flex flex-column h-100">
            <AlertConfigurationComponent initialConfig={initial_alert_config} updateConfig={setAlertConfig}/>    
            <div className="vspacer-50"/>
            <div className="twline"><span>AND</span></div>
            <AdditionalSequencesSetupComponent initialConfig={initial_additional_sequences_config} updateConfig={setAdditionalSequences} />
            <br/>
            <div className="vspacer-50"/>
            <div className="twline"><span>DONT FORGET</span></div>
            <LocationsSetupComponent initialConfig={initial_location_config} updateConfig={setLocationConfig}/>
            <br/>
            <div className="container text-center">
                <button className="btn btn-success col-lg-2 mx-auto"
                        onClick={() => updateDatabaseSetupConfiguration()}>Next Step
                </button>
            </div>
        </div>
    );

}

export default DatabaseSetupComponent;
