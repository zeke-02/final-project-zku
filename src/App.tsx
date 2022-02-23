import React, { useState, useEffect } from "react";
import "./App.css";
import {BrowserRouter as Router, Routes,Route, Link} from 'react-router-dom';
import {utils} from "ethers";

import RegisterButton from "./components/RegisterUser";
import ConnectButton from "./components/ConnectButton";
import LoginButton from "./components/LoginButton";
import CreateGroup from "./components/CreateGroup";
import Home from "./components/Home";
import SendMessage from "./components/SendMessage";
import LogoutButton from "./components/LogoutButton";

import MessageBoard from './artifacts/MessageBoard.json';
import RevealMessage from "./components/RevealMessage";

// const ff = require('ffjavascript');
// const stringifyBigInts: (obj: object) => any = ff.utils.stringifyBigInts

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

export const globalContext = React.createContext({
	currentUser:null,
	readContract:null,
	writeContract: null,
	groups: [] as Group[]
});

declare const window:any;

function App() {
	const contract_addr = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';

	const [readContract, setReadContract] = useState<any>(null);
	const [groups, setGroups] = useState<Group[]>([]);
	const [signer, setSigner] = useState(null);
	const [users, setUsers] = useState(null);
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [writeContract, setWriteContract] = useState<any>(null);
	const [provider, setProvider] = useState(null);


	async function getUsers() {
		if (readContract) {
			let result;
			try {
				result = await readContract.getUsers();
				if (result != users) {
					setUsers(result);
				}
			} catch (err) {
			}
		}
	}

	async function getGroups() {
		if (readContract) {
			try {
				let _groups:Group[] = [];
				const roots = await readContract.getGroupRoots();
				for (let i=0; i<roots.length; i++){
					let root = roots[i];
					let group: Group;
					let name = await readContract.getGroupName(BigInt(root));
					let users = await readContract.getGroupUsers(BigInt(root));
					let messages = await readContract.getGroupFullInfo(BigInt(root));
					group = {
						name,
						users,
						messages
					};
					_groups.push(group);
				}
				setGroups(_groups);
			} catch (err) {
				alert("issue calling readContract");
			}
		}
	}

	useEffect(()=>{
		if (readContract) {
			readContract.on("UserRegistered", getUsers);
		}
		getUsers();
	},[readContract]);

	useEffect(()=>{
		getGroups();
		if (readContract) {
			readContract.on("GroupCreated", getGroups);
			readContract.on("MessageAdded", getGroups);
			readContract.on("MessageRevealed", getGroups);
		}
	},[readContract]);
	window.ethereum.on('accountsChanged', (newAccount) => {
		setSigner(null);
		setCurrentUser(null);
	});

	// useEffect(()=> {
	// 	if (!window.ethereum.isConnected()) {
	// 		localStorage.removeItem('secret');
	// 		setCurrentUser(null);
	// 		setProvider(null);
	// 		setSigner(null); 
	// 	}
	// }, []);
	return (
		<globalContext.Provider value= {{
			readContract,
			writeContract,
			currentUser,
			groups
		}}>
			<div className="connect">
				<ConnectButton 
					provider = {provider}
					setProvider = {setProvider}
					signer= {signer}
					setSigner = {setSigner}
					readContract = {readContract}
					setReadContract = {setReadContract}
					writeContract = {writeContract}
					setWriteContract = {setWriteContract}
					contract_addr = {contract_addr}
					abi = {MessageBoard.abi}
				/>
			</div>
			<div className="register">
			{ signer &&
				(
					<>
					<RegisterButton
						setCurrentUser = {setCurrentUser}
					/>
					</>
					
				)
				}
			
			</div>
			{ signer &&
				(
					<>
					<div className="login">
						<LoginButton
						setCurrentUser = {setCurrentUser}
						/>
					</div>	
					</>
					
				)
				}
			<div className="current-user">
				{ currentUser &&
				(
					<>
					<LogoutButton 
					setCurrentUser = {setCurrentUser} 
					/>
					<h2>{ utils.hexlify(currentUser) }</h2>
					</>
					
				)
				}
			</div>
			<Router>
				{ readContract && currentUser &&
				<nav>
					<div>
						<Link to="/create-group">Create A Group!</Link>
					</div>
					<div>
						<Link to="/send">Send a Message!</Link>
					</div>
					<div>
						<Link to="/reveal">Reveal a Message!</Link>
					</div>
					<div>
						<Link to="/">Home</Link>
					</div>
				</nav>
				}
				

				<Routes>
					<Route path="/" element={<Home />}/>
					<Route path="/create-group" element={<CreateGroup 
						users={users}
						writeContract={writeContract}
						readContract={readContract}
						currentUser={currentUser}
					/>}/>
					<Route path="/send" element= {<SendMessage
						users={users}
						writeContract={writeContract}
					/>}/>
					<Route path="/reveal" element={<RevealMessage
						writeContract={writeContract}
						currentUser={currentUser}
					/>}></Route>
				</Routes>
			</Router>
		</globalContext.Provider>
	);
}

export default App;
