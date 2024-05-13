import { ethers } from "hardhat";
import { ethers as _ethers } from "ethers";
import fs from 'fs';
import verify from '../utils/verify';
import conduitControllerArtifacts from '../../artifacts/contracts/conduit/ConduitController.sol/ConduitController.json';

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

    // contractName = "ConduitController";
    // contractFactory = await ethers.getContractFactory(contractName);
    // args = [];
    // const conduitController = await contractFactory.deploy();
    // await conduitController.deployed();
    // const conduitControllerAddress = conduitController.address;
    // await verify(conduitControllerAddress, args)

    // console.log(`${contractName} address:`, conduitControllerAddress);
    // fs.writeFileSync("deployed-contracts.txt", `${contractName}: ${conduitControllerAddress}\n`);
    contractName = "ConduitController";
    const conduitControllerAddress = "0x00000000F9490004C11Cef243f5400493c00Ad63"
    const conduitController = new _ethers.Contract(conduitControllerAddress, conduitControllerArtifacts.abi, deployer)
    fs.writeFileSync("deployed-contracts.txt", `${contractName}: ${conduitControllerAddress}\n`);

    contractName = "Alienswap";
    contractFactory = await ethers.getContractFactory(contractName);

    args = [conduitControllerAddress];
    const alienswap = await contractFactory.deploy(conduitControllerAddress);
    await alienswap.deployed();
    const alienswapAddress = alienswap.address;
    await verify(alienswapAddress, args)

    console.log(`${contractName} address:`, alienswapAddress);
    fs.appendFileSync("deployed-contracts.txt", `${contractName}: ${alienswapAddress}\n`);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    //Set up controller
    // const gasLimit = ethers.BigNumber.from(3000000);
    const owner = "0xBb2Aa4B3656d859D36376BA525d9A67091EBcc72";
    const conduitKey = `${owner}000000000000000000000000`;
    await conduitController.createConduit(conduitKey, owner);
    console.log(`Conduit created with key: ${conduitKey}`)
    fs.appendFileSync("deployed-contracts.txt", `ConduitKey: ${conduitKey}\n`);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const data = await conduitController.getConduit(conduitKey);
    const conduitAddress = data['conduit'];
    console.log(`Conduit address:`, conduitAddress)
    fs.appendFileSync("deployed-contracts.txt", `Conduit: ${conduitAddress}\n`);

    const channelsBefore = await conduitController.getChannels(conduitAddress)
    console.log(`channelsBefore: ${channelsBefore}`)

    await conduitController.updateChannel(conduitAddress, alienswapAddress, true);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const channelsAfter = await conduitController.getChannels(conduitAddress)
    console.log(`channelsAfter: ${channelsAfter}`)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });