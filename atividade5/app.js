const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Rota para o formulário
app.get('/', (req, res) => {
    res.render('index', { error: false });
});

// Rota para receber os dados do formulário
app.post('/dados', (req, res) => {
    const { nome, endereco, telefone, data } = req.body;

    if (!nome || !endereco || !telefone || !data) {
        return res.render('index', { error: true });
    }

    res.render('dados', { nome, endereco, telefone, data });
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});