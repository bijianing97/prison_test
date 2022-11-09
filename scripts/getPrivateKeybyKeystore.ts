import { ethers } from "hardhat";
import path from "path";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const keystoresDir = path.join(__dirname, "/keystores");
  const password = process.env.PASSWORD!;
  const envPath = path.join(__dirname, "../.env");
  const files = fs.readdirSync(keystoresDir);
  for (let i = 0; i < files.length; i++) {
    const data = fs.readFileSync(path.join(keystoresDir, files[i]), "utf-8");
    const wallet = await ethers.Wallet.fromEncryptedJson(data, password);
    fs.writeFileSync(
      envPath,
      `# address${i}: ${wallet.address}\nPRIVATE_KEY${i}=${wallet.privateKey}\n`,
      {
        flag: "a",
      }
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
