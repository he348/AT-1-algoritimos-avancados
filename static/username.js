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
        // Verificar se o username contém pelo menos um caractere alfanumérico
        return /[a-zA-Z0-9]/.test(username);
    }


    // Chama a função verificarUsername sempre que o usuário digitar algo no campo de username
    usernameInput.addEventListener("input", verificarUsername);

    document.getElementById("botao-acessar-username").addEventListener("click", function() {
        const username = usernameInput.value.trim(); // Remove espaços em branco extras
        if (username.length === 0 || !usernameValido(username)) {
            console.log("Username inválido:", username);
            alert("Insira um username válido");
        } else {
            // Verificar se o usuário existe no banco de dados
            fetch(`/verificar-usuario?username=${username}`)
                .then(response => {
                    if (response.ok) {
                        console.log("Usuário encontrado:", username);
                        // Se o usuário existe, redirecionar para a rota /gerar-session-token para gerar o token de sessão
                        fetch(`/gerar-session-token?username=${username}`)
                            .then(response => response.json())
                            .then(data => {
                                // Após obter o token de sessão
                                const sessionToken = data.sessionToken;
                                console.log('Token de sessão recebido:', sessionToken);
                                // Salva o token de sessão no localStorage
                                localStorage.setItem('sessionToken', sessionToken);
                                // Redireciona para a página senha.html incluindo o sessionToken na URL
                                window.location.href = `/senha.html?username=${username}&sessionToken=${sessionToken}`;
                            })
                            .catch(error => {
                                console.error('Erro ao gerar o token de sessão:', error);
                            });
                    } else {
                        console.log("Usuário não encontrado:", username);
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
