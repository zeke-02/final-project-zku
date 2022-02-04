#!/bin/bash
cd ./circuits/$1
# cd ./circuits/sign
circom circuit.circom --r1cs --wasm --sym --c
cp ./circuit_js/circuit.wasm ./circuit.wasm
cp ./circuit_js/generate_witness.js ./generate_witness.js
cp ./circuit_js/witness_calculator.js ./witness_calculator.js

rm -rf circuit_cpp
rm -rf circuit_js

npx snarkjs zkey new circuit.r1cs pot12_final.ptau circuit_0000.zkey
npx snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="1st Contributor Name" -v
npx snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

npx snarkjs zkey export solidityverifier circuit_final.zkey verifier.sol
