import React, {FunctionComponent, useEffect, useState} from 'react';
import {IAlertConfigSetupProps} from "../../setup.interfaces";
import {IAlertConfig} from "./alert-configuration.interfaces";

const initial_alert_config: IAlertConfig = {
    alert_sequence_threshold: 0, email: "", alert_status: "no", phone_number: ""
}

type IKeys = "email" | "phone_number" | "alert_seq_thres" | "alert_status";


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
                    <div className="row justify-content-start">
                        <b className="pr-5 pt-2">Phone Number</b>
                        <div className="row ml-auto">
                            <input className="form-control" placeholder="Phone" type="text"
                                   onChange={handleDataChange("phone_number")}/>
                        </div>
                    </div>
                    <br/>
                    <div className="row justify-content-start">
                        <b className="pr-5 pt-2">Alert Sequences Threshold</b>
                        <div className="row ml-auto">
                            <input className="form-control" placeholder="Alert Seq. Thres." type="number"
                                   onChange={handleDataChange("alert_seq_thres")}/>
                        </div>
                    </div>
                    <br/>
                    <div className="row justify-content-start">
                        <b className="pr-5 pt-2">Alert Status</b>
                        <div className="row ml-auto">
                            <select className="custom-select ml-5 mr-5" onChange={handleDataChange("alert_status")}>
                                <option defaultValue="no">Enable alerts?</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>

                    </div>
                </div>
            </div>
            <div className="vspacer-20"/>
            <div className="container-fluid text-center">
                <button className="btn btn-success col-lg-2 mx-auto"
                        onClick={() => updateAlertConfigurationSetup()}>Next Step
                </button>
            </div>
        </div>
    )
}

export default AlertConfigurationComponent;
