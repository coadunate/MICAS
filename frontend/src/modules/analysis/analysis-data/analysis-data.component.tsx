import React, { FunctionComponent } from "react";
import { IAnalysisDataProps } from "./analysis-data.interfaces";
import { socket } from "../../../app.component";
import ChartComponent from "./chart/chart.component";
import { Link } from "react-router-dom";
import "./analysis-data.component.css";

const AnalysisDataComponent: FunctionComponent<IAnalysisDataProps> = ({ data }) => {
    const analysis_data = data.data;

    const handleStartFileListener = () => {
        socket.emit("start_fastq_file_listener", {
            minion_location: analysis_data.minion,
            projectId: analysis_data.projectId
        });
    };

    let queries_data = [["Name", "Ratio", "Threshold"]];
    for (let i = 1; i <= analysis_data.queries.length; i++) {
        let name = analysis_data.queries[i - 1].name;
        let thresh = analysis_data.queries[i - 1].threshold;
        let curr_val = analysis_data.queries[i - 1].current_value;
        // @ts-ignore
        queries_data[i] = [name, curr_val, parseInt(thresh)];
    }

    return (
        <div className="container-fluid analysis-container">
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <h4>MICAS Analysis Page</h4>
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
            <div className="container d-flex flex-column align-items-center">
                <div className="vspacer-20" />
                <div className="section-title"><span>Actions</span></div>
                <div className="action-buttons d-flex justify-content-center">
                    <button className="btn btn-primary mr-3" onClick={handleStartFileListener}>
                        <i className="fas fa-play"></i> Start File Listener
                    </button>
                    <button className="btn btn-danger">
                        <i className="fas fa-trash-alt"></i> Remove Analysis
                    </button>
                </div>
                <div className="vspacer-20" />
                <div className="section-title"><span>Main Information</span></div>
                <table className="table table-bordered">
                    <tbody>
                        <tr>
                            <th>Analysis ID</th>
                            <td>{analysis_data.projectId}</td>
                        </tr>
                        <tr>
                            <th>MinION Path</th>
                            <td>{analysis_data.minion}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="vspacer-20" />
                <div className="section-title"><span>Other Information</span></div>
                <h3>Sequences Match Visualization</h3>
                <ChartComponent queries_data={queries_data} />
            </div>
            <div className="vspacer-50" />
        </div>
    );
};

export default AnalysisDataComponent;
