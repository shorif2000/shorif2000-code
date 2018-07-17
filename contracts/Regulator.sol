pragma solidity ^0.4.13;

import './interfaces/RegulatorI.sol';
import './TollBoothOperator.sol';

contract Regulator is Owned, RegulatorI {
    
    mapping (address => bool ) private mTollBoothOperators;
    mapping (address => uint) private mVehicle;
    
	function Regulator() public
	{
	}
	
    
    event LogVehicleTypeSet(
        address indexed sender,
        address indexed vehicle,
        uint indexed vehicleType);

    function setVehicleType(address vehicle, uint vehicleType)
        fromOwner()
        public
        returns(bool success)
    {
        require(vehicle != 0x0);
        require(mVehicle[vehicle] != vehicleType);
        mVehicle[vehicle] = vehicleType;
        LogVehicleTypeSet(msg.sender, vehicle, vehicleType);
        return true;
    }
    

    function getVehicleType(address vehicle)
        constant
        public
        returns(uint vehicleType)
    {
        return mVehicle[vehicle];
    }
    

    event LogTollBoothOperatorCreated(
        address indexed sender,
        address indexed newOperator,
        address indexed owner,
        uint depositWeis);
        

    function createNewOperator(
            address owner,
            uint deposit)
        fromOwner()
        public
        returns(TollBoothOperatorI newOperator)
    {
        require(getOwner() != owner);
        TollBoothOperator nOperator = new TollBoothOperator(true,deposit,address(this));
        nOperator.setOwner(owner);
        LogTollBoothOperatorCreated(msg.sender,nOperator,owner,deposit);
        mTollBoothOperators[nOperator] = true;
        return TollBoothOperatorI(nOperator);
    }
    

    event LogTollBoothOperatorRemoved(
        address indexed sender,
        address indexed operator);

    function removeOperator(address operator)
        fromOwner
        public
        returns(bool success)
    {
        require(isOperator(operator));
        mTollBoothOperators[operator] = false;
        LogTollBoothOperatorRemoved(msg.sender,operator);
        return true;
    }
    

    function isOperator(address operator)
        constant
        public
        returns(bool indeed)
    {
        return mTollBoothOperators[operator];
    }
    
}
