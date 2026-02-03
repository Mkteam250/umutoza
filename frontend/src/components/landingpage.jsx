'use client';

import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import * as feather from 'feather-icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Landingpage = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleStart = () => {
    setMobileMenuOpen(false);
    router.push('/test');
  };

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    router.push(path);
  };

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 1000,
      easing: 'ease-out-quart',
    });

    feather.replace();

    const checkServer = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
        const response = await axios.get(`${apiUrl}/`);
        if (response.data === 'running') {
          console.log('Server is running');
        }
      } catch (error) {
        console.log('Server status check failed');
      }
    };
    checkServer();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0E6F7] text-slate-800 selection:bg-primary-light selection:text-white overflow-hidden font-sans relative">
      {/* Background Abstract Shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[60%] h-full bg-gradient-to-br from-indigo-600/80 to-blue-500/80 rounded-l-[100px] transform skew-x-[-10deg] opacity-90 hidden lg:block"></div>
        <div className="absolute top-[20%] right-[30%] w-48 h-48 bg-cyan-400/40 rounded-full blur-2xl animate-blob"></div>
        <div className="absolute bottom-[20%] right-[15%] w-64 h-64 bg-blue-400/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-[50%] right-[40%] w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-float"></div>
      </div>

      <nav className="relative z-50 px-4 py-4 sm:px-6 sm:py-6 md:px-12 md:py-8 lg:px-24">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <img src="/umutoza.png" alt="Umutoza Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg border-2 border-white/20" />
            <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter text-indigo-900 uppercase">Umutoza</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <button onClick={() => handleNavClick('/info')} className="text-indigo-800 font-bold hover:text-indigo-600 uppercase tracking-wide text-sm transition-colors">Serivisi</button>
            <button onClick={() => handleNavClick('/contact')} className="text-indigo-800 font-bold hover:text-indigo-600 uppercase tracking-wide text-sm transition-colors">Tuvugishe</button>
            <button onClick={handleStart} className="px-6 lg:px-8 py-3 bg-indigo-600 text-white rounded-full font-black text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">TANGIRA TEST</button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-indigo-800 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-full h-0.5 bg-indigo-800 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-full h-0.5 bg-indigo-800 rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-80 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-4 space-y-3">
            <button
              onClick={() => handleNavClick('/info')}
              className="w-full text-left px-4 py-3 text-indigo-800 font-bold hover:bg-indigo-50 rounded-xl uppercase tracking-wide text-sm transition-colors"
            >
              Serivisi
            </button>
            <button
              onClick={() => handleNavClick('/contact')}
              className="w-full text-left px-4 py-3 text-indigo-800 font-bold hover:bg-indigo-50 rounded-xl uppercase tracking-wide text-sm transition-colors"
            >
              Tuvugishe
            </button>
            <button
              onClick={handleStart}
              className="w-full px-4 py-4 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg hover:bg-indigo-700 transition-all active:scale-98"
            >
              TANGIRA TEST
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-6 py-12 md:px-12 lg:px-24 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
        <div data-aos="fade-up">
          <p className="text-indigo-500 font-bold tracking-widest uppercase mb-4 text-sm md:text-base">Inyigisho zo ku rwego rwo hejuru</p>
          <h1 className="text-5xl md:text-7xl font-extrabold text-indigo-900 leading-[1.1] mb-8 font-heading">
            Gutsinda <br />
            <span className="text-indigo-600 font-black">Ikizamini Ubu</span>
          </h1>
          <p className="text-lg text-indigo-700/70 max-w-lg mb-12 leading-relaxed">
            Itegure neza ukoresheje ibizamini byacu bijyanye n'igihe. Gutsinda ku nshuro ya mbere ni intego yacu ya mbere mu Rwanda.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleStart}
              className="px-12 py-5 bg-indigo-600 text-white rounded-[25px] font-black text-xl transition-all shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95"
            >
              Kora Ikizamini
            </button>
            <button
              onClick={() => router.push('/info')}
              className="px-12 py-5 bg-white text-indigo-600 border-2 border-indigo-100 rounded-[25px] font-bold text-xl transition-all hover:bg-indigo-50 active:scale-95"
            >
              Andi Makuru
            </button>
          </div>
        </div>

        <div className="relative flex justify-center items-center" data-aos="zoom-in" data-aos-delay="200">
          <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full shadow-2xl flex items-center justify-center animate-float relative z-20 overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img src="/umutoza.png" alt="Hero Logo" className="w-[70%] h-[70%] object-contain" />
            </div>
            <div className="absolute top-[10%] left-[5%] w-24 h-24 bg-purple-500/40 rounded-full blur-xl animate-blob"></div>
            <div className="absolute bottom-[10%] left-[20%] w-32 h-32 bg-cyan-300/50 rounded-full blur-lg animate-blob animation-delay-2000"></div>
            <div className="absolute top-[40%] right-0 w-16 h-16 bg-blue-300/40 rounded-full blur-md animate-float"></div>
          </div>
        </div>
      </main>

      {/* Info Section / Service Grid */}
      <section className="relative z-10 px-6 py-20 md:px-12 lg:px-24 bg-white/40 backdrop-blur-md mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-8 border-l-4 border-indigo-500 hover:bg-white/50 transition-colors" data-aos="fade-up">
              <h3 className="text-4xl font-extrabold text-indigo-900 mb-2">98%</h3>
              <p className="text-indigo-700 font-bold mb-4">Gutsinda</p>
              <p className="text-indigo-800/60 leading-relaxed">Abanyeshuri bacu batsinda ikizamini cy’icyangombwa cy’agateganyo ku nshuro ya mbere.</p>
            </div>
            <div className="p-8 border-l-4 border-cyan-500 hover:bg-white/50 transition-colors" data-aos="fade-up" data-aos-delay="100">
              <h3 className="text-4xl font-extrabold text-indigo-900 mb-2">Gufashwa</h3>
              <p className="text-cyan-600 font-bold mb-4">Ubufasha</p>
              <p className="text-indigo-800/60 leading-relaxed">dufasha abanyeshuri bacu gusobanukirwa ibibazo byose mu buryo bworoshye kandi bwihuse.</p>
            </div>
            <div className="p-8 border-l-4 border-purple-500 hover:bg-white/50 transition-colors" data-aos="fade-up" data-aos-delay="200">
              <h3 className="text-4xl font-extrabold text-indigo-900 mb-2">24/7</h3>
              <p className="text-purple-600 font-bold mb-4">Kwitoza</p>
              <p className="text-indigo-800/60 leading-relaxed">Witegure igihe cyose ubyikiye ukoresheje terefoni cyangwa mudasobwa yawe aho waba uri hose.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 py-12 md:px-12 lg:px-24 border-t border-indigo-100 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center text-indigo-800/50 text-sm font-medium">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/umutoza.png" alt="Umutoza Logo" className="w-6 h-6 grayscale opacity-50" />
            <span className="font-bold">UMUTOZA</span>
          </div>
          <div className="flex space-x-8">
            <button onClick={() => router.push('/info')} className="hover:text-indigo-600">Serivisi</button>
            <button onClick={() => router.push('/contact')} className="hover:text-indigo-600">Tuvugishe</button>
            <button onClick={() => router.push('/admin/login')} className="hover:text-amber-600 font-bold opacity-80">Admin</button>
            <button onClick={handleStart} className="hover:text-indigo-600 font-black">Tangira Test</button>
          </div>
          <p className="mt-4 md:mt-0">&copy; {new Date().getFullYear()} Umutoza. No 1 mu Rwanda.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landingpage;
