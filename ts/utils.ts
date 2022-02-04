import { strict as assert } from 'assert';
import * as crypto from 'crypto';
const snarkjs = require('snarkjs');
import fs from 'fs';
const ff = require('ffjavascript');
const { poseidon } = require('circomlibjs');

// circom files
const signZkey = '../circuits/sign/circuit_final.zkey';
const signWasm = '../circuits/sign/circuit.wasm';
const signWitnessFile = './circuits/sign/witness.wtns';
const signVkey = '../circuits/sign/verification_key.json';

const createGroupZkey = '../circuits/createGroup/circuit_final.zkey';
const createGroupWasm = '../circuits/createGroup/circuit.wasm';
const createGroupWitnessFile = './circuits/createGroup/witness.wtns';
const createGroupVkey = '../circuits/createGroup/verification_key.json';

const revealZkey = '../circuits/reveal/circuit_final.zkey';
const revealWasm = '../circuits/reveal/circuit.wasm';
const revealWitnessFile = './circuits/reveal/witness.wtns';
const revealVkey = '../circuits/reveal/verification_key.json';


const stringifyBigInts: (obj: object) => any = ff.utils.stringifyBigInts

// Hash up to 5 elements
const hash5 = (inputs: BigInt[]) => {
    assert(inputs.length === 5);
    return poseidon(inputs);
}

const SNARK_FIELD_SIZE = BigInt(21888242871839275222246405745257275088548364400416034343698204186575808495617);
const genRandomSalt = (): BigInt => {

    // Prevent modulo bias
    //const lim = BigInt('0x10000000000000000000000000000000000000000000000000000000000000000')
    //const min = (lim - SNARK_FIELD_SIZE) % SNARK_FIELD_SIZE
    const min = BigInt('6350874878119819312338956282401532410528162663560392320966563075034087161851')

    let rand
    while (true) {
        rand = BigInt('0x' + crypto.randomBytes(32).toString('hex'))

        if (rand >= min) {
            break
        }
    }

    const privKey = rand % SNARK_FIELD_SIZE
    assert(privKey < SNARK_FIELD_SIZE)

    return privKey
}

async function prove(inputs: Object, circuitType:string) {
    let wasm;
    let zkey;
    if (circuitType == 'sign'){
        wasm = signWasm;
        zkey = signZkey;
    } else if (circuitType == 'check-root'){
        wasm = createGroupWasm;
        zkey = createGroupZkey;
    } else if (circuitType == 'reveal') {
        wasm = revealWasm;
        zkey = revealZkey;
    } else {
        return { proof: null, publicSignals: null};
    }
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        wasm,
        zkey,
      );
    
    return {proof, publicSignals};
    
}

async function verify(proof:any, publicSignals:any, circuitType:string) { 
    let vkeyFile;
    if (circuitType == 'sign'){
        vkeyFile = signVkey;
    } else if (circuitType == 'check-root') {
        vkeyFile = createGroupVkey;
    } else if (circuitType == 'reveal'){
        vkeyFile = revealVkey;
    } else {
        return null;
    }
    let vKey = JSON.parse(fs.readFileSync(vkeyFile, 'utf8'));
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    return res;
  }

export {
    hash5,
    genRandomSalt,
    stringifyBigInts,
    poseidon,
    prove,
    verify
}