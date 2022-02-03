pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "./incrementalQuinTree.circom";

////////////////////////////////////////////
// Circuit goals: 
//  - prove leaf is in tree
//  - prove hash(secret) is leaf
//  - compute msgAttestation = hash(salt, secret, msg)
//  - msg is poseidon hash of message.
////////////////////////////////////////////

template Main(levels) {

    var LEAVES_PER_NODE = 5;
    var LEAVES_PER_PATH_LEVEL = LEAVES_PER_NODE - 1;

    // inputs for LeafExists
    signal input root;
    signal input path_elements[levels][LEAVES_PER_PATH_LEVEL];
    signal input path_index[levels];
    signal input leaf;

    // inputs for msgAttestation
    signal input salt;
    signal input secret;
    signal input msg;
    signal output msgAttestation;

    var i;
    var j;

    // proof leaf exists in root
    component verifier = QuinLeafExists(levels);
    verifier.leaf <== leaf;
    verifier.root <== root;
    for (var i = 0; i < levels; i ++) {
        verifier.path_index[i] <== path_index[i];
        for (var j = 0; j < LEAVES_PER_PATH_LEVEL; j ++) {
            verifier.path_elements[i][j] <== path_elements[i][j];
        }
    }

    // proof secret == leaf
    component hash1 = Poseidon(1);
    hash1.inputs[0] <== secret;
    hash1.out === leaf;

    // compute msgAttestation
    component hash2 = Poseidon(3);
    hash2.inputs[0] <== salt;
    hash2.inputs[1] <== secret;
    hash2.inputs[2] <== msg;
    msgAttestation <== hash2.out;
}

component main {public [root, msg]} = Main(4);