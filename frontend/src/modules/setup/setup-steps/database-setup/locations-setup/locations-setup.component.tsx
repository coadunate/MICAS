import React, {FunctionComponent, useEffect, useState} from 'react';
import {IDatabaseSetupConstituent, ILocationConfig} from "../database-setup.interfaces";

type IKeys = "micasLocation" | "minionLocation"
const initial_location_config: ILocationConfig = {
    minionLocation: "",
    micasLocation: ""
}

const LocationsSetupComponent: FunctionComponent<IDatabaseSetupConstituent> = ({updateConfig}) => {

    const [locationConfig, setLocationConfig] = useState(initial_location_config)

    const handleDataChange = (key: IKeys) => (evt: React.ChangeEvent<HTMLInputElement>) => {
        setLocationConfig((prev) => {
            return {...prev, [key]: evt.target.value}
        })
    }

    useEffect(() => {
        updateConfig((prevState: any) => ({
            ...prevState,
            minionLocation: locationConfig.minionLocation,
            micasLocation: locationConfig.micasLocation
        }))
    }, [locationConfig])

    return (
        <div className="container">
            <h4>Locations</h4>
            <div className="vspacer-50 "/>
            <div className="row justify-content-start w-100">
                <b className=" pt-2">MinION Location</b>
                <div className="row ml-auto w-75">
                    <input
                        className="form-control"
                        placeholder="/path/to/minion/dropbox"
                        type="text"
                        onChange={handleDataChange("minionLocation")}
                    />
                </div>
            </div>
            <br/>
            <div className="row justify-content-start w-100">
                <b className=" pt-2">MICAS Location</b>
                <div className="row ml-auto w-75">
                    <input
                        className="form-control"
                        placeholder="/path/to/micas/data/storage"
                        type="text"
                        onChange={handleDataChange("micasLocation")}
                    />
                </div>
            </div>
        </div>
    );
}

export default LocationsSetupComponent
