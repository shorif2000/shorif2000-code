import React, { Component } from 'react';
//var Accounts = require('web3-eth-accounts');

let regulatorInstance;

class Regulator extends Component {

    constructor(props) {
        super(props)
        this.state = {
            regulator: '',
            owner: '',
            formRErrors: []
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.instantiateContract = this.instantiateContract.bind(this);
    }

    instantiateContract = (regulator_address) => {
        const truffleContract = require('truffle-contract');
        const regulatorJson = require("../contracts/Regulator.json");
        const Regulator = truffleContract(regulatorJson);
        Regulator.setProvider(this.props.web3.currentProvider);

        let self = this;
        Regulator.at(regulator_address).then((instance) => {
            regulatorInstance = instance;
            console.log(regulatorInstance);
            return regulatorInstance.getOwner();
        })
        .then(owner => {
            console.log('owner', owner);
            self.setState({owner: owner, regulator: regulatorInstance});
        })
        .catch( (error) => {
            console.log('Error locating Regulator ' + error);
            self.setState({formRErrors: ['Error locating Regulator ' + error]});
        });
    }

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            formRErrors: error,
            errorInfo: errorInfo
        })
        // You can also log error messages to an error reporting service here
    }

    handleChange(event) {
        this.setState({regulator: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();

        this.instantiateContract(this.state.regulator);
    }

    render() {
        const { formRErrors } = this.state;
        const { owner } = this.state;
        const isEnabled = owner.length > 0;
        console.log(this);

        

        return (
            <div className="container-fluid">
                <form className="form-inline" onSubmit={this.handleSubmit}>
                {formRErrors.map(error => (
                    <p key={error}>Error: {error}</p>
                ))}
                <div className="form-group mb-2">
                    <label htmlFor="regulator_address" className="sr-only">Regulaotr Address</label>
                    <input type="text" readOnly={isEnabled} className="form-control" id="regulator_address" placeholder="Regulator Address" value={this.state.regulator} onChange={this.handleChange}/>
                </div>
                <button type="submit" disabled={isEnabled} className="btn btn-primary mb-2">Confirm</button>
                </form>
            </div>
        );
    }
}

export default Regulator;

