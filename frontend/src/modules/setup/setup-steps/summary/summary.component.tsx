import React, {FunctionComponent} from 'react';
import {IAlertConfigSetupProps} from "../../setup.interfaces";
import {IDatabaseSelectionConfig, IDatabseSetupInput} from "../database-setup/database-setup.interfaces";
import {IAlertConfig} from "../alert-configuration/alert-configuration.interfaces";

type ISummaryComponentProps = {
    databaseSetupInput: IDatabseSetupInput,
    alertConfigInput: IAlertConfig
}

const SummaryComponent : FunctionComponent<ISummaryComponentProps> = ({databaseSetupInput, alertConfigInput}) => {
    return (
        <div className="container text-center">
            Here is the information you provided:
            <br /><br />
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col" colSpan={3}>Database Selection</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>NCBI Databases</th>
                        <td>bacteria, archaea, fungi</td>
                    </tr>
                    <tr>
                        <th rowSpan={4}>Additional Sequences</th>
                    </tr>
                    <tr>
                        <td>Name: Eschericia Coli</td>
                    </tr>
                    <tr>
                        <td>Name: Eschericia Coli</td>
                    </tr>
                    <tr>
                        <td>Name: Malus Domestica</td>
                    </tr>
                </tbody>
                <thead>
                    <tr>
                        <th colSpan={3}>Alert Configuration</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Email</th>
                        <td>isoomro.t@gmail.com</td>
                    </tr>
                    <tr>
                        <th>Phone</th>
                        <td>+1 (306) 443-2342</td>
                    </tr>
                    <tr>
                        <th>Phone</th>
                        <td>+1 (306) 443-2342</td>
                    </tr>
                    <tr>
                        <th>Enable Alert</th>
                        <td>Yes</td>
                    </tr>
                </tbody>
            </table>
            <hr />
            <div className="vspacer-20" />
            <button className="btn btn-info">Initiate Database Creation Process</button>
        </div>
    );
}

export default SummaryComponent;
