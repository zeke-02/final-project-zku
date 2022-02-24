# Simple ZK Message Board

This project is a message board using zksnarks.

```To test locally
npm install
cd /src/file-server
node index.js

cd ../../
npx hardhat node
npx hardhat run deploy ./scripts/deploy.ts
npm run start
```

install metamask and import any of the hardhat accounts to metamask.
Reset the hardhat account if you restart the hardhat node. 

Next steps... deploy on testnet + basic error handling.
