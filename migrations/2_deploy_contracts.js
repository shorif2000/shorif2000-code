var Regulator = artifacts.require("./Regulator.sol");
var TollBoothOperator = artifacts.require("./TollBoothOperator.sol");

let regulator;
let owner0;
let operator;
let owner1;

module.exports = function(deployer, network, accounts) {
   deployer.then(function() {
       owner0 = accounts[0];
       return Regulator.new({ from: owner0 });
   }).then(instance => {
       regulator = instance;
       owner1 = accounts[1];
       return regulator.createNewOperator(owner1, 100, { from: owner0 });
   }).then(txObj => {
       address1 = txObj.logs[1].args.newOperator;
       return TollBoothOperator.at(address1);
   }).then(instance => {
       operator = instance;
       return operator.setPaused(false, { from: owner1 });
   });
};