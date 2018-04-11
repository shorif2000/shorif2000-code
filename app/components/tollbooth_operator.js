import React, { Component } from 'react';

class TollboothOperator extends Component {
    constructor(props){
        super(props);
        this.state = {
            tollboothoperator_address: '',
            formRErrors: []
        }
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            formRErrors: error,
            errorInfo: errorInfo
        })
        // You can also log error messages to an error reporting service here
    }

    handleSubmit(){

    }

    handleChange(event) {
        this.setState({tollboothoperator_address: event.target.value});
    }

    render(){        
        const { formRErrors } = this.state;
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
