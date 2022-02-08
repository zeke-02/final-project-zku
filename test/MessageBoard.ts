import { expect } from "chai";
import { ethers } from "hardhat";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import {  genRandomSalt, prove, getCallData, formatMessage } from '../ts/utils';
import { MessageBoard } from "../typechain";
import MIMC from "../ts/mimc"

describe("MessageBoard", function () {
    let board: MessageBoard;
    beforeEach(async () => {
        const Board = await ethers.getContractFactory("MessageBoard");

        const Reveal = await ethers.getContractFactory("RevealVerifier");
        const Sign = await ethers.getContractFactory("SignVerifier");
        const RootVerifier = await ethers.getContractFactory("RootVerifier");
        const Register  = await ethers.getContractFactory("RegisterVerifier");

        const register = await Register.deploy();
        const reveal = await Reveal.deploy();
        const sign = await Sign.deploy();
        const rootVerifier = await RootVerifier.deploy();
        board = await Board.deploy(sign.address, rootVerifier.address, reveal.address, register.address);
    });

    it("Create Group Works correctly", async function () {
        const GroupName = "Doe You See Me?";
    
        const tree = new IncrementalMerkleTree(MIMC, 9, BigInt(0), 2);
        const secret = genRandomSalt();

        let leaves: bigint[] = [];
        for (let i=0;i<5*4 -1; i++){
            const rand = genRandomSalt();
            leaves.push(rand);
            tree.insert(rand);
        }
        const proof: any = tree.createProof(0);

        const proofInput = {
            root: tree.root,
            leaf: proof.leaf,
            pathElements: proof.siblings,
            pathIndices: proof.pathIndices,
        };
    
        const result = await prove(proofInput, 'check-root');
    
        const { _a, _b, _c, _input} = await getCallData(result.proof, result.publicSignals);
    
        const createGroupTx = await board.createGroup(GroupName, leaves, _a, _b, _c, _input);
        const finishedTx:any = await createGroupTx.wait();
        //console.log(finishedTx.events[0].getTransactionReceipt());
    });

    it("Correctly Adds Message", async () => {
        const GroupName = "Doe You See Me?";
    
        const tree = new IncrementalMerkleTree(MIMC, 9, BigInt(0), 2);
        const secret = genRandomSalt();
        const leaf = MIMC([secret]);
        tree.insert(leaf);

        let leaves: bigint[] = [];
        for (let i=0;i<5*4 -1; i++){
            const rand = genRandomSalt();
            leaves.push(rand);
            tree.insert(rand);
        }
        const proof: any = tree.createProof(0);

        const proofInput = {
            root: tree.root,
            leaf: proof.leaf,
            pathElements: proof.siblings,
            pathIndices: proof.pathIndices,
        };
        expect(proofInput.leaf).to.be.equal(leaf);
    
        const result = await prove(proofInput, 'check-root');
    
        let { _a, _b, _c, _input} = await getCallData(result.proof, result.publicSignals);
    
        const createGroupTx = await board.createGroup(GroupName, leaves, _a, _b, _c, _input);

        const message = "askldjf;dlkajsdl;fkja;lsjdfdl;kjas;ldkdfjf;lajsd;lfja;lskjdf;ljas;ldkfjlaksjd;lfkja;lskjdf;lkajsd;lkfja;sjdf";
        const salt = genRandomSalt();
        const msgInput = {
            msg: formatMessage(message),
            salt,
            root: tree.root,
            leaf: leaf,
            secret,
            pathElements:proof.siblings,
            pathIndices:proof.pathIndices
        }
        //console.log(msgInput);
        const result2 = await prove(msgInput, 'sign');
        //console.log(result2.publicSignals);
    
        const calldata = await getCallData(result2.proof, result2.publicSignals);
        //console.log(calldata);
        const addMessageTx = await board.sendMessage(message, calldata._a, calldata._b, calldata._c, calldata._input);
        const finalTx :any = await addMessageTx.wait();

        const revealInput = {
            msg: formatMessage(message),
            msgAttestation: result2.publicSignals[0],
            salt,
            leaf,
            secret,
            root: tree.root,
            pathElements:proof.siblings,
            pathIndices:proof.pathIndices
        };

        const result3 = await prove(revealInput, 'reveal');
        const calldata2 = await getCallData(result3.proof, result3.publicSignals);
        const revealTx = await board.revealMessage(calldata2._a, calldata2._b, calldata2._c, calldata2._input);
        const final = await revealTx.wait();
        console.log(final);
        const filter = board.filters.MessageRevealed();
        const data = await board.queryFilter(filter);
        console.log(data[0].args);
        const msg = await board.messages(tree.root, 0);
        console.log(msg);

    });
});
