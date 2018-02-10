pragma solidity ^0.4.13;

import './interfaces/OwnedI.sol';
import './interfaces/DepositHolderI.sol';

contract DepositHolder is OwnedI, DepositHolderI {

	function MultiplierHolder(uint deposit){
		require(deposit != 0);
	}
}
