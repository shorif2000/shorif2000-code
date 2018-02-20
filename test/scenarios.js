const expectedExceptionPromise = require("../utils/expectedException.js");
web3.eth.getTransactionReceiptMined = require("../utils/getTransactionReceiptMined.js");
Promise = require("bluebird");
Promise.allNamed = require("../utils/sequentialPromiseNamed.js");
const randomIntIn = require("../utils/randomIntIn.js");
const toBytes32 = require("../utils/toBytes32.js");
if (typeof web3.eth.getAccountsPromise === "undefined") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}
const Regulator = artifacts.require("./Regulator.sol");
const TollBoothOperator = artifacts.require("./TollBoothOperator.sol");
contract('TollBoothOperator', function(accounts) {
    let owner0, owner1,
        booth1, booth2, booth3,
        vehicle1, vehicle2,
        regulator, operator;
    const price01 = randomIntIn(1, 1000);
    const deposit = 10;//price01 + randomIntIn(1, 1000);
    //const deposit1 = deposit0 + randomIntIn(1, 1000);
    const vehicleType1 = 1;//vehicleType0 + randomIntIn(1, 1000);
    const multiplier0 = 1;//randomIntIn(1, 1000);
    const multiplier1 = 1;//multiplier0 + randomIntIn(1, 1000);
    const tmpSecret = randomIntIn(1, 1000);
    const secret0 = toBytes32(tmpSecret);
    const secret1 = toBytes32(tmpSecret + randomIntIn(1, 1000));
    let hashed0, hashed1;
    let vehicleInitBal;
    before("should prepare", function() {
        assert.isAtLeast(accounts.length, 8);
        owner0 = accounts[0];
        owner1 = accounts[1];
        booth1 = accounts[2];
        booth2 = accounts[3];
        booth3 = accounts[4];
        vehicle1 = accounts[5];
        vehicle2 = accounts[6];
        return web3.eth.getBalancePromise(owner0)
            .then(balance => assert.isAtLeast(web3.fromWei(balance).toNumber(), 10));
    });

    describe("senario1", function() {


	 beforeEach("should deploy regulator and operator", function() {
            return Regulator.new({ from: owner0 })
                .then(instance => regulator = instance)
                .then(tx => regulator.setVehicleType(vehicle1, vehicleType1, { from: owner0 }))
                .then(tx => regulator.createNewOperator(owner1, deposit, { from: owner0 }))
                .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
                .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType1, multiplier1, { from: owner1 }))
                .then(tx => operator.setRoutePrice(booth1, booth2, deposit, { from: owner1 }))
                .then(tx => operator.setPaused(false, { from: owner1 }))
                .then(tx => operator.hashSecret(secret0))
                .then(hash => hashed0 = hash)
                .then(tx => operator.hashSecret(secret1))
                .then(hash => hashed1 = hash);
        });

	it("vehicle should enter booth1 and exit booth2 with no refunds", function() {
	  return operator.enterRoad.call(
                        booth1, hashed0, { from: vehicle1, value: deposit })
                    .then(success => assert.isTrue(success))
                    .then(() => operator.enterRoad(
                        booth1, hashed0, { from: vehicle1, value: deposit }))
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logEntered = tx.logs[0];
                        assert.strictEqual(logEntered.event, "LogRoadEntered");
                        assert.strictEqual(logEntered.args.vehicle, vehicle1);
                        assert.strictEqual(logEntered.args.entryBooth, booth1);
                        assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logEntered.args.depositedWeis.toNumber(), deposit);
                        // console.log(tx.receipt.gasUsed);
                        return operator.getVehicleEntry(hashed0);
                    })
                    .then(info => {
                        assert.strictEqual(info[0], vehicle1);
                        assert.strictEqual(info[1], booth1);
                        assert.strictEqual(info[2].toNumber(), deposit * multiplier1);
                        return web3.eth.getBalancePromise(operator.address);
                    })
                    .then(balance => assert.strictEqual(balance.toNumber(), deposit * multiplier1 ))
		    .then(() => operator.reportExitRoad.call(secret0, { from: booth2 }))
                    .then(result => assert.strictEqual(result.toNumber(), 1))
                    .then(() => operator.reportExitRoad(secret0, { from: booth2 }))
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logExited = tx.logs[0];
                        assert.strictEqual(logExited.event, "LogRoadExited");
                        assert.strictEqual(logExited.args.exitBooth, booth2);
                        assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logExited.args.finalFee.toNumber(), deposit * multiplier0);
                        assert.strictEqual(logExited.args.refundWeis.toNumber(), 0);
                        // console.log(tx.receipt.gasUsed);
                    });
	});

    });

});
