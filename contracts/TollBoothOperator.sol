pragma solidity ^0.4.13;

import './Pausable.sol'; 
import './DepositHolder.sol';    
import './MultiplierHolder.sol';
import './RoutePriceHolder.sol';    
import './Regulated.sol';  
import './interfaces/TollBoothOperatorI.sol';

contract TollBoothOperator is Pausable, DepositHolder, MultiplierHolder, RoutePriceHolder, Regulated, TollBoothOperatorI {
	    
	uint private collectedFees;
	mapping (address => mapping ( address => uint) ) private mPendingPayments;
	mapping (address => mapping ( address => uint) ) private mPendingPaymentPointer;
	struct SecretStruct {
        address entryBooth;
	    uint vType;
        bool used;
        address sender;
        uint value;
        bool exists;
        bytes32 secretHashed; 
	}
	mapping ( address => mapping ( address => mapping ( uint => SecretStruct) ) ) private mSecret;
    mapping ( bytes32 => SecretStruct ) private mHash;
	
	
	function TollBoothOperator(bool paused, uint deposit, address regulator)
	    public 
	    Pausable(paused)
	    DepositHolder(deposit)
	    Regulated(regulator)
	{
	}
	
	/**
     * This provides a single source of truth for the encoding algorithm.
     * @param secret The secret to be hashed.
     * @return the hashed secret.
     */
    function hashSecret(bytes32 secret)
        constant
        public
        returns(bytes32 hashed)
    {
        return keccak256(secret);
    }
    
    /**
     * Event emitted when a vehicle made the appropriate deposit to enter the road system.
     * @param vehicle The address of the vehicle that entered the road system.
     * @param entryBooth The declared entry booth by which the vehicle will enter the system.
     * @param exitSecretHashed A hashed secret that when solved allows the operator to pay itself.
     * @param depositedWeis The amount that was deposited as part of the entry.
     */
    event LogRoadEntered(
        address indexed vehicle,
        address indexed entryBooth,
        bytes32 indexed exitSecretHashed,
        uint depositedWeis);
        
    /**
     * Called by the vehicle entering a road system.
     * Off-chain, the entry toll booth will open its gate up successful deposit and confirmation
     * of the vehicle identity.
     *     It should roll back when the contract is in the `true` paused state.
     *     It should roll back when the vehicle is not a registered vehicle.
     *     It should roll back when the vehicle is not allowed on this road system.
     *     It should roll back if `entryBooth` is not a tollBooth.
     *     It should roll back if less than deposit * multiplier was sent alongside.
     *     It should roll back if `exitSecretHashed` has previously been used to enter.
     *     It should be possible for a vehicle to enter "again" before it has exited from the 
     *       previous entry.
     * @param entryBooth The declared entry booth by which the vehicle will enter the system.
     * @param exitSecretHashed A hashed secret that when solved allows the operator to pay itself.
     * @return Whether the action was successful.
     * Emits LogRoadEntered.
     */
    function enterRoad(
            address entryBooth,
            bytes32 exitSecretHashed)
        whenNotPaused
        public
        payable
        returns (bool success)
    {
        uint vType = Regulated.getRegulator().getVehicleType(msg.sender);
        require(vType > 0);
        require(isTollBooth(entryBooth));
        require(msg.value >= (getDeposit() * getMultiplier(vType) ) );
        require(mHash[exitSecretHashed].used == false);
        mHash[exitSecretHashed].entryBooth = entryBooth;
        mHash[exitSecretHashed].sender = msg.sender;
        mHash[exitSecretHashed].value = msg.value;
        mHash[exitSecretHashed].exists = true;
        LogRoadEntered(msg.sender,entryBooth, exitSecretHashed, msg.value );
        return true;
    }
    
    /**
     * @param exitSecretHashed The hashed secret used by the vehicle when entering the road.
     * @return The information pertaining to the entry of the vehicle.
     *     vehicle: the address of the vehicle that entered the system.
     *     entryBooth: the address of the booth the vehicle entered at.
     *     depositedWeis: how much the vehicle deposited when entering.
     * After the vehicle has exited, `depositedWeis` should be returned as `0`.
     * If no vehicles had ever entered with this hash, all values should be returned as `0`.
     */
    function getVehicleEntry(bytes32 exitSecretHashed)
        constant
        public
        returns(
            address vehicle,
            address entryBooth,
            uint depositedWeis)
    {
        return ( mHash[exitSecretHashed].sender, mHash[exitSecretHashed].entryBooth, mHash[exitSecretHashed].value );
    }
            
    /**
     * Event emitted when a vehicle exits a road system.
     * @param exitBooth The toll booth that saw the vehicle exit.
     * @param exitSecretHashed The hash of the secret given by the vehicle as it
     *     passed by the exit booth.
     * @param finalFee The toll fee taken from the deposit.
     * @param refundWeis The amount refunded to the vehicle, i.e. deposit - fee.
     */
    event LogRoadExited(
        address indexed exitBooth,
        bytes32 indexed exitSecretHashed,
        uint finalFee,
        uint refundWeis);
    /**
     * Event emitted when a vehicle used a route that has no known fee.
     * It is a signal for the oracle to provide a price for the pair.
     * @param exitSecretHashed The hashed secret that was defined at the time of entry.
     * @param entryBooth The address of the booth the vehicle entered at.
     * @param exitBooth The address of the booth the vehicle exited at.
     */
    event LogPendingPayment(
        bytes32 indexed exitSecretHashed,
        address indexed entryBooth,
        address indexed exitBooth);
    /**
     * Called by the exit booth.
     *     It should roll back when the contract is in the `true` paused state.
     *     It should roll back when the sender is not a toll booth.
     *     It should roll back when the vehicle is no longer a registered vehicle.
     *     It should roll back when the vehicle is no longer allowed on this road system.
     *     It should roll back if the exit is same as the entry.
     *     It should roll back if the secret does not match a hashed one.
     *     It should roll back if the secret has already been reported on exit.
     * @param exitSecretClear The secret given by the vehicle as it passed by the exit booth.
     * @return status:
     *   1: success, -> emits LogRoadExited
     *   2: pending oracle -> emits LogPendingPayment
     */
    function reportExitRoad(bytes32 exitSecretClear)
        whenNotPaused
        public
        returns (uint status)
    {
        require(isTollBooth(msg.sender));
        //require(mHash[hashSecret(exitSecretClear)].exists); //secret does not match a hashed one. 
        require(mHash[hashSecret(exitSecretClear)].exists);
        require(!mHash[hashSecret(exitSecretClear)].used);//secret has already been reported on exit.
        
        address vehicle;
        address entryBooth;
        uint depositedWeis;
        (vehicle, entryBooth, depositedWeis) = getVehicleEntry(hashSecret(exitSecretClear));
        
        uint vType = Regulated.getRegulator().getVehicleType(vehicle);
        require(vType > 0); // vehicle is no longer a registered vehicle. && vehicle is no longer allowed on this road system.
        require(msg.sender != entryBooth);
        
        if(getRoutePrice(entryBooth,msg.sender) == 0){ //if the fee is not known at the time of exit, i.e. if the fee is 0, the pending payment is recorded, and "base route price required" event is emitted and listened to by the operator's oracle.
            mPendingPayments[entryBooth][msg.sender] += 1;
            mSecret[entryBooth][msg.sender][mPendingPayments[entryBooth][msg.sender]].secretHashed = hashSecret(exitSecretClear);
            mSecret[entryBooth][msg.sender][mPendingPayments[entryBooth][msg.sender]].vType = vType;
            LogPendingPayment(hashSecret(exitSecretClear), entryBooth, msg.sender);
            return 2;
        }
        
        uint finalFee =  getRoutePrice(entryBooth,msg.sender) * getMultiplier(vType); 
        mHash[hashSecret(exitSecretClear)].value = 0;
        mHash[hashSecret(exitSecretClear)].used = true;
        collectedFees += finalFee;
        if(finalFee >= depositedWeis) //if the fee is equal to or higher than the deposit, then the whole deposit is used and no more is asked of the vehicle, now or before any future trip.
        {   
            LogRoadExited(msg.sender,hashSecret(exitSecretClear), finalFee, 0);
            return 1;
        }
        else if (finalFee < depositedWeis) //if the fee is smaller than the deposit, then the difference is returned to the vehicle.
        {
            vehicle.transfer(depositedWeis - finalFee);
            LogRoadExited(msg.sender,hashSecret(exitSecretClear), finalFee, depositedWeis - finalFee);
            return 1;
        }
    }      
    /**
     * @param entryBooth the entry booth that has pending payments.
     * @param exitBooth the exit booth that has pending payments.
     * @return the number of payments that are pending because the price for the
     * entry-exit pair was unknown.
     */
    function getPendingPaymentCount(address entryBooth, address exitBooth)
        constant
        public
        returns (uint count)
    {
        require(isTollBooth(entryBooth));
        require(isTollBooth(exitBooth));
        
        return mPendingPayments[entryBooth][exitBooth] ;
    }
    /**
     * Can be called by anyone. In case more than 1 payment was pending when the oracle gave a price.
     *     It should roll back when the contract is in `true` paused state.
     *     It should roll back if booths are not really booths.
     *     It should roll back if there are fewer than `count` pending payment that are solvable.
     *     It should roll back if `count` is `0`.
     * @param entryBooth the entry booth that has pending payments.
     * @param exitBooth the exit booth that has pending payments.
     * @param count the number of pending payments to clear for the exit booth.
     * @return Whether the action was successful.
     * Emits LogRoadExited as many times as count.
     */
    function clearSomePendingPayments(
            address entryBooth,
            address exitBooth,
            uint count)
        whenNotPaused
        public
        returns (bool success)
    {
        require(isTollBooth(entryBooth));
        require(isTollBooth(exitBooth));
        require(count >= getPendingPaymentCount(entryBooth, exitBooth) );
        require(count != 0);
        
        
        for(uint i = 0; i < count; i++) 
        {
            mPendingPaymentPointer[entryBooth][exitBooth]++;
            address vehicle2;
            address entryBooth2;
            uint depositedW;
            bytes32 secretHashed = mSecret[entryBooth][exitBooth][mPendingPaymentPointer[entryBooth][exitBooth]].secretHashed;
            (vehicle2, entryBooth2, depositedW) = getVehicleEntry(secretHashed);
            uint fee =  getRoutePrice(entryBooth,exitBooth) * getMultiplier(mSecret[entryBooth][exitBooth][mPendingPaymentPointer[entryBooth][exitBooth]].vType);
            collectedFees += fee;
            uint refund = depositedW - fee;
            if(refund > 0)
            {
                vehicle2.transfer(refund);
            }
            mHash[secretHashed].used = true;
            mHash[secretHashed].value = 0;
            LogRoadExited(exitBooth,secretHashed,fee,refund);
            
        }
        
        mPendingPayments[entryBooth][exitBooth] -= count;
        
        return true;
    }
    /**
     * @return The amount that has been collected through successful payments. This is the current
     *   amount, it does not reflect historical fees. So this value goes back to zero after a call
     *   to `withdrawCollectedFees`.
     */
    function getCollectedFeesAmount()
        constant
        public
        returns(uint amount)
    {
        return collectedFees;
    }
    /**
     * Event emitted when the owner collects the fees.
     * @param owner The account that sent the request.
     * @param amount The amount collected.
     */
    event LogFeesCollected(
        address indexed owner,
        uint amount);
        
    /**
     * Called by the owner of the contract to withdraw all collected fees (not deposits) to date.
     *     It should roll back if any other address is calling this function.
     *     It should roll back if there is no fee to collect.
     *     It should roll back if the transfer failed.
     * @return success Whether the operation was successful.
     * Emits LogFeesCollected.
     */
    function withdrawCollectedFees()
        fromOwner
        public
        returns(bool success)
    {
        require(collectedFees > 0);
        uint _collectedFees = collectedFees ;
        collectedFees = 0;
        msg.sender.transfer(_collectedFees);
        LogFeesCollected(msg.sender,_collectedFees);
        return true;
    }
    
    /**
     * This function overrides the eponymous function of `RoutePriceHolderI`, to which it adds the following
     * functionality:
     *     - If relevant, it will release 1 pending payment for this route. As part of this payment
     *       release, it will emit the appropriate `LogRoadExited` event.
     *     - In the case where the next relevant pending payment is not solvable, which can happen if,
     *       for instance the vehicle has had wrongly set values in the interim:
     *       - It should release 0 pending payment
     *       - It should not roll back the transaction
     *       - It should behave as if there had been no pending payment, apart from the higher gas consumed.
     *     - It should be possible to call it even when the contract is in the `true` paused state.
     * Emits LogRoadExited if applicable.
     */
    function setRoutePrice(
            address entryBooth,
            address exitBooth,
            uint priceWeis)
        public
        returns(bool success)
    {
        RoutePriceHolder.setRoutePrice(entryBooth, exitBooth, priceWeis);
        if(getPendingPaymentCount(entryBooth, exitBooth) > 0) { 
            
            uint index = mPendingPaymentPointer[entryBooth][exitBooth];
            if( index == 0)
            {
                index = 1;
            }

            mPendingPayments[entryBooth][exitBooth] -= 1;
            
            address vehicle2;
            address entryBooth2;
            uint depositedW;
            (vehicle2, entryBooth2, depositedW) = getVehicleEntry(mSecret[entryBooth][exitBooth][index].secretHashed);
            mHash[mSecret[entryBooth][exitBooth][index].secretHashed].used = true;
            mHash[mSecret[entryBooth][exitBooth][index].secretHashed].value = 0;
            
            uint fee = getRoutePrice(entryBooth2,exitBooth) * getMultiplier(mSecret[entryBooth][exitBooth][index].vType);
	    
            if(fee > depositedW)
            {
                collectedFees += fee + (depositedW - fee);
                LogRoadExited(exitBooth,mSecret[entryBooth][exitBooth][index].secretHashed, fee +( depositedW-fee), 0);
            }
            else
            {
                collectedFees += fee;
                vehicle2.transfer(depositedW - fee);
                LogRoadExited(exitBooth,mSecret[entryBooth][exitBooth][index].secretHashed, fee, depositedW - fee);
            }
            mPendingPaymentPointer[entryBooth][exitBooth]++;
        }
        return true;
    }
     
   
}
