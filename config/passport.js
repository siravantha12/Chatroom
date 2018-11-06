var LocalStrategy = require('passport-local').Strategy;

var mysqlConnection = require("../server/mysql.js");

module.exports = function(passport){
	
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		mysqlConnection.getRowById(id, function(err, result){
			done(err, result[0]);
		});
	});

	passport.use('local-login', new LocalStrategy({
		usernameField : 'username',
		passwordField : 'password',
		passReqToCallback : true
	},
	function(req, username, password, done){
		mysqlConnection.mysqlValidateUser(username, password, function(result, id){
			if(result){
				// User is validated
				var user = new Object();
				user.id = id;
				return done(null, user);
			} else {
				// User is not validated
				return done(null, false, req.flash('signupMessage', 'Invalid user'));
			}
		});
	}));
}
