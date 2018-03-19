import React, { Component } from 'react';
import Vehicle from './vehicle';
//var Accounts = require('web3-eth-accounts');

let regulatorInstance;

class Regulator extends Component {

    constructor(props) {
        super(props)
        this.state = {
            regulator: '',
            regulator_address: '',
            owner: '',
            formRErrors: []
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.instantiateContract = this.instantiateContract.bind(this);
        this.passDataBack = this.passDataBack.bind(this);
    }

    passDataBack(){
        this.props.passDataBack(this.props.accounts);
    }

    instantiateContract = (regulator_address) => {
        const truffleContract = require('truffle-contract');
        const regulatorJson = require("../contracts/Regulator.json");
        const Regulator = truffleContract(regulatorJson);
        Regulator.setProvider(this.props.web3.currentProvider);

        let self = this;
        console.log(regulator_address);
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
        this.setState({regulator_address: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();

        this.instantiateContract(this.state.regulator_address);
    }

    render() {
        const { formRErrors } = this.state;
        const { regulator, owner } = this.state;
        const isEnabled = owner.length > 0;
        console.log(this);
        let vehicle = '';
        if(isEnabled){
            vehicle = <Vehicle regulator={regulator} owner={owner} web3={this.props.web3} accounts={this.props.accounts} passDataBack={this.props.passDataBack} />;
        }

        return (
            <div className="container-fluid">
                <div className="row-fluid">
                <form className="form-inline" onSubmit={this.handleSubmit}>
                {formRErrors.map(error => (
                    <p key={error}>Error: {error}</p>
                ))}
                <div className="form-group">
                    <label htmlFor="regulator_address" className="control-label">Regulator Address</label>
                    <input type="text" readOnly={isEnabled} className="form-control" id="regulator_address" placeholder="Regulator Address" value={this.state.regulator_address} onChange={this.handleChange}/>
                </div>
                <button type="submit" disabled={isEnabled} className="btn btn-primary">Confirm</button>
                </form>
                </div>
                {vehicle}
            </div>
        );
    }
}

export default Regulator;

