'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

    const fetchMessages = useCallback(async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessages(res.data);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setIsLoading(false);
        }
    }, [apiUrl, token]);

    useEffect(() => {
        const init = async () => {
            await fetchMessages();
        };
        init();
    }, [fetchMessages]);

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`${apiUrl}/api/messages/${id}/read`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchMessages();
        } catch (err) {
            console.error('Error marking message as read:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ese wizeye ko ushaka gusiba ubu butumwa?')) return;
        try {
            await axios.delete(`${apiUrl}/api/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchMessages();
        } catch (err) {
            console.error('Error deleting message:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900">Ubutumwa bwakiriwe</h2>
                <div className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-sm font-bold">
                    {messages.length} Ubwose
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[30px] border-2 border-dashed border-slate-200">
                    <span className="text-5xl block mb-4">📩</span>
                    <h3 className="text-xl font-bold text-slate-400">Nta butumwa buraboneka</h3>
                </div>
            ) : (
                <div className="grid gap-6">
                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`bg-white p-6 rounded-[25px] shadow-sm border-l-4 transition-all hover:shadow-md ${msg.status === 'unread' ? 'border-indigo-500' : 'border-slate-200'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{msg.name}</h3>
                                    <p className="text-sm text-indigo-600 font-medium">{msg.email}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    {msg.status === 'unread' && (
                                        <button
                                            onClick={() => handleMarkAsRead(msg._id)}
                                            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                                            title="Mark as read"
                                        >
                                            ✓
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(msg._id)}
                                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl text-slate-700 leading-relaxed">
                                {msg.message}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Messages;
