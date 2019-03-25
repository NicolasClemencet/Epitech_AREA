'use strict';

//mongoose file must be loaded before all other files in order to provide
// models to other modules
var mongoose = require('./mongoose'),
  passport = require('passport'),
  express = require('express'),
  jwt = require('jsonwebtoken'),
  expressJwt = require('express-jwt'),
  router = express.Router(),
  cors = require('cors'),
  bodyParser = require('body-parser');

mongoose();

var User = require('mongoose').model('User');
var passportConfig = require('./passport');

//setup configuration for facebook login
passportConfig();

var app = express();

// enable cors
var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

//rest API requirements
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

router.route('/health-check').get(function(req, res) {
  res.status(200);
  res.send('Hello World');
});

var createToken = function(auth) {
  return jwt.sign({
    id: auth.id
  }, 'my-secret',
  {
    expiresIn: 60 * 120
  });
};

var generateToken = function (req, res, next) {
  req.token = createToken(req.auth);
  next();
};

var sendToken = function (req, res) {
  res.setHeader('x-auth-token', req.token);
  res.status(200).send(req.auth);
};

app.post(
  "/login",
   (req, res) => {
        passport.authenticate('facebook-token',{ scope : ['email'] }, function (err, user, info) {
          console.log('I\'m in\n');
              if(err){
                console.log("HAHA\n");
                  if(err.oauthError){
                      var oauthError = JSON.parse(err.oauthError.data);
                      res.send(oauthError.error.message);
                  } else {
                      res.send(err);
                  }
              } else {
                  res.send(user);
              }
        })(req, res);
      });

      app.post(
        "/login/github",
         (req, res) => {
              passport.authenticate('github-token', function (err, user, info) {
                console.log('I\'m in\n REALLY ???');
                console.log(info);
                    if(err){
                      console.log("HAHA\n");
                        if(err.oauthError){
                            var oauthError = JSON.parse(err.oauthError.data);
                            res.send(oauthError.error.message);
                        } else {
                            res.send(err);
                        }
                    } else {
                        res.send(user);
                    }
              })(req, res);
            });
            app.get('/auth/google/token', passport.authenticate('google-token'),
 function(req, res) {
  console.log("GOOGLE AUTH");
  res.send(req.user);
});
            app.get('/auth/discord', passport.authenticate('discord'));

router.route('/auth/facebook/')
  .post(passport.authenticate('facebook-token', {session: false}), function(req, res, next) {
    console.log(req);
    if (!req.user) {
      return res.send(401, 'User Not Authenticated');
    }

    // prepare token for API
    req.auth = {
      id: req.user.id
    };

    next();
  }, generateToken, sendToken);

//token handling middleware
var authenticate = expressJwt({
  secret: 'my-secret',
  requestProperty: 'auth',
  getToken: function(req) {
    if (req.headers['x-auth-token']) {
      return req.headers['x-auth-token'];
    }
    return null;
  }
});

router.route('/auth/google/')
  .post(passport.authenticate('google-token', {session: false}), function(req, res, next) {
    console.log(req);
    if (!req.user) {
      return res.send(401, 'User Not Authenticated');
    }

    // prepare token for API
    req.auth = {
      id: req.user.id
    };

    next();
  }, generateToken, sendToken);

//token handling middleware
var authenticate = expressJwt({
  secret: 'my-secret',
  requestProperty: 'auth',
  getToken: function(req) {
    if (req.headers['x-auth-token']) {
      return req.headers['x-auth-token'];
    }
    return null;
  }
});

var getCurrentUser = function(req, res, next) {
  User.findById(req.auth.id, function(err, user) {
    if (err) {
      next(err);
    } else {
      req.user = user;
      next();
    }
  });
};

var getOne = function (req, res) {
  var user = req.user.toObject();

  delete user['facebookProvider'];
  delete user['__v'];

  res.json(user);
};

router.route('/auth/me')
  .get(authenticate, getCurrentUser, getOne);

app.use('/api/v1', router);

app.listen(3000);
module.exports = app;

console.log('Server running at http://localhost:3000/');