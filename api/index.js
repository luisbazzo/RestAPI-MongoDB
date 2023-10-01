import express from 'express';

const app = express()
const port = 2002
import rotaspratos from './routes/pratos.js'



app.use(express.json()); //irá fazer o parse de arquivos JSON

//Rotas de conteúdo público
app.use('/', express.static('public'));

//Configura o favicon
app.use('/favicon.ico', express.static('public/images/favicon.png'));
app.use('/favicon.ico', express.static('public/images/restaurante.jng'));

//Rotas de API
app.use('api/pratos', rotaspratos)

app.get('/api', (req, res) => {
    res.status(200).json(
        {
            "message": 'API RESTtaurant 🍱🥡 100% funcional',
            "version": '1.0.0'
        }
    )
});

//Rotas de exceção -> deve ser a última!
app.use(function(req, res) {
    res.status(404).json({
        errors: [{
            "value": `${req.originalUrl}`,
            "msg": `A rota ${req.originalUrl} não existe nesta API!`,
            "param": `Invalid route`
        }]
    })
});

app.listen(port, function(){
    console.log(`💻 Servidor rodando na porta ${port}`)
});
