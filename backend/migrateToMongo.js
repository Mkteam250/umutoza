import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Models
import Question from './model/Question.js';
import Promotion from './model/Promotion.js';
import Admin from './model/Admin.js';
import Session from './model/Session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './enve.env' });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for migration...');

        // 1. Migrate Questions
        const quizData = JSON.parse(await fs.readFile('./data/quiz.json', 'utf8'));
        if (quizData && quizData.questions && quizData.questions.length > 0) {
            console.log(`Migrating ${quizData.questions.length} questions...`);
            for (const q of quizData.questions) {
                await Question.findOneAndUpdate(
                    { questionText: q.questionText }, // unique-ish check
                    {
                        questionText: q.questionText,
                        questionImage: q.questionImage,
                        options: q.options,
                        correctAnswerIndex: q.correctAnswerIndex,
                        difficulty: q.difficulty || 'Easy'
                    },
                    { upsert: true }
                );
            }
            console.log('✅ Questions migrated.');
        }

        // 2. Migrate Promotions
        const promoData = JSON.parse(await fs.readFile('./data/promotions.json', 'utf8'));
        if (promoData && promoData.length > 0) {
            console.log(`Migrating ${promoData.length} promotions...`);
            for (const p of promoData) {
                await Promotion.findOneAndUpdate(
                    { name: p.name },
                    { ...p, _id: undefined }, // let mongo create its own id if new
                    { upsert: true }
                );
            }
            console.log('✅ Promotions migrated.');
        }

        // 3. Migrate Admins
        const adminData = JSON.parse(await fs.readFile('./data/admin.json', 'utf8'));
        if (adminData && adminData.admin && adminData.admin.length > 0) {
            console.log(`Migrating ${adminData.admin.length} admins...`);
            for (const a of adminData.admin) {
                await Admin.findOneAndUpdate(
                    { username: a.username },
                    { username: a.username, password: a.password },
                    { upsert: true }
                );
            }
            console.log('✅ Admins migrated.');
        }

        // 4. Migrate Sessions
        try {
            const sessionData = JSON.parse(await fs.readFile('./data/sessions.json', 'utf8'));
            if (sessionData && sessionData.sessions && sessionData.sessions.length > 0) {
                console.log(`Migrating ${sessionData.sessions.length} sessions...`);
                for (const s of sessionData.sessions) {
                    await Session.findOneAndUpdate(
                        { userName: s.userName },
                        { ...s, _id: undefined },
                        { upsert: true }
                    );
                }
                console.log('✅ Sessions migrated.');
            }
        } catch (err) {
            console.log('⚠️ No sessions found to migrate.');
        }

        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();
