// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const Greeter = await ethers.getContractFactory("Revea");
  // const greeter = await Greeter.deploy("Hello, Hardhat!");

  // await greeter.deployed();

  // console.log("Greeter deployed to:", greeter.address);
  const Board = await ethers.getContractFactory("MessageBoard");

  const Reveal = await ethers.getContractFactory("RevealVerifier");
  const Sign = await ethers.getContractFactory("SignVerifier");
  const RootVerifier = await ethers.getContractFactory("RootVerifier");
  const Register  = await ethers.getContractFactory("RegisterVerifier");

  const register = await Register.deploy();
  const reveal = await Reveal.deploy();
  const sign = await Sign.deploy();
  const rootVerifier = await RootVerifier.deploy();
  const board = await Board.deploy(sign.address, rootVerifier.address, reveal.address, register.address);
  console.log("MessageBoard deployed to:", board.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
