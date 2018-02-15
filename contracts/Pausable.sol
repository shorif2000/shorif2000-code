pragma solidity ^0.4.13;

import './interfaces/PausableI.sol';
import './Owned.sol';

contract Pausable is Owned, PausableI {
    
	bool private paused = false;
	
	function Pausable(bool _paused)
	{
		paused = _paused;
	}
	
	/**
	 * @dev Modifier to make a function callable only when the contract is not paused.
	 */
	modifier whenNotPaused() 
	{ 
		require(!isPaused()); 
		_;
	}
	/**
	 * @dev Modifier to make a function callable only when the contract is paused.
	 */
	modifier whenPaused() 
	{
		require(isPaused());
		_;
	}
	
	/**
     * Event emitted when a new paused state has been set.
     * @param sender The account that ran the action.
     * @param newPausedState The new, and current, paused state of the contract.
     */
    event LogPausedSet(address indexed sender, bool indexed newPausedState);
    /**
     * Sets the new paused state for this contract.
     *     It should roll back if the caller is not the current owner of this contract.
     *     It should roll back if the state passed is no different from the current.
     * @param newState The new desired "paused" state of the contract.
     * @return Whether the action was successful.
     * Emits LogPausedSet.
     */
    function setPaused(bool newState) 
        fromOwner
        returns(bool success)
    {
        require(newState != paused);
        paused = newState;
        LogPausedSet(msg.sender, newState);
        return true;
    }
    /**
     * @return Whether the contract is indeed paused.
     */
    function isPaused() 
        constant 
        returns(bool isIndeed)
    {
        require(paused == true);
        return true;   
    }
	
}
