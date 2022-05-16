import React, {FunctionComponent, useEffect, useState} from 'react';
import {IDatabseSetupInput, ILocationConfig} from "../database-setup/database-setup.interfaces";
import {IQuery} from "../database-setup/additional-sequences-setup/additional-sequences-setup.interfaces";
import axios from "axios";
import {socket} from "../../../../app.component";

const VALIDATION_STATES = {
    NOT_STARTED: 0,
    PENDING: 1,
    VALIDATED: 2,
    NOT_VALID: 3
}

type ISummaryComponentProps = {
    databaseSetupInput: IDatabseSetupInput
}


const validateLocations = (queries: IQuery[], locations: ILocationConfig) => {
    let queryFiles = ""
    queries.map(query => {
        queryFiles += query.file + ';'
        return null;
    })
    let locationData = new FormData();
    locationData.append('minION', locations.minionLocation);
    locationData.append('App', locations.micasLocation);
    locationData.append('Queries', queryFiles);

    return axios({
        method: 'POST',
        url: 'http://localhost:5000/validate_locations',
        data: locationData,
        headers: {"Content-Type": "multipart/form-data"},
    })
}

const getUniqueUID = (locations: ILocationConfig) => {
    let locationData = new FormData();
    locationData.append('minION', locations.minionLocation);
    locationData.append('App', locations.micasLocation);

    return axios({
        method: "POST",
        url: 'http://localhost:5000/get_uid',
        data: locationData,
        headers: {'Content-Type': 'multipart/form-data'}
    })
}

const SummaryComponent: FunctionComponent<ISummaryComponentProps> = ({databaseSetupInput}) => {

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [validationState, setValidationState] = useState(VALIDATION_STATES.NOT_STARTED);
    const [started, setStarted] = useState(false);
    const [uid, setUID] = useState("");
    const [, setProgress] = useState("");

    // additional databases
    const num_additional_databases = databaseSetupInput.queries.queries.length
    const add_databases = databaseSetupInput.queries.queries

    useEffect(() => {
        (async () => {
            const res = await validateLocations(add_databases, databaseSetupInput.locations)
            const v_code = res.data.code

            if (v_code === 0) { // if locations are valid
                const res_uid = await getUniqueUID(databaseSetupInput.locations)
                setUID(res_uid.data.uid)
                setValidationState(VALIDATION_STATES.VALIDATED)
            } else {
                setValidationState(VALIDATION_STATES.NOT_VALID)
            }

        })().catch(err=>err);

    }, [started, add_databases, databaseSetupInput.locations])


    const initiateDatabaseCreation = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setStarted(prev => !prev);

        if (validationState === VALIDATION_STATES.VALIDATED) {
            socket.emit('log', "Locations are valid", "INFO");
            let dbInfo = {
                minion: databaseSetupInput.locations.minionLocation,
                app_location: databaseSetupInput.locations.micasLocation,
                queries: add_databases,
                projectId: uid,
                email: databaseSetupInput.alert.email
            };

            socket.emit('log', dbInfo, "DEBUG");

            socket.emit('download_database', dbInfo, () => {
                socket.emit('log', "Creating database...", "INFO")
            })
            let _url = 'http://' + window.location.hostname + ":" + window.location.port + '/analysis/' + uid;
            setSuccess("Creating database... You can view the analysis <a href='" + _url + "'>here</a>")



        } else {
            setError("Locations are not valid")
        }
    }


    return (
        <div className="container text-center">
            <div className="vspacer-20"/>
            {
                success !== "" ? <div className="alert alert-success text-left"
                                      dangerouslySetInnerHTML={{__html: "SUCCESS -- " + success}}/> : ""
            }
            {
                error !== "" ? <div className="alert alert-danger text-left">ERROR –– {error}</div> : ""
            }
            Here is the information you provided:
            <br/><br/>
            <table className="table">
                <thead>
                <tr>
                    <th scope="col" colSpan={3}>Database Selection</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <th rowSpan={num_additional_databases}>Additional Sequences</th>
                    {
                        add_databases.length > 0 && add_databases.map((query, idx) => {
                            if (idx === 0) {
                                return (<td key={idx}>Name: {query.name}</td>)
                            }
                        }
                        )
                        
                    }
                    <td/>
                </tr>
                {
                    add_databases.length > 0 && add_databases.map((query, idx) => {
                        if (idx === 0) {
                            return;
                        } else {
                            return (
                                <tr key={idx}>
                                    <td/>
                                    <td>Name: {query.name}</td>
                                </tr>
                            )
                        }
                    })
                }
                </tbody>
                <thead>
                <tr>
                    <th colSpan={3}>Alert Configuration</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <th>Email</th>
                    <td>{databaseSetupInput.alert.email === "" ? "Not provided" : databaseSetupInput.alert.email}</td>
                </tr>
                </tbody>
            </table>
            <hr/>
            <div className="vspacer-20"/>
            <button className="btn btn-info" disabled={started} onClick={(e) => initiateDatabaseCreation(e)}>Initiate Database Creation
                Process
            </button>
        </div>
    );
}

export default SummaryComponent;
