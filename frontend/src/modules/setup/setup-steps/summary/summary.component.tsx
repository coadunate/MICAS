import React, {FunctionComponent, useEffect, useState} from 'react';
import {IDatabseSetupInput, ILocationConfig} from "../database-setup/database-setup.interfaces";
import {INCBIDatabases} from '../database-setup/ncbi-db-setup/ncbi-db-selection.interfaces'
import {IAlertConfig} from "../alert-configuration/alert-configuration.interfaces";
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
    databaseSetupInput: IDatabseSetupInput,
    alertConfigInput: IAlertConfig
}


const validateLocations = (queries: IQuery[], locations: ILocationConfig) => {
    let queryFiles = ""
    queries.map(query => {
        queryFiles += query.file + ';'
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

const SummaryComponent: FunctionComponent<ISummaryComponentProps> = ({databaseSetupInput, alertConfigInput}) => {

    console.log(socket);

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [validationState, setValidationState] = useState(VALIDATION_STATES.NOT_STARTED);
    const [started, setStarted] = useState(false);
    const [uid, setUID] = useState("");

    // get all the selected NCBI databases
    const ncbi_databases = Object.keys(databaseSetupInput.ncbi).filter((val: string) => {
        type NCBIKey = keyof INCBIDatabases
        const key_val = val as NCBIKey
        return databaseSetupInput.ncbi[key_val]
    })
    const ncbi_databases_str = ncbi_databases.join(", ")

    // additional databases
    const num_additional_databases = databaseSetupInput.queries.queries.length
    const add_databases = databaseSetupInput.queries.queries

    useEffect(() => {
        (async () => {
            const res = await validateLocations(add_databases, databaseSetupInput.locations)
            const v_code = res.data.code
            setUID(res.data.uid);
            setValidationState(v_code === 0 ? VALIDATION_STATES.VALIDATED : VALIDATION_STATES.NOT_VALID);
        })();

    }, [started])


    const initiateDatabaseCreation = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        setStarted(prev => !prev);

        if (validationState === VALIDATION_STATES.VALIDATED) {
            console.log("Locations are valid")
            let dbInfo = {
                minion: databaseSetupInput.locations.minionLocation,
                app_location: databaseSetupInput.locations.micasLocation,
                bacteria: databaseSetupInput.ncbi.bacteria,
                archaea: databaseSetupInput.ncbi.archaea,
                virus: databaseSetupInput.ncbi.virus
            };

            socket.emit('download_database', dbInfo, add_databases, alertConfigInput, uid, () => {
                console.log("Creating database...")

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
                success !== "" ? <div className="alert alert-success text-left" dangerouslySetInnerHTML={{__html: "SUCCESS -- " + success}} /> : ""
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
                    <th>NCBI Databases</th>
                    <td>{ncbi_databases_str === "" ? "None" : ncbi_databases_str}</td>
                </tr>
                <tr>
                    <th rowSpan={num_additional_databases}>Additional Sequences</th>
                    {
                        add_databases.length > 0 && add_databases.map((query, idx) => {
                            if (idx === 0) {
                                return (
                                    <td>Name: {query.name} (PID: {query.file})</td>
                                )
                            }
                        })
                    }
                    <td />
                </tr>
                {
                    add_databases.length > 0 && add_databases.map((query, idx) => {
                        if (idx === 0) {
                            return;
                        } else {
                            return (
                                <tr key={idx}>
                                    <td />
                                    <td>Name: {query.name} (PID: {query.parent})</td>
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
                    <td>{alertConfigInput.email ? "" : "Not provided"}</td>
                </tr>
                <tr>
                    <th>Phone</th>
                    <td>{alertConfigInput.phone_number ? "" : "Not provided"}</td>
                </tr>
                <tr>
                    <th>Alert Sequence Threshold</th>
                    <td>{alertConfigInput.alert_sequence_threshold ? "" : "Not provided"}</td>
                </tr>
                <tr>
                    <th>Enable Alert</th>
                    <td>{alertConfigInput.alert_status ? "Yes" : "No"}</td>
                </tr>
                </tbody>
            </table>
            <hr/>
            <div className="vspacer-20"/>
            <button className="btn btn-info" onClick={(e) => initiateDatabaseCreation(e)}>Initiate Database Creation
                Process
            </button>
        </div>
    );
}

export default SummaryComponent;
