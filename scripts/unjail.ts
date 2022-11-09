import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  const mainSigner = signers[0]; // account with balance
  const unjiailedSigner = new ethers.Wallet(
    "0x6e278d4346c80d1e2fc12cfa74cccf6797aa30abe95db29c14e9b153cf20c50a",
    ethers.provider
  );

  // console.log("signers: ", signers.length, "\nmainSigner:", mainSigner.address);

  const stakeManger = await ethers.getContractAt(
    "IStakeManager",
    "0x0000000000000000000000000000000000001001"
  );

  const pretx = await mainSigner.sendTransaction({
    to: unjiailedSigner.address,
    value: ethers.utils.parseEther("1001"),
  });
  await pretx.wait();
  //   const gasLimit = await stakeManger.estimateGas.unjail();
  //   console.log(gasLimit);
  console.log(await unjiailedSigner.getBalance());
  const tx = await stakeManger.connect(unjiailedSigner).unjail({
    value: ethers.utils.parseEther("1000"),
  });
  const receipt = await tx.wait();
  console.log("unjailed in block: ", receipt.blockNumber);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
