import { IncrementalMerkleTree, HashFunction } from "@zk-kit/incremental-merkle-tree"
const buildPoseidon = require("circomlibjs").buildPoseidon;
const buildMimc = require("circomlibjs").buildMimc;
import { hexToBigint } from "bigint-conversion"
import { ZkIdentity,  Strategy } from "@zk-kit/identity"
import { sha256 as _sha256 } from "js-sha256"
//identities to store the leaf, plus the root, plus a tree should be able to generate the proof off chain, emit leaves and order of leaves. static level = 4.
import {ethers} from "ethers";
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
        body: "jaslkdjflajsd;flkj"
    }
    const message1 = JSON.stringify(obj);
    const msg = hexToBigint(sha256(message1));

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
    console.log(path_elements);

    //const identity2 = new ZkIdentity(Strategy.SERIALIZED, serializedIdentity)
})()
//console.log(BigInt(ethers.utils.hexlify(ethers.utils.toUtf8Bytes("asdfjkasdf as;dljasja jsjs j"))));

// root, leaf, proof => indicies, path elements, msg => hash of actual string, salt