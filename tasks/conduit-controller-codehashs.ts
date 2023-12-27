task("conduit-controller-codehashs", "Get conduit-controller codes hash")
  .addPositionalParam("controller")
  .setAction(async (taskArgs, hre) => {
    // console.log(`[debug] taskArgs: ${JSON.stringify(taskArgs, null, 3)}`);
    const ethers = hre.ethers;
    const network = hre.network;
    const conduitControllerAddr = taskArgs.controller;
    const controller = await ethers.getContractAt("ConduitController", conduitControllerAddr);
    const result = await controller.getConduitCodeHashes();
    // 最终使用 creationCodeHash
    const info = `
## ${new Date().toISOString()} network: ${network.name} query codehash on conduit-controller ${conduitControllerAddr}
query (bytes32 creationCodeHash, bytes32 runtimeCodeHash) with result:
${result}
ONLY need first creationCodeHash, 提示： 手动copy 输出到 deploy-log.txt 方便后续配置
`;

    console.log(info);
  });
