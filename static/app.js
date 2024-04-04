document.addEventListener("DOMContentLoaded", function() {
    const teclado = document.getElementById("teclado");
    const botaoAcessarSenha = document.getElementById("botao-acessar-senha");
    const senhaDigitadaInput = document.getElementById("senha-digitada-input");
    const botaoApagar = document.getElementById("botao-apagar"); // Adicionando referência ao botão de apagar

    // Função para gerar botões com senhas aleatórias
    function gerarBotoesSenhasAleatorias(username) {
        fetch(`/senha-aleatoria?username=${username}`)
            .then(response => response.json())
            .then(data => {
                teclado.innerHTML = "";
                data.forEach(senha => {
                    const botao = document.createElement("button");
                    botao.className = "botao-numero";
                    botao.textContent = `${senha[0]} ou ${senha[1]}`;
                    botao.addEventListener("click", function() {
                        if (senhaDigitadaInput.value.length < 5) {
                            senhaDigitadaInput.value += `${senha[0]} ou ${senha[1]}, `;
                        }
                    });
                    teclado.appendChild(botao);
                });
            })
            .catch(error => {
                console.error('Erro ao gerar senhas aleatórias:', error);
            });
    }

    // Chama a função para gerar os botões de senhas aleatórias ao carregar a página
    const username = new URLSearchParams(window.location.search).get("username");
    gerarBotoesSenhasAleatorias(username);

    // Evento de clique no botão de acessar senha
    botaoAcessarSenha.addEventListener("click", function() {
        const senhaDigitada = senhaDigitadaInput.value.trim();

        // Envia a senha digitada para autenticação
        fetch('/autenticar-senha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, senha: senhaDigitada })
        })
        .then(response => {
            if (response.ok) {
                return response.json().then(data => {
                    alert(data.msg);
                    // Redireciona para página protegida se a senha estiver correta
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
    });

    // Evento de clique no botão de apagar
    botaoApagar.addEventListener("click", function() {
        const senhaDigitada = senhaDigitadaInput.value;
        senhaDigitadaInput.value = senhaDigitada.slice(0, -2); // Remove os últimos dois caracteres (o número e a vírgula)
    });
});
