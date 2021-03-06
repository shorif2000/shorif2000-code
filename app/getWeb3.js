import Web3 from 'web3';

let getWeb3 = new Promise(function(resolve, reject) {
    window.addEventListener('load', function() {
        var results;
        var web3 = window.web3;

        if (typeof web3 !== 'undefined') {
            // Use Mist/MetaMask's provider
            web3 = new Web3(web3.currentProvider);

            results = {
                web3: web3
            }

            console.log('Injected web3 detected.');

            resolve(results);
        } else {
            // Use local connection
            var provider = new Web3.providers.HttpProvider(window.location.protocol + '//' + window.location.hostname+':8545');

            web3 = new Web3(provider);
            let account0 = web3.eth.accounts[0]; //owner of regulator
            let account1 = web3.eth.accounts[1]; // owner of tollboothoperator
            console.log("Deployed Owner of Regulator: " + account0);
            console.log("Deployed Owner of TollboothOperaotr: " + account1);
            console.log("Total accounts on chain: " + web3.eth.accounts.length);
            results = {
                web3: web3
            }

            console.log('No web3 instance injected, using local web3.');

            resolve(results);
        }
    })
})

export default getWeb3;
