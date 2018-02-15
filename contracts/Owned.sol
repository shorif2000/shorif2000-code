pragma solidity ^0.4.13;

import './interfaces/OwnedI.sol';

contract Owned is OwnedI {
    
	address private currentOwner;
	
	function Ownable() 
	{
	}
	/*
	 * @dev rolls back the transaction if the transaction sender is not the owner
	 */
	modifier fromOwner() 
	{
		require(msg.sender == currentOwner);
		_;
	}
	
	/**
     * Event emitted when a new owner has been set.
     * @param previousOwner The previous owner, who happened to effect the change.
     * @param newOwner The new, and current, owner the contract.
     */
    event LogOwnerSet(address indexed previousOwner, address indexed newOwner);
    /**
     * Sets the new owner for this contract.
     *     It should roll back if the caller is not the current owner.
     *     It should roll back if the argument is the current owner.
     *     It should roll back if the argument is a 0 address.
     * @param newOwner The new owner of the contract
     * @return Whether the action was successful.
     * Emits LogOwnerSet.
     */
    function setOwner(address newOwner)
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
    /**
     * @return The owner of this contract.
     */
    function getOwner() 
        constant 
        returns(address owner)
    {
        return currentOwner;
    }
}
