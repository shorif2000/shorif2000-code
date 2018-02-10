pragma solidity ^0.4.13;

import './Owned.sol';
import './interfaces/DepositHolderI.sol';

contract DepositHolder is Owned, DepositHolderI {
    
	function DepositHolder(uint deposit)
	{
		require(deposit != 0);
	}
	
	/**
     * Event emitted when the deposit value has been set.
     * @param sender The account that ran the action.
     * @param depositWeis The value of the deposit measured in weis.
     */
    event LogDepositSet(address indexed sender, uint depositWeis);
    /**
     * Called by the owner of the DepositHolder.
     *     It should roll back if the caller is not the owner of the contract.
     *     It should roll back if the argument passed is 0.
     *     It should roll back if the argument is no different from the current deposit.
     * @param depositWeis The value of the deposit being set, measure in weis.
     * @return Whether the action was successful.
     * Emits LogDepositSet.
     */
    function setDeposit(uint depositWeis)
        public
        returns(bool success)
    {
        require(msg.sender != Owned.owner);
        require(depositWeis != 0);
        // not sure what this means
        LogDepositSet(msg.sender, depositWeis);
        return true;
    }
    
    /**
     * @return The base price, then to be multiplied by the multiplier, a given vehicle
     * needs to deposit to enter the road system.
     */
    function getDeposit()
        constant
        public
        returns(uint weis)
    {
        //need to 
        
        return 0;
    }
}
