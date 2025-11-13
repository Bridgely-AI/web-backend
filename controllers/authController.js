const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')

const SECRET_KEY = process.env.SECRET_KEY;
const dataUsers = path.join(__dirname, '../data/users.json')
const dataCompanies = path.join(__dirname, '../data/Companies.json')

const consultUsers = (type) => {
   let data = null
   if (type == 'user') { data = fs.readFileSync(dataUsers, 'utf-8') }
   else if (type == 'company') { data = fs.readFileSync(dataCompanies, 'utf-8') }

   if (!data || data.trim() === "") {
      return [];
   }
   try {
      return JSON.parse(data);
   } catch (error) {
      console.error("Erro ao analisar usuários: ", error);
      return [];
   }
}
const saveUsers = (users, type) => {
   let data = null
   if (type == 'user') { data = fs.readFileSync(dataUsers, 'utf-8') }
   else if (type == 'company') { data = fs.readFileSync(dataCompanies, 'utf-8') }

   fs.writeFileSync(data, JSON.stringify(users, null, 2))
}

exports.register = async (req, res) => {
   const {
      type,
      name,
      email,
      password,
      confirmPassword,
      location,
      phoneNumber = "",
      cnpj = ""
   } = req.body

   if (!type || !name || !email || !password || !confirmPassword || !location || !phoneNumber) {
      return res.status(400).json({ message: 'Required fields' })
   }

   let users = null
   if (type == 'user') {
      users = consultUsers('user')
      if (users.find(user => user.phoneNumber == phoneNumber)) {
         return res.status(400).json({ message: 'Esse número de telefone já está sendo usado!' })
      }
   }
   else if (type == 'company') {
      users = consultUsers('company')
      if (users.find(user => user.cnpj == cnpj)) {
         return res.status(400).json({ message: 'Esse cnpj já está sendo usado!' })
      }
   }

   if (users.find(user => user.name == name)) {
      return res.status(400).json({ message: 'Esse nome já está sendo usado!' })
   }
   if (password != confirmPassword) {
      return res.status(400).json({ message: 'As senhas não se coincidem' })
   }

   const hashPassword = await bcrypt.hash(password, 10)
   const newUser = {
      id: Date.now(),
      type,
      name,
      email,
      password: hashPassword,
      phoneNumber,
      photo: 'http://localhost:5002/userImages/userPhotoPlaceholder.png',
      description: '',
      location: '',
      hardSkills: [],
      softSkills: [],
      hobbies: [],
      academicBackground: [],
      experiences: [],
      recomendations: 0,
      receivedMessages: [],
   }
   const newCompany = {
      id: Date.now(),
      type,
      name,
      email,
      password: hashPassword,
      phoneNumber,
      photo: 'http://localhost:5002/userImages/userPhotoPlaceholder.png',
      description: '',
      location: '',
      website: '',
      area: '',
      cnpj: '',
      jobs: [],
      futureJobs: [],
      recomendations: 0,
      receivedMessages: [],
   }

   if (type == 'user') { users.push(newUser) }
   else if (type == 'company') { users.push(newCompany) }
   saveUsers(users, type)
   res.status(200).json({ message: 'Usuario registrado com sucesso!' })
}