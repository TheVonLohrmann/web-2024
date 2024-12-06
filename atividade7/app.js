const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();

// Middleware para interpretar dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração de sessão
app.use(
    session({
        secret: 'chave-secreta', // Substitua por uma chave segura
        resave: false,
        saveUninitialized: false,
    })
);

// Configurar diretório de arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configurar views e EJS como template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Dados em memória para usuários e mensagens
let users = [];
let messages = [];

// Rota principal
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

// Cadastro de usuário
app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Validação simples
    if (!username || !password) {
        return res.render('register', { error: 'Todos os campos são obrigatórios!' });
    }

    // Verifica se o usuário já existe
    if (users.some((user) => user.username === username)) {
        return res.render('register', { error: 'Usuário já cadastrado!' });
    }

    users.push({ username, password });
    res.redirect('/login');
});

// Login
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
        return res.render('login', { error: 'Usuário ou senha inválidos!' });
    }

    req.session.user = user;
    res.redirect('/');
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Middleware para verificar autenticação
function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// Cadastro de mensagens
app.get('/mural', isAuthenticated, (req, res) => {
    res.render('mural', { messages, user: req.session.user });
});

app.post('/mural', isAuthenticated, (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.render('mural', {
            messages,
            user: req.session.user,
            error: 'Todos os campos são obrigatórios!',
        });
    }

    messages.push({ id: messages.length + 1, title, content, author: req.session.user.username });
    res.redirect('/mural');
});

// Visualização de mensagem detalhada
app.get('/mensagem/:id', isAuthenticated, (req, res) => {
    const message = messages.find((msg) => msg.id == req.params.id);

    if (!message) {
        return res.status(404).send('Mensagem não encontrada');
    }

    res.render('mensagem', { message, user: req.session.user });
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
