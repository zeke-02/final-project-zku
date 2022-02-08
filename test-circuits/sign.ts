import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree"
import { hash5, genRandomSalt, stringifyBigInts, poseidon, prove, verify, formatMessage, getCallData } from '../ts/utils'
import assert from 'assert';
import { Proof } from '../ts/types'
import { generateMerkleProof } from "@zk-kit/protocols"
import MIMC from "../ts/mimc"

const test = async () => {
    const tree = new IncrementalMerkleTree(MIMC, 9, BigInt(0), 2);
    const secret = BigInt(1);
    const salt = BigInt(2);
    
    const leaf = BigInt(MIMC([secret]));

    tree.insert(leaf);
    for (let i=1; i<6; i++) {
        tree.insert(BigInt(i));
    }
    
    // input: root, path_elements, path_index, leaf, secret, salt, msg
    const proof: any = tree.createProof(0);
    const msg = JSON.stringify({
        title: "the title",
        body: "In the beginning God created the heaven and the earth. [2] And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters"
    });
    const input = {
        root: tree.root,
        leaf: proof.leaf,
        pathElements: proof.siblings,
        pathIndices: proof.pathIndices,
        msg: formatMessage(msg),
        secret,
        salt
    }
    console.log(input);
    let result = await prove(input,'sign');
    console.log(result);
    console.log(await verify(result.proof, result.publicSignals, 'sign'));
    let calldata = await getCallData(result.proof, result.publicSignals);
    const msgAttestation = result.publicSignals[0];
    console.log(calldata);

    const revealInput = {
        root: tree.root,
        leaf: proof.leaf,
        pathElements: proof.siblings,
        pathIndices: proof.pathIndices,
        msg: formatMessage(msg),
        secret,
        salt,
        msgAttestation
    };

    result = await prove(revealInput,'reveal');
    console.log(await verify(result.proof, result.publicSignals, 'reveal'));
    calldata = await getCallData(result.proof, result.publicSignals);
}

test();