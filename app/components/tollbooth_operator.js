import React, { Component } from 'react';
import Tollbooth from './tollbooth';

let tollBoothOperatorInstance;

class TollboothOperator extends Component {
    constructor(props){
        super(props);
        this.state = {
            tollboothoperator_address: '',
            owner: '',
            tollboothoperator: '',
            formRErrors: []
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.instantiateOperator = this.instantiateOperator.bind(this);
    }

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            formRErrors: error,
            errorInfo: errorInfo
        })
        // You can also log error messages to an error reporting service here
    }

    instantiateOperator = (tollboothoperator_address) => {
        const truffleContract = require('truffle-contract');
        const tollBoothOperatorJson = require("../contracts/TollBoothOperator.json");
        const TollBoothOperator = truffleContract(tollBoothOperatorJson);
        TollBoothOperator.setProvider(this.props.web3.currentProvider);

        let self = this;
        TollBoothOperator.at(tollboothoperator_address).then((instance) => {
            tollBoothOperatorInstance = instance;
            console.log(tollBoothOperatorInstance);
            return tollBoothOperatorInstance.getOwner();
        })
        .then(owner => {
            console.log('owner', owner);
            self.setState({owner, tollboothoperator : tollBoothOperatorInstance});
        })
        .catch( (error) => {
            console.log('Error locating Tollbooth Operator ' + error);
            self.setState({formRErrors: ['Error locating Regulator ' + error]});
        });
    }

    handleSubmit(event){
        event.preventDefault();
        this.instantiateOperator(this.state.tollboothoperator_address);
    }

    handleChange(event) {
        this.setState({tollboothoperator_address: event.target.value});
    }

    render(){        
        console.log(this);
        const { formRErrors } = this.state;
        const { tollboothoperator, owner } = this.state;
        const isEnabled = owner.length > 0;
        let tollbooth = '';
        if(isEnabled){
            tollbooth = <Tollbooth tollboothoperator={tollboothoperator} owner={owner} web3={this.props.web3} accounts={this.props.accounts} passDataBack={this.props.passDataBack} />
        }

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
                {tollbooth}
            </div>
        );
    }
}

export default TollboothOperator;
