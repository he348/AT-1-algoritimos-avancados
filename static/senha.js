document.addEventListener("DOMContentLoaded", function() {
    const teclado = document.getElementById("teclado");
    const botaoAcessarSenha = document.getElementById("botao-acessar-senha");
    const senhaDigitadaInput = document.getElementById("senha-digitada-input");
    const botaoApagar = document.getElementById("botao-apagar");

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

    let valoresBotao = [];

    // Função para gerar botões com senhas aleatórias
    function gerarBotoesSenhasAleatorias(username, sessionToken) {
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
            botao.value = `${par[0]} , ${par[1]}`; // Adiciona o valor do botão com o formato "x ou y"
            botao.addEventListener("click", function() {
                if (senhaDigitadaInput.value.length < 4) {
                    // Insere apenas um valor do par de botões no campo de senha visualmente
                    senhaDigitadaInput.value += botao.textContent.includes(par[0]) ? par[0] : par[1];
                    // Adiciona o par de valores ao array de valoresBotao
                    valoresBotao.push(par);
                    console.log('Valores do par de botões:', par); // Log dos valores do par de botões
                }
            });
            teclado.appendChild(botao);
        });

        // Passa o token de sessão para a função de inserirValoresBotao
        inserirValoresBotao(username, senha, sessionToken);
    }

    // Obtém o username da URL
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const sessionToken = localStorage.getItem('sessionToken');
    console.log('Token de sessão recuperado:', sessionToken);

    // Chama a função para gerar os botões com a senha aleatória
    gerarBotoesSenhasAleatorias(username, sessionToken);

 // Evento de clique no botão de acessar senha
botaoAcessarSenha.addEventListener("click", function() {
    const senhaDigitada = senhaDigitadaInput.value.trim(); // Defina a variável aqui
    console.log('Valores digitados:', valoresBotao);
    fetch('/autenticar-senha', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, valoresDigitados: valoresBotao })
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        alert(data.msg);
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});
    // Evento de clique no botão de apagar
    botaoApagar.addEventListener("click", function() {
        // Verifica se há caracteres para apagar
        if (senhaDigitadaInput.value.length > 0) {
            // Remove o último caractere do campo de senha visualmente
            senhaDigitadaInput.value = senhaDigitadaInput.value.slice(0, -1);
            // Remove o último par de valores do array valoresBotao
            valoresBotao.pop();
        }
    });
});
