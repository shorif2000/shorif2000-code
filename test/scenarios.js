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

contract('Scenarios', function(accounts) {
    let owner0, owner1, anyone,
    booth1, booth2, 
    vehicle1, vehicle2, 
    regulator, operator;
const deposit1 = 10;	const routePrice1 = 10;
const deposit2 = 15;	const routePrice2 = 15;
const deposit3 = 6;		const routePrice3 = 6;
const deposit4 = 14;	const routePrice4 = 10;
const deposit5 = 10;	const routePrice5 = 11;
const deposit6 = 10;	const routePrice6 = 6;
const vehicleType1 = 1;
const multiplier0 = 1;
const tmpSecret = randomIntIn(1, 1000);
const secret0 = toBytes32(tmpSecret);
const secret1 = toBytes32(tmpSecret + randomIntIn(1, 1000));
const secret2 = toBytes32(secret1 + randomIntIn(1, 1000));
let hashed0, hashed1, hashed2;
before("should prepare", function() {
    assert.isAtLeast(accounts.length, 8);
    owner0 = accounts[0];
    owner1 = accounts[1];
    anyone = accounts[4];
    booth1 = accounts[2];
    booth2 = accounts[3];
    vehicle1 = accounts[5];
    vehicle2 = accounts[6];
    return web3.eth.getBalancePromise(owner0)
    .then(balance => assert.isAtLeast(web3.fromWei(balance).toNumber(), 10));
});

describe("scenario1", function() {

    beforeEach("should deploy regulator and operator", function() {
        return Regulator.new({ from: owner0 })
        .then(instance => regulator = instance)
        .then(tx => regulator.setVehicleType(vehicle1, vehicleType1, { from: owner0 }))
        .then(tx => regulator.createNewOperator(owner1, deposit1, { from: owner0 }))
        .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
        .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
        .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
        .then(tx => operator.setMultiplier(vehicleType1, multiplier0, { from: owner1 }))
        .then(tx => operator.setRoutePrice(booth1, booth2, routePrice1, { from: owner1 }))
        .then(tx => operator.setPaused(false, { from: owner1 }))
        .then(tx => operator.hashSecret(secret0))
        .then(hash => hashed0 = hash)
        .then(tx => operator.hashSecret(secret1))
        .then(hash => hashed1 = hash);
    });

    it("vehicle should enter booth1 and exit booth2 with no refunds", function() {
        return operator.enterRoad.call(
            booth1, hashed0, { from: vehicle1, value: deposit1 * multiplier0 })
            .then(success => assert.isTrue(success))
        .then(() => operator.enterRoad(
                booth1, hashed0, { from: vehicle1, value: deposit1 * multiplier0 }))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 1);
            assert.strictEqual(tx.logs.length, 1);
            const logEntered = tx.logs[0];
            assert.strictEqual(logEntered.event, "LogRoadEntered");
            assert.strictEqual(logEntered.args.vehicle, vehicle1);
            assert.strictEqual(logEntered.args.entryBooth, booth1);
            assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
            assert.strictEqual(logEntered.args.depositedWeis.toNumber(), deposit1);
            // console.log(tx.receipt.gasUsed);
            return operator.getVehicleEntry(hashed0);
        })
    .then(info => {
        assert.strictEqual(info[0], vehicle1);
        assert.strictEqual(info[1], booth1);
        assert.strictEqual(info[2].toNumber(), deposit1 * multiplier0);
        return web3.eth.getBalancePromise(operator.address);
    })
    .then(balance => assert.strictEqual(balance.toNumber(), deposit1 * multiplier0 ))
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
            assert.strictEqual(logExited.args.finalFee.toNumber(), routePrice1 * multiplier0);
            assert.strictEqual(logExited.args.refundWeis.toNumber(), 0);
            // console.log(tx.receipt.gasUsed);
        });
    });

});

