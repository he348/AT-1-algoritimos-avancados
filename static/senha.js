document.addEventListener("DOMContentLoaded", function() {
    const teclado = document.getElementById("teclado");
    const senhaDigitada = document.getElementById("senha-digitada");
    const senhaDigitadaInput = document.getElementById("senha-digitada-input");
    const botaoAcessarSenha = document.getElementById("botao-acessar-senha");
    const username = getUrlParameter("username");

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
    

    buscarSenhaDoUsuario(username)
    .then(senhaDoBancoDeDados => {
        if (!senhaDoBancoDeDados) {
            console.error('Senha do usuário não encontrada');
            return;
        }

        teclado.textContent = "";

        senhaDoBancoDeDados.split('').forEach(digito => {
            const botao = document.createElement("button");
            botao.className = "botao-numero";
            botao.textContent = digito;
            botao.addEventListener("click", function() {
                if (senhaDigitadaInput.value.length < senhaDoBancoDeDados.length) {
                    senhaDigitadaInput.value += digito;
                    senhaDigitada.value += "*";
                }
            });
            teclado.appendChild(botao);
        });
    })
    .catch(error => {
        console.error('Erro ao buscar senha do usuário:', error);
    });

    senhaDigitadaInput.addEventListener("input", function() {
        if (senhaDigitadaInput.value.length === 4) {
            botaoAcessarSenha.disabled = false;
        } else {
            botaoAcessarSenha.disabled = true;
        }
    });

    document.getElementById("botao-apagar").addEventListener("click", function() {
        senhaDigitadaInput.value = senhaDigitadaInput.value.slice(0, -1);
        senhaDigitada.value = senhaDigitada.value.slice(0, -1);
    });
});

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
