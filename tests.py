import pytest
from app import app
from flask_testing import TestCase

class MyTest(TestCase):
    def create_app(self):
        app.config['TESTING'] = True
        app.config['MYSQL_DB'] = 'test_database_name'  # Use a test database if needed
        return app

    def test_login(self):
        response = self.client.post('/login', json={'username': 'test_user', 'password': 'test_password'})
        self.assertEqual(response.status_code, 200)

    def test_protegido(self):
        # Aqui você precisa passar um token JWT válido
        response = self.client.get('/protegido', headers={'Authorization': 'Bearer YOUR_VALID_TOKEN'})
        self.assertEqual(response.status_code, 200)

    def test_validar_senha(self):
        response = self.client.post('/validar-senha', json={'username': 'test_user', 'senha': 'test_password'})
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    pytest.main()
