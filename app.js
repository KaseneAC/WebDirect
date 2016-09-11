/* app.js - Kasene A. Clark */
/* WebDirect - Simple Content Management System */

//---------------------------------------------------------------------------------
var express = require("express");
var app = express();
app.set('view engine', 'pug');
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
//---------------------------------------------------------------------------------


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
		}
	};

	pageData['navData'] = navData;


	switch(req.params['pageName'])
	{
		case 'dashboard':
		{
			pageData['pageObject'] = navData['dashboard'];

			var dbPosts = 0;
			var dbPages = 0;
			var dbUsers = 0;

			connection.query("SELECT * FROM posts", function(err, results){
				if (err) throw err;
				dbPosts = Object.keys(results).length;

				connection.query("SELECT * FROM pages", function(err, results){
					if (err) throw err;
					dbPages = Object.keys(results).length;

					connection.query("SELECT * FROM users", function(err, results){
						if (err) throw err;
						dbUsers = Object.keys(results).length;

						pageData['dbObject'] = {
							posts:{
								num:dbPosts,
								display:"Posts:"
							},
							pages:{
								num:dbPages,
								display:"Pages:"
							},
							users:{
								num:dbUsers,
								display:"Users:"
							}
						};

					});

				});

			});

			console.log(pageData['dbObject']);

			break;
		}
		case 'pages':
		{
			pageData['pageObject'] = navData['pages'];
			break;
		}
	}

	res.render('admin/index', pageData);


});


// Listen For Incoming Connections
// -------------------------------------------------------------------
app.listen(3000, function(){
	console.log("WebDir:Listening On Port 3000");
});
