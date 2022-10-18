import React, {FunctionComponent, useEffect, useState} from "react";
import axios from "axios";
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
    //const Devices = axios.get(`http://localhost:5007/index_devices`)

    const Devices = axios({
        method: 'GET',
        url: 'http://localhost:5007/index_devices'
    }).then((response) => {
        const value = response.data
      })
      
    // const Devices = (Device: Array<String>) => {
    //     return axios({
    //         method: "GET",
    //         url   : 
    //     });
    // };
    console.log("/nDEVICES>>>>>>>>>>>>>>>>>>>")
    console.log(Devices)
    
    let [Device, setDevice] = useState("⬇️ Select a Device ⬇️");

    let handleDeviceChange = (e: React.ChangeEvent<any>) => {
        setDevice(e.target.value)
    }
    
    return (
        <div className="col-lg-5 m-0 container">
            <br/>
            <p className="lead"></p>
            <h4>Device Selection</h4>
            <div className="vspacer-50"/>
            <div className="row ml-auto">
            <select onChange={handleDeviceChange}> 
                <option value="⬇️ Select a Device ⬇️"> -- Select a Device -- </option>
                {/* {Devices.map((Device: Array<String>) => <option value={Device}>{Device.value}</option>)} */}
            </select>     
            </div>
            <br/>
        </div>
    )
}

export default AlertConfigurationComponent;
