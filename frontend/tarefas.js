// tarefas.js

let materias = JSON.parse(localStorage.getItem('materias')) || [];
let materiaSelecionada = localStorage.getItem('materiaSelecionada');

const usuarioStr = localStorage.getItem('usuario');
if (!usuarioStr) {
  alert('Você precisa estar logado para acessar as tarefas.');
  window.location.href = 'index.html';
}

function listarTarefas() {
  if (materiaSelecionada === null) {
    alert('Nenhuma matéria selecionada!');
    window.location.href = 'index.html';
    return;
  }

  materiaSelecionada = parseInt(materiaSelecionada);
  const materia = materias[materiaSelecionada];

  const lista = document.getElementById('listaTarefas');
  if (!lista) return;

  lista.innerHTML = `<h3>${materia.nome}</h3>`;
  if (materia.tarefas.length === 0) {
    lista.innerHTML += `<div style="color:#888;">Nenhuma tarefa cadastrada.</div>`;
    return;
  }
  materia.tarefas.forEach((t, i) => {
    lista.innerHTML += `
      <div style="
        background:#f0f6ff;
        border-radius:12px;
        border:1px solid #e5e7eb;
        margin-bottom:1rem;
        padding:1rem 1.2rem;
        color:#222;
        box-shadow:0 2px 8px rgba(59,130,246,0.04);
      ">
        <b style="color:#000081;">${t.titulo}</b>
        <div style="margin-top:0.5rem;">${t.descricao}</div>
      </div>
    `;
  });
}

function adicionarTarefa(titulo, descricao) {
  if(!titulo || !descricao) {
    alert('Preencha título e descrição da tarefa');
    return;
  }

  materiaSelecionada = parseInt(materiaSelecionada);
  materias[materiaSelecionada].tarefas.push({ titulo, descricao });
  localStorage.setItem('materias', JSON.stringify(materias));
  listarTarefas();
}

// Executa ao abrir a página da matéria
window.onload = () => {
  listarTarefas();
};
