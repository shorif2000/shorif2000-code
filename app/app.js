import React from 'react';
import Promise from 'bluebird';
import getWeb3 from './getWeb3';
import 'react-bootstrap/dist/react-bootstrap';
import './stylesheets/app.css';
import { Router, Route, Switch, withRouter } from 'react-router';
import Menu from './components/menu';
import Regulator from './components/regulator';
import TollboothOperator from './components/tollbooth_operator';

class App extends React.Component {
    constructor(props) {
        super(props)        
            this.state = {
                web3: null,
                accounts: []
            }
    }

    passDataBack = (data) => {
        this.setState({
            accounts : data
        });
    }

    componentWillMount() {
        getWeb3
        .then(results => {
            let web3 = results.web3;
            Promise.promisifyAll(web3.eth, { suffix: "Promise"});
            Promise.promisifyAll(web3.version, { suffix: "Promise"});
            let length = web3.eth.accounts.length;
            let accounts = [];
            for(let i = 2; i < length; i++){
                accounts.push(web3.eth.accounts[i]);
            }
            this.setState({web3, accounts});
        })
        .catch(() => {
            console.log('Error finding web3.')
        })
    }

    render() {
        const Main = () => (
            <main>
                <Switch>
                    <Route exact path="/" component={()=><Regulator web3={this.state.web3} accounts={this.state.accounts} passDataBack={this.passDataBack} />} />
                    <Route exact path="/tollboothoperator" component={()=><TollboothOperator web3={this.state.web3} accounts={this.state.accounts} passDataBack={this.passDataBack} />} />
                </Switch>
            </main>
        )

        return (

            <div>
                <Menu />
                <div className="container-fluid">
                    <header className="text-center">
                        <h1 className="">B9Lab Final Exam</h1>
                    </header>
                    <Main/>
                </div>
            </div>
        );
    }
}

export default withRouter((App));
