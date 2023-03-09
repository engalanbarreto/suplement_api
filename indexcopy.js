const express = require('express');
const session = require('express-session')
const cors = require('cors')


const app = express();

const PORT = process.env.PORT || 3030;

//Para usar arquivos estáticos de css, js, img, etc
app.use(express.static('public'));

//Usar back e front na mesma porta
app.use(cors());

app.use(express.json())

//Midleware para jogar os arquivos passados nos inputs na rota post 
app.use(express.urlencoded({ extended: false }));

//Importar model Usuario
const Usuario = require('./models/Usuario');

//Configuração das sessões
app.use(session({
    secret: 'CriarUmaChaveSecretaQualquer',
    resave: false,
    saveUninitialized: true
}));

//CONFIGURAÇÃO DE ROTAS
app.get('/', (req, res) => {
    res.send('Hello word')
    // res.render('index', { NavActiveHome: true });
});

app.get('/login', (req, res) => {
    res.render('login', { NavActiveLogin: true });
});

app.get('/cadastro', (req, res) => {
    if (req.session.errors) {
        let arrayErros = req.session.errors;
        req.session.errors = '';
        return res.render('cadastro', { NavActiveCad: true, error: arrayErros });
    };
    if (req.session.success) {
        req.session.success = false;
        return res.render('cadastro', { NavActiveCad: true, MsgSuccess: true });
    };
    res.render('cadastro', { NavActiveCad: true });
});

app.post('/cad', (req, res) => {
    // Valores vindo do formulário
    let nome = req.body.nome; // requisição de um formulario no corpo com o nome indicado
    let email = req.body.email;
    let senha = req.body.senha;

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
        return res.redirect('/cadastro')
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
        return res.redirect('/cadastro');
    }).catch((erro) => {
        console.log(`Houve um erro: ${erro}`);
    });
});

app.get('/users', (req, res) => {
    // Metodo finAll do sequelize que é pra buscar todos os dados da tabela passada
    // o map é para mapear os valores em um objeto e simplificar
    Usuario.findAll().then((valores) => {
        if (valores.length > 0) {
            return res.render('users', { usuarios: valores.map(valores => valores.toJSON()) });
        } else {
            res.render('users', { NavActiveUsers: true, table: false });
        }
    }).catch((err) => {
        console.log(`Houve um erro: ${err}`);
    });
});

app.post('/edit', (req, res) => {
    //Aqui eu busco o campo id criado na tabela na rota /user e jogo em uma variavel 
    let id = req.body.id;
    // Aqui eu uso o metodo findByPk que realiza a consulta
    //de um usuario pelo id passado e retorna os dados
    Usuario.findByPk(id).then((dados) => {
        // Aqui eu retorno a renderização do arquivo editar.hbs a partir do 
        // callback then retornando válido
        // e retornando um json com o erro:false e os dados
        return res.render('editar', { erro: false, id: dados.id, nome: dados.nome, email: dados.email });
    }).catch((err) => {
        console.log(err);
        //Aqui, se o callback der errado
        // renderizo a página e retorno o json com o erro:true ew o problema
        return res.render('editar', { erro: true, problema: 'Não foi possível editar.' });
    });
});

app.post('/updateuser', (req, res) => {
    // Valores vindo do formulário
    let nome = req.body.nome; // requisição de um formulario no corpo com o nome indicado
    let email = req.body.email;

    // Array contendo os erros
    const erros = [];

    // Limpar o nome de caracteres especiais(Apenas Letras)
    nome = nome.replace(/[^A-zÀ-ú\s]/gi, ''); // Expressões regulares (Estudar depois), que indica que vai substituir o que não for letra por nada.

    // Remover os espaços em brancos
    nome = nome.trim();
    email = email.trim();

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

    if (erros.length > 0) {
        console.log(erros);
        return res.status(400).send({ status: 400, erro: erros });
    };

    //Sucesso nenhum erro
    //Atualizar o registro no BD
    Usuario.update(
        {
            nome: nome,
            email: email.toLowerCase(),
        },
        {
            where: {
                id: req.body.id
            }
        }).then((resultado) => {
            console.log(resultado);
            return res.redirect('/users');
        }).catch((err) => {
            console.log(err);
        });
});

//Deletar o usuario
app.post('/del', (req, res) => {
    Usuario.destroy({
        where: {
            id: req.body.id
        }
    }).then((retorno) => {
        return res.redirect('/users');
    }).catch((err) => {
        console.log(err);
    });
});

// CONFIGURAÇÃO DO SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});