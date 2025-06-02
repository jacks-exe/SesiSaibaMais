//script.js

const API_URL = 'http://localhost:3000';

window.onload = () => {
  verificarSessao();
};

async function login() {
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('password').value.trim();

  if (!email || !senha) {
    alert('Preencha email e senha');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    if (!res.ok) throw new Error('Credenciais inválidas');

    const data = await res.json();
    localStorage.setItem('usuario', JSON.stringify(data.user));
    mostrarApp(data.user);
  } catch (err) {
    alert(err.message);
  }
}

function verificarSessao() {
  const userStr = localStorage.getItem('usuario');
  if (userStr) {
    const user = JSON.parse(userStr);
    mostrarApp(user);
  } else {
    mostrarLogin();
  }
}

function mostrarLogin() {
  document.getElementById('login-container').style.display = 'block';
  document.getElementById('app').style.display = 'none';
}

function mostrarApp(user) {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('user-name').innerText = user.nome;
  carregarDashboard();
}

function logout() {
  localStorage.removeItem('usuario');
  mostrarLogin();
}

// Carregar dashboard com matérias
async function carregarDashboard() {
  const content = document.getElementById('content');
  content.innerHTML = '<h2>Matérias do 2º Trimestre</h2>';

  try {
    const res = await fetch(`${API_URL}/materias`);
    const materias = await res.json();

    materias.forEach((m) => {
      const card = document.createElement('div');
      card.className = 'materia-card';
      card.innerText = m.nome;
      card.onclick = () => carregarMateria(m.id, m.nome);
      content.appendChild(card);
    });
  } catch (err) {
    content.innerText = 'Erro ao carregar matérias.';
  }
}

// Carregar página da matéria com atividades
async function carregarMateria(id, nome) {
  const content = document.getElementById('content');
  content.innerHTML = `<h2>${nome}</h2><button onclick="carregarDashboard()">Voltar</button><div id="atividades"></div>`;

  try {
    const res = await fetch(`${API_URL}/materias/${id}/atividades`);
    const atividades = await res.json();

    const atividadesDiv = document.getElementById('atividades');

    if (atividades.length === 0) {
      atividadesDiv.innerText = 'Nenhuma atividade cadastrada.';
      return;
    }

    atividades.forEach((a) => {
      const item = document.createElement('div');
      item.style.background = '#f0f6ff';
      item.style.borderRadius = '12px';
      item.style.border = '1px solid #e5e7eb';
      item.style.marginBottom = '1rem';
      item.style.padding = '1rem 1.2rem';
      item.style.color = '#222';
      item.style.boxShadow = '0 2px 8px rgba(59,130,246,0.04)';
      item.innerHTML = `<strong style="color:#000081;">${a.titulo || 'Atividade'}</strong><p>${a.descricao}</p>`;
      atividadesDiv.appendChild(item);
    });
  } catch (err) {
    content.innerText = 'Erro ao carregar atividades.';
  }
}
