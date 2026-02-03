// src/controller/quiz.js
import Question from '../model/Question.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// ✅ Get correct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ CORRECT PATH: ./uploads (relative to backend folder)
const UPLOADS_DIR = path.join(__dirname, '../uploads') // Points to backend/uploads

// Ensure uploads directory exists
try {
  await fs.mkdir(UPLOADS_DIR, { recursive: true })
  console.log('📁 Uploads directory ready:', UPLOADS_DIR)
} catch (err) {
  console.error('❌ Failed to create uploads directory:', err.message)
}

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching questions' })
  }
}

export const createQuestion = async (req, res) => {
  const { questionText, options, correctAnswerIndex, difficulty } = req.body

  if (!questionText?.trim() || !options || options.length < 2) {
    return res.status(400).json({ message: 'Question text and at least 2 options are required' })
  }

  if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
    return res.status(400).json({ message: 'Invalid correct answer index' })
  }

  // ✅ EXACT DUPLICATE DETECTION using MongoDB
  const existing = await Question.findOne({
    questionText: questionText.trim(),
    correctAnswerIndex: parseInt(correctAnswerIndex, 10),
    options: options.map(opt => opt.trim())
  });

  if (existing) {
    return res.status(409).json({
      message: 'An identical question already exists',
      similarQuestions: [{
        id: existing._id,
        questionText: existing.questionText,
        optionMatch: true
      }]
    })
  }

  // Handle image upload
  let imageUrl = null
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`
    console.log('✅ New image saved:', req.file.filename)
  }

  try {
    const newQuestion = new Question({
      questionText: questionText.trim(),
      questionImage: imageUrl,
      options: options.map(opt => opt.trim()),
      correctAnswerIndex: parseInt(correctAnswerIndex, 10),
      difficulty: difficulty || 'Easy'
    });

    await newQuestion.save();
    res.status(201).json(newQuestion)
  } catch (err) {
    res.status(500).json({ message: 'Error saving question' })
  }
}

export const updateQuestion = async (req, res) => {
  const { id } = req.params
  const { questionText, options, correctAnswerIndex, difficulty } = req.body

  if (!questionText?.trim() || !options || options.length < 2) {
    return res.status(400).json({ message: 'Question text and at least 2 options are required' })
  }

  if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
    return res.status(400).json({ message: 'Invalid correct answer index' })
  }

  const question = await Question.findById(id);
  if (!question) {
    return res.status(404).json({ message: 'Question not found' })
  }

  // Handle image upload
  let imageUrl = question.questionImage
  if (req.file) {
    // ✅ DELETE OLD IMAGE
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      const fileName = path.basename(imageUrl)
      const oldImagePath = path.join(UPLOADS_DIR, fileName)

      try {
        await fs.access(oldImagePath)
        await fs.unlink(oldImagePath)
        console.log('✅ Deleted old image:', fileName)
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error('❌ Error deleting old image:', err.message)
        }
      }
    }
    // ✅ SAVE NEW IMAGE
    imageUrl = `/uploads/${req.file.filename}`
  }

  try {
    question.questionText = questionText.trim();
    question.questionImage = imageUrl;
    question.options = options.map(opt => opt.trim());
    question.correctAnswerIndex = parseInt(correctAnswerIndex, 10);
    question.difficulty = difficulty || question.difficulty;

    await question.save();
    res.json({ message: 'Question updated', question })
  } catch (err) {
    res.status(500).json({ message: 'Error updating question' })
  }
}

export const deleteQuestion = async (req, res) => {
  const { id } = req.params
  console.log(`🗑️ Attempting to delete question with ID: ${id}`);

  try {
    const question = await Question.findById(id);
    if (!question) {
      console.warn(`⚠️ Question with ID ${id} not found in MongoDB`);
      return res.status(404).json({ message: 'Question not found' })
    }

    // ✅ DELETE IMAGE FROM ./uploads FOLDER
    if (question.questionImage && question.questionImage.startsWith('/uploads/')) {
      const fileName = path.basename(question.questionImage)
      const imagePath = path.join(UPLOADS_DIR, fileName)

      try {
        await fs.access(imagePath)
        await fs.unlink(imagePath)
        console.log('✅ Successfully deleted image file:', fileName)
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error('❌ Error deleting image file:', err.message)
        } else {
          console.log('ℹ️ Image file already gone from disk')
        }
      }
    }

    const result = await Question.findByIdAndDelete(id);
    if (result) {
      console.log(`✅ Question ${id} deleted from database`);
      res.json({ message: 'Question deleted successfully' })
    } else {
      res.status(404).json({ message: 'Question found but could not be deleted' })
    }
  } catch (err) {
    console.error(`❌ Error in deleteQuestion for ID ${id}:`, err.message);
    res.status(500).json({ message: 'Error deleting question', error: err.message })
  }
}