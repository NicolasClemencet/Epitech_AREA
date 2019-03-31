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
app.use(passport.initialize());
app.use(passport.session());

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
  "/api/users/sign/facebook",
   (req, res) => {
        passport.authenticate('facebook-token',{ scope : ['email'] }, function (err, user, info) {
              if(err){
                  if(err.oauthError){
                      var oauthError = JSON.parse(err.oauthError.data);
                      res.send(oauthError.error.message);
                  } else {
                    console.log("User successfully registered as Facebook Account !");
                      res.send(err);
                  }
              } else {
                  res.send(user);
              }
        })(req, res);
      });

      app.post(
        "/api/users/sign/github",
         (req, res) => {
              passport.authenticate('github-token', function (err, user, info) {
                    if(err){
                        if(err.oauthError){
                            var oauthError = JSON.parse(err.oauthError.data);
                            res.send(oauthError.error.message);
                        } else {
                            res.send(err);
                        }
                    } else {
                        console.log("User successfully registered as Github Account !");
                        res.send(user);
                    }
              })(req, res);
            });
            app.post(
              "/api/users/sign/google",
               (req, res) => {
                    passport.authenticate('google-token', function (err, user, info) {
                          if(err){
                              if(err.oauthError){
                                  var oauthError = JSON.parse(err.oauthError.data);
                                  res.send(oauthError.error.message);
                              } else {
                                  res.send(err);
                              }
                          } else {
                            if (user == false) {
                              console.log("Bad token");
                              var infos = "Bad Token";
                              res.send(infos);
                            } else {
                              console.log("User successfully registered as Google Account !");
                              const token = jwt.sign(user, 'area');
                              res.send({user, token});
                            }
                          }
                    })(req, res);
                  });
                  app.post('/api/users/sign/local', (req, res) => {
                    passport.authenticate('local', function (err, user, info) {
                          if(err){
                              if(err.oauthError){
                                  var oauthError = JSON.parse(err.oauthError.data);
                                  res.send(oauthError.error.message);
                              } else {
                                  res.send(err);
                              }
                          } else {
                            console.log(user.username +" successfully registered as Local Account !");
                            const token = jwt.sign(user, 'area');
                            const infos = "Logged in";
                            res.send({infos, token});
                          }
                    })(req, res);
                  });
                  app.post('/api/users/login/token', (req, res) => {
                    passport.authenticate('jwt', function (err, user, info) {
                          if(err){
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