import React, { Component } from 'react';

class CreateTollboothOperator extends Component {

    constructor(props) {
        super(props);
        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleChangeDeposit = this.handleChangeDeposit.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            valueAddress: '',
            deposit: '',
            operators: [],
        }
        this.accounts = [];
    }

    passDataBack = () => {
        this.props.passDataBack(this.accounts);
    }

    componentWillMount(){
        this.accounts = this.props.accounts;
        this.setState({valueAddress: this.accounts[0]});
    }

    handleChangeAddress(event){
        this.setState({valueAddress : event.target.value});
    }

    handleChangeDeposit(event){
        this.setState({deposit : event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        const { regulator, owner } = this.props;
        let self = this;
        console.log(owner);console.log(this.state.deposit);
        regulator.createNewOperator(owner, this.state.deposit, { from : owner })
        .then( tx => {
            console.log(tx);
            let accounts = self.accounts.filter(function(e) { return e !== self.state.valueAddress });
            self.passDataBack();
            let operators = self.state.operators;
            operators.push({address: self.state.valueAddress, deposit: self.state.deposit});
            self.setState({operators, valueAddress: self.accounts[0]});
        });    
        
    }

    displayAssigned(){
        return (
            <pre>{JSON.stringify(this.state.operators, null, 2) }</pre>
        );
    }

    render(){
        this.accounts = this.props.accounts;
        let options = this.accounts.map((option, index) => (
            <option key={option} value={option}>
                {option}
            </option>
        ));

        return(
            <div className="row top-buffer">
                <h2>Operator List</h2>
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
                            <label className="control-label col-sm-2">Deposit:</label>
                            <div className="col-sm-10">
                                <input type="text" name="deposit" onChange={this.handleChangeDeposit} />
                            </div>
                        </div>
                        <div className="col-sm-offset-2 col-sm-10 ">
                            <button type="submit" className="btn btn-success">Create</button>
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

export default CreateTollboothOperator;
