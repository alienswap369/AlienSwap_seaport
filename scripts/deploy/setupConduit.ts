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

    const conduitControllerAddress = "0xCA348Ac579656Bdc268df1Ae2D1BDBD45FbCb927"
    const conduitAddress = "0x2F55f6e5b0fB5fd2Ab7b9d4B549C304F449f9Dc7"
    const conduitController = new _ethers.Contract(conduitControllerAddress, conduitControllerArtifacts.abi, deployer);

    const channelsBefore = await conduitController.getChannels(conduitAddress)
    console.log(`channelsBefore: ${channelsBefore}`)

    // await conduitController.updateChannel(conduitAddress, alienswap.address, true,
    //     //     {
    //     //         gasLimit: gasLimit,
    //     //         maxFeePerGas: ethers.utils.parseUnits("0.135", "gwei"),
    //     //         maxPriorityFeePerGas: ethers.utils.parseUnits("0.0001", "gwei"),
    //     //     }
    // );
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // const channelsAfter = await conduitController.getChannels(conduitAddress)
    // console.log(`channelsAfter: ${channelsAfter}`)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });