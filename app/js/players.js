// var body = $('<div>').addClass('parent')
//        .append(
//          $('<div>').addClass('loadimg')
//        );

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

            App.render();
        });
    },

    listenForEvents: function() {
        App.contracts.Transfer.deployed().then(function(instance) {
        // Restart Chrome if you are unable to receive this event
        // This is a known issue with Metamask
        // https://github.com/MetaMask/metamask-extension/issues/2393
        instance.PlayerAdded({}, {
            fromBlock: 0,
            toBlock: 'latest'
        }).watch(function(error, event) {
            console.log("Player event triggered", event)
            // Reload when a new vote is recorded
            //App.render();
            
            });
        });
    },

    render: async function() {
        var transferInstance;
        var loader = $("#loader");
        var content = $("#content");
        
        $('.add-player').hide()

        loader.show();
        content.hide();
        $('.alert').hide()

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
            App.account = account;
            $("#accountAddress").html("Your Account: " + account);
            }
        });

        $('.player').empty();
        var transferInstance = await App.contracts.Transfer.deployed()
        const total = await transferInstance.playerID();
        for(var i=0 ; i<total; i++){
            var id = i
            var player = await transferInstance.player(i);
            var player_id = player[0];
            var player_name = player[1];
            var player_value = player[2];
            player_value = web3.fromWei(player_value,"ether");
            var player_wage = player[3];
            var player_year = player[4];
            var player_address = player[5];
            var player_state = player[6];
            var player_club = await transferInstance.getClubName(player[5]) ;
            if (player_address != App.account && player_state == 0){
                var playerResults = '<div class="col-sm-6 col-md-4"><div class="thumbnail"><div class="caption"><h3>Player ID : '+player_id+'</h3><h4>'+player_name+'</h4><ul><li>Current Club : '+player_club+'</li><li>Current Value : '+player_value+' ETH</li><li>Current Wage : '+player_wage+'</li><li>Year Left : '+player_year+'</li></ul></div>'+'<button type="button" class="btn btn-primary" data-toggle="modal" data-target=".bs-example-modal-sm'+player_id+'">Buy Player</button><div class="modal fade bs-example-modal-sm'+player_id+'" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel"><div class="modal-dialog modal-sm" role="document"><div class="modal-content"><div class="modal-header"><h4>Buy Player</h4></div><div class="modal-body"><form onSubmit="App.requestOffer('+player_id+'); return false;"><div class="form-group"><label for="player-id" class="control-label">ID:</label><input type="text" class="form-control" id="player-id" value="'+player_id+'"readonly></div><div class="form-group"><label for="contract-value" class="control-label">Offer Value:</label><input type="number" class="form-control" id="contract-value" min=0.1 max="15" step="0.1"></input></div><div class="form-group"><label for="contract-year" class="control-label">Contract Length:</label><input type="number" class="form-control" id="contract-year"></input></div><button type="submit" class="btn btn-primary">Submit Offer</button></form></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div></div></div>';
                $('.player').append(playerResults);
            }else if(player_address != App.account && player_state == 1){
                var playerResults = '<div class="col-sm-6 col-md-4"><div class="thumbnail"><div class="caption"><h3>Player ID : '+player_id+'</h3><h4>'+player_name+'</h4><ul><li>Current Club : '+player_club+'</li><li>Current Value : '+player_value+' ETH</li><li>Current Wage : '+player_wage+'</li><li>Year Left : '+player_year+'</li></ul><p>Status : Player in talks with other club</p></div><button type="button" class="btn btn-primary" data-toggle="modal" data-target=".bs-example-modal-sm'+player_id+'" disabled>Buy Player</button></div></div>';
                $('.player').append(playerResults);
            }
        }     
    },

    requestOffer : async function(id){
        var player_id = $('.bs-example-modal-sm'+id).find('#player-id').val()
        var contract_value = $('.bs-example-modal-sm'+id).find('#contract-value').val();
        contract_value = web3.toWei(contract_value,"ether");
        var contract_year = $('.bs-example-modal-sm'+id).find('#contract-year').val();
        var transferInstance = await App.contracts.Transfer.deployed();
        try{
            var tx = await transferInstance.requestOffer(player_id,contract_value,contract_year,{from:App.account});
            $('.btn btn-primary').hide();
            window.location.replace("/contractsSent.html");
        }catch(err){
            $('.alert').show();
            if(err.message.includes("Error: VM")){
                var n = err.message.indexOf("VM")
                $('.alert').text(err.message.slice(n));
            }
        }
    } 
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});