const express = require('express');
const session = require('express-session')
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

const Usuario = require('./models/Usuario');

app.use(session({
    secret: 'CriarUmaChaveSecretaQualquer',
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.send('Home')
});

app.get('/users', (req, res) => {
    // Metodo finAll do sequelize que é pra buscar todos os dados da tabela passada
    // o map é para mapear os valores em um objeto e simplificar
    Usuario.findAll().then((valores) => {
        if (valores.length > 0) {
            return res.json(valores.map(valores => valores.toJSON()));
        } else {
            res.json({ message: 'Não existe usuario' });
        }
    }).catch((err) => {
        console.log(`Houve um erro: ${err}`);
    });
});

app.post('/cadusers', (req, res) => {
    // Valores vindo do formulário
    let {nome} = req.body; // requisição de um formulario no corpo com o nome indicado
    let {email} = req.body;
    let {senha} = req.body;

    // Array contendo os erros
    const erros = [];

    // Limpar o nome de caracteres especiais(Apenas Letras)
    nome = nome.replace(/[^A-zÀ-ú\s]/gi, ''); // Expressões regulares (Estudar depois), que indica que vai substituir o que não for letra por nada.

    // Remover os espaços em brancos
    nome = nome.trim();
    email = email.trim();
    senha = senha.trim();

    // verifica se está vazio ou não o campo
    if (nome == '' || typeof nome == undefined || nome == null) {
        erros.push({ mensagem: "Campo nome não pode ser vazio!" });
    };

    // Verifica se o campo nome é válido (Apenas Letras)
    if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
        erros.push({ mensagem: "Nome inválido" })
    }

    // verifica se está vazio ou não o campo
    if (email == '' || typeof email == undefined || email == null) {
        erros.push({ mensagem: "Campo email não pode ser vazio!" });
    };

    // Verificar se o email é válido com expressões regulares regex
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        erros.push({ mensagem: "Campo email inválido!" });
    };

    // verifica se está vazio ou não o campo
    if (senha == '' || typeof senha == undefined || senha == null) {
        erros.push({ mensagem: "Campo senha não pode ser vazio!" });
    };

    if (erros.length > 0) {
        console.log(erros);
        req.session.errors = erros;
        req.session.success = false;
        return res.redirect('/')
    };

    //Sucesso nenhum erro
    console.log('Validação realizado com sucesso');

    //Salvar no banco de dados
    Usuario.create({
        nome: nome,
        email: email.toLowerCase(),//metodo para deixar em minusculo
        senha: senha
    }).then(() => {
        console.log('Cadastrado com sucesso!');
        req.session.success = true;
        return res.redirect('/users');
    }).catch((erro) => {
        console.log(`Houve um erro: ${erro}`);
    });
});

// CONFIGURAÇÃO DO SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor rodando em https://localhost:${PORT}`);
});
