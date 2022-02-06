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
            21813047485556701029343867252715582112357856567715367487027867149835198979170,
            10913734624900032132029411623984557601871954635203311224425597604048333684770
        );

        vk.beta2 = Pairing.G2Point(
            [21794195795884089403685675658794733470577227405903713944015089713779593953403,
             21847394866469577560841879394339498830916658837154595285915941568220072596699],
            [21041170013174910355715939276291777075459345563400416787046239370193139365154,
             3800283282840339220396140873965191457036286736612494373621735560114934356382]
        );
        vk.gamma2 = Pairing.G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );
        vk.delta2 = Pairing.G2Point(
            [1343898316732534374020989895473384701195949708024737076357555794426679218508,
             11682151782066140082544060430822900869833099049993929516198612357939260336326],
            [13362227515388352797692856475618385404025099893228064761186642347360724648477,
             15324377226692656423451297685997722088817586252884990675675187133115923695222]
        );
        vk.IC = new Pairing.G1Point[](5);
        
        vk.IC[0] = Pairing.G1Point( 
            5906562131627769485222883578065147456736879574729936237358239974480646403035,
            1006678521082835971186843047353257783696462467321219691621645970283957905628
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            14085956496151700788051703253604545652550316981111986831637927333921243131615,
            12143611772960892292267589920582046874822028726100901514478999641988635941134
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            10228447644391593316784732132869230968907984380213294394828063607167614040846,
            9603250515695260954406668292575695458508141985824150490468682915676164320161
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            20849341851669268268175610775929423333520339754464165235329291913814999011230,
            18570315289782160629101870602015088757231408961508062557763487457114372978057
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            21820978826660170302400419054486024309478816825043430519954388531186957764207,
            4276131705492439834389057504897737230482294603930393773960928349518033474951
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
