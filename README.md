# Bridgely - Backend API

Este é o servidor API RESTful do projeto Bridgely, responsável pela autenticação, persistência de dados em arquivos JSON, lógica de feed, sistema de mensagens e integração com a OpenAI.

## 👥 Integrantes do Grupo
* **João Pedro Raimundo Marcilio** | RM 561603
* **Lucas Clemente Zanella** | RM 563880
* **Ben-Hur Iung de Lima Ferreira** | RM 561564

## 🛠️ Tecnologias Utilizadas
* Node.js
* Express
* JWT (JsonWebToken) para autenticação
* Bcrypt para hash de senhas
* Multer para upload de imagens
* OpenAI API para geração de planos de estudo

## 🚀 Instalação e Execução

Siga os passos abaixo para rodar o servidor localmente:

### 1. Instalar Dependências
Abra o terminal na pasta deste backend e execute:

```
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo chamado .env na raiz desta pasta (Backend/) e adicione as seguintes chaves:
```
API_KEY = 5002
SECRET_KEY = 2345678987654567
OPENAI_API_KEY = [protegido, ver README no diretório raiz]
```

### 3. Estrutura de Dados
Certifique-se de que a pasta src/data contenha os arquivos users.json e companies.json. O sistema utiliza estes arquivos como banco de dados.

### 4. Executar o Servidor
Para iniciar o servidor execute o comando no terminal:
```
npm run dev
```
O servidor deverá iniciar na porta definida (padrão: ```http://localhost:5002```).
