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
    event MessageAdded(string indexed groupname, string message, uint256 indexed timestamp);

    constructor(address _signVerifier, address _rootVerifier, address _revealVerifier) {
        signVerifier = SignVerifier(_signVerifier);
        revealedVerifier = RevealVerifier(_revealVerifier);
        rootVerifier = RootVerifier(_rootVerifier);
    }

    // main functions


    function sendMessage(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[3] memory _input, // contains root, msg hash, msgAttestation.
        string message
    ) external {
        //checks then effects
        require(rootExists[_input[1]], "Specified Group Root Does Not Exist");
        require(signVerifier.verifyProof(_a, _b, _c, _input), "Invalid Message Proof");

        string memory groupname = rootToNam(_input[1]);
        emit MessageAdded(groupname, message, _input[0], block.timestamp);
        records[groupname].messageAttestations
    }

    // emit corresponding group name (global unique), emit root (global unique), emit groupname => user uses to verify and build proof
    function createGroup( // group sizes are static
        string groupname,
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

        nameExists[groupname] = true;
        rootExists[_input[0]] = true;
        rootToName[_input[0]] = groupname;

        // insert new group into records
        Group memory group;
        group.root = _input[0];
        records[groupname] = group;
    }
}