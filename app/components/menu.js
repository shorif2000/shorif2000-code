import React, { Component } from 'react'
import { slide as Slide } from 'react-burger-menu'

class Menu extends Component {
  showSettings (event) {
    event.preventDefault();
  }

  render () {
    return (
      <Slide>
        <a href="#" onClick={this.props.displaypage} id="page1">Home</a>
        <a href="#" onClick={this.props.displaypage} id="page2">Tollbooth Operator</a>
        <a href="#" onClick={this.props.displaypage} id="page3">Vehicles</a>
        <a href="#" onClick={this.props.displaypage} id="page4">Tollbooths</a>
      </Slide>
    );
  }
}

export default Menu;
