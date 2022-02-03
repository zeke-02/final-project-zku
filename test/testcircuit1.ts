const buildPoseidon = require("circomlibjs").buildPoseidon;
const snarkjs = require("snarkjs");
const fs = require("fs");
import { ethers } from "ethers"; 
import { randomBytes } from "@ethersproject/random"
import { bufToBigint } from "bigint-conversion"
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree"
import { sha256 as _sha256 } from "js-sha256"
const ff = require("ffjavascript");
const {unstringifyBigInts} = ff.utils;
const BigNumber = ethers.BigNumber;

const signZkey = './circuits/sign/circuit_final.zkey';
const signWasm = './circuits/sign/circuit.wasm';
const signWitnessFile = './circuits/sign/witness.wtns';
const signWitnessCalculator = require('../circuits/sign/witness_calculator');
import { generateMerkleProof, genExternalNullifier, genSignalHash, Semaphore } from "@zk-kit/protocols"

const generateWitness = async (inputSignals:any, wasm:any, WITNESS_FILE:any, witness_calculator:any) => {
    const buffer = fs.readFileSync(wasm);
    const witnessCalculator = await witness_calculator(buffer);
    const buff = await witnessCalculator.calculateWTNSBin(inputSignals, 0);
    fs.writeFileSync(WITNESS_FILE, buff);
    return buff;
  }


function genRandomNumber(numberOfBytes = 31): bigint {
    return bufToBigint(randomBytes(numberOfBytes))
  }

  function sha256(message: string): string {
    const hash = _sha256.create()
  
    hash.update(message)
  
    return hash.hex()
  }

// tests building a tree, building a tree proof, input to stuff
(async ()=> {
    let F: any;
    const poseidon = await buildPoseidon();
    F = poseidon.F;
    //console.log(F.eq(F.e("13034429309846638789535561449942021891039729847501137143363028890275222221409"), F.e(res2)));
    //console.log(F.toObject(res2).toString());
    const secret: BigInt = genRandomNumber();
    const leaf = poseidon([secret]);
    const tree = new IncrementalMerkleTree(poseidon, 4, BigInt(0), 5);
    tree.insert(F.toObject(leaf));
    for (let i=0; i<10; i++) {
        const priv = genRandomNumber();
        const leaf = poseidon([priv]);
        tree.insert(F.toObject(leaf));
    }
    console.log(tree.root);
    const root = F.toObject(tree.root).toString();
    const tree_proof: any = tree.createProof(0);
    console.log(tree.verifyProof(tree_proof));
    let path_indices = tree_proof.pathIndices;
    let path_elements = tree_proof.siblings;
    path_elements = path_elements.map((e: Array<bigint> | Array<Uint8Array>)=> {
        return e.map((j) => {
            if (typeof j === 'bigint') {
                return j;
            } else {
                return F.toObject(j);
            }
        })
    });
    let body = JSON.stringify({
        "title": "The title",
        "body": "the body"
    });
    let salt = poseidon([BigInt("0x" + sha256("a salt"))]);
    let msg = poseidon([BigInt("0x" + sha256(body))]);
    //console.log(F.toObject(msg).toString())
;    const input = {
        root: root,
        leaf: F.toObject(leaf),
        path_elements: path_elements,
        secret: secret,
        path_index: path_indices.map((e: number)=> {
            return e
        }),
        msg: F.toObject(msg),
        salt: F.toObject(salt)
    };
    const witness = await generateWitness(
        input, 
        signWasm, 
        signWitnessFile, 
        signWitnessCalculator
        );
      const { proof, publicSignals } = await snarkjs.groth16.prove(
        signZkey,
        signWitnessFile
      );
  
      const editedPublicSignals = unstringifyBigInts(publicSignals);
      const editedProof = unstringifyBigInts(proof);
    
      const calldata = await snarkjs.groth16.exportSolidityCallData(
        editedProof,
        editedPublicSignals
      );
})()