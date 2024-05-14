import React, { FunctionComponent, useEffect, useState } from "react";
import { IDatabaseSetupConstituent } from "../database-setup.interfaces";

type IKeys = "name" | "file" | "threshold" | "alert";

const AdditionalSequencesSetupComponent: FunctionComponent<IDatabaseSetupConstituent> = ({ updateConfig }) => {
    const [queries, setQueries] = useState([
        { name: "", file: "", threshold: "", current_value: 0, alert: false }
    ]);

    const handleDataChange = (idx: number, key: IKeys) => (evt: React.ChangeEvent<HTMLInputElement>) => {
        const newQueries = queries.map((query, sidx) => {
            if (idx !== sidx) return query;
            return key === "alert" ? { ...query, [key]: evt.target.checked } : { ...query, [key]: evt.target.value };
        });
        setQueries(newQueries);
    };

    const handleAddQuery = () => {
        setQueries((prev) => [
            ...prev,
            { name: "", file: "", threshold: "", current_value: 0, alert: false }
        ]);
    };

    const handleRemoveQuery = (idx: number) => () => {
        const newQueries = queries.filter((s, sidx) => idx !== sidx);
        setQueries(newQueries);
    };

    useEffect(() => {
        updateConfig((prevState: any) => ({
            ...prevState,
            queries: queries
        }));
    }, [queries, updateConfig]);

    return (
        <div className="additional-sequences-setup">
            {queries.length === 0 ? (
                <div className="text-center">
                    No queries found. Add new by clicking the '+' button below.
                </div>
            ) : (
                queries.map((q, i) => (
                    <div key={i} className={`card mb-3 ${q.alert ? 'alert-enabled' : ''}`}>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        placeholder="Sequence file /path/to/file.fasta"
                                        onChange={handleDataChange(i, "file")}
                                        className="form-control"
                                        accept=".fasta,.fna,.ffn,.faa,.frn,.fa"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <input
                                        type="text"
                                        placeholder="Sequence Identifier"
                                        onChange={handleDataChange(i, "name")}
                                        className="form-control"
                                    />
                                </div>
                                <div className="col-md-2">
                                    <input
                                        type="number"
                                        placeholder="% Threshold"
                                        onChange={handleDataChange(i, "threshold")}
                                        className="form-control"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div className="col-md-2 d-flex align-items-center">
                                    <div className="custom-control custom-switch">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id={`alertSwitch${i}`}
                                            onChange={handleDataChange(i, "alert")}
                                            checked={q.alert}
                                        />
                                        <label className="custom-control-label" htmlFor={`alertSwitch${i}`}></label>
                                    </div>
                                    {q.alert && <span className="badge badge-danger ml-2">Alert Enabled</span>}
                                </div>
                                <div className="col-md-1 d-flex align-items-center justify-content-center">
                                    <button type="button" className="btn btn-danger" onClick={handleRemoveQuery(i)}>
                                        <i className="fa fa-trash-alt" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
            <div className="text-center">
                <button type="button" className="btn btn-primary" onClick={handleAddQuery}>
                    <i className="fa fa-plus" /> Add Query
                </button>
            </div>
        </div>
    );
}

export default AdditionalSequencesSetupComponent;
