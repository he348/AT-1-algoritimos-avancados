from flask import Flask, request, jsonify, render_template
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length
from flask_talisman import Talisman
import os  # Adicionado para gerar a chave secreta
import hashlib
import secrets
import datetime

app = Flask(__name__)
bcrypt = Bcrypt(app)

app.config['JWT_SECRET_KEY'] = 'your-jwt-secret-key'
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'teclado_virtual'

# Gera uma chave secreta aleatória para o Flask-WTF
app.config['SECRET_KEY'] = os.urandom(24)

mysql = MySQL(app)
jwt = JWTManager(app)

# Definindo a CSP (Política de Segurança de Conteúdo)
csp = {
    'default-src': '\'self\'',
    'style-src': '\'self\' https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
    'script-src': '\'self\' https://code.jquery.com/jquery-3.5.1.slim.min.js https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'
}

# Adicionando a extensão Talisman para implementar a CSP
Talisman(app, content_security_policy=csp)

# Rota para fazer login e gerar o token JWT
@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', '')
    password = request.json.get('password', '')

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT * FROM usuarios WHERE username = %s', (username,))
    user = cursor.fetchone()
    cursor.close()

    if not user or not bcrypt.check_password_hash(user[3], password):
        return jsonify({"msg": "Credenciais inválidas"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200

# Rota protegida que requer autenticação com JWT
@app.route('/protegido', methods=['GET'])
@jwt_required()
def protegido():
    # Obtém a identidade do usuário a partir do token JWT
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

# Rota para verificar se o usuário existe
@app.route('/verificar-usuario', methods=['GET'])
def verificar_usuario():
    username = request.args.get('username')
    app.logger.debug(f'Acessando rota /verificar-usuario para o usuário {username}')
    if not username:
        app.logger.error('Username não fornecido na solicitação GET')
        return jsonify({"error": "Username não fornecido"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT COUNT(*) FROM usuarios WHERE username = %s', (username,))
    count = cursor.fetchone()[0]
    cursor.close()

    if count > 0:
        app.logger.info('Usuário encontrado: %s', username)
        return jsonify({"msg": "Usuário encontrado"}), 200
    else:
        app.logger.warning('Usuário não encontrado: %s', username)
        return jsonify({"msg": "Usuário não encontrado"}), 404


# Rota para validar a senha recebida do frontend
@app.route('/validar-senha', methods=['POST'])
def validar_senha():
    username = request.json.get('username', '')
    senha = request.json.get('senha', '')

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT senha_hash FROM usuarios WHERE username = %s', (username,))
    result = cursor.fetchone()

    if result is None:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    stored_hash = result[0]

    # Verifica se o hash da senha armazenada no banco de dados corresponde à senha fornecida
    if bcrypt.check_password_hash(stored_hash, senha):
        # Senha correta
        return jsonify({"msg": "Senha válida"}), 200
    else:
        # Senha incorreta
        return jsonify({"msg": "Senha incorreta"}), 401

# Rota para recuperar a senha do usuário
@app.route('/senha-do-usuario', methods=['GET'])
def senha_do_usuario():
    username = request.args.get('username')

    if not username:
        return jsonify({"error": "Username não fornecido"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT senha_hash FROM usuarios WHERE username = %s', (username,))
    senha = cursor.fetchone()
    cursor.close()

    if not senha:
        return jsonify({"error": "Usuário não encontrado"}), 404

    return jsonify({"senha": senha[0]}), 200


# Rota para a primeira tela da aplicação
@app.route('/username')
def username():
    # Gerar um ID de sessão aleatório
    id_sessao = secrets.token_urlsafe(16)
    data = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Inserir o ID de sessão na tabela de sessões
    cursor = mysql.connection.cursor()
    cursor.execute('INSERT INTO sessoes (id_sessao, data) VALUES (%s, %s)', (id_sessao, data))
    mysql.connection.commit()
    cursor.close()
    
    return render_template('username.html')

if __name__ == '__main__':
    app.run(debug=True)
