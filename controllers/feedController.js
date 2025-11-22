const authController = require('./authController')

exports.getRankedProfiles = async (req, res) => {
   try {
      const users = authController.consultData('user')
      const rankedUsers = users
         .filter(u => u.id != req.user.id)
         .sort((a, b) => {
            const countA = a.recommendations?.count || 0
            const countB = b.recommendations?.count || 0
            return countB - countA
         })

      const safeUsers = rankedUsers.map(({ password, ...u }) => u)

      return res.status(200).json(safeUsers)
   }
   catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar perfis.' })
   }
}
exports.getRankedCompanies = async (req, res) => {
   try {
      const companies = authController.consultData('company')

      const rankedCompanies = companies
         .sort((a, b) => {
            const countA = a.recommendations?.count || 0
            const countB = b.recommendations?.count || 0
            return countB - countA
         })

      const safeCompanies = rankedCompanies.map(({ password, ...c }) => c)

      return res.status(200).json(safeCompanies)
   } catch (error) {
      console.error("Erro no feed de empresas:", error)
      return res.status(500).json({ message: 'Erro ao buscar empresas.' })
   }
}
exports.getRecommendedJobs = async (req, res) => {
   try {
      const userId = req.user.id
      const users = authController.consultData('user')
      currentUser = users.find(u => u.id == userId)

      const userSkills = currentUser?.hardSkills?.map(s => s.toLowerCase()) || []
      const companies = authController.consultData('company')

      let allJobs = []

      companies.forEach(company => {
         if (company.jobs && company.jobs.length > 0) {
            company.jobs.forEach(job => {
               let matchScore = 0
               const jobText = (job.title + ' ' + job.description).toLowerCase()

               userSkills.forEach(skill => {
                  if (jobText.includes(skill)) matchScore++
               })

               allJobs.push({
                  ...job,
                  companyName: company.name,
                  companyId: company.id,
                  companyPhoto: company.photo,
                  location: company.location,
                  matchScore
               })
            })
         }
      })

      allJobs.sort((a, b) => b.matchScore - a.matchScore)
      return res.status(200).json(allJobs)
   }
   catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar vagas.' })
   }
}