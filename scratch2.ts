
const ethers = require('ethers');
const BigNumber = ethers.BigNumber;
const buildPoseidon = require("circomlibjs").buildPoseidon;

(async ()=> {
    const poseidon = await buildPoseidon();
    const poseidonHash = (items:BigInt[]|string[]|number[]) => BigNumber.from(poseidon(items).toString())
    const poseidonHash2 = (a:any, b:any) => poseidonHash([a, b]);
    console.log(BigNumber.from().toString());
})()


