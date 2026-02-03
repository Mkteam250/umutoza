// src/controller/auth.js
import Admin from '../model/Admin.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const login = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' })
    }

    try {
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const token = jwt.sign(
            { username: admin.username, id: admin._id },
            process.env.JWT_SECRET || 'umutoza-secret-key-2025',
            { expiresIn: '24h' }
        )

        res.json({
            message: 'Login successful',
            token,
            username: admin.username
        })
    } catch (err) {
        res.status(500).json({ message: 'Login failed' })
    }
}

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'umutoza-secret-key-2025')
        req.user = verified
        next()
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' })
    }
}
