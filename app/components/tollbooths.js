import React, { Component } from 'react';
const toBytes32 = require('../../utils/toBytes32.js');
let regulatorInstance;
let watchRegulator;
let tollboothoperator;

class Tollbooths extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formRErrors: [],
            tollbooth_address: '',
            display: 'none',
            secret: '',
            formEErrors: [],
            logPendingPayment: [],
	    refund: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSubmitExit = this.handleSubmitExit.bind(this);
        this.instantiateContract = this.instantiateContract.bind(this);
        this.loadHistory = this.loadHistory.bind(this);
    }

    instantiateContract = tollbooth_address => {
        tollboothoperator = this.props.tollboothoperator.tollboothoperator;
        if (tollboothoperator !== undefined) {
            if (!this.props.web3.isAddress(tollbooth_address)) {
                this.setState({ formRErrors: ['Invalid address'] });
                return;
            }
            this.loadHistory();
            if(this.props.tollbooths.indexOf(tollbooth_address) < 0){
                let self = this;
                tollboothoperator.LogTollBoothAdded({}, { fromBlock: 0, to: 'latest' })
                    .get(function(error, logEvent) {
                        if (error) {
                            console.error(error);
                        } else {
                            var tollbooths = [];
                            Object.keys(logEvent).map(key => tollbooths.push(logEvent[key].args.tollBooth));
                            self.setState({ tollbooths });
                            if(tollbooths.indexOf(tollbooth_address) < 0){
                                self.setState({ formRErrors: ['This is not a valid tollbooth.'] , display: 'none'});
                            }

                        }
                    })
            }

            this.setState({ tollbooth: tollbooth_address , formRErrors: [], display: 'block'});
            this.loadHistory();
        } else {
            this.setState({
                formRErrors: ['Load tollbooth operator before use']
            });
        }
    };

    loadHistory() {
        let self = this;
        let exitSecretHashed = '';
        if(this.props.exitSecretHashed){
            exitSecretHashed = this.props.exitSecretHashed;
        }else if(this.state.secret != ''){
            exitSecretHashed = toBytes32(self.state.secret);
        }

        if(exitSecretHashed != ''){	
            tollboothoperator
                .LogPendingPayment({}, { fromBlock: 0, to: 'latest' })
                .get(function(error, logEvent) {
                    if (error) {
                        console.error(error);
                    } else {
                        var logPendingPayment = [];
                        Object.keys(logEvent).map(key => {
                            if (
                                logEvent[key].args.exitSecretHashed == exitSecretHashed
                               ) {
                                   return logPendingPayment.push({
                                       entryBooth: logEvent[key].args.entryBooth,
                                          exitBooth: logEvent[
                                       key
                                       ].args.exitBooth
                                   });
                               }
                        });
                        self.setState({ logPendingPayment });
                    }
                });
        }   
    }

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            formRErrors: error,
        errorInfo: errorInfo
        });
        // You can also log error messages to an error reporting service here
    }
    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }
    handleSubmit(event) {
        event.preventDefault();
        this.instantiateContract(this.state.tollbooth_address);
    }
    handleSubmitExit(event) {
        event.preventDefault();
        const operator = this.props.tollboothoperator.tollboothoperator;
        let self = this;
        const secret32 = toBytes32(this.state.secret);
        let hashed;
        const { secret, tollbooth_address } = this.state;
        if (secret != '') {
            const secret32 = toBytes32(secret);
            operator.isPaused()
                .then( isPaused => {
                    if(isPaused){
                        return operator.setPaused(false,{from: self.props.tollboothoperator.owner});
                    }
                })
            /*.then( () => operator.reportExitRoad.call(secret32, { from: tollbooth_address, gas: 5000000 }) )
                .then(result => {
                    if(result.toNumber() != 1 || result.toNumber() != 2){
                        return Promise.reject('Failed to exit road', result.toNumber());
                    }
                })*/
                .then(() => operator.reportExitRoad(secret32, { from: tollbooth_address , gas: 5000000}))
                .then((tx) => {
		    if(tx.logs[0].event == "LogRoadExited"){
			self.setState({refund: tx.logs[0].args.refundWeis.toNumber()});
		    }
                    self.props.passExitBack();
		     
                })
                .catch(error => {
                    if(typeof(error) === "object"){
                        console.log(error);
                        error = "unknown, check console"
                    }
                    self.setState({ formRErrors: [error] });
                });
        } else {
            self.setState({ formRErrors: ['enter secret'] });
        }
    }
    handleChangeAmount(event) {
        this.setState({ [event.target.name]: event.target.value });
    }
    render() {
        let {
            formRErrors,
                formEErrors,
                tollbooth_address,
                display,
                secret,
        } = this.state;

        return (
                <div className="container-fluid">
                <div className="row">
                <form className="form-inline" onSubmit={this.handleSubmit}>
                {formRErrors.map(error => (
                        <p key={error}>Error: {error}</p>
                        ))}
                <div className="form-group">
                <label
                htmlFor="tollbooth_address"
                className="control-label"
                >
                Tollbooth Address
                </label>
                <input
                type="text"
                className="form-control"
                name="tollbooth_address"
                placeholder="Vehicle Address"
                value={tollbooth_address}
                onChange={this.handleChange}
                />
                    </div>
                    <button type="submit" className="btn btn-primary">
                    Confirm
                    </button>
                    </form>
                    </div>
                    <div className="row top-buffer" style={{ display: display }}>
                    <div className="row top-buffer">
                    <form
                    className="form-inline"
                    onSubmit={this.handleSubmitExit}
                >
                {formEErrors.map(error => (
                            <p key={error}>Error: {error}</p>
                            ))}
                <div className="form-group">
                    <label
                    htmlFor="secret"
                    className="control-label"
                    >
                    Secret
                    </label>
                    <input
                    type="text"
                    className="form-control"
                    name="secret"
                    placeholder="Vehicle Clear Secret"
                    value={secret}
                onChange={this.handleChange}
                />
                    </div>
                    <button type="submit" className="btn btn-primary">
                    Exit Road
                    </button>
                    </form>
                    </div>
                    </div>
                    <div>
                    <div>
                    <div className="col-xs-6">
                    <div className="row">refund</div>
                    <div className="row">
                    <pre>
                    {JSON.stringify(
                            this.state.refund,
                            null,
                            2
                            )}
                </pre>
                    </div>
                    </div>
                    </div>
                    </div>
                    </div>
                    );
    }
}
export default Tollbooths;

