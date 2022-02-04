pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";

///////////////////////////////////////////////////////////////////////////////////
// Circuit goals: 
//  - Prove msgAttestation = hash(salt, secret, msg)
//////////////////////////////////////////////////////////////////////////////////

template Main () {
    signal input salt;
    signal input secret;
    signal input msg;
    signal input msgAttestation;

    component hash = Poseidon(3);
    hash.inputs[0] <== salt;
    hash.inputs[1] <== secret;
    hash.inputs[2] <== msg;
    msgAttestation === hash.out;
}

component main {public [msgAttestation]} = Main();