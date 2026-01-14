import React, { useState, useEffect } from 'react';
import { appointmentApi, doctorApi, newsApi, uploadApi } from '../services/api';
import { Appointment, Doctor, NewsItem } from '../types';
import { Calendar, Users, Activity, Trash2, Check, X, Plus, Search, Filter, Pencil, AlertCircle, Newspaper, Image as ImageIcon, Upload, Play, Server, Database, Cloud, Clock, History, ExternalLink } from 'lucide-react';

// Helper
const isVideo = (url?: string) => {
    if (!url) return false;
    return url.includes('/video/upload/') || url.match(/\.(mp4|webm|ogg|mov)$/i);
};

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors' | 'news'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Status Filter State
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  // History State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<Appointment[]>([]);
  const [historyPatientName, setHistoryPatientName] = useState('');

  // Health Status
  const [health, setHealth] = useState<{server: string; database: string; cloudinary: string} | null>(null);

  // Common Upload State
  const [uploading, setUploading] = useState(false);

  // Doctor Form State
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [doctorForm, setDoctorForm] = useState<Partial<Doctor>>({
    name: '',
    specialization: '',
    experience: 0,
    description: '',
    availability: [],
    image: 'https://images.unsplash.com/photo-1537368910025-bc005fbede68?auto=format&fit=crop&q=80&w=300'
  });

  // News Form State
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({
    title: '',
    content: '',
    category: 'announcement',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a092dd14?auto=format&fit=crop&q=80&w=600',
    date: new Date().toISOString()
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Health Check using relative URL to use proxy
      try {
          const healthRes = await fetch('/api/health');
          if (healthRes.ok) {
              const healthData = await healthRes.json();
              setHealth(healthData);
          } else {
              setHealth({ server: 'offline', database: 'unknown', cloudinary: 'unknown' });
          }
      } catch (e) {
          setHealth({ server: 'offline', database: 'unknown', cloudinary: 'unknown' });
      }

      const [appts, docs, newsItems] = await Promise.all([
        appointmentApi.getAll(),
        doctorApi.getAll(),
        newsApi.getAll()
      ]);
      setAppointments(appts);
      setDoctors(docs);
      setNews(newsItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    await appointmentApi.updateStatus(id, status);
    fetchData(); // Refresh
  };

  const handleViewHistory = async (patientName: string, patientEmail: string) => {
    setHistoryPatientName(patientName);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const history = await appointmentApi.getAll({ patientEmail });
      setSelectedPatientHistory(history);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'doctor' | 'news') => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setFormError(null);
      
      try {
          const url = await uploadApi.uploadFile(file);
          if (type === 'doctor') {
              setDoctorForm(prev => ({ ...prev, image: url }));
          } else {
              setNewsForm(prev => ({ ...prev, image: url }));
          }
      } catch (error) {
          console.error("Upload failed", error);
          setFormError("Image upload failed. Server might be offline or Cloudinary unconfigured.");
      } finally {
          setUploading(false);
          // Reset input to allow selecting the same file again if needed
          e.target.value = '';
      }
  };

  // Doctor Handlers
  const resetDoctorForm = () => {
    setDoctorForm({
        name: '',
        specialization: '',
        experience: 0,
        description: '',
        availability: [],
        image: 'https://images.unsplash.com/photo-1537368910025-bc005fbede68?auto=format&fit=crop&q=80&w=300'
    });
    setEditingDoctorId(null);
    setShowDoctorForm(false);
    setFormError(null);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setDoctorForm({
      name: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      description: doctor.description,
      availability: doctor.availability,
      image: doctor.image
    });
    setEditingDoctorId(doctor.id);
    setShowDoctorForm(true);
    setActiveTab('doctors');
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!doctorForm.name || !doctorForm.specialization || !doctorForm.description) {
      setFormError("Name, Specialization, and Description are required.");
      return;
    }

    try {
      if (editingDoctorId) {
        await doctorApi.update(editingDoctorId, doctorForm);
      } else {
        await doctorApi.create(doctorForm as Omit<Doctor, 'id'>);
      }
      resetDoctorForm();
      fetchData();
    } catch (err) {
      console.error(err);
      setFormError("Failed to save doctor details.");
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      await doctorApi.delete(id);
      fetchData();
    }
  };

  // News Handlers
  const resetNewsForm = () => {
      setNewsForm({
        title: '',
        content: '',
        category: 'announcement',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a092dd14?auto=format&fit=crop&q=80&w=600',
        date: new Date().toISOString()
      });
      setEditingNewsId(null);
      setShowNewsForm(false);
      setFormError(null);
  };

  const handleEditNews = (item: NewsItem) => {
      setNewsForm({
          title: item.title,
          content: item.content,
          category: item.category,
          image: item.image,
          date: item.date
      });
      setEditingNewsId(item.id);
      setShowNewsForm(true);
      setActiveTab('news');
  };

  const handleSaveNews = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      if(!newsForm.title || !newsForm.content) {
          setFormError("Title and Content are required");
          return;
      }

      try {
        if(editingNewsId) {
            await newsApi.update(editingNewsId, newsForm);
        } else {
            await newsApi.create(newsForm as Omit<NewsItem, 'id'>);
        }
        resetNewsForm();
        fetchData();
      } catch(err) {
          console.error(err);
          setFormError("Failed to save news item.");
      }
  };

  const handleDeleteNews = async (id: string) => {
      if(window.confirm("Are you sure you want to delete this post?")) {
          await newsApi.delete(id);
          fetchData();
      }
  };

  // Filtered Appointments Logic
  const filteredAppointments = appointments.filter(appt => {
    if (statusFilter === 'all') return true;
    return appt.status === statusFilter;
  });

  const getStatusCount = (status: string) => {
    if (status === 'all') return appointments.length;
    return appointments.filter(a => a.status === status).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of hospital operations</p>
          </div>
          <div className="flex flex-col items-end gap-2">
             <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm font-medium text-slate-600">
               {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </div>
          </div>
        </header>

        {/* System Health Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${health?.server === 'online' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <Server className="w-5 h-5" />
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">API Server</span>
                    <span className="font-bold">{health?.server === 'online' ? 'Online' : 'Offline Mode'}</span>
                </div>
            </div>
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${health?.database === 'connected' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                <Database className="w-5 h-5" />
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">Database</span>
                    <span className="font-bold capitalize">{health?.database || 'Unknown'}</span>
                </div>
            </div>
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${health?.cloudinary === 'configured' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                <Cloud className="w-5 h-5" />
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">File Storage</span>
                    <span className="font-bold capitalize">{health?.cloudinary === 'configured' ? 'Ready' : 'Not Configured'}</span>
                </div>
            </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Total Appointments</p>
              <h3 className="text-3xl font-bold text-slate-900">{appointments.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="p-4 bg-teal-50 rounded-xl text-teal-600">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Active Doctors</p>
              <h3 className="text-3xl font-bold text-slate-900">{doctors.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
              <Newspaper className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">News Posts</p>
              <h3 className="text-3xl font-bold text-slate-900">
                {news.length}
              </h3>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Custom Tabs */}
          <div className="border-b border-slate-200 bg-slate-50/50">
            <nav className="flex px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-5 px-6 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'appointments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Appointments List
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                className={`py-5 px-6 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'doctors'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Doctors Management
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`py-5 px-6 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'news'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                News & Events
              </button>
            </nav>
          </div>

          <div className="p-6 md:p-8">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading data...</div>
            ) : activeTab === 'appointments' ? (
              <div className="space-y-6">
                {/* Status Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Filter Status:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'All', icon: Activity, color: 'slate' },
                      { id: 'pending', label: 'Pending', icon: Clock, color: 'amber' },
                      { id: 'confirmed', label: 'Confirmed', icon: Check, color: 'green' },
                      { id: 'cancelled', label: 'Cancelled', icon: X, color: 'red' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setStatusFilter(btn.id as any)}
                        className={`
                          flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                          ${statusFilter === btn.id 
                            ? `bg-${btn.color}-600 text-white border-${btn.color}-600 shadow-md` 
                            : `bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700`
                          }
                        `}
                      >
                        <btn.icon className="w-3.5 h-3.5" />
                        {btn.label}
                        <span className={`
                          ml-1 px-1.5 py-0.5 rounded-md text-[10px]
                          ${statusFilter === btn.id ? 'bg-white/20' : 'bg-slate-100'}
                        `}>
                          {getStatusCount(btn.id)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Info</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Doctor</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredAppointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-slate-900">{appt.patientName}</div>
                            <div className="text-sm text-slate-500">{appt.patientPhone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{appt.doctorName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            <div className="font-medium">{new Date(appt.date).toLocaleDateString()}</div>
                            <div className="text-slate-400 text-xs">{new Date(appt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                              appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                              appt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleViewHistory(appt.patientName, appt.patientEmail)}
                                  className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg transition-colors hover:bg-blue-50"
                                  title="View History"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                                {appt.status === 'pending' && (
                                  <>
                                    <button 
                                      onClick={() => handleStatusUpdate(appt.id, 'confirmed')} 
                                      className="text-white bg-green-500 hover:bg-green-600 p-1.5 rounded-lg transition-colors shadow-sm"
                                      title="Confirm"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleStatusUpdate(appt.id, 'cancelled')} 
                                      className="text-white bg-red-500 hover:bg-red-600 p-1.5 rounded-lg transition-colors shadow-sm"
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredAppointments.length === 0 && (
                          <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                {statusFilter === 'all' 
                                  ? 'No appointments found.' 
                                  : `No ${statusFilter} appointments found.`
                                }
                              </td>
                          </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'doctors' ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Medical Staff Directory</h3>
                  <button 
                    onClick={() => {
                        resetDoctorForm();
                        setShowDoctorForm(!showDoctorForm);
                    }}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" /> {showDoctorForm && !editingDoctorId ? 'Close Form' : 'Add Doctor'}
                  </button>
                </div>

                {showDoctorForm && (
                  <form onSubmit={handleSaveDoctor} className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200 shadow-inner">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold text-slate-800">
                            {editingDoctorId ? 'Edit Doctor Profile' : 'New Doctor Profile'}
                        </h4>
                        {formError && (
                            <div className="text-red-600 text-sm flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                                <AlertCircle className="w-4 h-4" /> {formError}
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Full Name *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Dr. Sarah Smith" 
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={doctorForm.name}
                            onChange={e => setDoctorForm({...doctorForm, name: e.target.value})}
                          />
                      </div>
                      
                      <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Specialization *</label>
                          <input 
                            type="text"
                            required 
                            placeholder="e.g. Cardiology" 
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={doctorForm.specialization}
                            onChange={e => setDoctorForm({...doctorForm, specialization: e.target.value})}
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Experience (Years)</label>
                          <input 
                            type="number" 
                            min="0"
                            placeholder="0" 
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={doctorForm.experience}
                            onChange={e => setDoctorForm({...doctorForm, experience: parseInt(e.target.value) || 0})}
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Availability (Comma separated)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Mon, Tue, Fri" 
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={doctorForm.availability?.join(', ')}
                            onChange={e => setDoctorForm({...doctorForm, availability: e.target.value.split(',').map(d => d.trim())})}
                          />
                      </div>

                       <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-semibold text-slate-700">Profile Image</label>
                          <div className="flex items-center gap-4">
                              <img src={doctorForm.image} alt="Preview" className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200" />
                              <div className="flex-1">
                                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl transition-all w-fit">
                                      <Upload className="w-4 h-4" />
                                      <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                                      <input 
                                          type="file" 
                                          accept="image/*" 
                                          className="hidden" 
                                          onChange={(e) => handleFileUpload(e, 'doctor')}
                                          disabled={uploading}
                                      />
                                  </label>
                                  <p className="text-xs text-slate-400 mt-2">Recommended: Square aspect ratio, max 2MB.</p>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-semibold text-slate-700">Professional Bio *</label>
                          <textarea 
                            required
                            placeholder="Description of expertise and background..."
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 transition-all"
                            value={doctorForm.description}
                            onChange={e => setDoctorForm({...doctorForm, description: e.target.value})}
                          />
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3 justify-end border-t border-slate-200 pt-5">
                      <button 
                        type="button" 
                        onClick={resetDoctorForm} 
                        className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                        disabled={uploading}
                      >
                        {editingDoctorId ? 'Update Doctor' : 'Save Doctor'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => (
                    <div key={doctor.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-4 group hover:border-blue-300 hover:shadow-md transition-all relative">
                       <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-xl object-cover shadow-sm bg-white" />
                       <div className="flex-1 min-w-0 pr-8">
                         <h4 className="font-bold text-slate-900 truncate">{doctor.name}</h4>
                         <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">{doctor.specialization}</p>
                         <div className="flex flex-wrap gap-1 mb-2">
                           {doctor.availability.map(day => (
                             <span key={day} className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">{day}</span>
                           ))}
                         </div>
                         <p className="text-xs text-slate-400 line-clamp-1">{doctor.experience} Years Exp.</p>
                       </div>
                       
                       <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEditDoctor(doctor)}
                                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDeleteDoctor(doctor.id)}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Hospital News & Updates</h3>
                        <button 
                            onClick={() => {
                                resetNewsForm();
                                setShowNewsForm(!showNewsForm);
                            }}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all text-sm font-semibold"
                        >
                            <Plus className="w-4 h-4" /> {showNewsForm && !editingNewsId ? 'Close Form' : 'Add Post'}
                        </button>
                    </div>

                    {showNewsForm && (
                        <form onSubmit={handleSaveNews} className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200 shadow-inner">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-lg font-bold text-slate-800">
                                    {editingNewsId ? 'Edit Post' : 'New Post'}
                                </h4>
                                {formError && (
                                    <div className="text-red-600 text-sm flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                                        <AlertCircle className="w-4 h-4" /> {formError}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Post Title *</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={newsForm.title}
                                        onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Category</label>
                                        <select 
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                            value={newsForm.category}
                                            onChange={e => setNewsForm({...newsForm, category: e.target.value as any})}
                                        >
                                            <option value="announcement">Announcement</option>
                                            <option value="health-tip">Health Tip</option>
                                            <option value="event">Event</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Cover Image</label>
                                        <div className="flex items-center gap-4">
                                            {newsForm.image && (
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                                                     {isVideo(newsForm.image) ? (
                                                         <video src={newsForm.image} className="w-full h-full object-cover" muted />
                                                     ) : (
                                                         <img src={newsForm.image} alt="Preview" className="w-full h-full object-cover" />
                                                     )}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl transition-all w-fit">
                                                    <Upload className="w-4 h-4" />
                                                    <span>{uploading ? 'Uploading...' : 'Upload Image/Video'}</span>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*,video/*" 
                                                        className="hidden" 
                                                        onChange={(e) => handleFileUpload(e, 'news')}
                                                        disabled={uploading}
                                                    />
                                                </label>
                                                <p className="text-xs text-slate-400 mt-2">Support for Images and Videos.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Content *</label>
                                    <textarea 
                                        required
                                        rows={4}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                                        value={newsForm.content}
                                        onChange={e => setNewsForm({...newsForm, content: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3 justify-end border-t border-slate-200 pt-5">
                                <button 
                                    type="button" 
                                    onClick={resetNewsForm} 
                                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                                    disabled={uploading}
                                >
                                    {editingNewsId ? 'Update Post' : 'Save Post'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="grid gap-4">
                        {news.map(item => {
                            const isItemVideo = isVideo(item.image);
                            return (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 group">
                                    <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative">
                                        {isItemVideo ? (
                                            <>
                                              <video src={item.image} className="w-full h-full object-cover" muted />
                                              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                  <Play className="w-6 h-6 text-white drop-shadow-md" />
                                              </div>
                                            </>
                                        ) : (
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-500 mb-2">
                                                    {item.category}
                                                </span>
                                                <h4 className="font-bold text-lg text-slate-900 mb-1">{item.title}</h4>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditNews(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteNews(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-slate-500 text-sm line-clamp-2">{item.content}</p>
                                        <p className="text-xs text-slate-400 mt-2">Posted on: {new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setHistoryModalOpen(false)}
          />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col animate-[fadeIn_0.2s_ease-out]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Appointment History</h2>
                  <p className="text-slate-500 text-sm">Patient: <span className="font-semibold text-slate-900">{historyPatientName}</span></p>
                </div>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 bg-slate-50 flex-grow">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium">Fetching historical records...</p>
                </div>
              ) : selectedPatientHistory.length > 0 ? (
                <div className="space-y-4">
                  {selectedPatientHistory.map((hAppt) => (
                    <div key={hAppt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex gap-4 items-start">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center min-w-[70px]">
                            <span className="block text-xl font-bold text-slate-900">{new Date(hAppt.date).getDate()}</span>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(hAppt.date).toLocaleString('default', { month: 'short' })}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">Dr. {hAppt.doctorName}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(hAppt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(hAppt.date).getFullYear()}</span>
                            </div>
                            <div className="mt-3 text-sm text-slate-600">
                              <p><span className="font-semibold text-slate-900">Symptoms:</span> {hAppt.symptoms}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            hAppt.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                            hAppt.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {hAppt.status}
                          </span>
                          {hAppt.flowStatus === 'complete' && (
                            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">Visit Completed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500">No previous appointment history found.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end">
                <button 
                  onClick={() => setHistoryModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                >
                  Close Records
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;