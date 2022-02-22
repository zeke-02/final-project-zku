// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;


contract CoreStorage {
    // mapping (string => uint256) nameToRoot; // Groupname to root
    mapping (string => bool) nameExists; // If groupname to whether it exists
    mapping (uint256 => bool) rootExists;
    mapping (uint256 => string) rootToName;
    mapping(uint256 => bool) public registeredUsers; // public key hash to exists
    mapping(uint256 => bool) public msgAttestations; //msgAttestation to exists
    uint256[] public roots; //all stored roots
    uint256[] public users; //all stored users

    struct Message {
        string text;
        bool revealed;
        uint256 leaf;
        uint256 msgAttestation; // unique to the message. doesn't have to be global unique.
    }
    mapping(uint256 => Message[]) public messages; //group root to all the messages
    mapping(uint256 => uint256[]) public groups; //group root to associated users
    // maps group names to hash of public keys
}
