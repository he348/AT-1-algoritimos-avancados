let senha = '';
let numerosDisponiveis = Array.from({ length: 10 }, (_, index) => index);

function adicionarNumero(buttonIndex) {
  if (senha.length < 4) {
    const numero = gerarNumeroUnico();

    if (numero !== undefined) {
      senha += numero;
      atualizarCampoSenha();
      atualizarNumerosAleatorios(buttonIndex);
    }
  }
}

function gerarNumeroUnico() {
  if (numerosDisponiveis.length > 0) {
    const numeroIndex = Math.floor(Math.random() * numerosDisponiveis.length);
    const numero = numerosDisponiveis.splice(numeroIndex, 1)[0];
    return numero;
  } else {
    return undefined; // Retorna undefined se não houver mais números disponíveis
  }
}

function atualizarNumerosAleatorios(buttonIndex) {
  const button = document.getElementById(`senha-button-${buttonIndex}`);
  const numero1 = gerarNumeroUnico();
  const numero2 = gerarNumeroUnico();

  if (numero1 !== undefined && numero2 !== undefined) {
    button.setAttribute('data-numero1', numero1);
    button.setAttribute('data-numero2', numero2);
    button.innerHTML = `${numero1} ou ${numero2}`;
  }
}

function apagarSenha() {
  senha = '';
  numerosDisponiveis = Array.from({ length: 10 }, (_, index) => index);
  atualizarCampoSenha();
  atualizarNumerosAleatoriosTodos();
}

function enviarForm() {
  const usuario = document.getElementById('usuario').value;

  console.log('Usuário:', usuario);
  console.log('Senha:', senha);

  // Adicione aqui a lógica de envio para o servidor e tratamento da resposta
  // Ex: fetch('/login', { method: 'POST', body: JSON.stringify({ usuario, senha }), headers: { 'Content-Type': 'application/json' } })
  //    .then(response => response.json())
  //    .then(data => console.log(data))
  //    .catch(error => console.error(error));
}

function atualizarCampoSenha() {
  document.getElementById('senha').value = senha;
}

function espiarSenha() {
  const senhaInput = document.getElementById('senha');
  senhaInput.type = 'text';
}

function esconderSenha() {
  const senhaInput = document.getElementById('senha');
  senhaInput.type = 'password';
}

function atualizarNumerosAleatoriosTodos() {
  for (let i = 0; i < 5; i++) {
    atualizarNumerosAleatorios(i);
  }
}

// Inicializa os números aleatórios nos botões ao carregar a página
atualizarNumerosAleatoriosTodos();
