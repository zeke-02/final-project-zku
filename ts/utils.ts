import { strict as assert } from 'assert';
import * as crypto from 'crypto';
const signZkey = '../circuits/sign/circuit_final.zkey';
const signWasm = '../circuits/sign/circuit.wasm';
const signWitnessFile = './circuits/sign/witness.wtns';
const signVkey = '../circuits/sign/verification_key.json';
const snarkjs = require('snarkjs');
import fs from 'fs';
const ff = require('ffjavascript');
const { poseidon } = require('circomlibjs');

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

async function prove (inputs: Object) {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        signWasm,
        signZkey,
      );
    return {proof, publicSignals};
}
async function verify(proof:any, publicSignals:any) { 
    let vKey = JSON.parse(fs.readFileSync(signVkey, 'utf8'));
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