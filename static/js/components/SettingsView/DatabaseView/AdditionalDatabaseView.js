import React, { Component} from 'react';
import { Well, Col, Row, FormGroup, FormControl, Button } from 'react-bootstrap';

// import States from './States'
import AxiosAutocomplete from './AxiosAutocomplete';


class AdditionalDatabaseView extends Component {


  constructor(props) {
      super(props);
      this.state = {
        queries: [{ name: '', file: '' }],
      };
    }


  handleQueryNameChange = (idx) => (evt) => {
    const newQuery = this.state.queries.map((query, sidx) => {
      if (idx !== sidx) return query;
      return { ...query, name: evt.target.value };
    });

    this.setState({ queries: newQuery });
    this.props.changeQueryState(newQuery);
  }

  handleQueryFileChange = (idx) => (evt) => {
    const newQuery = this.state.queries.map((query,sidx) => {
      if (idx !== sidx) return query;
      return { ...query, file: evt.target.files[0] }
    });

    this.setState({ queries: newQuery });
    this.props.changeQueryState(newQuery);
  }

  handleAddQuery = () => {
    this.setState({
      queries: this.state.queries.concat([{ name: '', file: '' }])
    });
  }

  handleRemoveQuery = (idx) => () => {
    this.setState({
      queries: this.state.queries.filter((s, sidx) => idx !== sidx)
    });
  }


  render(){
    return(
      <div>
          <hr />
          <strong className="text-center" style={{marginLeft: 20 + 'px', textDecoration: 'underline'}}>Additional Databases:</strong>
          <hr />

          {this.state.queries.map((query, idx) => (
            <div className="query" key={idx}>
              <Col md={12}>
                <Row key={idx} style={{borderBottom: 1 + 'px solid #CCC'}}>
                  <div className='d-inline'>
                    <Col md={3} style={{padding: 10 + 'px'}}>
                      <FormGroup controlId="formInlineFile">
                        <FormControl key={idx} name="file" type="file" accept=".fasta" onChange={this.handleQueryFileChange(idx)} />
                      </FormGroup>
                    </Col>
                    <Col md={4} style={{padding: 10 + 'px'}}>
                      <FormGroup controlId="formInlineSName">
                        <FormControl key={idx}  name="sci_name" value={query.name} onChange={this.handleQueryNameChange(idx)} type="text" placeholder="Scientific Name (eg. Streptococcus pneumoniae)" />
                      </FormGroup>
                    </Col>
                    <Col md={4} style={{padding: 10 + 'px'}}>
                      <FormGroup controlId="formInlineSName">
                      { /* <AxiosAutocomplete/> */ }
                      </FormGroup>
                    </Col>
                    <Col md={1} style={{padding: 10 + 'px'}}>
                      <Button bsStyle="danger" onClick={this.handleRemoveQuery(idx)} className="pull-right"><i className="fa fa-trash-alt"></i></Button>
                    </Col>
                  </div>
                </Row>
              </Col>
            </div>
          ))}
          <Col md={12}>
            <div className="run"></div>
          </Col>
          <Col md={12}>
            <Col md={11}></Col>
            <Col md={1}>
              <Button bsStyle="primary" onClick={this.handleAddQuery} className="pull-right"><i className="fa fa-plus"></i></Button>
            </Col>
          </Col>
      </div>
    );
  }
}
export default AdditionalDatabaseView;
