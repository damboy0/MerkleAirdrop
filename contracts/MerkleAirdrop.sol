// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MerkleAirdrop is Ownable {
    IERC20 public token;
    bytes32 public merkleRoot;
    mapping(address => bool) public hasClaimed;

    event AirdropClaimed(address indexed claimant, uint256 amount);

    // Constructor with an explicit call to the Ownable constructor, though unnecessary in most cases
    constructor(address _tokenAddress, bytes32 _merkleRoot) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
        merkleRoot = _merkleRoot;
    }

    function claimAirdrop(uint256 amount, bytes32[] calldata merkleProof) external {
        require(!hasClaimed[msg.sender], "Airdrop already claimed.");
        
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid proof.");

        hasClaimed[msg.sender] = true;

        require(token.transfer(msg.sender, amount), "Token transfer failed.");

        emit AirdropClaimed(msg.sender, amount);
    }

    function updateMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    // Function to withdraw remaining tokens after the airdrop
    function withdrawTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw.");
        require(token.transfer(owner(), balance), "Token transfer failed.");
    }
}
