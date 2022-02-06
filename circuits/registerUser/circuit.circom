pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";

// prove user is owner of private key without revealing private key (preimage)

template verifyUser () {
    signal input secret;
    signal input hash;
    component hasher = Poseidon(1);
    hasher.inputs[0] <== secret;
    hasher.out === hash;
}

component main {public [hash] } = verifyUser();