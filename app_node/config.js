'use strict';
var cfg = module.exports = {};
cfg.jwtsecret = 'Add-your-own-secret';
cfg.bcontrol = [
    {
        name: 'b1',
        secret: 'restbox',
        ready: 0,
        boxes: [
            {
                type: 'switch',
                id: 0,
                status: 0,
                descr: 'red switch',
                onfunc: 'anone',
                offfunc: 'anone'
            },
            {
                type: 'button',
                id: 0,
                status: 0,
                descr: 'big red button',
                onfunc: 'anone',
                offfunc: 'anone'
            },
            {
                type: 'usonic',
                id: 0,
                status: 0,
                descr: 'ultrasonic sensor',
                onfunc: 'anone',
                offfunc: 'anone'
            },
            {
                type: 'led',
                id: 0,
                status: 0,
                descr: 'red light',
                rfunc: 'rnone'
            },
            {
                type: 'led',
                id: 1,
                status: 0,
                descr: 'green light',
                rfunc: 'rnone'
            }
        ]
    },
    {
        name: 'b2',
        secret: 'restbox',
        ready: 0,
        boxes: [
            {
                type: 'switch',
                id: 0,
                status: 0,
                descr: 'blue switch',
                onfunc: 'anone',
                offfunc: 'anone'
            },
            {
                type: 'button',
                id: 0,
                status: 0,
                descr: 'big red button',
                onfunc: 'anone',
                offfunc: 'anone'
            },
            {
                type: 'usonic',
                id: 0,
                status: 0,
                descr: 'ultrasonic sensor',
                onfunc: 'anone',
                offfunc: 'anone'
            },
            {
                type: 'led',
                id: 0,
                status: 0,
                descr: 'red light',
                rfunc: 'rnone'
            },
            {
                type: 'led',
                id: 1,
                status: 0,
                descr: 'green light',
                rfunc: 'rnone'
            }
        ]
    }
];
cfg.get_onfunc = function(boxname,type,id) {
    var c;
    for(var i=0; c=cfg.bcontrol[i]; i++) {
        if(c.name == boxname) {
            var b;
            for(var j=0; b=c.boxes[j]; j++) {
                if(b.type === type && b.id === parseInt(id)) {
                   return b.onfunc;
                }
            }
        }
    }
    return 'anone';
};
cfg.get_offfunc = function(boxname,type,id) {
    var c;
    for(var i=0; c=cfg.bcontrol[i]; i++) {
        if(c.name == boxname) {
            var b;
            for(var j=0; b=c.boxes[j]; j++) {
                if(b.type === type && b.id === parseInt(id)) {
                   return b.offfunc;
                }
            }
        }
    }
    return 'anone';
};
cfg.get_rfunc = function(boxname,type,id) {
    var c;
    for(var i=0; c=cfg.bcontrol[i]; i++) {
        if(c.name == boxname) {
            var b;
            for(var j=0; b=c.boxes[j]; j++) {
                if(b.type === type && b.id === parseInt(id)) {
                   return b.rfunc;
                }
            }
        }
    }
    return 'anone';
};
cfg.routers = [
    {
        name: 'CSR1',
        host: '10.1.2.3',
        username: 'rest',
        password: 'restpwd',
        type: 'csrv',
        token: ''
    }
    ,{
        name: 'CSR2',
        host: '10.1.2.4',
        username: 'rest',
        password: 'restpwd',
        type: 'csrv',
        token: ''
    }
];
// list of users
cfg.labusers = [
  { login: 'user1',
    password: 'user1pwd'
  },
  { login: 'user2',
    password: 'user2pwd'
  },
  { login: 'user3',
    password: 'user3pwd'
  }
];
cfg.checkuser = function(login, pwd) {
    var u;
    for(var i=0; u=cfg.labusers[i]; i++) {
        if(u.login === login && u.password === pwd) {
            return true;
        }
    }
    return false;
};
module.exports = cfg;
