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
                display: 'none',
                amount: '',
                secret: '',
                formEErrors : [],
                tollbooth: '',
                select_tollbooth: null,
                tollbooth_history: []
            }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSubmitEnter = this.handleSubmitEnter.bind(this);
        this.instantiateContract = this.instantiateContract.bind(this);
        this.passDataBack = this.passDataBack.bind(this);
        this.passRegulatorBack = this.passRegulatorBack.bind(this);
        this.multiplier = '';
        this.vehicleType = '';
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
                        if(vehicleType.toNumber() == 0){
                            return Promise.reject('This vehicle does not exist.') ;
                        }
                        self.vehicleType = vehicleType.toNumber();
                        return tollboothoperator.getMultiplier(vehicleType);
                    })
                .then( multiplier => {
                    if( multiplier.toNumber() != 0){
                        console.log("multiplier" ,multiplier);
                        self.multiplier = multiplier.toNumber();
                    }

                    return self.props.web3.eth.getBalancePromise(vehicle_address);
                })
                .then( bal => {
                    let balance = self.props.web3.fromWei(bal.toNumber(), "ether");
                    tollboothoperator.LogTollBoothAdded( {}, {fromBlock: 0,to:'latest'})
                    .get(function(error,logEvent) {
                        if(error)
                    {
                        console.error(error)
                    } else {
                        var tollbooth_history = [];
                        Object.keys(logEvent).map(key =>
                            tollbooth_history.push(logEvent[key].args.tollBooth)
                            )
                            self.setState({balance, display: 'block',tollbooth_history});
                    }
                    });
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
        this.setState({[event.target.name]: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();

        this.instantiateContract(this.state.vehicle_address);
    }

    handleSubmitEnter(event){
        event.preventDefault();
        const operator = this.props.tollboothoperator.tollboothoperator;
        let self = this;
        let hashed;
        if(this.multiplier == ''){
            console.log("this.vehicleType" , this.vehicleType);
            operator.getMultiplier(this.vehicleType)
                .then( multiplier => {
                    console.log("multiplier", multiplier)
                    if( multiplier.toNumber() == 0){
                        console.log("multiplier" ,multiplier.toNumber());
                        self.multiplier = multiplier.toNumber();
                        return operator.hashSecret(self.state.secret)
                    }
                    return Promise.reject('Multiplier not set for this vehicle type');
                })
            .then(hash => hashed = hash)
                .then( () => operator.enterRoad.call(
                            self.state.tollbooth, hashed, { from: self.state.vehicle_address, value: self.state.amount}) )
                .then(success => {if(success){return }})
                .then(() => operator.enterRoad(
                            self.state.tollbooth, hashed, { from: self.state.vehicle_address, value: self.state.amount} ) )
                .then(tx => {
                    return operator.getVehicleEntry(hashed);
                })
            .then(info => {
                return self.props.web3.eth.getBalancePromise(operator.address);
            })
            .then(balance => console.log( balance.toNumber()))
                .catch( error => {
                    console.log(error);
                    self.setState({formRErrors: ['error has occured']});
                });

        }else{
            operator.hashSecret(this.state.secret)
                .then(hash => hashed = hash)
                .then( () => operator.enterRoad.call(
                            self.state.tollbooth, hashed, { from: self.state.vehicle_address, value: self.state.amount}))
                .then(success => {if(success){return }})
                .then(() => operator.enterRoad(
                            self.state.tollbooth, hashed, { from: self.state.vehicle_address, value: self.state.amount}))
                .then(tx => {
                    return operator.getVehicleEntry(hashed);
                })
            .then(info => {
                return self.props.web3.eth.getBalancePromise(operator.address);
            })
            .then(balance => console.log( balance.toNumber())) 
                .catch( error => {
                    console.log(error);
                    self.setState({formRErrors: ['error has occured']});
                });
        }
    }

    handleChangeAmount(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        console.log(this);
        let { formRErrors, formEErrors, select_tollbooth, tollbooth, balance, vehicle_address, display, amount, secret, tollbooth_history } = this.state;
        if(this.props.tollbooths.length > 0){
            tollbooth_history.push(...this.props.tollbooths);
            const namesArr = tollbooth_history.filter(function(elem, pos) {
                return tollbooth_history.indexOf(elem) == pos;
            });
            tollbooth_history = [...new Set(tollbooth_history)];
        }
        select_tollbooth = Object.keys(tollbooth_history).map(key =>
                <option value={tollbooth_history[key]}>{tollbooth_history[key]}</option>
                )
            return (
                    <div className="container-fluid">
                    <div className="row">
                    <form className="form-inline" onSubmit={this.handleSubmit}>
                    {formRErrors.map(error => (
                            <p key={error}>Error: {error}</p>
                            ))}
                    <div className="form-group">
                    <label htmlFor="vehicle_address" className="control-label">Vehicle Address</label>
                    <input type="text" className="form-control" name="vehicle_address" placeholder="Vehicle Address" value={vehicle_address} onChange={this.handleChange}/>
                    </div>
                    <button type="submit"  className="btn btn-primary">Confirm</button>
                    </form>
                    </div>
                    <div className="row top-buffer" style={{display: display}}>
                    <div className="row top-buffer">
                    <div className="col-xs-2">Balance: </div>
                    <div className="col-xs-10">{balance}</div>
                    </div>
                    <div className="row top-buffer">
                    <form className="form-inline" onSubmit={this.handleSubmitEnter}>
                    {formEErrors.map(error => (
                                <p key={error}>Error: {error}</p>
                                ))}
        <div className="form-group">
            <label htmlFor="amount" className="control-label">Amount to deposit</label>
            <input type="text" className="form-control" name="amount" placeholder="Amoutn to deposit" value={amount} onChange={this.handleChange}/>
            </div>
            <div className="form-group">
            <label htmlFor="secret" className="control-label">Secret</label>
            <input type="text" className="form-control" name="secret" placeholder="Secret" value={secret} onChange={this.handleChange}/>
            </div>
            <div className="form-group">
            <label htmlFor="tollbooth" className="control-label">Tollbooth</label>
            <select value={tollbooth} onChange={this.handleChange} name="tollbooth" className="form-control form-control-inline">
            <option key="" value="">
            -- Select tollbooth --
            </option>
            {select_tollbooth}
        </select> 
            </div>
            <button type="submit"  className="btn btn-primary">Enter Road</button>
            </form>
            </div>
            </div>
            </div>
            );
    }
}

export default Vehicles;

