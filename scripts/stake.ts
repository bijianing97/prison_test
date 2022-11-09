import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  const mainSigner = signers[0]; // account with balance
  console.log("signers: ", signers.length, "\nmainSigner:", mainSigner.address);
  console.log(
    "balance: ",
    (await mainSigner.getBalance()).div(ethers.utils.parseEther("1")).toString()
  );

  const batchStakeContract = await ethers.getContractFactory("batchStake");
  // const batchStake = await batchStakeContract.deploy();
  // await batchStake.deployed();
  const batchStake = batchStakeContract.attach(
    "0xC6A3dE6D659fad45CF853683f936A6d956b5Df4f"
  );
  console.log("batchStake deployed to:", batchStake.address);
  const batchStakeAddress = signers.map((signer) => signer.address);
  const batchStakeAddress1 = batchStakeAddress.slice(0, 10);
  const batchStakeAddress2 = batchStakeAddress.slice(
    10,
    batchStakeAddress.length
  );
  const tx1 = await batchStake.batchstake(batchStakeAddress1, {
    value: ethers.utils.parseEther(
      (5000000 * batchStakeAddress1.length).toString()
    ),
  });
  await tx1.wait();
  console.log("batchStakeAddress1: ", batchStakeAddress1.length);
  const tx2 = await batchStake.batchstake(batchStakeAddress2, {
    value: ethers.utils.parseEther(
      (5000000 * batchStakeAddress2.length).toString()
    ),
  });
  await tx2.wait();
  console.log("batchStakeAddress2: ", batchStakeAddress2.length);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
