pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "./incrementalQuinTree.circom";

///////////////////////////////////////////////////////////////////////////////////
// Circuit goals: 
//  - Prove msgAttestation = hash(salt, secret, msg)
//  - Prove leaf is part of a root
//////////////////////////////////////////////////////////////////////////////////

template Reveal (levels) {
    var LEAVES_PER_NODE = 5;
    var LEAVES_PER_PATH_LEVEL = LEAVES_PER_NODE - 1;

    signal input salt;
    signal input secret;
    signal input leaf;
    signal input msg;
    signal input msgAttestation;
    signal input root;
    signal input path_elements[levels][LEAVES_PER_PATH_LEVEL];
    signal input path_index[levels];

    component hash = Poseidon(3);
    hash.inputs[0] <== salt;
    hash.inputs[1] <== secret;
    hash.inputs[2] <== msg;
    msgAttestation === hash.out;

    component hash2 = Poseidon(1);
    hash2.inputs[0] <== secret;
    hash2.out === leaf;

    component checkRoot = QuinTreeInclusionProof(levels);
    checkRoot.leaf <== leaf;

    for (var i = 0; i < levels; i ++) {
        checkRoot.path_index[i] <== path_index[i];
        for (var j = 0; j < LEAVES_PER_PATH_LEVEL; j ++) {
            checkRoot.path_elements[i][j] <== path_elements[i][j];
        }
    }
    checkRoot.root === root;
}

component main {public [msgAttestation, leaf, msg, root]} = Reveal(4);