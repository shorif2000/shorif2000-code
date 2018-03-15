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
        address owner = getOwner();
        require(owner != newOwner);
        require(newOwner != 0x0);
        currentOwner = newOwner;
        LogOwnerSet(owner,newOwner);
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