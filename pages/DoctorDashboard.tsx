import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { appointmentApi, doctorApi } from '../services/api';
import { Appointment, Doctor } from '../types';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!user?.email) return;
      
      try {
        // 1. Fetch Doctor Profile
        const docs = await doctorApi.getAll({ email: user.email });
        if (docs.length > 0) {
            const me = docs[0];
            setDoctorProfile(me);
            // 2. Fetch Appointments for this doctor
            const appts = await appointmentApi.getAll({ doctorId: me.id });
            setAppointments(appts);
        } else {
            setError("Doctor profile not found. Please contact admin to link your account.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user?.email]);

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    try {
        await appointmentApi.updateStatus(id, status);
        // Optimistic update
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (e) {
        alert("Failed to update status");
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading your dashboard...</div>;

  if (error) return (
      <div className="p-10 flex justify-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dr. {doctorProfile?.name || user?.name}</h1>
                <p className="text-slate-500 mt-1">{doctorProfile?.specialization} • Dashboard</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase">Today</span>
                    <span className="block text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats / Profile Summary */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Availability</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {doctorProfile?.availability.map(day => (
                            <span key={day} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">{day}</span>
                        ))}
                    </div>
                    <button className="text-teal-600 text-sm font-bold hover:underline flex items-center gap-1">
                        <Settings className="w-4 h-4" /> Manage Schedule
                    </button>
                </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Summary</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Total Appointments</span>
                            <span className="font-bold text-slate-900">{appointments.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Pending</span>
                            <span className="font-bold text-amber-500">{appointments.filter(a => a.status === 'pending').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Confirmed</span>
                            <span className="font-bold text-green-500">{appointments.filter(a => a.status === 'confirmed').length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointments List */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
                    </div>
                    {appointments.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            You have no appointments scheduled.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {appointments.map(appt => (
                                <div key={appt.id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900">{appt.patientName}</h4>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(appt.date).toLocaleString()}</span>
                                                </div>
                                                <div className="mt-2 text-sm text-slate-600">
                                                    <span className="font-semibold">Reason:</span> {appt.symptoms}
                                                </div>
                                                <div className="mt-1 text-sm text-slate-600">
                                                    <span className="font-semibold">Contact:</span> {appt.patientPhone}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-row sm:flex-col items-end gap-2 shrink-0">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {appt.status}
                                            </span>
                                            
                                            {appt.status === 'pending' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button 
                                                        onClick={() => handleStatusUpdate(appt.id, 'confirmed')}
                                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                        title="Confirm"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(appt.id, 'cancelled')}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Decline"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;