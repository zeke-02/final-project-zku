// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;


contract CoreStorage {
    // mapping (string => uint256) nameToRoot; // Groupname to root
    mapping (string => bool) nameExists; // If groupname to whether it exists
    mapping (uint256 => bool) rootExists;
    mapping (uint256 => string) rootToName;
    uint[] public roots;
    uint[] public users;

    struct Message {
        string text;
        bool revealed;
        uint256 leaf;
        uint256 msgAttestation;
    }
    mapping(uint256 => Message[]) public messages; //group root to all the messages.
    // maps group names to hash of public keys
    struct Group {
        string name;
        uint256[] users;
        uint256 numMessages;
    }
    mapping(uint256 => Group) public groups; //root to group

    mapping(uint256 => bool) public registeredUsers; // public key hash to exists
}
