pragma solidity ^0.4.13;

import './Owned.sol';
import './interfaces/TollBoothHolderI.sol';

contract TollBoothHolder is Owned, TollBoothHolderI {
    
    mapping (address => bool) private mTollBooth;
    
	function TollBoothHolder() public {}

    event LogTollBoothAdded(
        address indexed sender,
        address indexed tollBooth);
        
    function addTollBooth(address tollBooth)
        fromOwner
        public
        returns(bool success)
    {
        require(!isTollBooth(tollBooth));
        require(tollBooth != 0x0);
        mTollBooth[tollBooth] = true;
        LogTollBoothAdded(msg.sender,tollBooth);
        return true;
    }

    function isTollBooth(address tollBooth)
        constant
        public
        returns(bool isIndeed)
    {
        return mTollBooth[tollBooth];
    }

    event LogTollBoothRemoved(
        address indexed sender,
        address indexed tollBooth);

    function removeTollBooth(address tollBooth)
        fromOwner
        public
        returns(bool success)
    {
        require(mTollBooth[tollBooth]);
        require(tollBooth != 0x0);
        mTollBooth[tollBooth] = false;
        LogTollBoothRemoved(msg.sender,tollBooth);
        return true;
    }
	
}