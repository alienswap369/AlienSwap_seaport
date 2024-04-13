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

    const immutableCreate2 = await deployContract("ImmutableCreate2Factory", [], { wallet });
    await immutableCreate2.deployed();
    fs.writeFileSync("deployed-contracts.txt", `ImmutableCreate2Factory deployed at: ${immutableCreate2.address}\n`);

    // Deploy conduit-related contracts
    const conduitControllerArtifact = "ConduitController";
    const conduitController = await deployContract(conduitControllerArtifact, [], { wallet });
    await conduitController.deployed();
    fs.appendFileSync("deployed-contracts.txt", `ConduitController deployed at: ${conduitController.address}\n`);

    // const conduitArtifact = "Conduit";
    // const conduit = await deployContract(conduitArtifact, [], { wallet });
    // await conduit.deployed();
    // fs.appendFileSync("deployed-contracts.txt", `Conduit deployed at: ${conduit.address}\n`);

    // Deploy Helpers contract
    const transferHelperArtifact = "TransferHelper";
    const transferHelper = await deployContract(transferHelperArtifact, [conduitController.address], { wallet });
    await transferHelper.deployed();
    fs.appendFileSync("deployed-contracts.txt", `TransferHelper deployed at: ${transferHelper.address}\n`);

    // Deploy with safeCreate2
    const transferHelper_address = await deploySafeCreate2Contract(
        provider,
        transferHelper,
        salt,
        immutableCreate2
    );

    // Deploy Alienswap contract
    const alienswapArtifact = "Alienswap";
    const alienswap = await deployContract(alienswapArtifact, [conduitController.address], { wallet });
    await alienswap.deployed();
    fs.appendFileSync("deployed-contracts.txt", `Alienswap deployed at: ${alienswap.address}\n`);

    //Set up controller
    const gasLimit = ethers.BigNumber.from(3000000);
    const owner = "0xA34f0891c5DcfD524BcB0e9f38dEfEB40E0198C0";
    const conduitKey = `${owner}000000000000000000000000`;
    await conduitController.createConduit(conduitKey, owner,
        {
            gasLimit: gasLimit,
            maxFeePerGas: ethers.utils.parseUnits("0.135", "gwei"),
            maxPriorityFeePerGas: ethers.utils.parseUnits("0.0001", "gwei"),
        }
    );
    console.log(`Conduit created with key: ${conduitKey}`)

    await new Promise((resolve) => setTimeout(resolve, 10000));

    const data = await conduitController.getConduit(conduitKey);
    const conduitAddress = data['conduit'];
    fs.appendFileSync("deployed-contracts.txt", `Conduit deployed at: ${conduitAddress}\n`);

    // const channelsBefore = await conduitController.getChannels(conduitAddress)
    // console.log(`channelsBefore: ${channelsBefore}`)

    // await conduitController.updateChannel(conduitAddress, alienswap.address, true,
    //     {
    //         gasLimit: gasLimit,
    //         maxFeePerGas: ethers.utils.parseUnits("0.135", "gwei"),
    //         maxPriorityFeePerGas: ethers.utils.parseUnits("0.0001", "gwei"),
    //     }
    // );
    // await new Promise((resolve) => setTimeout(resolve, 10000));

    // const channelsAfter = await conduitController.getChannels(conduitAddress)
    // console.log(`channelsAfter: ${channelsAfter}`)

    // Deploy with safeCreate2
    const alienswap_address = await deploySafeCreate2Contract(
        provider,
        alienswap,
        salt,
        immutableCreate2
    );

    // Deploy navigator contracts
    const seaportValidatorHelperArtifact = "SeaportValidatorHelper";
    const seaportValidatorHelper = await deployContract(seaportValidatorHelperArtifact, [], { wallet });
    await seaportValidatorHelper.deployed();
    fs.appendFileSync("deployed-contracts.txt", `SeaportValidatorHelper deployed at: ${seaportValidatorHelper.address}\n`);

    const seaportValidatorHelper_address = await deploySafeCreate2Contract(
        provider,
        seaportValidatorHelper,
        salt,
        immutableCreate2
    );

    const readOnlyOrderValidatorArtifact = "ReadOnlyOrderValidator";
    const readOnlyOrderValidatorHelper = await deployContract(readOnlyOrderValidatorArtifact, [], { wallet });
    await readOnlyOrderValidatorHelper.deployed();
    fs.appendFileSync("deployed-contracts.txt", `ReadOnlyOrderValidator deployed at: ${readOnlyOrderValidatorHelper.address}\n`);

    const readOnlyOrderValidatorHelper_address = await deploySafeCreate2Contract(
        provider,
        readOnlyOrderValidatorHelper,
        salt,
        immutableCreate2
    );

    const seaportValidatorArtifact = "SeaportValidator";
    const seaportValidator = await deployContract(
        seaportValidatorArtifact,
        [
            readOnlyOrderValidatorHelper.address,
            seaportValidatorHelper.address,
            conduitController.address,
        ],
        { wallet }
    );
    await seaportValidator.deployed();
    fs.appendFileSync("deployed-contracts.txt", `SeaportValidator deployed at: ${seaportValidator.address}\n`);

    const seaportValidator_address = await deploySafeCreate2Contract(
        provider,
        seaportValidator,
        salt,
        immutableCreate2
    );

    const requestValidatorArtifact = "RequestValidator";
    const requestValidator = await deployContract(requestValidatorArtifact, [], { wallet });
    await requestValidator.deployed();
    fs.appendFileSync("deployed-contracts.txt", `RequestValidator deployed at: ${requestValidator.address}\n`);
    const requestValidator_address = await deploySafeCreate2Contract(
        provider,
        requestValidator,
        salt,
        immutableCreate2
    );

    const criteriaHelperArtifact = "CriteriaHelper";
    const criteriaHelper = await deployContract(criteriaHelperArtifact, [], { wallet });
    await criteriaHelper.deployed();
    fs.appendFileSync("deployed-contracts.txt", `CriteriaHelper deployed at: ${criteriaHelper.address}\n`);

    const criteriaHelper_address = await deploySafeCreate2Contract(
        provider,
        criteriaHelper,
        salt,
        immutableCreate2
    );

    const validatorHelperArtifact = "ValidatorHelper";
    const validatorHelper = await deployContract(validatorHelperArtifact, [], { wallet });
    await validatorHelper.deployed();
    fs.appendFileSync("deployed-contracts.txt", `ValidatorHelper deployed at: ${validatorHelper.address}\n`);

    const validatorHelper_address = await deploySafeCreate2Contract(
        provider,
        validatorHelper,
        salt,
        immutableCreate2
    );

    const orderDetailsHelperArtifact = "OrderDetailsHelper";
    const orderDetailsHelper = await deployContract(orderDetailsHelperArtifact, [], { wallet });
    await orderDetailsHelper.deployed();
    fs.appendFileSync("deployed-contracts.txt", `OrderDetailsHelper deployed at: ${orderDetailsHelper.address}\n`);

    const orderDetailsHelper_address = await deploySafeCreate2Contract(
        provider,
        orderDetailsHelper,
        salt,
        immutableCreate2
    );

    const fulfillmentsHelperArtifact = "FulfillmentsHelper";
    const fulfillmentsHelper = await deployContract(fulfillmentsHelperArtifact, [], { wallet });
    await fulfillmentsHelper.deployed();
    fs.appendFileSync("deployed-contracts.txt", `FulfillmentsHelper deployed at: ${fulfillmentsHelper.address}\n`);

    const fulfillmentsHelperr_address = await deploySafeCreate2Contract(
        provider,
        fulfillmentsHelper,
        salt,
        immutableCreate2
    );

    const suggestedActionHelperArtifact = "SuggestedActionHelper";
    const suggestedActionHelper = await deployContract(suggestedActionHelperArtifact, [], { wallet });
    await suggestedActionHelper.deployed();
    fs.appendFileSync("deployed-contracts.txt", `SuggestedActionHelper deployed at: ${suggestedActionHelper.address}\n`);

    const suggestedActionHelper_address = await deploySafeCreate2Contract(
        provider,
        suggestedActionHelper,
        salt,
        immutableCreate2
    );

    const executionsHelperArtifact = "ExecutionsHelper";
    const executionsHelper = await deployContract(executionsHelperArtifact, [], { wallet });
    await executionsHelper.deployed();
    fs.appendFileSync("deployed-contracts.txt", `ExecutionsHelper deployed at: ${executionsHelper.address}\n`);

    const executionsHelper_address = await deploySafeCreate2Contract(
        provider,
        executionsHelper,
        salt,
        immutableCreate2
    );

    const seaportNavigatorArtifact = "SeaportNavigator";
    const seaportNavigator = await deployContract(
        seaportNavigatorArtifact,
        [
            requestValidator.address,
            criteriaHelper.address,
            validatorHelper.address,
            orderDetailsHelper.address,
            fulfillmentsHelper.address,
            suggestedActionHelper.address,
            executionsHelper.address,
        ],
        { wallet }
    );
    await seaportNavigator.deployed();
    fs.appendFileSync("deployed-contracts.txt", `SeaportNavigator deployed at: ${seaportNavigator.address}\n`);

    const seaportNavigator_address = await deploySafeCreate2Contract(
        provider,
        seaportNavigator,
        salt,
        immutableCreate2
    );

}
