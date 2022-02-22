import React,{useState,useCallback, useEffect} from "react"
import {ethers, Contract} from "ethers"

const Users = (props) => {
    const contract = props.contract;
    let _users: number[] = [];
    const getUsers = useCallback(async ()=>{
        let n = await contract.getUsersLength();
        for (let i = 0; i<n; i++) {
            let user: number = await contract.users(i);
            _users.push(user);
        }
        props.setUsers(_users);
    },[]);
    return (
        <div>
            <button onClick={getUsers}>Get All Registered Users</button>
             <UserList users={props.users}/>
        </div>
    )
}

const UserList = (props) => {
    return(
        props.users.map((user)=>{
            return (<text>{user}</text>);
        })
    )
}

export default Users;