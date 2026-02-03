// src/model/dbAdmin.js
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const file = join(__dirname, '../data/admin.json')
const adapter = new JSONFile(file)
const defaultData = { admin: [] }

const dbAdmin = new Low(adapter, defaultData)

await dbAdmin.read()

if (!dbAdmin.data || !dbAdmin.data.admin) {
    dbAdmin.data = defaultData
    await dbAdmin.write()
}

export default dbAdmin
