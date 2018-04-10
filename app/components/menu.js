import React, { Component } from 'react'
import { slide as Slide } from 'react-burger-menu'
import { Link } from 'react-router-dom'

class Menu extends Component {
  showSettings (event) {
    event.preventDefault();
  }

  render () {
    return (
      <Slide>
        <Link to="/">Home</Link>
        <Link to="/tollboothoperator">Tollbooth Operator</Link>
        <Link to="/vehicles">Vehicles</Link>
        <Link to="/tollbooths">Tollbooths</Link>
      </Slide>
    );
  }
}

export default Menu;
