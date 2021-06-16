import React, {useState} from 'react';

import AlertConfigurationComponent from "./setup-steps/alert-configuration.component";

import {ISteps} from './setup.interfaces'

import './setup.component.css'
import DatabaseSetupComponent from "./setup-steps/database-setup/database-setup.component";

const SetupComponent = () => {
    const [stepNumber, setStepNumber] = useState(0);

    const update = () => {

    }

    const advanceStep = () => {


        // if we still have steps left
        if (stepNumber < steps.length) {
            setStepNumber((prev) => prev + 1)
        }
    }

    const steps: ISteps[] = [
        {
            name: "Database Selection",
            component: DatabaseSetupComponent,
        },
        {
            name: "Alert Configuration",
            component: AlertConfigurationComponent,
        }
    ]

    return (
        <div className="container-fluid d-flex flex-column border-blue">
            <div className="vspacer-50 border-black"/>
            <div className="container text-center border-purple">
                <h3 className="font-weight-bold">New MICAS Setup</h3>
            </div>
            <div className="vspacer-20 border-black"/>
            <div className="module-stepbar d-flex border-blue">
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
            <div className="container border-green p-0">
                {
                    steps.map((s, i) => {
                        return <div key={i}>{s.component({
                            advanceStep,
                            update
                        })}</div>;
                    })
                }
            </div>
            <div className="vspacer-50 border-black"/>
            <button className="btn btn-success col-lg-2 mx-auto"
                    onClick={() => advanceStep()}>Next Step
            </button>
        </div>
    );
}

export default SetupComponent;
