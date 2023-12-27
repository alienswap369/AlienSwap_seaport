// npx hardhat test-task --network x1-testnet
task("test-task", "Try hardhat task usage")
  .setAction(async (taskArgs, hre) => {
    console.log(`[debug] taskArgs: ${JSON.stringify(taskArgs, null, 3)}`);
    // const ethers = hre.ethers;
    const network = hre.network;
    console.log(`current network: ${network.name}`);
  });
