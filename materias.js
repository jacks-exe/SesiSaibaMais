// materias.js

const usuarioStr = localStorage.getItem('usuario');
if (!usuarioStr) {
  alert('Você precisa estar logado para acessar as matérias.');
  window.location.href = 'index.html';
}

let materias = JSON.parse(localStorage.getItem('materias')) || [];

if (!localStorage.getItem('materias')) {
  const materiasPadrao = [
    { nome: "DESENVOLVIMENTO DE SISTEMAS", tarefas: [] },
    { nome: "MATEMÁTICA", tarefas: [] },
    { nome: "PORTUGUÊS", tarefas: [] },
    { nome: "FÍSICA", tarefas: [] },
    { nome: "QUÍMICA", tarefas: [] },
    { nome: "BIOLOGIA", tarefas: [] },
    { nome: "HISTÓRIA", tarefas: [] },
    { nome: "GEOGRAFIA", tarefas: [] },
    { nome: "INGLÊS", tarefas: [] },
    { nome: "FILOSOFIA", tarefas: [] },
    { nome: "SOCIOLOGIA", tarefas: [] },
    { nome: "ARTES", tarefas: [] },
    { nome: "ED. FÍSICA", tarefas: [] },
    { nome: "PROJETO DE VIDA", tarefas: [] }
  ];
  localStorage.setItem('materias', JSON.stringify(materiasPadrao));
}

function adicionarMateria(nome) {
  if(!nome) {
    alert('Digite o nome da matéria');
    return;
  }
  materias.push({ nome, tarefas: [] });
  salvarMaterias();
  listarMaterias();
}

function salvarMaterias() {
  localStorage.setItem('materias', JSON.stringify(materias));
}

function listarMaterias() {
  const lista = document.getElementById('listaMaterias');
  if (!lista) return;

  lista.innerHTML = '';
  materias.forEach((m, i) => {
    lista.innerHTML += `
      <div class="materia-card">
        <span>${m.nome}</span>
        <button onclick="abrirMateria(${i})">Abrir</button>
      </div>
    `;
  });
}

function abrirMateria(index) {
  localStorage.setItem('materiaSelecionada', index);
  window.location.href = 'materia.html';
}

// Chama para atualizar lista na página principal
listarMaterias();
