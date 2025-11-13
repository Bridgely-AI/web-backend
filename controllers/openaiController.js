const openAI = require('openai')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const openai = new openAI ({
   apiKey: OPENAI_API_KEY
})

exports.gerarTrilha = async (req, res) => {
    try {
    // ...pegue os dados do perfil
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Você é um mentor de carreira.' },
        { role: 'user', content: '...' }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    const content = response.choices[0].message.content;
    console.log('✅ Resposta recebida da IA');

    // Remove markdown se houver (às vezes IA coloca ``````)
    const jsonString = content
      .replace()
      .replace(/```/g, '')
      .trim();

    const trilha = JSON.parse(jsonString);

    res.json({
      success: true,
      trilha: trilha,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Erro ao gerar trilha com IA:', error);

    // Fallback em caso de erro
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar trilha',
      message: error.message,
      fallback: {
        titulo: 'Trilha Padrão (Modo Fallback)',
        descricao: 'Houve erro ao gerar com IA, usando trilha padrão',
        modulos: [
          {
            id: 1,
            nome: 'Fundamentos',
            topicos: ['Conceitos básicos', 'Setup ambiente'],
            duracao: '2 semanas',
            concluido: false
          },
          {
            id: 2,
            nome: 'Prática',
            topicos: ['Projetos', 'Exercícios'],
            duracao: '3 semanas',
            concluido: false
          }
        ]
      }
    });
  }
}
exports.chat = async (req, res) => {
    try {
    const { mensagem } = req.body;

    if (!mensagem) {
      return res.status(400).json({ error: 'Mensagem vazia' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um mentor de carreira amigável e experiente em tecnologia. Responda de forma concisa e útil.'
        },
        {
          role: 'user',
          content: mensagem
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    res.json({
      success: true,
      resposta: response.choices[0].message.content,
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}