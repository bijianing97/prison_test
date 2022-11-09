/* eslint-disable no-unused-vars */
import fs, { mkdirSync } from "fs";
import path from "path";
// eslint-disable-next-line node/no-unpublished-import
import { task, types } from "hardhat/config";
// eslint-disable-next-line node/no-unpublished-import
import { HardhatEthersHelpers } from "hardhat/types";
import { BigNumber } from "ethers";

const keystoresDir = path.join(__dirname, "../keystores");
const password = "tothemoon";

async function getContract(
  ethers: typeof import("/Users/sspin/myproject/solidity/prison_test/node_modules/ethers/lib/ethers") &
    HardhatEthersHelpers
) {
  const stakeManger = await ethers.getContractAt(
    "IStakeManager",
    "0x0000000000000000000000000000000000001001"
  );
  const prison = await ethers.getContractAt(
    "IPrison",
    "0x0000000000000000000000000000000000001008"
  );

  return { stakeManger, prison };
}

task("new-accounts", "Create new accounts and write private keys to .env")
  .addParam("count", "Number of accounts", undefined, types.int)
  .setAction(async function (args, { ethers }) {
    const count: number = args.count;
    const envPath = path.join(__dirname, "../.env");
    if (fs.existsSync(envPath)) {
      const data = fs.readFileSync(envPath, "utf-8").trim();
      for (const line of data.split("\n")) {
        if (line !== "" && !line.startsWith("#")) {
          throw new Error(".env is not empty, please backup .env first!");
        }
      }
    }
    for (let i = 1; i <= count; i++) {
      if (i === 1) {
        continue;
      }
      const wallet = ethers.Wallet.createRandom();
      fs.writeFileSync(
        envPath,
        `# address${i}: ${wallet.address}\nPRIVATE_KEY${i}=${wallet.privateKey}\n`,
        {
          flag: "a",
        }
      );
      fs.mkdirSync(path.join("/Users/sspin/reiMain/", `xxx${i + 10}`));
      fs.mkdirSync(
        path.join("/Users/sspin/reiMain/", `xxx${i + 10}/`, "keystore/")
      );
      fs.writeFileSync(
        path.join(
          path.join("/Users/sspin/reiMain/", `xxx${i + 10}`, "keystore/"),
          `${wallet.address}.json`
        ),
        await wallet.encrypt(password),
        {
          flag: "w",
        }
      );
      fs.appendFileSync(
        path.join(__dirname, "../script.txt"),
        `//node${i + 10}\n`
      );
      fs.appendFileSync(
        path.join(__dirname, "../script.txt"),
        `npx rei --verbosity debug --datadir ~/reiMain/xxx${
          i + 10
        } --p2p-tcp-port ${20000 + i * 2} --p2p-udp-port ${
          20000 + i * 2 + 1
        } --chain rei-devnet --mine --coinbase ${
          wallet.address
        } --bootnodes enr:-JG4QAqXwHHzaR2XJpHuBbFzlLdf5I6EC_yqRWRtx2wGaf4tIibvi_OJUu9MBBqnzuvirPRkDEwCIFkoKJq46SBNFKqGAYO_5xcjgmlkgnY0gmlwhMCoZCaJc2VjcDI1NmsxoQNmvl5uZ_eoyc-re4YYHVesOHSvmcPWYuh2xAZf1eN38YN0Y3CCXwGDdWRwgl8A --unlock ${
          wallet.address
        } --password ~/reiMain/password \n
        \n`
      );
      console.log(
        `generate address${i}: ${wallet.address}, the private key has been written to .env`
      );
    }
  });

task("info", "Get info from stakeManger and ")
  .addParam("blocknumber", "block number", undefined, types.int, true)
  .setAction(async function (args, { ethers }) {
    const blockNumber = args.blocknumber ?? "latest";
    console.log(
      "blockNumber: ",
      (await ethers.provider.getBlock(blockNumber)).number
    );
    const { stakeManger, prison } = await getContract(ethers);
    const indexValidatorLength = (
      await stakeManger.indexedValidatorsLength({
        blockTag: blockNumber,
      })
    ).toNumber();
    const indexValidators = [];
    for (let i = 0; i < indexValidatorLength; i++) {
      const indexValidator = await stakeManger.indexedValidatorsByIndex(i, {
        blockTag: blockNumber,
      });
      indexValidators.push(indexValidator);
    }
    // console.log("indexValidators: ", indexValidators); //
    const activeValidatorsLength = (
      await stakeManger.activeValidatorsLength({ blockTag: blockNumber })
    ).toNumber();
    console.log("activeValidatorsLength: ", activeValidatorsLength);
    const activeValidators: [string, string][] = [];
    for (let i = 0; i < activeValidatorsLength; i++) {
      const validator = (
        await stakeManger.activeValidators(i, { blockTag: blockNumber })
      )[0];
      const voteingPower = (
        await stakeManger.getVotingPowerByAddress(validator, {
          blockTag: blockNumber,
        })
      )
        .div(ethers.utils.parseEther("1"))
        .toString();
      activeValidators.push([validator, voteingPower]);
    }
    console.log("activeValidators: ", activeValidators);
    const totalVoteingPower = (
      await stakeManger.totalLockedAmount({ blockTag: blockNumber })
    )
      .div(ethers.utils.parseEther("1"))
      .toString();
    console.log("totalVoteingPower is :", totalVoteingPower);

    const defaultValidator = [
      "0x4779af7e65c055979c8100f2183635e5d28c78f5",
      "0x116f46eb05d5e42b4cd10e70b1b49706942f5948",
      "0x7d8f270d34a2b78ed7e64c173f82919ac1006374",
    ];

    const defaultValidators: [string, string][] = [];
    for (let i = 0; i < defaultValidator.length; i++) {
      const voteingPower = (
        await stakeManger.getVotingPowerByAddress(defaultValidator[i], {
          blockTag: blockNumber,
        })
      )
        .div(ethers.utils.parseEther("1"))
        .toString();
      defaultValidators.push([defaultValidator[i], voteingPower]);
    }
    console.log("defaultValidators: ", defaultValidators);
    const jailedValidatorsLength = (
      await prison.getJailedMinersLength({
        blockTag: blockNumber,
      })
    ).toNumber();
    const lowestRecordBlockNumber = (
      await prison.lowestRecordBlockNumber({
        blockTag: blockNumber,
      })
    ).toNumber();
    const jailedValidators = [];

    for (let i = 0; i < jailedValidatorsLength; i++) {
      const jailedValidatorAddress = await prison.getJailedMinersByIndex(i);
      const jailedValidator = await prison.miners(jailedValidatorAddress);
      jailedValidators.push(jailedValidator);
    }
    console.log("jailedValidators: ", jailedValidators);
  });

