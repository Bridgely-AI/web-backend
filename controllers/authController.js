const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')

const SECRET_KEY = process.env.SECRET_KEY
const dataUsers = path.join(__dirname, '../data/users.json')
const dataCompanies = path.join(__dirname, '../data/Companies.json')

const consultData = (type) => {
   const filePath = type === 'user' ? dataUsers : dataCompanies

   try {
      data = fs.readFileSync(filePath, 'utf-8')
      if (!data || data.trim() === "") {
         return []
      }
      return JSON.parse(data)
   }
   catch (error) {
      if (error.code === 'ENOENT') {
         return []
      }
      console.error(`Erro ao analisar dados ${type}: `, error)
      return []
   }
}
const saveData = (dataList, type) => {
   const filePath = type === 'user' ? dataUsers : dataCompanies
   fs.writeFileSync(filePath, JSON.stringify(dataList, null, 2))
}
const checkDuplicatesAndGetData = (type, reqBody) => {
   const dataList = consultData(type)

   if (type == 'user') {
      if (dataList.find(user => user.phoneNumber === reqBody.phoneNumber)) {
         return { error: 'Esse número de telefone já está sendo usado!' }
      }
   }
   else if (type == 'company') {
      if (dataList.find(company => company.cnpj === reqBody.cnpj)) {
         return { error: 'Esse CNPJ já está sendo usado!' }
      }
   }

   return { dataList }
}


