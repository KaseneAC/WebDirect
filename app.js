/* app.js - Kasene A. Clark */
/* WebDirect - Simple Content Management System */

//---------------------------------------------------------------------------------
var express = require("express");
var async = require("async");
var app = express();
app.set('view engine', 'pug');
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
//---------------------------------------------------------------------------------

// Global Data
// --------------------------------------------------------------------------------
var configData = {};

// Database Functions
// --------------------------------------------------------------------------------
var mysql = require('mysql');
var connection = mysql.createConnection({
	host:"kaseneclark.com",
	user:"root",
	password:"Delete321",
	database:"webdirectdev"
});

connection.connect(function(err){
	if (err) throw err;
	console.log("Successfully Connected To DB");
});

// Configuration
// --------------------------------------------------------------------------------
// Theme Config
connection.query("SELECT configval FROM config WHERE configname='themepath'", function(err, result){

	// If the theme setting doesnt exist then create it
	if (err && err.code == "ER_BAD_FIELD_ERROR")
	{
		// MySQL told us that themepath doesn't actually exist.
		// So in this case im handling the error by creating the
		// config entry and setting it to the default basic theme.
		console.log("No Theme Config Found, Creating New Entry...");

		connection.query("INSERT INTO config (configname, configval) VALUES ('themepath', 'themes/basic/')",
		 function(err, result){
		 	if (err) throw err;

		 	if (result.affectedRows)
		 	{
		 		console.log("Done.");
		 	} else
		 	{
		 		console.log("Error creating new theme setting, check this out!");
		 	}

		 });

		result.themepath = "themes/basic/";

	}

	// Load the theme
	var themeData = {};
	themeData['themepath'] = result[0].configval;
	themeData['index'] = themeData['themepath']+"views/index.pug";
	// Add to config data object
	configData['themeData'] = themeData;
	console.log(configData);

	// Make the themepath serve static files
	app.use('/theme', express.static(__dirname + themeData['themepath']+"assets/"));

});



// Routing For The Administrative Dashboard
// --------------------------------------------------------------------------------
app.get('/admin', function(req, res) {res.redirect('/admin/dashboard');});
app.get('/admin/:pageName', function(req, res){


	var pageData = {
		pageTitle: "WebDirect Admin Dashboard",
		bootstrapStyle: "/bootstrap/css/bootstrap.min.css",
		bootstrapJS: "/bootstrap/js/bootstrap.min.js",
	};

	var navData = {
		dashboard:{
			name: 'dashboard',
			display: 'Dashboard',
			link: '/admin/dashboard'
		},
		pages:{
			name:'pages',
			display:"Pages",
			link: '/admin/pages'
		},
		posts:{
			name:'posts',
			display:"Posts",
			link:'/admin/posts'
		}
	};

	pageData['navData'] = navData;





	switch(req.params['pageName'])
	{
		case 'dashboard':
		{
			pageData['pageObject'] = navData['dashboard'];
			
			var dbPosts = 0;
			var dbUsers = 0;
			var dbPages = 0;


			async.parallel([

				function(callback)
				{	
					connection.query("SELECT * FROM posts", function(err, result){
						dbPosts = result.length;
						callback(err);
					});
				},
				function(callback)
				{
					connection.query("SELECT * FROM users", function(err, result){
						dbUsers = result.length;
						callback(err);
					});
				},
				function(callback)
				{
					connection.query("SELECT * FROM pages", function(err, result){
						dbPages = result.length;
						callback(err);
					});
				}


			], function(err){
				if (err) throw err;

				// Arrange Data
				pageData['dbObject'] = {
					pages:{
						num:dbPages,
						display:"Pages:"
					},
					posts:{
						num:dbPosts,
						display:"Posts:"
					},
					users:{
						num:dbUsers,
						display:"Users:"
					}
				};

				renderPage(res, 'admin/index', pageData);
			});


			break;
		}
		case 'pages':
		{
			pageData['pageObject'] = navData['pages'];

			var dbPages = [];

			async.parallel([

				function (callback)
				{
					connection.query("SELECT * FROM pages", function(err, result){
						if (err) throw err;

						result.forEach(function(item){
							var page = {id:item['id'], name:item['page-name']};
							dbPages.push(page);
						});

						callback(err);
					})
				}


			]
			, function(err){
				if (err) throw err;
				pageData['dbPages'] = dbPages;
				renderPage(res, 'admin/index', pageData);
			});
			
			break;
		}
		case 'posts':
		{
			pageData['pageObject'] = navData['posts'];
			renderPage(res, 'admin/index', pageData);
			break;
		}
	}

	


});

// Routing For Site
// --------------------------------------------------------------------------------
app.get('/:pageName', function(req, res){


	// So we load all the pages from the db,
	// try to match our get request param with
	// all the valid pages. If there is a match,
	// we load that page, if there is no match, we
	// spring a 404 page. Simple enough right?


	var pageData = {
		pageTitle: "",
	};

	var themeData = configData.themeData;

	renderPage(res, themeData.index);

});


// Render Page Function
function renderPage(res, path, pageData)
{
	res.render(path, pageData);
}

// Listen For Incoming Connections
// -------------------------------------------------------------------
app.listen(3000, function(){
	console.log("WebDir:Listening On Port 3000");
});
