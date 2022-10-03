import React, {FunctionComponent} from "react";
import {IAnalysisDataProps} from "./analysis-data.interfaces";
import {socket} from "../../../app.component";
import ChartComponent from "./chart/chart.component";

const AnalysisDataComponent: FunctionComponent<IAnalysisDataProps> = ({data}) => {

    const analysis_data = data.data;

    const handleStartFileListener = () => {
        socket.emit("start_fastq_file_listener", {
            minion_location: analysis_data.minion,
            projectId: analysis_data.projectId
        });
    };


    let queries_data = [["Name", "Ratio", "Threshold"]];
    for (let i = 1; i <= analysis_data.queries.length; i++) {
        let name        = analysis_data.queries[i - 1].name;
        let thresh      = analysis_data.queries[i - 1].threshold;
        let curr_val    = analysis_data.queries[i - 1].current_value;
        // @ts-ignore
        queries_data[i] = [name, curr_val, parseInt(thresh)];
    }

    return (
        <div className="container-fluid d-flex flex-column red">
            <div className="vspacer-50 orange"/>
            <div className="container-fluid text-center black">
                <h3 className="font-weight-bold">MICAS Analysis Page</h3>
            </div>
            <div className="container green d-flex flex-column">
                <div className="vspacer-50"/>
                <div className="twline"><span>main information</span></div>
                <table className="table table-ed">
                    <tbody>
                    <tr>
                        <th>Analysis ID</th>
                        <td>{analysis_data.projectId}</td>
                    </tr>
                    <tr>
                        <th>MinION Path</th>
                        <td>{analysis_data.minion}</td>
                    </tr>
                    <tr>
                        <th className={"text-center"} colSpan={2}>Actions</th>
                    </tr>
                    <tr>
                        <td className={"text-center"}>
                            <button className="btn btn-primary"
                                    onClick={() => handleStartFileListener()}>Start
                                                                              File
                                                                              Listener
                            </button>
                        </td>
                        <td className={"text-center"}>
                            <button className="btn btn-danger">Remove Analysis
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div className="vspacer-50"/>
                <div className="twline"><span>other information</span></div>
                <h3>Sequences Match Visualization</h3>
                <ChartComponent queries_data={queries_data} />
            </div>
        </div>
    );
};
export default AnalysisDataComponent;
