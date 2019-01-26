pragma solidity ^0.4.24;

///@author Sanjay Sanathanan
///@title Contract that stores the address of clubs
contract Club{

    /// stores address of registered clubs
    address[] public clubs;

    bool private stopped = false;
    address owner;

    ///Modifier to check if its an admin
    modifier isAdmin() {
        require(msg.sender == owner,"Only owner can call this funtion");
        _;
    }

    ///@dev Circuit Breaker implementation
    ///Toggles the contract bewtween on and off states
    function toggleContractActive() isAdmin public {
        stopped = !stopped;
    }
    
    mapping (address => string) clubName;
    
    mapping(address => bool) public clubExist;
    
    mapping(string => bool) nameExists;
    
    // If the contract is paused, stop the modified function
    // Attach this modifier to all public functions
    modifier checkIfPaused() {
        require(stopped == false,"The Dapp is paused by the owner");
        _;
    }
    modifier validClub(){
        require(clubExist[msg.sender],"You are not registered as a valid Club");
        _;
    }

    modifier nameExist(string name){
        require(nameExists[name] == false,"This club already exists. Try registering with a different club name");
        _;
    }

    event ClubAdded(address indexed _club);

    constructor() public{
        owner = msg.sender;
    }
    
    ///Return the owner of the contract.
    ///@return address of the owner
    function getOwner() public view 
    returns (address){
        return owner;
    }
    
    ///Register a club and push the address to the clubs storage
    ///@notice Registers a club with a given address and name.
    ///@param _name the name of the club
    ///@dev no two clubs with the same name and address can register
    function registerClub(string _name) public nameExist(_name) checkIfPaused {
        require(clubExist[msg.sender] == false);
        
        clubs.push(msg.sender);
        clubExist[msg.sender] = true;
        clubName[msg.sender] = _name;
        nameExists[_name] = true;

        emit ClubAdded(msg.sender);
    }
    
    ///Return the name of the club
    ///@param _address of the club
    ///@return name of the club for the particular address param
    function getClubName(address _address) public view
    returns (string){
        return clubName[_address];
    }

    ///Retunr the total number of clubs
    ///@return length of strorage variable clubs
    function clubCount() public view returns(uint count) {
        return clubs.length;
    }
}