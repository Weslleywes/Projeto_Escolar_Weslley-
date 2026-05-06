/* ================================================================
   RS Treinamento & Consultoria — Sistema Escolar ADS
   Arquivo : js/app.js
   Função  : Toda a lógica JavaScript do sistema.

   Como usar em cada HTML (antes do </body>):
     <script src="js/app.js"></script>

   Organização deste arquivo:
     1. Configurações globais (constantes e chaves)
     2. Funções de login.html
     3. Funções de usuario.html
     4. Funções de curso.html
     5. Funções de aluno.html
     6. Funções auxiliares (compartilhadas por todas as páginas)
     7. Inicialização (roda automaticamente ao carregar a página)
================================================================ */


/* ================================================================
   1. CONFIGURAÇÕES GLOBAIS
================================================================ */

// Usuário administrador padrão — existe antes de qualquer cadastro
const ADMIN_LOGIN = 'adm';
const ADMIN_SENHA = '123';

// Chaves do localStorage — centralizadas para evitar erros de digitação
const CHAVE_USUARIOS = 'usuarios'; // array de usuários cadastrados
const CHAVE_SESSAO   = 'sessao';   // objeto do usuário logado
const CHAVE_CURSOS   = 'cursos';   // array de cursos cadastrados
const CHAVE_ALUNOS   = 'alunos';   // array de alunos cadastrados


/* ================================================================
   2. FUNÇÕES DE login.html
================================================================ */

// ----------------------------------------------------------------
// FUNÇÃO: fazerLogin()
// Chamada pelo botão "Entrar" do login.html
// ----------------------------------------------------------------
function fazerLogin() {

  const login = document.getElementById('inp-login').value.trim();
  const senha = document.getElementById('inp-senha').value.trim();

  if (!login || !senha) {
    mostrarErro('erro', 'Preencha o login e a senha para continuar.');
    return;
  }

  // Verifica se é o administrador padrão do sistema
  if (login === ADMIN_LOGIN && senha === ADMIN_SENHA) {
    salvarSessaoEEntrar({ nome: 'Administrador', login: ADMIN_LOGIN });
    return;
  }

  // Busca o usuário na lista salva no localStorage
  const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || '[]');

  const encontrado = usuarios.find(
    function(u) { return u.login === login && u.senha === senha; }
  );

  if (encontrado) {
    salvarSessaoEEntrar(encontrado);
  } else {
    mostrarErro('erro', 'Usuário ou senha incorretos.');
  }
}

// ----------------------------------------------------------------
// FUNÇÃO: salvarSessaoEEntrar(usuario)
// Salva sessão no localStorage e redireciona para aluno.html
// ----------------------------------------------------------------
function salvarSessaoEEntrar(usuario) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify({
    nome:  usuario.nome,
    login: usuario.login
  }));
  window.location.href = 'aluno.html';
}

// ----------------------------------------------------------------
// FUNÇÃO: cancelarLogin()
// Limpa os campos — botão "Cancelar" do login.html
// ----------------------------------------------------------------
function cancelarLogin() {
  document.getElementById('inp-login').value = '';
  document.getElementById('inp-senha').value = '';
  esconderErro('erro');
}


/* ================================================================
   3. FUNÇÕES DE usuario.html
================================================================ */

// ----------------------------------------------------------------
// FUNÇÃO: cadastrar()
// Valida, salva o novo usuário e redireciona para login
// ----------------------------------------------------------------
function cadastrar() {

  const nome  = document.getElementById('inp-nome').value.trim();
  const login = document.getElementById('inp-login').value.trim();
  const senha = document.getElementById('inp-senha').value.trim();

  if (!nome || !login || !senha) {
    mostrarErro('erro', 'Preencha todos os campos antes de continuar.');
    return;
  }

  if (senha.length < 3) {
    mostrarErro('erro', 'A senha precisa ter pelo menos 3 caracteres.');
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || '[]');

  const loginJaExiste = usuarios.some(
    function(u) { return u.login.toLowerCase() === login.toLowerCase(); }
  );

  if (loginJaExiste) {
    mostrarErro('erro', 'Este login já está em uso. Escolha outro.');
    return;
  }

  usuarios.push({ nome: nome, login: login, senha: senha });
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));

  esconderErro('erro');
  mostrarAlerta('sucesso');

  setTimeout(function() {
    window.location.href = 'login.html';
  }, 2000);
}


/* ================================================================
   4. FUNÇÕES DE curso.html
================================================================ */

