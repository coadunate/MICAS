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
    }, [queries, updateConfig])

    return (
        <>
            <div className="vspacer-50 container text-center ">
                <br/>
            </div>
            <div className="vspacer-50 "/>
            {
                queries.length === 0 || false ? (
                    <div className="container text-center">
                        No queries found. Add new by clicking the '+' button below.
                    </div>
                ) : (
                    queries.map((q, i) => {
                        return (
                            <div key={i} className="container text-center pb-2">
                                <div className="row p-0 m-0 ">
                                    <div className="col-sm-4">
                                        <input 
                                            id="filePathText"
                                            name="filePathText"
                                            type="text" 
                                            placeholder="Sequence file /path/to/file.fasta"
                                            onChange={handleDataChange(i, "file")}
                                            className="form-control"
                                            accept=".fasta,.fna,.ffn,.faa,.frn,.fa"
                                        />
                                    </div>
                                    <div className="col-sm-3">
                                        <input 
                                            id="fastaNameText"
                                            name="fastaNameText"
                                            type="text" 
                                            onChange={handleDataChange(i, "name")}
                                            placeholder="Sequence Identifier"
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="col-sm-2">
                                            <input 
                                                id="alertCheck"
                                                name="alertCheck"
                                                type="checkbox"
                                                onChange={handleDataChange(i, "alert")}
                                            />
                                            
                                            <label htmlFor="alertCheck">Alert?</label>
                                    </div>
                                    <div className="col-sm-2">
                                            <input 
                                                id="thresholdText"
                                                name="thresholdText"
                                                type="number"
                                                placeholder="% Threshold"
                                                onChange={handleDataChange(i, "threshold")}
                                                className="form-control"
                                                
                                                min="0" 
                                                max="100"
                                            /> 
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
            <div className="row col-lg-1 align-self-end mr-2">
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
