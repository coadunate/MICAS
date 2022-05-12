import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {IParams} from "./analysis.interfaces";
import AnalysisListComponent from "./analysis-list/analysis-list.component";
import axios from "axios";
import AnalysisDataComponent from "../analysis/analysis-data/analysis-data.component"
import {IAnalysisData} from "./analysis-data/analysis-data.interfaces";

const initial_analysis_data_state: IAnalysisData = {
    "status": 404,
    "data"  : {
        "minion"      : "",
        "app_location": "",
        "queries"     : [],
        "projectId"   : "",
        "email"       : ""
    }
};

const AnalysisComponent = () => {

    const [data, setData]     = useState(initial_analysis_data_state);
    const [loaded, setLoaded] = useState(false);

    let params: IParams;

    params = useParams();

    useEffect(() => {
        (async () => {
            const res = await get_analysis_info(params.id);
            console.log(res);
            setData(res.data);
            setLoaded(true);
        })();
    }, []);

    const get_analysis_info = (uid: string) => {

        return axios({
            method: "GET",
            url   : `http://localhost:5000/get_analysis_info?uid=${uid}`
        });
    };


    return params.id ? (
        loaded ? (
            data.status === 200 ? (
                <AnalysisDataComponent data={data}/>
            ) : (
                <div>Invalid project ID</div>
            )
        ) : (
            <div>Loading...</div>
        )

    ) : <AnalysisListComponent/>;
};

export default AnalysisComponent;
