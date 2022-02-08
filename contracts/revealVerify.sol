//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// 2019 OKIMS
//      ported to solidity 0.6
//      fixed linter warnings
//      added requiere error messages
//
//
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;
import "./PairingLibrary.sol";
contract RevealVerifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alfa1;
        Pairing.G2Point beta2;
        Pairing.G2Point gamma2;
        Pairing.G2Point delta2;
        Pairing.G1Point[] IC;
    }
    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }
    function verifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(
            7293351486433921837362553457803575988109565616931868771707256824964255528169,
            4943214170362352014764785078711475274552572726382714824559187110162606422765
        );

        vk.beta2 = Pairing.G2Point(
            [13482286851285994329948000474251579852500324936467710078455744210338549547270,
             16767684969821971234439516253631506755856692854446834568771509202740901139841],
            [2912751320281393319898753065515058362553699715849273570742715496871411979568,
             9085910440244645016859638606212913942614760110739223331841047186501084932340]
        );
        vk.gamma2 = Pairing.G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );
        vk.delta2 = Pairing.G2Point(
            [3839009203923979909686428092859377927887973509923737118769840544012850701067,
             9385696974918935546849871860643587704725747842344302784054548546599878876430],
            [1721128756124524927322979402485870335026524891484469882807338250941404141701,
             7826727728789100866701744569309784631026156132732246324037252218351067801065]
        );
        vk.IC = new Pairing.G1Point[](5);
        
        vk.IC[0] = Pairing.G1Point( 
            19574803389634501876804327928469941188488732251855037410581184617706320546034,
            2720394839514106924794400267240991036427257561441607893407863614329492322317
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            504998068639850369723454548165976270196319694163811333844555482329296236038,
            4022194259982400640951868168833069055238382858839299331151290030347919343396
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            11080174777025628043119634247037909925401030675222124973065667956657648337170,
            7319505414611313295788614763860433252466864131516124299934761805143393679726
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            15807723299246135117118266021979059081289931227495629549660497395955759206890,
            10823267456505453034519281860846544596782078707822538019107468809435696890627
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            6645158676551194858490188897993264419163138443194825603025780725520170051413,
            17640609106931649531545715375977860595650573521744199040648032714523153576677
        );                                      
        
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.IC.length,"verifier-bad-input");
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field,"verifier-gte-snark-scalar-field");
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.IC[0]);
        if (!Pairing.pairingProd4(
            Pairing.negate(proof.A), proof.B,
            vk.alfa1, vk.beta2,
            vk_x, vk.gamma2,
            proof.C, vk.delta2
        )) return 1;
        return 0;
    }
    /// @return r  bool true if proof is valid
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[4] memory input
        ) public view returns (bool r) {
        Proof memory proof;
        proof.A = Pairing.G1Point(a[0], a[1]);
        proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
        proof.C = Pairing.G1Point(c[0], c[1]);
        uint[] memory inputValues = new uint[](input.length);
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
