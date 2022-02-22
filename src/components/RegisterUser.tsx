//import {ethers, Contract} from "ethers"
import React, {useState, useCallback, useEffect, useContext} from "react";
import { prove, getCallData, genPair, verify} from '../utils';
import {globalContext} from "../App";
import {utils} from "ethers";


declare const window: any;

const UserInfo = (props) => {
}

// generates new pair of public private keys , generates a zk proof and calls registerUser function.
const RegisterButton = (props) => {
    const {
        setCurrentUser
    } = props;
    const {
        writeContract,
        currentUser,
        readContract,
    } = useContext(globalContext);
    const [loading, setLoading] = useState(false);

    let secret;
    let leaf;
    const register = useCallback(async(readContract, writeContract, setCurrentUser)=>{
        setLoading(true);
        if (readContract) {
            let exists;
            do {
                const pair = genPair();
                secret = pair.secret;
                leaf = pair.leaf;
                exists = await readContract.isUser(leaf);
            } while (exists);
            
            const proofInputs = {
                secret,
                hash: leaf
            };
            const snarkResult = await prove(proofInputs, "register");
            // const isValid = await verify(snarkResult.proof, snarkResult.publicSignals, 'register');
            // if (!isValid){
            //     setLoading(false);
            //     alert('invalid proof');
            //     return 
            // }
            const { _a, _b, _c, _input} = await getCallData(snarkResult.proof, snarkResult.publicSignals);
            const registerUserTx = await writeContract.registerUser(_a, _b, _c, _input);
            setCurrentUser(leaf);
            console.log(leaf);
            console.log(utils.hexlify(leaf));
            navigator.clipboard.writeText(`Public Key: ${utils.hexlify(leaf)} \nPrivate Key: ${utils.hexlify(secret)}`);
            window.confirm(`Copied your Key Pair, please store them somewhere safe.`);
            
        } else {
            prompt("read contract is undefined");
        }
        setLoading(false);
    },[])
    if (!currentUser && window.ethereum.isConnected()) {
        return (
            <>
            { ! loading ? (
                <>
                    <div className="register-button">
                    <button onClick={() => {register(readContract, writeContract, setCurrentUser)}}>Register If This Is Your First Time Here!</button>
                    </div>
                </>
            )
            : <h2>Loading...</h2> } 
            </>
        )
    } else {
        return (null)
    }
}

export default RegisterButton;