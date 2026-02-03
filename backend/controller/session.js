// src/controller/session.js
import dbSessions from '../model/dbSessions.js'
import path from 'path'

export const startSession = async (req, res) => {
    const { name, sessionId } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : null

    if (!name?.trim()) {
        return res.status(400).json({ message: 'Izina rirakenewe' })
    }

    await dbSessions.read()

    // Find all sessions with this username (case-insensitive)
    const matchingSessions = dbSessions.data.sessions.filter(s => s.userName.toLowerCase() === name.trim().toLowerCase())

    if (matchingSessions.length > 0) {
        // Check if the caller is the ORIGINAL user (has a valid session ID that matches)
        if (sessionId) {
            const callerSession = matchingSessions.find(s => s.id === sessionId)

            if (callerSession) {
                // This IS the original user returning - continue their session
                callerSession.status = 'active'
                callerSession.lastActive = new Date().toISOString()
                callerSession.activity = 'Yagarutse'
                if (req.file) {
                    callerSession.userImage = `/uploads/${req.file.filename}`
                }
                await dbSessions.write()
                return res.status(200).json(callerSession)
            }
        }

        // Check if there's any active/non-completed session with this name
        const activeOrPendingSession = matchingSessions.find(s => s.status !== 'completed')

        if (activeOrPendingSession) {
            // Someone else already has this name - BLOCK
            return res.status(409).json({ message: 'Iri zina ryamaze gukoreshwa nundi muntu. Hitamo irindi.' })
        }

        // All sessions with this name are completed - allow new session
        const newSession = {
            id: Date.now().toString(),
            userName: name.trim(),
            userImage: image,
            startTime: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            score: 0,
            progress: 0,
            status: 'active',
            activity: 'Yatangiye'
        }
        dbSessions.data.sessions.push(newSession)
        await dbSessions.write()
        return res.status(201).json(newSession)
    }

    // No session with this name exists - create new
    const newSession = {
        id: Date.now().toString(),
        userName: name.trim(),
        userImage: image,
        startTime: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        score: 0,
        progress: 0,
        status: 'active',
        activity: 'Yatangiye'
    }

    dbSessions.data.sessions.push(newSession)
    await dbSessions.write()

    res.status(201).json(newSession)
}

export const updateSessionProgress = async (req, res) => {
    const { sessionId } = req.params
    const { score, progress, status, isLeaving, activity, userName } = req.body

    await dbSessions.read()
    const sessionIndex = dbSessions.data.sessions.findIndex(s => s.id === sessionId)

    if (sessionIndex === -1) {
        return res.status(404).json({ message: 'Session not found' })
    }

    const session = dbSessions.data.sessions[sessionIndex];

    // Handle userName update - check if new name is available
    if (userName && userName.trim() && userName.trim().toLowerCase() !== session.userName.toLowerCase()) {
        const newName = userName.trim()

        // Check if the new name is already taken by another active session
        const nameTaken = dbSessions.data.sessions.some(s =>
            s.id !== sessionId &&
            s.userName.toLowerCase() === newName.toLowerCase() &&
            s.status !== 'completed'
        )

        if (nameTaken) {
            return res.status(409).json({ message: 'Iri zina ryamaze gukoreshwa nundi muntu. Hitamo irindi.' })
        }

        // Name is available, update it
        session.userName = newName
    }

    if (score !== undefined) session.score = score;
    if (progress !== undefined) session.progress = progress;
    if (status) session.status = status;
    if (activity) session.activity = activity;

    session.lastActive = isLeaving ? new Date(0).toISOString() : new Date().toISOString();

    await dbSessions.write()
    res.json(session)
}

export const getAllSessions = async (req, res) => {
    await dbSessions.read()
    // Return sessions ordered by recency, limit to latest 50 for performance
    const sessions = [...dbSessions.data.sessions]
        .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
        .slice(0, 50)

    res.json(sessions)
}

export const deleteSession = async (req, res) => {
    const { sessionId } = req.params

    await dbSessions.read()
    const sessionIndex = dbSessions.data.sessions.findIndex(s => s.id === sessionId)

    if (sessionIndex === -1) {
        return res.status(404).json({ message: 'Session not found' })
    }

    dbSessions.data.sessions.splice(sessionIndex, 1)
    await dbSessions.write()

    res.json({ message: 'Session deleted successfully' })
}
