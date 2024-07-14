import express from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { UserRepository } from './user-repository.js'
import { PORT, SECRET_KEY } from './config.js'

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
/* CookieParser Se utiliza para parsear las cookies que vienen con las solicitudes HTTP
Es decir, este lee las cookies de las solicitudes y las agrega al objeto `req` como `req.cookies`
*/
app.use(cookieParser())
app.use((req, res, next) => { // Middleware para manejar el token
  const token = req.cookies.access_token
  req.session = { user: null } // Crea un nuevo objeto para `req.session` y lo inicializa con la propiedad `user` establecida en null
  try {
    const data = jwt.verify(token, SECRET_KEY)
    req.session.user = data // Actualiza la propiedad `user` de `req.session` como data.
    console.log('Entró ', req.session.user.username)
  } catch {}
  next()
})

app.get('/', (req, res) => {
  const { user } = req.session
  res.render('index', user) // Si el user es null, entonces lo mandará al login - register
})

app.post('/login', (req, res) => {
  const { username, password } = req.body

  try {
    const user = UserRepository.login({ username, password })
    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, { expiresIn: '1h' })
    res
      .cookie('access_token', token, {
        httpOnly: true, // la cookie solo se puede acceder en el servidor
        secure: process.env.NODE_ENV === 'production', // la cookie solo se puede acceder en http
        sameSite: 'strict', // la cookie solo se puede acceder desde el mismo dominio
        maxAge: 1000 * 60 * 60// la cookie tiene un tiempo de validez de 1 hora
      }).send({ user, token })
  } catch (error) {
    res.status(401).send(error.message)
  }
})
app.post('/register', async (req, res) => {
  const { username, password } = req.body
  console.log(req.body)
  try {
    const id = await UserRepository.create({ username, password }) // No es necesaria una instancio por lo que es estático
    res.send({ id })
  } catch (error) {
    res.status(400).send(error.message)
    console.log(error)
  }
})

app.post('/logout', (req, res) => {
  res
    .clearCookie('access_token') // Le indica al navegador que debe eliminar la cookie
    .json({ message: 'Logout succesful' })
})

app.get('/protected', (req, res) => {
  const { user } = req.session

  if (!user) return res.status(403).send('Access not authorized')
  res.render('protected', user)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
