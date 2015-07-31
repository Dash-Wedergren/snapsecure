var fs = require('fs');
var crypto = require('crypto');
var express = require('express');
var tls = require('tls');
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
})
app.use(function(req, res, next) {
console.log('Connection made from: ', req.ip, ' to ', req.path, ' with ', req.protocol);
next();
});

app.get('/',function(req, res){
res.send("hello");
});

/**{string}
 *@param {string} unsafe 
 */
function sanaitize(unsafe){
var safe;
if(typeof unsafe === "string"){
safe = unsafe.replace(/[^a-z0-9]/gim,"");
return safe;
}else{
console.log("Not string");
return "undefined"
}
}

/** {Object}
 * @param {string} username
 * @param {(PEM encoded) string} public_key
 */
app.post('/newuser', function(req, res){
var db = fs.readFileSync(argv.f).toString();
var user_data = req.body;
console.log(user_data);
res.sendStatus(200);
});

/** {Object}
 * @param {string} username
 */
app.post('/key_lookup', function(req, res){
var db = fs.readFileSync(argv.f).toString();
db = JSON.parse(db);
console.log(typeof db);
var user_request = sanaitize(req.body.user);
console.log(user_request);
eval("var user_key = db." + user_request + ".pub_key");
if(!user_key){
res.send("user not found");
return;
}
res.send(user_key);
})

app.listen(8080);