exports.register = async (req, res) => {
   try {
      const {
         type,
         name,
         email,
         password,
         confirmPassword,
         phoneNumber,
         cnpj,
         location,
      } = req.body
      let profilePicture

      if (!type || !name || !email || !password || !confirmPassword) {
         return res.status(400).json({ message: 'Campos obrigatórios!', a: [type, name, email, password, confirmPassword] })
      }

      if (type === 'user' && !phoneNumber) {
         return res.status(400).json({ message: 'Número de telefone é obrigatório para usuários.' })
      }
      if (type === 'company' && !cnpj) {
         return res.status(400).json({ message: 'CNPJ é obrigatório para empresas.' })
      }
      if (password !== confirmPassword) {
         return res.status(400).json({ message: 'As senhas não se coincidem' })
      }
      if (req.file) {
         profilePicture = `http://localhost:5002/userImages/${req.file.filename}`
      } else {
         profilePicture = `http://localhost:5002/userImages/userPhotoPlaceholder.png`
      }

      const { error, dataList } = checkDuplicatesAndGetData(type, req.body)
      if (error) {
         return res.status(400).json({ message: error })
      }

      const hashPassword = await bcrypt.hash(password, 10)
      const baseProfile = {
         id: Date.now(),
         type: type,
         name: name,
         email: email,
         password: hashPassword,
         location: location,
         photo: profilePicture,
         description: '',
         recommendations: {
            count: 0,
            users: []
         },
         receivedMessages: [],
      }

      let newProfile
      if (type === 'user') {
         newProfile = { ...baseProfile, actualArea: "", phoneNumber: phoneNumber, hardSkills: [], softSkills: [], hobbies: [], academicBackground: [], experiences: [], }
      }
      else if (type === 'company') {
         newProfile = { ...baseProfile, website: '', area: '', cnpj, jobs: [], futureJobs: [], }
      }
      else {
         return res.status(400).json({ message: 'Tipo de usuário inválido.' })
      }

      dataList.push(newProfile)
      saveData(dataList, type)
      res.status(200).json({ message: 'Usuario registrado com sucesso!' })
   }
   catch (error) {
      return res.status(500).json({ message: 'Erro interno ao processar o registro.' })
   }
}
exports.login = async (req, res) => {
   const { userName, password } = req.body
   const allUsers = [...consultData('user'), ...consultData('company')]

   let user = allUsers.find(user => user.email === userName || user.name === userName)
   if (!user) {
      return res.status(400).json({ message: 'Usuário não cadastrado!' })
   }

   const validPassword = await bcrypt.compare(password, user.password)
   if (!validPassword) {
      return res.status(400).json({ message: 'Senha incorreta!' })
   }

   const token = jwt.sign({ id: user.id, email: user.email, type: user.type }, SECRET_KEY)
   res.json({ message: 'login successful', token })
}
exports.getProfile = async (req, res) => {
   const userId = req.user.id

   const regularUsers = consultData('user')
   const companies = consultData('company')

   const user = regularUsers.find(user => user.id == userId || user.id == parseInt(userId)) ||
      companies.find(company => company.id == userId || company.id == parseInt(userId))

   if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
   }

   const { password, ...profile } = user

   return res.status(200).json({ user: profile })
}
exports.getUserById = async (req, res) => {
   const targetId = parseInt(req.params.id)
   const regularUsers = consultData('user')
   const companies = consultData('company')

   const user = regularUsers.find(user => user.id == targetId) ||
      companies.find(company => company.id == targetId)

   if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
   }

   const publicProfile = {
      id: user.id,
      name: user.name,
      type: user.type,
      location: user.location,
      profilePicture: user.photo,
      description: user.description,
      actualArea: user.actualArea,
      hardSkills: user.hardSkills,
      softSkills: user.softSkills,
      hobbies: user.hobbies,
      academicBackground: user.academicBackground,
      experiences: user.experiences,
      recommendations: user.recommendations
   }

   return res.status(200).json({ user: publicProfile })
}
exports.updateProfile = async (req, res) => {
   const targetId = parseInt(req.params.id)
   const userIdFromToken = req.user.id
   const userTypeFromToken = req.user.type

   if (targetId != parseInt(userIdFromToken)) {
      return res.status(403).json({ message: 'Você não tem permissão para editar este perfil.' })
   }

   let dataList = consultData(userTypeFromToken)
   const userIndex = dataList.findIndex(user => user.id == targetId)

   if (userIndex === -1) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
   }

   const currentUserData = dataList[userIndex]
   const updates = req.body
   const protectedUpdates = { ...updates }

   delete protectedUpdates.email
   delete protectedUpdates.password
   delete protectedUpdates.type
   delete protectedUpdates.id

   const updatedUser = {
      ...currentUserData,
      ...protectedUpdates,
   }

   dataList[userIndex] = updatedUser
   saveData(dataList, userTypeFromToken)
   const { password, ...responseProfile } = updatedUser

   res.status(200).json({ message: 'Perfil atualizado com sucesso', user: responseProfile })
}
exports.recommendProfile = async (req, res) => {
   try {
      const targetId = parseInt(req.params.id)
      const recommenderId = req.user.id
      const recommenderType = req.user.type

      const regularUsers = consultData('user')
      const companies = consultData('company')

      let dataList
      let userIndex

      userIndex = regularUsers.findIndex(user => user.id == targetId)
      if (userIndex != -1) {
         dataList = regularUsers
      }
      else {
         userIndex = companies.findIndex(company => company.id == targetId)
         if (userIndex != -1) {
            dataList = companies
         }
      }
      if (userIndex == -1) {
         return res.status(400).json({ message: 'Perfil não encontrado.' })
      }

      const user = dataList[userIndex]
      if (targetId == recommenderId) {
         return res.status(400).json({ message: 'Você não pode recomendar seu próprio perfil' })
      }

      const userRecommendation = user.recommendations.users || []
      if (userRecommendation.includes(recommenderId)) {
         const updatedUser = userRecommendation.filter(id => id != recommenderId)
         user.recommendations.count -= 1
         user.recommendations.users = updatedUser

         saveData(dataList, user.type)
         return res.status(200).json({
            message: 'Recomendação retirada com sucesso',
            newCount: user.recommendations.count
         })
      }

      user.recommendations.count += 1
      user.recommendations.users.push(recommenderId)

      saveData(dataList, user.type)

      return res.status(200).json({
         message: 'Recomendação registrada com sucesso',
         newCount: user.recommendations.count
      })
   }
   catch (error) {
      return res.status(500).json({ message: 'Erro interno ao processar o registro.', erro: error })
   }
}