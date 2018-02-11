var Regulator = artifacts.require("./Regulator.sol");

module.exports = function(deployer, networks, accounts) {
  //deployer.deploy(Regulator);
  deployer.then(function() {
    return Regulator.deployed();
  }).then(function(instance) {
    // Set the new instance of A's address on B via B's setA() function.
    return instance.createNewOperator(true,1,accounts[1]);
  });
};
