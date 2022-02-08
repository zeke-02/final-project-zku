// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

import "./Core_Storage.sol";
import "./revealVerify.sol";
import "./signVerify.sol";
import "./checkRootVerify.sol";
import "./PairingLibrary.sol";
import "./registerVerify.sol";

contract MessageBoard is CoreStorage {
    SignVerifier signVerifier;
    RevealVerifier revealVerifier;
    RootVerifier rootVerifier;
    RegisterVerifier registerVerifier;
    uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    event GroupCreated(uint256 indexed root);
    event MessageAdded(uint256 indexed root, uint256 messageAttestation);
    event MessageRevealed(uint256 indexed root, uint256 leaf);
    event UserRegistered(uint indexed leaf);

    constructor (address _signVerifier, address _rootVerifier, address _revealVerifier, address _registerVerifier) public {
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
        users.push(_input[0]);
        emit UserRegistered(_input[0]);
    }

    function isUser(uint256 _pubKey) public view returns (bool) {
        return registeredUsers[_pubKey];
    }

    function sendMessage(
// trusting them to send the message that they used in the proof (not good), but if they change the message then they will never be able to reveal.
        string memory _message,
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[3] memory _input // msgAttestation, root, msgHash.
    ) public {
        //checks then effects
        require(rootExists[_input[1]], "Specified Group Root Does Not Exist");
        require(signVerifier.verifyProof(_a, _b, _c, _input), "Invalid Message Proof");
        //console.log(uint256(keccak256(abi.encodePacked(_message))) - 2*snark_scalar_field);
        //console.log(_input[2]);
        //require(uint256(keccak256(abi.encodePacked(_message))) % snark_scalar_field == _input[2], "Incorrect Message String");

        emit MessageAdded(_input[1],_input[0]);

        // add message to messages
        Message memory message;
        message.text = _message;
        message.msgAttestation = _input[0];
        messages[_input[1]].push(message);

        groups[_input[1]].numMessages++;
    }

    // emit corresponding group name (global unique), emit root (global unique), emit groupname => user uses to verify and build proof
    function createGroup( // group sizes are static
        string memory _groupname,
        uint256[] memory _users, // TO-DO, change to big circuit checkRoot so don't have to use jank + trust caller w/ leaves.
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[1] memory _input // root
    ) public {
        // check whether groupname or root already exists
        require(!nameExists[_groupname], "Group Name Already Exists!");
        require(!rootExists[_input[0]], "Root Already Exists, i.e. the group you are trying to create already exists!");
        // check whether proof is valid.
        require(rootVerifier.verifyProof(_a, _b, _c, _input), "Invalid Root Proof");
        for (uint i = 0; i < _users.length; i++) {
            //require(isUser(_users[i]), "Leaf must be registered user");
        }

        emit GroupCreated(_input[0]);

        nameExists[_groupname] = true;
        rootExists[_input[0]] = true;
        rootToName[_input[0]] = _groupname;

        // insert new group into groups
        Group storage group = groups[_input[0]];
        group.name = _groupname;
        for (uint i = 0; i < _users.length; i++) {
            group.users.push(_users[i]);
        }
    }

    function revealMessage(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[4] memory _input  // root, leaf, msg, msgattestation,
    ) public {
        // you can either sign the message along with your public and private key -> need to work into merkle tree. *should incorporate EDDSA stuff
        // require(uint256(keccak256(abi.encodePacked(_message))) == _input[1], "Message string does not match the message hash used in proof");
        require(revealVerifier.verifyProof(_a, _b, _c, _input), "Invalid Reveal Proof");
        emit MessageRevealed(_input[0], _input[1]);

        for (uint i = 0; i < messages[_input[0]].length; i++) {
            if (messages[_input[0]][i].msgAttestation == _input[3]) {
                Message storage message = messages[_input[0]][i];
                message.revealed = true;
                message.leaf = _input[1];
                break;
            }
        }
   }

   function getNumMessages(uint256 _root) public view returns (uint) {
       require(rootExists[_root], "Invalid root");
       return groups[_root].numMessages;
   }

   function getUsersLength () public view returns (uint) {
       return users.length;
   }
}