# Decentralized Player Transfer  

## Overview

Football is a billion dollar industry and one of the most popular sports in the world. Transfer season is the time period where a player
has the right to move from once club to another. Durring this period, hefty amout of money is involved across different countries.
Due to this, there are considerable ineffeiciencies surrounding cross-currency transactions and lack of financial transparency in the football 
industry. Blockchain Technology and Tokenisations has the potential to make this process more effecient.

Another Use Case : [De Gea's Failed Transfer](https://www.gqmiddleeast.com/top-football-clubs-set-to-embrace-blockchain-technology)

This project is a set of smart contracts that enables the transfer of soccer players between one club to another 
durring the Transfer Market Season using Ethereum. 
Each player added by a particular club has various attributes, that is represented by an ERC 721 token. 

This project was developed for the Consensys Academy Developer Program Final Project.

## Setup

Install the below pre requisites to get the app running

- NPM (https://nodejs.org)
- Truffle verion 4.1.14  `npm install truffle@4.1.14` (https://www.npmjs.com/package/truffle/v/4.1.14)
- Ganache  (http://truffleframework.com/ganache/)
- Metamask (https://metamask.io/)


### Step 1. Clone the project
```  git clone https://github.com/sanjays95/player_transfer-Dapp.git ```

### Step 2. Install Dependencies
```
cd player_transfer-Dapp
npm install
```
### Step 3. Start Ganache
Open Ganache that you downloaded and installed. This will start your local blockchain instance.

### Step 4. Compile & Deploy Transfer Smart Contract
`truffle migrate --reset` You must migrate the election smart contract each time your restart ganache.

### Step 5. Configure Metamask
- Connect Metamask to the local Ethereum blockchain provided by Ganache.
- Import an account provided by Ganache.

### Step 6. Run the Front-End Application
`npm run dev` Visit this URL in your browser: http://localhost:3000

### Step 7. Run Tests
- Start Ganache and open a new local blockchain instance
- Run `truffle test`

### User-Stories
Durring the transfer season, a club would wish to buy a new player or sell a player. The club owner logs into Dapp and registers his/her club 
using the clubname and the address of the club. To buy a player, the clubowner can view all the players in the transfer list. These players 
are added by other club using their respective club name and owner. On finding a desired player, the clubowner Requests an offer for the player 
with a new cost and the number of years in the contract. If the player's current club is staisfied by the new offer (mainly new cost), the player's 
current club can accept the offer. Once the player's current club has accepted the contract/offer, the clubowner is requested to Finalise the deal by 
transfering the appropriate the offered value in ethers. 
In the same fashion, club owners can sell their player by adding the player's attributes(value,weekly wage,year's left). Interested clubs will offer 
new contract upon which it can be accepted if interested.

### Test Net Interaction

- Visit [Football Transfer](https://soccer-playertransfer.herokuapp.com/) (Deployed using Heroku)
- Ensure you have a Metamask and Rinkeby account.
- To obtain Test ethers, visit (https://faucet.rinkeby.io/)
- Voila! You can now register and buy your favourite Players.