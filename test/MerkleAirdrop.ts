import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";
import { experimentalAddHardhatNetworkMessageTraceHook } from "hardhat/config";
import MerkleTree from "merkletreejs";

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
        const address = MerkleAirdrop.getAddress

        return {token,owner,otherAccount, MerkleAirdrop , merkleRoot, address }; 
        
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
            const { MerkleAirdrop, token, owner, address } = await loadFixture(deployMerkleAirdrop);
        
            const tokentest = ethers.parseUnits("10000", 18);
            const merkleProof = [
                '0xba76c39476a5d594b85a1f06b1b882175764bc1249357adc063e4b48ba097a7e',
                '0x049c621a1d72513a8dbbba58108a62863b18bbef573e740977f2c7091eb0e22f'
            ]; // This is the valid proof generated for the test address
        
            // Transfer tokens to the MerkleAirdrop contract
            await token.transfer(address(), tokentest);

            const amount = ethers.parseUnits("100", 18);
        
            // Claim the airdrop with the valid proof
            await expect(MerkleAirdrop.claimAirdrop(amount, merkleProof))
                .to.emit(MerkleAirdrop, "AirdropClaimed")
                .withArgs(owner.address, amount);
        
            // Ensure the owner's balance is updated
            expect(await token.balanceOf(owner.address)).to.equal(amount);
        });
        

        it("Should revert with an invalid proof", async function () {
            const { MerkleAirdrop, otherAccount } = await loadFixture(deployMerkleAirdrop);

            const amount = 100;  // The amount of tokens the owner should be able to claim
            const invalidMerkleProof = [
                '0x8fe1a810b793fec614caec0d7af611596b4815d610456c38f5f6513efb0316aa',
                '0x37d22bce811474fe6c917e10a81e8b64c9d038f00d9a793daasc01d161401d37'
              ]; // incorrect proof for testing

            await expect(MerkleAirdrop.connect(otherAccount).claimAirdrop(amount, invalidMerkleProof))
                .to.be.revertedWith("Invalid proof.");
        });

        
    })


  })

//   Merkle Root: 39aa00e64bb6ad9a05fb4736e600b8a686154b465f31b77171539f63f1ae24b2
// Merkle Proof for 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 with amount 100: [
//   '0xba76c39476a5d594b85a1f06b1b882175764bc1249357adc063e4b48ba097a7e',
//   '0x049c621a1d72513a8dbbba58108a62863b18bbef573e740977f2c7091eb0e22f'
// ]