describe("scenario2", function() {

    beforeEach("should deploy regulator and operator", function() {
        return Regulator.new({ from: owner0 })
        .then(instance => regulator = instance)
        .then(tx => regulator.setVehicleType(vehicle1, vehicleType1, { from: owner0 }))
        .then(tx => regulator.createNewOperator(owner1, deposit1, { from: owner0 }))
        .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
        .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
        .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
        .then(tx => operator.setMultiplier(vehicleType1, multiplier0, { from: owner1 }))
        .then(tx => operator.setRoutePrice(booth1, booth2, routePrice2, { from: owner1 }))
        .then(tx => operator.setPaused(false, { from: owner1 }))
        .then(tx => operator.hashSecret(secret0))
        .then(hash => hashed0 = hash)
        .then(tx => operator.hashSecret(secret1))
        .then(hash => hashed1 = hash);
    });

    it("vehicle should enter booth1 and exit booth2 and pay less than route price and get no refund", function() {
        return operator.enterRoad.call(
            booth1, hashed0, { from: vehicle1, value: deposit1 * multiplier0 })
            .then(success => assert.isTrue(success))
        .then(() => operator.enterRoad(
                booth1, hashed0, { from: vehicle1, value: deposit1 * multiplier0}))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 1);
            assert.strictEqual(tx.logs.length, 1);
            const logEntered = tx.logs[0];
            assert.strictEqual(logEntered.event, "LogRoadEntered");
            assert.strictEqual(logEntered.args.vehicle, vehicle1);
            assert.strictEqual(logEntered.args.entryBooth, booth1);
            assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
            assert.strictEqual(logEntered.args.depositedWeis.toNumber(), 10);
            // console.log(tx.receipt.gasUsed);
            return operator.getVehicleEntry(hashed0);
        })
    .then(info => {
        assert.strictEqual(info[0], vehicle1);
        assert.strictEqual(info[1], booth1);
        assert.strictEqual(info[2].toNumber(), 10);
        return web3.eth.getBalancePromise(operator.address);
    })
    .then(balance => assert.strictEqual(balance.toNumber(), deposit1 * multiplier0 ))
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
            assert.strictEqual(logExited.args.finalFee.toNumber(), routePrice2 * multiplier0);
            assert.strictEqual(logExited.args.refundWeis.toNumber(), 0);
            // console.log(tx.receipt.gasUsed);
        });
    });
});


describe("scenario3", function() {
    beforeEach("should deploy regulator and operator", function() {
        return Regulator.new({ from: owner0 })
        .then(instance => regulator = instance)
        .then(tx => regulator.setVehicleType(vehicle1, vehicleType1, { from: owner0 }))
        .then(tx => regulator.createNewOperator(owner1, deposit1, { from: owner0 }))
        .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
        .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
        .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
        .then(tx => operator.setMultiplier(vehicleType1, multiplier0, { from: owner1 }))
        .then(tx => operator.setRoutePrice(booth1, booth2, routePrice3, { from: owner1 }))
        .then(tx => operator.setPaused(false, { from: owner1 }))
        .then(tx => operator.hashSecret(secret0))
        .then(hash => hashed0 = hash)
        .then(tx => operator.hashSecret(secret1))
        .then(hash => hashed1 = hash);
    });
    it("vehicle should enter booth1 and exit booth2 and pay more than route price of 6 and get refund", function() {
        return operator.enterRoad.call(
            booth1, hashed0, { from: vehicle1, value: deposit1 * multiplier0})
            .then(success => assert.isTrue(success))
        .then(() => operator.enterRoad(
                booth1, hashed0, { from: vehicle1, value: deposit1 * multiplier0}))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 1);
            assert.strictEqual(tx.logs.length, 1);
            const logEntered = tx.logs[0];
            assert.strictEqual(logEntered.event, "LogRoadEntered");
            assert.strictEqual(logEntered.args.vehicle, vehicle1);
            assert.strictEqual(logEntered.args.entryBooth, booth1);
            assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
            assert.strictEqual(logEntered.args.depositedWeis.toNumber(), 10);
            // console.log(tx.receipt.gasUsed);
            return operator.getVehicleEntry(hashed0);
        })
    .then(info => {
        assert.strictEqual(info[0], vehicle1);
        assert.strictEqual(info[1], booth1);
        assert.strictEqual(info[2].toNumber(), deposit1 * multiplier0);
        return web3.eth.getBalancePromise(operator.address);
    })
    .then(balance => assert.strictEqual(balance.toNumber(), deposit1 * multiplier0 ))
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
            assert.strictEqual(logExited.args.finalFee.toNumber(), routePrice3 * multiplier0);
            assert.strictEqual(logExited.args.refundWeis.toNumber(), 4);
            // console.log(tx.receipt.gasUsed);
        });
    });
});

