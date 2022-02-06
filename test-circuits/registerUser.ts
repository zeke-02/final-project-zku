import {genRandomSalt, poseidon, prove, verify, getCallData} from '../ts/utils'

(async () => {
    const secret: BigInt = genRandomSalt();
    const hash: BigInt = poseidon([secret]);
    const input = {
        secret,
        hash
    };
    const result = await prove(input, 'register');
    const calldata = await getCallData(result.proof, result.publicSignals);
    //console.log(calldata);
})()