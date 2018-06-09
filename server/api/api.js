const express = require('express')
const api = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const r = require("../r")
const secret = "ProForge"

api.use(express.json());

class User {
  constructor(json) {
    this.username = json.username
    this.password = json.password
  }
  save() {
    return new Promise((resolve, reject) => {
      r.table("auth").insert({...this}).then(res=>{
        resolve({...this, id: res.generated_keys[0]})
      })
    })
  }

  static findOne(json) {
    return new Promise((resolve, reject) => {
      r.table("auth").filter({"username": json.username}).then(res=>{
        if (res.length > 0) {
          resolve(res[0])
        } else {
          reject()
        }
      })
    })
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      r.table("auth").get(id).then(res=>{
        resolve(res)
      })
    })
  }

  static checkExists(json) {
    return new Promise((resolve, reject) => {
      r.table("auth").filter({"username": json.username}).then(res=>{
        if (res.length > 0) {
          reject()
        } else {
          resolve()
        }
      })
    })
  }

}

const generateToken = (user) => {
  var u = {
   username: user.username,
   id: user.id
  };
  return token = jwt.sign(u, secret, {
     expiresIn: 60 * 60 * 24 // expires in 24 hours
  });
}

const getCleanUser = (user) => {
  let {username} = user;
  return({username})
}


api.post('/users/signup', function (req, res) {
  var body = req.body;
  User.checkExists({
    username: body.username.trim()
  }).then(()=>{
    var hash = bcrypt.hashSync(body.password.trim(), 10);
    var user = new User({
      username: body.username.trim(),
      password: hash,
    });
    user.save().then(user=>{
      var token = generateToken(user);
      console.log("new user")
      res.json({
        user: getCleanUser(user),
        token: token
      });
    })
  }).catch(err=>{
    res.status(404).json({
      error: true,
      message: 'Username is Taken'
    });
  })
});


api.post('/users/signin', function (req, res) {
  User
    .findOne({
      username: req.body.username
    }).then(user=> {
      bcrypt.compare(req.body.password, user.password,
        function (err, valid) {
          if (!valid) {
            return res.status(404).json({
              error: true,
              message: 'Username or Password is Wrong'
            });
          }
          var token = generateToken(user);
          res.json({
            user: getCleanUser(user),
            token: token
          });
        });
    }).catch(err=>{
        res.status(404).json({
          error: true,
          message: 'Username or Password is Wrong'
        });
    })
});

api.post('/me/from/token', function(req, res, next) {
  var token = req.body.token
  if (!token) {
   return res.status(401).json({message: 'Must pass token'});
  }
 jwt.verify(token, secret, function(err, user) {
    if (err) throw err;
    console.log(user)
    User.findById(user.id).then(user=>{
      user = getCleanUser(user);
        var token = generateToken(user);
        res.json({
            user: user,
            token: token
        });
    }).catch(err=>{
      console.log(err)
    })
  });
});

module.exports = api;