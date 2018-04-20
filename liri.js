var fs = require("fs");							//NPM package for reading and writing files

var keys = require("./keys.js");				//Twitter keys and access tokens
var Twitter = require("twitter");				//NPM package for twitter
var client = new Twitter(keys.twitterKeys);		//New instance of a twitter client

var request = require("request");				//NPM package for making ajax-like calls

var spotify = require("spotify");				//NPM package for spotify

var userCommand = process.argv[2];
var artName = process.argv[3];

doNext(userCommand,artName);

function doNext(uC, aN){
	switch(uC){
	case 'my-tweets':
		fetchTwitter();
	break;

	case "spotify-this-song":
		fetchSpotify(aN);
	break;

	case "movie-this":
		fetchOMDB(aN);
	break;

	case "do-what-it-says":
		fetchRandom();
	break;

	default:
	break;
	}
}

function fetchTwitter(){
	var tweetsLength;

	//From twitter's NPM documentation, grab the most recent tweets
	var params = {screen_name: 'Ally0426Lee'};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if(error) throw error;

		//Loop through the number of tweets that were returned to get the number of tweets returned.
		//If the number of tweets exceeds 20, make it 20.
		//Then loop through the length of tweets and return the tweets date and text.
		tweetsLength = 0;

		for(var i=0; i<tweets.length; i++){
			tweetsLength ++;
		}
		if (tweetsLength > 20){
			tweetsLength = 20;
		}
		for (var i=0; i<tweetsLength; i++){
			console.log("Tweet " + (i+1) + " created on: " + tweets[i].created_at);
			console.log("Tweet " + (i+1) + " text: " + tweets[i].text);
			console.log("--------------------------------------------------------------");

			appendFile("Tweet " + (i+1) + " created on: " + tweets[i].created_at);
			appendFile("Tweet " + (i+1) + " text: " + tweets[i].text);
			appendFile("--------------------------------------------------------------");
		}
	});
}

function upperCase (string){
	//Capitalize first letter of each part of song name
	return string.toUpperCase();
}
function titleCase(string){
	var firstLetter = /(^|\s)[a-z]/g;
	return string.replace(firstLetter, upperCase);
}

function fetchSpotify(song){
	var songName;

	//If a song WAS chosen, make it title case so spotify can find it in its database
	//If a song was not typed it, default to the song The Sign
	if (song != null){
		songName = titleCase(song);
	}
	else {
		songName = "The Sign";
	}
	console.log("Searching for: " + songName);
	console.log("------------------------");

	appendFile("Searching for: " + songName);
	appendFile("---------------------------------");

	//Get data from spotify API based on the query term (song name) typed in by the user
	spotify.search({ type: 'track', query: songName}, function(err, data) {
	    if ( err ) {
	        console.log('Error occurred: ' + err);
	        return;
	    }

	    var matchedTracks = [];
	    var dataItems = data.tracks.items;

	    for (var i=0; i< 20; i++){
	    	if (data.tracks.items[i].name == songName){
	    		matchedTracks.push(i);
	    	}
	    }

	    console.log(matchedTracks.length + " tracks found that match your query.");
	    appendFile(matchedTracks.length + " tracks found that match your query.");

	    if (matchedTracks.length > 0){
    		console.log("Track: " + dataItems[matchedTracks[0]].name);	
			console.log("Artist: " + dataItems[matchedTracks[0]].artists[0].name);
			console.log("Album: " + dataItems[matchedTracks[0]].album.name);
			console.log("Spotify link: " + dataItems[matchedTracks[0]].external_urls.spotify);

			appendFile("Track: " + dataItems[matchedTracks[0]].name);
			appendFile("Artist: " + dataItems[matchedTracks[0]].artists[0].name);
			appendFile("Album: " + dataItems[matchedTracks[0]].album.name);
			appendFile("Spotify link: " + dataItems[matchedTracks[0]].external_urls.spotify);
		}
		else if (matchedTracks.length == 0){
			console.log("Sorry, but spotify does not contain that song in their database :(");
			appendFile("Sorry, but spotify does not contain that song in their database :(");
		}
		
	});
}

