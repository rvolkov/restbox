import os
from datetime import datetime
import time
from flask import render_template, request, jsonify, Response, send_from_directory
from flask_jwt import JWT, jwt_required, current_user
from app_python import box
from app_python import app

template_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
print("template_folder=",template_folder)

# ==== entry points for one-page web application ====
@app.route('/')
#@app.route('/app')
def index():
  return render_template("indexpy.html")

# ==== JWT ===
jwt = JWT(app)

class User(object):
  def __init__(self, **kwargs):
    for k, v in kwargs.items():
      setattr(self, k, v)

@jwt.authentication_handler
def authenticate(username, password):
  # check login/password here
  if username == 'user1' and password == 'user123':
        return User(login=username)

@jwt.user_handler
def load_user(payload):
  return User(login=payload['login'])

@jwt.payload_handler
def make_payload(user):
  # ndate = datetime.utcnow()
  exptime = int(time.time() + 28800)
  print("user=",user)
  print("exptime=",exptime)
  return {
    'login': user,
    'exp': exptime
  }

@app.route('/login', methods = ['POST'])
def check_login():
  if not request.json or not 'username' in request.json or not 'password' in request.json:
    print('no username or password')
    return jsonify({'message': 'no username or password'}), 401
  data = request.get_json(force=True)
  username = data.get('username', None)
  password = data.get('password', None)
  print('username=',username)
  print('password=',password)
  # check login/password
  if username == 'user1' and password == 'user123':
      # payload = jwt.payload_callback(username)
      # token = jwt.encode_callback(payload)
      token = jwt.encode_callback(jwt.payload_callback(username))
      return jsonify( { 'token': token } ), 201
  return jsonify({'message': 'authentication failed'}), 401

# = end of JWT =

# ==== API for Arduino boxes, no jwt ===
@app.route('/api/get/<boxname>/<secret>/<t>/<i>', methods = ['GET'])
def get_box(boxname,secret,t,i):
  if box.checkAccess(boxname,secret):
    stat = box.getStatus(boxname,t,i,True)
    return jsonify( { 'message': stat } ), 200
  else:
    return jsonify( { 'message': 'auth_error'} ), 401

@app.route('/api/put/<boxname>/<secret>/<t>/<i>/<value>', methods = ['PUT'])
def put_box(boxname,secret,t,i,value):
  if box.checkAccess(boxname,secret):
    box.putStatus(boxname,t,i,value,True)
    # call action function
    valint = int(value)
    if t != 'usonic':
        if valint == 1:
            cisco.call_afunc(box.get_onfunc(boxname,t,i))
        if valint == 0:
            cisco.call_afunc(box.get_offfunc(boxname,t,i))
    else:
        if valint > 50 and valint < 100:
            cisco.call_afunc(box.get_onfunc(boxname,t,i))
        if valint < 50 and valint > 5:
            cisco.call_afunc(box.get_offfunc(boxname,t,i))
    return jsonify( { 'message': 'ok' } ), 200
  else:
    return jsonify( { 'message': 'auth_error'} ), 401

# ==== API for one-page web application, with jwt ====

# - list configured/active boxcontrollers, their modules and statuses
@app.route('/webapi/list/boxcontrollers', methods=['GET'])
@jwt_required()
def get_boxctrls():
    items = box.getConf();
    return jsonify({'message': items}), 200

# - client asks about lights status -
@app.route('/webapi/get/<boxname>/<t>/<i>', methods=['GET'])
@jwt_required()
def get_lights(boxname, t, i):
    stat = box.getStatus(boxname, t, i, False)
    return jsonify({'message': stat}), 200

# - change status for box on boxcontroller
@app.route('/webapi/change/<boxname>/<t>/<i>/<v>', methods=['PUT'])
@jwt_required()
def put_lights(boxname, t, i, v):
    box.putStatus(boxname, t, i, v, False)
    return jsonify({'message': 'ok'}), 200

# ==== end of API calls from one-page web application ====

if __name__ == '__main__':
  app.run()
