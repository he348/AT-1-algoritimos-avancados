document.addEventListener("DOMContentLoaded", function() {
    const usernameInput = document.getElementById("username");
    const senhaInput = document.getElementById("senha-digitada-input");

    document.getElementById("botao-acessar-username").addEventListener("click", function() {
        const username = usernameInput.value;
        if (username.length === 0) {
            alert("Preencher o nome de usuário");
        } else {
            buscarSenhaDoUsuario(username)
                .then(senhaDoBancoDeDados => {
                    if (!senhaDoBancoDeDados) {
                        console.error('Senha do usuário não encontrada');
                        return;
                    }
                    document.getElementById("username").style.display = "none";
                    document.getElementById("senha-digitada").style.display = "block";

                    const teclado = document.getElementById("teclado");
                    const labelSenha = document.getElementById("label-senha");
                    const senhaDigitadaInput = document.getElementById("senha-digitada-input");
                    const senhaDigitada = document.getElementById("senha-digitada");

                    teclado.innerHTML = "";
                    senhaDoBancoDeDados.split('').forEach(function(digito) {
                        const botao = document.createElement("button");
                        botao.className = "botao-numero";
                        botao.textContent = digito;
                        botao.addEventListener("click", function() {
                            if (senhaDigitadaInput.value.length < senhaDoBancoDeDados.length) {
                                senhaDigitadaInput.value += digito;
                                senhaDigitada.value += "*"; // Exibe asterisco
                            }
                            labelSenha.textContent = `Senha digitada (${senhaDigitadaInput.value.length}/${senhaDoBancoDeDados.length}):`;
                        });
                        teclado.appendChild(botao);
                    });
                });
        }
    });

    document.getElementById("botao-acessar-senha").addEventListener("click", function() {
        const senha = senhaInput.value;
        const username = usernameInput.value;
        if (senha.length === 0 || username.length === 0) {
            alert("Preencher nome de usuário e senha");
        } else {
            const dados = {
                username: username,
                senha: senha
            };
    
            fetch('/validar-senha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            })
            .then(response => {
                if (response.ok) {
                    return response.json().then(data => {
                        alert("PARABÉNS, CONECTADO");
                        window.location.href = '/protegido';
                    });
                } else {
                    return response.json().then(data => {
                        alert(data.msg);
                    });
                }
            })
            .catch(error => {
                console.error('Erro:', error);
            });
        }
    });

    async function buscarSenhaDoUsuario(username) {
        try {
            const response = await fetch(`/senha-do-usuario?username=${username}`);
            if (!response.ok) {
                throw new Error('Erro ao recuperar a senha do usuário');
            }
            const data = await response.json();
            return data.senha;
        } catch (error) {
            console.error('Erro ao recuperar a senha do usuário:', error);
            return null;
        }
    }
});
