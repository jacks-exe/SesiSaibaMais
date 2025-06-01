const express = require('express');
const cors = require('cors');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Servir frontend (ajuste o caminho conforme sua estrutura)
app.use(express.static(path.join(__dirname, '../frontend')));

// Servir uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota raiz serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const users = [
  { id: 1, email: 'prof@sesi.com', password: '1234', role: 'professor' },
  { id: 2, email: 'aln@sesi.com', password: '1234', role: 'aluno' }
];

const materiasFilePath = path.join(__dirname, 'materias.json');
let materias = [];

function loadMaterias() {
  try {
    const data = fs.readFileSync(materiasFilePath, 'utf8');
    materias = JSON.parse(data);
    console.log(chalk.green('Dados carregados de materias.json'));
  } catch (err) {
    console.error(chalk.red('Erro ao carregar materias.json:'), err);
    materias = [];
  }
}

function saveMaterias() {
  try {
    fs.writeFileSync(materiasFilePath, JSON.stringify(materias, null, 2));
    console.log(chalk.green('Dados salvos em materias.json'));
  } catch (err) {
    console.error(chalk.red('Erro ao salvar materias.json:'), err);
  }
}

loadMaterias();

app.get('/', (req, res) => {
  res.send('Servidor rodando, mas aqui não tem página HTML.');
});

app.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
      console.warn(chalk.yellow(`Tentativa de login falhou: Email incorreto (${email})`));
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (user.password !== password) {
      console.warn(chalk.red(`Senha incorreta para ${email}.
Senha correta: ${user.password}.
Senha tentada: ${password}`));
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log(chalk.green(`Login bem-sucedido para ${email}`));
    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    console.error(chalk.red('Erro no login:'), error.message);
    res.status(500).json({ error: 'Erro interno ao realizar login' });
  }
});


app.get('/materias', (req, res) => {
  res.json(materias);
});

app.post('/materias', (req, res) => {
  const { nome, role } = req.body;
  if (role !== 'professor') {
    console.error(chalk.red(`Acesso negado: Usuário com role '${role}' tentou criar uma matéria.`));
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (!nome) {
    console.error(chalk.red('Erro ao criar matéria: Nome da matéria não fornecido.'));
    return res.status(400).json({ error: 'Nome da matéria obrigatório' });
  }

  const novaMateria = {
    id: materias.length + 1,
    nome,
    atividades: []
  };
  materias.push(novaMateria);
  saveMaterias();

  res.json(novaMateria);
});

app.get('/materias/:id/atividades', (req, res) => {
  const materia = materias.find(m => m.id == req.params.id);
  if (!materia) return res.status(404).json({ error: 'Matéria não encontrada' });
  res.json(materia.atividades);
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Aqui mantém o nome original do arquivo:
    // cb(null, file.originalname);
    
    // Se quiser adicionar timestamp para evitar conflito, pode usar:
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, baseName + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage: storage });


app.post('/materias/:id/atividades', upload.single('arquivo'), (req, res) => {
  try {
    const { titulo, descricao, dataPostada, dataDisponivelAte, valeNota, nota, links } = req.body;
    const materiaId = req.params.id;
    const materia = materias.find(m => m.id == materiaId);

    if (!materia) {
      return res.status(404).json({ error: 'Matéria não encontrada' });
    }

    if (!titulo || !descricao || !dataPostada || !dataDisponivelAte) {
      return res.status(400).json({ error: 'Título, descrição, data de postagem e prazo de entrega são obrigatórios' });
    }

    let parsedLinks = [];
    if (links) {
      try {
        parsedLinks = JSON.parse(links);
      } catch {
        parsedLinks = [];
      }
    }

    const novaAtividade = {
      id: materia.atividades.length + 1,
      titulo,
      descricao,
      dataPostada,
      dataDisponivelAte,
      arquivo: req.file ? `/uploads/${req.file.filename}` : '',
      comentarios: [],
      links: parsedLinks,
      valeNota: valeNota === 'true',
      nota: nota !== undefined && nota !== '' ? nota : null
    };

    materia.atividades.push(novaAtividade);
    saveMaterias();

    res.json(novaAtividade);
  } catch (error) {
    console.error('Erro ao adicionar atividade:', error.message);
    res.status(500).json({ error: 'Erro interno ao adicionar atividade' });
  }
});


app.post('/materias/:materiaId/atividades/:atividadeId/comentarios', (req, res) => {
  const { comentario } = req.body;

  const materia = materias.find(m => m.id == req.params.materiaId);
  if (!materia) return res.status(404).json({ error: 'Matéria não encontrada' });

  const atividade = materia.atividades.find(a => a.id == req.params.atividadeId);
  if (!atividade) return res.status(404).json({ error: 'Atividade não encontrada' });

  atividade.comentarios.push(comentario);
  saveMaterias();

  res.json({ sucesso: true, comentario });
});

app.delete('/materias/:materiaId/atividades/:atividadeId', (req, res) => {
  try {
    const { materiaId, atividadeId } = req.params;
    const { senha } = req.body;

    // Simula autenticação com senha
    const user = users.find(u => u.role === 'professor');
    if (!user || user.password !== senha) {
      console.error(chalk.red('Erro ao excluir atividade: Senha incorreta.'));
      return res.status(403).json({ error: 'Senha incorreta' });
    }

    const materia = materias.find(m => m.id == materiaId);
    if (!materia) {
      console.error(chalk.red(`Erro ao excluir atividade: Matéria com id ${materiaId} não encontrada.`));
      return res.status(404).json({ error: 'Matéria não encontrada' });
    }

    const atividadeIndex = materia.atividades.findIndex(a => a.id == atividadeId);
    if (atividadeIndex === -1) {
      console.error(chalk.red(`Erro ao excluir atividade: Atividade com id ${atividadeId} não encontrada.`));
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }

    materia.atividades.splice(atividadeIndex, 1);
    saveMaterias();

    console.log(chalk.green(`Atividade com id ${atividadeId} excluída com sucesso da matéria ${materia.nome}.`));
    res.json({ success: true, message: 'Atividade excluída com sucesso' });
  } catch (error) {
    console.error(chalk.red('Erro ao excluir atividade:'), error.message);
    res.status(500).json({ error: 'Erro interno ao excluir atividade' });
  }
});

app.listen(PORT, () => {
  console.log(chalk.cyan(`\nServidor rodando na porta ${PORT}`));
  console.log(`Acesse http://localhost:${PORT}`);
  console.log(chalk.green(`\n=========================`));
});
