import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'bebidas'

import auth from '../middleware/auth.js'

const validaBebida = [
    check('data_adição')
    .isLength({min: 10, max: 10}).withMessage('A data deve seguir o padrão aaaa-mm-dd'),
    check('nome')
    .not().isEmpty().trim().withMessage('É obrigatório informar o nome!'),
    check('qtde_ml')
    .isNumeric().withMessage('A quantidade é medida em Ml e deve ser um número inteiro!'),
    check('tipo').optional({nullable: true})
];

/**
 * GET /api/bebidas
 * Lista todas as bebidas oferecidas pelo restaurante
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
                msg: 'Erro ao obter a listagem das bebidas do restaurante',
                param: '/'
            }]
        })
    }
});

/**
 * GET /api/bebidas/id/:id
 * Lista uma bebida pelo id
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
 * GET com operadores do MongoDB /api/bebidas/nome/:nome
 * Informa uma bebida que tem o nome pedido e um preço maior que 20 e menor que 50
 */
router.get('/nome/:nome', auth, async(req, res) => {
    try{
        db.collection(nomeCollection).find({$and:[{'preço':{$gt:20, $lt:50}},{'nome':{$regex: req.params.nome, $options: "i"}}]}).sort({nome: 1}).toArray((err, docs) => {
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
 * DELETE /api/bebidas/:id
 * Apaga a bebida pelo id
 */
router.delete('/:id', auth, async(req, res) => {
    await db.collection(nomeCollection)
    .deleteOne({"_id": { $eq: ObjectId(req.params.id)}})
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).json(err))
});

/**
 * POST /api/bebidas
 * Insere uma nova bebida
 */
router.post('/', auth, validaBebida, async(req, res) => {
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
 * PUT /api/bebidas
 * Altera uma bebida
 */
router.put('/', auth, validaBebida, async(req, res) => {
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