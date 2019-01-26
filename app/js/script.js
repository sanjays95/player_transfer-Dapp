App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    hasRegistered: false,

    init: function() {
        return App.initWeb3();
    },

    initWeb3: async function() {
        if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
            // Request account access
            await window.ethereum.enable();
        } catch (error) {
            // User denied account access...
            console.error("User denied account access")
        }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },
    
    initContract: function() {
        $.getJSON("Transfer.json", function(transfer) {
            // Instantiate a new truffle contract from the artifact
            App.contracts.Transfer = TruffleContract(transfer);
            // Connect provider to interact with contract
            App.contracts.Transfer.setProvider(App.web3Provider);

            App.listenForEvents();

            return App.render();
        });
    },

    listenForEvents: async function() {   
        var transferInstance = await App.contracts.Transfer.deployed();
        var event = transferInstance.ClubAdded();
        event.watch(function(error,result){
            if(!error){
                App.render();
            }
        })
    },

    render: async function() {
        // var transferInstance;
        var loader = $("#loader");
        var content = $("#content");
        var error = $('.alert');
        
        $('.add-player').hide()

        loader.show();
        content.hide();
        error.hide();

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
            App.account = account;
            $("#accountAddress").html("Your Account: " + account);
            }
        });
        var transferInstance = await App.contracts.Transfer.deployed();
        var owner = await transferInstance.getOwner();
        if(App.account != owner)
            $('.pause').hide();

        // Load contract data
        App.contracts.Transfer.deployed().then(function(instance) {
            transferInstance = instance;
            return transferInstance.clubCount();
        }).then(function(club) {
            count = club.toNumber();

            var clubResults = $("#clubResults");
            clubResults.empty();

            var clubSelect = $('#clubSelect');
            clubSelect.empty();

            //Render club address option
            var clubOption = "<option value='" + App.account + "' >" + App.account + "</ option>"
            clubSelect.append(clubOption);

            for (var i = 0; i < count; i++) {
            transferInstance.clubs(i).then(function(address) {
                
                transferInstance.getClubName(address).then(function(name){
                    var club_name = name;
                    var balance;
                    
                    web3.eth.getBalance(address,function(error,wei){
                        if(!error) {
                            balance = web3.fromWei(wei,'ether').toNumber()

                            // Render club Result
                            
                            var clubTemplate = "<tr><td>" + club_name + "</td><td>" + balance + " ETH" + "</td><t/r>"
                            clubResults.append(clubTemplate);
                            }
                        })
                    })
                });
            }
            return transferInstance.clubExist(App.account);
        }).then(function(hasRegistered) {
            // Do not allow a user to vote
            if(hasRegistered) {
                $('.add-club').hide();
                $('.add-player').show()
            }
            loader.hide();
            content.show();
        }).catch(function(error) {
            console.warn(error);
        });
    },

    registerClub: async function() {
    var club_address = $('#clubSelect').val();
    var club_name = $('#clubName').val();
    var transferInstance = await App.contracts.Transfer.deployed();
    try{
        var tx = await transferInstance.registerClub(club_name,{from : App.account});
        $("#content").hide();
        $("#loader").show();
    }catch(err){
        $('.alert').show();
        console.log(err);
        if(err.message.includes("Error: VM")){
            var n = err.message.indexOf("VM")
            $('.alert').text(err.message.slice(n));
        }
        else $('.alert').text(err.message);
    }
    
  },

  addPlayer : async function(){
    var player_name = $('#player-name').val();
    var player_value = $('#player-value').val();
    player_value =  web3.toWei(player_value,"ether");
    console.log(player_value)
    var player_wage = $('#player-wage').val();
    var player_year = $('#player-year').val();
    var transferInstance = await App.contracts.Transfer.deployed();
    try{
        var tx = await transferInstance.addPlayer(player_name,player_value,player_wage,player_year,{from:App.account});
        $('.add-player').hide();
        window.location.replace("/contractsReceived.html");
    }catch(err){
        $('.alert').show();
        console.log(err);
        if(err.message.includes("Error: VM")){
            var n = err.message.indexOf("VM")
            $('.alert').text(err.message.slice(n));
        }
        else $('.alert').text(err.message);
    }
    },
    pause : async function(){
        var transferInstance = await App.contracts.Transfer.deployed();
        try{
            var tx = await transferInstance.toggleContractActive({from:App.account});
        }catch(err){
            $('.alert').show();
            console.log(err);
            if(err.message.includes("Error: VM")){
                var n = err.message.indexOf("VM")
                $('.alert').text(err.message.slice(n));
            }
            else $('.alert').text(err.message);
        }
    }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});