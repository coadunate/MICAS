import {IQuery} from "../../setup/setup-steps/database-setup/additional-sequences-setup/additional-sequences-setup.interfaces";


type IAnalysisData = {
    "status": number,
    "data": {
        "minion": string,
        "queries": IQuery[],
        "projectId": string,
        "device": string
    }
}


type IAnalysisDataProps = {
    data: IAnalysisData
}

export type {
    IAnalysisData,
    IAnalysisDataProps
}
