import DBLocal from 'db-local'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from './config.js'

const { Schema } = new DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

export class UserRepository {
  static async create ({ username, password }) {

    Validations.username(username)
    Validations.password(password)
    // 2. Asegurarse que el username NO EXISTE
    const user = User.findOne({ username })
    if (user) throw new Error('User already exist')

    // 3. Encriptar la contraseña
    const id = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    User.create({
      _id: id,
      username,
      password : hashedPassword
    }).save()

    return id
  }

  static login ({ username, password }) {
    Validations.username(username)
    Validations.password(password)
    const user = User.findOne({ username })
    if (!user) throw new Error('User does not exist')
    
    const isValid = bcrypt.compareSync( password, user.password) //Este compareSync va a comparar los dos encriptados
    if (!isValid) throw new Error('password is invalid')
    
    const {  _id, password: _, ...publicUser } = user
    
    return publicUser
  }
}

class Validations {
  static username (username){
    // 1. Validaciones de username
    if (typeof username !== 'string') throw new Error('username must be a string')
    if (username.length < 3) throw new Error('username must be at least 3 characters long')
  }

  static password(password){
    if (typeof password !== 'string') throw new Error('Password must be a string')
    if (password.length < 6) throw new Error('password must be at least 6 characters long')
  
  }
}