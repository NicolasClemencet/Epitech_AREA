'use strict';
var DiscordStrategy = require('passport-discord').Strategy;
var GoogleTokenStrategy = require('passport-google-token').Strategy;
var GitHubTokenStrategy = require('passport-github-token');
var passport = require('passport'),
  FacebookTokenStrategy = require('passport-facebook-token'),
  User = require('mongoose').model('User');

  

module.exports = function () {

  console.log("HAHA\n");
  passport.use(new FacebookTokenStrategy({
      clientID: '1888863094562536',
      clientSecret: '9714ea834e25cac043a2704340e8128f',
      callbackURL: "http://www.publicdomain.com/callback/",
      enableProof: false,
      profileFields: ['id', 'emails', 'name']
    },
    function (accessToken, refreshToken, profile, done) {
      console.log("HELLO " + refreshToken + " HELLO" + accessToken);
      console.log("HAHA\n");
      console.log(profile);
      User.upsertFbUser(accessToken, refreshToken, profile, function(err, user) {
        return done(err, user);
      });
    }));


passport.use(new GoogleTokenStrategy({
  clientID: "686219188705-tlcqkcqten2r0fte6ttud17v71h6raom.apps.googleusercontent.com",
  clientSecret: "T-xSH3scVFKp2vxSVHECffFv"
},
function(accessToken, refreshToken, profile, done) {
  console.log(profile);
  User.upsertGoogleUser(accessToken, refreshToken, profile, function(err, user) {
    return done(err, user);
  });
}
));


passport.use(new GitHubTokenStrategy({
  clientID: "2ff0395ead9ef73fe85d",
  clientSecret: "d1e79e1f8bfa8bdd1a7f80de606740acff3b5570",
  passReqToCallback: true
}, function(req, accessToken, refreshToken, profile, next) {
    console.log(profile);
  /*User.findOrCreate({'github.id': profile.id}, function(error, user) {
      return next(error, user);
  });*/
}));

    passport.use(new DiscordStrategy(
      {
          clientID: '559321347331719169',
          clientSecret: 'bhs98r4ke2PvlrV5R9-vZQaaYtZ2rX5X',
          callbackURL: 'http://www.publicdomain.com/callback/'
      },
      function(accessToken, refreshToken, profile, cb) {
        console.log(profile);
          /*User.findOrCreate({ discordId: profile.id }, function(err, user) {
              return cb(err, user);
          });*/
      }
  ));
};