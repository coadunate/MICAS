import React, { Component } from 'react';

import '../../css/Header.css';


class HeaderView extends Component {

  constructor(props){
    super(props);
  }

  render() {
    return (
      <div>
        <span className="heading-text">{ this.props.name }</span>
        <hr />
      </div>
    );
  }
}

export default HeaderView;
