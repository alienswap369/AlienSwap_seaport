import hre, { ethers } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { Interface } from "@ethersproject/abi";
import { keccak256 } from "@ethersproject/solidity";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // 部署 conduit controller
  // const ConduitController = await ethers.getContractFactory(
  //   "ConduitController"
  // );
  // const conduitController = await ConduitController.deploy();
  // await conduitController.deployed();
  // console.log(
  //   "ConduitController Contract deployed to address:",
  //   conduitController.address
  // );

  // await delay(3000)

  // 部署alienswap合约  交易所的合约
  const Alienswap = await ethers.getContractFactory("Alienswap");

  // opensea官方部署的conduit controller
  const alienswap = await Alienswap.deploy("0x00000000f9490004c11cef243f5400493c00ad63"); 

  // const alienswap = await Alienswap.deploy("todo-conduit-controller");
  await alienswap.deployed();
  console.log("Alienswap Contract deployed to address:", alienswap.address);
}

async function deploy3(
  contractName: string,
  version: string,
  args: any[] = []
) {
  const [deployer] = await ethers.getSigners();
  // https://github.com/lifinance/create3-factory
  const create3Factory = new Contract(
    "0x93FEC2C00BfE902F733B57c5a6CeeD7CD1384AE1",
    new Interface([
      `
          function deploy(
            bytes32 salt,
            bytes memory creationCode
          ) returns (address)
        `,
      `
          function getDeployed(
            address deployer,
            bytes32 salt
          ) view returns (address)
        `,
    ]),
    deployer
  );

  const salt = keccak256(["string", "string"], [contractName, version]);
  const creationCode = await ethers
    .getContractFactory(contractName, deployer)
    .then((factory) => factory.getDeployTransaction(...args).data);

  await create3Factory.deploy(salt, creationCode);

  const deploymentAddress: string = await create3Factory.getDeployed(
    deployer.address,
    salt
  );
  return deploymentAddress;
}

async function verify(
  contractName: string,
  contractAddress: string,
  args: any[]
) {
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: args,
  });
  console.log(`"${contractName}" successfully verified on Etherscan`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
