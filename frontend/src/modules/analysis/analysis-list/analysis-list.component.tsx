import React, { FunctionComponent, useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import "./analysis-list.component.css";

type IAnalysisMetaData = {
    id: string,
    minion_dir: string,
    micas_dir: string
}

type IListRendererProps = {
    analyses: IAnalysisMetaData[]
    update: React.Dispatch<React.SetStateAction<boolean>>
}

const initial_analyses_data: IAnalysisMetaData[] = [];

const ListRenderer: FunctionComponent<IListRendererProps> = ({ analyses, update }) => {
    const deleteAnalyses = async (id: string) => {
        if (id === undefined) {
            console.log("ID: ", id, " is undefined")
        } else {
            let uid = new FormData();
            uid.append('uid', id);
            const res = await axios({
                method: 'POST',
                url: 'http://localhost:5007/delete_analyses',
                data: uid,
                headers: { "Content-Type": "multipart/form-data" },
            })
            if (res.data.status === 200) {
                if (res.data.found === true) {
                    update(true)
                } else {
                    console.log("Cannot find id", id, "for deletion")
                }
            } else {
                console.log("Error occurred in delete request post for", id, ". Returned status ", res.data.status)
            }
        }
    };

    return (
        <div>
            {analyses.map((a, i) => (
                <ListGroup key={i} as="ol" className="numbered pb-2">
                    <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                        <div className="ms-2 me-auto">
                            <div><b>ID:</b> {a.id}</div>
                            <div><b>MinION Reads Directory:</b> {a.minion_dir}</div>
                            <div><b>MICAS Directory:</b> {a.micas_dir}</div>
                        </div>
                        <div className="align-self-center">
                            <Link to={"/analysis/" + a.id}>
                                <button className="btn btn-primary mr-3">
                                    <i className="fas fa-arrow-right"></i> Enter
                                </button>
                            </Link>
                            <button className="btn btn-danger" onClick={() => deleteAnalyses(a.id)}>
                                <i className="fas fa-trash-alt"></i> Delete
                            </button>
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            ))}
        </div>
    );
};

const AnalysisListComponent = () => {
    const [analyses, setAnalyses] = useState(initial_analyses_data);
    const [status, setStatus] = useState("loading");
    const [trigger, setTrigger] = useState(false)

    const getAllAnalyses = () => {
        return axios({
            method: "GET",
            url: "http://localhost:5007/get_all_analyses"
        });
    };

    useEffect(() => {
        (async () => {
            const res = await getAllAnalyses();
            if (res.data.status === 200) {
                setAnalyses(res.data.data);
                if (res.data.data.length > 0) {
                    setStatus("loaded");
                } else {
                    setStatus("notfound");
                }
            }
        })();
    }, []);

    useEffect(() => {
        if (trigger) {
            (async () => {
                const res = await getAllAnalyses();
                if (res.data.status === 200) {
                    setAnalyses(res.data.data);
                    if (res.data.data.length > 0) {
                        setStatus("loaded");
                    } else {
                        setStatus("notfound");
                    }
                }
                setTrigger(false)
            })();
        }
    }, [trigger]);

    let RenderObject;
    switch (status) {
        case "loading":
            RenderObject = <div>Loading...</div>;
            break;
        case "loaded":
            RenderObject = <ListRenderer analyses={analyses} update={setTrigger} />
            break;
        case "notfound":
            RenderObject = <div>No analyses found.</div>
            break;
        default:
            RenderObject = <div>404 - Page not found</div>
            break;
    }

    return (
        <div className="container-fluid analysis-list-container">
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <h4>MICAS Analyses List</h4>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to="/">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/setup">Setup</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/analysis">All Analyses</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="vspacer-20" />
            <h4>Current Analyses</h4>
            {RenderObject}
        </div>
    );
};

export default AnalysisListComponent;
