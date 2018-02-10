pragma solidity ^0.4.13;

import './interfaces/RegulatedI.sol';

contract Regulated is RegulatedI {

	function Regulated(address regulator){
		require(regulator != 0x0);
	}
}
