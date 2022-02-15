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
contract SignVerifier {
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
            8248741983499024376681759141323766019497280990059733751501673984874843882477,
            10308804103020568049515475533437446286482912825015959303592733025675673693438
        );

        vk.beta2 = Pairing.G2Point(
            [20684155311841019047505132668249350637655029112553333350512104989275619982307,
             448118537612151739194352526968608558930833868715221676999351337894495639065],
            [17306875186572396919772665125651441035281898996081569722014183765465396103275,
             14309094669378559894544005137840824319981840515858432246847384209656839910959]
        );
        vk.gamma2 = Pairing.G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );
        vk.delta2 = Pairing.G2Point(
            [15148042073228378550980581611968571141088040261117101781656554297978706562143,
             3837745352863595358004788097588243771932284425863145275138919269999187286035],
            [3871924577784172055980312748755324430235436048258284662963906223916823457434,
             17873525619125682703987946408416540626133386260492973690939822862874735967828]
        );
        vk.IC = new Pairing.G1Point[](5);
        
        vk.IC[0] = Pairing.G1Point( 
            7845977178122916649717952197132041362686628896242139965386134439410580950277,
            231146220820700531651867706263647688306435714317674850738382612190569764163
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            15266408256236255764813287028696117941602945922391560278248751627804501714073,
            16527588385481817218454695955472340312662099784027943149327926166639988926697
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            3276271818841282430178494359307136050844111183042952111037231201978023112916,
            18076703097888193433956231643583047765743799119081741093653363167552247404459
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            5215541805551330575003649917944896700061408608157616550447962834189335525688,
            18970776233043151425094385474259815219483624461256239215722120234790199602920
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            585932684721980754593116568831180425084879257590836824365464678023202056871,
            17740113992911787204248076020269323550526334900170968275661877861357181090923
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
