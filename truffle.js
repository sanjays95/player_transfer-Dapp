require('dotenv').config()
const infuraKey = process.env.INFURA_KEY;
console.log(infuraKey)
var HDWallet = require("truffle-hdwallet-provider");
const fs = require('fs');
const mnemonic = process.env.METAMASK_MNEMONIC;

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    }

    //Rinkeby migration
    // rinkeby : {
    //     provider : ()=> new HDWallet(mnemonic, `https://rinkeby.infura.io/${infuraKey}`),
    //     network_id: 4,
    //     gas : 5500000
    // }
  }
};
