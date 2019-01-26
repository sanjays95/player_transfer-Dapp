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


### 3. Transfer Contract

This contract handles the complexity wherein a player can be transferred from one club to another.
It maintains a contract structure (`struct Contract`) with attributes as follows:-

1. `contractID` - ID for each contract
2. `offerClub` - the offering club address
3. `offeredValue` - the value the offering club willing to offer.
4. `weeklyWage` - the weekly wage the offering club willing to offer.
5. `contractLength` - the length of the contract (usually in years)

- When a club creates a new player, A new ERC 721 token is created with the particular player ID and 
is owned by the player's current club.
- `contractNo` maintains the number of contracts that each player has received
- Each Player ID is mapped to the player structure. On adding a new player, `contractNo[playerID]` is set to zero.
- In breif, each player ID is mapped to a contract ID which is mapped to the `Contract` structure [`mapping(uint => mapping(uint => Contract))`]
- Registered clubs can then buy a player by calling the `requestOffer`. Multiple clubs can send request offers for a particular player

The contract/offer can be accepted by the player's current club if the deal seems interesting
Once a contract has been accepted, state variables are modified accordingly and the token is transfer from the player's current club address to the buying club address, `transferFrom(_paddress, _caddress, _pid)`.

The buying club has to then Finalise the deal and transfer the new value of the player to player's old club.

### 4. Out of scope and Defects
- The contract doesnt allow a club to reject a particular offer.
- The contract transfers the token from one club to another before receiveing the funds (intend to fix this using Ethereum Alarm clock sevices).
- `weeklyWage` & `contractLength` are static variables that I intend to use them upon extending the feautres.
- Causes a lot of time delay between Accepting a contract and Finalising the Deal if the Dapp is not visited regularly.

### Contract Design and Flow
![Contract Design](https://github.com/sanjays95/player_transfer-Dapp/blob/master/contract_design.jpg?raw=true)
