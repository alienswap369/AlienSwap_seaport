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
    const provider = getProvider();
    const wallet = getWallet();
    const deployer = new Deployer(hre, wallet);
    const salt = getSalt(wallet.address);

    const conduitArtifact = "Conduit";
    const conduit = await deployContract(conduitArtifact, [], { wallet });
    await conduit.deployed();
    fs.writeFileSync("conduit-contracts.txt", `Conduit deployed at: ${conduit.address}\n`);

    const alienswapAddress = "0xc30be300542FA1E9E1965A4077A9Dd0782481773"
    const gasLimit = ethers.BigNumber.from(3000000);

    await conduit.updateChannel(alienswapAddress, true,
        {
            gasLimit: gasLimit,
            maxFeePerGas: ethers.utils.parseUnits("0.135", "gwei"),
            maxPriorityFeePerGas: ethers.utils.parseUnits("0.0001", "gwei"),
        }
    )

    await new Promise((resolve) => setTimeout(resolve, 10000));


}