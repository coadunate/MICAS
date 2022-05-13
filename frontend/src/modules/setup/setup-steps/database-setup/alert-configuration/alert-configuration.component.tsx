import React, {FunctionComponent, useEffect, useState} from 'react';
import {IDatabaseSetupConstituent} from "../database-setup.interfaces";
import {IAlertConfig} from "./alert-configuration.interfaces";

const initial_alert_config: IAlertConfig = {
    email: ""
}

type IKeys = "email";


const AlertConfigurationComponent:
    FunctionComponent<IDatabaseSetupConstituent> = ({updateConfig}) => {

    const [alertConfig, setAlertConfig] = useState(initial_alert_config);

    const handleDataChange = (key: IKeys) => (evt: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const new_config = {...alertConfig, [key]: evt.target.value}
        setAlertConfig(new_config);
    }
    
    useEffect(() => {
        updateConfig((prevState: any) => ({
            ...prevState,
            alert: alertConfig.email
        }))
    },[alertConfig, updateConfig])

    return (
        <div className="col-lg-6 container text-center">
            <br/>
            <h4>Email</h4>
            <div className="vspacer-50 "/>
            <div className="row ml-auto">
                <input 
                    name="emailText"
                    className="form-control" 
                    placeholder="Email" 
                    type="email"
                    onChange={handleDataChange("email")}
                />
            </div>
            <br/>
        </div>
    )
}

export default AlertConfigurationComponent;
