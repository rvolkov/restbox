'use strict';
var cfg = require('./config.js');
var cisco = require('./cisco.js');

var box = module.exports = {};

box.getConf = function() {
    return cfg.bcontrol;
}
box.checkAccess = function(boxname,secret) {
    var b;
    for(var i=0; b = cfg.bcontrol[i]; i++) {
        if(b.name === boxname && b.secret === secret) {
            return true;
        }
    }
    return false;
};
box.getStatus = function(boxname,type,id,ready) {
    //console.log('* request to get box='+boxname+' type='+type+' id='+id);
    var b;
    var m;
    for(var i=0; b = cfg.bcontrol[i]; i++) {
        if(b.name === boxname) {
            if(ready) {
                cfg.bcontrol[i].ready += 1;
                if(cfg.bcontrol[i].ready > 99999) {
                    cfg.bcontrol[i].ready = 0;
                }
            }
            for(var j=0; m = b.boxes[j]; j++) {
                if(m.type === type && m.id === parseInt(id)) {
                    console.log('* request box '+b.name+'/'+m.type+'/'+m.id+' reply = '+m.status);
                    return m.status;
                    //return cfg.bcontrol[i].boxes[j].status;
                }
            }
        }
    }
    return 0;
};
box.putOnFunc = function(boxname,type,id,fname) {
    var i = 0;
    while(cfg.bcontrol[i]) {
        var b = cfg.bcontrol[i];
        if(b.name === boxname) {
            var j = 0;
            while(b.boxes[j]) {
                var m = b.boxes[j];
                if(m.type === type && m.id === parseInt(id)) {
                    cfg.bcontrol[i].boxes[j].onfunc = fname;
                    return;
                }
                j++;
            }
        }
        i++;
    }
};
box.putOffFunc = function(boxname,type,id,fname) {
    var i = 0;
    while(cfg.bcontrol[i]) {
        var b = cfg.bcontrol[i];
        if(b.name === boxname) {
            var j = 0;
            while(b.boxes[j]) {
                var m = b.boxes[j];
                if(m.type === type && m.id === parseInt(id)) {
                    cfg.bcontrol[i].boxes[j].offfunc = fname;
                    return;
                }
                j++;
            }
        }
        i++;
    }
};
box.putRFunc = function(boxname,type,id,fname) {
    var i = 0;
    while(cfg.bcontrol[i]) {
        var b = cfg.bcontrol[i];
        if(b.name === boxname) {
            var j = 0;
            while(b.boxes[j]) {
                var m = b.boxes[j];
                if(m.type === type && m.id === parseInt(id)) {
                    cfg.bcontrol[i].boxes[j].rfunc = fname;
                    return;
                }
                j++;
            }
        }
        i++;
    }
};
box.putStatus = function(boxname,type,id,val,ready) {
    console.log('* request to change box='+boxname+' type='+type+' id='+id+' value='+val);
    var i = 0;
    while(cfg.bcontrol[i]) {
        var b = cfg.bcontrol[i];
        if(b.name === boxname) {
            if(ready) {
                cfg.bcontrol[i].ready += 1;
                if(cfg.bcontrol[i].ready > 99999) {
                    cfg.bcontrol[i].ready = 0;
                }
            }
            var j = 0;
            while(b.boxes[j]) {
                var m = b.boxes[j];
                if(m.type == type && m.id == id) {
                    //console.log('*** '+b.name+'/'+m.type+'/'+m.id+' changed to '+parseInt(val));
                    if(val != undefined) {
                        cfg.bcontrol[i].boxes[j].status = parseInt(val);
                    }
                    return;
                }
                j++;
            }
        }
        i++;
    }
};
module.exports = box;
