import React from 'react';
import Promise from 'bluebird';
import getWeb3 from './getWeb3';
import 'react-bootstrap/dist/react-bootstrap';
import './stylesheets/app.css';
import Regulator from './components/regulator';

class App extends React.Component {
    constructor(props) {
        super(props)        
            this.state = {
                web3: null,
            }
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

    render() {

        return (
            <div className="container-fluid">
                <header className="text-center">
                    <h1 className="">B9Lab Final Exam</h1>
                </header>
                <Regulator web3={this.state.web3} />
            </div>
        );
    }
}

export default App;
