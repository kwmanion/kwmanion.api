require('dotenv').config();

var express = require("express");
var auth = require("./authentication");
var bodyParser = require("body-parser");
var bcrypt = require("bcrypt");
var UserModel = require("./user");

require("./database");

var app = express();
var port = process.env.API_SERVER_PORT;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.post("/login", function(req, res) {
    var userObj = req.body;

    UserModel.find({ email: userObj.email }).then(function(doc) {
        bcrypt.compare(userObj.password, doc[0].password).then(function(match) {
            if (match) {
                var token = auth.createJwt(userObj.email);
                res.status(200).send(token);
            } else {
                res.status(401).send("Password doesn't match");
            }
        });
    }).catch(function(err) {
        res.status(401).send("Email Not Found");
    });
});

app.post("/register", function(req, res) {
    var userObj = req.body;

    bcrypt.hash(userObj.password, 10).then(function(hash) {
        var user = new UserModel({
            email: userObj.email,
            password: hash
        });

        user.save().then(function(doc) {
            var token = auth.createJwt(userObj.email);
            res.status(200).send(token);
        }).catch(function(err) {
            res.status(500).send("User Not Saved!");
        });
    });
});

app.post("/getUsers", auth.verifyToken, function(req, res, next) {
    var requestObj = req.body;

    UserModel.find({ }).then(function(doc) {
        var userArray = doc.map(function(x) {
            return { _id: x._id, email: x.email }
        });
        res.status(200).send(userArray);
    }).catch(function(err) {
        res.status(401).send("Email Not Found");
    });
});

app.post("/deleteUser", auth.verifyToken, function(req, res, next) {
    var requestObj = req.body;

    UserModel.findOneAndDelete({ _id: requestObj._id }).then(function(response) {
        console.log(response);
        res.status(200).send("User Deleted");
    }).catch(function(err) {
        res.status(401).send("User Not Deleted");
    });
}); 

app.post("/updateUser", auth.verifyToken, function(req, res, next) {
    var requestObj = req.body;

    UserModel.findOneAndUpdate({ _id: requestObj._id }, { email: requestObj.email }, { useFindAndModify: false }).then(function(doc) {
        res.status(200).send("User Updated");
    }).catch(function(err) {
        res.status(401).send("User Not Updated");
    });
});


app.listen(port, function(){
    console.log(`Server listening on port ${port}...`);
});