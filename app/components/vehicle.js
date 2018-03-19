import React, { Component } from 'react';

class Vehicle extends Component {

    constructor(props) {
        super(props);
        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleChangeVehicle = this.handleChangeVehicle.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            vehicleTypes : [{id: 1, type: 'motorbike'}, {id:2,type:'car'}, {id: 3, type: 'lorry'}],
            valueAddress: '',
            valueVehicle: '1',
            vehicles: [],
            accounts: []
        }
    }

    componentWillMount(){
        let length = this.props.web3.eth.accounts.length; 
        let accounts = [];
        for(let i = 2; i < length; i++){
            accounts.push(this.props.web3.eth.accounts[i]);
        }

        this.setState({accounts, valueAddress: accounts[0]});
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
        console.log(this.state.valueAddress + ' : '  + this.state.valueVehicle);
        regulator.setVehicleType(this.state.valueAddress, this.state.valueVehicle, { from : owner })
        .then( tx => {
            console.log(tx);
            let accounts = self.state.accounts.filter(function(e) { return e !== self.state.valueAddress });
            let vehicles = [];
            vehicles.push({address: self.state.valueAddress, type: self.state.valueVehicle});
            self.setState({accounts, vehicles, valueAddress: accounts[0]});
        });    
        
    }

    displayAssigned(){
        return (
            <pre>{JSON.stringify(this.state.vehicles, null, 2) }</pre>
        );
    }

    render(){
        let options = this.state.accounts.map((option, index) => (
            <option key={option} value={option}>
                {option}
            </option>
        ));

        let vehicleOptions = this.state.vehicleTypes.map((option, index) => (
            <option key={option.id} value={option.id}>
                {option.type}
            </option>
        ));
    
        console.log(this);
        return(
            <div className="row-fluid top-buffer">
                <h2>Vehicle List</h2>
                <div className="col-xs-10 col-sm-3 col-md-4">
                <div className="row-fluid">
                    <form onSubmit={this.handleSubmit} className="form-horizontal">
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
