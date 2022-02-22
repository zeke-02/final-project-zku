import {ethers, Contract} from "ethers"
import { useCallback, useEffect} from "react";


declare const window: any;

const ConnectButton = (props) => {
    useEffect(() => {
        if (props.signer && props.provider && !props.writeContract) {
            props.setReadContract(new Contract(props.contract_addr, props.abi, props.provider));
        }
        if (props.signer && props.provider && !props.readContract) {
            props.setWriteContract(new Contract(props.contract_addr, props.abi, props.signer));
        }
    })
    
    const connect = useCallback(async(setProvider, setSigner, provider, signer)=>{
        if (!provider || ! signer) {
            if (window.ethereum) {
                const _provider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(_provider);
                await _provider.send("eth_requestAccounts", []);
			    setSigner(_provider.getSigner() as any);
            } else {
                prompt("window.ethereum not detected, try again")
            }
        }
    },[]);
    if (!props.signer || !props.provider){
        return (
            <div>
                <button onClick={()=> {connect(props.setProvider, props.setSigner, props.provider, props.signer)}}>Connect</button>
            </div>
        )
    } else {
        return (
            null
        )
    }
}
export default ConnectButton;