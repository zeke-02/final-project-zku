// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

import "./Core_Storage.sol";
import "./revealVerify.sol";
import "./signVerify.sol";
import "./checkRootVerify.sol";
import "./PairingLibrary.sol";
import "./registerVerify.sol";
import "hardhat/console.sol";

contract MessageBoard is CoreStorage {
    SignVerifier signVerifier;
    RevealVerifier revealVerifier;
    RootVerifier rootVerifier;
    RegisterVerifier registerVerifier;
    uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    event GroupCreated(string indexed groupname, uint256 root, uint256[] leaves, uint256 indexed timestamp);
    event MessageAdded(string indexed groupname, string indexed message, uint256 messageAttestation, uint256 indexed timestamp);
    event MessageRevealed(string indexed groupname, string indexed message, uint256 leaf, uint256 indexed timestamp);
    event UserRegistered(uint indexed leaf, uint256 indexed timestamp);

    constructor(address _signVerifier, address _rootVerifier, address _revealVerifier, address _registerVerifier) {
        signVerifier = SignVerifier(_signVerifier);
        revealVerifier = RevealVerifier(_revealVerifier);
        rootVerifier = RootVerifier(_rootVerifier);
        registerVerifier = RegisterVerifier(_registerVerifier);
    }

    // main functions

    function registerUser(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[1] memory _input // public hash of secret preimage key.
    ) public {
        require(registerVerifier.verifyProof(_a, _b, _c, _input), "Invalid Register Proof");
        registeredUsers[_input[0]] = true;
        emit UserRegistered(_input[0], block.timestamp);
    }

    function isUser(uint256 _pubKey) public returns (bool) {
        return registeredUsers[_pubKey];
    }

    function sendMessage(
// trusting them to send the message that they used in the proof (not good), but if they change the message then they will never be able to reveal.
        string memory _message,
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[3] memory _input // msgAttestation, root, msgHash.
    ) external {
        //checks then effects
        require(rootExists[_input[1]], "Specified Group Root Does Not Exist");
        require(signVerifier.verifyProof(_a, _b, _c, _input), "Invalid Message Proof");
        //console.log(uint256(keccak256(abi.encodePacked(_message))) - 2*snark_scalar_field);
        //console.log(_input[2]);
        //require(uint256(keccak256(abi.encodePacked(_message))) % snark_scalar_field == _input[2], "Incorrect Message String");

        string memory groupname = rootToName[_input[1]];
        emit MessageAdded(groupname, _message, _input[0], block.timestamp);
        records[groupname].messageAttestations.push(_input[0]);
    }

    // emit corresponding group name (global unique), emit root (global unique), emit groupname => user uses to verify and build proof
    function createGroup( // group sizes are static
        string memory groupname,
        uint256[] memory leaves, // TO-DO, change to big circuit checkRoot so don't have to use jank + trust caller w/ leaves.
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
        for (uint i = 0; i < leaves.length; i++) {
            require(isUser(leaves[i]), "Leaf must be registered user");
        }

        emit GroupCreated(groupname, _input[0], leaves, block.timestamp);

        nameExists[groupname] = true;
        rootExists[_input[0]] = true;
        rootToName[_input[0]] = groupname;

        // insert new group into records
        Group storage group = records[groupname];
        group.root = _input[0];
    }

    function revealMessage(
        string memory _message,
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[4] memory _input  // leaf, msg, msgattestation, root
    ) external {
        // you can either sign the message along with your public and private key -> need to work into merkle tree. *should incorporate EDDSA stuff
        // require(uint256(keccak256(abi.encodePacked(_message))) == _input[1], "Message string does not match the message hash used in proof");
        require(revealVerifier.verifyProof(_a, _b, _c, _input), "Invalid Reveal Proof");
        emit MessageRevealed(rootToName[_input[3]], _message, _input[0], block.timestamp);

        // store revealed messages
        records[rootToName[_input[3]]].revealedMessages[_input[0]].push(_message);
   }
}