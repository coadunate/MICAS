import React, {FunctionComponent, useEffect, useState} from "react";
import axios from "axios";
import {IDatabaseSetupConstituent} from "../database-setup.interfaces";
import {IAlertConfig} from "./alert-configuration.interfaces";

const initial_alert_config: IAlertConfig = {
    device : ""
}

const AlertConfigurationComponent:
    FunctionComponent<IDatabaseSetupConstituent> = ({updateConfig}) => {
    const [devices, setDevices] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState("");
    
    useEffect(() => {
        updateConfig((prevState: any) => ({
            ...prevState,
            device: selectedDevice
        }))
    },[selectedDevice, updateConfig])

    useEffect(() => {
        (async () => {
            const res = await get_devices();
            setDevices(res.data);
            setLoaded(true);
        })();
    }, []);
    //TODO Does not re-index devices on page reload. (ie if an mk1b is unplugged the dropdown does not update)
    const get_devices = () => {
        return axios({
            method: 'GET',
            url: 'http://localhost:5007/index_devices'
        });
    };
    
    return loaded ? (
        <div className="col-lg-5 m-0 container">
            <br/>
            <p className="lead"></p>
            <h4>Device Selection</h4>
            <div className="row ml-auto">
            <select onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDevice(e.target.value)} value={selectedDevice}> 
                <option value="Select a Device">Select a Device</option>
                {devices.map((Device: string) => <option value={Device}>{Device}</option>)}
            </select>     
            </div>
            <br/>
        </div>
    ) : (
        <div>Searching For Devices...</div>
    )
}

export default AlertConfigurationComponent;
