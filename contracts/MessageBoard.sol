// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

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

    constructor (address _signVerifier, address _rootVerifier, address _revealVerifier, address _registerVerifier) {
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
        require(registeredUsers[_input[0]] == false, "a user already exists with that public key");
        require(registerVerifier.verifyProof(_a, _b, _c, _input), "Invalid Register Proof");
        registeredUsers[_input[0]] = true;
        users.push(_input[0]);
        emit UserRegistered(_input[0]);
    }

    function loginUser(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[1] memory _input
    ) public view returns (bool) {
        require(registeredUsers[_input[0]] == true, "a user doesn't exists with that public key");
        require(registerVerifier.verifyProof(_a, _b, _c, _input), "Invalid Login Proof");
        return true;
    }

    function isUser(uint256 _pubKey) public view returns (bool) {
        return registeredUsers[_pubKey];
    }

    function userInGroup(uint256 _pubKey, uint256 _root) public view returns (bool) {
        uint256[] storage users = groups[_root];
        uint256 length = users.length;
        for (uint i = 0; i < length; i++){
            if (_pubKey == users[i]) {
                return true;
            }
        }
        return false;
    }

    function sendMessage(
// trusting them to send the message that they used in the proof (not good), but if they change the message then they will never be able to reveal.
        string memory _message,
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[4] memory _input // msgAttestation, root, leaf, msgHash
    ) public {
        //checks then effects
        require(isUser(_input[2]), "User must be registered");
        require(!msgAttestations[_input[0]], "Please change salt, must have unique msgAttestation");
        require(rootExists[_input[1]], "Specified Group Root Does Not Exist");
        require(userInGroup(_input[2], _input[1]), "user not in specified group");
        require(signVerifier.verifyProof(_a, _b, _c, _input), "Invalid Message Proof");
        //console.log(uint256(keccak256(abi.encodePacked(_message))) - 2*snark_scalar_field);
        //console.log(_input[2]);
        //require(uint256(keccak256(abi.encodePacked(_message))) % snark_scalar_field == _input[2], "Incorrect Message String");
        msgAttestations[_input[0]] = true;
        emit MessageAdded(_input[1],_input[0]);

        // add message to messages
        Message memory message;
        message.text = _message;
        message.msgAttestation = _input[0];
        messages[_input[1]].push(message);
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
            require(isUser(_users[i]), "Leaf must be registered user");
        }

        emit GroupCreated(_input[0]);

        nameExists[_groupname] = true;
        rootExists[_input[0]] = true;
        rootToName[_input[0]] = _groupname;
        roots.push(_input[0]);

        uint256 length = _users.length;
        for (uint256 i = 0; i < length; i++ ) {
            groups[_input[0]].push(_users[i]);
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

   function getUsersLength () public view returns (uint) {
       return users.length;
   }

   function getGroupUsers (uint256 _root) public view returns (uint256[] memory) {
       require(rootExists[_root], "root doesn't exist");
       return groups[_root];
   }

   function getGroupName(uint256 _root) public view returns (string memory) {
       require(rootExists[_root], "root doesn't exist");
       return rootToName[_root];
   }

   function getGroupRoots() public view returns (uint256[] memory) {
       return roots;
   }

   function getGroupFullInfo(uint256 _root) public view returns (Message[] memory) {
       require(rootExists[_root], "root doesn't exist");
       return messages[_root];
   }

   function getUsers() public view returns (uint256[] memory) {
       return users;
   }
}