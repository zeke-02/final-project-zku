#!/bin/bash
cd ./circuits/merkle_root
circom circuit.circom --r1cs --wasm --sym --c
cp ./circuit_js/circuit.wasm ./circuit.wasm
cp ./circuit_js/generate_witness.js ./generate_witness.js
cp ./circuit_js/witness_calculator.js ./witness_calculator.js
node generate_witness.js circut.wasm input.json witness.wtns
