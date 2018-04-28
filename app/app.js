import React from 'react';
import Promise from 'bluebird';
import getWeb3 from './getWeb3';
import 'react-bootstrap/dist/react-bootstrap';
import './stylesheets/app.css';
import Menu from './components/menu';
import Regulator from './components/regulator';
import TollboothOperator from './components/tollbooth_operator';
import Vehicles from './components/vehicles';
import Tollbooths from './components/tollbooths';

class App extends React.Component {
    constructor(props) {
        super(props)        
            this.state = {
                web3: null,
                accounts: [],
                showPage: 'page1',
                vehicles: [],
                regulator : {},
                watchRegulator: {},
                tollboothoperator: {},
                tollbooths: []
            }
            this.handleDisplayPage = this.handleDisplayPage.bind(this);
    }

    passDataBack = (data) => {
        this.setState({
            accounts : data
        });
    }

    passVehiclesBack = (data) => {
        this.setState({
             vehicles : data
        });
    }

    passRegulatorBack = (data) => {
        /*let watchRegulator = data.regulator.regulator.allEvents().watch((error, result) => {
            console.log(error);
            console.log(result);
        });*/
        this.setState({regulator: data.regulator});
    }

    passTollboothOperatorBack = (data) => {
        let self = this;
        let watchTollbooth = data.tollboothoperator.tollboothoperator.allEvents().watch((error, result) => {
            //console.log(error);
            //console.log(result);
            if(result.event == "LogTollBoothAdded"){
                let tollbooths = self.state.tollbooths;
                tollbooths.push(result.args.tollBooth);
                self.setState({tollbooths});
            }
        });
	let self = this;
        tollboothoperator
        .LogTollBoothAdded({}, { fromBlock: 0, to: 'latest' })
        .get(function(error, logEvent) {
            if (error) {
                console.error(error);
            } else {
                var tollbooths = [];
                Object.keys(logEvent).map(key => tollbooths.push(logEvent[key].args.tollBooth));
                self.setState({ tollbooths });
            }
        });
        this.setState({tollboothoperator: data.tollboothoperator});
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

    handleDisplayPage(e){
        e.preventDefault();
        const page = e.currentTarget.id;
        this.setState({ showPage: page });
    }

    render() {
        let style1 = 'block';
        let style2 = 'none';
        let style3 = 'none';
        let style4 = 'none';
        if(this.state.showPage == 'page1'){
            style1 = 'block';
            style2 = 'none';
            style3 = 'none';
            style4 = 'none';
        }else if(this.state.showPage == 'page2'){
            style1 = 'none';
            style2 = 'block';
            style3 = 'none';
            style4 = 'none';
        }else if(this.state.showPage == 'page3'){
            style1 = 'none';
            style2 = 'none';
            style3 = 'block';
            style4 = 'none';
        }else if(this.state.showPage == 'page4'){
            style1 = 'none';
            style2 = 'none';
            style3 = 'none';
            style4 = 'block';
        }


        return (

            <div>
                <Menu displaypage={this.handleDisplayPage}/>
                <div className="container-fluid">
                    <header className="text-center">
                        <h1 className="">B9Lab Final Exam</h1>
                    </header>
                    <div style={{display: style1}}>
                        <Regulator web3={this.state.web3} accounts={this.state.accounts} passDataBack={this.passDataBack} passRegulatorBack={this.passRegulatorBack} passVehiclesBack={this.passVehiclesBack} /> 
                    </div>
                    <div style={{display: style2}}>
                        <TollboothOperator web3={this.state.web3} accounts={this.state.accounts} vehicles={this.state.vehicles} passDataBack={this.passDataBack} passVehiclesBack={this.passVehiclesBack} passTollboothOperatorBack={this.passTollboothOperatorBack} regulator={this.state.regulator.regulator} />
                    </div>
                    <div style={{display: style3}}>
                        <Vehicles web3={this.state.web3} accounts={this.state.accounts} passDataBack={this.passDataBack} vehicles={this.state.vehicles} regulator={this.state.regulator} tollboothoperator={this.state.tollboothoperator} tollbooths={this.state.tollbooths}/> 
                    </div>
                    <div style={{display: style4}}>
			<Tollbooths web3={this.state.web3} tollboothoperator={this.state.tollboothoperator} />
                    </div>
                </div>
            </div>
        );
    }
}

export default (App);
