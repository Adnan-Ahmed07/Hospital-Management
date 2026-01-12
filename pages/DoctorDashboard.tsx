import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { appointmentApi, doctorApi } from '../services/api';
import { Appointment, Doctor } from '../types';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Settings, Video, Activity } from 'lucide-react';

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

  const handleJoinVideo = async (id: string, currentLink?: string) => {
      if (currentLink) {
          window.open(currentLink, '_blank');
          return;
      }

      // Open tab immediately to avoid popup blocker
      const newTab = window.open('', '_blank');
      if (newTab) {
          newTab.document.write("<html><body style='font-family:sans-serif;text-align:center;padding-top:20%;'><h3>Connecting to Secure Meeting...</h3><p>Please wait while we generate your secure link.</p></body></html>");
      }

      try {
          const link = await appointmentApi.generateMeetingLink(id);
          
          if (newTab) {
              newTab.location.href = link;
          } else {
              // Fallback if blocked
              window.location.href = link;
          }

          // Update local state to reflect the new link immediately
          setAppointments(prev => prev.map(a => a.id === id ? { ...a, meetingLink: link } : a));
      } catch (e) {
          console.error("Failed to generate meeting link", e);
          if (newTab) newTab.close();
          alert("Could not start video call. Please try again.");
      }
  };

  const handleFlowUpdate = async (id: string, flowStatus: Appointment['flowStatus']) => {
      try {
          await appointmentApi.updateFlowStatus(id, flowStatus);
          setAppointments(prev => prev.map(a => a.id === id ? { ...a, flowStatus } : a));
      } catch (e) {
          alert("Failed to update patient flow");
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
                                        
                                        <div className="flex flex-col items-end gap-2 shrink-0 min-w-[160px]">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-center w-full ${
                                                appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {appt.status}
                                            </span>
                                            
                                            {appt.status === 'pending' && (
                                                <div className="flex gap-2 mt-1 w-full justify-end">
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

                                            {appt.status === 'confirmed' && (
                                                <div className="w-full flex flex-col gap-2 mt-2">
                                                    <button 
                                                        onClick={() => handleJoinVideo(appt.id, appt.meetingLink)}
                                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm w-full"
                                                    >
                                                        <Video className="w-3 h-3" /> 
                                                        {appt.meetingLink ? 'Join Call' : 'Start Telemedicine'}
                                                    </button>

                                                    {/* Patient Flow Controls */}
                                                    <div className="pt-2 border-t border-slate-100 w-full">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                                <Activity className="w-3 h-3" /> Patient Flow
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-1 bg-slate-50 p-1 rounded-lg">
                                                            {['checked-in', 'vitals', 'consulting', 'complete'].map((step) => {
                                                                const isActive = appt.flowStatus === step;
                                                                const labels: Record<string, string> = { 'checked-in': 'Check-In', 'vitals': 'Vitals', 'consulting': 'Doctor', 'complete': 'Done' };
                                                                return (
                                                                    <button
                                                                        key={step}
                                                                        onClick={() => handleFlowUpdate(appt.id, step as any)}
                                                                        className={`
                                                                            flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all
                                                                            ${isActive 
                                                                                ? 'bg-white text-teal-700 shadow-sm border border-slate-200' 
                                                                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                                                            }
                                                                        `}
                                                                        title={labels[step]}
                                                                    >
                                                                        {labels[step]}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
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