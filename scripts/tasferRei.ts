// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  const mainSigner = signers[0]; // account with balance

  console.log("signers: ", signers.length, "\nmainSigner:", mainSigner.address);

  for (let i = 0; i < signers.length; i++) {
    console.log("address: ", signers[i].address);
    const tx = await mainSigner.sendTransaction({
      to: signers[i].address,
      value: ethers.utils.parseEther("20000"),
    });
    await tx.wait();
    console.log(
      `singer ${signers[i].address} balance is:`,
      await (await signers[i].getBalance()).div(ethers.utils.parseEther("1"))
    );
  }
  console.log(
    `singer ${signers[1].address} balance is:`,
    (await signers[1].getBalance()).div(ethers.utils.parseEther("1"))
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
