import fs from 'fs';
import csv from 'csv-parser';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

// Define the type for CSV data
interface CsvRow {
  address: string;
  amount: string; // keep string to preserve CSV format
}

// Step 1: Read the CSV file and parse addresses and amounts
function readCSV(filePath: string): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const data: CsvRow[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: CsvRow) => {
        const address = row.address?.trim();
        const amount = row.amount?.trim();
        if (address && amount) {
          data.push({ address, amount });
        } else {
          console.warn('Skipping invalid row:', row);
        }
      })
      .on('end', () => {
        resolve(data);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Step 2: Hash each entry in the format keccak256(abi.encodePacked(address, amount))
function hashEntry(address: string, amount: string): Buffer {
  return Buffer.from(
    keccak256(Buffer.concat([
      Buffer.from(address.slice(2), 'hex'),
      Buffer.from(BigInt(amount).toString(16).padStart(64, '0'), 'hex')
    ])).toString('hex'), 'hex'
  );
}

// Function to generate Merkle tree and get Merkle proof for a specific address and amount
async function generateMerkleTree(filePath: string, addressToProof: string, amountToProof: string): Promise<void> {
  try {
    const data: CsvRow[] = await readCSV(filePath); // Read the CSV
    
    const leaves = data.map(row => hashEntry(row.address.toLowerCase(), row.amount)); // Hash each entry

    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true }); // Create Merkle Tree

    const merkleRoot: string = merkleTree.getRoot().toString('hex'); // Get Merkle Root

    console.log('Merkle Root:', merkleRoot);

    // Generate Merkle proof for the specific address and amount
    const leafToProof = hashEntry(addressToProof.toLowerCase(), amountToProof);
    const proof = merkleTree.getHexProof(leafToProof);

    console.log(`Merkle Proof for ${addressToProof} with amount ${amountToProof}:`, proof);
  } catch (error) {
    console.error('Error generating Merkle tree or proof:', error);
  }
}

// Call the function with the path to your CSV file and the address/amount to generate a proof
generateMerkleTree('list/address.csv', '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2', '100');
