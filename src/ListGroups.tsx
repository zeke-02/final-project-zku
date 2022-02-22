import React,{useState,useCallback, useEffect} from "react"
import {ethers, Contract} from "ethers"

const ListGroups = (props) =>{
    
    const provider = props.provider;
    const contract = new Contract(props.addr,props.abi, provider);

    const filter = contract.filters.GroupCreated();
    contract.queryFilter(filter);
    const getGroups = async () => {
        getGroups
    }
    
    return (
        <div className="groups">
            
        </div>
    )
}