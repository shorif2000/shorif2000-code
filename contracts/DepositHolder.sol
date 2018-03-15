pragma solidity ^0.4.13;

import './Owned.sol';
import './interfaces/DepositHolderI.sol';

contract DepositHolder is Owned, DepositHolderI {
    
    uint private deposit;
    
	function DepositHolder(uint _deposit) public
	{
		require(_deposit != 0);
		deposit = _deposit;
	}

    event LogDepositSet(address indexed sender, uint depositWeis);
    
    function setDeposit(uint depositWeis)
        fromOwner
        public
        returns(bool success)
    {
        require(depositWeis != 0);
        require(deposit != depositWeis);
        deposit = depositWeis;
        LogDepositSet(msg.sender, depositWeis);
        return true;
    }
    
    function getDeposit()
        constant
        public
        returns(uint weis)
    {
        return deposit;
    }
}
