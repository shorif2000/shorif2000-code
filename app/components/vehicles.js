import React, { Component } from 'react';

let regulatorInstance;
let watchRegulator;

class Vehicles  extends Component {

    constructor(props) {
        super(props)
        this.state = {
            balance: null,
            formRErrors: [],
            vehicle_address: '',
            display: 'none'
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
        const regulator = this.props.regulator.regulator;
        const tollboothoperator = this.props.tollboothoperator.tollboothoperator;
        if(regulator !== undefined){
            if(tollboothoperator !== undefined){
            if(!this.props.web3.isAddress(vehicle_address)){
                this.setState({formRErrors:['Invalid address']});
                return;
            }
            let self = this;
            regulator.getVehicleType(vehicle_address)
            .then( vehicleType => {
                if(vehicleType == 0){
                    return Promise.reject('This vehicle does not exist.') ;
                }
                
                return self.props.web3.eth.getBalance(vehicle_address);
/* => {
      if (err) {
        console.log(`getBalance error: ${err}`);
        self.setState({formRErrors:['get balance erro ' + err]});
      } else {
        balance = bal;
        console.log(`${self.props.web3.fromWei(balance, "ether")}`);

      }
    });
                var balance = self.props.web3.eth.getBalance(vehicle_address);
                console.log(balance.toNumber());
                balance = self.props.web3.toDecimal(balance);
                console.log(balance);
*/
            })
            .then( bal => {
                let balance = self.props.web3.fromWei(bal.toNumber(), "ether");
                self.setState({balance, display: 'block'});  
            })
            .catch( (error) => {
                console.log(error)
                self.setState({formRErrors: 'error has occured'});
            });

            }else{
                this.setState({formRErrors:['Load tollbooth operator before use']});
            }
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
        this.setState({vehicle_address: event.target.value});
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
                <div className="row">
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
                <div className="row top-buffer" style={{display: this.state.display}}>
                    <div className="col-xs-2">Balance: </div>
                    <div className="col-xs-10">{this.state.balance}</div>
                </div>
                <div className="row top-buffer">
                </div>
            </div>
        );
    }
}

export default Vehicles;

