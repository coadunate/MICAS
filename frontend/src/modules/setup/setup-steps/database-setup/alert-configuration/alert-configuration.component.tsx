import React, {FunctionComponent, useEffect, useState} from 'react';
import {IAlertConfigSetupProps} from "../../../setup.interfaces";
import {IAlertConfig} from "./alert-configuration.interfaces";

const initial_alert_config: IAlertConfig = {
    email: ""
}

type IKeys = "email";


const AlertConfigurationComponent:
    FunctionComponent<IAlertConfigSetupProps> = ({advanceStep, update}) => {

    const [alertConfig, setAlertConfig] = useState(initial_alert_config);

    const handleDataChange = (key: IKeys) => (evt: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {

        const new_config = {...alertConfig, [key]: evt.target.value}
        setAlertConfig(new_config);

    }

    useEffect(() => {
        update(alertConfig)
    },[alertConfig])

    const updateAlertConfigurationSetup = () => {
        advanceStep()
    }

    return (
        <div className="container-fluid">
            <div className="container d-flex flex-column">
                <div className="col-lg-6 d-flex flex-column pl-5">
                    <div className="row justify-content-start">
                        <b className="pr-5 pt-2">Email</b>
                        <div className="row ml-auto">
                            <input className="form-control" placeholder="Email" type="email"
                                   onChange={handleDataChange("email")}/>
                        </div>
                    </div>
                    <br/>
                    <br/>
                </div>
            </div>
        </div>
    )
}

export default AlertConfigurationComponent;
