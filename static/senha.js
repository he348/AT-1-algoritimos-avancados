document.addEventListener("DOMContentLoaded", function() {
    const teclado = document.getElementById("teclado");
    const botaoAcessarSenha = document.getElementById("botao-acessar-senha");
    const senhaDigitadaInput = document.getElementById("senha-digitada-input");
    const botaoApagar = document.getElementById("botao-apagar");

    // Obtém o token de sessão do localStorage
    const sessionToken = localStorage.getItem('sessionToken');
    console.log('Token de sessão:', sessionToken);

  // Função para enviar os valores dos botões para o servidor e armazená-los no banco de dados
function inserirValoresBotao(username, valoresBotao, sessionToken) {
    fetch('/inserir-valores-botao', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, valoresBotao: valoresBotao, sessionToken: sessionToken })
    })
    .then(response => {
        if (response.ok) {
            console.log('Valores dos botões inseridos com sucesso!');
        } else {
            console.error('Erro ao inserir valores dos botões:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Erro ao inserir valores dos botões:', error);
    });
}

    // Função para gerar botões com senhas aleatórias
    function gerarBotoesSenhasAleatorias(username) {
        const numeros = Array.from({length: 10}, (_, i) => i).sort(() => Math.random() - 0.5);
        const senha = [];
        for (let i = 0; i < 10; i += 2) {
            senha.push([numeros[i], numeros[i+1]]);
        }

        teclado.innerHTML = "";
        senha.forEach(par => {
            const botao = document.createElement("button");
            botao.className = "botao-numero";
            botao.textContent = `${par[0]} ou ${par[1]}`;
            botao.addEventListener("click", function() {
                if (senhaDigitadaInput.value.length < 5) {
                    senhaDigitadaInput.value += `${par[0]} ou ${par[1]}, `;
                }
            });
            teclado.appendChild(botao);
        });

        // Passa o token de sessão para a função de inserirValoresBotao
        inserirValoresBotao(username, senha, sessionToken);
    }

    // Obtém o username da URL
    const username = new URLSearchParams(window.location.search).get("username");

    // Chama a função para gerar os botões com a senha aleatória
    gerarBotoesSenhasAleatorias(username);

    // Evento de clique no botão de acessar senha
    botaoAcessarSenha.addEventListener("click", function() {
        const senhaDigitada = senhaDigitadaInput.value.trim();
        console.log('Senha digitada:', senhaDigitada);
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
        senhaDigitadaInput.value = senhaDigitadaInput.value.slice(0, -1);
    });
});
