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
import alienswapArtifacts from '../artifacts-zk/contracts/Alienswap.sol/Alienswap.json';

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
    const alienswapAddress = "0xc30be300542FA1E9E1965A4077A9Dd0782481773";
    const alienswapAbi = alienswapArtifacts.abi;
    const alienswap = new ethers.Contract(alienswapAddress, alienswapAbi, wallet);

    //Set up controller
    const gasLimit = ethers.BigNumber.from(3000000);

    const parameters = {
        "considerationToken": "0x0000000000000000000000000000000000000000",
        "considerationIdentifier": "0",
        "considerationAmount": "995000000000000",
        "offerer": "0xc2fbf29d907467df28a8803c1bab84fcc7447ac7",
        "zone": "0x0000000000000000000000000000000000000000",
        "offerToken": "0x517ba0649cab0ec623692be3bb32a008c4a7eb5d",
        "offerIdentifier": "1",
        "offerAmount": "1",
        "basicOrderType": 0,
        "startTime": 1710436344,
        "endTime": 1715706803,
        "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "salt": "81670195239837170992383714305688447261425447831377724673366340832859296993930",
        "offererConduitKey": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "fulfillerConduitKey": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "totalOriginalAdditionalRecipients": 1,
        "additionalRecipients": [{
            "amount": "5000000000000",
            "recipient": "0x7d5f459f1cfa967d560cc6c466e6af230d799988"
        }],
        "signature": "0xde26708705e62c4b6e2e4026deb9581c95f20e2ad662b6a8c7edc1aa5dcc3af606a51386133ad6957f855b14a25ee40d3fa82a61c93dbb2f81dc0330431a75b71c"
    };

    // await alienswap.fulfillBasicOrder(parameters, {
    //     value: ethers.utils.parseEther("0.001"),
    //     gasLimit: gasLimit,
    // });

    // const functionSignature = 'fulfillBasicOrder_efficient_6GL6yc((address,uint256,uint256,address,address,address,uint256,uint256,uint8,uint256,uint256,bytes32,uint256,bytes32,bytes32,uint256,(uint256,address)[],bytes))'; //0x00000000
    // const functionSignature = '_validateAndFulfillBasicOrder((address,uint256,uint256,address,address,address,uint256,uint256,uint8,uint256,uint256,bytes32,uint256,bytes32,bytes32,uint256,(uint256,address)[],bytes))'; //0x5ce98067
    const functionSignature = ''
    const functionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(functionSignature));
    const functionSelector = functionHash.substring(0, 10); // first 4 bytes
    console.log('Function Selector:', functionSelector);
}