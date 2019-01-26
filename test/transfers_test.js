var Transfer =  artifacts.require('Transfer');

contract ('Transfer', function(accounts){
	const mcfc = accounts[1];
	const fcb = accounts[2];
	var mcfcAddress;
	
	it('should register a club', async()=>{
		const tr = await Transfer.deployed();
		
		var eventEmitted = false;
		//var event = Transfer.ClubAdded();
		
		const tx = await tr.registerClub("MCFC",{from:mcfc});
		
		if (tx.logs[0].event === 'ClubAdded'){
			mcfcAddress = tx.logs[0].args._club;
			eventEmitted = true;
		}		
		const result = await tr.getClubName(mcfcAddress);
		
		assert.equal(result.toString(),"MCFC","club name different from the address registered");
		assert.isTrue(eventEmitted,"register club did not emmit an event");
	})

    it('register an already registered club - FAIL', async()=>{
		const tr = await Transfer.deployed();
		var eventEmitted;
        try{
            const tx = await tr.registerClub("MCFC",{from:accounts[3]});
            if (tx.logs[0].event === 'ClubAdded'){
                mcfcAddress = tx.logs[0].args._club;
                eventEmitted = true;
            }
        }catch(err){
            console.log(err);
            eventEmitted = false;
        }

        assert.isFalse(eventEmitted,"Two clubs with the same name/address has been registered")
	})
	
	it('add a player from club2 (FCB) and create a token', async()=>{
		const tr = await Transfer.deployed();

		var eventEmitted = false;
		var value = web3.toWei(3,'ether');
		var wage = web3.toWei(1,'ether');
		var eventEmitted = false;
        var pid;
        var token;

		const tx1 = await tr.registerClub("FCB",{from:fcb});
		const tx2 = await tr.addPlayer("Lionel Messi",value,wage,0,{from:fcb})	

        if (tx2.logs[0].event === 'PlayerAdded'){
			pid = tx2.logs[0].args._pid;
			eventEmitted = true;
		}
        if (tx2.logs[1].event === 'Transfer'){
			token = tx2.logs[1].args.tokenId;
		}

        const result = await tr.fetchPlayer(pid);
        const owner = await tr.ownerOf(pid)

        assert.isTrue(eventEmitted,"add player did not emmit an event");
        assert.equal(result[0],"Lionel Messi","Player name not matching");
        assert.equal(result[1],fcb,"Player club address not matching");
        assert.equal(result[2],"FCB","Player club name not matching");
        assert.equal(result[3],value,"Player value not matching");
        assert.equal(result[4],wage,"Player wage not matching");
        assert.equal(result[5],0,"Player contract length not matching");
        assert.equal(result[6],0,"Player state should be 'Transfer Listed'");
        assert.exists(token,"token not created while registering player")
        assert.equal(owner,fcb,"token owner not transfered")
	})

    it('should send a contract offer for the player', async()=>{
        const tr = await Transfer.deployed();
        var offer_value = web3.toWei(5,'ether');
        var cid;
        var eventEmitted = false;

        const tx = await tr.requestOffer(0,offer_value,4,{from:mcfc})

        if (tx.logs[0].event === 'ContractAdded'){
			cid = tx.logs[0].args._cid.toNumber();
			eventEmitted = true;
		}
        const result = await tr.fetchContract(0,cid);
        // const result1 = await tr.getContractValue(0,cid);

        assert.isTrue(eventEmitted,"request offer player did not emmit an event");
        assert.equal(result[0],0,"player id not matching");
        assert.equal(result[1],0,"contractid id not matching");
        assert.equal(result[2],"MCFC","clubname not matching");
        assert.equal(result[3],offer_value,"offered value not matching");
        assert.equal(result[5],4,"contract length not matching");
    })	

    it("provide offer to a player from its current club - FAIL", async()=>{
        var offer_value = web3.toWei(5,'ether');
        var eventEmitted;
        const tr = await Transfer.deployed();
        try{
            const tx = await tr.requestOffer(0,offer_value,4,{from:fcb})

        if (tx.logs[0].event === 'ContractAdded'){
			cid = tx.logs[0].args._cid.toNumber();
			eventEmitted = true;
		}
        }catch(err){
            eventEmitted=false;
        }
        assert.isFalse(eventEmitted,"request offer sent by the player's current club");
    })

    it('accept player contract requested by a club', async()=>{
        const tr = await Transfer.deployed();
        var eventEmitted = false;
        var offer_value = web3.toWei(5,'ether');

        var tx = await tr.acceptOffer(0,0,{from:fcb});

        if(tx.logs[0].event === 'Transfer'){
            pid = tx.logs[0].args.tokenId.toNumber();
            eventEmitted = true;
        }

        const result = await tr.fetchPlayer(pid);
        const owner = await tr.ownerOf(pid)

        assert.isTrue(eventEmitted,"accept offer did not emmit an event");
        assert.equal(result[0],"Lionel Messi","Player name not matching");
        assert.equal(result[3],offer_value,"New Player value not matching");
        assert.equal(result[5],4,"Player contract length not matching");
        assert.equal(result[6],1,"Player state should be 'TransferAccept'");
        assert.equal(owner,mcfc,"token owner while accepting a contract")
    })

    it("should not send a contract to a Transfer Accepted player - FAIL",async()=>{
        const tr = await Transfer.deployed();
        var eventEmitted = false;
        var offer_value = web3.toWei(5,'ether');
        try{
            const tx = await tr.requestOffer(0,offer_value,4,{from:mcfc})
            if (tx.logs[0].event === 'ContractAdded'){
                cid = tx.logs[0].args._cid.toNumber();
                eventEmitted = true;
		}
        }catch(err){
            eventEmitted=false;
        }
        assert.isFalse(eventEmitted,"request offer sent to a player that accepted another contract+");
    })

    it("finalise the deal for the player by transfering the required funds", async()=>{
        const tr = await Transfer.deployed();
        var wage = web3.toWei(1.5,"ether");
        var offer_value = web3.toWei(5,'ether');

        var beforeBalance_MCFC = web3.eth.getBalance(mcfc);
        var beforeBalance_FCB = web3.eth.getBalance(fcb);

        const tx = await tr.finaliseDeal(0,0,wage,{from:mcfc, value : offer_value})

        var afterBalance_MCFC = web3.eth.getBalance(mcfc);
        var afterBalance_FCB = web3.eth.getBalance(fcb);
        var difference_MCFC = beforeBalance_MCFC - afterBalance_MCFC;
        var difference_FCB = afterBalance_FCB - beforeBalance_FCB;

        const result = await tr.fetchPlayer(0);

        assert(difference_MCFC > offer_value,"new offered not properly deducted for club account");
        assert.equal(difference_FCB,offer_value,"seliing club did not receive the value fo the player");
        assert.equal(result[1],mcfc,"new club not reflected");
        assert.equal(result[2],'MCFC',"new club name not reflected");
        assert.equal(result[4],wage,"new player wage not reflected");
        assert.equal(result[6],2,"Player State should be 'Not Listed'");

    })

    it("should not send a contract to a Transfer Not Listed player - FAIL",async()=>{
        const tr = await Transfer.deployed();
        var eventEmitted = false;
        var offer_value = web3.toWei(5,'ether');
        try{
            const tx = await tr.requestOffer(0,offer_value,4,{from:mcfc})
            if (tx.logs[0].event === 'ContractAdded'){
                cid = tx.logs[0].args._cid.toNumber();
                eventEmitted = true;
		}
        }catch(err){
            eventEmitted=false;
        }
        assert.isFalse(eventEmitted,"request offer sent to a player that accepted another contract+");
    })

    it("cannot finalise deal to a Transfer Not Listed player - FAIL",async()=>{
        const tr = await Transfer.deployed();
        var eventEmitted = false;
        var offer_value = web3.toWei(5,'ether');
        try{
            const tx = await tr.finaliseDeal(0,0,wage,{from:mcfc, value : offer_value})
            if (tx){
                eventEmitted = true;
		    }
        }catch(err){
            eventEmitted=false;
        }
        assert.isFalse(eventEmitted,"finalise deal sent to a player that is not transfer lister");
    })
})