import React, { Component } from 'react';

class TollboothOperator extends Component {
    constructor(){
        super(props);
        this.state = {
            tollboothoperator_address: '',
            
        }
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({tollboothoperator_address: event.target.value});
    }

    render(){        
        return (
            <div className="container-fluid">
                <div className="row-fluid">
                <form className="form-inline" onSubmit={this.handleSubmit}>
                {formRErrors.map(error => (
                    <p key={error}>Error: {error}</p>
                ))}
                <div className="form-group">
                    <label htmlFor="tollboothoperator_address" className="control-label">Tollbooth Operator Address</label>
                    <input type="text" className="form-control" id="tollboothoperator_address" placeholder="Tollbooth Operator Address" value={this.state.tollboothoperator_address} onChange={this.handleChange}/>
                </div>
                <button type="submit" className="btn btn-primary">Confirm</button>
                </form>
                </div>
            </div>
        );
    }
}

export default TollboothOperator;
