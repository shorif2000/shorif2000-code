import React, { Component } from 'react';

class Tollbooth extends Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.passDataBack = this.passDataBack.bind(this);
        this.state = {
            tollbooths: [],
            address: '',
            formRErrors: []
        }
        this.accounts = [];
    }

    passDataBack = () => {
        this.props.passDataBack(this.accounts);
    }

    componentWillMount(){
        this.accounts = this.props.accounts;
        this.setState({address: this.props.accounts[0]});
    }

    handleChangeAddress(event){
        this.setState({address : event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        let tollboothoperator = this.props.tollboothoperator;
        let owner = this.props.owner;
        let self = this;
        tollboothoperator.isTollBooth(this.state.address)
        .then( isIndeed => {
            if(!isIndeed){
                return tollboothoperator.addTollBooth(this.state.address, { from : owner }) 
            }
            self.accounts = self.accounts.filter(function(e) { return e !== self.state.address });
            self.passDataBack();
            let tollbooths = self.state.tollbooths;
            tollbooths.push({address: self.state.address});
            self.setState({tollbooths, address : self.accounts[0]});
            return Promise.reject('Tollbooth exists.') ;
        })
        .then( tx => {
            self.accounts = self.accounts.filter(function(e) { return e !== self.state.address });
            self.passDataBack();
            let tollbooths = self.state.tollbooths;
            tollbooths.push({address: self.state.address});
            self.setState({tollbooths, address : self.accounts[0]});
        })
        .catch( (error) => {
            console.log(error);
            self.setState({formRErrors: [error]});
        });    
        
    }

    displayAssigned(){
        return (
            <pre>{JSON.stringify(this.state.tollbooths, null, 2) }</pre>
        );
    }

    render(){
        console.log(this)
        const { formRErrors } = this.state;

        let options = this.accounts.map((option, index) => (
            <option key={option} value={option}>
                {option}
            </option>
        ));

        return(
            <div className="row top-buffer">
                <h2>Tollbooth List</h2>                
                <div className="col-xs-10 col-sm-3 col-md-4">
                <div className="row-fluid">
                    <form onSubmit={this.handleSubmit} className="form-horizontal">
                        {formRErrors.map(error => (
                            <p key={error}>Error: {error}</p>
                        ))}
                        <div className="form-group">
                            <label className="control-label col-sm-2">Available Addresses:</label>
                            <div className="col-sm-10">
                            <select value={this.state.address} onChange={this.handleChangeAddress} name="available_addresses" className="form-control form-control-inline">
                            {options}
                            </select>
                            </div>
                        </div>
                        <div className="col-sm-offset-2 col-sm-10 ">
                            <button type="submit" className="btn btn-success">Add</button>
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

export default Tollbooth;
