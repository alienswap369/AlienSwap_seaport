import { ethers } from "hardhat";

async function main() {
  // 没搜到opensea官方部署的地址 0x00000000f9490004c11cef243f5400493c00ad63， 自己在新链上部署
  // 部署 conduit controller
  const ConduitController = await ethers.getContractFactory(
    "ConduitController"
  );

  const conduitController = await ConduitController.deploy();
  await conduitController.deployed();
  console.log(
    "ConduitController Contract deployed to address:",
    conduitController.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
