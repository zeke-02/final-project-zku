import { expect } from "chai";
import { ethers } from "hardhat";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import {  genRandomSalt, prove, getCallData, formatMessage } from '../ts/utils';
import { MessageBoard } from "../typechain";
import MIMC from "../ts/mimc"
import { rootCertificates } from "tls";
import { send } from "process";

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
        let users = [];
        let secrets = [];
        let secret1 = genRandomSalt();
        let pub1 = MIMC([secret1]);
        let secret2 = genRandomSalt();
        let pub2 = MIMC([secret2]);
        let secret3 = genRandomSalt();
        let pub3 = MIMC([secret3]);
        let secret4 = genRandomSalt();
        let pub4 = MIMC([secret4]);
        let secret5 = genRandomSalt();
        let pub5 = MIMC([secret5]);

        users.push(pub1,pub2,pub3,pub4,pub5);
        secrets.push(secret1,secret2, secret3, secret4, secret5);

        const tree = new IncrementalMerkleTree(MIMC, 9, BigInt(0), 2);

        for (let i=0; i< users.length; i++) {
            const proofInputs = {
                secret: secrets[i],
                hash: users[i]
            }
            const snarkResult = await prove(proofInputs, 'register');
            const { _a, _b, _c, _input} = await getCallData(snarkResult.proof, snarkResult.publicSignals);
            const registerUserTx = await board.registerUser(_a, _b, _c, _input);
            tree.insert(users[i]);
        }

        const proof: any = tree.createProof(0);

        const proofInput = {
            root: tree.root,
            leaf: pub1,
            pathElements: proof.siblings,
            pathIndices: proof.pathIndices,
        };
    
        const checkRootResult = await prove(proofInput, 'check-root');
    
        const { _a, _b, _c, _input} = await getCallData(checkRootResult.proof, checkRootResult.publicSignals);
    
        const createGroupTx = await board.createGroup(GroupName, users, _a, _b, _c, _input);
        const finishedTx:any = await createGroupTx.wait();
        
        let groupNumber = await board.getGroupRoots();
        console.log(groupNumber[0]);

        let fullGroupInfo = await board.getGroupUsers(tree.root);
        console.log(fullGroupInfo);

        const salt = genRandomSalt();
        const message = JSON.stringify({
            title: "this is the title",
            body: "this is the body boiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii"
        });
        const sendMessageInputs = {
            root: tree.root,
            leaf: pub1,
            pathElements: proof.siblings,
            pathIndices: proof.pathIndices,
            salt,
            secret: secret1,
            msg: formatMessage(message)
        };

        let snarkResult = await prove(sendMessageInputs, 'sign');
        let sendCallData = await getCallData(snarkResult.proof, snarkResult.publicSignals);
        const sendTx = await board.sendMessage(message, sendCallData._a, sendCallData._b, sendCallData._c, sendCallData._input);
        let GroupUsers = await board.getGroupFullInfo(tree.root);

        const revealInput = {
            msgAttestation: snarkResult.publicSignals[0],
            msg: formatMessage(message),
            secret: secret1,
            leaf: pub1,
            root: tree.root,
            pathElements: proof.siblings,
            pathIndices: proof.pathIndices,
            salt
        };
        snarkResult = await prove(revealInput, 'reveal');
        let revealCallData = await getCallData(snarkResult.proof, snarkResult.publicSignals);
        const revealTx = await board.revealMessage(revealCallData._a, revealCallData._b, revealCallData._c, revealCallData._input);
        GroupUsers = await board.getGroupFullInfo(tree.root);
        console.log(GroupUsers);
        let usersLength = await board.getUsersLength();
        console.log(usersLength);
        let Name = await board.getGroupName(tree.root);
        console.log(Name);
    });
});
