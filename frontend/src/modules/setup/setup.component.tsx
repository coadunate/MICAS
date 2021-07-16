import React, {useState} from 'react';

import {ISteps} from './setup.interfaces'

import './setup.component.css'
import DatabaseSetupComponent from "./setup-steps/database-setup/database-setup.component";
import SummaryComponent from "./setup-steps/summary/summary.component";
import AlertConfigurationComponent from "./setup-steps/alert-configuration/alert-configuration.component";
import {IDatabseSetupInput} from "./setup-steps/database-setup/database-setup.interfaces";
import {IAlertConfig} from "./setup-steps/alert-configuration/alert-configuration.interfaces";
import {IAdditionalSequences, IQuery} from "./setup-steps/database-setup/additional-sequences-setup/additional-sequences-setup.interfaces";

const qrs : IAdditionalSequences = {
    queries: [
        {name: "", file: "", parent: "", alert: false}
    ]
}

const initial_db_setup_input : IDatabseSetupInput = {
    queries: qrs,
    ncbi: { bacteria: false, archaea: false, virus: false}

}

const initial_alert_config_input : IAlertConfig = {
    phone : "",
    email : "",
    alert_sequence_threshold : 0,
    alert_status : "no"
}

const SetupComponent = () => {
    const [stepNumber, setStepNumber] = useState(0);

    const [databaseSetupInput, setDatasetSetupInput] = useState(initial_db_setup_input);
    const [alertConfigInput, setAlertConfigInput] = useState(initial_alert_config_input);

    const advanceStep = () => {

        // if we still have steps left
        if (stepNumber < (steps.length-1)) {
            console.log("StepNumber: ", stepNumber);
            setStepNumber((prev) => prev + 1)
        }
    }

    const steps: ISteps[] = [
        {
            name: "Database Selection",
            component: <DatabaseSetupComponent advanceStep={advanceStep} update={setDatasetSetupInput} />,
        },
        {
            name: "Alert Configuration",
            component: <AlertConfigurationComponent advanceStep={advanceStep} update={setAlertConfigInput} />,
        },
        {
            name: "Summary",
            component: <SummaryComponent databaseSetupInput={databaseSetupInput} alertConfigInput={alertConfigInput}/>
        }
    ]

    return (
        <div className="container-fluid d-flex flex-column ">
            <div className="vspacer-50 "/>
            <div className="container text-center ">
                <h3 className="font-weight-bold">New MICAS Setup</h3>
            </div>
            <div className="vspacer-20 "/>
            <div className="module-stepbar d-flex ">
                <ul className="steps six clearfix justify-content-center"
                    id="step-buttons">
                    {
                        steps.map((s, i) => {
                            return <li key={i}
                                       className={stepNumber === i ? 'active' : ''}><span
                                className="step-no">{i}</span>{s.name}</li>
                        })
                    }
                </ul>
            </div>
            <div className="container p-0">
                {
                    steps.map((s, i) => {
                        console.log("I:", i)
                        console.log("StepNumber: ", stepNumber)
                        return stepNumber === i && <div key={i}>{s.component}</div>
                    })
                }
            </div>
        </div>
    );
}

export default SetupComponent;
