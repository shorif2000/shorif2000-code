import React from 'react';
import Promise from 'bluebird';
import getWeb3 from '../getWeb3';
import '../stylesheets/app.css';

class App extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			web3: null
		}
	}

	instantiateContract = () => {
    	const truffleContract = require('truffle-contract');
        const regulatorJson = require("../contracts/Regulator.json");
    	const Regulator = truffleContract(regulatorJson);
    	Regulator.setProvider(this.state.web3.currentProvider);

        // TODO: build UI to load Regulator at address
        Regulator.at('0x061fe979d112926352c13d01ca66bcebf685d2df').then((instance) => {
            const regulatorInstance = instance;
			Promise.promisifyAll(regulatorInstance, { suffix: "Promise"});
            console.log(regulatorInstance);

			regulatorInstance.getOwner()
			.then(owner => {
				console.log('owner', owner);
			});
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

			this.instantiateContract();
		})
		.catch(() => {
			console.log('Error finding web3.')
		})
	}

	render() {
		return (
            <div className="App">
				<header className="App-header">
				    <h1 className="App-title">B9Lab Final Exam</h1>
				</header>
				<p className="App-body">
                    -
				</p>
            </div>
        );
	}
}

export default App;
