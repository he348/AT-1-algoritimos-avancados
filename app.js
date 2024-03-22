document.addEventListener("DOMContentLoaded", function() {
    const usernameInput = document.getElementById("username");
    const senhaInput = document.getElementById("senha-digitada-input");

    // Função para buscar a senha do usuário no backend
    function buscarSenhaDoUsuario(username) {
        return fetch(`/senha-do-usuario?username=${username}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao recuperar a senha do usuário');
                }
                return response.json();
            })
            .then(data => data.senha)
            .catch(error => {
                console.error('Erro ao recuperar a senha do usuário:', error);
                return null; // Retorna null em caso de erro
            });
    }

    document.getElementById("botao-username").addEventListener("click", function() {
        const username = usernameInput.value;
        if (username.length === 0) {
            alert("Preencher o nome de usuário");
        } else {
            // Buscar a senha correspondente ao nome de usuário inserido
            buscarSenhaDoUsuario(username)
                .then(senhaDoBancoDeDados => {
                    if (!senhaDoBancoDeDados) {
                        console.error('Senha do usuário não encontrada');
                        return;
                    }
                    // Atualizar para a próxima tela e preparar para inserir a senha
                    document.getElementById("tela-username").style.display = "none";
                    document.getElementById("tela-senha").style.display = "block";

                    // Adicionar botões para inserir a senha
                    const teclado = document.getElementById("teclado");
                    const labelSenha = document.getElementById("label-senha");
                    const senhaDigitadaInput = document.getElementById("senha-digitada-input");
                    const senhaDigitada = document.getElementById("senha-digitada");

                    teclado.innerHTML = "";
                    for (let i = 0; i < senhaDoBancoDeDados.length; i++) {
                        const botao = document.createElement("button");
                        botao.className = "botao-numero";
                        botao.textContent = senhaDoBancoDeDados[i];
                        botao.addEventListener("click", function() {
                            // Adiciona o número do botão clicado à senha digitada
                            if (senhaDigitadaInput.value.length < senhaDoBancoDeDados.length) {
                                senhaDigitadaInput.value += senhaDoBancoDeDados[i];
                                senhaDigitada.value += "*"; // Exibe asterisco
                            }
                            labelSenha.textContent = `Senha digitada (${senhaDigitadaInput.value.length}/${senhaDoBancoDeDados.length}):`;
                        });
                        teclado.appendChild(botao);
                    }
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
    
                fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                })
                .then(response => {
                    if (response.ok) {
                        alert("PARABÉNS, CONECTADO");
                        window.location.href = '/protegido';
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
    
        document.getElementById("botao-apagar").addEventListener("click", function() {
            senhaInput.value = "";
            document.getElementById("senha-digitada").value = "";
        });
    
        function buscarSenhaDoUsuario(username) {
            return fetch(`/senha-do-usuario?username=${username}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao recuperar a senha do usuário');
                    }
                    return response.json();
                })
                .then(data => data.senha)
                .catch(error => {
                    console.error('Erro ao recuperar a senha do usuário:', error);
                    return null;
                });
        }
    });
