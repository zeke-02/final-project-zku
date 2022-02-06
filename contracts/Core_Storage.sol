// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;


contract CoreStorage {
    // mapping (string => uint256) nameToRoot; // Groupname to root
    mapping (string => bool) nameExists; // If groupname to whether it exists
    mapping (uint256 => bool) rootExists;
    mapping (uint256 => string) rootToName;
    struct Group {
        uint256 root;
        uint256[] messageAttestations;
        uint256 currMessageAttestation;
        mapping(uint256 => string[]) revealedMessages; // leaf/pubkey to string/message
    }
    mapping(string => Group) records; // groupname to Group
    mapping(uint256 => bool) registeredUsers; // public key/hash to exists.
}