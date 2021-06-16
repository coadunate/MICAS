import React, {FunctionComponent, useEffect, useState} from 'react';
import {ISetupComponentProps} from "../../setup.interfaces";
import AdditionalSequencesSetupComponent from "./additional-sequences-setup/additional-sequences-setup.component";
import NcbiDbSelectionComponent from "./ncbi-db-setup/ncbi-db-selection.component";
import {IDatabaseSelectionConfig} from "./database-setup.interfaces";

const initial_db_selection_config: IDatabaseSelectionConfig = {
    ncbi: {
        bacteria: false,
        archaea: false,
        virus: false,

    },
    queries: []
}

const DatabaseSetupComponent:
    FunctionComponent<ISetupComponentProps> = ({}) => {

    const [dbSelectionConfig, setDBSelectionConfig] = useState(initial_db_selection_config)

    useEffect(() => {
        console.log(dbSelectionConfig);
    }, [dbSelectionConfig])


    return (
        <div
            className="container-fluid vspacer-100 border-pink d-flex flex-column h-100">
            <NcbiDbSelectionComponent initialConfig={initial_db_selection_config.ncbi}
                                      updateConfig={setDBSelectionConfig}/>
            <div className="vspacer-50 border-orange"/>
            <div className="twline"><span>AND / OR</span></div>
            <AdditionalSequencesSetupComponent/>
        </div>
    );

}

export default DatabaseSetupComponent;
