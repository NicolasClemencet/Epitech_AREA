'use strict';
const bcrypt = require('bcryptjs');
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
module.exports = function () {

  var db = mongoose.connect('mongodb://localhost:27017/area',{
    useMongoClient: true,
    /* other options */
  });
  mongoose.Promise = global.Promise
  var UserSchema = new Schema({
    firstName: {type: String},
    lastName: {type: String},
    username: {type: String, required: true, unique: true},
    hash: { type: String, required: false },
    email: {
      type: String,
      trim: true,
      unique: false,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    facebookProvider: {
      type: {
        id: String,
        token: String
      },
      
      select: false
    },
    GoogleProvider: {
      type: {
        id: String,
        token: String
      },
      
      select: false
    },
    GithubProvider: {
      type: {
        id: String,
        token: String
      },
      
      select: false
    }
  });

  UserSchema.set('toJSON', {getters: true, virtuals: true});

  UserSchema.statics.upsertFbUser = function(accessToken, refreshToken, profile, cb) {
    var that = this;
    return this.findOne({
      'facebookProvider.id': profile.id
    }, function(err, user) {
      // no user was found, lets create a new one
      if (!user) {
        var newUser = new that({
          firstName: profile.name.familyName,
          lastName: profile.name.givenName,
          username: profile.name.familyName + " " + profile.name.givenName,
          email: profile.emails[0].value,
          facebookProvider: {
            id: profile.id,
            token: accessToken
          }
        });

        newUser.save(function(error, savedUser) {
          if (error) {
            console.log(error);
          }
          console.log("User successfully registered as Facebook Account !");
          return cb(error, savedUser);
        });
      } else {
        return cb(err, user);
      }
    });
  };

  UserSchema.statics.upsertGoogleUser = function(accessToken, refreshToken, profile, cb) {
    var that = this;
    return this.findOne({
      'GoogleProvider.id': profile.id
    }, function(err, user) {
      // no user was found, lets create a new one
      if (!user) {
        var userid = profile.name.familyName + " " + profile.name.givenName;
        var newUser = new that({
          firstName: profile.name.familyName,
          lastName: profile.name.givenName,
          username: userid,
          email: profile.emails[0].value,
          GoogleProvider: {
            id: profile.id,
            token: accessToken
          }
        });

        newUser.save(function(error, savedUser) {
          if (error) {
            console.log(error);
          }
          console.log("User successfully registered as Google Account !");
          return cb(error, savedUser);
        });
      } else {
        return cb(err, user);
      }
    });
  };

  UserSchema.statics.upsertGithubUser = function(accessToken, refreshToken, profile, cb) {
    var that = this;
    return this.findOne({
      'GithubProvider.id': profile.id
    }, function(err, user) {
      // no user was found, lets create a new one
      if (!user) {
        var newUser = new that({
          username: profile.username,
          email: profile.email,
          GithubProvider: {
            id: profile.id,
            token: accessToken
          }
        });

        newUser.save(function(error, savedUser) {
          if (error) {
            console.log(error);
          }
          console.log("User successfully registered as Github Account !");
          return cb(error, savedUser);
        });
      } else {
        return cb(err, user);
      }
    });
  };

  UserSchema.statics.upsertLocalUser = function(profile, cb) {
    var that = this;
    return this.findOne({
      'username': profile.username
    }, function(err, user) {
      // no user was found, lets create a new one
      console.log(user);
      if (!user) {
        var newUser = new that({
          username: profile.username,
          password: profile.password,
          email: profile.email
        });
        newUser.save(function(error, savedUser) {
          if (error) {
            console.log(error);
          }
          console.log("User successfully registered as Local Account !");
          return cb(error, savedUser);
        });
      } else {
        if (user.password == profile.password)
          console.log("Success");
        return cb(err, user);
      }
    });
  };
  mongoose.model('User', UserSchema);

  return db;
};