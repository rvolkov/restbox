'use strict';
var cfg = require('./config.js');
var Client = require('node-rest-client').Client;
var btoa = require('btoa');

var cisco = module.exports = {};

/*
    ///// GET ///////
    client.get("http://remote.site/rest/xml/method", function (data, response) {
        // parsed response body as js object
        console.log(data);
        // raw response
        console.log(response);
    });
    
    /////// POST //////
    var args = {
        data: { test: "hello" },
        headers: { "Content-Type": "application/json" }
    };

    client.post("http://remote.site/rest/xml/method", args, function (data, response) {
        // parsed response body as js object
        console.log(data);
        // raw response
        console.log(response);
    });    
*/

var options = {
        connection: {
            rejectUnauthorized: false,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        },
        requestConfig: {
            timeout: 60000,
            noDelay: true,
            keepAlive: true,
            keepAliveDelay: 1000
        },
        responseConfig: {
            timeout: 300000
        }
};

cisco.replicate = function(box,type,valu) {
    var client = new Client(options);
    var s;
    var args = {
                    headers: { "Content-Type": "application/json",
                                "Accept": "application/json"
                    }
    };
    /*
    for(var i=0; s=cfg.restclients[i]; i++) {
        client.put("http://"+s.host+"/api/"+s.secret+"/"+type+"/"+valu, args, function (d, r) {
            console.log(d);
        }).on('error', function (err) {
            console.log('something went wrong on the put replicate request', err.request.options);
        });
    }
    */
    for(var i=0; s=cfg.labusers[i]; i++) {
        try {
            client.put("http://"+s.csship+":"+s.cport+"/api/"+box+"/"+type+"/"+valu, args, function (d, r) {
                console.log(d);
            }).on('error', function (err) {
                console.log('something went wrong on the put replicate request', err.request.options);
            });
        } catch(ex) {
            console.log("internal exception in replicate call");
        }
    }
};

cisco.csrauth = function(devname) {
    var client = new Client(options);
    var username;
    var password;
    var device;
    var r;
    var numb;
    for(var i=0; r=cfg.routers[i]; i++) {
        if(r.name === devname) {
            username = r.username;
            password = r.password;
            device = r.host;
            numb = i;
            break;
        }
    }
    var args = {
        headers: {'Authorization': 'Basic ' + btoa(username+':'+password),
                  'Accept': 'application/json' }
    };
    (function(dev,cl,n) {
        try {
            cl.post("https://"+dev+":55443/api/v1/auth/token-services", args, function (data, response) {
                var tk = data['token-id'];
                cfg.routers[n].token = tk;
                console.log('************** !!!!!! dev='+dev+' token='+data['token-id']);
                return;
            }).on('error', function(err) {
                console.log("cl.on error - can't authenticate "+dev);
            });
        } catch(ex) {
            console.log("external exception");
        }
        return;
    })(device,client,numb);
    return;
}

function csrreauth() {
    var r;
    for(var i=0; r=cfg.routers[i]; i++) {
        cisco.csrauth(r.name);
    }
}
csrreauth();
setInterval(csrreauth, 600000); //call every 600 seconds.


cisco.csrcall2 = function(devname, url, hdata, action, callback) {
    var client = new Client(options);
    var r;
    var token;
    var device;
    for(var i=0; r=cfg.routers[i]; i++) {
        if(r.name === devname) {
            token = r.token;
            device = r.host;
            break;
        }
    }
    var hd = hdata;
    var u = url;
    var dev = device;
    var act = action;
    var args2 = {
                    headers: {'X-Auth-Token': token,
                              "Content-Type": "application/json",
                                "Accept": "application/json"
                    },
                    data: hd
    };
            
    try {
            if(act == 'put') {
                client.put("https://"+dev+":55443/api/v1/"+u, args2, function (d, r) {
                    console.log(d);
                }).on('error', function (err) {
	               console.log('something went wrong on the put request', err.request.options);
                });
            }
            if(act == 'post') {
                client.post("https://"+dev+":55443/api/v1/"+u, args2, function (d, r) {
                    console.log(d);
                }).on('error', function (err) {
	               console.log('something went wrong on the post request', err.request.options);
                });
            }
            if(act == 'delete') {
                client.delete("https://"+dev+":55443/api/v1/"+u, args2, function (d, r) {
                    console.log(d);
                }).on('error', function (err) {
	               console.log('something went wrong on the delete request', err.request.options);
                });
            }
            if(act == 'get') {
                client.get("https://"+dev+":55443/api/v1/"+u, args2, function (d, r) {
                    if(Buffer.isBuffer(d)){
                        d = d.toString('utf8');
                    }
                    console.log(d);
                    callback(d); //call get result processor
                }).on('error', function (err) {
	               console.log('something went wrong on the get request', err.request.options);
                });
            }
        return; 
    } catch(ex) {
         console.log("internal exception");
    }
};

