const express = require('express')
const app = express()
const api = require('./api/api');
const r = require("./r")




app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:1234");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// app.use(function(req, res, next) {
//   // check header or url parameters or post parameters for token
//   var token = req.headers['authorization'];
//   if (!token) return next(); //if no token, continue

//   token = token.replace('Bearer ', '');

//   jwt.verify(token, process.env.JWT_SECRET, function(err, user) {
//     if (err) {
//       return res.status(401).json({
//         success: false,
//         message: 'Please register Log in using a valid email to submit posts'
//       });
//     } else {
//       req.user = user; //set the user to req so other routes can use it
//       next();
//     }
//   });
// });

app.use('/auth', api)

app.use(express.json());

app.get('/num', function (req, res) {
  r.table("auth").then(data=>{
    res.json({
      "num": data[0].num
    })
  })
})

app.post('/num', function (req, res) {
  r.table("auth").update({"num": r.row("num").add(req.body.mod)}, {"returnChanges": true}).then(data=>{
    res.json({
      "num": data.changes[0].new_val.num
    })
  })
})



app.listen(3000)