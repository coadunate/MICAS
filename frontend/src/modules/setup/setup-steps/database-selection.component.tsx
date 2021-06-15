import React, {FunctionComponent} from 'react';
import {ISetupComponentProps} from "../setup.interfaces";

const DatabaseSelectionComponent:
    FunctionComponent<ISetupComponentProps> = ({advanceStep, update}) => {
    return (
        <div
            className="container-fluid vspacer-100 border-pink d-flex flex-column h-100">
            <h4>Add NCBI databases</h4>
            <div className="vspacer-20 border-black"/>
            <div className="form-check">
                <input className="form-check-input" type="checkbox" value=""
                       id="chBacteria"/>
                <label className="form-check-label" htmlFor="chBacteria">
                    Bacteria
                </label>
            </div>
            <div className="form-check">
                <input className="form-check-input" type="checkbox" value=""
                       id="chArchaea"/>
                <label className="form-check-label" htmlFor="chArchaea">
                    Archaea
                </label>
            </div>
            <div className="form-check">
                <input className="form-check-input" type="checkbox" value=""
                       id="chVirus"/>
                <label className="form-check-label" htmlFor="chVirus">
                    Virus
                </label>
            </div>
            <div className="vspacer-50 border-orange"/>
            <div className="twline"><span>AND / OR</span></div>
            <h4>Additional Sequences</h4>
            <div className="vspacer-50 border-green"/>

            <div className="container border-blue">
                <div className="row p-0 m-0">
                    <div className="col-sm-4">
                        <input type="text" name="sci_file" value=""
                               placeholder="/path/to/file.fasta"
                               id="formInlineSName" className="form-control"/>
                    </div>
                    <div className="col-sm-3">
                        <input type="text" name="sci_name" value=""
                               placeholder="Scientific Name (eg. Streptococcus pneumoniae)"
                               id="formInlineSName"
                               className="form-control"/>
                    </div>
                    <div className="col-sm-3">
                        <input placeholder="Parent Scientific Name"
                               aria-autocomplete="list"
                               aria-labelledby="downshift-0-label"
                               autoComplete="nope" value=""
                               id="downshift-0-input" className="form-control"/>
                    </div>
                    <div className="col-sm-1">
                        <div className="btn-group-toggle" data-toggle="buttons">
                            <label className="btn btn-primary active">
                                <input type="checkbox" checked
                                       autoComplete="off"/> Alert
                            </label>
                        </div>
                    </div>
                    <div className="col-sm-1">
                        <button type="button"
                                className="pull-right btn btn-danger"><i
                            className="fa fa-trash-alt"/></button>
                    </div>
                </div>
            </div>
            <div className="vspacer-20 border-black"/>
            <hr/>
            <div className="vspacer-20 border-black"/>
            <div className="row border-orange ml-auto pr-5">
                <button type="button" className="pull-right btn btn-primary"><i
                    className="fa fa-plus"/></button>
            </div>
        </div>
    );

}

export default DatabaseSelectionComponent;
