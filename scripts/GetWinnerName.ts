import { ethers } from "ethers";
import { Ballot__factory, Ballot } from "../typechain-types";
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // process args
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 1)
    throw new Error("Contract Address required");
  const contractAddress = parameters[0];

  // provider config
  const provider = new ethers.JsonRpcProvider(process.env.INFURA_API_KEY ?? "");

  // wallet config
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

  // cast a vote
  const ballotFactory = new Ballot__factory(wallet);
  const ballotContract = await ballotFactory.attach(contractAddress) as Ballot;
  const winner = await ballotContract.winnerName();
  const winnerName = ethers.decodeBytes32String(winner);
  console.log(`Winner is '${winnerName}'`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
