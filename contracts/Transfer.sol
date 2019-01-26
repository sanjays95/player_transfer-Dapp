pragma solidity ^0.4.24;
//pragma experimental ABIEncoderV2;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';
import "./Club.sol";
import "./Players.sol";

///@author Sanjay Sanathanan
///@author Contract that handles transfer of player from one club to another 
contract Transfer is ERC721,Club,Players{
    
    enum ContractState {notAccept, Accept, Complete}
    struct Contract{
        uint contractID;
        address offerClub;
        uint256 offeredValue;
        uint256 weeklyWage;
        uint256 contractLength;
        //state of the contract
        ContractState cstate;
    }


    mapping(uint => uint) public contractNo;
    mapping(uint => mapping(uint => Contract)) public playerContract;

    event ContractAdded(uint indexed _cid);
    
    modifier playerValidClub(uint _pid){
        require(player[_pid].club == msg.sender);
        _;
    }
    
    modifier contractValidClub(uint _pid,uint _cid){
        require(playerContract[_pid][_cid].offerClub == msg.sender);
        _;
    }
    
    modifier playerinTransferList(uint _pid){
        require(player[_pid].state == State.TransferListed);
        _;
    }

    modifier playerAccepted(uint _pid){
        require(player[_pid].state == State.TransferAccept);
        _;
    }

    modifier contractAccepted(uint _pid,uint _cid){
        require(playerContract[_pid][_cid].cstate == ContractState.Accept);
        _;
    }

    modifier paidEnough(uint _pid){
        require (msg.value >= player[_pid].value);
        _;
    }
    modifier checkValue(uint _pid,uint _cid) {
        //refund them after pay for item (why it is before, _ checks for logic before func)
        _;
        uint _price = player[_pid].value;
        uint amountToRefund = msg.value - _price;
        playerContract[_pid][_cid].offerClub.transfer(amountToRefund);
    }

    ///Adds a player to the Transfer List
    ///@param _name Name of the player to be added
    ///@param _value Value/Cost of the player 
    ///@param _wage weekly wage of the player
    ///@param _year year left in the players current contract
    ///@dev called from registered club address. creates a new player id & ERC721 token on invocation
    function addPlayer(string _name, uint _value,uint _wage, uint _year) public checkIfPaused {
        require(clubExist[msg.sender]);
        emit PlayerAdded(playerID);
        player[playerID] = Player({playerID : playerID, name : _name, value : _value, wage : _wage, year : _year, club : msg.sender, state : State.TransferListed});
        
        contractNo[playerID] = 0;
       
        _mint(msg.sender,playerID);
        playerID += 1;   
    }
    
    ///Request a contract for a particular player in transfer list
    ///@param _id ID of the player
    ///@param _offeredvalue Value/cost buying club willing to offer for the player 
    ///@param _length number of years in the contract offer
    ///@dev Each player can have multiple offers of contract
    function requestOffer(uint _id,uint _offeredvalue, uint _length) public payable validClub playerinTransferList(_id) checkIfPaused{
        require(getPlayerClubaddress(_id) != msg.sender);
        
        uint contractID = contractNo[_id];
        emit ContractAdded(contractNo[_id]);
        playerContract[_id][contractID].contractID = contractID;
        playerContract[_id][contractID].offeredValue = _offeredvalue;
        playerContract[_id][contractID].offerClub = msg.sender;
        playerContract[_id][contractID].contractLength = _length;
        playerContract[_id][contractID].cstate = ContractState.notAccept;
    
        contractNo[_id]++;     
    }

    ///Get number of contracts for each player
    ///@param _id ID of the player
    ///@return total number of contracts the player has received 
    function getContractsno(uint _id) public view
    returns (uint){
        return contractNo[_id];
    }
    
    ///Get the contract value offered for a certain player
    ///@param _id ID of the player
    ///@param _cid ID of the contract
    ///@return the offered value of the particular contract
    function getContractValue(uint _id,uint _cid) public view 
    returns (uint){
      return playerContract[_id][_cid].offeredValue;
    }
    
    ///Get the buying club offered for a certain contract
    ///@param _id ID of the player
    ///@param _cid ID of the contract
    ///@return the buying club of the contract
    function getContractClub(uint _id, uint _cid) public view
    returns (string){
        address _club = playerContract[_id][_cid].offerClub;
        string storage _cname = clubName[_club];
        
        return _cname;
    }

    //Used for testing purposes
    function fetchContract(uint _pid, uint _cid) public view returns (uint pid,uint cid,string clubname,uint offeredvalue,uint wage,uint length) {
        pid = _pid;
        cid = _cid;
        clubname = clubName[playerContract[_pid][_cid].offerClub];
        offeredvalue = playerContract[_pid][_cid].offeredValue;
        wage = playerContract[_pid][_cid].weeklyWage;
        length = playerContract[_pid][_cid].contractLength;
        return (pid,cid,clubname,offeredvalue,wage,length);
    }
    
    ///Accept a contract by the player's current club
    ///@param _pid ID of the player
    ///@param _cid ID of the contract
    ///@notice changes player'currecnt value,year as per the accepted contract, called by the player's current club
    ///@dev Transfer the ERC 721 token on invocation
    function acceptOffer(uint _pid, uint _cid) 
    validClub playerValidClub(_pid) playerinTransferList(_pid) checkIfPaused
    public {
        
        address _caddress = playerContract[_pid][_cid].offerClub;
        address _paddress = player[_pid].club;
        
        player[_pid].value = playerContract[_pid][_cid].offeredValue;
        player[_pid].year  = playerContract[_pid][_cid].contractLength;
        player[_pid].state = State.TransferAccept;
        //contract accepted, change the state
        playerContract[_pid][_cid].cstate = ContractState.Accept;

        transferFrom(_paddress, _caddress, _pid);
    }
    
    ///Finalise deal, that allows the transfer of funds and token
    ///@param _pid ID of the player
    ///@param _cid ID of the contract
    ///@param _wage weekly wage offered by the buying club
    function finaliseDeal(uint _pid, uint _cid, uint _wage) 
    contractValidClub(_pid,_cid) playerAccepted(_pid) checkValue(_pid,_cid) checkIfPaused
    public payable
    returns (uint){
        require(playerContract[_pid][_cid].cstate == ContractState.Accept, "Contract not accepted by selling club");
        address _paddress = player[_pid].club;
        player[_pid].wage = _wage;
        uint _value = playerContract[_pid][_cid].offeredValue;
        _paddress.transfer(_value);
        
        
        player[_pid].club =  playerContract[_pid][_cid].offerClub;
        player[_pid].state = State.NotListed;
        playerContract[_pid][_cid].cstate = ContractState.Complete;
    }  
}

