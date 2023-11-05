import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const PROPOSALS = ["Prop 1", "Prop 2", "Prop 3"]

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.encodeBytes32String(array[index]));
  }
  return bytes32Array;
}

async function deployContract() {
  const signers = await ethers.getSigners();
  const ballotFactory = await ethers.getContractFactory("Ballot");
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(PROPOSALS)
  );
  await ballotContract.waitForDeployment();
  return {signers, ballotContract};
}

describe("Ballot", async () => {

  describe("when the contract is deployed", async () => {

    it("has the provided proposals", async () => {
      const {ballotContract} = await loadFixture(deployContract);
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.decodeBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });
    it("has zero votes for all proposals", async () => {
      const {ballotContract} = await loadFixture(deployContract);
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount).to.eq(0);
      }
    });
    it("sets the deployer address as chairperson", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const deployerAddress = signers[0].address;
      const chairpersonAddress = await ballotContract.chairperson();
      expect(deployerAddress).to.equal(chairpersonAddress);
    });
    it("sets the voting weight for the chairperson as 1", async () => {
      const {ballotContract} = await loadFixture(deployContract);
      const chairpersonAddress = await ballotContract.chairperson();
      const chairpersonVoter = await ballotContract.voters(chairpersonAddress);
      expect(chairpersonVoter.weight).to.equal(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {

    it("gives right to vote for another address", async () => {
      const {ballotContract} = await loadFixture(deployContract);
      const tx = await ballotContract.giveRightToVote(ethers.ZeroAddress);
      await tx.wait();
      const voter = await ballotContract.voters(ethers.ZeroAddress)
      expect(voter.weight).to.eq(1);
    });
    it("can not give right to vote for someone that has voted", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const signer = signers[1];
      const txGiveRight = await ballotContract.giveRightToVote(signer.address);
      await txGiveRight.wait();
      const txVote = await ballotContract.connect(signer).vote(0);
      await txVote.wait();
      await expect(
        ballotContract.giveRightToVote(signer.address)
      ).to.be.revertedWith("The voter already voted.");
    });
    it("can not give right to vote for someone that has already voting rights", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const signer = signers[1];
      const tx = await ballotContract.giveRightToVote(signer.address);
      await tx.wait();
      await expect(
        ballotContract.giveRightToVote(signer.address)
      ).to.be.revertedWithoutReason();
    });
  });

  describe("when the voter interacts with the vote function in the contract", async () => {
    it("should register the vote", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const signer = signers[1];
      const proposalIndex = 0;
      const txGiveRight = await ballotContract.giveRightToVote(signer.address);
      await txGiveRight.wait();
      const txVote = await ballotContract.connect(signer).vote(proposalIndex);
      await txVote.wait();
      const proposal = await ballotContract.proposals(proposalIndex);
      const voter = await ballotContract.voters(signer.address);
      expect(voter.voted).to.be.true;
      expect(voter.vote).to.eq(proposalIndex);
      expect(proposal.voteCount).to.eq(voter.weight);
    });
  });

  describe("when the voter interacts with the delegate function in the contract", async () => {
    it("should transfer voting power", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const voterAccount = signers[1];
      const delegateAccount = signers[2];
      const txGiveRighttoVoter = await ballotContract.giveRightToVote(voterAccount.address);
      await txGiveRighttoVoter.wait();
      const txGiveRighttoDelegate = await ballotContract.giveRightToVote(delegateAccount.address);
      await txGiveRighttoDelegate.wait();
      let voter = await ballotContract.voters(voterAccount.address);
      let delegate = await ballotContract.voters(delegateAccount.address);
      // Voted delegate increase votes instead of weight
      expect(delegate.voted).to.be.false;
      const totalWeight = voter.weight + delegate.weight;
      const txDelegate = await ballotContract.connect(voterAccount).delegate(delegateAccount.address);
      await txDelegate.wait();
      delegate = await ballotContract.voters(delegateAccount.address);
      voter = await ballotContract.voters(voterAccount.address);
      expect(voter.voted).to.be.true;
      expect(voter.delegate).to.eq(delegateAccount.address);
      expect(delegate.weight).to.eq(totalWeight);
    });
  });

  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when an account without right to vote interacts with the vote function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    // TODO
    it("should return 0", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    // TODO
    it("should return 0", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winnerName function before any votes are cast", async () => {
    // TODO
    it("should return name of proposal 0", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    // TODO
    it("should return name of proposal 0", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
    // TODO
    it("should return the name of the winner proposal", async () => {
      throw Error("Not implemented");
    });
  });
});
