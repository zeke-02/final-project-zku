import {useState, useCallback } from "react";
import {useNavigate} from "react-router-dom";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import MiMC from "../mimc";
import {utils} from "ethers";
import { prove, getCallData, verify } from "../utils";
const _ = require("lodash");

declare const window: any;

const CreateGroup = (props) => {
    let navigate = useNavigate();
    const {
        currentUser,
		writeContract,
		readContract,
        users
    } = props;
    const [groupName, setGroupName] = useState("");
    const [ checkedUsers, setCheckedUsers] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    const createGroup = useCallback(async (e)=>{
        setLoading(true);
        const tree = new IncrementalMerkleTree(MiMC, 9, BigInt(0), 2);
        tree.insert(BigInt(currentUser));
        if (checkedUsers.length > 2**9) {
            alert("Group Too Large");
            return
        }
        for (let i=0;i<checkedUsers.length;i++){
            tree.insert(BigInt(checkedUsers[i]));
        }
        const proof: any = tree.createProof(0);

        const proofInput = {
            root: tree.root,
            leaf: currentUser,
            pathElements: proof.siblings,
            pathIndices: proof.pathIndices,
        };
        console.log(proofInput);
        const snarkResult = await prove(proofInput, 'check-root');
        console.log(snarkResult.publicSignals);
        // const isValid = await verify(snarkResult.proof, snarkResult.publicSignals, 'check-root');
        
        // if (!isValid) {
        //     alert('invalid proof');
        //     setLoading(false);
        //     return;
        // }
        const { _a, _b, _c, _input} = await getCallData(snarkResult.proof, snarkResult.publicSignals);
        try {
            const createGroupTx = await writeContract.createGroup(groupName, [currentUser, ...checkedUsers], _a, _b, _c, _input);
            const txReceipt = await createGroupTx.wait();
            navigate('/');
        } catch (err) {
            console.log(err);
            alert("problem calling smart contract");
            setLoading(false);
        }
    },[checkedUsers, groupName]);
    
    const onChange = (e) => {
        const user = e.target.value;
        if (checkedUsers.includes(user)) {
            const newUsers = checkedUsers.filter((id) => id !== user);
            setCheckedUsers(newUsers);
          } else {
            const newUsers = [...checkedUsers];
            newUsers.push(user);
            setCheckedUsers(newUsers);
          }
    };

    if (!currentUser || !window.ethereum.isConnected() && users.length == 0){
        navigate('/');
        return null;
    } else {
        return (
           <>
                { !loading ? (
                    <>
                     <div>
                <h1> Create Your Group! </h1>
                <label htmlFor="title">Group Name</label>
                <input type="text" value={groupName}  name="title" id="title" onChange={(e)=> {setGroupName(e.target.value)}} /><br/>
                { users.map((user: bigint) => {
                    if (user == currentUser) {
                        return null;
                    } else {
                        return (
                            (
                                <label key={user.toString()}>
                                    <input
                                    type="checkbox"
                                    name={ utils.hexlify(user)}
                                    value={user.toString()}
                                    key={utils.hexlify(user)}
                                    checked={ checkedUsers.includes(user.toString()) }
                                    onChange={onChange}
                                /> <h2>{ utils.hexlify(user) }</h2> <br />
                                </label>
                            )
                        )
                    }
                }
                )
                }
                <div>
                <button onClick={createGroup}>SUBMIT</button>
                </div>  
            </div>
                    </>
                ) : <h2> Loading ... </h2>
                }
           </>  
        )
    }
}

export default CreateGroup;