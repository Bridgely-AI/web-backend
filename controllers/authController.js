const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')

const SECRET_KEY = process.env.SECRET_KEY;
const dataUsers = path.join(__dirname, '../data/users.json')