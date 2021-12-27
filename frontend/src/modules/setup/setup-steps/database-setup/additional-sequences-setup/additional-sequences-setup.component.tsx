import React, {FunctionComponent, useEffect, useState} from "react";
import {IDatabaseSetupConstituent} from "../database-setup.interfaces";

type IKeys = "name" | "file" | "threshold" | "alert"

const AdditionalSequencesSetupComponent  : FunctionComponent<IDatabaseSetupConstituent> = ({updateConfig}) => {

    const [queries, setQueries] = useState([
        {name: "", file: "", threshold: "", current_value: 0, alert: false}
    ]);

    const handleDataChange = (idx: number, key : IKeys) => (evt: React.ChangeEvent<HTMLInputElement>) => {
        const newQueries = queries.map((query, sidx) => {
            if (idx !== sidx) return query;
            return key === "alert" ? { ...query, [key]: parseInt(evt.target.value) !== 0 } : { ...query, [key]: evt.target.value }
        });
        console.log(JSON.stringify(newQueries))
        setQueries(newQueries);
    }

    const handleAddQuery = () => {
        setQueries((prev) => [...prev, {
            name: "", file: "", threshold: "", current_value: 0, alert: false
        }]);
    }

    const handleRemoveQuery = (idx : number) => () => {

        const newQueries = queries.filter((s, sidx) => idx !== sidx)

        setQueries(newQueries)
    }

    useEffect(() => {
        updateConfig((prevState: any) => ({
            ...prevState,
            queries: queries
        }))
    }, [queries])

    return (
        <>
            <h4>Additional Sequences</h4>
            <div className="vspacer-50 "/>
            {
                queries.length === 0 || false ? (
                    <div className="container text-center ">
                        No queries found. Add new by clicking the '+' button below.
                    </div>
                ) : (
                    queries.map((q, i) => {
                        return (
                            <div key={i} className="container  pb-2">
                                <div className="row p-0 m-0">
                                    <div className="col-sm-4">
                                        <input type="text" name="sci_file"
                                               placeholder="/path/to/file.fasta"
                                               onChange={handleDataChange(i, "file")}
                                               className="form-control"/>
                                    </div>
                                    <div className="col-sm-3">
                                        <input type="text" onChange={handleDataChange(i, "name")}
                                               placeholder="Scientific Name (eg. Streptococcus pneumoniae)"
                                               className="form-control"/>
                                    </div>
                                    <div className="col-sm-2">
                                        <div className="btn-group-toggle" data-toggle="buttons">
                                            <label className="">
                                                <input placeholder="Alert? 1/0"
                                                       type="number"
                                                       onChange={handleDataChange(i, "alert")}
                                                       className="form-control"/>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-sm-2">
                                        <div className="btn-group-toggle" data-toggle="buttons">
                                            <label className="">
                                                <input placeholder="Threshold (e.g., 98%)"
                                                       type="number"
                                                       onChange={handleDataChange(i, "threshold")}
                                                       className="form-control"/>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button"
                                                className="pull-right btn btn-danger"
                                                onClick={handleRemoveQuery(i)}
                                        >
                                            <i className="fa fa-trash-alt"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )
            }

            <div className="vspacer-20 "/>
            <hr/>
            <div className="vspacer-20 "/>
            <div className="row ml-auto pr-5">
                <button
                    type="button" className="pull-right btn btn-primary"
                    onClick={handleAddQuery}
                >
                    <i className="fa fa-plus"/>
                </button>
            </div>
        </>
    );
}

export default AdditionalSequencesSetupComponent;
