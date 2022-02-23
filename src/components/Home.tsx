import { useContext } from "react";
import {globalContext} from "../App";
import {utils} from "ethers";

const Message = (props) => {
    const {
        revealed,
        owner,
        text,
        msgAttestation
    } = props;
    console.log(revealed);
    console.log(owner);
    console.log(text);
    console.log(msgAttestation);
    const { title, body } = JSON.parse(text);
    // const author = revealed ? (<h5>Owner: {owner}</h5>) : <h5>Owner: anonymous</h5>;
    return (
        <>
        <article>
            <div>
                <h2 className="title">{title}</h2>
                <h5>message id: {utils.hexlify(msgAttestation)}</h5>
                <h5>Owner: {utils.hexlify(owner)} </h5>
            </div>
            <div>
                <p>
                    {body}
                </p>
            </div>
        </article>
            
        </>
    )
}

const Group = (props) => {
    const {
        name,
        messages,
        users
    } = props;
    return (
        <>
            <h4>{name}</h4>
            <ul>
            {users.map((user)=>{
                return (
                    <li key={utils.hexlify(user)}>{utils.hexlify(user)}</li>
                );
            })
            }
            </ul>
            
            {messages.map((msg)=>{
                return (
                    <Message
                        key={msg.msgAttestation}
                        revealed={msg.revealed}
                        text={msg.text}
                        owner={msg.leaf}
                        msgAttestation={msg.msgAttestation}
                    />
                )
            })
            }
        </>
    );
}

const Home = (props) => {
    const { readContract, groups } = useContext(globalContext);
    return (
        <>
            {groups.map((group)=> {
                return (<Group key={group.name} name={group.name} messages={group.messages} users={group.users}/>)
            })}
        </>
    );
}

export default Home;