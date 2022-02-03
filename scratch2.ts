
const ethers = require('ethers');

const BigNumber = ethers.BigNumber;
const buildPoseidon = require("circomlibjs").buildPoseidon;
const buildEddsa = require("circomlibjs").buildEddsa; 
const buildBabyjub = require("circomlibjs").buildBabyjub;

(async ()=> {
    let eddsa = await buildEddsa();
    let babyJub = await buildBabyjub();
    const poseidon = await buildPoseidon();
    /* let F = babyJub.F;
    const msg = F.e(1234);
    
    const prvKey = Buffer.from("0001020304050607080900010203040506070809000102030405060708090001", "hex");
    const pubKey = eddsa.prv2pub(prvKey);
    const signature = eddsa.signPoseidon(prvKey, msg);
    console.log(eddsa.verifyPoseidon(msg, signature, pubKey)); */

    /* const poseidonHash = (items:BigInt[]|string[]|number[]) => BigNumber.from(poseidon(items).toString())
    const poseidonHash2 = (a:any, b:any) => poseidonHash([a, b]);
    console.log(BigNumber.from().toString()); */
    const res2 = poseidon([3, 4,5,10,23]);
    let F = poseidon.F;
    console.log(F.eq(F.e("13034429309846638789535561449942021891039729847501137143363028890275222221409"), F.e(res2)));
    console.log(F.toObject(res2).toString());
})()


