## Contract Overview

The contract is split into three modules.

### 1. Club Contract 
This contract maintains an array of address of different clubs
Each club address is mapped to a unique club name.

### 2. Player Contract : 
This contract maintains a struct data type for every player that has been added
The attributes of the Player are ID, name, value, wage, year and the club address.

The player can belong to three states : 
- TransferListed : The player has been added to the transfer list by a certain club.
- TransferAccept : A contract offered by another club for this player has been accepted by the current club.
- NotListed : The player has been bought by another club.

When a club creates a new player, A new ERC 721 token is created with the particular player ID and 
is owned by the player's current club

### 3. Transfer Contract

This contract handles the complexity wherein a player can be transferred from one club to another

![Contract Design](https://github.com/sanjays95/player_transfer-Dapp/blob/master/contract_design.jpg?raw=true)
