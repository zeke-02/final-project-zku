import { IncrementalMerkleTree, HashFunction } from "@zk-kit/incremental-merkle-tree"
const buildPoseidon = require("circomlibjs").buildPoseidon;
const buildMimc = require("circomlibjs").buildMimc;
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

(async ()=> {
    const poseidon = await buildPoseidon();
    const tree = new IncrementalMerkleTree(poseidon, 4, BigInt(0), 5) // Quinary tree.
    const data =ethers.utils.toUtf8Bytes("asdf");
    const a = [BigInt(ethers.utils.hexlify(data))];
    const obj = {
        title: "title",
        body: "bodega"
    }
    const message1 = JSON.stringify(obj);
    const msg = poseidon([BigNumber.from(ethers.utils.toUtf8Bytes(message1))]);


    const id1 = new ZkIdentity(Strategy.RANDOM);
    const secret = id1.getSecret()
    const hash = id1.getSecretHash();
    tree.insert(hash);
    const id2 = new ZkIdentity(Strategy.RANDOM);
    const secret2 = id2.getSecret()
    const hash2 = id2.getSecretHash();
    tree.insert(hash2);
    const id3 = new ZkIdentity(Strategy.RANDOM);
    const secret3 = id3.getSecret()
    const hash3 = id3.getSecretHash();
    tree.insert(hash3);
    const proof: any = tree.createProof(0);
    const path_indices = proof.pathIndices;
    const path_elements = proof.siblings;
    console.log(secret);
    console.log(bufToBigint(poseidon(secret)));
    console.log(hash);

    /* const input = {
        root: BigNumber.from(ethers.utils.hexlify(tree.root)).toString(),
        leaf: BigNumber.from(ethers.utils.hexlify(hash)).toString(),
        secret: BigNumber.from(ethers.utils.hexlify(secret)).toString(),
        path_index: path_indices,
        salt: BigNumber.from("123131").toString(),
        msg: BigNumber.from(msg).toString(),
        path_elements:path_elements.map((e:number[])=>(BigNumber.from(e).toString()))
    }
    console.log(input); */
})()
// root, leaf, proof => indicies, path elements, msg => hash of actual string, salt