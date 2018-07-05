import React, { Component} from 'react';
import { Well, Col, Row, FormGroup, FormControl, Button } from 'react-bootstrap';


class CustomDatabase extends Component {
  render(){
    return(
      <Well style={{height: 500 + 'px', padding: 0 + 'px', textAlign: 'center'}}>
          <Col md={12}>
            <Row style={{borderBottom: 1 + 'px solid #CCC'}}>
              <div className='d-inline'>
                <Col md={2} style={{padding: 10 + 'px'}}>
                  <span>Choose a FASTA Record</span>
                </Col>
                <Col md={4} style={{padding: 10 + 'px'}}>
                  <FormGroup controlId="formInlineSName">
                    <FormControl type="text" placeholder="Scientific Name (eg. Streptococcus pneumoniae)" />
                  </FormGroup>
                </Col>
                <Col md={3} style={{padding: 10 + 'px'}}>
                  <FormGroup controlId="formInlineFile">
                    <FormControl type="file" />
                  </FormGroup>
                </Col>
                <Col md={1} style={{padding: 10 + 'px'}}>
                  <FormGroup controlId="formInlineTaxID">
                    <FormControl type="number" placeholder="tax_id" />
                  </FormGroup>
                </Col>
              </div>
            </Row>
            <br />
            <Button bsStyle="primary" className="pull-right">Add</Button>
          </Col>
      </Well>
    );
  }
}
export default CustomDatabase;
