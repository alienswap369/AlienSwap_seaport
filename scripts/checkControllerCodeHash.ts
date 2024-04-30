import { ethers } from "hardhat";
import { ethers as _ethers } from "ethers";
import fs from 'fs';
import verify from './utils/verify';
import conduitControllerArtifacts from '../artifacts/contracts/conduit/ConduitController.sol/ConduitController.json';

let contractName: string;
let contractFactory: _ethers.ContractFactory;
let contract: _ethers.Contract;
let args: any[] = [];

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    contractName = "ConduitController";
    const conduitControllerAddress = "0x00000000F9490004C11Cef243f5400493c00Ad63"
    const conduitController = new _ethers.Contract(conduitControllerAddress, conduitControllerArtifacts.abi, deployer)

    const owner = "0xDc17C60E799174f18cc6527a52d60462df84bc97";
    const conduitKey = `${owner}000000000000000000000000`;

    const codeHash = await conduitController.getConduitCodeHashes();
    console.log(codeHash)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });