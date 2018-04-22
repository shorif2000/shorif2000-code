import React, { Component } from 'react';
import Vehicle from './vehicle';
import CreateTollboothOperator from './create_tollbooth';

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
        this.passRegulatorBack = this.passRegulatorBack.bind(this);
    }

    passDataBack(){
        this.props.passDataBack(this.props.accounts);
    }

    passRegulatorBack(){
        const state = this.state;
        this.props.passRegulatorBack({regulator: state});
    }

    instantiateContract = (regulator_address) => {
        const truffleContract = require('truffle-contract');
        const regulatorJson = require("../contracts/Regulator.json");
        const Regulator = truffleContract(regulatorJson);
        Regulator.setProvider(this.props.web3.currentProvider);

        let self = this;
        Regulator.at(regulator_address).then((instance) => {
            regulatorInstance = instance;
            return regulatorInstance.getOwner();
        })
        .then(owner => {
            self.props.web3.eth.filter({
                address: regulator_address,
                from: 0,
                to: 'latest'
            }).get(function (err, result) {
                // callback code here
                console.log(result);
            })

            self.setState({owner: owner, regulator: regulatorInstance});
            self.passRegulatorBack;
        })
        .catch( (error) => {
            console.log('Error locating Regulator ' + error);
            self.setState({formRErrors: ['Error locating Regulator ' + error]});
        });
    }
    componentDidMount(){
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
        this.passRegulatorBack;
    }

    handleSubmit(event) {
        event.preventDefault();

        this.instantiateContract(this.state.regulator_address);
    }

    render() {
        const { formRErrors } = this.state;
        const { regulator, owner } = this.state;
        const isEnabled = owner.length > 0;
        let vehicle = '';
        let operator = '';
        if(isEnabled){
            vehicle = <Vehicle regulator={regulator} owner={owner} web3={this.props.web3} accounts={this.props.accounts} passDataBack={this.props.passDataBack} passVehiclesBack={this.props.passVehiclesBack}/>;
            operator = <CreateTollboothOperator regulator={regulator} owner={owner} web3={this.props.web3} accounts={this.props.accounts} passDataBack={this.props.passDataBack} />;
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
                {operator}
            </div>
        );
    }
}

export default Regulator;

