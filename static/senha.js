document.addEventListener("DOMContentLoaded", function() {
    const teclado = document.getElementById("teclado");
    const labelSenha = document.getElementById("label-senha");
    const senhaDigitada = document.getElementById("senha-digitada");
    const senhaDigitadaInput = document.getElementById("senha-digitada-input");
    const botaoAcessarSenha = document.getElementById("botao-acessar-senha");
    const username = getUrlParameter("username");

    // Função para buscar a senha do usuário no servidor
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

    // Recuperar a senha do usuário quando a página é carregada
    buscarSenhaDoUsuario(username)
        .then(senhaDoBancoDeDados => {
            if (!senhaDoBancoDeDados) {
                console.error('Senha do usuário não encontrada');
                return;
            }

            teclado.textContent = ""; // Limpa o teclado antes de adicionar os botões

            paresAleatorios.forEach(function(par) {
                const botao = document.createElement("button");
                botao.className = "botao-numero";
                botao.textContent = par;
                botao.addEventListener("click", function() {
                    const numeros = par.split(" ou ");
                    const numeroSelecionado = numeros[Math.floor(Math.random() * 2)];
                    if (senhaDigitadaInput.value.length < 4) { // Limita a 4 caracteres
                        senhaDigitadaInput.value += numeroSelecionado;
                        senhaDigitada.value += "*"; // Exibe asterisco
                    }
                });
                teclado.appendChild(botao);
            });
        });

    // Adicionando evento de input ao campo de senha para verificar o comprimento
    senhaDigitadaInput.addEventListener("input", function() {
        // Verifica se o comprimento da senha é igual a 4
        if (senhaDigitadaInput.value.length === 4) {
            // Habilita o botão de acessar se a senha estiver completa
            botaoAcessarSenha.disabled = false;
        } else {
            // Desabilita o botão de acessar se a senha não estiver completa
            botaoAcessarSenha.disabled = true;
        }
    });

    document.getElementById("botao-acessar-senha").addEventListener("click", function() {
        const senha = senhaDigitadaInput.value;
        console.log("Usuário:", username);
        console.log("Senha:", senha);
        if (senha.length !== 4) {
            alert("A senha deve ter 4 dígitos.");
        } else {
            const dados = {
                username: username,
                password: senha
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
        senhaDigitadaInput.value = senhaDigitadaInput.value.slice(0, -1);
        senhaDigitada.value = senhaDigitada.value.slice(0, -1);
    });
});

// Função para obter parâmetros da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
