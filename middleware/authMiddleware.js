const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY

exports.verifyToken = (req, res, next) => {
   const authHeader = req.headers.authorization

   if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de autenticação ausente ou mal formatado.' })
   }

   const token = authHeader.split(' ')[1]

   try {
      const decoded = jwt.verify(token, SECRET_KEY)

      req.user = decoded

      next()
   } catch (error) {
      return res.status(401).json({ message: 'Token inválido ou expirado.' })
   }
}