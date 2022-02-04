pragma circom 2.0.0;

include "./incrementalQuinTree.circom";

////////////////////////////////////////////
// Circuit goals: 
//  - Prove root and leaves are correct for an incrementalQuinTree
////////////////////////////////////////////

template Main (levels) {
    var LEAVES_PER_NODE = 5;
    var LEAVES_PER_PATH_LEVEL = LEAVES_PER_NODE - 1;

    signal input leaf;
    signal input path_index[levels];
    signal input path_elements[levels][LEAVES_PER_PATH_LEVEL];
    signal input root;

    var i;
    var j;

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

component main{ public [root]} = Main(4);