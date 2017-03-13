(function() {
  'use strict'; 



	//main logic/functionality
	var RPS = { 

      	actions: ['r', 'p', 's'],

      	resultsDiv: $("#results"),

      	winnerDiv: $("#winner"),

      	scoreDiv: $("#score"),

      	messageResult: '',

      	messageScore: '',

      	db: null,

      	player1_name: null,

      	player1_pick: null,

      	player2_name: null,

      	player2_pick: null,

      	roundWinner: null,

      	compScore: 0,

      	userScore: 0,

      	numGames: 0,

	   	init: function(){  
	   		this.connectFirebase();

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

			    //do nothing more if nothing exists
			    if (thisVal) {
				    var thisValArr = Object.keys(thisVal);
				    var lastIndex = thisValArr.length - 1;
				    console.log('player'+(lastIndex+1));

				    var lastKey = thisValArr[lastIndex];
				    var lastObj = thisVal[lastKey];
				    console.log(lastObj.name);			    	
			    };
		    // Handle the errors
		    }, function(errorObject) {
		      console.log("Errors handled: " + errorObject.code);
		    });

		  	//listen for when user score updates



		  	//listen or chat updates
		    this.db.ref('/chat').orderByChild("time").limitToLast(1).on("child_added", function(snapshot) {

		      // Change the HTML to reflect
		      // $("#name-display").html(snapshot.val().name);
		      // $("#comment-display").html(snapshot.val().comment);
		    });		  	

	   	},

	   	creatUser: function(name){ 
	   		//if no user created, create player1
	   		//else if player1 is created but not player2, create player2 and remove login form 		   	
	   		if (!this.player1_name) {
	   			this.player1_name = name;
				RPS.db.ref('/players').child('1').set({
					name: name,
					choice: '',
					loses: 0,
					wins: 0
				});
	   		}else if ((this.player1_name.length	 > 0) && !this.player2_name) {
	   			this.player2_name = name;
				RPS.db.ref('/players').child('2').set({
					name: name,
					choice: '',
					loses: 0,
					wins: 0
				});

				$('#createPlayers').fadeOut();
	   		};
	   	},

	   	setPlayer1_GUI: function(){

	   	},

	   	setPlayer2_GUI: function(){

	   	},

	   	submitUserChoice: function(selection){

	   	},

	   	decideWinner: function(){

	        messageResult = 'computer picked: '+computer+' and user picked: '+user;

	        if (computer === user) {            
	          messageResult = 'no score - tie';
	          roundWinner = 'no winner - ties don\'t count!';
	        }else if (computer === "r" && user === "s") {
	          compScore++;
	          roundWinner = 'Computer won :(';
	        }else if (computer === "p" && user === "r") {
	          compScore++;
	          roundWinner = 'Computer won :(';
	        }else if (computer === "s" && user === "p") {
	          compScore++;
	          roundWinner = 'Computer won :(';
	        }else if (user === "r" && computer === "s") {
	          userScore++
	          roundWinner = 'YOU WON!! :)';          
	        }else if (user === "p" && computer === "r") {
	          userScore++
	          roundWinner = 'YOU WON!! :)';          
	        }else if (user === "s" && computer === "p") {
	          userScore++
	          roundWinner = 'YOU WON!! :)';          
	        };                


	        numGames++;

	        messageScore = 'compScore: '+compScore+'    userScore: '+userScore; 

	        resultsDiv.innerHTML = messageResult;
	        winnerDiv.innerHTML = roundWinner;
	        scoreDiv.innerHTML = messageScore;	 

	   	},

	   	postChat: function(message){
	   		//
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
	$('#playerName_btn').on('click', function(e){
		e.preventDefault();
		RPS.postChat( $('#playerChatField').val().trim() );
	});

	//get user input via keyboard as an option
	/*window.addEventListener('keydown', function(event) {
	  var keyPressed = event.key;

	  if (keyPressed === 'r' || keyPressed === 'p' || keyPressed === 's'){
	    userPick = keyPressed;

	    //if allowable key is pressed, have computer generate random selection
	    computerPick();
	  }
	}, false);*/


}()); 