describe("scenario4", function() {
    beforeEach("should deploy regulator and operator", function() {
        return Regulator.new({ from: owner0 })
        .then(instance => regulator = instance)
        .then(tx => regulator.setVehicleType(vehicle1, vehicleType1, { from: owner0 }))
        .then(tx => regulator.createNewOperator(owner1, 10, { from: owner0 }))
        .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
        .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
        .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
        .then(tx => operator.setMultiplier(vehicleType1, multiplier0, { from: owner1 }))
        .then(tx => operator.setRoutePrice(booth1, booth2, routePrice4, { from: owner1 }))
        .then(tx => operator.setPaused(false, { from: owner1 }))
        .then(tx => operator.hashSecret(secret0))
        .then(hash => hashed0 = hash)
        .then(tx => operator.hashSecret(secret1))
        .then(hash => hashed1 = hash);
    });
    it("vehicle should enter booth1 and exit booth2 and pay more than reoute price of 10 and get refund 14", function() {
        return operator.enterRoad.call(
            booth1, hashed0, { from: vehicle1, value: deposit4 * multiplier0})
            .then(success => assert.isTrue(success))
        .then(() => operator.enterRoad(
                booth1, hashed0, { from: vehicle1, value: deposit4 * multiplier0}))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 1);
            assert.strictEqual(tx.logs.length, 1);
            const logEntered = tx.logs[0];
            assert.strictEqual(logEntered.event, "LogRoadEntered");
            assert.strictEqual(logEntered.args.vehicle, vehicle1);
            assert.strictEqual(logEntered.args.entryBooth, booth1);
            assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
            assert.strictEqual(logEntered.args.depositedWeis.toNumber(), 14);
            // console.log(tx.receipt.gasUsed);
            return operator.getVehicleEntry(hashed0);
        })
    .then(info => {
        assert.strictEqual(info[0], vehicle1);
        assert.strictEqual(info[1], booth1);
        assert.strictEqual(info[2].toNumber(), deposit4 * multiplier0);
        return web3.eth.getBalancePromise(operator.address);
    })
    .then(balance => assert.strictEqual(balance.toNumber(), deposit4 * multiplier0 ))
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
            assert.strictEqual(logExited.args.finalFee.toNumber(), routePrice1 * multiplier0);
            assert.strictEqual(logExited.args.refundWeis.toNumber(), 4);
            // console.log(tx.receipt.gasUsed);
        });
    });
});

