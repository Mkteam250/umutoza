// src/routes/sessionRoutes.js
import express from 'express'
import multer from 'multer'
import path from 'path'
import { startSession, updateSessionProgress, getAllSessions, deleteSession } from '../controller/session.js'
import { verifyToken } from '../controller/auth.js'

const sessionRoutes = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

// Public
sessionRoutes.post('/start', upload.single('userImage'), startSession)
sessionRoutes.put('/:sessionId', updateSessionProgress)

// Protected (Admin to track users)
sessionRoutes.get('/', verifyToken, getAllSessions)
sessionRoutes.delete('/:sessionId', verifyToken, deleteSession)

export default sessionRoutes
