import { ethers } from "hardhat";

async function main() {
  const start = 1730;
  const end = 1890;
  for (let i = start; i < end; i++) {
    const transactions = (await ethers.provider.getBlock(i)).transactions;
    for (let j = 0; j < transactions.length; j++) {
      const transaction = await ethers.provider.getTransaction(transactions[j]);
      //   console.log(`blockNumber: ${i}, transactionHash:`, transaction);
      console.log(
        JSON.stringify(
          await ethers.provider.getTransactionReceipt(transactions[j]),
          undefined,
          "\t"
        )
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
