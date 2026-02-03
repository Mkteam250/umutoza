// src/model/dbQuiz.js
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const file = join(__dirname, '../data/quiz.json')
const adapter = new JSONFile(file)
const defaultData = { questions: [] }

const dbQuiz = new Low(adapter, defaultData)

await dbQuiz.read()

if (!dbQuiz.data || Object.keys(dbQuiz.data).length === 0) {
  dbQuiz.data = defaultData
  await dbQuiz.write()
}

export default dbQuiz