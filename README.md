# Merkle Airdrop 

This project implements a Merkle Airdrop using Solidity and JavaScript (TypeScript) to allow for efficient distribution of tokens to a list of eligible addresses. The project includes scripts to generate a Merkle tree, deploy the smart contract, and interact with it to claim airdropped tokens.

## Prerequisites

Ensure you have the following software installed:

- Node.js and npm (Node Package Manager)
- Hardhat (Ethereum development environment)
- TypeScript
- Ethers.js (Library for interacting with the Ethereum blockchain)
- CSV parser library (e.g., `csv-parser`)

## Setting Up the Project

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd MerkleAirdrop

2. **Install Dependencies:**

Install all necessary dependencies using npm:

```
npm install
```

3. **Compile the Smart Contracts:**

``` 
npm hardhat compile 
```



## Deploying the MerkleAirdrop Contract

1. **Set Up Environment Variables:**

Create a .env file in the root directory to store your private key and network configuration. For example:

```
PRIVATE_KEY=<your-private-key>
INFURA_API_KEY=<your-infura-api-key>
```

2. **Deploy the Contract:**

Run the Hardhat script to deploy the MerkleAirdrop contract. Make sure you pass the correct parameters (e.g., token address and Merkle root).

```
npx hardhat ignition deploy ignition/modules/MerkleAirdrop.ts --network <network-name>
```

Replace network-name with the target Ethereum network (e.g., mainnet, sepolia, lisk-sepolia).


## Running the Merkle Script



## Assumptions and Limitations

- **CSV Format**: The CSV file used for generating the Merkle tree should follow the exact format specified, with Ethereum addresses in the first column and token amounts in the second column. Any deviation from this format may lead to errors.

- **Claim Expiry**: The current implementation does not include functionality for the expiration of claims. If you require claims to be valid only for a certain period, additional logic must be added to the smart contract.

- **Single Use Proofs**: Merkle proofs generated for each address are intended for single use. This prevents double-claiming by the same address. Once an address has claimed its tokens, the proof cannot be reused.

- **Token Contract Assumptions**: The implementation assumes that the ERC20 token contract (`Web3CXI` in this case) complies fully with the ERC20 standard. Any deviation from the standard may require adjustments to the airdrop logic.

