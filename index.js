import express from 'express'
import { UserRepository } from './user-repository.js'
import { PORT } from './config.js'
const app = express()

app.use(express.json())
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('example', { username: 'Manu' })
})

app.post('/login', (req, res) => {
  const { username, password } = req.body

  try {
    const user = UserRepository.login( {username, password} )
    res.send(user)
  } catch (error) {
    res.status(401).send(error.message)
  }
})
app.post('/register', async (req, res) => {
  const { username, password } = req.body

  try {
    const id = await UserRepository.create({ username, password }) // No es necesaria una instancio por lo que es estático
    res.send({ id })
  } catch (error) {
    res.status(400).send(error.message)
  }
})

app.post('/logout', (req, res) => {})
app.post('/protected', (req, res) => {})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
