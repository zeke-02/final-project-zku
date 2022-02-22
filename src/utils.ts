//import * as crypto from 'crypto';
import fs from 'fs';


import { ethers } from 'ethers';
import MIMC from './mimc'
const Buffer = require('buffer').Buffer;

declare const snarkjs;
// const ff = require('ffjavascript');
// const stringifyBigInts: (obj: object) => any = ff.utils.stringifyBigInts

// circom files
const signZkey = 'http://localhost:8000/sign/circuit_final.zkey';
const signWasm = 'http://localhost:8000/sign/circuit.wasm';
const signWitnessFile = '.http://localhost:8000/sign/witness.wtns';
const signVkey = 'http://localhost:8000/sign/verification_key.json';

const createGroupZkey = 'http://localhost:8000/checkRoot/circuit_final.zkey';
const createGroupWasm = 'http://localhost:8000/checkRoot/circuit.wasm';
const createGroupWitnessFile = 'http://localhost:8000/checkRoot/witness.wtns';
const createGroupVkey = 'http://localhost:8000/checkRoot/verification_key.json';

const revealZkey = 'http://localhost:8000/reveal/circuit_final.zkey';
const revealWasm = 'http://localhost:8000/reveal/circuit.wasm';
const revealWitnessFile = 'http://localhost:8000/reveal/witness.wtns';
const revealVkey = 'http://localhost:8000/reveal/verification_key.json';

const registerZkey = 'http://localhost:8000/register/circuit_final.zkey';
const registerWasm = 'http://localhost:8000/register/circuit.wasm';
const registerWitnessFile = 'http://localhost:8000/register/witness.wtns';
const registerVkey = 'http://localhost:8000/register/verification_key.json';


function stringifyBigInts(o) {
    if ((typeof(o) == "bigint") || o.eq !== undefined)  {
        return o.toString(10);
    } else if (Array.isArray(o)) {
        return o.map(stringifyBigInts);
    } else if (typeof o == "object") {
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = stringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

const SNARK_FIELD_SIZE = BigInt(21888242871839275222246405745257275088548364400416034343698204186575808495617);

type circuitTypes = "sign" | "check-root" | "reveal" | "register";

const genRandomSalt = (): bigint => {

    // Prevent modulo bias
    //const lim = BigInt('0x10000000000000000000000000000000000000000000000000000000000000000')
    //const min = (lim - SNARK_FIELD_SIZE) % SNARK_FIELD_SIZE
    const min = BigInt('6350874878119819312338956282401532410528162663560392320966563075034087161851')

    let rand
    while (true) {
        //rand = BigInt('0x' + crypto.randomBytes(32).toString('hex'))
        
        rand = BigInt('0x' + Buffer.from(ethers.utils.randomBytes(32)).toString('hex'))
        if (rand >= min) {
            break
        }
    }

    const privKey = rand % SNARK_FIELD_SIZE;
    return privKey;
}

const genPair = () => {
    const secret = genRandomSalt();
    const leaf = MIMC([secret]);
    return {
        secret,
        leaf
    }
}

async function prove(inputs: Object, circuitType:circuitTypes) {
    let wasm;
    let zkey;
    inputs = stringifyBigInts(inputs);
    if (circuitType === 'sign'){
        wasm = signWasm;
        zkey = signZkey;
    } else if (circuitType === 'check-root'){
        wasm = createGroupWasm;
        zkey = createGroupZkey;
    } else if (circuitType === 'reveal') {
        wasm = revealWasm;
        zkey = revealZkey;
    } else if (circuitType === 'register') {
        wasm = registerWasm;
        zkey = registerZkey;
    }
    else {
        return { proof: null, publicSignals: null};
    }
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        wasm,
        zkey,
    );
    
    return {proof, publicSignals};
    
}

async function verify(proof:any, publicSignals:any, circuitType:circuitTypes) { 
    let vkeyFile;
    if (circuitType == 'sign'){
        vkeyFile = signVkey;
    } else if (circuitType == 'check-root') {
        vkeyFile = createGroupVkey;
    } else if (circuitType == 'reveal'){
        vkeyFile = revealVkey;
    } else if (circuitType == 'register'){
        vkeyFile = registerVkey;
    } else {
        return null;
    }
    let resp = await fetch(vkeyFile);
    let vKey = resp.json();
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    return res;
  }

function formatMessage(str:string):BigInt { // ethers.utils.toUtf8Bytes(str)
    return BigInt(ethers.utils.solidityKeccak256(["string"], [str])) % SNARK_FIELD_SIZE;
}

async function getCallData(proof: any, publicSignals: any){
    const editedProof = unstringifyBigInts(proof);
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const calldata = await snarkjs.groth16.exportSolidityCallData(
        editedProof,
        editedPublicSignals
      );
    //console.log(calldata);
    const calldataSplit = calldata.split(",");
    let _a = eval(calldataSplit.slice(0, 2).join());
    let _b = eval(calldataSplit.slice(2, 6).join());
    let _c = eval(calldataSplit.slice(6, 8).join());
    let _input = eval(calldataSplit.slice(8).join());
    return {
        _a,
        _b,
        _c,
        _input
    };
}

export {
    genRandomSalt,
    stringifyBigInts,
    prove,
    verify,
    formatMessage,
    getCallData,
    genPair
}