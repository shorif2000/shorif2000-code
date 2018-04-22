import React, { Component } from 'react';

class Tollbooth extends Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSubmitSet = this.handleSubmitSet.bind(this);
        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleChangeFrom = this.handleChangeFrom.bind(this);
        this.handleChangeTo = this.handleChangeTo.bind(this);
        this.handleChangePrice = this.handleChangePrice.bind(this);
        this.passDataBack = this.passDataBack.bind(this);
        this.state = {
            tollbooths: [],
            address: '',
            formErrors: [],
            formRErrors: [],
            from: '',
            to: '',
            price:'',
            baserouteprice: []
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

    handleChangeFrom(event){
        this.setState({from : event.target.value});
    }

    handleChangeTo(event){
        this.setState({to : event.target.value});
    }

    handleChangePrice(event){
        this.setState({price : event.target.value});
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
            self.setState({formErrors: [error]});
        });    
        
    }

    handleSubmitSet(event) {
        event.preventDefault();
        let { price, from, to } = this.state;
        price = parseInt(price);
        if(isNaN(price) && (function(x) { return (x | 0) === x; })(parseFloat(price))){
            alert("Price is not a number " + price);
            return;
        }
        const { owner, tollboothoperator } = this.props;
        let self = this;
        console.log(this.state)
        tollboothoperator.isTollBooth(from)
        .then( isIndeed => {
            if(!isIndeed){
                return Promise.reject('Not a tollbooth.') ;
            }
            return tollboothoperator.isTollBooth(to)
        })
        .then( isIndeed => {
            if(!isIndeed){
                return Promise.reject('Not a tollbooth.') ;
            }
            return tollboothoperator.setRoutePrice(from, to, price, { from: owner })
        })
        .then( isSuccess => { 
            console.log(isSuccess);
            if(!isSuccess){return Promise.reject('Failed to set route price.') ;} 
            let baserouteprice = self.state.baserouteprice;
            baserouteprice.push({sender:owner,from:from,to:to,price:price});
            self.setState({baserouteprice});
        })
        .catch( (error) => {
            console.log(error);
            self.setState({formRErrors: ["error has occured"]});
            
        });

    }


    displayAssigned(object){
        if(object.length > 0){
            return (
                <pre>{JSON.stringify(object, null, 2) }</pre>
            );
        }
    }

    render(){
        const { formErrors, formRErrors, tollbooths } = this.state;

        let options = this.accounts.map((option, index) => (
            <option key={option} value={option}>
                {option}
            </option>
        ));

        let from = tollbooths.map((option, index) => (
            <option key={option.address} value={option.address}>
                {option.address}
            </option>
        ));


        return(
                <div>
            <div className="row top-buffer">
                <h2>Tollbooth List</h2>                
                <div className="col-xs-10 col-sm-3 col-md-4">
                <div className="row-fluid">
                    <form onSubmit={this.handleSubmit} className="form-horizontal">
                        {formErrors.map(error => (
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
                    <div>{this.displayAssigned(this.state.tollbooths)}</div>
                </div>                
            </div>
            <div className="row top-buffer">
                <h2>Set Route price</h2>
                <form onSubmit={this.handleSubmitSet} className="form-horizontal">
                    {formRErrors.map(error => (
                            <p key={error}>Error: {error}</p>
                        ))}

                <div className="form-group col-xs-6 col-md-3">
                    <label className="control-label col-sm-2">from:</label>
                    <div className="col-sm-10">
                        <select value={this.state.from} onChange={this.handleChangeFrom} name="from" className="form-control form-control-inline">
                            <option key="" value="">
                                -- Select tollbooth --
                            </option>
                            {from}
                        </select>
                    </div>
                </div>
                <div className="form-group col-xs-6 col-md-3">
                    <label className="control-label col-sm-2">from:</label>
                    <div className="col-sm-10">
                        <select value={this.state.to} onChange={this.handleChangeTo} name="to" className="form-control form-control-inline">
                            <option key="" value="">
                                -- Select tollbooth --
                            </option>
                            {from}
                        </select>
                    </div>
                </div>
                <div className="form-group col-xs-6 col-md-3">
                    <label className="control-label col-sm-2">price:</label>
                    <div className="col-sm-10">
                        <input type="text" name="price" value={this.state.price} onChange={this.handleChangePrice} />
                    </div>
                </div>
                <div className="col-xs-6 col-md-3">
                    <h3>Assigned</h3>
                    <div>{this.displayAssigned(this.state.baserouteprice)}</div>
                </div>
                <div className="row col-sm-offset-2 col-sm-10 ">
                    <button type="submit" className="btn btn-success">Set</button>
                </div>
                </form>
            </div>
            </div>
        );
    }
}

export default Tollbooth;
