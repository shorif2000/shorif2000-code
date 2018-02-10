pragma solidity ^0.4.13;

import './interfaces/PausableI.sol';
import './interfaces/OwnedI.sol';

contract Pausable is OwnedI, PausableI {

	bool public paused = false;

	function Pausable(bool _paused){
		paused = _paused;
	}

	modifier whenNotPaused() { 
		require(!isPaused()); 
		_;
	}

	modifier whenPaused() {
		require(!isPaused());
		_;
	}
	
}
