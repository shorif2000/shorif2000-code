pragma solidity ^0.4.13;

import './interfaces/OwnedI.sol';

contract Owned is OwnedI {

	address public owner;

	function Ownable() {
		owner = msg.sender;
	}

	/*
	 * @dev rolls back the transaction if the transaction sender is not the owner
	 */
	modifier fromOwner() {
		require(msg.sender == owner);
		_;
	}

}
