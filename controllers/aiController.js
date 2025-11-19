const { OpenAI } = require('openai')
const authController = require('./authController')

const OPEN_AI_KEY = process.env.OPEN_AI_KEY

const openai = new OpenAI({ apiKey: OPEN_AI_KEY })

const buildStudyPrompt = (data) => {
   const { targetArea, budgetLimit, profileData } = data
   const { hardSkills, softSkills, hobbies } = profileData

   const instructions = `
      Você é um consultor de carreira e IA especializado em planos de estudo.
      Sua tarefa é criar um plano de estudos detalhado e totalmente personalizado para o usuário.

      REGRAS CRÍTICAS:
      1. A saída DEVE ser um objeto JSON válido, aderindo estritamente ao esquema fornecido abaixo.
      2. Duração máxima do plano: 12 semanas.
      3. Custo máximo total: R$${budgetLimit}. Não ultrapasse esse valor.
      4. O plano DEVE ser construído em Módulos, com atividades, recursos e custos estimados.
      5. Se uma Habilidade Técnica (Hard Skill) já estiver no perfil (${hardSkills.join(', ')}), ela NÃO deve ser incluída como um módulo de aprendizado do zero.
      6. Use as Soft Skills (${softSkills.join(', ')}) e Hobbies (${hobbies.join(', ')}) do usuário para sugerir projetos ou métodos de estudo.
      7. **PROIBIDO USAR PLACEHOLDERS:** Nos campos 'name' e 'resource', você DEVE fornecer nomes REAIS e ESPECÍFICOS. 
         - Se for um Livro: O 'resource' deve ser "Livro: [Título Real] - [Autor]".
         - Se for Curso: O 'resource' deve ser a plataforma real (ex: Udemy, Coursera, Youtube) e o 'name' o nome real do curso.
         - NUNCA escreva "Nome do Livro", "Plataforma X" ou "Curso Genérico".
      8. **TABELA DE PREÇOS (IMPORTANTE):** Para evitar valores irreais, use estas referências de mercado no Brasil:
         - **Udemy:** Considere SEMPRE o preço promocional recorrente (entre R$ 27,90 e R$ 55,00). NUNCA coloque o preço cheio de R$ 400+.
         - **Coursera/EdX:** Geralmente funcionam por assinatura mensal (aprox. R$ 200/mês) ou audição gratuita (R$ 0).
         - **Livros Técnicos (Amazon):** Entre R$ 80,00 e R$ 200,00.
         - **Youtube / Documentação Oficial / FreeCodeCamp / Microsoft Learn:** Custo R$ 0,00.   
      9. **PRIORIDADE:** Se o orçamento for baixo (< R$ 100), force o uso de recursos Gratuitos (Youtube, Docs, Artigos, GitHub). Só sugira pagos se forem essenciais ou se sobrar orçamento.
      Gere o plano de estudos focando preencher as lacunas do usuário para atingir a área de foco: ${targetArea}

      SHCEME JSON OBRIGATÓRIO (mapeie para este formato EXATO):
      ${JSON.stringify(
      {
         "studyPlanTitle": "string",
         "durationWeeks": "number",
         "estimatedCost": "number",
         "budgetExceeded": "boolean",
         "targetArea": "string",
         "introduction": "string",
         "modules": [
            {
               "moduleName": "string",
               "durationWeeks": "number",
               "costEstimate": "number",
               "focusSkills": ["string"],
               "activities": [
                  {
                     "type": "string (Ex: Curso Online, Livro, Projeto Prático)",
                     "name": "string",
                     "resource": "string (Ex: Udemy, Nome do Livro, GitHub)",
                     "cost": "number (0 ou custo estimado)",
                     "why": "string (Explicação da relevância)",
                     "priority": "string (Alta, Média, Baixa)"
                  }
               ]
            }
         ],
         "nextSteps": "string"
      }
      , null, 2)}
   `
   return instructions
}

exports.generateStudyPlan = async (req, res) => {
   try {
      if (!req.user || !req.user.id) {
         return res.status(401).json({ message: "Autenticação necessária para acessar a IA" })
      }

      if (req.user.type == 'company') {
         return res.status(403).json({ message: 'Você não pode usar esse recurso em uma conta empresarial.'})
      }

      const userId = req.user.id
      const { targetArea, budgetLimit } = req.body

      if (!targetArea || typeof budgetLimit === 'undefined') {
         return res.status(400).json({ message: "Área de foco e limite de orçamento são obrigatórios." });
      }

      const regularUsers = authController.consultData('user')
      const userProfile = regularUsers.find(u => u.id == userId)

      if (!userProfile) {
         return res.status(404).json({ message: "Perfil de usuário não encontrado." });
      }

      const profileData = {
         hardSkills: userProfile.hardSkills || ['Nenhum'],
         softSkills: userProfile.softSkills || ['Nenhum'],
         hobbies: userProfile.hobbies || ['Nenhum'],
      }

      const prompt = buildStudyPrompt({ targetArea, budgetLimit, profileData })
      const response = await openai.chat.completions.create({
         model: 'gpt-4o-mini',
         messages: [
            { role: 'system', content: 'Você é um consultor que retorna apenas JSON estrito conforme o esquema fornecido, sem texto adicional.' },
            { role: 'user', content: prompt }
         ],
         response_format: { type: "json_object" },
         temperature: 0.5,
         max_tokens: 1500
      })

      const jsonText = response.choices[0].message.content.trim()
      const jsonResponse = JSON.parse(jsonText)

      res.status(200).json(jsonResponse)
   }
   catch (error) {
      console.error("Erro na integração com IA:", error.message);
      res.status(500).json({ message: "Erro interno ao gerar o plano de estudos com a IA.", details: error.message });
   }
}