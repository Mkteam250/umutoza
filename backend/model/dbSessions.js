// src/model/dbSessions.js
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Store sessions in data/sessions.json
const file = join(__dirname, '../data/sessions.json')
const adapter = new JSONFile(file)
const defaultData = { sessions: [] }

const dbSessions = new Low(adapter, defaultData)

await dbSessions.read()

if (!dbSessions.data || Object.keys(dbSessions.data).length === 0) {
    dbSessions.data = defaultData
    await dbSessions.write()
}

export default dbSessions
