import React, {useEffect} from "react";
import {useParams} from 'react-router-dom';
import {IParams} from "./analysis.interfaces";
<<<<<<< HEAD
import {socket} from "../../app.component";
=======
>>>>>>> f7f0070f5bc6ef33e17c5bd36a20fdd52c04e3b1

const AnalysisComponent = () => {

    let params: IParams;

    params = useParams();

    useEffect(() => {

    },[])

    return (
        <div className="container-fluid d-flex flex-column border-red">
            <div className="vspacer-50 border-orange"/>
            <div className="container-fluid text-center border-black">
                <h3 className="font-weight-bold">MICAS Analysis Page</h3>
            </div>
            <div className="container border-green d-flex flex-column">
                <h3>
                    <span className="font-weight-bold">
                        <i>a</i>
                    </span>lert &nbsp;
                    <span className="font-weight-bold">
                        <i>i</i>
                    </span>nformation
                </h3>
                <div className="twline"><span>main information</span></div>
                <span><b>Analysis ID:</b> {params.id}</span>
                <span><b>MinION Path:</b> </span>
                <div className="twline"><span>other information</span></div>
            </div>
            <div className="container border-black">
                SANKEY PLOT HERE
            </div>
        </div>
    );
}

export default AnalysisComponent;
