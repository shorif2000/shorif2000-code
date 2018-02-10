pragma solidity ^0.4.13;

import './interfaces/OwnedI.sol';
import './interfaces/PausableI.sol';
import './interfaces/RegulatedI.sol';
import './interfaces/MultiplierHolderI.sol';
import './interfaces/DepositHolderI.sol';
import './interfaces/TollBoothHolderI.sol';
import './interfaces/RoutePriceHolderI.sol';
import './interfaces/TollBoothOperatorI.sol';

contract TollBoothOperator is OwnedI, PausableI, RegulatedI, MultiplierHolderI, DepositHolderI, TollBoothHolderI,
	RoutePriceHolderI, TollBoothOperatorI {

	bool public paused;
	uint public deposit;
	address public regulator;

	function TollBoothOperator(bool _paused, uint _deposit, address _regulator){
		require(deposit != 0);
		require(regulator != 0x0);
		paused = _paused;
		deposit = _deposit;
		regulator = _regulator;
	}

	function() { revert(); }
}
