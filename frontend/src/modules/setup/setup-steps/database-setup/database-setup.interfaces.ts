import {INCBIDatabases} from "./ncbi-db-setup/ncbi-db-selection.interfaces";
import {IAdditionalSequences} from "./additional-sequences-setup/additional-sequences-setup.interfaces";
import React from "react";

type IDatabaseSelectionConfig = {
    ncbi: INCBIDatabases,
}

type IDatabseSetupInput = {
    ncbi: INCBIDatabases,
    queries: IAdditionalSequences
}

type IDatabaseSetupConstituent = {
    initialConfig: INCBIDatabases | IAdditionalSequences,
    updateConfig: React.Dispatch<React.SetStateAction<IDatabaseSelectionConfig>> |
        React.Dispatch<React.SetStateAction<IAdditionalSequences>>
}


export type {
    IDatabaseSelectionConfig,
    IDatabaseSetupConstituent,
    IDatabseSetupInput
}
