#!/bin/bash
cd ./circuits/$1

# Start a new powers of tau ceremony and make a contribution (enter some random text)
npx snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v

# Prapare phase 2

npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v