import { ethers } from "hardhat";
import { ethers as _ethers } from "ethers";
import fs from 'fs';
import conduitControllerArtifacts from "../../artifacts/contracts/conduit/ConduitController.sol/ConduitController.json";
import alienswapArtifacts from "../../artifacts/contracts/Alienswap.sol/Alienswap.json";

let contractName: string;
let contractFactory: _ethers.ContractFactory;
let contract: _ethers.Contract;

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const conduitControllerAddress = "0x2eB4Ef12f7d0050db8aC54fb99BCA24f0f9D8E44"
    const contractCode = await ethers.provider.getCode(conduitControllerAddress);
    const codeHash = _ethers.utils.keccak256(contractCode);
    console.log("Code Hash:", codeHash);
    // 0xfbc5f338594ae61e7ae4bdfba220978f512d9ae8f737035054037f3e8c84f7af
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });