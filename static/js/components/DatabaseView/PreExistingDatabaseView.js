import React, { Component } from 'react';
import { Well, FormGroup, Col, Checkbox } from 'react-bootstrap';

class PreExistingDatabase extends Component {
  constructor(props){
    super(props);
    this.state = { bacteria: true, archaea: false, virus: false }

  }

  handleChange(name,e){
    if(name === 'bacteria'){

      this.props.changeDBState(
        {
          bacteria: !this.state.bacteria,
          archaea: this.state.archaea,
          virus: this.state.virus
        }
      );
      this.setState({ bacteria: !this.state.bacteria });

    } else if(name === 'archaea'){

      this.props.changeDBState(
        {
          bacteria: this.state.bacteria,
          archaea: !this.state.archaea,
          virus: this.state.virus
        }
      );
      this.setState({ archaea: !this.state.archaea });

    } else if(name === 'virus'){

      this.props.changeDBState(
        {
          bacteria: this.state.bacteria,
          archaea: this.state.archaea,
          virus: !this.state.virus
        }
      );
      this.setState({ virus: !this.state.virus });
    }
  }

  render(){
    return(
      <Well>
        <FormGroup>
          <Col md={12}>
            <Col md={4}>
              <Checkbox inline checked={this.state.bacteria} onChange={ this.handleChange.bind(this,"bacteria")} >Bacteria</Checkbox>
            </Col>
            <Col md={4}>
              <Checkbox inline checked={this.state.archaea} onChange={ this.handleChange.bind(this,"archaea")} >Archaea</Checkbox>
            </Col>
            <Col md={4}>
              <Checkbox inline checked={this.state.virus} onChange={ this.handleChange.bind(this,"virus")}>Virus</Checkbox>
            </Col>
          </Col>
        </FormGroup>
        </Well>
    );
  }
}

export default PreExistingDatabase;