task("miner", "Get miner info")
  .addParam("address", "miner address", undefined, types.string)
  .addParam("blocknumber", "block number", undefined, types.int, true)
  .setAction(async function (args, { ethers }) {
    const blockNumber = args.blocknumber ?? "latest";
    const address = args.address;
    const { stakeManger, prison } = await getContract(ethers);
    const miner = await prison.miners(address, { blockTag: blockNumber });
    console.log(miner);
  });

task("stake", "Stake miner")
  .addParam("address", "miner address", undefined, types.string)
  .addParam("amount", "amount", undefined, types.string, true)
  .setAction(async function (args, { ethers }) {
    const signers = await ethers.getSigners();
    console.log(signers[0].address, (await signers[0].getBalance()).toString());
    const amount = args.amount ?? "100";
    const { stakeManger, prison } = await getContract(ethers);
    const tx = await stakeManger
      .connect(signers[0])
      .stake(args.address, signers[0].address, {
        value: ethers.utils.parseEther(amount),
      });
    const x = await tx.wait();
    console.log("stake successfully in block: ", x.blockNumber);
  });

task("votingpower", "Get miner votingpower")
  .addParam("address", "miner address", undefined, types.string)
  .addParam("blocknumber", "block number", undefined, types.int, true)
  .setAction(async function (args, { ethers }) {
    const blockNumber = args.blocknumber ?? "latest";
    const address = args.address;
    const { stakeManger, prison } = await getContract(ethers);
    const votingpower = await stakeManger.getVotingPowerByAddress(address, {
      blockTag: blockNumber,
    });
    // console.log(votingpower.div(ethers.utils.parseEther("1")).toString());
    console.log(votingpower.toString());
  });

task("unstakeall", "Unstake miner")
  .addParam("address", "miner address", undefined, types.string)
  .setAction(async function (args, { ethers }) {
    const signers = await ethers.getSigners();
    const { stakeManger, prison } = await getContract(ethers);
    const commissionAddress = (await stakeManger.validators(args.address))[1];
    const commission = await ethers.getContractAt(
      "ICommissionShare",
      commissionAddress
    );
    const shares = await commission.balanceOf(signers[0].address);
    console.log("shares: ", shares.toString());
    // await commission.approve(stakeManger.address, ethers.constants.MaxUint256);
    const tx1 = await commission.approve(
      stakeManger.address,
      ethers.constants.MaxUint256
    );
    await tx1.wait();
    const tx = await stakeManger
      .connect(signers[0])
      .startUnstake(args.address, signers[0].address, shares);
    const receipt = await tx.wait();
    console.log("unstake successfully in block: ", receipt.blockNumber);
  });

task("lowblock", "Get low block")
  .addParam("blocknumber", "block number", undefined, types.int, true)
  .setAction(async function (args, { ethers }) {
    const { stakeManger, prison } = await getContract(ethers);
    const blockNumber = args.blocknumber ?? "latest";
    for (let i = 3; i < 30; i++) {
      const lowestRecordBlockNumber = await prison.lowestRecordBlockNumber({
        blockTag: i,
      });
      console.log(
        `block ${i} lowestRecordBlockNumber: `,
        lowestRecordBlockNumber
      );
    }
  });

task("stakeAll", "Stake all").setAction(async function (args, { ethers }) {
  const signers = await ethers.getSigners();
  const { stakeManger, prison } = await getContract(ethers);
  for (let i = 2; i < signers.length; i++) {
    const tx = await stakeManger
      .connect(signers[0])
      .stake(signers[i].address, signers[0].address, {
        value: ethers.utils.parseEther("1000000"),
      });
    const x = await tx.wait();
    console.log("stake successfully in block: ", x.blockNumber);
  }
});
