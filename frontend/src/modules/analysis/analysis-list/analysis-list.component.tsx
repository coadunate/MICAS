import React, {FunctionComponent, useEffect, useState} from "react";
import {ListGroup} from "react-bootstrap";
import {Link} from "react-router-dom";
import axios from "axios";

type IAnalysisMetaData = {
    id: string,
    minion_dir: string,
    micas_dir: string
}

type IListRendererProps = {
    analyses: IAnalysisMetaData[]
}

const initial_analyses_data = [
    {id: "", minion_dir: "", micas_dir: ""}
];

const ListRenderer: FunctionComponent<IListRendererProps> = ({analyses}) => {
    return (
        <div>
            {
                analyses.map((a, i) => {
                    return (
                        <ListGroup as="ol" className={"numbered pb-2"}>
                            <ListGroup.Item
                                as="li"
                                className="d-flex justify-content-between align-items-start"
                            >
                                <div className="ms-2 me-auto">
                                    <div><b>ID:</b> {a.id}</div>
                                    <b>MinION Reads
                                       Directory:</b> {a.minion_dir}
                                    <br/>
                                    <b>MICAS Directory:</b> {a.micas_dir}
                                </div>
                                <div className={"align-self-center"}>
                                    <Link to={"/analysis/" + a.id}>
                                        <button
                                            className="btn btn-primary mr-3">
                                            Enter
                                        </button>
                                    </Link>
                                    <button className="btn btn-danger mr-3"
                                            onClick={() => alert("Feature under development")}>
                                        Delete
                                    </button>
                                </div>
                            </ListGroup.Item>
                        </ListGroup>
                    );
                })
            }
        </div>
    );
};

const AnalysisListComponent = () => {

    const [analyses, setAnalyses] = useState(initial_analyses_data);
    const [status, setStatus]     = useState("loading");

    const getAllAnalyses = () => {
        return axios({
            method: "GET",
            url   : "http://localhost:5000/get_all_analyses"
        });
    };

    useEffect(() => {
        (async () => {
            const res = await getAllAnalyses();
            console.log(res);

            if (res.data.status === 200) { // if locations are valid
                setAnalyses(res.data.data);
                console.log(res.data.data);
                if (res.data.data.length > 0) {
                    setStatus("loaded");
                } else {
                    setStatus("notfound");
                }
            }
        })();
    }, []);

    let RenderObject = <div>404</div>;
    switch (status) {
        case "loading":
            RenderObject = <div>Loading...</div>;
            break;
        case "loaded":
            RenderObject = <ListRenderer analyses={analyses} />
            break;
        case "notfound":
            RenderObject = <div>Not found.</div>
            break;
        default:
            RenderObject = <div>404</div>
            break;
    }

    return (
        <div className="container">
            <h2>Current Analyses</h2>
            <div className="vspacer-20"/>
            {RenderObject}
        </div>
    );
};

export default AnalysisListComponent;