describe("scenario5", function() {
    beforeEach("should deploy regulator and operator", function() {
        return Regulator.new({ from: owner0 })
        .then(instance => regulator = instance)
        .then(tx => regulator.setVehicleType(vehicle1, vehicleType1, { from: owner0 }))
        .then(tx => regulator.createNewOperator(owner1, deposit5, { from: owner0 }))
        .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
        .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
        .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
        .then(tx => operator.setMultiplier(vehicleType1, multiplier0, { from: owner1 }))
        .then(tx => operator.setPaused(false, { from: owner1 }))
        .then(tx => operator.hashSecret(secret0))
        .then(hash => hashed0 = hash)
        .then(tx => operator.hashSecret(secret1))
        .then(hash => hashed1 = hash);
    });

    it("vehicle1 enters at booth1 and deposits (say 14) more than the required amount (say 10). vehicle1 exits at booth2, which route price happens to be unknown. the operator's owner updates the route price, which happens to be less than the deposited amount (say 11). vehicle1 gets refunded the difference (so 3).", function() {
        //console.log("deposit: " , (14 * multiplier0) );
        return operator.enterRoad.call(
            booth1, hashed0, { from: vehicle1, value: 14 * multiplier0})
            .then(success => assert.isTrue(success))
        .then(() => operator.enterRoad(
                booth1, hashed0, { from: vehicle1, value: 14 * multiplier0}))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 1);
            assert.strictEqual(tx.logs.length, 1);
            const logEntered = tx.logs[0];
            //console.log(logEntered.args);
            assert.strictEqual(logEntered.event, "LogRoadEntered");
            assert.strictEqual(logEntered.args.vehicle, vehicle1);
            assert.strictEqual(logEntered.args.entryBooth, booth1);
            assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
            assert.strictEqual(logEntered.args.depositedWeis.toNumber(), 14);
            // console.log(tx.receipt.gasUsed);
            return operator.getVehicleEntry(hashed0);
        })
    .then(info => {
        assert.strictEqual(info[0], vehicle1);
        assert.strictEqual(info[1], booth1);
        assert.strictEqual(info[2].toNumber(), 14);
        return web3.eth.getBalancePromise(operator.address);
    })
    .then(balance => assert.strictEqual(balance.toNumber(), 14 * multiplier0 ))
        .then(() => operator.reportExitRoad.call(secret0, { from: booth2 }))
        .then(result => assert.strictEqual(result.toNumber(), 2))
        .then(() => operator.reportExitRoad(secret0, { from: booth2 }))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 1);
            assert.strictEqual(tx.logs.length, 1);
            const logPending = tx.logs[0];
            assert.strictEqual(logPending.event, "LogPendingPayment");
            assert.strictEqual(logPending.args.exitSecretHashed, hashed0);
            assert.strictEqual(logPending.args.entryBooth, booth1);
            assert.strictEqual(logPending.args.exitBooth, booth2);
            // console.log(tx.receipt.gasUsed);

            return Promise.allNamed({
                hashed0: () => operator.getVehicleEntry(hashed0),
                   pendingCount01: () => operator.getPendingPaymentCount(booth1, booth2),
            });
        })
    .then(info => {
        assert.strictEqual(info.hashed0[0], vehicle1);
        assert.strictEqual(info.hashed0[1], booth1);
        assert.strictEqual(info.hashed0[2].toNumber(), 14 * multiplier0);
        assert.strictEqual(info.pendingCount01.toNumber(), 1);
        return operator.setRoutePrice.call(booth1, booth2, routePrice5, { from: owner1 });
    })
    .then(success => assert.isTrue(success))
        .then(() => operator.setRoutePrice(booth1, booth2, routePrice5, { from: owner1 }))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 2);
            assert.strictEqual(tx.logs.length, 2);
            const logPriceSet = tx.logs[0];
            assert.strictEqual(logPriceSet.event, "LogRoutePriceSet");
            assert.strictEqual(logPriceSet.args.sender, owner1);
            assert.strictEqual(logPriceSet.args.entryBooth, booth1);
            assert.strictEqual(logPriceSet.args.exitBooth, booth2);
            assert.strictEqual(logPriceSet.args.priceWeis.toNumber(), routePrice5);
            const logExited = tx.logs[1];
            assert.strictEqual(logExited.event, "LogRoadExited");
            assert.strictEqual(logExited.args.exitBooth, booth2);
            assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
            assert.strictEqual(logExited.args.finalFee.toNumber(), 11 * multiplier0);
            assert.strictEqual(logExited.args.refundWeis.toNumber(),3);
            // console.log(tx.receipt.gasUsed);
            return Promise.allNamed({
                hashed0: () => operator.getVehicleEntry(hashed0),
                   pendingCount01: () => operator.getPendingPaymentCount(booth1, booth2),
            });
        })
    .then(info => {
        //console.log(info.hashed0[2].toNumber());
        assert.strictEqual(info.hashed0[0], vehicle1);
        assert.strictEqual(info.hashed0[1], booth1);
        assert.strictEqual(info.hashed0[2].toNumber(), 0); // vehicle has exited so this value is missing
        assert.strictEqual(info.pendingCount01.toNumber(), 0);
        return Promise.allNamed({
            operator: () => web3.eth.getBalancePromise(operator.address),
               collected: () => operator.getCollectedFeesAmount(),
               vehicle1: () => web3.eth.getBalancePromise(vehicle1)
        });
    })
    .then(balances => {
        //console.log("operator: " + balances.operator.toNumber());
        //console.log("collected: " + balances.collected.toNumber());
        //console.log("vehicle: " + balances.vehicle1.toString(10));
        assert.strictEqual(balances.operator.toNumber(), routePrice5 * multiplier0);
        assert.strictEqual(balances.collected.toNumber(), routePrice5 * multiplier0);
        //                        assert.strictEqual( balances.vehicle1.toString(10), 0 );
    });

    });
});


