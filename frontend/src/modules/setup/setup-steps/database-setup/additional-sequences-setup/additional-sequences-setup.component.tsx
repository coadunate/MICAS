import React from 'react';

const AdditionalSequencesSetupComponent = () => {
    return (
        <>
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
        </>
    );
}

export default AdditionalSequencesSetupComponent;
