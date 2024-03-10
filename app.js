document.addEventListener("DOMContentLoaded", function() {
    const teclado = document.getElementById("teclado");
    const labelSenha = document.getElementById("label-senha");
    const senhaDigitada = document.getElementById("senha-digitada");
    const usernameInput = document.getElementById("username");

    // Função para gerar pares aleatórios de números de 0 a 9 sem repetição
    function gerarParesAleatorios() {
        let numerosDisponiveis = Array.from({length: 10}, (_, i) => i); // Lista de números de 0 a 9
        let pares = [];
        
        while (pares.length < 5) {
            let num1 = numerosDisponiveis.splice(Math.floor(Math.random() * numerosDisponiveis.length), 1)[0];
            let num2 = numerosDisponiveis.splice(Math.floor(Math.random() * numerosDisponiveis.length), 1)[0];
            
            // Garantir que os números sejam diferentes
            while (num2 === num1) {
                numerosDisponiveis.push(num2);
                num2 = numerosDisponiveis.splice(Math.floor(Math.random() * numerosDisponiveis.length), 1)[0];
            }
            
            // Adicionar o par ao array de pares
            pares.push(`${num1} ou ${num2}`);
        }
        
        return pares;
    }

    // Gerar pares aleatórios
    const paresAleatorios = gerarParesAleatorios();

    // Criar botões de seleção de números
    paresAleatorios.forEach(function(par) {
        const botao = document.createElement("button");
        botao.className = "botao-numero";
        botao.textContent = par;
        botao.addEventListener("click", function() {
            const numeros = par.split(" ou ");
            const numeroSelecionado = numeros[Math.floor(Math.random() * 2)];
            if (senhaDigitada.textContent.length < 4) { // Limite de 4 caracteres
                senhaDigitada.textContent += numeroSelecionado;
            }
            labelSenha.textContent = "Senha digitada (" + senhaDigitada.textContent.length + "/4):";
        });
        teclado.appendChild(botao);
    });

    // Adicionar evento de clique ao botão "Acessar"
    document.getElementById("botao-acessar").addEventListener("click", function() {
        const senha = senhaDigitada.textContent;
        const username = usernameInput.value;
        console.log("Username:", username);
        console.log("Senha digitada:", senha);
        // Lógica para enviar o nome de usuário e senha para o backend e validar
        // Aqui você pode fazer uma requisição AJAX para enviar os dados para o servidor
        // e realizar a validação
    });

    // Adicionar evento de clique ao botão "Apagar"
    document.getElementById("botao-apagar").addEventListener("click", function() {
        const senha = senhaDigitada.textContent;
        senhaDigitada.textContent = senha.slice(0, -1);
        labelSenha.textContent = "Senha digitada (" + senhaDigitada.textContent.length + "/4):";
    });
});
