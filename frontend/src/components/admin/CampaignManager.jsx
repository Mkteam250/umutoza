'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Image from 'next/image';

const CampaignManager = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('content'); // 'content', 'design', 'scheduling'
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [previewCampaign, setPreviewCampaign] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'popup',
        mediaType: 'image',
        linkUrl: '',
        displayDuration: 5,
        frequency: 60,
        frequencyUnit: 'minutes',
        position: 'center',
        isActive: true,
        canClose: true,
        fullMedia: false,
        priority: 0,
        ctaText: 'PLAY NOW',
        showButton: true,
        startDate: '',
        endDate: '',
        minutesPerHour: 60,
        targetHours: [],
        // Design fields
        title: '',
        description: '',
        themeColor: '#4f46e5',
        textColor: '#ffffff',
        backgroundColor: '#1e1b4b',
        buttonColor: '#facc15',
        buttonTextColor: '#000000',
        layout: 'standard',
        overlayOpacity: 0.8
    });
    const [conflictError, setConflictError] = useState(null);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
    const fileInputRef = useRef(null);

    const fetchCampaigns = useCallback(async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/promotions`);
            setCampaigns(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            setIsLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;

        if (type === 'number' || name === 'overlayOpacity') {
            finalValue = value === '' ? '' : Number(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const toggleHour = (hour) => {
        setFormData(prev => {
            const currentHours = [...(prev.targetHours || [])];
            if (currentHours.includes(hour)) {
                return { ...prev, targetHours: currentHours.filter(h => h !== hour) };
            } else {
                return { ...prev, targetHours: [...currentHours, hour].sort((a, b) => a - b) };
            }
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'popup',
            mediaType: 'image',
            linkUrl: '',
            displayDuration: 5,
            frequency: 60,
            frequencyUnit: 'minutes',
            position: 'center',
            isActive: true,
            canClose: true,
            fullMedia: false,
            priority: 0,
            ctaText: 'PLAY NOW',
            showButton: true,
            startDate: '',
            endDate: '',
            minutesPerHour: 60,
            targetHours: [],
            title: '',
            description: '',
            themeColor: '#4f46e5',
            textColor: '#ffffff',
            backgroundColor: '#1e1b4b',
            buttonColor: '#facc15',
            buttonTextColor: '#000000',
            layout: 'standard',
            overlayOpacity: 0.8
        });
        setMediaFile(null);
        setMediaPreview('');
        setEditingCampaign(null);
        setConflictError(null);
        setActiveTab('content');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openModal = (campaign = null) => {
        setConflictError(null);
        setActiveTab('content');
        if (campaign) {
            setEditingCampaign(campaign);
            setFormData({
                name: campaign.name || '',
                type: campaign.type || 'popup',
                mediaType: campaign.mediaType || 'image',
                linkUrl: campaign.linkUrl || '',
                displayDuration: campaign.displayDuration !== undefined ? campaign.displayDuration : 5,
                frequency: campaign.frequency !== undefined ? campaign.frequency : 60,
                frequencyUnit: campaign.frequencyUnit || 'minutes',
                position: campaign.position || 'center',
                isActive: campaign.isActive !== undefined ? campaign.isActive : true,
                canClose: campaign.canClose !== undefined ? campaign.canClose : true,
                fullMedia: campaign.fullMedia || false,
                priority: campaign.priority !== undefined ? campaign.priority : 0,
                ctaText: campaign.ctaText || 'PLAY NOW',
                showButton: campaign.showButton !== undefined ? campaign.showButton : true,
                startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
                endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
                minutesPerHour: campaign.minutesPerHour || 60,
                targetHours: campaign.targetHours || [],
                title: campaign.title || '',
                description: campaign.description || '',
                themeColor: campaign.themeColor || '#4f46e5',
                textColor: campaign.textColor || '#ffffff',
                backgroundColor: campaign.backgroundColor || '#1e1b4b',
                buttonColor: campaign.buttonColor || '#facc15',
                buttonTextColor: campaign.buttonTextColor || '#000000',
                layout: campaign.layout || 'standard',
                overlayOpacity: campaign.overlayOpacity || 0.8
            });
            setMediaPreview(`${apiUrl}${campaign.mediaUrl}`);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setConflictError(null);
        const data = new FormData();

        Object.keys(formData).forEach(key => {
            if (key === 'targetHours') {
                formData[key].forEach(h => data.append('targetHours[]', h));
            } else {
                data.append(key, formData[key]);
            }
        });

        if (mediaFile) {
            data.append('media', mediaFile);
        }

        try {
            if (editingCampaign) {
                await axios.put(`${apiUrl}/api/promotions/${editingCampaign.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post(`${apiUrl}/api/promotions`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            fetchCampaigns();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving campaign:', error);
            if (error.response?.status === 409) {
                setConflictError(error.response.data.message);
            } else {
                alert('Failed to save campaign');
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await axios.delete(`${apiUrl}/api/promotions/${id}`);
            localStorage.removeItem(`promo_last_shown_${id}`);
            fetchCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axios.patch(`${apiUrl}/api/promotions/${id}/toggle`);
            fetchCampaigns();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ad Studio</h2>
                    <p className="text-slate-500 font-medium">Design and schedule premium experiences.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 transition-all flex items-center space-x-3 transform hover:scale-105 active:scale-95"
                >
                    <span className="text-xl">+</span>
                    <span>Create Campaign</span>
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {campaigns.map(campaign => (
                        <div key={campaign.id} className={`group bg-white rounded-3xl border transition-all duration-500 ${campaign.isActive ? 'border-indigo-100' : 'border-slate-100 opacity-75'} shadow-sm hover:shadow-2xl overflow-hidden`}>
                            <div className="relative aspect-video overflow-hidden bg-slate-900">
                                {campaign.mediaType === 'video' ? (
                                    <video src={`${apiUrl}${campaign.mediaUrl}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <Image
                                        src={`${apiUrl}${campaign.mediaUrl}`}
                                        alt={campaign.name}
                                        fill
                                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        unoptimized
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h3 className="font-black text-lg leading-tight truncate">{campaign.name}</h3>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">{campaign.type} • {campaign.minutesPerHour}m/hr</p>
                                </div>
                                <button
                                    onClick={() => setPreviewCampaign(campaign)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
                                >
                                    👁️
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex -space-x-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px]">👤</div>
                                        ))}
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600">+{campaign.impressions || 0}</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-bold text-slate-400">STATUS</span>
                                        <button
                                            onClick={() => handleToggleStatus(campaign.id)}
                                            className={`w-12 h-6 rounded-full p-1 transition-all ${campaign.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-all ${campaign.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Clicks</p>
                                        <p className="text-lg font-black text-slate-900">{campaign.clicks || 0}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">CTR</p>
                                        <p className="text-lg font-black text-slate-900">{campaign.impressions ? ((campaign.clicks / campaign.impressions) * 100).toFixed(1) : 0}%</p>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button onClick={() => openModal(campaign)} className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(campaign.id)} className="px-3 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col md:flex-row h-[90vh]">
                        {/* Sidebar / Tabs */}
                        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-100 p-8 flex flex-col">
                            <h3 className="text-2xl font-black text-slate-900 mb-8">{editingCampaign ? 'Edit Ad' : 'New Ad'}</h3>
                            <nav className="space-y-2 flex-1">
                                {[
                                    { id: 'content', label: 'Content & Media', icon: '📝' },
                                    { id: 'design', label: 'Visual Design', icon: '🎨' },
                                    { id: 'scheduling', label: 'Smart Scheduling', icon: '⏰' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-lg shadow-slate-200/50' : 'text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        <span className="text-xl">{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                            <div className="mt-8 pt-8 border-t border-slate-200">
                                <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 mb-4 hover:bg-indigo-700 transition-all">
                                    {editingCampaign ? 'Save Changes' : 'Publish Ad'}
                                </button>
                                <button onClick={() => setShowModal(false)} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-all">Discard</button>
                            </div>
                        </div>

                        {/* Editor Forms Area */}
                        <div className="flex-1 overflow-y-auto p-12 bg-white">
                            {activeTab === 'content' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Internal Name</label>
                                        <input name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all" placeholder="e.g. Summer Sale Popup" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Display Type</label>
                                            <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all">
                                                <option value="popup">Popup Modal</option>
                                                <option value="bottom">Sticky Banner</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Position</label>
                                            <select name="position" value={formData.position} onChange={handleInputChange} disabled={formData.type === 'bottom'} className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all disabled:opacity-30">
                                                <option value="center">Center Screen</option>
                                                <option value="top-left">Top Left</option>
                                                <option value="top-right">Top Right</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Media Source</label>
                                        <div className="border-4 border-dashed border-slate-100 rounded-3xl p-10 text-center hover:bg-indigo-50 transition-all cursor-pointer relative group">
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            {mediaPreview ? (
                                                <div className="relative group">
                                                    {formData.mediaType === 'video' || (mediaFile && mediaFile.type.startsWith('video')) ? (
                                                        <video src={mediaPreview} className="h-48 mx-auto rounded-2xl shadow-xl" autoPlay muted loop />
                                                    ) : (
                                                        <Image src={mediaPreview} width={400} height={200} className="h-48 w-auto mx-auto rounded-2xl shadow-xl object-contain" alt="Preview" unoptimized />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-all"><span className="text-white font-black">CHANGE MEDIA</span></div>
                                                </div>
                                            ) : (
                                                <div className="text-slate-300">
                                                    <span className="text-4xl block mb-4">🖼️</span>
                                                    <span className="font-black text-sm uppercase tracking-widest">Drop Creative Asset</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 rounded-[32px] p-8 text-white">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h4 className="font-black text-lg uppercase tracking-tight">Canva Mode</h4>
                                                <p className="text-xs text-slate-400 font-bold">Show only the uploaded image/video.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, fullMedia: !p.fullMedia }))}
                                                className={`w-16 h-8 rounded-full transition-all relative ${formData.fullMedia ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.fullMedia ? 'left-9' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-500 italic">Use this if your image already has text and buttons designed in Canva. We will hide all system-generated text.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Destination Link</label>
                                        <input name="linkUrl" value={formData.linkUrl} onChange={handleInputChange} className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all" placeholder="https://yourwebsite.com/sale" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'design' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Ad Title (Public)</label>
                                            <input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-black text-xl transition-all" placeholder="WIN 50% OFF TODAY!" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Ad Description</label>
                                            <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-slate-50 px-6 py-8 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all h-32" placeholder="Join over 10,000 members who saved big this week." />
                                        </div>

                                        <div className="space-y-6">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Brand Colors</label>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-bold text-slate-400 mb-1">Theme</div>
                                                    <div className="relative h-12 rounded-xl overflow-hidden border border-slate-200">
                                                        <input type="color" name="themeColor" value={formData.themeColor} onChange={handleInputChange} className="absolute inset-0 w-full h-full scale-150 cursor-pointer" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-bold text-slate-400 mb-1">Button</div>
                                                    <div className="relative h-12 rounded-xl overflow-hidden border border-slate-200">
                                                        <input type="color" name="buttonColor" value={formData.buttonColor} onChange={handleInputChange} className="absolute inset-0 w-full h-full scale-150 cursor-pointer" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Visual Style</label>
                                            <select name="layout" value={formData.layout} onChange={handleInputChange} className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all">
                                                <option value="standard">Standard Solid</option>
                                                <option value="glassmorphism">Crystal Glass</option>
                                                <option value="minimal">Ultra Minimal</option>
                                                <option value="bold">High Contrast</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Call to Action Text</label>
                                            <input name="ctaText" value={formData.ctaText} onChange={handleInputChange} className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all" placeholder="PLAY NOW" />
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1">
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Show Button</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, showButton: !p.showButton }))}
                                                    className={`w-full py-4 rounded-2xl font-black transition-all ${formData.showButton ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                                                >
                                                    {formData.showButton ? 'ENABLED' : 'DISABLED'}
                                                </button>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Force Close</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, canClose: !p.canClose }))}
                                                    className={`w-full py-4 rounded-2xl font-black transition-all ${formData.canClose ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'}`}
                                                >
                                                    {formData.canClose ? 'ALLOWED' : 'LOCKED'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'scheduling' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                    <div className="bg-indigo-600 p-8 rounded-[32px] text-white">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="font-black text-xl uppercase tracking-tighter">Hourly Capacity</h4>
                                            <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-black">{formData.minutesPerHour} MINS / HOUR</span>
                                        </div>
                                        <input type="range" name="minutesPerHour" min="1" max="60" value={formData.minutesPerHour} onChange={handleInputChange} className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer accent-white mb-8" />

                                        <p className="text-xs font-bold text-white/60 mb-4 uppercase tracking-widest">Active Hours Selection</p>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                                            {[...Array(24).keys()].map(h => (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    onClick={() => toggleHour(h)}
                                                    className={`py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${formData.targetHours.includes(h) ? 'bg-white text-indigo-600 border-white' : 'bg-transparent border-white/20 text-white/40 hover:border-white/40'}`}
                                                >
                                                    {h}:00
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Auto-Close (Seconds)</label>
                                            <input type="number" name="displayDuration" value={formData.displayDuration} onChange={handleInputChange} className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Priority Weight</label>
                                            <input type="number" name="priority" value={formData.priority} onChange={handleInputChange} className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" />
                                        </div>
                                        <div className="col-span-2 grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Broadcast Start</label>
                                                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Broadcast End</label>
                                                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" />
                                            </div>
                                        </div>
                                    </div>

                                    {conflictError && (
                                        <div className="bg-red-500 p-6 rounded-2xl text-white font-black text-sm flex items-center space-x-4">
                                            <span>⚠️</span>
                                            <p>{conflictError}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Real-time Preview Area (The Canva Part) */}
                        <div className="hidden lg:flex w-[500px] bg-slate-100 items-center justify-center p-8 border-l border-slate-200">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <p className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">Live Canvas Preview</p>
                                <div className="w-full aspect-[4/5] bg-white rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col">
                                    {/* Mock Content Background */}
                                    <div className="absolute inset-0 opacity-10 pointer-events-none p-6">
                                        <div className="h-4 w-1/2 bg-slate-400 mb-4 rounded"></div>
                                        <div className="h-2 w-full bg-slate-300 mb-2 rounded"></div>
                                        <div className="h-2 w-full bg-slate-300 mb-2 rounded"></div>
                                        <div className="h-2 w-3/4 bg-slate-300 mb-8 rounded"></div>
                                        <div className="h-24 w-full bg-slate-200 rounded-xl"></div>
                                    </div>

                                    {/* The Ad Component in Preview */}
                                    <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-8 transition-all`}>
                                        {formData.fullMedia ? (
                                            /* PURE MEDIA PREVIEW */
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="w-full shadow-2xl rounded-2xl overflow-hidden bg-slate-800">
                                                    {mediaPreview ? (
                                                        <div className="relative aspect-video">
                                                            {formData.mediaType === 'video' || (mediaFile && mediaFile.type.startsWith('video')) ? (
                                                                <video src={mediaPreview} className="w-full h-full object-cover" autoPlay muted loop />
                                                            ) : (
                                                                <Image src={mediaPreview} alt="Preview" fill className="object-cover" unoptimized />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="aspect-video bg-slate-700 flex items-center justify-center text-slate-500 font-bold uppercase text-[10px] tracking-widest">Full Media Preview</div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            /* STANDARD BUILDER PREVIEW */
                                            <div
                                                className={`w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl transition-all duration-500 ${formData.layout === 'glassmorphism' ? 'bg-white/60 backdrop-blur-xl border border-white/40' : (formData.layout === 'minimal' ? 'bg-white border-none' : 'bg-white')}`}
                                                style={{
                                                    backgroundColor: formData.layout === 'standard' || formData.layout === 'bold' ? formData.backgroundColor : '',
                                                    border: formData.layout === 'bold' ? `4px solid ${formData.themeColor}` : ''
                                                }}
                                            >
                                                {mediaPreview && (
                                                    <div className="relative aspect-video">
                                                        {formData.mediaType === 'video' || (mediaFile && mediaFile.type.startsWith('video')) ? (
                                                            <video src={mediaPreview} className="w-full h-full object-cover" autoPlay muted loop />
                                                        ) : (
                                                            <Image src={mediaPreview} alt="Preview" fill className="object-cover" unoptimized />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="p-6">
                                                    <h4
                                                        className="font-black text-xl mb-2"
                                                        style={{ color: formData.layout === 'standard' || formData.layout === 'bold' ? formData.textColor : '#1e293b' }}
                                                    >
                                                        {formData.title || 'Your Stunning Title'}
                                                    </h4>
                                                    <p
                                                        className="text-sm font-medium opacity-80 mb-6 line-clamp-3"
                                                        style={{ color: formData.layout === 'standard' || formData.layout === 'bold' ? formData.textColor : '#64748b' }}
                                                    >
                                                        {formData.description || 'Add an irresistible description to grab your users attention instantly.'}
                                                    </p>
                                                    {formData.showButton && (
                                                        <button
                                                            className="w-full py-4 rounded-xl font-black shadow-lg transform active:scale-95 transition-all text-sm uppercase tracking-wider"
                                                            style={{
                                                                backgroundColor: formData.buttonColor,
                                                                color: formData.buttonTextColor,
                                                                boxShadow: `0 10px 20px -5px ${formData.buttonColor}60`
                                                            }}
                                                        >
                                                            {formData.ctaText || 'ACTION BUTTON'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Public/External Details Preview */}
            {previewCampaign && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setPreviewCampaign(null)}>
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-5xl w-full h-[80vh] flex overflow-hidden group" onClick={e => e.stopPropagation()}>
                        <div className="flex-1 bg-black relative">
                            {previewCampaign.mediaType === 'video' ? (
                                <video src={`${apiUrl}${previewCampaign.mediaUrl}`} className="w-full h-full object-contain" autoPlay controls />
                            ) : (
                                <Image src={`${apiUrl}${previewCampaign.mediaUrl}`} alt="Preview" fill className="object-contain" unoptimized />
                            )}
                        </div>
                        <div className="w-96 p-12 flex flex-col bg-white">
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Live Performance</p>
                                <h3 className="text-3xl font-black text-slate-900 mb-2">{previewCampaign.name}</h3>
                                <p className="text-slate-400 font-bold mb-10 italic">{previewCampaign.type} Ad</p>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                        <span className="text-xs font-black text-slate-400 uppercase">Impressions</span>
                                        <span className="font-black text-slate-900">{previewCampaign.impressions || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                        <span className="text-xs font-black text-slate-400 uppercase">Clicks</span>
                                        <span className="font-black text-slate-900">{previewCampaign.clicks || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                        <span className="text-xs font-black text-slate-400 uppercase">CTR</span>
                                        <span className="font-black text-indigo-600">
                                            {previewCampaign.impressions ? ((previewCampaign.clicks / previewCampaign.impressions) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setPreviewCampaign(null)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Done Reviewing</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignManager;
