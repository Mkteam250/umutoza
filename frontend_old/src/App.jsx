import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import Landingpage from './componets/landingpage'
import QuizTestPage from './componets/test';
import Contact from './componets/Contact';
import Info from './componets/Info';
import Login from './componets/admin/Login';
import QuestionsManage from './componets/admin/QuestionsManage';
import Dashboard from './componets/admin/Dashboard';
import SessionHeartbeat from './componets/SessionHeartbeat';
import PromotionDisplay from './componets/PromotionDisplay';

function App() {
  return (
    <>
      <SessionHeartbeat />
      <PromotionDisplay />
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/test" element={<QuizTestPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/info" element={<Info />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/questions" element={<QuestionsManage />} />

        {/* Redirect any other path to landing */}
        <Route path="*" element={<Landingpage />} />
      </Routes>
    </>
  )
}

export default App
