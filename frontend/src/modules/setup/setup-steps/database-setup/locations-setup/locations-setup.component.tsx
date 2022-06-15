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
        <div className="container text-center">
            <h4>Locations</h4>
            <div className="vspacer-50 container text-center"/>
                <b className="pt-2">MinION Location</b>
                <input
                    name="minionLocationText"
                    className="form-control"
                    placeholder="/path/to/minion/dropbox"
                    type="text"
                    onChange={handleDataChange("minionLocation")}
                />
                <br/>
                <div className="vspacer-50"/>        
        </div>
    );
}

export default LocationsSetupComponent
