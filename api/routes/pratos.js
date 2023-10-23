import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'pratos'

import auth from '../middleware/auth.js'

const validaPrato = [
    check('data_cardapio')
    .isLength({min: 10, max: 10}).withMessage('A data deve seguir o padrão aaaa-mm-dd'),
    check('nome')
    .not().isEmpty().trim().withMessage('É obrigatório informar o nome!'),
    check('tempo_preparo')
    .isNumeric().withMessage('O tempo de preparo é medido em minutos e deve ser um número inteiro!'),
    check('cozinheiro')
    .not().isEmpty().trim().withMessage('É necessário informar o nome do cozinheiro(a)!'),
    check('tipo').optional({nullable: true})
];

/**
 * GET /api/pratos
 * Lista todos os pratos oferecidos pelo restaurante
 */
router.get('/', auth, async(req, res) => {
    try{
        db.collection(nomeCollection).find().sort({nome: 1}).toArray((err, docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg: 'Erro ao obter a listagem dos pratos do restaurante',
                param: '/'
            }]
        })
    }
});

/**
 * GET /api/pratos/id/:id
 * Lista um prato pelo id
 */
router.get('/id/:id', auth, async(req, res)=> {
    try{
        db.collection(nomeCollection).find({'_id': {$eq: ObjectId(req.params.id)}})
        .toArray((err, docs) => {
            if(err){
                res.status(400).json(err) // bad request
            } else {
                res.status(200).json(docs) // retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
});

/**
 * GET com operadores do MongoDB /api/pratos/nome/:nome
 * Informa um prato que tem o nome pedido e um tempo de preparo maior que 10 minutos
 * e diferente de 40 minutos
 */
router.get('/nome/:nome', auth, async(req, res) => {
    try{
        db.collection(nomeCollection).find({$and:[{'tempo_preparo':{$gt:10, $ne:40}},{'nome':{$regex: req.params.nome, $options: "i"}}]}).sort({nome: 1}).toArray((err, docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg: 'Erro ao obter a listagem dos pratos',
                param: '/'
            }]
        })
    }
});

/**
 * DELETE /api/pratos/:id
 * Apaga o prato pelo id
 */

router.delete('/:id', auth, async(req, res) => {
    await db.collection(nomeCollection)
    .deleteOne({"_id": { $eq: ObjectId(req.params.id)}})
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).json(err))
});

/**
 * POST /api/pratos
 * Insere um novo prato
 */
router.post('/', auth, validaPrato, async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .insertOne(req.body)
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
});

/**
 * PUT /api/pratos
 * Altera um prato
 */
router.put('/', auth, validaPrato, async(req, res) => {
    let idDocumento = req.body._id //armazenando o id do documento
    delete req.body._id //iremos remover o id do body
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .updateOne({'_id': {$eq : ObjectId(idDocumento)}},
                   { $set: req.body})
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
});

export default router;