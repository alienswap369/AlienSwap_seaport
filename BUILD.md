# build instructions

This document contains instructions for compiling the alienswap contract


## clone the repository

```bash
git clone git@github.com:alienswap-xyz/AlienSwap_seaport.git
cd AlienSwap_seaport
```

## build the contract

We use hardhat to build

```bash
yarn
yarn build
```

## verify the contract

```bash
yarn hardhat verify --network mainnet 0x83746dE31FC8dE985fFE46c1C20eA6d7d8f4ed3a 0x00000000f9490004c11cef243f5400493c00ad63 # for mainnet
yarn hardhat verify --network goerli 0x83746dE31FC8dE985fFE46c1C20eA6d7d8f4ed3a 0x00000000f9490004c11cef243f5400493c00ad63  # for goerli
```