function fetchOMDB(movieName){
	//If a movie was not typed it, default to the movie Mr. Nobody
	if (artName == null){
		movieName = "Mr. Nobody";
	}

	var requestURL = "http://www.omdbapi.com/?t=" + movieName + "&tomatoes=true&y=&plot=short&r=json";

	request(requestURL, function (error, response, data){

		//200 response means that the page has been found and a response was received.
		if (!error && response.statusCode == 200){
			console.log("Everything working fine.");
		}
		console.log("---------------------------------------------");
		console.log("The movie's title is: " + JSON.parse(data)["Title"]);
		console.log("The movie's release year is: " + JSON.parse(data)["Year"]);		
		console.log("The movie's rating is: " + JSON.parse(data)["imdbRating"]);
		console.log("The movie's was produced in: " + JSON.parse(data)["Country"]);
		console.log("The movie's language is: " + JSON.parse(data)["Language"]);
		console.log("The movie's plot: " + JSON.parse(data)["Plot"]);
		console.log("The movie's actors: " + JSON.parse(data)["Actors"]);
		console.log("The movie's Rotten Tomatoes Rating: " + JSON.parse(data)["tomatoRating"]);
		console.log("The movie's Rotten Tomatoes URL: " + JSON.parse(data)["tomatoURL"]);

		appendFile("---------------------------------------------");
		appendFile("The movie's title is: " + JSON.parse(data)["Title"]);
		appendFile("The movie's release year is: " + JSON.parse(data)["Year"]);		
		appendFile("The movie's rating is: " + JSON.parse(data)["imdbRating"]);
		appendFile("The movie's was produced in: " + JSON.parse(data)["Country"]);
		appendFile("The movie's language is: " + JSON.parse(data)["Language"]);
		appendFile("The movie's plot: " + JSON.parse(data)["Plot"]);
		appendFile("The movie's actors: " + JSON.parse(data)["Actors"]);
		appendFile("The movie's Rotten Tomatoes Rating: " + JSON.parse(data)["tomatoRating"]);
		appendFile("The movie's Rotten Tomatoes URL: " + JSON.parse(data)["tomatoURL"]);											
	});
}

function fetchRandom(){
	//LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
	//Runs `spotify-this-song` for "I Want it That Way," as follows the text in `random.txt`.
	fs.readFile("random.txt", 'utf8', function(err, data){

		// console.log(data);

		//Creating an array from a string with split()
		//Every comma, push the element into the array
		var dataArr = data.split(',');

		// console.log(dataArr);

		var randomUserCommand = dataArr[0];
		var randomArtName = dataArr[1];

		console.log("You requested to " + "<" + randomUserCommand + "> with " + randomArtName);
		appendFile("You requested to " + "<" + randomUserCommand + "> with " + randomArtName);

		//Remove the quotes before making a request
		randomArtName = randomArtName.replace(/^"(.*)"$/, '$1');

		doNext(randomUserCommand, randomArtName);
	});
}

function appendFile(dataToAppend){

	//Output all that happens into a log.txt file
	fs.appendFile("log.txt", dataToAppend , function(err){

		//If an error happens while trying to write to the file
		if (err){
			return console.log(err);
		}
	});
}














// /*
// *	Load Required Node Modules
// */

// require("dotenv").config();

// var Twitter = require('twitter');
// var spotify = require('spotify');
// var request = require('request');
// var fs = require('fs');

// /*
// *	Load the user Twitter keys
// */

// var keys = require('./keys.js');
// var twitterKeys = keys.twitter;
// // var spotifyKeys = keys.spotify;

// /*
// * 	Read in command line arguments
// */

// // Read in the command line arguments
// var cmdArgs = process.argv;

// // The LIRI command will always be the second command line argument
// var liriCommand = cmdArgs[2];

// // The parameter to the LIRI command may contain spaces
// var liriArg = '';
// for (var i = 3; i < cmdArgs.length; i++) {
// 	liriArg += cmdArgs[i] + ' ';
// }

// // retrieveTweets will retrieve my last 20 tweets and display them together with the date
// function retrieveTweets() {
// 	// Append the command to the log file
// 	fs.appendFile('./log.txt', 'User Command: node liri.js my-tweets\n\n', (err) => {
// 		if (err) throw err;
// 	});

