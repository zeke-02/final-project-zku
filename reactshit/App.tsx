import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, HashRouter, Route } from "react-router-dom";
import {ethers} from "ethers"
import RegisterButton from "./RegisterUser.tsx";
import { IncrementalMerkleTree } from '@zk-kit/incremental-merkle-tree';
import MiMC from "./mimc";



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
  return (
    
    <div className="App">
      <RegisterButton signer={signer} provider= {provider}/>
    </div>
  );
}

// {<script src="snarkjs.min.js">   </script>
// <script type="module">
//   import { ethers } from "https://cdn.ethers.io/lib/ethers-5.1.esm.min.js";
// </script>
// <script src="https://cdn.jsdelivr.net/npm/@zk-kit/incremental-merkle-tree/"></script>}
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
