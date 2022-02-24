import {useState, useContext, useCallback, useEffect, useRef} from "react";
import {globalContext} from "../App";
import {useNavigate} from "react-router-dom";
import {IncrementalMerkleTree} from "@zk-kit/incremental-merkle-tree";
import MiMC from "../mimc";
import {keccak, getCallData, prove, verify} from "../utils";
import {utils} from "ethers";
const _ = require('lodash');

const RevealMessage = (props) => {
    const {
        groups
    } = useContext(globalContext);
    const { currentUser, writeContract } = props;
    const [salt, setSalt] = useState("");
    const [attestation, setAttestation] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true; // Will set it to true on mount ...
        return () => { mounted.current = false; }; // ... and to false on unmount
    }, []);

    const reveal = useCallback(async (e)=>{
        e.preventDefault();
        setLoading(true);
        if (_.trim(salt) == '' || _.trim(attestation) == ''){
            setLoading(false);
            return;
        }
        let secret = localStorage.getItem('secret');
        //get the message
        let message;
        let group;
        for (let i = 0; i < groups.length; i++){
            let _group = groups[i];
            message = _.find(_group.messages, (msg) => {
                return msg.msgAttestation == BigInt(attestation)
            });
            if (message) {
                group = _group;
                break;
            }
        }
        
        if (!group) {
            setLoading(false);
            alert('incorrect user or missing group with that attestation');
            return;
        }

        const user_index = group.users.findIndex(leaf => {
            return BigInt(leaf) == BigInt(currentUser as any);
        });

        if (user_index == -1) {
            setLoading(false);
            alert('user not in group');
            return;
        }

        const tree = new IncrementalMerkleTree(MiMC, 9, BigInt(0), 2);
        
        group.users.forEach((user) => {
            tree.insert(BigInt(user));
        });
        
        const proof: any = tree.createProof(user_index);

        const inputs = {
            root: tree.root,
            leaf: BigInt(currentUser),
            pathElements: proof.siblings,
            pathIndices: proof.pathIndices,
            salt: keccak(salt),
            secret: BigInt(secret as any),
            msg: keccak(message.text),
            msgAttestation: BigInt(attestation)
        };

        try {
            const snarkResult = await prove(inputs, 'reveal');
            const {_a,_b,_c, _input} = await getCallData(snarkResult.proof, snarkResult.publicSignals);
            const txResponse = await writeContract.revealMessage(_a, _b, _c, _input);
            setLoading(false);
            navigate('/');
        } catch (err) {
            console.log(err);
            if (mounted.current) {
                setLoading(false);
            }
            
        }      
    },[salt, attestation])
    return (
        <>
            {!loading ? (
                <>
                <form onSubmit={reveal}>
                <label htmlFor="Salt">Salt</label>
                <input onChange={(e) => setSalt(e.target.value)} value={salt} type="text" name="salt" id="salt"/>
                <label htmlFor="msgAttestation">Message ID</label>
                <input onChange={(e) => setAttestation(e.target.value)} value={attestation} type="text" name="attestation" id="attestation"/>
                <input type="submit" value="Submit" />
                </form>
                </>  
            ) : (<h2>Loading...</h2>)
            }
        </>
    )
}

export default RevealMessage;

