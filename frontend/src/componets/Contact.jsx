import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Contact = () => {
    const navigate = useNavigate();
    const [formState, setFormState] = useState('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormState('sending');
        try {
            await axios.post(`${apiUrl}/api/messages`, formData);
            setFormState('sent');
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            console.error('Error sending message:', err);
            setFormState('error');
            alert('Habaye ikibazo mu kohereza ubutumwa. Ongera ugerageze.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F0E6F7] text-slate-800 font-sans selection:bg-indigo-100 relative overflow-hidden">
            <Helmet>
                <title>Contact Umutoza - Support for Rwanda Driving Permit Prep</title>
                <meta name="description" content="Tuvugishe kuri Umutoza kugira ngo uone ubufasha ku bijyanye no kwitegura ruhushya rw'agateganyo mu Rwanda. Contact us for driving license preparation support." />
            </Helmet>

            {/* Hero */}
            <div className="pt-32 pb-20 px-6 md:px-12 lg:px-24">
                <h1 className="text-5xl md:text-7xl font-extrabold text-indigo-900 mb-8 font-heading" data-aos="fade-up">
                    Tuvugishe <span className="text-indigo-600">Hano</span>
                </h1>
                <p className="text-xl text-indigo-800/70 max-w-2xl mb-16" data-aos="fade-up" data-aos-delay="100">
                    Ufite ikibazo cyangwa inyunganizi? Turi hano kugira ngo tugufashe mu rugendo rwawe rwo kubona uruhushya rwo gutwara ibinyabiziga.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
                    {/* Form */}
                    <div className="glass p-8 md:p-12 rounded-[50px] shadow-2xl" data-aos="fade-right">
                        {formState === 'sent' ? (
                            <div className="text-center py-20 animate-fadeIn">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-lg">✓</div>
                                <h2 className="text-3xl font-bold text-indigo-900 mb-4">Ubutumwa Bwoherejwe!</h2>
                                <p className="text-indigo-700/60 font-medium">Turagusubiza mu kanya gato kagerwa ku ntoki.</p>
                                <button onClick={() => setFormState('idle')} className="mt-8 text-indigo-600 font-bold underline">Ohereza ubundi butumwa</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-indigo-900 mb-2 uppercase tracking-widest ml-1">Izina Ryawe</label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full px-6 py-4 rounded-[20px] bg-white/50 border-2 border-transparent focus:border-indigo-400 outline-none transition-all"
                                        placeholder="Urugero: John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-indigo-900 mb-2 uppercase tracking-widest ml-1">Imeri yawe</label>
                                    <input
                                        required
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        className="w-full px-6 py-4 rounded-[20px] bg-white/50 border-2 border-transparent focus:border-indigo-400 outline-none transition-all"
                                        placeholder="urugero@gmail.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-indigo-900 mb-2 uppercase tracking-widest ml-1">Ubutumwa Bwawe</label>
                                    <textarea
                                        required
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full px-6 py-4 rounded-[25px] bg-white/50 border-2 border-transparent focus:border-indigo-400 outline-none transition-all resize-none"
                                        placeholder="Twandikire hano icyo wifuza..."
                                    ></textarea>
                                </div>
                                <button type="submit" disabled={formState === 'sending'} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[25px] font-extrabold text-xl transition-all shadow-xl active:scale-95 disabled:opacity-50">
                                    {formState === 'sending' ? 'Birimo kyohererezwa...' : 'Ohereza Ubutumwa'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Info Cards */}
                    <div className="space-y-8" data-aos="fade-left">
                        <div className="glass p-10 rounded-[40px] shadow-xl border-l-8 border-cyan-400">
                            <h3 className="text-xl font-black text-indigo-900 mb-2">Sura Aho Dukorera</h3>
                            <p className="text-indigo-800/60 font-medium">Kigali, Rwanda</p>
                        </div>
                        <div className="glass p-10 rounded-[40px] shadow-xl border-l-8 border-purple-400">
                            <h3 className="text-xl font-black text-indigo-900 mb-2">Duhamagare</h3>
                            <p className="text-indigo-800/60 font-medium">0732953633 / 0790174057</p>
                        </div>
                        <div className="glass p-10 rounded-[40px] shadow-xl border-l-8 border-indigo-400">
                            <h3 className="text-xl font-black text-indigo-900 mb-2">Twandikire kuri Imeri</h3>
                            <p className="text-indigo-800/60 font-medium">umutozainfo@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="px-6 py-12 border-t border-indigo-100 flex justify-between items-center text-indigo-800/50 text-sm mt-20 relative z-10">
                <p>&copy; {new Date().getFullYear()} Umutoza. Uburenganzira bwose rurariwe.</p>
                <button onClick={() => navigate('/')} className="hover:text-indigo-600 font-bold">Subira ku Ntangiriro</button>
            </footer>
        </div>
    );
};

export default Contact;
