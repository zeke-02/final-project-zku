import { IncrementalMerkleTree, HashFunction } from "@zk-kit/incremental-merkle-tree"
// const buildPoseidon = require("circomlibjs").buildPoseidon;
// const buildMimc = require("circomlibjs").buildMimc;
import { bufToBigint } from "bigint-conversion"
import { ZkIdentity,  Strategy } from "@zk-kit/identity"
import { sha256 as _sha256 } from "js-sha256"

//identities to store the leaf, plus the root, plus a tree should be able to generate the proof off chain, emit leaves and order of leaves. static level = 4.
import {ethers} from "ethers";
const BigNumber = ethers.BigNumber;
import { arrayify } from "ethers/lib/utils";

function sha256(message: string): string {
    const hash = _sha256.create()
  
    hash.update(message)
  
    return hash.hex()
  }

// (async ()=> {
//     const poseidon = await buildPoseidon();
//     const tree = new IncrementalMerkleTree(poseidon, 4, BigInt(0), 5) // Quinary tree.
//     const data =ethers.utils.toUtf8Bytes("asdf");
//     const a = [BigInt(ethers.utils.hexlify(data))];
//     const obj = {
//         title: "title",
//         body: "bodega"
//     }
//     const message1 = JSON.stringify(obj);
//     const msg = poseidon([BigNumber.from(ethers.utils.toUtf8Bytes(message1))]);


//     const id1 = new ZkIdentity(Strategy.RANDOM);
//     const secret = id1.getSecret()
//     const hash = id1.getSecretHash();
//     tree.insert(hash);
//     const id2 = new ZkIdentity(Strategy.RANDOM);
//     const secret2 = id2.getSecret()
//     const hash2 = id2.getSecretHash();
//     tree.insert(hash2);
//     const id3 = new ZkIdentity(Strategy.RANDOM);
//     const secret3 = id3.getSecret()
//     const hash3 = id3.getSecretHash();
//     tree.insert(hash3);
//     const proof: any = tree.createProof(0);
//     const path_indices = proof.pathIndices;
//     const path_elements = proof.siblings;
//     console.log(secret);
//     console.log(bufToBigint(poseidon(secret)));
//     console.log(hash);

//     /* const input = {
//         root: BigNumber.from(ethers.utils.hexlify(tree.root)).toString(),
//         leaf: BigNumber.from(ethers.utils.hexlify(hash)).toString(),
//         secret: BigNumber.from(ethers.utils.hexlify(secret)).toString(),
//         path_index: path_indices,
//         salt: BigNumber.from("123131").toString(),
//         msg: BigNumber.from(msg).toString(),
//         path_elements:path_elements.map((e:number[])=>(BigNumber.from(e).toString()))
//     }
//     console.log(input); */
// })
let a = BigInt("0x18c382276b7041e18428698c40928fb945caa11c7c17a14ba76ca226f348614f");
console.log(a);
// root, leaf, proof => indicies, path elements, msg => hash of actual string, salt
// /6339376953794120212305173511643445710199846405115161075824833779408191007436n => msgHash

//6632122846111875241776143886536620305780803088646333720499955741945685465409n
//1223342556774553248545410027812059461049201661568040128159571105937176344872n => 0x02b463295c1faf99d010f49be59d55849b36b4c7e25785a641a8eddc619f3928
//11200941833407776260097722721017501578986980626356265653844186481275617960271n