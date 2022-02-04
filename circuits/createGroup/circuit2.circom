pragma circom 2.0.0;

include "./checkRoot.circom";

////////////////////////////////////////////
// Circuit goals: 
//  - Prove root and leaves are correct for an incrementalQuinTree
////////////////////////////////////////////

template CreateGroup (levels) {
    var LEAVES_PER_NODE = 5;
    var i;
    var totalLeaves = LEAVES_PER_NODE ** levels;
    
    signal input leaves[totalLeaves];
    signal input root;

    component checkRoot = QuinCheckRoot(levels);

    for (i = 0; i < totalLeaves; i ++) {
        checkRoot.leaves[i] <== leaves[i];
    }
    checkRoot.root === root;
}

component main{ public [root]} = CreateGroup(4);