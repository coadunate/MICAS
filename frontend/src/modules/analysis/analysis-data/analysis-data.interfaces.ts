import {IQuery} from "../../setup/setup-steps/database-setup/additional-sequences-setup/additional-sequences-setup.interfaces";


type IAnalysisData = {
    "status": number,
    "data": {
        "minion": string,
        "app_location": string,
        "bacteria": boolean,
        "archaea": boolean,
        "virus": boolean,
        "queries": IQuery[],
        "projectId": string,
        "email": string
    }
}


type IAnalysisDataProps = {
    data: IAnalysisData
}

export type {
    IAnalysisData,
    IAnalysisDataProps
}