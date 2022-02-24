import {useState, useContext, useCallback, useEffect, useRef} from "react";
import {globalContext} from "../App";
import {useNavigate} from "react-router-dom";
import {IncrementalMerkleTree} from "@zk-kit/incremental-merkle-tree";
import MiMC from "../mimc";
import {keccak, getCallData, prove, verify} from "../utils";
import {utils} from "ethers";
const _ = require('lodash');


interface Message {
	text:string;
    revealed: boolean;
    leaf: bigint;
    msgAttestation: bigint;
}

interface Group {
	name: string,
	users: string[],
	messages: Message[],
}

const SendMessage = (props)=> {
    const {
        currentUser,
        groups
    } = useContext(globalContext);
    const { writeContract } = props; 
    const [body, setBody] = useState("");
    const [title, setTitle] = useState("");
    const [salt, setSalt] = useState("");
    const [group, setGroup] = useState(groups[0].name ? groups[0].name : "");
    const [loading, setLoading] = useState(false);
    const {
        users
    } = props;
    let navigate = useNavigate();
    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true; // Will set it to true on mount ...
        return () => { mounted.current = false; }; // ... and to false on unmount
    }, []);
    if (! currentUser){
        alert('you must be signed in to send a message');
        navigate('/');
    }
    const handleSubmit = useCallback(async(e)=>{
        
        // submit message
        e.preventDefault();
        setLoading(true);
        let [selected_group] = groups.filter(g => g.name == group);
        console.log(selected_group.users);
        if (!selected_group.users.find(leaf => BigInt(leaf) == BigInt(currentUser as any))){
            alert('you must be part of the group to send a message from it');
            setLoading(false);
            return;
        }
        const tree = new IncrementalMerkleTree(MiMC, 9, BigInt(0), 2) // need to ensure everyone knows the 0 value
        const user_index = selected_group.users.findIndex(leaf => BigInt(leaf) == BigInt(currentUser as any));
        selected_group.users.forEach((leaf)=> {
            tree.insert(BigInt(leaf));
        });
        const message = JSON.stringify({
            title,
            body
        });
        const proof: any = tree.createProof(user_index);
        const secret = localStorage.getItem('secret');
        const sendMessageInputs = {
            root: tree.root,
            leaf: currentUser,
            pathElements: proof.siblings,
            pathIndices: proof.pathIndices,
            salt: keccak(salt),
            secret: BigInt(secret as any),
            msg: keccak(message)
        };
        
        const snarkResult = await prove(sendMessageInputs, 'sign');
        const isValid = await verify(snarkResult.proof, snarkResult.publicSignals, 'sign');
        if (!isValid) {
            alert('invalid proof');
            setLoading(false);
            return;
        }
        const {_a,_b,_c, _input} = await getCallData(snarkResult.proof, snarkResult.publicSignals);
        if (writeContract) {
            try {
                const TxResponse = await writeContract.sendMessage(message,_a,_b,_c,_input);
                navigator.clipboard.writeText(`Salt: ${salt}\nID: ${utils.hexlify(_input[0])}`);
                window.confirm(`Copied the salt, please store them somewhere safe.`);
                if (mounted.current) {
                    setLoading(false);
                }
                navigate('/');
            } catch (err) {
                console.error(err);
                if (mounted.current){
                    setLoading(false);
                }
                
            }
        }
        
        //https://dev.to/rdegges/please-stop-using-local-storage-1i04
    }, [title, body, salt]);
    return (
        <>
            {!loading ? (
                <>
                <h4>Use a unique salt!</h4>
                <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title</label>
                <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" name="title" id="title" />
                <label htmlFor="body">Body</label>
                <textarea onChange={(e) => setBody(e.target.value)}  value={body} name="body" id="body"></textarea>
                <label htmlFor="group">Group</label>
                <select value={group} onChange={(e)=> {console.log(e.target.value); setGroup(e.target.value)}}>
                    { groups.map((group: Group) => {
                        return <option key={group.name} value={group.name}>{group.name}</option>
                    })
                    }
                  </select>
                <label htmlFor="salt">Unique Salt</label>
                <input onChange={(e) => setSalt(e.target.value)} value={salt} type="text" name="salt" id="salt" />
                <input type="submit" value="Submit" />
                </form>
                </>   
            ) : (<h2>Loading...</h2>)
            }
        </>
    )
}

export default SendMessage;