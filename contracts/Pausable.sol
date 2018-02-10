pragma solidity ^0.4.13;

import './interfaces/PausableI.sol';
import './interfaces/OwnedI.sol';

contract Pausable is OwnedI, PausableI {

	bool public paused = false;

	function Pausable(bool _paused){
		paused = _paused;
	}
	
	/**
	 * @dev Modifier to make a function callable only when the contract is not paused.
	 */
	modifier whenNotPaused() { 
		require(!isPaused()); 
		_;
	}

	/**
	 * @dev Modifier to make a function callable only when the contract is paused.
	 */
	modifier whenPaused() {
		require(!isPaused());
		_;
	}
	
}
