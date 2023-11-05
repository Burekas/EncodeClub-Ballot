import { ethers } from "ethers";
import { Ballot__factory, Ballot } from "../typechain-types";
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // process args
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 2)
    throw new Error("Parameters not provided");
  const contractAddress = parameters[0];
  const voterAddress = parameters[1];

  // connect to provider 
  const provider = new ethers.JsonRpcProvider(process.env.INFURA_API_KEY ?? "");

  // wallet config
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  console.log(`Using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  // delegate vote to another voter
  const ballotFactory = new Ballot__factory(wallet);
  const ballotContract = await ballotFactory.attach(contractAddress) as Ballot;
  console.log(`Delegate vote to ${voterAddress}`);
  const tx = await ballotContract.delegate(voterAddress);
  const receipt = await tx.wait();
  console.log(`Transaction completed ${receipt?.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
