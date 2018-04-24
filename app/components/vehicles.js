import React, { Component } from 'react';

let regulatorInstance;
let watchRegulator;

class Vehicles  extends Component {

    constructor(props) {
        super(props)
        this.state = {
            balance: null,
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
        this.props.passRegulatorBack({regulator: state, watchRegulator: watchRegulator});
    }

    instantiateContract = (vehicle_address) => {
        const { regulator, owner } = this.props.regulator;
        if(regulator !== undefined){
            let self = this;
            regulator.getVehicleType(vehicle_address)
            .then( vehicleType => {
                if(vehicleType == 0){
                    return Promise.reject('This vehicle does not exist.') ;
                }
                /*
                self.props.web3.eth.getBalance(vehicle_address , (err, bal) => {
      if (err) {
        console.log(`getBalance error: ${err}`);
      } else {
        balance = bal;
        console.log(`Balance [${address}]: ${self.props.web3.fromWei(balance, "ether")}`);
      }
    });*/
                var balance = self.props.web3.eth.getBalance(vehicle_address);
                console.log(balance.toNumber());
                balance = self.props.web3.toDecimal(balance);
                console.log(balance);
            })
            .then( tx  => {
                //let balance = self.props.web3.fromWei(bal, "ether");
                console.log(tx)
                //self.setState({balance});
            })
            .catch( (error) => {
                console.log(error)
                self.setState({formRErrors: 'error has occured'});
            });

            
        }else{
            this.setState({formRErrors:['Load regulator before use']});
        }
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

        this.instantiateContract(this.state.vehicle_address);
    }

    render() {
        console.log(this);
        const { formRErrors } = this.state;

        return (
            <div className="container-fluid">
                <div className="row-fluid">
                <form className="form-inline" onSubmit={this.handleSubmit}>
                {formRErrors.map(error => (
                    <p key={error}>Error: {error}</p>
                ))}
                <div className="form-group">
                    <label htmlFor="vehicle_address" className="control-label">Vehicle Address</label>
                    <input type="text" className="form-control" id="vehicle_address" placeholder="Vehicle Address" value={this.state.vehicle_address} onChange={this.handleChange}/>
                </div>
                <button type="submit"  className="btn btn-primary">Confirm</button>
                </form>
                </div>
            </div>
        );
    }
}

export default Vehicles;

