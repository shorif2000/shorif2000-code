pragma solidity ^0.4.13;

import './TollBoothHolder.sol';
import './interfaces/RoutePriceHolderI.sol';

contract RoutePriceHolder is TollBoothHolder, RoutePriceHolderI {
    
    mapping (address => mapping ( address => uint ) ) private mRoutePrice;
    
	function RoutePriceHolder()
	public
	{
	}
	
    event LogRoutePriceSet(
        address indexed sender,
        address indexed entryBooth,
        address indexed exitBooth,
        uint priceWeis);
        
    function setRoutePrice(
            address entryBooth,
            address exitBooth,
            uint priceWeis)
        fromOwner
        public
        returns(bool success)
    {
        require(entryBooth != 0x0);
        require(exitBooth != 0x0);
        require(isTollBooth(entryBooth));
        require(isTollBooth(exitBooth));
        require(entryBooth != exitBooth);
        require(getRoutePrice(entryBooth,exitBooth) != priceWeis);
        mRoutePrice[entryBooth][exitBooth] = priceWeis;
        LogRoutePriceSet(msg.sender,entryBooth,exitBooth,priceWeis);
        return true;
    }
    
    function getRoutePrice(
            address entryBooth,
            address exitBooth)
        constant
        public
        returns(uint priceWeis)
    {
        //@todo return 0 on failure
        require(entryBooth != 0x0);
        require(exitBooth != 0x0);
        require(isTollBooth(entryBooth));
        require(isTollBooth(exitBooth));
        require(entryBooth != exitBooth);
        
        return mRoutePrice[entryBooth][exitBooth];
    }
}
