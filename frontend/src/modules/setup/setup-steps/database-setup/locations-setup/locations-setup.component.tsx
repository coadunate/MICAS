import React, {FunctionComponent, useEffect, useState} from 'react';
import {IDatabaseSetupConstituent, ILocationConfig} from "../database-setup.interfaces";

type IKeys = "minionLocation"
const initial_location_config: ILocationConfig = {
    minionLocation: ""
}

const LocationsSetupComponent: FunctionComponent<IDatabaseSetupConstituent> = ({updateConfig}) => {

    const [locationConfig, setLocationConfig] = useState(initial_location_config)

    const handleDataChange = (key: IKeys) => (evt: React.ChangeEvent<HTMLInputElement>) => {
        setLocationConfig((prev) => {
            return {...prev, [key]: evt.target.value}
        })
    }

    const ref = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current !== null) {
            ref.current.setAttribute("directory", "");
            ref.current.setAttribute("webkitdirectory", "");
            ref.current.setAttribute("multiple", "");
        }
        updateConfig((prevState: any) => ({
            ...prevState,
            minionLocation: locationConfig.minionLocation
        }))
    }, [locationConfig, updateConfig])

    return (
        <div className="col-lg-5 m-0 container">
            <br/>
            <p className="lead"></p>
            <h4>MinION Location</h4>
            <div className="vspacer-50"/>
            <div className="row ml-auto">
                <input 
                    name="minionLocationText"
                    className="form-control" 
                    placeholder="/path/to/minion/dropbox" 
                    type="text"
                    onChange={handleDataChange("minionLocation")}
                />
            </div>
            <br/>
        </div>
    );
}

export default LocationsSetupComponent
