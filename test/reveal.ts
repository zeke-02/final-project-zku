import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree"
import { hash5, genRandomSalt, stringifyBigInts, poseidon, prove, verify, formatMessage } from '../ts/utils'
import assert from 'assert';
import { Proof } from '../ts/types'
import { generateMerkleProof } from "@zk-kit/protocols"

const test = async () => {
    const tree = new IncrementalMerkleTree(hash5, 4, BigInt(0), 5);
    const secret = BigInt(1);
    const salt = BigInt(2);
    const msg = ";aksjdf;lkasjdf;kjas;ldkjf;laksjdf;lkjasdl;kfj;laskjdf;ljas;ldkfj;alksjdf;lkajsdf;";
    const leaf = poseidon([secret]);

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
        msg: formatMessage(msg),
        secret,
        salt
    }
    //console.log(input);
    const result = await prove(stringifyBigInts(input),'sign');
    //console.log(result);
    //console.log(await verify(result.proof, result.publicSignals, 'sign'));
    const msgAttestation = result.publicSignals[0];
    const input2 = {
        secret,
        msg: formatMessage(msg),
        leaf,
        salt,
        msgAttestation,
        root: tree.root,
        path_elements: proof.siblings,
        path_index: proof.pathIndices,
    }
    console.log(input2);
    const result2 = await prove(stringifyBigInts(input2),'reveal');
    console.log(result2);
    console.log(await verify(result2.proof, result2.publicSignals, 'reveal'));
}

test();