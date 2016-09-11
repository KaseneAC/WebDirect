/* app.js - Kasene A. Clark */
/* WebDirect - Simple Content Management System */


var express = require("express");
var app = express();
app.set('view engine', 'pug');
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
//---------------------------------------------------------------------------------


// Routing For The Administrative Dashboard
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


app.listen(3000, function(){
	console.log("WebDir:Listening On Port 3000");
});
