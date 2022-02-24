//import {ethers, Contract} from "ethers"
import React, {useState, useCallback, useContext, useRef, useEffect} from "react";
import MiMC from "../mimc";
import { prove, getCallData, genPair, verify} from '../utils';
import { globalContext } from "../App"


declare const window: any;

// generates new pair of public private keys , generates a zk proof and calls registerUser function.
const LoginButton = (props) => {
    const {
        setCurrentUser,
        loading,
        setLoading
    } = props;
    const {
        readContract,
        writeContract,
        currentUser
    } = useContext(globalContext);
    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true; // Will set it to true on mount ...
        return () => { mounted.current = false; }; // ... and to false on unmount
    }, []);

    const login = useCallback(async(readContract, writeContract, setCurrentUser)=>{
        setLoading(true);
        let exists;
        let secret;
        let input = prompt("Input your secret key");
        
        //check if secret is big int
        try {
            secret = BigInt(input as any);
        } catch (err) {
            alert('input is not bigint');
            if (mounted.current) {
                setLoading(false);
                return;
            }
        }

        exists = await readContract.isUser(MiMC([secret]));
        if (!exists) {
            if (mounted.current) {
                alert('user doesn\'t exist');
                setLoading(false);
                return;
            }
        }
        localStorage.setItem('secret', secret.toString());
            
        const proofInputs = {
            secret,
            hash: MiMC([secret])
        };
        const snarkResult = await prove(proofInputs, "register");
        const isValid = await verify(snarkResult.proof, snarkResult.publicSignals, 'register');
        if (!isValid){
            setLoading(false);
            alert('invalid proof');
            return; 
        }
        const { _a, _b, _c, _input} = await getCallData(snarkResult.proof, snarkResult.publicSignals);
        
        try {
            const loginTx = await writeContract.loginUser(_a, _b, _c, _input);
            if (mounted.current) {
                setCurrentUser(proofInputs.hash);
                setLoading(false);
            }
        } catch (err) {
            alert("Error calling contract...");
            if (mounted.current) {
                setLoading(false);
            }
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