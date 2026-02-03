// src/routes/quizRoutes.js
import express from 'express'
import multer from 'multer'
import path from 'path' // ✅ FIXED: was missing
import { getAllQuestions, createQuestion, updateQuestion, deleteQuestion } from '../controller/quiz.js'
import { login, verifyToken } from '../controller/auth.js'

const quizRoutes = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
    }
  }
})

// Public Routes
quizRoutes.get('/', getAllQuestions)
quizRoutes.post('/login', login)

// Protected Admin Routes
quizRoutes.post('/', verifyToken, upload.single('questionImage'), createQuestion)
quizRoutes.put('/:id', verifyToken, upload.single('questionImage'), updateQuestion)
quizRoutes.delete('/:id', verifyToken, deleteQuestion)

export default quizRoutes