// action functions description
cisco.action_functions = [ 
  { 
    name: 'anone',
    descr: 'No Action',
    call: function() {
        // no action
    }
  },
  { 
    name: 'afunc1',
    descr: 'CSR-WAN Gi3 down',
    call: function() {
        var device = 'CSR-WAN';
        var hdata = { "if-name": "gigabitEthernet3",
                        "enabled": false};
        cisco.csrcall2(device,'interfaces/gigabitEthernet3/state',hdata,'put');
    }
  },
  { 
    name: 'afunc2',
    descr: 'CSR-WAN Gi3 up',
    call: function() {
        var device = 'CSR-WAN';
        var hdata = { "if-name": "gigabitEthernet3",
                    "enabled": true};
        cisco.csrcall2(device,'interfaces/gigabitEthernet3/state',hdata,'put');
    }
  },
  { 
    name: 'afunc3',
    descr: 'CSR-WAN Gi3 enable ACL STOP80',
    call: function() {
        var device = 'CSR-WAN';
        var hdata = { "if-id": "gigabitEthernet3",
                    "direction": "inside"};
        cisco.csrcall2(device,'acl/STOP80/interfaces',hdata,'post');
    }
  },
  { 
    name: 'afunc4',
    descr: 'CSR-WAN Gi3 disable ACL STOP80',
    call: function() {
        var device = 'CSR-WAN';
        var hdata = {};
        cisco.csrcall2(device,'acl/STOP80/interfaces/gigabitEthernet3_inside',hdata,'delete');
    }
  },
  { 
    name: 'afunc5',
    descr: 'CSR-WAN Gi3 enable ACL STOP22',
    call: function() {
        var device = 'CSR-WAN';
        var hdata = { "if-id": "gigabitEthernet3",
                    "direction": "inside"};
        cisco.csrcall2(device,'acl/STOP22/interfaces',hdata,'post');
    }
  },
  { 
    name: 'afunc6',
    descr: 'CSR-WAN Gi3 disable ACL STOP22',
    call: function() {
        var device = 'CSR-WAN';
        var hdata = {};
        cisco.csrcall2(device,'acl/STOP22/interfaces/gigabitEthernet3_inside',hdata,'delete');
    }
  },
  { 
    name: 'afunc7',
    descr: 'CSR-AWS Gi1 enable ACL STOP80',
    call: function() {
        var device = 'CSR-AWS';
        var hdata = { "if-id": "gigabitEthernet1",
                    "direction": "inside"};
        cisco.csrcall2(device,'acl/STOP80/interfaces',hdata,'post');
    }
  },
  { 
    name: 'afunc8',
    descr: 'CSR-AWS Gi1 disable ACL STOP80',
    call: function() {
        var device = 'CSR-AWS';
        var hdata = {};
        cisco.csrcall2(device,'acl/STOP80/interfaces/gigabitEthernet1_inside',hdata,'delete');
    }
  },
  { 
    name: 'afunc9',
    descr: 'CSR-AWS Gi1 enable ACL STOPPING',
    call: function() {
        var device = 'CSR-AWS';
        var hdata = { "if-id": "gigabitEthernet1",
                    "direction": "inside"};
        cisco.csrcall2(device,'acl/STOPPING/interfaces',hdata,'post');
    }
  },
  { 
    name: 'afunc10',
    descr: 'CSR-AWS Gi1 disable ACL STOPPING',
    call: function() {
        var device = 'CSR-AWS';
        var hdata = {};
        cisco.csrcall2(device,'acl/STOPPING/interfaces/gigabitEthernet1_inside',hdata,'delete');
    }
  },
  { 
    name: 'afunc11',
    descr: 'CSR-AWS Gi1 enable ACL STOP443',
    call: function() {
        var device = 'CSR-AWS';
        var hdata = { "if-id": "gigabitEthernet1",
                    "direction": "inside"};
        cisco.csrcall2(device,'acl/STOP443/interfaces',hdata,'post');
    }
  },
  { 
    name: 'afunc12',
    descr: 'CSR-AWS Gi1 disable ACL STOP443',
    call: function() {
        var device = 'CSR-AWS';
        var hdata = {};
        cisco.csrcall2(device,'acl/STOP443/interfaces/gigabitEthernet1_inside',hdata,'delete');
    }
  }
];
cisco.get_afunctions = function() {
    var ret = [];
    for(var i=0; cisco.action_functions[i]; i++) {
        var ent = {
            name: cisco.action_functions[i].name,
            descr: cisco.action_functions[i].descr
        };
        ret[i]=ent;
    }
    return ret;
};
cisco.call_afunc = function(name) {
    for(var i=0; cisco.action_functions[i]; i++) {
        if(cisco.action_functions[i].name == name) {
            cisco.action_functions[i].call();
            return;
        }
    }
};
// read functions description
cisco.read_functions = [
  { 
    name: 'rnone',
    descr: 'No Action',
    call: function() {
        
    }
  },
  { 
    name: 'rfunc1',
    descr: 'Gi3 down on CSR-WAN',
    call: function(cback) {
        var device = 'CSR-WAN';
        var hdata = {};
        try {
            cisco.csrcall2(device,'interfaces/gigabitEthernet3/state',hdata,'get',function(data) {
                //console.log(data);
                console.log('down='+data.enabled);
                if(data.enabled) {
                    cback(0);
                } else {
                    cback(1);
                }
            });
        } catch(ex) {
            console.log("internal exception");
        }
        return;
    }
  },
  { 
    name: 'rfunc2',
    descr: 'Gi3 up on CSR-WAN',
    call: function(cback) {
        var device = 'CSR-WAN';
        var hdata = {};
        try {
            cisco.csrcall2(device,'interfaces/gigabitEthernet3/state',hdata,'get',function(data) {
                //console.log(data);
                console.log('up='+data.enabled);
                if(data.enabled) {
                    cback(1);
                } else {
                    cback(0);
                }
            });
        } catch(ex) {
            console.log("internal exception");
        }
        return;
    }
  },
  { 
    name: 'rfunc3',
    descr: 'Gi1 up on CSR-AWS',
    call: function(cback) {
        var device = 'CSR-AWS';
        var hdata = {};
        try {
            cisco.csrcall2(device,'interfaces/gigabitEthernet1/state',hdata,'get',function(data) {
                //console.log(data);
                console.log('up='+data.enabled);
                if(data.enabled) {
                    cback(1);
                } else {
                    cback(0);
                }
            });
        } catch(ex) {
            console.log("internal exception");
        }
        return;
    }
  }
];
cisco.get_rfunctions = function() {
    console.log('= call for cisco.get_rfunctions');
    var ret = [];
    for(var i=0; cisco.read_functions[i]; i++) {
        console.log('= rfunc'+cisco.read_functions[i].name);
        var ent = {
            name: cisco.read_functions[i].name,
            descr: cisco.read_functions[i].descr
        };
        ret[i]=ent;
    }
    return ret;
};
cisco.call_rfunc = function(name,cback) {
    for(var i=0; cisco.read_functions[i]; i++) {
        if(cisco.read_functions[i].name == name) {
            try {
                cisco.read_functions[i].call(cback);
            } catch(ex) {
                console.log("internal exception");
            }
            return;
        }
    }
};

module.exports = cisco;
