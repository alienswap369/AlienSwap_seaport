import * as fs from 'fs';

// npx hardhat create-alienswap --network x1-testnet xxx-conduit-controller-addr 
task("create-alienswap", "Create alienswap contract")
  .addPositionalParam("controller")
  .setAction(async (taskArgs, hre) => {
    // console.log(`[debug] taskArgs: ${JSON.stringify(taskArgs, null, 3)}`);
    const ethers = hre.ethers;
    const network = hre.network;
    const conduitControllerAddr = taskArgs.controller;

    const Alienswap = await ethers.getContractFactory("Alienswap");
    const alienswap = await Alienswap.deploy(conduitControllerAddr);
    const result = await alienswap.deployed();

    const info = `
## ${new Date().toISOString()} network: ${network.name} deploy Alienswap with controller: ${conduitControllerAddr}
!!! Alienswap Contract address: ${alienswap.address}
`;

    console.log(info);

    const contentToAppend = info;
    const filePath = './deploy-logs.txt';
    if (network.name != "hardhat") {
      try {
        await fs.promises.appendFile(filePath, contentToAppend);
        console.log('Content has been appended to file:', filePath);
      } catch (err) {
        console.error('Error appending to file:', err);
      }
    }
  });