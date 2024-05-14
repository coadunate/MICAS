import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { ISteps } from "./setup.interfaces";
import DatabaseSetupComponent from "./setup-steps/database-setup/database-setup.component";
import SummaryComponent from "./setup-steps/summary/summary.component";
import "./setup.component.css";
import {
    IAdditionalSequences
} from "./setup-steps/database-setup/additional-sequences-setup/additional-sequences-setup.interfaces";
import {
    IDatabseSetupInput
} from "./setup-steps/database-setup/database-setup.interfaces";

const qrs: IAdditionalSequences = {
    queries: [
        { name: "", file: "", threshold: "", current_value: 0, alert: false }
    ]
};

const initial_db_setup_input: IDatabseSetupInput = {
    queries: qrs,
    locations: { minionLocation: "" },
    device: { device: "" }
};

const SetupComponent: React.FC = () => {
    const [stepNumber, setStepNumber] = useState(0);
    const [databaseSetupInput, setDatasetSetupInput] = useState(initial_db_setup_input);

    const advanceStep = () => {
        if (stepNumber < steps.length - 1) {
            setStepNumber((prev) => prev + 1);
        }
    };

    const steps: ISteps[] = [
        {
            name: "Create Database",
            component: <DatabaseSetupComponent advanceStep={advanceStep} update={setDatasetSetupInput} />,
        },
        {
            name: "Summary",
            component: <SummaryComponent databaseSetupInput={databaseSetupInput} />
        }
    ];

    return (
        <div className="container-fluid d-flex flex-column align-items-center">
            <nav className="navbar navbar-expand-lg navbar-light bg-light w-100">
                <div className="container">
                    <h3>MICAS Setup</h3>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to="/">Home</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="vspacer-20" />
            <div className="module-stepbar d-flex flex-column align-items-center">
                <ul className="steps clearfix">
                    {steps.map((s, i) => (
                        <li key={i} className={stepNumber === i ? 'active' : ''}>
                            <span className="step-no">{i + 1}</span>{s.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="vspacer-20" />
            <div className="container p-4 border rounded">
                {steps.map((s, i) => stepNumber === i && <div key={i}>{s.component}</div>)}
            </div>
            <div className="vspacer-20" />
        </div>
    );
}

export default SetupComponent;
