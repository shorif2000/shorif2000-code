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
            select_tollbooths: null
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
                     console.log(logEvent);
                     const tifOptions = Object.keys(logEvent).map(key => 
                           <option value={logEvent[key].args.tollbooth}>{tifs[key].args.tollbooth}</option>
                     )
                     self.setState({balance, display: 'block'},select_tollbooth: tifOptions);
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

    handleChangeAmount(event) {
        console.log({[event.target.name]: event.target.value});
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        console.log(this);
        const { formRErrors, formEErrors, select_tollbooth, tollbooth, balance, vehicle_address, display, amount, secret } = this.state;

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
                        <button type="submit"  className="btn btn-primary">Confirm</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default Vehicles;

