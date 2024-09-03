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

        return {token,owner,otherAccount, MerkleAirdrop , merkleRoot}; 
        
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

        it("Should have a correct merkle root", async function (){

            const {merkleRoot, MerkleAirdrop} = await loadFixture(deployMerkleAirdrop);

            expect (await MerkleAirdrop.merkleRoot()).to.equal(merkleRoot);
        })
        
    });


    describe("Claim Airdrop", async function() {
        it("Should allow a valid claim", async function () {
            const { MerkleAirdrop, token, owner } = await loadFixture(deployMerkleAirdrop);
            
            const amount = 100;  // The amount of tokens the owner should be able to claim
            const merkleProof = [
                '0x8fe1a810b793fec614caec0d7af611596b4815d610456c35c5f6513efb03165d',
                '0x37d22bce811474fe6c917e10a81e8b64c9d038f00d9a793dd8c02d161401d337'
              ]; // Replace with the actual Merkle proof generated for the merkle.ts script

            // Stransfer to the MerkleAirdrop contract
            await token.transfer(MerkleAirdrop.token(), amount);

            // Claim the airdrop with the valid proof
            await expect(MerkleAirdrop.claimAirdrop(amount, merkleProof))
                .to.emit(MerkleAirdrop, "AirdropClaimed")
                .withArgs(owner.address, amount);

            expect(await token.balanceOf(owner.address)).to.equal(amount);
        });

        it("Should revert with an invalid proof", async function () {
            const { MerkleAirdrop, otherAccount } = await loadFixture(deployMerkleAirdrop);

            const amount = 100;  // The amount of tokens the owner should be able to claim
            const invalidMerkleProof = [
                '0x8fe1a810b793fec614caec0d7af611596b4815d610456c38f5f6513efb03165d',
                '0x37d22bce811474fe6c917e10a81e8b64c9d038f00d9a793daasc02d161401d337'
              ]; // incorrect proof for testing

            await expect(MerkleAirdrop.connect(otherAccount).claimAirdrop(amount, invalidMerkleProof))
                .to.be.revertedWith("Invalid proof.");
        });

        it("Should not allow double claim", async function () {
            const { MerkleAirdrop, token, owner } = await loadFixture(deployMerkleAirdrop);
            
            const amount = 100;  // The amount of tokens the owner should be able to claim
            const merkleProof = [
                '0x8fe1a810b793fec614caec0d7af611596b4815d610456c35c5f6513efb03165d',
                '0x37d22bce811474fe6c917e10a81e8b64c9d038f00d9a793dd8c02d161401d337'
              ]; // Replace with the actual Merkle proof generated for the merkle.ts script

            // Simulate the token minting or transfer to the MerkleAirdrop contract
            await token.transfer(MerkleAirdrop.token(), amount);

            // First claim
            await MerkleAirdrop.claimAirdrop(amount, merkleProof);

            // Attempt to claim again
            await expect(MerkleAirdrop.claimAirdrop(amount, merkleProof))
                .to.be.revertedWithCustomError(MerkleAirdrop, "InvalidProof");
        });

    })


  })