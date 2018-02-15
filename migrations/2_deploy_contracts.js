var Regulator = artifacts.require("./Regulator.sol");

module.exports = function(deployer, network, accounts) {
    deployer.then(function() {
        return Regulator.new();
    }).then(function(instance) {
        instance.createNewOperator(accounts[1], 1);
    });
};
