import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";
import { experimentalAddHardhatNetworkMessageTraceHook } from "hardhat/config";

  describe("MerkleAirdrop", function() {

    async function deployToken() {

        const [owner, otherAccount] = await hre.ethers.getSigners(); //

        const erc20Token = await hre.ethers.getContractFactory("Web3CXI");

        const token = await erc20Token.deploy();

        return {token};
        
    }

    async function deployMerkleAirdrop() {

        const [owner, otherAccount] = await hre.ethers.getSigners();

        const { token } = await loadFixture(deployToken);
        const merkleRoot = "0x7e04896a13cb5b36c74cff3f59836eb6ad6e047a0099d2517a558a3fede515c3" //Merkle root generate using merkle.ts

        const Merkle = await hre.ethers.getContractFactory("MerkleAirdrop");

        const MerkleAirdrop = await Merkle.deploy(token,merkleRoot);

        return {token,owner,otherAccount, MerkleAirdrop}; 
        
    }

    describe("MerkleAirdrop Deployment", async function() {
        it("Should have correct owner", async function(){

            const {owner, MerkleAirdrop} = await loadFixture(deployMerkleAirdrop);

            expect(await MerkleAirdrop.owner()).to.equal(owner.address);
        });

        it("Should have correct token address", async function () {
            
            const { token , MerkleAirdrop } = await loadFixture(deployMerkleAirdrop);

            expect ( (token)).to.equal( await MerkleAirdrop.token());
        })
        
    });


  })