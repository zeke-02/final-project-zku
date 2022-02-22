//import {ethers, Contract} from "ethers"
import React, {useState, useCallback, useContext} from "react";
import MiMC from "../mimc";
import { prove, getCallData, genPair} from '../utils';
import { globalContext } from "../App"


declare const window: any;

// generates new pair of public private keys , generates a zk proof and calls registerUser function.
const LoginButton = (props) => {
    const {
        setCurrentUser
    } = props;
    const {
        readContract,
        writeContract,
        currentUser
    } = useContext(globalContext);

    const login = useCallback(async(readContract, writeContract, setCurrentUser)=>{
        let exists;
        let secret;
        let input = prompt("Input your secret key");
        try {
            secret = BigInt(input as any);
        } catch (err) {
            alert('must input secret key!');
            return;
        }
        localStorage.setItem('secret', secret.toString());
            
        const proofInputs = {
            secret,
            hash: MiMC([secret])
        };
        const snarkResult = await prove(proofInputs, "register");
        const { _a, _b, _c, _input} = await getCallData(snarkResult.proof, snarkResult.publicSignals);
        try {
            const loginTx = await writeContract.loginUser(_a, _b, _c, _input);
            setCurrentUser(proofInputs.hash);
            alert(proofInputs.hash);
        } catch (err) {
            prompt("Error calling contract... Try again");
        }
    },[])
    if (!currentUser && window.ethereum.isConnected()) {
        return (
            <div className="login-button">
                <button onClick={() => {login(readContract, writeContract, setCurrentUser)}}>Login if you have a previous account</button>
            </div>
        )
    } else {
        return (null)
    }
}

export default LoginButton;