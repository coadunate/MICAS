import React, {FunctionComponent, useEffect, useState} from 'react';
import AdditionalSequencesSetupComponent from "./additional-sequences-setup/additional-sequences-setup.component";
import NcbiDbSelectionComponent from "./ncbi-db-setup/ncbi-db-selection.component";
import {IDatabaseSelectionConfig, IDatabseSetupInput} from "./database-setup.interfaces";
import {IAdditionalSequences} from "./additional-sequences-setup/additional-sequences-setup.interfaces";
import {IAlertConfig} from "../alert-configuration/alert-configuration.interfaces";
import {IDatabaseSetupProps} from '../../setup.interfaces';

const initial_db_selection_config: IDatabaseSelectionConfig = {
    ncbi: { bacteria: false, archaea: false, virus: false,
    }
}

const initial_additional_sequences_config: IAdditionalSequences = {
    queries: []
}

const DatabaseSetupComponent:
    FunctionComponent<IDatabaseSetupProps> = ({advanceStep, update}) => {

    const [dbSelectionConfig, setDBSelectionConfig] = useState(initial_db_selection_config)
    const [additionalSequences, setAdditionalSequences] = useState(initial_additional_sequences_config)

    const updateDatabaseSetupConfiguration = () => {

        update({ncbi: dbSelectionConfig.ncbi, queries: additionalSequences})

        advanceStep();
    }

    return (
        <div
            className="container-fluid vspacer-100 d-flex flex-column h-100">
            <NcbiDbSelectionComponent initialConfig={initial_db_selection_config.ncbi}
                                      updateConfig={setDBSelectionConfig}/>
            <div className="vspacer-50"/>
            <div className="twline"><span>AND / OR</span></div>
            <AdditionalSequencesSetupComponent initialConfig={initial_additional_sequences_config}
                                               updateConfig={setAdditionalSequences}
            />
            <br/>
            <div className="container text-center">
                <button className="btn btn-success col-lg-2 mx-auto"
                        onClick={() => updateDatabaseSetupConfiguration()}>Next Step
                </button>
            </div>
        </div>
    );

}

export default DatabaseSetupComponent;
