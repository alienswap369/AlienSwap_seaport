import * as fs from 'fs';

// npx hardhat create-conduit-controller --network x1-testnet
task("create-conduit-controller", "Create Seaport ConduitController contract")
  .setAction(async (taskArgs, hre) => {
    // console.log(`[debug] taskArgs: ${JSON.stringify(taskArgs, null, 3)}`);
    const ethers = hre.ethers;
    const network = hre.network;

    // 没搜到opensea官方部署的地址 0x00000000f9490004c11cef243f5400493c00ad63 
    // 在新链上自己部署 conduit controller
    const ConduitController = await ethers.getContractFactory("ConduitController");
    const conduitController = await ConduitController.deploy();
    const result = await conduitController.deployed();

    const info = `

## ${new Date().toISOString()} network: ${network.name} deploy ConduitController 
Contract address: ${conduitController.address}

Next steps: 
  npx hardhat conduit-controller-codehashs --network ${network.name} ${conduitController.address}
  npx hardhat create-alienswap --network ${network.name} ${conduitController.address}
    `;

    console.log(info);

    const contentToAppend = info;
    const filePath = './deploy-logs.txt';
    if (network.name != "hardhat") {
      try {
        await fs.promises.appendFile(filePath, contentToAppend);
        console.log('Content has been appended to file: ', filePath);
      } catch (err) {
        console.error('Error appending to file:', err);
      }
    }
  });