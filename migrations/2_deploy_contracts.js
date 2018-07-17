var Regulator = artifacts.require("./Regulator.sol");
var TollBoothOperator = artifacts.require("./TollBoothOperator.sol");

let regulator;
let owner0;
let operator;
let owner1;

module.exports = function(deployer, network, accounts) {
   deployer.then(function() {
       owner0 = accounts[0];
       console.log("owner0: " + owner0);
       return Regulator.new({ from: owner0, gas: 5000000 });
   }).then(instance => {
       regulator = instance;
       console.log("regulator address: " + regulator.address);
       owner1 = accounts[1];
       console.log("owner1: " + owner1);
       return regulator.createNewOperator(owner1, 100, { from: owner0, gas: 5000000 });
   }).then(txObj => {
       address1 = txObj.logs[1].args.newOperator;
       console.log("operator: " + address1);
       return TollBoothOperator.at(address1);
   }).then(instance => {
       operator = instance;
       return operator.setPaused(false, { from: owner1 });
   });
};

