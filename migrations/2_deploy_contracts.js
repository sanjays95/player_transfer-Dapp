var Transfers = artifacts.require("Transfer");
//var Players = artifacts.require("./Players.sol");
//var Clubs = artifacts.require('./Club.sol');

module.exports = function(deployer) {
  //deployer.deploy(Clubs);
  //deployer.deploy(Players);
  deployer.deploy(Transfers)
};