describe("scenario 6", function() {

    beforeEach("should deploy regulator and operator", function() {
        return Regulator.new({ from: owner0 })
        .then(instance => regulator = instance)
        .then(tx => regulator.setVehicleType(vehicle1, vehicleType1, { from: owner0 }))
        .then(tx => regulator.setVehicleType(vehicle2, vehicleType1, { from: owner0 }))
        .then(tx => regulator.createNewOperator(owner1, deposit6, { from: owner0 }))
        .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
        .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
        .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
        .then(tx => operator.setMultiplier(vehicleType1, multiplier0, { from: owner1 }))
        .then(tx => operator.setPaused(false, { from: owner1 }))                
        .then(tx => operator.hashSecret(secret1))
        .then(hash => hashed1 = hash)
        .then(tx => operator.hashSecret(secret2))
        .then(hash => hashed2 = hash)
    });

    it("vehicle1 enters at booth1 and deposits more (say 14) than the required amount (say 10). vehicle1 exits at booth2, which route price happens to be unknown. vehicle2 enters at booth1 and deposits the exact required amount (so 10). vehicle2 exits at booth2, which route price happens to be unknown. the operator's owner updates the route price, which happens to be less than the required deposit (so 6). vehicle1 gets refunded the difference (so 8). someone (anyone) calls to clear one pending payment. vehicle2 gets refunded the difference (so 4). ", function() {
        var vehicleValue = 14;
        return operator.enterRoad.call(booth1, hashed1, { from: vehicle1, value: vehicleValue })
        .then(success => assert.isTrue(success))
        .then(() => operator.enterRoad(booth1, hashed1, { from: vehicle1, value: vehicleValue }))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 1);
            assert.strictEqual(tx.logs.length, 1);
            const logEntered = tx.logs[0];
            assert.strictEqual(logEntered.event, "LogRoadEntered");
            assert.strictEqual(logEntered.args.vehicle, vehicle1);
            assert.strictEqual(logEntered.args.entryBooth, booth1);
            assert.strictEqual(logEntered.args.exitSecretHashed, hashed1);
            assert.strictEqual(logEntered.args.depositedWeis.toNumber(), vehicleValue );
            return operator.getVehicleEntry(hashed1);
        })
    .then(info => {
        assert.strictEqual(info[0], vehicle1);
        assert.strictEqual(info[1], booth1);
        assert.strictEqual(info[2].toNumber(), vehicleValue );
        return web3.eth.getBalancePromise(operator.address);
    })
    .then(balance => {
        assert.strictEqual(balance.toNumber(), vehicleValue );
        return operator.enterRoad.call(booth1, hashed2, { from: vehicle2, value: 10 });
    })
    .then(success => assert.isTrue(success))
        .then(() => operator.enterRoad(booth1, hashed2, { from: vehicle2, value: 10 }))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 1);
            assert.strictEqual(tx.logs.length, 1);
            const logEntered = tx.logs[0];
            assert.strictEqual(logEntered.event, "LogRoadEntered");
            assert.strictEqual(logEntered.args.vehicle, vehicle2);
            assert.strictEqual(logEntered.args.entryBooth, booth1);
            assert.strictEqual(logEntered.args.exitSecretHashed, hashed2);
            assert.strictEqual(logEntered.args.depositedWeis.toNumber(), 10);
            return operator.getVehicleEntry(hashed2);
        })
    .then(info => {
        assert.strictEqual(info[0], vehicle2);
        assert.strictEqual(info[1], booth1);
        assert.strictEqual(info[2].toNumber(), 10);
        return web3.eth.getBalancePromise(operator.address);
    })
    .then(balance => {
        assert.strictEqual(balance.toNumber(), 24);
        //return operator.setRoutePrice(booth1, booth2, 0, { from: owner1 })
    })
    .then(() => operator.reportExitRoad.call(secret1, { from: booth2 }))
        .then(result => assert.strictEqual(result.toNumber(), 2))
        .then(() => operator.reportExitRoad(secret1, { from: booth2 }))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 1);
            assert.strictEqual(tx.logs.length, 1);
            const logPending = tx.logs[0];
            assert.strictEqual(logPending.event, "LogPendingPayment");
            assert.strictEqual(logPending.args.entryBooth, booth1);
            assert.strictEqual(logPending.args.exitBooth, booth2);
            assert.strictEqual(logPending.args.exitSecretHashed, hashed1);

            return Promise.allNamed({
                hashed1: () => operator.getVehicleEntry(hashed1),
                   pendingCount01: () => operator.getPendingPaymentCount(booth1, booth2),
            });
        })
    .then(info => {
        assert.strictEqual(info.hashed1[0], vehicle1);
        assert.strictEqual(info.hashed1[1], booth1);
        assert.strictEqual(info.hashed1[2].toNumber(), vehicleValue);
        assert.strictEqual(info.pendingCount01.toNumber(), 1);
    })
    .then(result => {
        return operator.reportExitRoad.call(secret2, { from: booth2 })
    })
    .then(result => assert.strictEqual(result.toNumber(), 2))
        .then(() => operator.reportExitRoad(secret2, { from: booth2 }))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 1);
            assert.strictEqual(tx.logs.length, 1);
            const logPending = tx.logs[0];
            assert.strictEqual(logPending.event, "LogPendingPayment");
            assert.strictEqual(logPending.args.entryBooth, booth1);
            assert.strictEqual(logPending.args.exitBooth, booth2);
            assert.strictEqual(logPending.args.exitSecretHashed, hashed2);

            return Promise.allNamed({
                hashed2: () => operator.getVehicleEntry(hashed2),
                   pendingCount01: () => operator.getPendingPaymentCount(booth1, booth2),
            });
        })
    .then(info => {
        assert.strictEqual(info.hashed2[0], vehicle2);
        assert.strictEqual(info.hashed2[1], booth1);
        assert.strictEqual(info.hashed2[2].toNumber(), 10);
        assert.strictEqual(info.pendingCount01.toNumber(), 2);

        return operator.setRoutePrice.call(booth1, booth2, routePrice6, { from: owner1 });
    })
    .then(success => assert.isTrue(success))
        .then(() => operator.setRoutePrice(booth1, booth2, routePrice6, { from: owner1 }))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 2);
            assert.strictEqual(tx.logs.length, 2);
            const logPriceSet = tx.logs[0];
            assert.strictEqual(logPriceSet.event, "LogRoutePriceSet");
            assert.strictEqual(logPriceSet.args.sender, owner1);
            assert.strictEqual(logPriceSet.args.entryBooth, booth1);
            assert.strictEqual(logPriceSet.args.exitBooth, booth2);
            assert.strictEqual(logPriceSet.args.priceWeis.toNumber(), routePrice6);
            const logExited = tx.logs[1];
            assert.strictEqual(logExited.event, "LogRoadExited");
            assert.strictEqual(logExited.args.exitBooth, booth2);
            assert.strictEqual(logExited.args.exitSecretHashed, hashed1);
            assert.strictEqual(logExited.args.finalFee.toNumber(), 6);
            assert.strictEqual(logExited.args.refundWeis.toNumber(), 8);

            return Promise.allNamed({
                hashed1: () => operator.getVehicleEntry(hashed1),
                   pendingCount01: () => operator.getPendingPaymentCount(booth1, booth2),
            });
        })
    .then(info => {
        assert.strictEqual(info.hashed1[0], vehicle1);
        assert.strictEqual(info.hashed1[1], booth1);
        assert.strictEqual(info.hashed1[2].toNumber(), 0);
        assert.strictEqual(info.pendingCount01.toNumber(), 1);

        return operator.clearSomePendingPayments.call(booth1, booth2, 1, {from: anyone});
    })
    .then(result => assert.strictEqual(result, true))
        .then(() => operator.clearSomePendingPayments(booth1, booth2, 1, {from: anyone}))
        .then(tx => {
            assert.strictEqual(tx.receipt.logs.length, 1);
            assert.strictEqual(tx.logs.length, 1);
            const logExited = tx.logs[0];
            assert.strictEqual(logExited.event, "LogRoadExited");
            assert.strictEqual(logExited.args.exitBooth, booth2);
            assert.strictEqual(logExited.args.exitSecretHashed, hashed2);
            assert.strictEqual(logExited.args.finalFee.toNumber(), 6);
            assert.strictEqual(logExited.args.refundWeis.toNumber(), 4);

            return Promise.allNamed({
                operator: () => web3.eth.getBalancePromise(operator.address),
                   collected: () => operator.getCollectedFeesAmount()
            });
        })
    .then(balances => {
        assert.strictEqual(balances.operator.toNumber(), 12);
        assert.strictEqual(balances.collected.toNumber(), 12);
    });

    });
});
});
