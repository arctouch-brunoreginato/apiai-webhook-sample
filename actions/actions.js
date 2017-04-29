var http = require('http');

var API_KEY = "1f54bd990f1cdfb230adb312546d765d";
var BASE_URL = "api.themoviedb.org";
var INVALID_ID = -1;

var actions = {
	"getMovies": getMovies
};

//GET MOVIES
function getMovies(params, callback) {
	var personId = null;
	var genreId = null;

	try {
		searchPerson(params.actorName, function(data, error) {
			if (error) {
				console.error(error);
				personId = INVALID_ID;
			} else {
				personId = data;

				if (personId != INVALID_ID && personId != null) {
					return discoverMovies(personId, genreId, callback);
				}
			}

			//error
			if (genreId == INVALID_ID && personId == INVALID_ID) {
				callback(null, "Generic problem");
			}
		});

		searchGenre(params.genreName, function(data, error) {
			if (error) {
				console.error(error);
				genreId = INVALID_ID;
			} else {
				genreId = data;

				if (personId != INVALID_ID && personId != null) {
					return discoverMovies(personId, genreId, callback);
				}
			}

			//error
			if (genreId == INVALID_ID && personId == INVALID_ID) {
				callback(null, "Generic problem");
			}
		});
	} catch (err) {
    	callback(null,"Server exception");
    }
}

//DISCOVER MOVIES
function discoverMovies(personId, genreId, callback) {
	console.log("Calling discover...");
	var PATH_GET_MOVIES = "/3/discover/movie?api_key=" + API_KEY;
	var urlParams = "&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=" + genreId + "&with_people=" + personId;

	var options = {
		host: BASE_URL,
		path: PATH_GET_MOVIES + urlParams,
		method: 'GET',
		port: null,
		headers: {}
	};

	var req = http.request(options, function(res) {
		var chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res.on('end', function() {
			var body = Buffer.concat(chunks);
			console.log("Response discover: " + body.toString());
			var json = JSON.parse(body.toString());

			var results = json.results
			if (results.length > 0) {
				var firstMovie = results[0];
				if (firstMovie) {
					return callback(firstMovie.original_title + " - " + firstMovie.overview);
				}
			}

			callback(null, "Movie not found");
		});
	});
	
	req.write("{}");
	req.end();
}

//SEARCH PERSON
function searchPerson(personName, callback) {
	console.log("Calling search person... " + personName);
	var PATH_SEARCH_PERSON = "/3/search/person?api_key=" + API_KEY
	var urlParams = "&language=en-US&query=" + encodeURIComponent(personName) + "&page=1&include_adult=false"

	var options = {
		host: BASE_URL,
		path: PATH_SEARCH_PERSON + urlParams,
		method: 'GET',
		port: null,
		headers: {}
	};

	var req = http.request(options, function(res) {
		var chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res.on("end", function () {
			var body = Buffer.concat(chunks);
			console.log("Response search person: " + body.toString());
			var json = JSON.parse(body.toString());

			var results = json.results
			if (results.length > 0) {
				var firstPerson = results[0];
				return callback(firstPerson.id);
			}

			callback(null, "Person not found");
		});
	});

	req.write("{}");
	req.end();
}

//SEARCH GENRE
function searchGenre(genreName, callback) {
	console.log("Calling search genre... ");
	var PATH_GET_GENRES = "/3/genre/movie/list?api_key=" + API_KEY
	
	var options = {
		host: BASE_URL,
		path: PATH_GET_GENRES,
		method: 'GET',
		port: null,
		headers: {}
	};

	var req = http.request(options, function(res) {
		var chunks = [];

		res.on('data', function(chunk) {
			chunks.push(chunk);
		});

		res.on('end', function() {
			var body = Buffer.concat(chunks);
			console.log("Response search genre: " + body.toString());
			var json = JSON.parse(body.toString());

			var results = json.genres
			if (results.length > 0) {
				var genre = results.filter(function(gen) {
					return gen.name == genreName;
				});

				if(genre.length > 0) {
					return callback(genre[0].id);
				}
			}

			callback(null, "Genre not found");
		});
	});

	req.end();
}

module.exports = actions