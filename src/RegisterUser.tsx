import {ethers, Contract} from "ethers"
import React, {useState} from "react";
import { poseidon, genRandomSalt, prove, getCallData} from './utils'

import MessageBoard from './artifacts/MessageBoard.json';

declare const window: any;

const contract_addr = '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9';


const UserInfo = (props) => {
    const success = props.success;
    const hash = props.hash;
    const secret = props.secret;
    if (!success) {
        return null;
    } else {
        return (
            <div className="RegisteredUserInfo">
                <h2>Copy your Hash and Secret Key!</h2>
                <h3>Hash: {hash}</h3>
                <h3>Secret: {secret}</h3>
            </div>
        )
    }
}

// generates new pair of public private keys , generates a zk proof and calls registerUser function.
const RegisterButton = (props) => {
    const signer = props.signer;
    const provider = props.provider;
    const contract = new Contract(
        contract_addr,
        MessageBoard.abi,
        signer
    );
    
    const [secret, setSecret] = useState(null);
    const [hash, setHash] = useState(null);
    const [success, setSuccess] = useState(false);

    const register = async () => { // generates proof, then provides them with secret and hash to copy for themselves.
        const preImage = genRandomSalt();
        console.log(preImage);
        const hashed = poseidon([preImage]);
        const proofInput = {
            secret: preImage,
            hash: hashed
        };
        const result = await prove(proofInput, 'register');
        const {_a, _b, _c, _input} = await getCallData(result.proof, result.publicSignals);
        let TxReceipt;
        try {
            const TxResponse = await contract.registerUser(_a, _b, _c, _input);
            TxReceipt = await TxResponse.wait();
            
        } catch (err) {
            console.log("Error calling function on smart contract", err);
        }
        if (TxReceipt == 1) {
            setSecret(preImage.toString());
            setHash(hashed.toString());
            setSuccess(true);
        }
    }

    return (
        <div className='RegisterButton'>
            <button onClick={register}>
                RegisterUser
            </button>
            <UserInfo success={success} hash={hash} secret={secret}/>
        </div>
    );
}

export default RegisterButton;