import {IAdditionalSequences} from "./additional-sequences-setup/additional-sequences-setup.interfaces";
import React from "react";

type IDatabseSetupInput = {
    queries: IAdditionalSequences,
    locations: ILocationConfig
}

type ILocationConfig = {
    minionLocation: string,
    micasLocation: string
}


type IDatabaseSetupConstituent = {
    initialConfig: IAdditionalSequences | ILocationConfig,
    updateConfig: React.Dispatch<React.SetStateAction<ILocationConfig>> | React.Dispatch<React.SetStateAction<IDatabaseSelectionConfig>> |
        React.Dispatch<React.SetStateAction<IAdditionalSequences>>
}


export type {
    IDatabaseSetupConstituent,
    IDatabseSetupInput,
    ILocationConfig
}
