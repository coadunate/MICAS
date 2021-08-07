import {INCBIDatabases} from "./ncbi-db-setup/ncbi-db-selection.interfaces";
import {IAdditionalSequences} from "./additional-sequences-setup/additional-sequences-setup.interfaces";
import React from "react";

type IDatabaseSelectionConfig = {
    ncbi: INCBIDatabases,
}

type IDatabseSetupInput = {
    ncbi: INCBIDatabases,
    queries: IAdditionalSequences,
    locations: ILocationConfig
}

type ILocationConfig = {
    minionLocation: string,
    micasLocation: string
}


type IDatabaseSetupConstituent = {
    initialConfig: INCBIDatabases | IAdditionalSequences | ILocationConfig,
    updateConfig: React.Dispatch<React.SetStateAction<ILocationConfig>> | React.Dispatch<React.SetStateAction<IDatabaseSelectionConfig>> |
        React.Dispatch<React.SetStateAction<IAdditionalSequences>>
}


export type {
    IDatabaseSelectionConfig,
    IDatabaseSetupConstituent,
    IDatabseSetupInput,
    ILocationConfig
}
