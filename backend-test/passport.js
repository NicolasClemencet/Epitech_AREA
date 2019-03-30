'use strict';
var DiscordStrategy = require('passport-discord').Strategy;
var GoogleTokenStrategy = require('passport-google-token').Strategy;
var GitHubTokenStrategy = require('passport-github-token');
const LocalStrategy = require('passport-local').Strategy;
var passport = require('passport'),
  FacebookTokenStrategy = require('passport-facebook-token'),
  User = require('mongoose').model('User');

  

module.exports = function () {

  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
    function(req, username, password, done) {
        var profile = {
          username : String,
          password : String,
          email: String
        };
        profile.username = username;
        profile.email = req.query.email;
        profile.password = password;
        User.upsertLocalUser(profile, function(err, user) {
          return done(err, user);
        });
    }
  ));

  passport.use(new FacebookTokenStrategy({
      clientID: '1888863094562536',
      clientSecret: '9714ea834e25cac043a2704340e8128f',
      callbackURL: "http://www.publicdomain.com/callback/",
      enableProof: false,
      profileFields: ['id', 'emails', 'name']
    },
    function (accessToken, refreshToken, profile, done) {
      User.upsertFbUser(accessToken, refreshToken, profile, function(err, user) {
        return done(err, user);
      });
    }));


passport.use(new GoogleTokenStrategy({
  clientID: "686219188705-tlcqkcqten2r0fte6ttud17v71h6raom.apps.googleusercontent.com",
  clientSecret: "T-xSH3scVFKp2vxSVHECffFv"
},
function(accessToken, refreshToken, profile, done) {
  User.upsertGoogleUser(accessToken, refreshToken, profile, function(err, user) {
    return done(err, user);
  });
}
));


passport.use(new GitHubTokenStrategy({
  clientID: "2ff0395ead9ef73fe85d",
  clientSecret: "d1e79e1f8bfa8bdd1a7f80de606740acff3b5570",
  passReqToCallback: true
}, function(req, accessToken, refreshToken, profile, done) {
    User.upsertGithubUser(accessToken, refreshToken, profile, function(err, user) {
      return done(err, user);
    });
}));
};