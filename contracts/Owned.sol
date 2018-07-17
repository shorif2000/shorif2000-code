pragma solidity ^0.4.13;

import './interfaces/OwnedI.sol';

contract Owned is OwnedI {
    
	address private currentOwner;
	
	function Owned() 
	    public
	{
	    currentOwner = msg.sender;
	}
	
	modifier fromOwner() 
	{
		require(msg.sender == currentOwner);
		_;
	}

    event LogOwnerSet(address indexed previousOwner, address indexed newOwner);

    function setOwner(address newOwner)
        public
        fromOwner
        returns(bool success)
    {
        require(currentOwner != newOwner);
        require(newOwner != 0x0);
        currentOwner = newOwner;
        LogOwnerSet(currentOwner, newOwner);
        return true;
    }

    function getOwner() 
        public
        constant
        returns(address owner)
    {
        return currentOwner;
    }
}