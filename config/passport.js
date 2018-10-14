var LocalStrategy = require('passport-local').Strategy;

var mysqlConnection = require("../server/mysql.js");

module.exports = function(passport){
	
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		//deserialize logic
	});

	passport.use('local-login', new LocalStrategy({
		usernameField : 'username',
		passwordField : 'password',
		passReqToCallback : true
	},
	function(req, username, password, done){
		mysqlConnection.mysqlValidateUser(username, password, function(result, hash){
			if(result){
				// User is validated
				var user = new Object();
				user.username = username;
				user.hash = hash;
				return done(null, user);
			} else {
				// User is not validated
				return done(null, false, req.flash('signupMessage', 'Invalid user'));
			}
		});
	}));
}
