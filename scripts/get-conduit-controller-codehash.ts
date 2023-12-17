import { ethers, network } from "hardhat";

async function main() {
  // base mainnet check
  // npx hardhat run scripts/get-conduit-controller-codehash.ts --network base-mainnet
  // const conduitControllerAddr = "0x00000000f9490004c11cef243f5400493c00ad63";

  // npx hardhat run scripts/get-conduit-controller-codehash.ts --network zkfair-testnet
  const conduitControllerAddr = "0x7A2457be35277e4703a18a4481b409Db1ECf8357";
  const controller = await ethers.getContractAt("ConduitController", conduitControllerAddr);

  const result = await controller.getConduitCodeHashes();
  // 最终使用 creationCodeHash
  console.log(`${network.name} condit-controller ${conduitControllerAddr} query (bytes32 creationCodeHash, bytes32 runtimeCodeHash): \n${result}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
