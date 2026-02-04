'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Image from 'next/image';

const CampaignManager = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
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
        endDate: ''
    });
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';
    const fileInputRef = useRef(null);

    const fetchCampaigns = useCallback(async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${apiUrl}/api/promotions`, {
                // headers: { Authorization: `Bearer ${token}` } // Uncomment if auth is added
            });
            setCampaigns(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            setIsLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        const init = async () => {
            await fetchCampaigns();
        };
        init();
    }, [fetchCampaigns]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;

        // Handle numbers correctly so the inputs show them as numbers
        if (type === 'number') {
            finalValue = value === '' ? '' : Number(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
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
            endDate: ''
        });
        setMediaFile(null);
        setMediaPreview('');
        setEditingCampaign(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openModal = (campaign = null) => {
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
                endDate: campaign.endDate ? campaign.endDate.split('T')[0] : ''
            });
            setMediaPreview(`${apiUrl}${campaign.mediaUrl}`);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        // Append all form fields
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
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
            alert('Failed to save campaign');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await axios.delete(`${apiUrl}/api/promotions/${id}`);
            fetchCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axios.patch(`${apiUrl}/api/promotions/${id}/toggle`);
            fetchCampaigns(); // Refresh to update UI
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };



    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Campaigns</h2>
                    <p className="text-slate-500">Manage placement, duration, and media.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2"
                >
                    <span>+ New Campaign</span>
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map(campaign => (
                        <div key={campaign.id} className={`bg-white rounded-2xl border ${campaign.isActive ? 'border-indigo-100' : 'border-slate-100 bg-slate-50'} shadow-sm hover:shadow-xl transition-all p-5 group`}>
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-4 cursor-pointer" onClick={() => { setEditingCampaign(campaign); setMediaPreview(`${apiUrl}${campaign.mediaUrl}`); setPreviewCampaign(campaign); }}>
                                {campaign.mediaType === 'video' ? (
                                    <video src={`${apiUrl}${campaign.mediaUrl}`} className="w-full h-full object-cover" />
                                ) : (
                                    <Image
                                        src={`${apiUrl}${campaign.mediaUrl}`}
                                        alt={campaign.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="bg-white/90 text-slate-900 px-3 py-1 rounded-full text-xs font-bold">Preview</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-slate-900">{campaign.name}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{campaign.type}</span>
                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase">Prio: {campaign.priority || 0}</span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleToggleStatus(campaign.id)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${campaign.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                                        {campaign.isActive ? '✓' : '✕'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                                <div>
                                    <span className="block font-bold text-slate-700">{campaign.impressions || 0}</span>
                                    Views
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-700">{campaign.clicks || 0}</span>
                                    Clicks
                                </div>
                                <div className="col-span-2 mt-2 pt-2 border-t border-slate-50 italic">
                                    {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Immediate'}
                                    {campaign.endDate ? ` → ${new Date(campaign.endDate).toLocaleDateString()}` : ' (No expiry)'}
                                </div>
                            </div>

                            <div className="mt-4 flex space-x-2">
                                <button onClick={() => openModal(campaign)} className="flex-1 bg-indigo-50 text-indigo-600 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">Edit</button>
                                <button onClick={() => handleDelete(campaign.id)} className="flex-1 bg-red-50 text-red-500 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">Delete</button>
                            </div>
                        </div>
                    ))}

                    {campaigns.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-400">
                            No campaigns created yet. Start a new one!
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-800">{editingCampaign ? 'Edit Campaign' : 'New Campaign'}</h3>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-red-500 flex items-center justify-center shadow-sm transition-all">✕</button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Name</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                            placeholder="e.g. Summer Sale 2026"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                                        <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all bg-white font-medium">
                                            <option value="popup">Popup / Modal</option>
                                            <option value="bottom">Bottom Sticky Bar</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Screen Position</label>
                                        <select name="position" value={formData.position} onChange={handleInputChange} disabled={formData.type === 'bottom'} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all bg-white font-medium disabled:opacity-50">
                                            <option value="center">Center (Standard)</option>
                                            <option value="top-left">Top Left</option>
                                            <option value="top-right">Top Right</option>
                                            <option value="bottom-left">Bottom Left</option>
                                            <option value="bottom-right">Bottom Right</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Media File (Image, GIF, Video)</label>
                                        <div className="border-2 border-dashed border-indigo-100 rounded-xl p-8 text-center hover:bg-indigo-50 transition-colors cursor-pointer relative group">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*,video/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {mediaPreview ? (
                                                <div className="relative inline-block">
                                                    {formData.mediaType === 'video' || (mediaFile && mediaFile.type.startsWith('video')) ? (
                                                        <video src={mediaPreview} className="h-32 rounded-lg shadow-md" autoPlay muted loop />
                                                    ) : (
                                                        <Image src={mediaPreview} width={200} height={128} className="h-32 w-auto rounded-lg shadow-md object-contain" alt="Preview" unoptimized />
                                                    )}
                                                    <p className="text-xs text-indigo-600 font-bold mt-2">Click to replace</p>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400">
                                                    <span className="text-2xl block mb-2">📁</span>
                                                    <span className="font-bold text-sm">Drag & Drop or Click to Upload</span>
                                                    <p className="text-xs mt-1">Supports JPG, PNG, GIF, MP4</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Display Duration (sec)</label>
                                        <input
                                            type="number"
                                            name="displayDuration"
                                            value={formData.displayDuration}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Popup stay time. 0 = permanent.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Display Priority</label>
                                        <input
                                            type="number"
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Higher shows first (e.g. 10 vs 1).</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Show Every</label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="number"
                                                name="frequency"
                                                value={formData.frequency}
                                                onChange={handleInputChange}
                                                className="w-20 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                            />
                                            <select name="frequencyUnit" value={formData.frequencyUnit} onChange={handleInputChange} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all bg-white font-medium">
                                                <option value="minutes">Minutes</option>
                                                <option value="hours">Hours</option>
                                                <option value="days">Days</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Destination URL</label>
                                            <input
                                                name="linkUrl"
                                                value={formData.linkUrl}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                                placeholder="https://"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Button Text</label>
                                            <input
                                                name="ctaText"
                                                value={formData.ctaText}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                                placeholder="PLAY NOW"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 col-span-2">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Start Date (Optional)</label>
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">End Date (Optional)</label>
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-3">
                                        <div className="flex items-center space-x-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                            <input
                                                type="checkbox"
                                                id="canClose"
                                                name="canClose"
                                                checked={formData.canClose}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                            <label htmlFor="canClose" className="text-sm font-bold text-indigo-900">Allow users to close this ad manually</label>
                                        </div>

                                        {formData.type === 'bottom' && (
                                            <div className="flex items-center space-x-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                                <input
                                                    type="checkbox"
                                                    id="fullMedia"
                                                    name="fullMedia"
                                                    checked={formData.fullMedia}
                                                    onChange={handleInputChange}
                                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                                />
                                                <label htmlFor="fullMedia" className="text-sm font-bold text-indigo-900">Full Image Banner & Entire Bar Clickable</label>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <input
                                                type="checkbox"
                                                id="showButton"
                                                name="showButton"
                                                checked={formData.showButton}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-slate-600 rounded focus:ring-slate-500"
                                            />
                                            <label htmlFor="showButton" className="text-sm font-bold text-slate-700">Display Action Button (e.g. Play Now)</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end space-x-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                                    <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transform hover:scale-105 transition-all">
                                        {editingCampaign ? 'Save Changes' : 'Launch Campaign'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Overlay */}
            {previewCampaign && (
                <PreviewOverlay
                    campaign={formData.name ? formData : previewCampaign}
                    onClose={() => setPreviewCampaign(null)}
                    mediaPreview={mediaPreview}
                />
            )}
        </div>
    );
};

// --- Preview Component ---
const PreviewOverlay = ({ campaign, onClose, mediaPreview }) => {
    if (!campaign) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">
                        Preview: <span className="text-indigo-600">{campaign.name}</span>
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <span className="text-2xl">×</span>
                    </button>
                </div>

                <div className="relative w-full h-[600px] border-4 border-slate-900 rounded-2xl overflow-hidden bg-slate-50 shadow-inner">
                    {/* Mock Site Content */}
                    <div className="absolute inset-0 p-8 opacity-20 pointer-events-none">
                        <div className="h-8 bg-slate-300 w-1/3 mb-8 rounded"></div>
                        <div className="h-4 bg-slate-300 w-full mb-4 rounded"></div>
                        <div className="h-4 bg-slate-300 w-full mb-4 rounded"></div>
                        <div className="h-4 bg-slate-300 w-2/3 mb-12 rounded"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-40 bg-slate-200 rounded"></div>
                            <div className="h-40 bg-slate-200 rounded"></div>
                        </div>
                    </div>

                    {/* The Actual Ad */}
                    <div className={`absolute ${campaign.type === 'bottom' ? 'bottom-0 left-0 w-full' : (campaign.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : '')} ${campaign.position === 'top-left' ? 'top-4 left-4' : ''} ${campaign.position === 'top-right' ? 'top-4 right-4' : ''} ${campaign.position === 'bottom-left' ? 'bottom-4 left-4' : ''} ${campaign.position === 'bottom-right' ? 'bottom-4 right-4' : ''} transition-all duration-500`}>

                        {campaign.type === 'popup' && (
                            <div className="bg-white p-4 rounded-xl shadow-2xl max-w-xs relative animate-bounce-in">
                                {(campaign.canClose !== false) && (
                                    <button className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
                                )}
                                {campaign.mediaType === 'video' ? (
                                    <video src={mediaPreview} autoPlay loop muted className="w-full rounded-lg mb-2" />
                                ) : (
                                    <Image src={mediaPreview} alt="Ad" width={400} height={400} className="w-full rounded-lg mb-2 object-cover" unoptimized />
                                )}
                                {campaign.showButton !== false && (
                                    <a href="#" className="block w-full bg-indigo-600 text-white text-center py-2 rounded-lg font-bold text-sm mt-2">{campaign.ctaText || 'Learn More'}</a>
                                )}
                            </div>
                        )}

                        {campaign.type === 'bottom' && (
                            <div className="absolute bottom-0 left-0 w-full z-[100] bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-t-2 border-indigo-500 shadow-[0_-10px_40px_rgba(79,70,229,0.3)]">
                                <div className={`flex items-center justify-between ${campaign.fullMedia ? 'h-24' : 'h-20 px-4'} relative overflow-hidden`}>
                                    {campaign.fullMedia ? (
                                        <div className="absolute inset-0 w-full h-full">
                                            {campaign.mediaType === 'video' ? (
                                                <video src={mediaPreview} autoPlay loop muted className="w-full h-full object-cover" />
                                            ) : (
                                                <Image src={mediaPreview} alt="Ad" fill className="object-cover" unoptimized />
                                            )}
                                            {/* Overlay to ensure close button is visible if enabled */}
                                            {campaign.canClose !== false && (
                                                <button className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 rounded-full text-white text-sm z-30">✕</button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-white/5 opacity-20 bg-[length:4px_4px]"></div>
                                            <div className="absolute top-0 left-1/4 w-32 h-full bg-white/5 skew-x-[-20deg] blur-xl"></div>

                                            {/* Left */}
                                            <div className="flex items-center h-full flex-1">
                                                <div className="relative h-16 aspect-[16/9] mr-4 overflow-hidden -skew-x-12 border-r-2 border-indigo-500/50">
                                                    {campaign.mediaType === 'video' ? (
                                                        <video src={mediaPreview} autoPlay loop muted className="w-full h-full object-cover skew-x-12 scale-110" />
                                                    ) : (
                                                        <Image src={mediaPreview} alt="Ad" fill className="object-cover skew-x-12 scale-110" unoptimized />
                                                    )}
                                                </div>
                                                <div className="z-10">
                                                    <h3 className="font-black text-white text-lg italic tracking-wider uppercase drop-shadow">
                                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">{campaign.name || 'Campaign'}</span>
                                                    </h3>
                                                    <p className="text-[10px] text-indigo-200 font-bold tracking-wide uppercase">Limited Time Offer</p>
                                                </div>
                                            </div>

                                            {/* Right */}
                                            <div className="flex items-center space-x-4">
                                                {campaign.showButton !== false && (
                                                    <button className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 font-black text-sm uppercase italic tracking-widest -skew-x-12 border-2 border-yellow-200 shadow-lg glow">
                                                        <span className="skew-x-12">{campaign.ctaText || 'Play Now'}</span>
                                                    </button>
                                                )}
                                                {campaign.canClose !== false && (
                                                    <button className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-white/50 text-xs">✕</button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-center text-slate-400 text-xs mt-4">
                    * This is a simulated preview. Actual rendering may vary slightly based on screen size.
                </p>
            </div>
        </div>
    );
};

export default CampaignManager;
