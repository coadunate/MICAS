import React, {FunctionComponent} from 'react';
import {ISetupComponentProps} from "../setup.interfaces";

const AlertConfigurationComponent:
    FunctionComponent<ISetupComponentProps> = ({advanceStep, update}) => {
    return (
        <div className="container-fluid border-green">
            AlertConfigurationStep
        </div>
    )
}

export default AlertConfigurationComponent;
