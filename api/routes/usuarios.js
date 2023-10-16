import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'usuarios'

//JWT

import auth from '../middleware/auth.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


/*******************************************
 * Validações
 *******************************************/

const validaUsuario = [
    check('nome')
        .not().isEmpty().trim().withMessage('É obrigatório informar o nome')
        .isAlpha('pt-BR', { ignore: ' '}).withMessage('Informe apenas texto no nome')
        .isLength({min: 3}).withMessage('O nome de usuário deve ter ao menos 3 caracteres')
        .isLength({max: 100}).withMessage('O nome do usuário deve ter no máximo 100 caracteres'),
    check('email')
        .not().isEmpty().trim().withMessage('O E-Mail é obrigatório')
        .isLowercase().withMessage('O email não pode ter MAIÚSCULOS')
        .isEmail().withMessage('O E-Mail deve ser válido')
        .custom((value, {req}) => {
            return db.collection(nomeCollection).find({email: {$eq:value}}).toArray()
            .then((email) => {
                //verifica se não tem o id, para garantir que é inclusão
                if (email.length && !req.params.id){
                    return Promise.reject(`O email ${value} já existe!`)
                }
            })
        }),
    check('senha')
        .not().isEmpty().trim().withMessage('A senha é obrigatória')
        .isLength({min:8}).withMessage('A senha deve ter no mínimo 8 caracteres')
        .isStrongPassword({minLength: 8, minLowercase: 1, minUppercase:  1, minSymbols: 1, minNumbers: 1}).withMessage('A senha informada não é segura. Informe no mínimo 1 caractere maiúsculo, 1 caractere minúsculo, 1 número e 1 caractere especial'),
    check('ativo')
        .default(true)
        .isBoolean().withMessage('O valor deve ser um booleano, true ou false'),
    check('tipo')
        .default('Cliente')
        .isIn(['Admin', 'Cliente']).withMessage('O tipo do usuário deve ser Admin ou Cliente'),
    check('avatar')
        .isURL().withMessage('O endereço do Avatar deve ser uma URL válida')
]

//Post de usuário
router.post('/', validaUsuario, async(req, res) => {
    const schemaErrors = validationResult(req)
    if (!schemaErrors.isEmpty()){
        return res.status(403).json(({
            errors: schemaErrors.array()
        }))
    } else{
        //Definindo o avatar default
        req.body.avatar = `https://ui-avatars.com/api/?name=${req.body.nome.replace(/ /g, '+')}`

        //₢riptografia da senha
        //genSalt => impede que 2 senhas iguais tenham resultados iguais
        const salt = await bcrypt.genSalt(10)
        req.body.senha = await bcrypt.hash(req.body.senha, salt)
        await db.collection(nomeCollection)
             .insertOne(req.body)
             .then(result => res.status(201).send(result))
             .catch(err => res.status(400).json(err))
    }
})

export default router