pragma solidity ^0.4.13;

import './Owned.sol';
import './interfaces/MultiplierHolderI.sol';

contract MultiplierHolder is Owned, MultiplierHolderI {
    
    mapping(uint => uint) private mMultiplier;
    
	function MultiplierHolder(){
	}

    event LogMultiplierSet(
        address indexed sender,
        uint indexed vehicleType,
        uint multiplier);

    function setMultiplier(
            uint vehicleType,
            uint multiplier)
        fromOwner
        public
        returns(bool success)
    {
        require(vehicleType != 0);
        require(mMultiplier[vehicleType] != multiplier);
        mMultiplier[vehicleType] = multiplier;
        LogMultiplierSet(msg.sender,vehicleType,multiplier);
        return true;
    }

    function getMultiplier(uint vehicleType)
        constant
        public
        returns(uint multiplier)
    {
        return mMultiplier[vehicleType];
    }
}