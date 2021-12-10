import React from "react";
import {ListGroup} from "react-bootstrap";
import {Link} from 'react-router-dom';

const AnalysisListComponent = () => {
    return (
        <div className="container">
            <h2>Current Analyses</h2>
            <div className="vspacer-20" />
            <ListGroup as="ol" className={"numbered"}>
                <ListGroup.Item
                    as="li"
                    className="d-flex justify-content-between align-items-start"
                >
                    <div className="ms-2 me-auto">
                        <div className="fw-bold">ID: n5ytZ</div>
                        MinION Reads Directory: /Users
                        <br/>
                        MICAS Directory: /Users
                    </div>
                    <div>
                        <Link to="/analysis/n5ytZ">
                            <button className="btn btn-primary mr-3">
                                Enter
                            </button>
                        </Link>
                        <button className="btn btn-danger mr-3" onClick={() => alert("Feature under development")}>
                            Delete
                        </button>
                    </div>
                </ListGroup.Item>
            </ListGroup>
        </div>
);
};

export default AnalysisListComponent;
