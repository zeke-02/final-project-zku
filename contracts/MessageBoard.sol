// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

import "./Core_Storage.sol";
import "./revealVerify.sol";
import "./signVerify.sol";
import "./checkRootVerifier";

contract MessageBoard is CoreStorage {
    SignVerifier signVerifier;
    RevealVerifier revealVerifier;
    RootVerifier rootVerifier;

    event GroupCreated(string indexed groupname, uint256 root, uint256[] leaves, uint256 indexed timestamp);
    event MessageAdded(string indexed groupname, string indexed message, uint256 messageAttestation, uint256 indexed timestamp);
    event MessageRevealed(string indexed groupname, string indexed message, uint256 leaf, uint256 indexed timestamp);

    constructor(address _signVerifier, address _rootVerifier, address _revealVerifier) {
        signVerifier = SignVerifier(_signVerifier);
        revealedVerifier = RevealVerifier(_revealVerifier);
        rootVerifier = RootVerifier(_rootVerifier);
    }

    // main functions


    function sendMessage(
        string memory message,
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[3] memory _input, // contains root, msg hash, msgAttestation.
    ) external {
        //checks then effects
        require(rootExists[_input[1]], "Specified Group Root Does Not Exist");
        require(signVerifier.verifyProof(_a, _b, _c, _input), "Invalid Message Proof");
        

        string memory groupname = rootToName(_input[1]);
        emit MessageAdded(groupname, message, _input[0], block.timestamp);
        records[groupname].messageAttestations.push(_input[0]);
    }

    // emit corresponding group name (global unique), emit root (global unique), emit groupname => user uses to verify and build proof
    function createGroup( // group sizes are static
        string groupname,
        uint256[] leaves, // TO-DO, change to big circuit checkRoot so don't have to use jank + trust caller w/ leaves.
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[1] memory _input
    ) external {
        // check whether groupname or root already exists
        require(!nameExists[groupname], "Group Name Already Exists!");
        require(!rootExists[_input[0]], "Root Already Exists, i.e. the group you are trying to create already exists!");
        // check whether proof is valid.
        require(rootVerifier.verifyProof(_a, _b, _c, _input), "Invalid Root Proof");

         event GroupCreated(groupname, _input[0], leaves, block.timestamp);

        nameExists[groupname] = true;
        rootExists[_input[0]] = true;
        rootToName[_input[0]] = groupname;

        // insert new group into records
        Group memory group;
        group.root = _input[0];
        records[groupname] = group;
    }

    function revealMessage(
        string memory _message,
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[4] memory _input,  // leaf, msg, msgattestation, root
    ) external {
        //you can either sign the message along with your public and private key -> need to work into merkle tree. *should incorporate EDDSA stuff
        require(keccak256(abi.encodePacked(_message)) == _input[2], "Message string does not match the message hash used in proof");
        require(revealVerifier.verifyProofy(_a, _b, _c, _input), "Invalid Reveal Proof");
        emit MessageRevealed(rootToName[_input[3]], _message, _input[0], block.timestamp);

        // store revealed messages
        records[rootToName[_input[3]]].revealedMesages[_input[0]].push(_message);
   }
}