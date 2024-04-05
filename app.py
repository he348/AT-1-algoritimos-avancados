from flask import Flask, request, jsonify, render_template
from flask_jwt_extended import JWTManager
from flask_mysqldb import MySQL
from flask_talisman import Talisman 
import os
import secrets
import datetime
import random
import json
import jwt

app = Flask(__name__)

# Gerar uma chave secreta aleatória para JWT
jwt_secret_key = secrets.token_hex(32)  # 32 bytes (64 caracteres hexadecimais)

app.config['JWT_SECRET_KEY'] = jwt_secret_key
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'teclado_virtual'

# Gera uma chave secreta aleatória para o Flask-WTF
app.config['SECRET_KEY'] = os.urandom(24)

mysql = MySQL(app)
jwt_manager = JWTManager(app)

# Definindo a CSP (Política de Segurança de Conteúdo)
csp = {
    'default-src': '\'self\'',
    'style-src': '\'self\' https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
    'script-src': '\'self\' \'unsafe-inline\' https://code.jquery.com/jquery-3.5.1.slim.min.js https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'
}

# Adicionando a extensão Talisman para implementar a CSP
Talisman(app, content_security_policy=csp)

# Rota para página inicial (username)
@app.route('/')
def index():
    return render_template('username.html')

@app.route('/gerar-session-token', methods=['GET'])
def gerar_session_token():
    # Recupera o username da query string
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "Username não fornecido"}), 400

    # Gera um token de sessão usando JWT
    session_token = jwt.encode({'username': username}, app.config['JWT_SECRET_KEY'], algorithm='HS256')

    # Retorna o token de sessão gerado
    print('Token de sessão gerado no print da gerar-session-tolen:', session_token)
    return jsonify({"sessionToken": session_token}), 200


@app.route('/senha.html')
def senha():
    username = request.args.get('username')
    session_token = request.args.get('sessionToken')
    print('Token de sessão gerado da rota senha.html:', session_token)

    if not username:
        return jsonify({"error": "Username não fornecido"}), 400

    if not session_token:
        return jsonify({"error": "Token de sessao nao fornecido"}), 400


    # Adicione instruções de depuração para verificar os valores
    print('Username:', username)
    print('Token de sessão:', session_token)

    # Gerar e inserir sessão no banco de dados apenas quando entrar na tela de senha
    id_sessao = session_token
    data = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print('ID da sessão:', id_sessao)
    print('Data da sessão:', data)
    
    cursor = mysql.connection.cursor()
    cursor.execute('INSERT INTO sessoes (id_sessao, data, username) VALUES (%s, %s, %s)', (id_sessao, data, username))
    mysql.connection.commit()
    cursor.close()
    
    return render_template('senha.html', username=username)

@app.route('/inserir-valores-botao', methods=['POST'])
def inserir_valores_botao():
    # Recebe os dados enviados pelo frontend
    dados = request.json
    username = dados.get('username', '')
    valores_botao = json.dumps(dados.get('valoresBotao', []))
    session_token = dados.get('sessionToken')  # Obter o token de sessão do corpo da requisição
    
    # Verificar se o token de sessão está presente
    if not session_token:
        return jsonify({"error": "Token de sessão não fornecido"}), 400

    # Verificar se o registro já existe na tabela 'sessoes'
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT COUNT(*) FROM sessoes WHERE username = %s AND id_sessao = %s', (username, session_token))
    result = cursor.fetchone()
    
    if result[0] == 0:
        # Se o registro não existe, insira-o na tabela 'sessoes'
        cursor.execute('INSERT INTO sessoes (username, valores_botao) VALUES (%s, %s, %s)', (session_token, username, valores_botao))
    else:
        # Se o registro existe, atualize os valores dos botões na tabela 'sessoes'
        cursor.execute('UPDATE sessoes SET valores_botao = %s WHERE username = %s AND id_sessao = %s', (valores_botao, username, session_token))
    
    mysql.connection.commit()
    cursor.close()

    return jsonify({"msg": "Valores dos botões inseridos com sucesso!"}), 200

# Rota para autenticar a senha
@app.route('/autenticar-senha', methods=['POST'])
def autenticar_senha():
    # Recebe os dados enviados pelo frontend
    dados = request.json
    username = dados.get('username', '')
    senha_digitada = dados.get('senha', [])

    # Recupera a senha hash do usuário do banco de dados
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT senha_hash FROM usuarios WHERE username = %s', (username,))
    result = cursor.fetchone()

    # Se não encontrar o usuário, retorna senha incorreta
    if result is None:
        return jsonify({"msg": "Senha incorreta"}), 401

    # Verifica se a senha digitada está correta
    senha_hash = result[0]
    if senha_digitada == senha_hash:
        # Senha correta
        return jsonify({"msg": "Acesso concedido"}), 200
    else:
        # Senha incorreta
        return jsonify({"msg": "Senha incorreta"}), 401
    

    # Rota para verificar se o usuário existe
@app.route('/verificar-usuario', methods=['GET'])
def verificar_usuario():
    # Recupera o username da query string
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "Username não fornecido"}), 400

    # Consulta ao banco de dados para verificar se o usuário existe
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT COUNT(*) FROM usuarios WHERE username = %s', (username,))
    result = cursor.fetchone()
    cursor.close()

    # Se o usuário existir, retorna 200 OK
    if result[0] > 0:
        return jsonify({"msg": "Usuário encontrado"}), 200
    else:
        # Se o usuário não existir, retorna 404 Not Found
        return jsonify({"error": "Usuário não encontrado"}), 404

if __name__ == '__main__':
    app.run(debug=True)
