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
    minionLocation: ""
}

const initial_alert_config: IAlertConfig ={
    device: ""
}

const DatabaseSetupComponent:
    FunctionComponent<IDatabaseSetupProps> = ({advanceStep, update}) => {
    const [additionalSequences, setAdditionalSequences] = useState(initial_additional_sequences_config);
    const [locationConfig, setLocationConfig] = useState(initial_location_config);
    const [alertConfig, setAlertConfig] = useState(initial_alert_config);

    const updateDatabaseSetupConfiguration = () => {

        update({queries: additionalSequences, locations: locationConfig, device: alertConfig});

        advanceStep();
    }

    return (
        <div
            className="container-fluid vspacer-100 d-flex p-0 flex-column h-100">
            <div className="row justify-content-around">
                <AlertConfigurationComponent initialConfig={initial_alert_config} updateConfig={setAlertConfig}/>    
                <LocationsSetupComponent initialConfig={initial_location_config} updateConfig={setLocationConfig}/>
            </div>
            <div className="twline"><span>ALERT SEQUENCES</span></div>
            <AdditionalSequencesSetupComponent initialConfig={initial_additional_sequences_config} updateConfig={setAdditionalSequences} />
            <br/>
            <hr />
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
