import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, HashRouter, Route } from "react-router-dom";
import {ethers} from "ethers"
//import RegisterButton from "./RegisterUser.tsx";
import { IncrementalMerkleTree } from '@zk-kit/incremental-merkle-tree';
import bigInt from "big-integer";
import { BigInteger } from "big-integer";
import MIMC from "./mimc"

const BI_1 = BigInt("1")
const BI_2 = BigInt("2")



const buildPoseidon = require('circomlibjs').buildPoseidon;

const init = async () =>{
  const tree = new IncrementalMerkleTree(MIMC,4,BigInt(0),2);
  tree.insert((1));
  console.log(tree.root);
  console.log(MIMC([bigInt(1),bigInt(2)]));

}

init();


declare const window: any;
function App () {
  let signer;
  let provider;
  
  const [errorMessage, setErrorMessage] = useState(null);

  const connectAccountHandler = useCallback(async () => {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);
    
    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    signer = provider.getSigner();
  },[]);

  window.ethereum.on('accountsChanged', (newAccount) => {
    console.log(newAccount);
    connectAccountHandler();
  });
  connectAccountHandler();
  useEffect(()=>{
    
  });
  

  return (
    <div className="App">
     
    </div>
  );
}

//<RegisterButton signer={signer} provider= {provider}/>
// class ListGroups extends React.Component {
//   constructor (props) {
//     super(props);
//     this.state = {

//     }
//   }
// }



// class Group extends React.Component {
//   constructor(props){
//     super(props);
//     this.state = {
//       name: props.groupName,
//       leaves: props.leaves,
//       messages: props.messages //stringified JSON objects.
//     }
//     this.getGroupInfo = this.getGroupInfo.bind(this);
//   }

//   getGroupInfo() {
    
//   }
//   render() {
//     return <></>
//   }
// }

export default App;
