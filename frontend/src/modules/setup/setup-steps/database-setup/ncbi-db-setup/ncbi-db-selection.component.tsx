import React, {FunctionComponent, useEffect, useState} from 'react';
import {IDatabaseSelectionConfig, IDatabaseSetupConstituent} from "../database-setup.interfaces";
import {INCBIDatabases} from "./ncbi-db-selection.interfaces";

const NcbiDbSelectionComponent: FunctionComponent<IDatabaseSetupConstituent> = ({initialConfig, updateConfig}) => {

    const [ncbiDbs, setNcbiDbs] = useState(initialConfig as INCBIDatabases)

    const updateSelection = (key: string) => {

        const typed_key = key as keyof typeof initialConfig

        setNcbiDbs(prevState => ({
            ...prevState,
            [key]: !ncbiDbs[typed_key]
        }))
    }

    useEffect(() => {
        updateConfig((prevState: any) => ({
            ...prevState,
            ncbi: ncbiDbs
        }))
    }, [ncbiDbs])

    return (
        <>
            <h4>Add NCBI databases</h4>
            <div className="vspacer-20 "/>
            <div className="form-check">
                <input className="form-check-input" type="checkbox"
                       id="chBacteria" checked={ncbiDbs.bacteria}
                       onChange={() => updateSelection("bacteria")}
                />
                <label className="form-check-label" htmlFor="chBacteria">
                    Bacteria
                </label>
            </div>
            <div className="form-check">
                <input className="form-check-input" type="checkbox"
                       id="chArchaea" checked={ncbiDbs.archaea}
                       onChange={() => updateSelection("archaea")}
                />
                <label className="form-check-label" htmlFor="chArchaea">
                    Archaea
                </label>
            </div>
            <div className="form-check">
                <input className="form-check-input" type="checkbox"
                       id="chVirus" checked={ncbiDbs.virus}
                       onChange={() => updateSelection("virus")}
                />
                <label className="form-check-label" htmlFor="chVirus">
                    Virus
                </label>
            </div>

        </>
    );
}
export default NcbiDbSelectionComponent;
