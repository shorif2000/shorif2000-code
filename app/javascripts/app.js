import React from 'react';
import Promise from 'bluebird';
import getWeb3 from '../getWeb3';
import 'react-bootstrap/dist/react-bootstrap';
import '../stylesheets/app.css';

class App extends React.Component {
	constructor(props) {
		super(props)        
		this.state = {
			web3: null,
            regulator: '',
            owner: '',
			formRErrors: []
		}
        this.handleChange = this.handleChange.bind(this);
    	this.handleSubmit = this.handleSubmit.bind(this);
        this.instantiateContract = this.instantiateContract.bind(this);
	}

	instantiateContract = (regulator_address) => {
    	const truffleContract = require('truffle-contract');
        const regulatorJson = require("../contracts/Regulator.json");
    	const Regulator = truffleContract(regulatorJson);
    	Regulator.setProvider(this.state.web3.currentProvider);

        // TODO: build UI to load Regulator at address
		let self = this;
        Regulator.at(regulator_address).then((instance) => {
            const regulatorInstance = instance;
			Promise.promisifyAll(regulatorInstance, { suffix: "Promise"});
            console.log(regulatorInstance);

			regulatorInstance.getOwner()
			.then(owner => {
				console.log('owner', owner);
				self.setState({owner: owner});
			});
        })
        .catch(() => {
            console.log('Error locating Regulator');
			self.setState({formRErrors: ['Error locating Regulator']});
        });
	}

	componentWillMount() {
		getWeb3
		.then(results => {
            let web3 = results.web3;
            Promise.promisifyAll(web3.eth, { suffix: "Promise"});
            Promise.promisifyAll(web3.version, { suffix: "Promise"});

		    this.setState({
			    web3: web3
			})

		})
		.catch(() => {
			console.log('Error finding web3.')
		})
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
    	this.setState({regulator: event.target.value});
  	}

    handleSubmit(event) {
    	event.preventDefault();
		this.instantiateContract(this.state.regulator);
	}	

	render() {
		const { formRErrors } = this.state;
		console.log(this);
		return (
            <div className="App">
				<header className="App-header">
				    <h1 className="App-title">B9Lab Final Exam</h1>
				</header>
                <div className="container-fluid">
                <form className="form-inline" onSubmit={this.handleSubmit}>
					{formRErrors.map(error => (
        				<p key={error}>Error: {error}</p>
        			))}
				  <div className="form-group mb-2">
				    <label htmlFor="regulator_address" className="sr-only">Regulaotr Address</label>
				    <input type="text" className="form-control" id="regulator_address" placeholder="Regulator Address" value={this.state.regulator} onChange={this.handleChange}/>
				  </div>
				  <button type="submit" className="btn btn-primary mb-2">Confirm</button>
				</form>
                </div>
            </div>
        );
	}
}

export default App;
