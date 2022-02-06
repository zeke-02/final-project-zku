import { IncrementalMerkleTree} from "@zk-kit/incremental-merkle-tree";
import { hash5 } from "./ts/utils"
import MIMC from "./ts/mimc"

const tree = new IncrementalMerkleTree(MIMC,4,BigInt(0),5);
tree.insert(BigInt(1));
tree.insert(BigInt(2));
tree.insert(BigInt(3));
tree.insert(BigInt(4));

const proof: any = tree.createProof(0);
console.log(BigInt(proof.siblings[1][0]));