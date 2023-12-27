import { TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS } from "hardhat/builtin-tasks/task-names";
import { subtask, task } from "hardhat/config";

import { compareLastTwoReports } from "./scripts/compare_reports";
import { printLastReport } from "./scripts/print_report";
import { getReportPathForCommit } from "./scripts/utils";
import { writeReports } from "./scripts/write_reports";

import type { HardhatUserConfig } from "hardhat/config";

import "dotenv/config";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

// customize tasks
import "./tasks/test-task";
import "./tasks/create-conduit-controller";
import "./tasks/conduit-controller-codehashs";
import "./tasks/create-alienswap";

// const { ProxyAgent, setGlobalDispatcher } = require("undici");
// const proxyAgent = new ProxyAgent("http://127.0.0.1:33210");
// setGlobalDispatcher(proxyAgent);

// Filter Reference Contracts
subtask(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS).setAction(
  async (_, __, runSuper) => {
    const paths = await runSuper();

    return paths.filter((p: any) => !p.includes("contracts/reference/"));
  }
);

task("write-reports", "Write pending gas reports").setAction(
  async (taskArgs, hre) => {
    writeReports(hre);
  }
);

task("compare-reports", "Compare last two gas reports").setAction(
  async (taskArgs, hre) => {
    compareLastTwoReports(hre);
  }
);

task("print-report", "Print the last gas report").setAction(
  async (taskArgs, hre) => {
    printLastReport(hre);
  }
);

const optimizerSettingsNoSpecializer = {
  enabled: true,
  runs: 1_000_000,
  details: {
    peephole: true,
    inliner: true,
    jumpdestRemover: true,
    orderLiterals: true,
    deduplicate: true,
    cse: true,
    constantOptimizer: true,
    yulDetails: {
      stackAllocation: true,
    },
  },
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          viaIR: true,
          optimizer: { enabled: true, runs: 1000000 },
        },
      },
    ],
    overrides: {
      "contracts/conduit/Conduit.sol": {
        version: "0.8.14",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
      "contracts/conduit/ConduitController.sol": {
        version: "0.8.14",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
      "contracts/helper/TransferHelper.sol": {
        version: "0.8.14",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
    },
  },
  networks: {
    hardhat: {
      blockGasLimit: 30_000_000,
      throwOnCallFailures: false,
      allowUnlimitedContractSize: false,
    },
    verificationNetwork: {
      url: process.env.NETWORK_RPC ?? "",
    },
    "scroll-alpha": {
      url: "https://alpha-rpc.scroll.io/l2",
      accounts: process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : undefined,
    },
    "linea-testnet": {
      url: "https://rpc.goerli.linea.build",
      accounts: process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : undefined,
    },
    "linea-mainnet": {
      url: `https://linea-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : undefined,
    },
    "base-testnet": {
      url: "https://goerli.base.org",
      accounts: process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : undefined,
    },
    "base-mainnet": {
      url: `https://developer-access-mainnet.base.org`,
      accounts: process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : undefined,
    },

    arbitrum: {
      //mainet
      url: `https://rpc.ankr.com/arbitrum`,
      // url: "https://endpoints.omniatech.io/v1/arbitrum/one/public",
      // url: "https://arb1.arbitrum.io/rpc",
      accounts: process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : undefined,
    },

    optimism: {
      //mainet
      url: `https://rpc.ankr.com/optimism`,
      accounts: process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : undefined,
    },

    scroll: {
      //mainet
      // url: `https://rpc.scroll.io/`,
      url: "https://rpc.ankr.com/scroll",
      accounts: process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : undefined,
    },
    "zkfair-testnet": {
      url: "https://testnet-rpc.zkfair.io",
      accounts: process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : undefined,
    },
    zkfair: {
      url: "https://rpc.zkfair.io",
      accounts: process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : undefined,
    },
    "x1-testnet": {
      url: "https://testrpc.x1.tech",
      accounts: process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : undefined,
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    outputFile: getReportPathForCommit(),
    noColors: true,
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY!,
      mainnet: process.env.ETHERSCAN_API_KEY!,
      "scroll-alpha": "no_key_needed",
      "linea-testnet": "no_key_needed",
      "linea-mainnet": process.env.ETHERSCAN_API_KEY!,
      "base-testnet": "no_key_needed",
      "base-mainnet": process.env.ETHERSCAN_API_KEY!,
      arbitrum: process.env.ARBSCAN_API_KEY!,
      optimism: process.env.OP_API_KEY!,
      scroll: "no_key_needed",
      "zkfair-testnet": "no_key_needed",
      zkfair: "no_key_needed",
      "x1-testnet": "no_key_needed",
    },
    customChains: [
      {
        network: "scroll-alpha",
        chainId: 534353,
        urls: {
          apiURL: "https://blockscout.scroll.io/api",
          browserURL: "https://blockscout.scroll.io/",
        },
      },
      {
        network: "linea-testnet",
        chainId: 59140,
        urls: {
          apiURL: "https://explorer.goerli.linea.build/api",
          browserURL: "https://explorer.goerli.linea.build/",
        },
      },
      {
        network: "linea-mainnet",
        chainId: 59144,
        urls: {
          apiURL: "https://api.lineascan.build/api",
          browserURL: "https://lineascan.build/",
        },
      },
      {
        network: "base-testnet",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org",
        },
      },
      {
        network: "base-mainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "arbitrum",
        chainId: 42161,
        urls: {
          apiURL: "https://api.arbiscan.io/api",
          browserURL: "https://arbiscan.io",
        },
      },
      {
        network: "optimism",
        chainId: 10,
        urls: {
          apiURL: "https://api-optimistic.etherscan.io/api",
          browserURL: "https://explorer.optimism.io",
        },
      },
      {
        network: "scroll",
        chainId: 534352,
        urls: {
          apiURL: "https://blockscout.scroll.io/api",
          browserURL: "https://blockscout.scroll.io/",
        },
      },
      {
        network: "zkfair-testnet",
        chainId: 43851,
        urls: {
          apiURL: "https://testnet-scan.zkfair.io/api",
          browserURL: "https://testnet-scan.zkfair.io",
        },
      },
      {
        network: "zkfair",
        chainId: 42766,
        urls: {
          apiURL: "https://scan.zkfair.io/api",
          browserURL: "https://scan.zkfair.io",
        },
      },
      // https://www.oklink.com/docs/zh/#explorer-introduction
      {
        network: "x1-testnet",
        chainId: 195,
        urls: {
          // POST /api/v5/explorer/contract/verify-source-code
          apiURL: "https://www.oklink.com/",
          browserURL: " https://www.oklink.com/cn/x1-test",
        },
      }
    ],
  },
  // specify separate cache for hardhat, since it could possibly conflict with foundry's
  paths: { cache: "hh-cache" },
};

export default config;
