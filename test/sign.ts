import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree"
import { hash5, genRandomSalt, stringifyBigInts, poseidon, prove, verify } from '../ts/utils'
import assert from 'assert';
import { Proof } from '../ts/types'
import { generateMerkleProof } from "@zk-kit/protocols"

const test = async () => {
    const tree = new IncrementalMerkleTree(hash5, 4, BigInt(0), 5);
    const secret = BigInt(1);
    const salt = BigInt(2);
    const msg = BigInt(100);
    const leaf = poseidon([secret]);
    console.log(leaf);

    tree.insert(leaf);
    for (let i=1; i<6; i++) {
        tree.insert(BigInt(i));
    }
    
    // input: root, path_elements, path_index, leaf, secret, salt, msg
    const proof: any = tree.createProof(0);
    assert(tree.verifyProof(proof));
    for (let i=0; i< proof.siblings.length; i++) {
        proof.siblings[i].shift();
    }
    const input = {
        root: tree.root,
        leaf: proof.leaf,
        path_elements: proof.siblings,
        path_index: proof.pathIndices,
        msg,
        secret,
        salt
    }
    console.log(input);
    const result = await prove(stringifyBigInts(input));
    console.log(await verify(result.proof, result.publicSignals));
}

test();