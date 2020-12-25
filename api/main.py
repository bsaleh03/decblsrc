import time
import os
from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
import base64
import re
from flask_cors import CORS
from flask_jwt_extended import (jwt_required, create_access_token, get_jwt_identity, JWTManager, jwt_optional)
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__, static_folder='../build', static_url_path='/')
CORS(app)

app.config['JWT_SECRET_KEY'] = b'M\xb84B\x03IA\xe3\xfcj\xa0\xa4T\xfb\xac\xf0'
jwt = JWTManager(app)

app.config["MYSQL_HOST"] = '34.72.126.21'
app.config["MYSQL_USER"] = 'root'
app.config["MYSQL_PASSWORD"] = 'dlrB0zkaqb4yjnBn'
app.config["MYSQL_DB"] = 'mydb'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
#app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}
mysql = MySQL(app)


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')


@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/users')
def getUsers():
    cur = mysql.connection .cursor()
    cur.execute("SELECT UserName, Name FROM USERS")
    data = cur.fetchall()
    return {'users': data}

@app.route('/api/signup', methods=['POST'])
def register():
    if request.method == 'POST' and 'username' in request.form and 'password' in request.form and 'password_confirm' in request.form and 'email' in request.form:
        details = request.form
        name = details['name']
        uname = details['username'].lower().strip()
        email = details['email']
        password = details['password']
        cpassword = details['password_confirm']
        if not password == cpassword:
            return {'success': False ,'error': "Your passwords do not match"}, 400
        if not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            return  {'success': False ,'error': "Please use a valid Email"}, 400
        if not re.match(r"^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[@#$!])[\w\d@#!$]{6,18}$", password):
            return  {'success': False ,'error': "Please use a password between 6 and 18 characters with at least one uppercase, lowercase, special and numerical character"}, 400
        try:
            cur = mysql.connection.cursor()
            cur.execute("INSERT INTO USERS(Name, UserName, email, Password) VALUES (%s, %s, %s, %s)", (name, uname, email, generate_password_hash(password, "sha256")))
            mysql.connection.commit()
            cur = mysql.connection.cursor()
            cur.execute("SELECT idUsers FROM USERS WHERE UserName = %s", [uname])
            data = cur.fetchone()
            print(data[0])
            cur.execute("INSERT INTO RELATIONSHIPS (Users_idfollowed, Users_idfollowing) VALUES (%s, %s)", (data[0],data[0]))
            mysql.connection.commit()
            return "ok", 201
        except Exception as err:
            print(err)
            if str(err).find('email') != -1:
                return  {'success': False ,'error': "email is already registered"}, 409
            elif str(err).find('UserName') != -1:
                return {'success': False ,'error': "username is already registered"}, 409
            else:
                return {'success': False ,'error': str(err)}, 400 
    elif request.method == 'POST':
        return {'success': False ,'error':'Fill out the form'}, 400
    
@app.route('/api/popularposts')
def getPopPosts():
    try:
        cur = mysql.connection.cursor()
        user = get_jwt_identity()
        cur.execute('''SELECT u.idUsers, u.Name, u.UserName, p.content, p.Users_idUsers, p.idPosts, u.verified from POSTS p
        LEFT JOIN USERS u ON u.idUsers = p.Users_idUsers ''')
        data = cur.fetchall()
    except Exception as err:
            return {'success': False ,'error': str(err)}, 400
    if not data:
        return  {'success': False ,'error': "No posts to send"}, 400
    l = list()
    for n in range(len(data)):
        l.append(list(data[n]))
        l[n][3] = base64.b64encode(l[n][3]).decode('utf-8')
        try: 
            cur = mysql.connection.cursor()
            cur.execute("SELECT COUNT(Posts_idPosts) FROM LIKES WHERE Posts_idPosts = %s", [l[n][5]])
            cnt = cur.fetchone()
            l[n].append(cnt)
        except Exception as err:
            return {'success': False ,'error': str(err)}, 400
    l.sort(key=lambda x: x[7], reverse=True)
    #print(l[0][3])
    encoded = tuple(l)
    return {'users': encoded}

