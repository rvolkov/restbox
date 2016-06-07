var express = require('express');
//var cors = require('cors');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var cfg = require('./config.js');
var fs = require('fs');
var app = express();
app.use('/',express.static(__dirname + '/../public/'));
app.use('/scripts',express.static(__dirname + '/../public/scripts'));
app.use('/images',express.static(__dirname + '/../public/images'));
app.use('/views',express.static(__dirname + '/../public/views'));
app.use('/bower_components',express.static(__dirname + '/../public/bower_components'));
//app.use(cors());
app.use(bodyParser.json());
app.use('/webapi', expressJwt({secret: cfg.jwtsecret}));
app.use('/v1', expressJwt({secret: cfg.jwtsecret}));
var calls = require('./calls.js');
var cisco = require('./cisco.js');
var box = require('./box.js');

// function to check rfuncs
function call_rfuncs() {
    console.log('call_rfuncs called');
    var c;
    for(var i=0; c=cfg.bcontrol[i]; i++) {
        var b;
        for(var j=0; b=c.boxes[j]; j++) {
            if(b.type == 'led') {
                if(b.rfunc != 'rnone') {
                    (function(name,t,id,rfunc) {
                        // read status of cisco rfunc and update box status
                        console.log('call1 rfunc='+rfunc+' for box='+name+' type='+t+' id='+id);
                        try {
                            cisco.call_rfunc(rfunc,function(res) {
                                console.log('call2 rfunc='+rfunc+' for box='+name+' type='+t+' id='+id+' res='+res);
                                try {
                                    box.putStatus(name,t,id,res,false);
                                } catch(ex) {
                                    console.log("internal exception");
                                }
                                //cfg.bcontrol[i].boxes[j].status = res;
                            });
                        } catch(ex) {
                            console.log("internal exception");
                        }
                        return;
                    })(c.name,b.type,b.id,b.rfunc);
                }
            }
        }
    }
    return;
}
setInterval(call_rfuncs, 20000); //call every 20 seconds.

calls.apicalls(app);
app.all('*',
  function(req, res, next) {
    // send the index.html to support HTML5Mode
    fs.readFile(__dirname + '/../public/index.html', 'utf8',
      function(err, content) {
        res.send(content);
      }
    );
  }
);
app.use(
  function(req, res, next) {
    // catch 404 and forwarding to error handler
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
);
/// error handlers
app.use(
    function(err, req, res, next) {
        res.status(200).json({message: err.message, error: err})
    }
);
app.use(
  function(err, req, res, next) {
    res.status(err.status || 500);
    console.log('Internal error('+res.statusCode+'): '+err.message);
    res.send({ error: err.message });
    return;
  }
);
app.get('/ErrorExample',
  function(req, res, next) {
    next(new Error('Random error!'));
  }
);
module.exports = app;
