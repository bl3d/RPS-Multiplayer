(function() {
  'use strict'; 



	//main logic/functionality
	var RPS = {   

      	db: null,

      	player1_name: '', //until actually set (chat purposes)

      	player1_pick: null,

      	player1_wins: 0,

      	player1_losses: 0,

      	player2_name: '', //until actually set (chat purposes)

      	player2_pick: null,

      	player2_wins: 0,

      	player2_losses: 0,

      	player: null, //is this player 1 or 2 on the page?

      	playersLoaded: false,

      	roundWinner: null, 

	   	init: function(){  
	   		this.connectFirebase();

	   		//set waiting prompt
	   		$('#player1_main').find('.pName').text('Waiting for Player 1');
	   		$('#player2_main').find('.pName').text('Waiting for Player 2');
	   	},

	   	connectFirebase: function(){
		  	// Initialize Firebase
		  	var config = {
		    	apiKey: "AIzaSyCZV7LkQh8CYJ4jI-7V9f_QStlH3Ex6h2A",
		    	authDomain: "rps-multiplayer-72ffc.firebaseapp.com",
		    	databaseURL: "https://rps-multiplayer-72ffc.firebaseio.com",
		    	storageBucket: "rps-multiplayer-72ffc.appspot.com",
		    	messagingSenderId: "47045967852"
		  	};
		  	var defaultApp = firebase.initializeApp(config);	 
		  	this.db = defaultApp.database(); 					

		  	//listen for when users are added to db, put them in page
		    this.db.ref('/players').on("value", function(snapshot) { 
			    var thisVal = snapshot.val(); 

			    //do nothing if no data exists (on load)
			    if (thisVal) { 
				    var thisValArr = Object.keys(thisVal); 
				    var lastIndex = thisValArr.length - 1; 
				    var lastKey = thisValArr[lastIndex]; 
				    var lastObj = thisVal[lastKey];  

				    //build players on first goRound
				    if (lastIndex === 0) {
				    	// this is player1  
				    	if (!RPS.playersLoaded) {
				    		//add initial player info
				    		RPS.setPlayer1_GUI(lastObj.name, lastObj.wins, lastObj.losses);
				    	}
				    }else{
				    	//this is palyer2	 			    	   
				    	if (!RPS.playersLoaded) { 
				    		RPS.playersLoaded = true;

				    		//add initial player info
				    		RPS.setPlayer2_GUI(lastObj.name, lastObj.wins, lastObj.losses);

					    	//since both players are here, start game					    	
							RPS.db.ref('/turn').set(1);		    	
				    	}	

				    	//
					    if (thisVal['2'].choice) {
					    	RPS.player1_pick = thisVal['1'].choice; 
					    	RPS.player2_pick = thisVal['2'].choice;   
					    };				    							    		    				    	
				    } 

				    //if just checking for score updates
				    if (RPS.roundWinner) {
				    	RPS.setPlayer1_GUI(false, thisVal['1'].wins, thisVal['1'].losses);
				    	RPS.setPlayer2_GUI(false, thisVal['2'].wins, thisVal['2'].losses);
				    };	

			    };



		    // Handle the errors
		    }, function(errorObject) {
		      console.log("Errors handled: " + errorObject.code);
		    });


			//listen for turn updates
		    this.db.ref('/turn').on("value", function(snapshot) { 
			    var thisVal = snapshot.val();  

			    // do nothing if no data exists (on load)
			    if (thisVal) {  
		    		RPS.yourTurn(thisVal);
			    };

		    // Handle the errors
		    }, function(errorObject) {
		      console.log("Errors handled: " + errorObject.code);
		    });
		    

		  	//listen for chat updates
		    this.db.ref('/chat').orderByChild("time").limitToLast(1).on("child_added", function(snapshot) {
		    	// console.log(snapshot.val().message);
		    	var line = $('<h4>');
		    	if (snapshot.val().player === 1) {
		    		line.addClass('p1c').text(RPS.player1_name+': '+snapshot.val().message);
		    	}else{
		    		line.addClass('p2c').text(RPS.player2_name+': '+snapshot.val().message);
		    	}
		    	line.appendTo('#chatResults');
		    });		  	

	   	},

	   	creatUser: function(name){  
	   		//if no user created, create player1
	   		//else if player1 is created but not player2, create player2
	   		if (!RPS.player1_name) {    
	   			RPS.player = 1;			
				RPS.db.ref('/players').child('1').set({
					name: name,
					choice: null,
					losses: 0,
					wins: 0
				});		

				//check for player1 disconnect and remove data
				RPS.db.ref('/players/1').onDisconnect().remove(function() {
				   RPS.playerDisconnected(1);
				});	

	   		}else if (RPS.player1_name && !RPS.player2_name) { 		
	   			RPS.player = 2;
				RPS.db.ref('/players').child('2').set({
					name: name,
					choice: null,
					losses: 0,
					wins: 0
				});	

				//check for player2 disconnect and remove data
				RPS.db.ref('/players/2').onDisconnect().remove(function() {
				   RPS.playerDisconnected(2);
				});									
	   		};

	   		//remove #createPlayers form now that user is logged in
	   		$('#createPlayers').fadeOut();
	   	},

	   	setPlayer1_GUI: function(name, wins, losses){
	   		//if setting name for first time
			if (name) {
				RPS.player1_name = name;

		   		if (RPS.player === 1) {
			   		//notify user what player they are
			   		$('#userName').text('Hi '+name+'! You are Player 1');	   			
		   		}; 
		   		//set name in DOM
		   		$('#player1_main').find('.pName').text(name);				
			}; 

	   		//set or update wins/losses
	   		$('#player1_main').find('.pResults')
	   		.text('Wins: '+wins+'   Loses: '+losses); 
	   	},

	   	setPlayer2_GUI: function(name, wins, losses){	   			   	
	   		//if setting name for first time
			if (name) {
				RPS.player2_name = name;

		   		if (RPS.player === 2) {
			   		//notify user what player they are
			   		$('#userName').text('Hi '+name+'! You are Player 2');	   			
		   		}; 
		   		//set name in DOM
		   		$('#player2_main').find('.pName').text(name);			
			}; 

	   		//set or update wins/losses
	   		$('#player2_main').find('.pResults')
	   		.text('Wins: '+wins+'   Loses: '+losses); 
	   	},

	   	yourTurn: function(pNum){  
	   		var rpsBtns = ''+
	   			'<btn class="userChoice" data-choice="rock">Rock</btn>'+
	   			'<btn class="userChoice" data-choice="paper">Paper</btn>'+
	   			'<btn class="userChoice" data-choice="scissors">Scissors</btn>'; 	   			

	   		if (pNum === 1) {
	   			//if it's player1's turn, prompt them and provide RPS buttons 
	   			if (RPS.player === 1) {
	   				$('#playerStatus').text('It\'s Your Turn!'); 
	   				$('#player1_main').find('.rpsBtnHolder').html(rpsBtns);
	   			}else{
		   			$('#playerStatus').text('Waiting for '+RPS.player1_name+' to choose.');
	   			} 
	   		}else if(pNum === 2){	   	
	   			$('#player1_main').find('.rpsBtnHolder').empty();		
	   			//if it's player2's turn, prompt them and provide RPS buttons
	   			if (RPS.player === 2) {  
	   				$('#playerStatus').text('It\'s Your Turn!');	   				
	   				$('#player2_main').find('.rpsBtnHolder').html(rpsBtns);
	   			}else{
		   			$('#playerStatus').text('Waiting for '+RPS.player2_name+' to choose.');
	   			}
	   		}else { 
	   			RPS.decideWinner(RPS.player1_pick, RPS.player2_pick);
	   		}
	   	},

	   	submitUserChoice: function(selection){  

	   		//get rid of selections after choice is made
	   		$('.rpsBtnHolder').empty();

	   		if (RPS.player === 1) { 
				RPS.db.ref('/players').child('1').update({
					choice: selection
				});	

				//show player1 their selection
				$('#player1_main').find('.large').text(selection);

				//let player2 have a turn!
				RPS.db.ref('/turn').set(2);
	   		}else{ 
				RPS.db.ref('/players').child('2').update({
					choice: selection
				});	

				//show player2 their selection
				$('#player2_main').find('.large').text(selection);

				//go ahead and see who wins
				RPS.db.ref('/turn').set(3);				
	   		}
	   	},

	   	decideWinner: function(p1Pick, p2Pick){  

	        if (p1Pick === p2Pick) {            
	          //tie game, start next round
	          $('#gameResults').find('.large').html('Tie Game!');
	          RPS.roundWinner = null;
	        }else if (p1Pick === "rock" && p2Pick === "scissors") {	          
	          RPS.roundWinner = RPS.player1_name;
	          RPS.player1_wins++;
	          RPS.player2_losses++;
	        }else if (p1Pick === "paper" && p2Pick === "rock") {
	          RPS.roundWinner = RPS.player1_name;
	          RPS.player1_wins++;
	          RPS.player2_losses++;	          
	        }else if (p1Pick === "scissors" && p2Pick === "paper") {
	          RPS.roundWinner = RPS.player1_name;
	          RPS.player1_wins++;
	          RPS.player2_losses++;	          
	        }else if (p2Pick === "rock" && p1Pick === "scissors") {
	          RPS.roundWinner = RPS.player2_name;   
	          RPS.player2_wins++;
	          RPS.player1_losses++;	 	                 
	        }else if (p2Pick === "paper" && p1Pick === "rock") {
	          RPS.roundWinner = RPS.player2_name;   
	          RPS.player2_wins++;
	          RPS.player1_losses++;	        
	        }else if (p2Pick === "scissors" && p1Pick === "paper") {
	          RPS.roundWinner = RPS.player2_name;   
	          RPS.player2_wins++;
	          RPS.player1_losses++;	         
	        };


	        //game results 
	        $('#player1_main').find('.large').text(p1Pick);
	        $('#player2_main').find('.large').text(p2Pick);	        
	        if (RPS.roundWinner) {
	        	$('#gameResults').find('.large').html(RPS.roundWinner+'<br>Wins!');
	        };	

   			//update player1 standing 
	        RPS.db.ref('/players').child('1').update({ 
			  losses: RPS.player1_losses,
			  wins: RPS.player1_wins
	        });	   		        
 
    		//update player2 standing 
	        RPS.db.ref('/players').child('2').update({ 
			  losses: RPS.player2_losses,
			  wins: RPS.player2_wins
	        });

	        //timeout and then start new round	        	
    		setTimeout(function(){
		   		//set main fileds to blank
		        $('#gameResults').find('.large').empty();
		        $('#player1_main').find('.large').empty();
		        $('#player2_main').find('.large').empty();    			
    			RPS.db.ref('/turn').set(1);
    		}, 3500); 
	        	 

	   	},

	   	postChat: function(message){  
	   		//don't allow chats until folks get signed in
	   		if (!RPS.player) {
	   			$('#chatResults').html('<h4>Please log in first using field at top of page.</h4>');
	   		}else{
			    RPS.db.ref().child('/chat').push({
			      player: RPS.player,
			      message: message, 
			      dateAdded: firebase.database.ServerValue.TIMESTAMP
			    });		   			
	   		} 

		    $('#playerChatField').val('');   		
	   	},

	   	playerDisconnected: function(player){
	   		var pName;

	   		if (player === 1) {
	   			pName = player1_name;

	   		}else{
	   			pName = player2_name;
	   			
	   		}

	   		$('#chatResults').append('<h4 class="disconnectMessage">'+pName+' Has disconnected.</h4>');
	   	}

	};


	// kick off RPS Multiplayer game
	RPS.init();  





	//user events
	//**************************************************//


	//create new user
	$('#playerName_btn').on('click', function(e){
		e.preventDefault();
		RPS.creatUser( $('#playerName').val().trim() );
	});

	//get user's RPS selection
 	$(document).on('click', '.userChoice', function(){  
 		RPS.submitUserChoice( $(this).attr('data-choice') );
 	});

	//send chat message
	$('#playerChat_btn').on('click', function(e){
		e.preventDefault();
		RPS.postChat( $('#playerChatField').val().trim() );
	});



}()); 