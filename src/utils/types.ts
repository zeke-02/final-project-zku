

interface Proof {
    root: BigInt,
    leaf: BigInt,
    pathIndices: Array<number>,
    siblings: Array<BigInt[]>
}

export {
    Proof
}