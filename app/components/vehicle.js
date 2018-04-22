import React, { Component } from 'react';

class Vehicle extends Component {

    constructor(props) {
        super(props);
        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleChangeVehicle = this.handleChangeVehicle.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.passDataBack = this.passDataBack.bind(this);
        this.passVehiclesBack = this.passVehiclesBack.bind(this);
        this.state = {
            vehicleTypes : [{id: 1, type: 'motorbike'}, {id:2,type:'car'}, {id: 3, type: 'lorry'}],
            valueAddress: '',
            valueVehicle: '1',
            vehicles: [],
            formRErrors: []
        }
        this.accounts = [];
    }

    passDataBack = () => {
        this.props.passDataBack(this.accounts);
    }
    
    passVehiclesBack = (vehicles) => {
        console.log("passVehiclesBack");
        console.log(vehicles);
        this.props.passVehiclesBack(vehicles);
    }

    componentWillMount(){
        this.accounts = this.props.accounts;
        this.setState({valueAddress: this.props.accounts[0]});
    }

    handleChangeAddress(event){
        this.setState({valueAddress : event.target.value});
    }

    handleChangeVehicle(event){
        this.setState({valueVehicle : event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        let regulator = this.props.regulator;
        let owner = this.props.owner;
        let self = this;
        regulator.getVehicleType(this.state.valueAddress)
        .then( vehicleType => {
            if(vehicleType == 0){
                return vehicleType; 
            }
            self.accounts = self.accounts.filter(function(e) { return e !== self.state.valueAddress });
            self.passDataBack();
            let vehicles = self.state.vehicles;
            vehicles.push({address: self.state.valueAddress, type: vehicleType});
            self.passVehiclesBack(vehicles);
            self.setState({vehicles, valueAddress: self.accounts[0]});
            return Promise.reject('This vehicle exists.') ;
        })
        .then( vehicleType => {
            return regulator.setVehicleType(this.state.valueAddress, this.state.valueVehicle, { from : owner });
        })
        .then( tx => {
            self.accounts = self.accounts.filter(function(e) { return e !== self.state.valueAddress });
            self.passDataBack();
            let vehicles = self.state.vehicles;
            vehicles.push({address: self.state.valueAddress, type: self.state.valueVehicle});
            self.passVehiclesBack(vehicles);
            self.setState({vehicles, valueAddress: self.accounts[0]});
        })
        .catch( (error) => {
            console.log(error);
            self.setState({formRErrors: [error]});
        });
        
    }

    displayAssigned(){
        return (
            <pre>{JSON.stringify(this.state.vehicles, null, 2) }</pre>
        );
    }

    render(){
        const { formRErrors } = this.state;
        let options = this.accounts.map((option, index) => (
            <option key={option} value={option}>
                {option}
            </option>
        ));

        let vehicleOptions = this.state.vehicleTypes.map((option, index) => (
            <option key={option.id} value={option.id}>
                {option.type}
            </option>
        ));
    
        return(
            <div className="row top-buffer">
                <h2>Vehicle List</h2>
                <div className="col-xs-10 col-sm-3 col-md-4">
                <div className="row-fluid">
                    <form onSubmit={this.handleSubmit} className="form-horizontal">
                        {formRErrors.map(error => (
                            <p key={error}>Error: {error}</p>
                        ))}
                        <div className="form-group">
                            <label className="control-label col-sm-2">Available Addresses:</label>
                            <div className="col-sm-10">
                            <select value={this.state.valueAddress} onChange={this.handleChangeAddress} name="available_addresses" className="form-control form-control-inline">
                            {options}
                            </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label col-sm-2">Set as vehicle:</label>
                            <div className="col-sm-10">
                            <select value={this.state.valueVehicle} onChange={this.handleChangeVehicle} name="vehicles" className="form-control form-control-inline">
                            {vehicleOptions}
                            </select>
                            </div>
                        </div>
                        <div className="col-sm-offset-2 col-sm-10 ">
                            <button type="submit" className="btn btn-isuccess">Add</button>
                        </div>
                    </form>
                </div>
                </div>
                <div className="col-xs-2 col-sm-6 col-md-8">
                    <h3>Assigned</h3>
                    <div>{this.displayAssigned()}</div>
                </div>
            </div>
        );
    }
}

export default Vehicle;
