pragma solidity ^0.4.13;

import './interfaces/RegulatorI.sol';
import './interfaces/RegulatedI.sol';

contract Regulated is RegulatedI {
    
    address private currentRegulator;
    
	function Regulated(address regulator)
	{
		require(regulator != 0x0);
		currentRegulator = regulator;
	}
	
    event LogRegulatorSet(
        address indexed previousRegulator,
        address indexed newRegulator);
    
    function setRegulator(address newRegulator)
        public
        fromRegulator
        returns(bool success)
    {
        require(newRegulator == 0x0);
        require(currentRegulator != newRegulator);
        
        LogRegulatorSet(currentRegulator, newRegulator);
        currentRegulator = newRegulator;
        
        return true;
    }
    
    
    function getRegulator()
        constant
        public
        returns(RegulatorI regulator)
    {
        return RegulatorI(currentRegulator);      
    }
    
    modifier fromRegulator() {
    	require(msg.sender == currentRegulator);
	    _;
	}
}
