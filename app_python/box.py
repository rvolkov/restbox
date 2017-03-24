import json
from app_python import app

boxcontrol = [
    {
        'name': 'b1',
        'secret': 'cisco123',
        'ready': 0,
        'boxes': [
            {
                'type': 'switch',
                'id': 0,
                'status': 0,
                'descr': 'red switch',
                'onfunc': 'anone',
                'offfunc': 'anone'
            },
            {
                'type': 'button',
                'id': 0,
                'status': 0,
                'descr': 'big red button',
                'onfunc': 'anone',
                'offfunc': 'anone'
            },
            {
                'type': 'usonic',
                'id': 0,
                'status': 0,
                'descr': 'ultrasonic sensor',
                'onfunc': 'anone',
                'offfunc': 'anone'
            },
            {
                'type': 'led',
                'id': 0,
                'status': 0,
                'descr': 'red light',
                'rfunc': 'rnone'
            },
            {
                'type': 'led',
                'id': 1,
                'status': 0,
                'descr': 'green light',
                'rfunc': 'rnone'
            }
        ]
    },
    {
        'name': 'b2',
        'secret': 'cisco123',
        'ready': 0,
        'boxes': [
            {
                'type': 'switch',
                'id': 0,
                'status': 0,
                'descr': 'blue switch',
                'onfunc': 'anone',
                'offfunc': 'anone'
            },
            {
                'type': 'button',
                'id': 0,
                'status': 0,
                'descr': 'big red button',
                'onfunc': 'anone',
                'offfunc': 'anone'
            },
            {
                'type': 'usonic',
                'id': 0,
                'status': 0,
                'descr': 'ultrasonic sensor',
                'onfunc': 'anone',
                'offfunc': 'anone'
            },
            {
                'type': 'led',
                'id': 0,
                'status': 0,
                'descr': 'red light',
                'rfunc': 'rnone'
            },
            {
                'type': 'led',
                'id': 1,
                'status': 0,
                'descr': 'green light',
                'rfunc': 'rnone'
            }
        ]
    }
]

def checkAccess(boxname,secret):
    for b in boxcontrol:
        if b['name'] == boxname and b['secret'] == secret:
            return True
    return False

def putStatus(boxname, t, i, v, r):
    for b in boxcontrol:
        #print('compare boxname',b['name'],boxname)
        if b['name'] == boxname:
            #print('boxnames equal',b['name'],boxname)
            if r:
                b['ready'] += 1
                if b['ready'] > 99999:
                    b['ready'] = 0;
            for m in b['boxes']:
                #print('compare type',m['type'],t)
                #print('compare id',m['id'],i)
                if m['type'] == t and int(m['id']) == int(i):
                    #print('bingo')
                    m['status'] = int(v)
                    return
            return
    return

def getStatus(boxname, t, i, r):
    for b in boxcontrol:
        if b['name'] == boxname:
            if r:
                b['ready'] += 1
                if b['ready'] > 99999:
                    b['ready'] = 0;
            for m in b['boxes']:
                if m['type'] == t and int(m['id']) == int(i):
                    return int(m['status'])
    return 0

def getConf():
    return json.dumps(boxcontrol)

def putOnFunc(boxname,t,i,fname):
    for b in boxcontrol:
        if b['name'] == boxname:
            for m in b['boxes']:
                if m['type'] == t and int(m['id']) == int(i):
                    m['onfunc'] = fname
                    return
    return

def putOffFunc(boxname,t,i,fname):
    for b in boxcontrol:
        if b['name'] == boxname:
            for m in b['boxes']:
                if m['type'] == t and int(m['id']) == int(i):
                    m['offfunc'] = fname
                    return
    return

def putRFunc(boxname,t,i,fname):
    for b in boxcontrol:
        if b['name'] == boxname:
            for m in b['boxes']:
                if m['type'] == t and int(m['id']) == int(i):
                    m['rfunc'] = fname
                    return
    return

if __name__ == '__main__':
  app.run()
