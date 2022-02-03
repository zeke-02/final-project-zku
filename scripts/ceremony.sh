#!/bin/bash
cd ./circuits/merkle_root

# Start a new powers of tau ceremony and make a contribution (enter some random text)
npx snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v

# Prapare phase 2

npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

# Start a new zkey and make a contribution (enter some random text)

npx snarkjs zkey new circuit.r1cs pot12_final.ptau circuit_0000.zkey
npx snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="1st Contributor Name" -v