// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "./stakeManager.sol";

contract batchStake {
    address public stakeManagerAddress =
        0x0000000000000000000000000000000000001001;

    function batchstake(address[] calldata _validators) external payable {
        IStakeManager stakemanager = IStakeManager(stakeManagerAddress);
        for (uint256 i = 0; i < _validators.length; i++) {
            stakemanager.stake{value: msg.value / _validators.length}(
                _validators[i],
                msg.sender
            );
        }
    }
}