// 	// Initialize the Twitter client
//     var client = new Twitter(twitterKeys);
//     // var spotify = new Spotify(spotifyKeys);

// 	// Set the 'screen_name' to my Twitter handle
// 	var params = {screen_name: '_Ally0426Leenode liri.js my-tweets', count: 20};

// 	// Retrieve the last 20 tweets
// 	client.get('statuses/user_timeline', params, function(error, tweets, response) {
// 		if (error) {
// 			var errorStr = 'ERROR: Retrieving user tweets -- ' + error;

// 			// Append the error string to the log file
// 			fs.appendFile('./log.txt', errorStr, (err) => {
// 				if (err) throw err;
// 				console.log(errorStr);
// 			});
// 			return;
// 		} else {
// 			// Pretty print user tweets
// 			var outputStr = '------------------------\n' +
// 							'User Tweets:\n' + 
// 							'------------------------\n\n';

// 			for (var i = 0; i < tweets.length; i++) {
// 				outputStr += 'Created on: ' + tweets[i].created_at + '\n' + 
// 							 'Tweet content: ' + tweets[i].text + '\n' +
// 							 '------------------------\n';
// 			}

// 			// Append the output to the log file
// 			fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputStr + '\n', (err) => {
// 				if (err) throw err;
// 				console.log(outputStr);
// 			});
// 		}
// 	});
// }

// // spotifySong will retrieve information on a song from Spotify
// function spotifySong(song) {
// 	// Append the command to the log file
// 	fs.appendFile('./log.txt', 'User Command: node liri.js spotify-this-song ' + song + '\n\n', (err) => {
// 		if (err) throw err;
// 	});

// 	// If no song is provided, LIRI defaults to 'The Sign' by Ace Of Base
// 	var search;
// 	if (song === '') {
// 		search = 'The Sign Ace Of Base';
// 	} else {
// 		search = song;
// 	}

// 	spotify.search({ type: 'track', query: search}, function(error, data) {
// 	    if (error) {
// 			var errorStr1 = 'ERROR: Retrieving Spotify track -- ' + error;

// 			// Append the error string to the log file
// 			fs.appendFile('./log.txt', errorStr1, (err) => {
// 				if (err) throw err;
// 				console.log(errorStr1);
// 			});
// 			return;
// 	    } else {
//             var songInfo = data.tracks.items[0];
// 			if (!songInfo) {
// 				var errorStr2 = 'ERROR: No song info retrieved, please check the spelling of the song name!';

// 				// Append the error string to the log file
// 				fs.appendFile('./log.txt', errorStr2, (err) => {
// 					if (err) throw err;
// 					console.log(errorStr2);
// 				});
// 				return;
// 			} else {
// 				// Pretty print the song information
// 				var outputStr = '------------------------\n' + 
// 								'Song Information:\n' + 
// 								'------------------------\n\n' + 
//                                 'Song Name: ' + songInfo.name + '\n'+ 
// 								'Artist: ' + songInfo.artists[0].name + '\n' + 
// 								'Album: ' + songInfo.album.name + '\n' + 
// 								'Preview Here: ' + songInfo.preview_url + '\n';

// 				// Append the output to the log file
// 				fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputStr + '\n', (err) => {
// 					if (err) throw err;
// 					console.log(outputStr);
// 				});
// 			}
// 	    }
// 	});
// }

// // retrieveOMDBInfo will retrieve information on a movie from the OMDB database
// function retrieveOBDBInfo(movie) {
// 	// Append the command to the log file
// 	fs.appendFile('./log.txt', 'User Command: node liri.js movie-this ' + movie + '\n\n', (err) => {
// 		if (err) throw err;
// 	});

// 	// If no movie is provided, LIRI defaults to 'Mr. Nobody'
// 	var search;
// 	if (movie === '') {
// 		search = 'Mr. Nobody';
// 	} else {
// 		search = movie;
// 	}

// 	// Replace spaces with '+' for the query string
// 	search = search.split(' ').join('+');

// 	// Construct the query string
// 	var queryStr = 'http://www.omdbapi.com/?t=' + search + '&plot=full&tomatoes=true';

