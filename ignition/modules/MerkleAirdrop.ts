import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenAddress = "0x755B47353B00253b2Eeeb45495630156f48b0b8b";
const merkleRoot = "0x39aa00e64bb6ad9a05fb4736e600b8a686154b465f31b77171539f63f1ae24b2";

const MerkleAirdropModule = buildModule("MerkleAirdropModule", (m) => {

    const save = m.contract("MerkleAirdrop", [tokenAddress,merkleRoot]);

    return { save };
});

export default MerkleAirdropModule;