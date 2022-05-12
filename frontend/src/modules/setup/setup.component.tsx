import React, {useState} from "react";

import {ISteps} from "./setup.interfaces";

import "./setup.component.css";
import AlertConfigurationComponent
    from "./setup-steps/database-setup/alert-configuration/alert-configuration.component";
import {
    IDatabseSetupInput
} from "./setup-steps/database-setup/database-setup.interfaces";
import {
    IAlertConfig
} from "./setup-steps/database-setup/alert-configuration/alert-configuration.interfaces";
import {
    IAdditionalSequences
} from "./setup-steps/database-setup/additional-sequences-setup/additional-sequences-setup.interfaces";

const qrs: IAdditionalSequences = {
    queries: [
        {name: "", file: "", threshold: "", current_value: 0, alert: false}
    ]
};

const initial_db_setup_input: IDatabseSetupInput = {
    queries  : qrs,
    locations: {minionLocation: "", micasLocation: ""}
};

const initial_alert_config_input : IAlertConfig = {
    email: ""
};

const SetupComponent = () => {
    const [stepNumber, setStepNumber] = useState(0);
    const [alertConfigInput, setAlertConfigInput] = useState(initial_alert_config_input);

    const advanceStep = () => {

        // if we still have steps left
        if (stepNumber < (steps.length-1)) {
            setStepNumber((prev) => prev + 1)
        }
    }

    const steps: ISteps[] = [
        {
            name: "Alert Configuration",
            component: <AlertConfigurationComponent advanceStep={advanceStep} update={setAlertConfigInput} />,
        }
    ]

    return (
        <div className="container-fluid d-flex flex-column ">
            <div className="vspacer-50 "/>
            <div className="container text-center ">
                <h3 className="font-weight-bold">New MICAS Setup</h3>
            </div>
            <div className="vspacer-20" />
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
                        return stepNumber === i && <div key={i}>{s.component}</div>
                    })
                }
            </div>
            <div className="vspacer-20" />
        </div>
    );
}

export default SetupComponent;