// 	// Send the request to OMDB
// 	request(queryStr, function (error, response, body) {
// 		if ( error || (response.statusCode !== 200) ) {
// 			var errorStr1 = 'ERROR: Retrieving OMDB entry -- ' + error;

// 			// Append the error string to the log file
// 			fs.appendFile('./log.txt', errorStr1, (err) => {
// 				if (err) throw err;
// 				console.log(errorStr1);
// 			});
// 			return;
// 		} else {
// 			var data = JSON.parse(body);
// 			if (!data.Title && !data.Released && !data.imdbRating) {
// 				var errorStr2 = 'ERROR: No movie info retrieved, please check the spelling of the movie name!';

// 				// Append the error string to the log file
// 				fs.appendFile('./log.txt', errorStr2, (err) => {
// 					if (err) throw err;
// 					console.log(errorStr2);
// 				});
// 				return;
// 			} else {
// 		    	// Pretty print the movie information
// 		    	var outputStr = '------------------------\n' + 
// 								'Movie Information:\n' + 
// 								'------------------------\n\n' +
// 								'Movie Title: ' + data.Title + '\n' + 
// 								'Year Released: ' + data.Released + '\n' +
// 								'IMBD Rating: ' + data.imdbRating + '\n' +
// 								'Country Produced: ' + data.Country + '\n' +
// 								'Language: ' + data.Language + '\n' +
// 								'Plot: ' + data.Plot + '\n' +
// 								'Actors: ' + data.Actors + '\n' + 
// 								'Rotten Tomatoes Rating: ' + data.tomatoRating + '\n' +
// 								'Rotten Tomatoes URL: ' + data.tomatoURL + '\n';

// 				// Append the output to the log file
// 				fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputStr + '\n', (err) => {
// 					if (err) throw err;
// 					console.log(outputStr);
// 				});
// 			}
// 		}
// 	});
// }

// // doAsYerTold will read in a file to determine the desired command and then execute
// function doAsYerTold() {
// 	// Append the command to the log file
// 	fs.appendFile('./log.txt', 'User Command: node liri.js do-what-it-says\n\n', (err) => {
// 		if (err) throw err;
// 	});

// 	// Read in the file containing the command
// 	fs.readFile('./random.txt', 'utf8', function (error, data) {
// 		if (error) {
// 			console.log('ERROR: Reading random.txt -- ' + error);
// 			return;
// 		} else {
// 			// Split out the command name and the parameter name
// 			var cmdString = data.split(',');
// 			var command = cmdString[0].trim();
// 			var param = cmdString[1].trim();

// 			switch(command) {
// 				case 'my-tweets':
// 					retrieveTweets(); 
// 					break;

// 				case 'spotify-this-song':
// 					spotifySong(param);
// 					break;

// 				case 'movie-this':
// 					retrieveOBDBInfo(param);
// 					break;
// 			}
// 		}
// 	});
// }

// // Determine which LIRI command is being requested by the user
// if (liriCommand === 'my-tweets') {
// 	retrieveTweets(); 

// } else if (liriCommand === `spotify-this-song`) {
// 	spotifySong(liriArg);

// } else if (liriCommand === `movie-this`) {
// 	retrieveOBDBInfo(liriArg);

// } else if (liriCommand ===  `do-what-it-says`) {
// 	doAsYerTold();

// } else {
// 	// Append the command to the log file
// 	fs.appendFile('./log.txt', 'User Command: ' + cmdArgs + '\n\n', (err) => {
// 		if (err) throw err;

// 		// If the user types in a command that LIRI does not recognize, output the Usage menu 
// 		// which lists the available commands.
// 		outputStr = 'Usage:\n' + 
// 				   '    node liri.js my-tweets\n' + 
// 				   '    node liri.js spotify-this-song "<song_name>"\n' + 
// 				   '    node liri.js movie-this "<movie_name>"\n' + 
// 				   '    node liri.js do-what-it-says\n';

// 		// Append the output to the log file
// 		fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputStr + '\n', (err) => {
// 			if (err) throw err;
// 			console.log(outputStr);
// 		});
// 	});
// }