// ----------------------------------------------------------------
// FUNÇÃO: salvarCurso()
// Lê o campo, valida, salva no localStorage e atualiza a lista
// ----------------------------------------------------------------
function salvarCurso() {

  const nome = document.getElementById('inp-curso').value.trim();

  if (!nome) {
    mostrarErro('erro', 'Digite o nome do curso antes de salvar.');
    return;
  }

  const cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS) || '[]');

  const jaExiste = cursos.some(
    function(c) { return c.nome.toLowerCase() === nome.toLowerCase(); }
  );

  if (jaExiste) {
    mostrarErro('erro', 'Já existe um curso com este nome.');
    return;
  }

  // Gera sigla automaticamente pelas iniciais das palavras maiores que 2 letras
  // Exemplo: "Análise e Desenvolvimento de Sistemas" → "ADS"
  const sigla = nome
    .split(' ')
    .filter(function(palavra) { return palavra.length > 2; })
    .map(function(palavra) { return palavra[0].toUpperCase(); })
    .join('') || nome.slice(0, 2).toUpperCase();

  // Date.now() = milissegundos desde 01/01/1970 — gera id único sem banco
  const novoCurso = {
    id:    Date.now(),
    nome:  nome,
    sigla: sigla,
    ativo: true
  };

  cursos.push(novoCurso);
  localStorage.setItem(CHAVE_CURSOS, JSON.stringify(cursos));

  document.getElementById('inp-curso').value = '';
  esconderErro('erro');
  mostrarAlerta('sucesso');

  renderizarCursos();

  setTimeout(function() { esconderAlerta('sucesso'); }, 2000);
}

// ----------------------------------------------------------------
// FUNÇÃO: renderizarCursos()
// Lê os cursos do localStorage e desenha a lista na tela
// ----------------------------------------------------------------
function renderizarCursos() {

  const lista  = document.getElementById('lista-cursos');
  const cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS) || '[]');

  if (cursos.length === 0) {
    lista.innerHTML = '<p class="lista-vazia">Nenhum curso cadastrado ainda.</p>';
    return;
  }

  lista.innerHTML = cursos.map(function(curso) {
    return (
      '<div class="list-item">' +
        '<div class="list-avatar av-curso">' + curso.sigla + '</div>' +
        '<div class="list-info">' +
          '<div class="list-nome">' + curso.nome + '</div>' +
          '<div class="list-sub">sigla: ' + curso.sigla + '</div>' +
        '</div>' +
        '<span class="tag">ativo</span>' +
      '</div>'
    );
  }).join('');
}


/* ================================================================
   5. FUNÇÕES DE aluno.html
================================================================ */

// ----------------------------------------------------------------
// FUNÇÃO: salvarAluno()
// Lê os campos, valida, salva no localStorage e atualiza a lista
// ----------------------------------------------------------------
function salvarAluno() {

  const nome     = document.getElementById('inp-nome').value.trim();
  const telefone = document.getElementById('inp-telefone').value.trim();
  const email    = document.getElementById('inp-email').value.trim();
  const cursoId  = document.getElementById('sel-curso').value;

  if (!nome || !email || !cursoId) {
    mostrarErro('erro', 'Nome, e-mail e curso são obrigatórios.');
    return;
  }

  if (!email.includes('@')) {
    mostrarErro('erro', 'Digite um e-mail válido.');
    return;
  }

  const alunos = JSON.parse(localStorage.getItem(CHAVE_ALUNOS) || '[]');

  const emailJaExiste = alunos.some(
    function(a) { return a.email.toLowerCase() === email.toLowerCase(); }
  );

  if (emailJaExiste) {
    mostrarErro('erro', 'Já existe um aluno cadastrado com este e-mail.');
    return;
  }

  // Busca o nome do curso pelo id para salvar junto com o aluno
  const cursos    = JSON.parse(localStorage.getItem(CHAVE_CURSOS) || '[]');
  const cursoObj  = cursos.find(function(c) { return String(c.id) === String(cursoId); });
  const cursoNome = cursoObj ? cursoObj.nome : 'Curso não encontrado';

  const novoAluno = {
    id:       Date.now(),
    nome:     nome,
    telefone: telefone,
    email:    email,
    cursoId:  cursoId,
    curso:    cursoNome
  };

  alunos.push(novoAluno);
  localStorage.setItem(CHAVE_ALUNOS, JSON.stringify(alunos));

  document.getElementById('inp-nome').value     = '';
  document.getElementById('inp-telefone').value = '';
  document.getElementById('inp-email').value    = '';
  document.getElementById('sel-curso').value    = '';

  esconderErro('erro');
  mostrarAlerta('sucesso');

  renderizarAlunos();

  setTimeout(function() { esconderAlerta('sucesso'); }, 2000);
}

// ----------------------------------------------------------------
// FUNÇÃO: renderizarAlunos()
// Lê os alunos do localStorage e desenha a lista na tela
// ----------------------------------------------------------------
function renderizarAlunos() {

  const lista  = document.getElementById('lista-alunos');
  const alunos = JSON.parse(localStorage.getItem(CHAVE_ALUNOS) || '[]');

  if (alunos.length === 0) {
    lista.innerHTML = '<p class="lista-vazia">Nenhum aluno cadastrado ainda.</p>';
    return;
  }

  lista.innerHTML = alunos.map(function(aluno) {
    // Gera iniciais do nome para o avatar — ex: "João Silva" → "JS"
    const iniciais = aluno.nome
      .split(' ')
      .filter(function(p) { return p.length > 0; })
      .slice(0, 2)
      .map(function(p) { return p[0].toUpperCase(); })
      .join('');

    return (
      '<div class="list-item">' +
        '<div class="list-avatar av-aluno">' + iniciais + '</div>' +
        '<div class="list-info">' +
          '<div class="list-nome">' + aluno.nome + '</div>' +
          '<div class="list-sub">' + aluno.email + ' · ' + aluno.curso + '</div>' +
        '</div>' +
        '<span class="tag">ativo</span>' +
      '</div>'
    );
  }).join('');
}

