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

            //App.listenForEvents();

            App.render();
        });
    },

    listenForEvents: function() {
        App.contracts.Transfer.deployed().then(function(instance) {
        // Restart Chrome if you are unable to receive this event
        // This is a known issue with Metamask
        // https://github.com/MetaMask/metamask-extension/issues/2393
        instance.ContractAdded({}, {
            fromBlock: 0,
            toBlock: 'latest'
        }).watch(function(error, event) {
            //console.log("Contract event triggered", event)
            //App.render();
            
            });
        });
    },

    render: async function() {
        var transferInstance;
        var loader = $("#loader");
        var content = $("#content");
        
        var playerName = $("#player-name");
        playerName.empty();

        var offerID = $("#offer-id");
        offerID.empty();

        var offerValue = $("#offer-value");
        offerValue.empty();

        var offerYear = $("#offer-year");
        offerYear.empty(); 
        
        $('.add-player').hide()

        loader.show();
        content.hide();

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
            App.account = account;
            $("#accountAddress").html("Your Account: " + account);
            }
        });

        var players = []; var totalPlayers;

        $('.contract').empty();
        var transferInstance = await App.contracts.Transfer.deployed()
        const total = await transferInstance.playerID();
        for(var i=0 ; i<total; i++){
            contracts = [];
            var id = i
            var player = await transferInstance.player(i);
            var name   = player[1];
            var player_address = player[5];
            var state = player[6];
            var player_club = await transferInstance.getClubName(player[5]) ;
            var ctotal = await transferInstance.contractNo(i);
            players.push({name:name,ctotal:ctotal.toNumber()});
            for(var j=0; j<ctotal;j++){
                var result = await transferInstance.playerContract(i,j);
                offer_id = result[0];
                offer_address = result[1];
                offer_club = await transferInstance.getClubName(result[1]);
                offer_value = result[2];
                offer_value = web3.fromWei(offer_value,"ether");
                offer_wage = result[3];
                offer_year = result[4];
                offer_state = result[5];
                contracts.push({o_value :result[2].toNumber(), o_year:result[4].toNumber(), o_wage:result[3].toNumber()});
                if(offer_address == App.account && offer_state == 0){
                    var contractResults = '<div class="col-sm-6 col-md-4"><div class="thumbnail"><div class="caption"><h3> Player ID : '+id+'</h3><h4>'+name+'</h4><ul><li>Contract ID : '+offer_id+'</li><li>Offered By : '+offer_club+'</li><li>Offered Value : '+offer_value+' ETH</li><li>Years : '+offer_year+' yrs</li></ul></div></div></div>' ;
                    $('.contract').append(contractResults);
                }else if (offer_address == App.account && offer_state == 1){
                    var contractResults = '<div class="col-sm-6 col-md-4"><div class="thumbnail"><div class="caption"><h3> Player ID : '+id+'</h3><h4>'+name+'</h4><ul><li>Contract ID : '+offer_id+'</li><li>Offered By : '+offer_club+'</li><li>Offered Value : '+offer_value+' ETH</li><li>Years : '+offer_year+' yrs</li></ul><p>Status : Accepted by '+player_club+'</div><button type="button" class="btn btn-success" data-toggle="modal" data-target=".bs-example-modal-sm'+id+offer_id+'">Finalise Deal</button><div class="modal fade bs-example-modal-sm'+id+offer_id+'" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel"><div class="modal-dialog modal-sm" role="document"><div class="modal-content"><div class="modal-header"><h4>Pay and Finalise Deal</h4></div><div class="modal-body"><form onSubmit="App.finaliseDeal('+id+','+offer_id+'); return false;"><div class="form-group"><label for="player-id" class="control-label">ID:</label><input type="text" class="form-control" id="player-id" value="'+id+'"readonly></div><div class="form-group"><label for="contract-id" class="control-label">Contract ID:</label><input type="text" class="form-control" id="offer-id" value="'+offer_id+'"readonly></div><div class="form-group"><label for="offer-value" class="control-label">Offer Value:</label><input type="text" class="form-control" id="offer-value" value="'+offer_value+'"readonly></div><div class="form-group"><label for="offer-wage" class="control-label">Wage Offered:</label><input type="number" class="form-control" id="offer-wage"></div><button type="submit" class="btn btn-success">Pay & Finalise Deal</button></form></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div></div>';
                    $('.contract').append(contractResults);
                }       
            }
        } 
    },

    finaliseDeal : async function(pid,cid){
        var player_id = $('.bs-example-modal-sm'+pid+cid).find('#player-id').val();
        var contract_id = $('.bs-example-modal-sm'+pid+cid).find('#offer-id').val();
        var offer_value = $('.bs-example-modal-sm'+pid+cid).find('#offer-value').val()
        offer_value = web3.toWei(offer_value,"ether");
        var offer_wage = $('.bs-example-modal-sm'+pid+cid).find ('#offer-wage').val()
        var transferInstance = await App.contracts.Transfer.deployed();
        var tx = await transferInstance.finaliseDeal(player_id,contract_id,offer_wage,{from:App.account, value : offer_value});
        alert("Transactins ID : "+tx.tx);
        window.location.replace("/");

    }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});