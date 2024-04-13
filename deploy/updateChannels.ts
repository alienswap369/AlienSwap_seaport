import { Address } from "zksync-web3/build/src/types";
import {
    deployContract,
    getProvider,
    getWallet,
    deploySafeCreate2Contract,
} from "./utils";
import { ethers } from "ethers";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import fs from 'fs';
import localConduitController from '../artifacts-zk/contracts/conduit/ConduitController.sol/LocalConduitController.json';

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
    throw "⛔️ Private key not detected! Add it to the .env file!";

export function getSalt(sender: Address): string {
    const lastBytes = ethers.utils
        .keccak256(ethers.utils.toUtf8Bytes("lambda"))
        .slice(0, 26);
    console.log(`lastbytes: ${lastBytes}`);
    const salt = ethers.utils.concat([sender, lastBytes]);
    console.log(`sender: ${sender}`);
    console.log(`salt: ${salt}`);
    return ethers.utils.hexlify(salt);
}

export default async function () {
    const wallet = getWallet();

    // Deploy conduit-related contracts
    const conduitControllerAddress = "0x991416d9C09593ae0Ab57d20175005088627Ab26";
    const alienswapAddress = "0x2314EADa7E69447674c3f5A14cC1a930De556adB";
    const conduitAddress = "0xE5723c3Ec7D5fC203cBcDAB14c7AA7bDB0c22E69"
    const conduitControllerAbi = localConduitController.abi;
    const conduitController = new ethers.Contract(conduitControllerAddress, conduitControllerAbi, wallet);

    //Set up controller
    const gasLimit = ethers.BigNumber.from(3000000);
    const owner = "0xA34f0891c5DcfD524BcB0e9f38dEfEB40E0198C0";

    const channelsBefore = await conduitController.getChannels(conduitAddress)
    console.log(`channelsBefore: ${channelsBefore}`)

    await conduitController.updateChannel(conduitAddress, alienswapAddress, true,
        {
            gasLimit: gasLimit,
            maxFeePerGas: ethers.utils.parseUnits("0.135", "gwei"),
            maxPriorityFeePerGas: ethers.utils.parseUnits("0.0001", "gwei"),
        }
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const channelsAfter = await conduitController.getChannels(conduitAddress)
    console.log(`channelsAfter: ${channelsAfter}`)


}