var fs = require('fs');
var crypto = require('crypto');
var express = require('express');
var tls = require('tls');
var cluster = require('cluster');
var bodyParser = require('body-parser');
var app = express();
var argv = require('yargs')
.usage('Usage: -f {path to custom db} -s {db secret}')
.default('f','/home/dash/Dropbox/Node/snapsecure/db.json')
//.demand(['s'])
.argv;

app.set('x-powered-by', false);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.all('*',function(req,res,next){
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
next();
});
app.use(function(req, res, next) {
console.log('Connection made from: ', req.ip, ' to ', req.path, ' with ', req.protocol);
next();
});

app.get('/',function(req, res){
res.send("hello");
});

var db;

/**{string}
 *@param {string} unsafe 
 */
function sanaitize(unsafe){
var safe;
if(typeof unsafe === "string"){
safe = unsafe.replace(/[^a-z0-9-_]/gim,"");
return safe;
}else{
console.log(unsafe + " is not a string");
return "undefined"
}};

/**
 * @param {string} path argv.f
 * @param {string} key argv.s
 */
function decrypt(){
db = fs.readFileSync(argv.f).toString();
var input = crypto.createDecipher('AES-256-CBC',argv.s);
input.update(db, 'utf8');
db = input.final('hex');
}

/*
 * @param {string} path argv.f
 * @param {string} key argv.s
 */
function encrypt(){
var output = crypto.createCipher('AES-256-CBC',argv.s);
output.update(db, 'utf8');
db = ouput.final('hex'); 
fs.writeFileSync(argv.f,db);
}

/** {JSON encoded Object}
 * @param {string} username
 * @param {(PEM encoded) string} public_key
 */
app.post('/newuser', function(req, res){
var user_data = req.body;
console.log(user_data);
res.sendStatus(200);
});

/** {JSON encoded Object}
 * @param {string} username
 */
app.post('/key_lookup', function(req, res){
//decrypt();
db = fs.readFileSync(argv.f).toString();
db = JSON.parse(db);
var user_request = sanaitize(req.body.user);
var user_key;
try{user_key = db[user_request].pub_key}
catch(err){
res.send("user not found")
}
res.send(user_key);
});

app.listen(8080);