// ----------------------------------------------------------------
// FUNÇÃO: carregarCursosNoSelect()
// Preenche o <select> de cursos na tela aluno.html
// ----------------------------------------------------------------
function carregarCursosNoSelect() {

  const select = document.getElementById('sel-curso');

  // Se o elemento não existir na página, sai da função
  if (!select) return;

  const cursos = JSON.parse(localStorage.getItem(CHAVE_CURSOS) || '[]');

  // Reseta o select mantendo só o placeholder
  select.innerHTML = '<option value="">Selecione o curso...</option>';

  if (cursos.length === 0) {
    // Avisa o usuário que precisa cadastrar cursos antes
    const aviso = document.createElement('option');
    aviso.disabled   = true;
    aviso.textContent = 'Nenhum curso cadastrado ainda';
    select.appendChild(aviso);
    return;
  }

  // Cria uma <option> para cada curso salvo no localStorage
  cursos.forEach(function(curso) {
    const opcao       = document.createElement('option');
    opcao.value       = String(curso.id); // garante que o value é string
    opcao.textContent = curso.nome;
    select.appendChild(opcao);
  });
}

// ----------------------------------------------------------------
// FUNÇÃO: fazerLogout()
// Remove a sessão e volta para o login — botão "Sair"
// ----------------------------------------------------------------
function fazerLogout() {
  // Remove apenas a sessão — os dados (cursos, alunos) permanecem
  localStorage.removeItem(CHAVE_SESSAO);
  window.location.href = 'login.html';
}


/* ================================================================
   6. FUNÇÕES AUXILIARES
   Usadas por todas as páginas do sistema
================================================================ */

// Exibe a caixa vermelha de erro
function mostrarErro(idElemento, mensagem) {
  const ok = document.getElementById('sucesso');
  if (ok) ok.style.display = 'none';
  const caixa = document.getElementById(idElemento);
  if (!caixa) return;
  caixa.textContent   = mensagem;
  caixa.style.display = 'block';
}

// Oculta a caixa de erro
function esconderErro(idElemento) {
  const caixa = document.getElementById(idElemento);
  if (caixa) caixa.style.display = 'none';
}

// Exibe a caixa verde de sucesso
function mostrarAlerta(idElemento) {
  const caixa = document.getElementById(idElemento);
  if (caixa) caixa.style.display = 'block';
}

// Oculta a caixa de sucesso
function esconderAlerta(idElemento) {
  const caixa = document.getElementById(idElemento);
  if (caixa) caixa.style.display = 'none';
}


/* ================================================================
   7. INICIALIZAÇÃO
   Roda automaticamente quando a página termina de carregar.

   CORREÇÃO: usa window.location.href.split('/').pop()
   para pegar só o nome do arquivo (ex: "aluno.html"),
   evitando problemas com caminhos absolutos do Live Server no Mac.
================================================================ */

window.addEventListener('load', function() {

  // Pega apenas o nome do arquivo da URL atual
  // Exemplo: "http://127.0.0.1:5500/sistema-escola/aluno.html"
  // .split('/') → ["http:", "", "127.0.0.1:5500", "sistema-escola", "aluno.html"]
  // .pop()      → "aluno.html"  (último elemento do array)
  // .split('?')[0] → remove parâmetros de URL se houver
  const pagina = window.location.href.split('/').pop().split('?')[0];

  // ── index.html ou raiz → redireciona para o login ──
  if (pagina === 'index.html' || pagina === '') {
    window.location.href = 'login.html';
    return;
  }

  // ── login.html → se já logado, vai direto para alunos ──
  if (pagina === 'login.html') {
    if (localStorage.getItem(CHAVE_SESSAO)) {
      window.location.href = 'aluno.html';
    }
    return;
  }

  // ── usuario.html → página pública, não exige sessão ──
  if (pagina === 'usuario.html') {
    return;
  }

  // ── demais páginas → protegidas, exigem sessão ──
  if (!localStorage.getItem(CHAVE_SESSAO)) {
    window.location.href = 'login.html';
    return;
  }

  // ── aluno.html → carrega select e lista ──
  if (pagina === 'aluno.html') {
    carregarCursosNoSelect();
    renderizarAlunos();
  }

  // ── curso.html → carrega lista de cursos ──
  if (pagina === 'curso.html') {
    renderizarCursos();
  }

});