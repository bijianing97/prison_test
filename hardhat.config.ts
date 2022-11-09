import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "./tasks";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

function batchImportPrivateKey() {
  let i = 0;
  const privateKeys: string[] = [];
  while (process.env[`PRIVATE_KEY${i}`] !== undefined) {
    privateKeys.push(process.env[`PRIVATE_KEY${i++}`]!);
  }
  return privateKeys;
}

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    "local-dev": {
      url: "http://localhost:42000",
      accounts: batchImportPrivateKey(),
    },
    "rei-testnet": {
      url: "https://rpc-testnet.rei.network",
      accounts: batchImportPrivateKey(),
    },
    "local-main": {
      url: "http://localhost:42000",
      accounts: batchImportPrivateKey(),
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
