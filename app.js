document.addEventListener("DOMContentLoaded", function() {
    const teclado = document.getElementById("teclado");
    const labelSenha = document.getElementById("label-senha");
    const senhaDigitada = document.getElementById("senha-digitada");
    const senhaDigitadaInput = document.getElementById("senha-digitada-input");
    const usernameInput = document.getElementById("username");

    function gerarParesAleatorios() {
        let numerosDisponiveis = Array.from({length: 10}, (_, i) => i);
        let pares = [];
        
        while (pares.length < 5) {
            let num1 = numerosDisponiveis.splice(Math.floor(Math.random() * numerosDisponiveis.length), 1)[0];
            let num2 = numerosDisponiveis.splice(Math.floor(Math.random() * numerosDisponiveis.length), 1)[0];
            
            while (num2 === num1) {
                numerosDisponiveis.push(num2);
                num2 = numerosDisponiveis.splice(Math.floor(Math.random() * numerosDisponiveis.length), 1)[0];
            }
            
            pares.push(`${num1} ou ${num2}`);
        }
        
        return pares;
    }

    const paresAleatorios = gerarParesAleatorios();

    paresAleatorios.forEach(function(par) {
        const botao = document.createElement("button");
        botao.className = "botao-numero";
        botao.textContent = par;
        botao.addEventListener("click", function() {
            const numeros = par.split(" ou ");
            const numeroSelecionado = numeros[Math.floor(Math.random() * 2)];
            if (senhaDigitadaInput.value.length < 4) { // Limitando a 4 caracteres
                senhaDigitadaInput.value += numeroSelecionado;
                senhaDigitada.value += "*"; // Exibindo asterisco
            }
            labelSenha.textContent = "Senha digitada (" + senhaDigitadaInput.value.length + "/4):";
        });
        teclado.appendChild(botao);
    });

    document.getElementById("botao-acessar").addEventListener("click", function() {
        const senha = senhaDigitadaInput.value;
        const username = usernameInput.value;
        console.log("Usuário:", username);
        console.log("Senha:", senha);
        if (username.length === 0 || senha.length !== 4) {
            alert("Preencher username ou senha");
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
        labelSenha.textContent = "Senha digitada (" + senhaDigitadaInput.value.length + "/4):";
    });
});
