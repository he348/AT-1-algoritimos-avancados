document.addEventListener("DOMContentLoaded", function() {
    const usernameInput = document.getElementById("username");
    const acessarButton = document.getElementById("botao-acessar-username");

    // Função para verificar se o username não está vazio e desabilitar o botão de acessar se estiver vazio
    function verificarUsername() {
        const username = usernameInput.value.trim(); // Remove espaços em branco extras
        if (username.length === 0 || !usernameValido(username)) {
            acessarButton.disabled = true; // Desabilita o botão se o campo estiver vazio ou se o valor não for válido
        } else {
            acessarButton.disabled = false; // Habilita o botão se o campo estiver preenchido e o valor for válido
        }
    }

    // Verificar se o username é válido (por exemplo, não contém caracteres especiais)
    function usernameValido(username) {
        // Aqui você pode adicionar a lógica para validar o formato do username
        // Por exemplo, verificar se contém apenas letras e números
        // Neste exemplo simples, vamos apenas verificar se o username contém pelo menos um caractere alfanumérico
        return /[a-zA-Z0-9]/.test(username);
    }

    // Chama a função verificarUsername sempre que o usuário digitar algo no campo de username
    usernameInput.addEventListener("input", verificarUsername);

    document.getElementById("botao-acessar-username").addEventListener("click", function() {
        const username = usernameInput.value.trim(); // Remove espaços em branco extras
        if (username.length === 0 || !usernameValido(username)) {
            alert("Insira um username válido");
        } else {
            // Verificar se o usuário existe no banco de dados
            fetch(`/verificar-usuario?username=${username}`)
                .then(response => {
                    if (response.ok) {
                        // Se o usuário existe, redirecionar para a tela de inserção de senha com o username na URL
                        window.location.href = `/senha.html?username=${username}`;
                    } else {
                        // Se o usuário não existe, exibir uma mensagem de erro
                        alert("Usuário não encontrado");
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                });
        }
    });

    // Verificar o username quando a página é carregada
    verificarUsername();
});
