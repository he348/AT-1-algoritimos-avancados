from flask import Flask, request, jsonify, render_template
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from MySQLdb import escape_string  # Importando a função escape_string
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length
from flask_talisman import Talisman

app = Flask(__name__)
bcrypt = Bcrypt(app)

app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'admin'
app.config['MYSQL_DB'] = 'Localhost'
app.config['SECRET_KEY'] = 'your-secret-key'  # Chave secreta para o Flask-WTF

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

    if not username:
        return jsonify({"error": "Username não fornecido"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT COUNT(*) FROM usuarios WHERE username = %s', (username,))
    count = cursor.fetchone()[0]
    cursor.close()

    if count > 0:
        return jsonify({"msg": "Usuário encontrado"}), 200
    else:
        return jsonify({"msg": "Usuário não encontrado"}), 404


# Rota para validar a senha recebida do frontend
@app.route('/validar-senha', methods=['POST'])
def validar_senha():
    username = request.json.get('username', '')
    senha = request.json.get('senha', '')

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT senha FROM usuarios WHERE username = %s', (username,))
    result = cursor.fetchone()
    cursor.close()

    if not result:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    stored_hash = result[0]
    if not bcrypt.check_password_hash(stored_hash, senha):
        return jsonify({"msg": "Senha incorreta"}), 401

    return jsonify({"msg": "Senha validada"}), 200

# Rota para recuperar a senha do usuário
@app.route('/senha-do-usuario', methods=['GET'])
def senha_do_usuario():
    username = request.args.get('username')

    if not username:
        return jsonify({"error": "Username não fornecido"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT senha FROM usuarios WHERE username = %s', (username,))
    senha = cursor.fetchone()
    cursor.close()

    if not senha:
        return jsonify({"error": "Usuário não encontrado"}), 404

    return jsonify({"senha": senha[0]}), 200

# Definindo um formulário de login com Flask-WTF
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[InputRequired(), Length(min=4, max=20)])
    password = PasswordField('Password', validators=[InputRequired(), Length(min=6, max=20)])
    submit = SubmitField('Submit')

# Rota para renderizar o formulário de login
@app.route('/login_form', methods=['GET', 'POST'])
def login_form():
    form = LoginForm()
    if form.validate_on_submit():
        # Se o formulário for submetido e válido, você pode acessar os dados assim:
        username = form.username.data
        password = form.password.data

    # Renderizar o template do formulário novamente, passando o formulário e as mensagens de erro
    return render_template('login_form.html', form=form)

if __name__ == '__main__':
    app.run(debug=True)
