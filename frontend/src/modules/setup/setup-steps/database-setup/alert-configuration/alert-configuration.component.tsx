import React, {FunctionComponent, useEffect, useState} from "react";
import {IDatabaseSetupConstituent} from "../database-setup.interfaces";
import {IAlertConfig} from "./alert-configuration.interfaces";

const initial_alert_config: IAlertConfig = {
    device : ""
}

type IKeys = "device";


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
            device: alertConfig.device
        }))
    },[alertConfig, updateConfig])
    const Devices = ["Mk1b-A", "Mk1b-B"]
    const DeviceSelect = Devices => <select name="deviceSelect" onChange={handleDataChange("device")}>{
        Devices.map( (x) => 
            <option>{x}</option> )
    }</select>;

    
    return (
        <div className="col-lg-5 m-0 container">
            <br/>
            <p className="lead"></p>
            <h4>Device Selection</h4>
            <div className="vspacer-50"/>
            <div className="row ml-auto">
                 
            </div>
            <br/>
        </div>
    )
}

export default AlertConfigurationComponent;
