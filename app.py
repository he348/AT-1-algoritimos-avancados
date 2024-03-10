from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_mysqldb import MySQL

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'username'
app.config['MYSQL_PASSWORD'] = 'password'
app.config['MYSQL_DB'] = 'database_name'

mysql = MySQL(app)
jwt = JWTManager(app)

# Rota para fazer login e gerar o token JWT
@app.route('/login', methods=['POST'])
def login():
    # Verifica as credenciais no banco de dados
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT * FROM users WHERE username = %s AND password = %s', (username, password))
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return jsonify({"msg": "Credenciais inválidas"}), 401

    # Cria um token JWT válido por 1 hora
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200

# Rota protegida que requer autenticação com JWT
@app.route('/protegido', methods=['GET'])
@jwt_required()
def protegido():
    # Obtém a identidade do usuário a partir do token JWT
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

# Rota para receber a senha e o nome de usuário do frontend
@app.route('/validar-senha', methods=['POST'])
def validar_senha():
    username = request.json.get('username', None)
    senha = request.json.get('senha', None)

    # Verifica as credenciais no banco de dados
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT senha FROM users WHERE username = %s', (username,))
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    # Verifica se a senha fornecida corresponde à senha no banco de dados
    if senha != user['senha']:
        return jsonify({"msg": "Senha incorreta"}), 401

    return jsonify({"msg": "Senha validada"}), 200

if __name__ == '__main__':
    app.run(debug=True)
