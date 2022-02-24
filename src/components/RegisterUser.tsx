//import {ethers, Contract} from "ethers"
import React, {useState, useCallback, useEffect, useContext, useRef } from "react";
import { prove, getCallData, genPair, verify} from '../utils';
import {globalContext} from "../App";
import {utils} from "ethers";


declare const window: any;

const UserInfo = (props) => {
}

// generates new pair of public private keys , generates a zk proof and calls registerUser function.
const RegisterButton = (props) => {
    const {
        setCurrentUser,
    } = props;
    const [loading, setLoading] = useState(false);
    const {
        writeContract,
        currentUser,
        readContract,
    } = useContext(globalContext);

    let secret;
    let leaf;
    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true; // Will set it to true on mount ...
        return () => { mounted.current = false; }; // ... and to false on unmount
    }, []);

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

            const isValid = await verify(snarkResult.proof, snarkResult.publicSignals, 'register');
            if (!isValid){
                setLoading(false);
                alert('invalid proof');
                return 
            }
            localStorage.setItem('secret', secret.toString());
            
            navigator.clipboard.writeText(`Public Key: ${utils.hexlify(leaf)} \nPrivate Key: ${utils.hexlify(secret)}`);
            const { _a, _b, _c, _input} = await getCallData(snarkResult.proof, snarkResult.publicSignals);
            const registerUserTx = await writeContract.registerUser(_a, _b, _c, _input);
            setCurrentUser(leaf);
            if (mounted.current) { 
                setLoading(false);
              }
            window.confirm(`Copied your Key Pair, please store them somewhere safe.`);
            
        } else {
            prompt("read contract is undefined");
            if (mounted.current) { 
                setLoading(false);
              }
            
        }
        
    },[]);
    useEffect(()=>{},[])

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
            : <h2>Registering User...</h2> } 
            </>
        )
    } else {
        return (null)
    }
}

export default RegisterButton;