@app.route('/api/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST' and 'username' in request.form and 'password' in request.form: 
        username = request.form['username'].lower().strip()
        password = request.form['password'] 
        cur = mysql.connection.cursor()
        cur.execute("SELECT idUsers, Password, UserName FROM USERS WHERE UserName = %s", [username])
        user = cur.fetchall()
        if user:
            if check_password_hash(user[0][1], password):
                token = create_access_token(identity=user[0][0])
                return jsonify(accessToken=token), 200
            else:
                return {'error': "Login failed. Please enter the correct username or password."}, 403
        else: 
            return {'success': False ,'error': "Login failed: Please enter your correct account details"}, 400


@app.route('/api/createpost', methods=['POST'])
@jwt_required
def uploadPost():
    details = request.form
    try:
        user = get_jwt_identity()
        
        audioFile = request.files['audio']
        userID = details['userID']
        #print(audioFile.read())
        cur = mysql.connection.cursor()
        x = audioFile.read()
        cur.execute("INSERT INTO POSTS(Users_idUsers, content) VALUES (%s, %s)", (user, x))
        mysql.connection.commit()
        return {'success': True}, 201
    except Exception as e:
        print(e)
        return {'error': str(e)},400

@app.route('/api/changeprofile', methods=['POST'])
@jwt_required
def editpf():
    details = request.form
    user = get_jwt_identity()
    try:
        name = details['name']
        bio = details['biography']
        cur = mysql.connection.cursor()
        cur.execute("UPDATE USERS SET Name = %s , biography = %s WHERE idUsers = %s", (name, bio, user))
        mysql.connection.commit()
        return {'success': True}, 201
    except Exception as e:
        print(e)
        return {'error': str(e)},400

@app.route('/api/posts')
@jwt_required
def getPosts():
    cur = mysql.connection.cursor()
    user = get_jwt_identity()
    cur.execute('''SELECT u.idUsers, u.Name, u.UserName, p.content, p.Users_idUsers, p.idPosts, u.verified, r.Users_idfollowing, r.Users_idfollowed from POSTS p
    LEFT JOIN USERS u ON u.idUsers = p.Users_idUsers 
    LEFT JOIN RELATIONSHIPS r ON r.Users_idfollowed = u.idUsers WHERE r.Users_idfollowing = %s''', [user])
    data = cur.fetchall()
    if not data:
        return  {'success': False ,'error': "No posts to send"}, 400
    l = list()
    for n in range(len(data)):
        l.append(list(data[n]))
        l[n][3] = base64.b64encode(l[n][3]).decode('utf-8')
        cur = mysql.connection.cursor()
        print(type(l[n][5]))
        cur.execute("SELECT COUNT(Posts_idPosts) FROM LIKES WHERE Posts_idPosts = %s", [l[n][5]])
        cnt = cur.fetchone()
        l[n].append(cnt)
        cur.execute("SELECT * FROM LIKES WHERE Users_idUsers = %s AND Posts_idPosts = %s", (user, l[n][5]))
        cnt = cur.fetchone()
        l[n].append(not cnt == None)
    #print(l[0][3])
    encoded = tuple(l)
    return {'users': encoded}

@app.route('/api/like', methods=['POST'])
@jwt_required
def likePost():
    if request.method == 'POST':
        details = request.form
        try:
            idPosts = details['idPosts']
            user = get_jwt_identity()
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM LIKES WHERE Users_idUsers = %s AND Posts_idPosts = %s", (user, idPosts))
            data = cur.fetchall()
            cur = mysql.connection.cursor()
            if not data:
                cur.execute("INSERT INTO LIKES(Users_idUsers, Posts_idPosts) VALUES (%s, %s)", (user, idPosts) )
            else:
                cur.execute("DELETE FROM LIKES WHERE Users_idUsers = %s AND Posts_idPosts = %s", (user, idPosts))
            mysql.connection.commit()
            return {'success': True}, 201
        except Exception as err:
            print(e)
            return {'error': str(err)},400


@app.route('/api/delete', methods=['POST'])
@jwt_required
def deletePost():
    if request.method == 'POST':
        details = request.form
        try:
            idPosts = details['idPosts']
            user = get_jwt_identity()
            cur = mysql.connection.cursor()
            cur.execute("SELECT Users_idUsers FROM POSTS WHERE Posts_idPosts = %s", [idPosts])
            data = cur.fetchall()
            if data[0] == user:
                cur.execute("DELETE FROM POSTS WHERE Posts_idPosts = %s", [idPosts])
                mysql.connection.commit()
            else:
                return {'error': "User is not authorized to delete this post"}, 401
            return {'success': True}, 201
        except Exception as err:
            print(e)
            return {'error': str(err)},400

@app.route('/api/follow', methods=['POST'])
@jwt_required
def follow():
    if request.method == 'POST':
        details = request.form
        try:
            uID = details['idUsers']
            user = get_jwt_identity()
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM RELATIONSHIPS WHERE Users_idfollowed = %s AND Users_idfollowing = %s", (uID, user))
            data = cur.fetchall()
            cur = mysql.connection.cursor()
            if not data:
                cur.execute("INSERT INTO RELATIONSHIPS (Users_idfollowed, Users_idfollowing) VALUES (%s, %s)", (uID, user))
            else:
                cur.execute("DELETE FROM RELATIONSHIPS WHERE Users_idfollowed = %s AND Users_idfollowing = %s", (uID, user))
            mysql.connection.commit()
            return {'success': True}, 201
        except Exception as err:
            print(e)
            return {'error': str(err)},400

@app.route('/api/getuName')
@jwt_required
def getName():
    user = get_jwt_identity()
    cur = mysql.connection.cursor()
    try:
        cur.execute("SELECT UserName FROM USERS WHERE idUsers = %s", [user])
        data = cur.fetchone()
        return {'uName': data},200
    except Exception as err:
            print(e)
            return {'error': str(err)},400


@app.route('/api/profile/<name>')
@jwt_optional
def getpf(name):
        user = get_jwt_identity()
        print(user)
        cur = mysql.connection.cursor()
        try:
            cur.execute("SELECT Name, dateCreated, biography, verified, idUsers FROM USERS WHERE UserName = %s", [name])
            data = cur.fetchone()
            ret = list(data)
            ret.append(user == data[4])
            cur = mysql.connection.cursor()
            cur.execute("SELECT COUNT(Users_idfollowed) FROM RELATIONSHIPS WHERE Users_idfollowed = %s", [data[4]])
            ret.append(cur.fetchone())
            cur.execute("SELECT COUNT(Users_idfollowing) FROM RELATIONSHIPS WHERE Users_idfollowing = %s", [data[4]])
            ret.append(cur.fetchone())
            if user:
                cur.execute("SELECT * FROM RELATIONSHIPS WHERE Users_idfollowing = %s AND Users_idfollowed = %s", (user, data[4]))
            ret.append(cur.fetchone() == None)
            retuple = tuple(ret)
            return {"userInfo": retuple}, 200
        except Exception as err:
            print(err)
            return {'error': "This user does not exist"}, 404

@app.route('/api/posts/<name>')
@jwt_optional
def getPostsPF(name):
    cur = mysql.connection.cursor()
    user = get_jwt_identity()
    cur.execute('''SELECT u.idUsers, u.Name, u.UserName, p.content, p.Users_idUsers, p.idPosts, u.verified from POSTS p
    LEFT JOIN USERS u ON u.idUsers = p.Users_idUsers 
    WHERE u.UserName = %s''', [name])
    data = cur.fetchall()
    if not data:
        return  {'success': False ,'error': "No posts to send"}, 400
    l = list()
    for n in range(len(data)):
        l.append(list(data[n]))
        print(data[n][3])
        l[n][3] = base64.b64encode(l[n][3]).decode('utf-8')
        cur = mysql.connection.cursor()
        cur.execute("SELECT COUNT(Posts_idPosts) FROM LIKES WHERE Posts_idPosts = %s", [l[n][5]])
        cnt = cur.fetchone()
        l[n].append(cnt)
        cur.execute("SELECT * FROM LIKES WHERE Users_idUsers = %s AND Posts_idPosts = %s", (user, l[n][5]))
        cnt = cur.fetchone()
        l[n].append(not cnt == None)
    #print(l[0][3])
    encoded = tuple(l)
    return {'users': encoded}

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}

port = int(os.environ.get('PORT', 8080))
if not port: 
    port = 8080
    
if __name__ == '__main__':
    app.run(threaded=True, host='0.0.0.0', port=port)