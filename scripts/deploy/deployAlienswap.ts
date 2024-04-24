import { ethers } from "hardhat";
import { ethers as _ethers } from "ethers";
import fs from 'fs';
import verify from '../utils/verify';

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
    contractFactory = await ethers.getContractFactory(contractName);
    args = [];
    const conduitController = await contractFactory.deploy();
    await conduitController.deployed();
    const conduitControllerAddress = conduitController.address;
    await verify(conduitControllerAddress, args)

    console.log(`${contractName} address:`, conduitControllerAddress);
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
    const owner = "0xDc17C60E799174f18cc6527a52d60462df84bc97";
    const conduitKey = `${owner}000000000000000000000000`;
    await conduitController.createConduit(conduitKey, owner,
        // {
        //     gasLimit: gasLimit,
        //     maxFeePerGas: ethers.utils.parseUnits("0.135", "gwei"),
        //     maxPriorityFeePerGas: ethers.utils.parseUnits("0.0001", "gwei"),
        // }
    );
    console.log(`Conduit created with key: ${conduitKey}`)
    fs.appendFileSync("deployed-contracts.txt", `ConduitKey: ${conduitKey}\n`);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const data = await conduitController.getConduit(conduitKey);
    const conduitAddress = data['conduit'];
    fs.appendFileSync("deployed-contracts.txt", `Conduit: ${conduitAddress}\n`);
    await verify(conduitAddress, [])

    const channelsBefore = await conduitController.getChannels(conduitAddress)
    console.log(`channelsBefore: ${channelsBefore}`)

    await conduitController.updateChannel(conduitAddress, alienswap.address, true,
        //     {
        //         gasLimit: gasLimit,
        //         maxFeePerGas: ethers.utils.parseUnits("0.135", "gwei"),
        //         maxPriorityFeePerGas: ethers.utils.parseUnits("0.0001", "gwei"),
        //     }
    );
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