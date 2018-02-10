pragma solidity ^0.4.13;

import './interfaces/OwnedI.sol';
import './interfaces/TollBoothHolderI.sol';
import './interfaces/RoutePriceHolderI.sol';

contract RoutePriceHolder is OwnedI, TollBoothHolderI, RoutePriceHolderI {

	function RoutePriceHolder(){
	}
}
