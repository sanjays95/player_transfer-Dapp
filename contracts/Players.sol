pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';
import './Club.sol';

///@author Sanjay Sanathanan
///@title Contract that maintains the structure for each Player
contract Players is Club{
    
    uint public playerID;
    enum State {TransferListed,TransferAccept, NotListed}
    
    struct Player{
        uint playerID;
        string name;
        uint value;
        uint wage;
        uint year;
        address club;
        State state;
    }

    mapping(uint => Player) public player;

    event PlayerAdded(uint indexed _pid);
    
    ///To get the player name 
    ///@param _id Player id
    ///@return the name of the player
    function getPlayerName(uint _id) public view
     returns(string memory){
         return player[_id].name;
     }

    ///To get the player value 
    ///@param _id Player id
    ///@return the value(cost) of the player 
    function getPlayerValue(uint _id) public view
     returns (uint){
         return player[_id].value;
    }
     
    ///To get the player's weekly wage 
    ///@param _id Player id
    ///@return the wage of the player
    function getPlayerWeeklyWage(uint _id) public view
     returns (uint){
        return player[_id].wage;
    }
     
    ///To get the player's current year left in contract 
    ///@param _id Player id
    ///@return the current year's left for the player's contract
    function getPlayerContractYear(uint _id) public view
    returns (uint){
        return player[_id].year;
    }
    
    ///To get the player's current club 
    ///@param _id Player id
    ///@return the current club of the player
    function getPlayerClub(uint _id) public view
     returns (string){
       return clubName[player[_id].club];  
    }
    
    ///To get the player's current club address 
    ///@param _id Player id
    ///@return the current club address of the player
    function getPlayerClubaddress(uint _id) public view
     returns (address){
       return player[_id].club;  
    }

    // Used for testing purposes
    function fetchPlayer(uint _pid) public view returns (string name, address club, string clubname,uint value, uint wage,uint length, uint state) {
        name = player[_pid].name;
        club = player[_pid].club;
        clubname = clubName[player[_pid].club];
        value = player[_pid].value;
        wage = player[_pid].wage;
        length = player[_pid].year;
        state = uint(player[_pid].state);
        return (name,club,clubname,value,wage,length,state);
    }    
}