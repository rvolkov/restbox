'use strict';
var box = require('./box.js');
var jwt = require('jsonwebtoken');
var cisco = require('./cisco.js');
var cfg = require('./config.js');

//var jwt = require('jwt-simple');
var cfg = require('./config.js');
function urlBase64Decode(str) {
  var output = str.replace('-', '+').replace('_', '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw 'Illegal base64url string!';
  }
  return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
}
exports.apicalls = function(app) {
    // ==== IoT API calls ====
    // GET
    // - client asks about lights status -
    app.get('/api/get/:boxname/:secret/:type/:id', function (req, res) {
        var boxname = req.params.boxname;
        var secret = req.params.secret;
        var type = req.params.type;
        var id = req.params.id;
        if(box.checkAccess(boxname,secret)) {
            var stat = box.getStatus(boxname, type, id, true);
            res.status(200).json({message: stat});
        } else {
            res.status(401).json({message: 'auth_error'});
        }
    });
    // PUT
    // - client sets current switch positions
    // - client reports of object distance on ultrasound sensor
    app.put('/api/put/:boxname/:secret/:type/:id/:value', function (req, res) {
        var boxname = req.params.boxname;
        var secret = req.params.secret;
        var type = req.params.type;
        var id = req.params.id;
        var value = req.params.value;
        if(box.checkAccess(boxname,secret)) {
            var valint = parseInt(value);
            if(valint == 0 || valint == 1 || (valint > 5 && valint < 100 )) {
                box.putStatus(boxname,type,id,value,true);
            }
            if(type != 'usonic') {
                if(valint == 1) {
                    cisco.call_afunc(cfg.get_onfunc(boxname,type,id));
                }
                if(valint == 0) {
                    cisco.call_afunc(cfg.get_offfunc(boxname,type,id));
                }
            } else {
                if(valint > 50 && valint < 100) {
                    console.log('*** usonic > 50 and < 100 ***');
                    cisco.call_afunc(cfg.get_offfunc(boxname,type,id));
                }
                if(valint < 50 && valint > 5) {
                    console.log('*** usonic < 50 and > 5 ***');
                    cisco.call_afunc(cfg.get_onfunc(boxname,type,id));
                }
            }
            res.status(200).json({message: 'ok'});
        } else {
            res.status(401).json({message: 'auth_error'});
        }
    });
    // ======== external authenticated calls ==========
    // - authentication
    app.post('/login', function(req, res) {
        //console.log('* call for /auth');
        var login = req.body.username;
        var password = req.body.password;
        //console.log('* login='+login+' password='+password);
        if(cfg.checkuser(login,password)) {
            var profile = {
                login: login
            };
            var token = jwt.sign(profile, cfg.jwtsecret, { expiresIn: 60*5*60 });
            res.status(200).json({ message: "OK", token: token });
        } else {
            res.status(401).json({message: "AUTH_ERROR"});
            return;
        }
    });
    // ==== Web portal calls ====
    // - list labusers and their information
    app.get('/webapi/list/labusers', function(req, res) {
        console.log('* call for /webapi/list/labusers');
        var items = JSON.stringify(cfg.labusers);
        res.status(200).json({message: items});
    });
    // - list configured/active boxcontrollers, their modules and statuses
    app.get('/webapi/list/boxcontrollers', function(req, res) {
        console.log('* call for /webapi/list/boxcontrollers');
        var items = JSON.stringify(box.getConf());
        res.status(200).json({message: items});
    });
    // - client asks about lights status -
    app.get('/webapi/get/:boxname/:type/:id', function (req, res) {
        //console.log('* call for /webapi/get/');
        var boxname = req.params.boxname;
        //console.log('boxname=',boxname);
        var type = req.params.type;
        //console.log('type=',type);
        var id = req.params.id;
        //console.log('id=',id);
        var stat = box.getStatus(boxname,type,id,false);
        console.log('* call for /webapi/get/'+boxname+'/'+type+'/'+id+' returns='+stat);
        res.status(200).json({message:stat});
    });
    // - change status for box on boxcontroller
    app.put('/webapi/change/:boxname/:type/:id/:value', function(req, res) {
        console.log('* call for /webapi/change');
        var boxname = req.params.boxname;
        var type = req.params.type;
        var id = req.params.id;
        var value = req.params.value;
        console.log('* change '+boxname+'/'+type+'/'+id+'/'+value);
        box.putStatus(boxname,type,id,value,false);
        res.status(200).json({message: 'ok'});
    });
    // - list available action functions
    app.get('/webapi/list/afunctions', function(req, res) {
        console.log('* call for /webapi/list/afunctions');
        var it = cisco.get_afunctions();
        //console.log('afunc='+it);
        var items = JSON.stringify(it);
        //console.log('items='+items);
        res.status(200).json({message: items});
    });
    // - change onfunc for box on boxcontroller
    app.put('/webapi/onfunc/:boxname/:type/:id/:value', function(req, res) {
        console.log('* call for /webapi/onfunc');
        var boxname = req.params.boxname;
        var type = req.params.type;
        var id = req.params.id;
        var value = req.params.value;
        console.log('* change onfunc '+boxname+'/'+type+'/'+id+'/'+value);
        box.putOnFunc(boxname,type,id,value);
        res.status(200).json({message: 'ok'});
    });
    // - change offfunc for box on boxcontroller
    app.put('/webapi/offfunc/:boxname/:type/:id/:value', function(req, res) {
        console.log('* call for /webapi/offfunc');
        var boxname = req.params.boxname;
        var type = req.params.type;
        var id = req.params.id;
        var value = req.params.value;
        console.log('* change offfunc '+boxname+'/'+type+'/'+id+'/'+value);
        box.putOffFunc(boxname,type,id,value);
        res.status(200).json({message: 'ok'});
    });
    // call to afunc (for test)
    app.put('/webapi/call/afunc/:name', function(req, res) {
        console.log('* call for /webapi/call/afunc');
        var name = req.params.name;
        cisco.call_afunc(name);
        res.status(200).json({message: 'ok'});
    });
    // - list available read functions
    app.get('/webapi/list/rfunctions', function(req, res) {
        console.log('* call for /webapi/list/rfunctions');
        var it = cisco.get_rfunctions();
        console.log('afunc='+it);
        var items = JSON.stringify(it);
        console.log('items='+items);
        res.status(200).json({message: items});
    });
    // - change rfunc for box on boxcontroller
    app.put('/webapi/rfunc/:boxname/:type/:id/:value', function(req, res) {
        console.log('* call for /webapi/rfunc');
        var boxname = req.params.boxname;
        var type = req.params.type;
        var id = req.params.id;
        var value = req.params.value;
        console.log('* change rfunc '+boxname+'/'+type+'/'+id+'/'+value);
        box.putRFunc(boxname,type,id,value);
        res.status(200).json({message: 'ok'});
    });
    // call to rfunc (for test)
    app.put('/webapi/call/rfunc/:name', function(req, res) {
        console.log('* call for /webapi/call/rfunc');
        var name = req.params.name;
        cisco.call_rfunc(name,function(data){
            res.status(200).json({message: 'ok'});
        });
    });
    // - list configured/active routers
    app.get('/webapi/list/routers', function(req, res) {
        console.log('* call for /webapi/list/routers');
        var items = JSON.stringify(cfg.routers);
        res.status(200).json({message: items});
    });
    // - force csr re-auth
    app.put('/webapi/csr/reauth', function(req, res) {
        console.log('* call for /webapi/csr/reauth');
        cisco.reauth(function(data){
            res.status(200).json({message: 'ok'});
        });
    });
};
