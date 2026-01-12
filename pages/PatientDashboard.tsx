import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { appointmentApi } from '../services/api';
import { Appointment } from '../types';
import { Calendar, MapPin, Clock, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppts = async () => {
      if (!user?.email) return;
      try {
        const data = await appointmentApi.getAll({ patientEmail: user.email });
        setAppointments(data);
      } catch (error) {
        console.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppts();
  }, [user?.email]);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Hello, {user?.name}</h1>
                <p className="text-slate-500 mt-1">Manage your health journey here.</p>
            </div>
            <Link to="/appointments" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                <Plus className="w-4 h-4" /> Book New
            </Link>
        </div>

        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" /> My Appointments
            </h2>

            {appointments.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                    <img 
                        src="https://images.unsplash.com/photo-1576091160550-21878bf72a5b?auto=format&fit=crop&q=80&w=200" 
                        alt="No appointments" 
                        className="w-32 h-32 object-cover rounded-full mx-auto mb-4 opacity-50 grayscale"
                    />
                    <h3 className="text-lg font-bold text-slate-700">No Appointments Yet</h3>
                    <p className="text-slate-500 mb-6">Schedule a consultation with our specialists.</p>
                    <Link to="/doctors" className="text-teal-600 font-bold hover:underline">Find a Doctor</Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {appointments.map(appt => (
                        <div key={appt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-5">
                                    <div className="bg-teal-50 text-teal-700 p-4 rounded-xl flex flex-col items-center justify-center min-w-[80px]">
                                        <span className="text-2xl font-bold leading-none">{new Date(appt.date).getDate()}</span>
                                        <span className="text-xs font-bold uppercase tracking-wider">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{appt.doctorName}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(appt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Main Building, Floor 3</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                                            <FileText className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                                            <span>{appt.symptoms}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                        appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                        appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {appt.status}
                                    </span>
                                    {appt.status === 'confirmed' && (
                                        <button className="text-xs font-bold text-blue-600 hover:underline">
                                            View Prescription
                                        </button>
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
  );
};

export default PatientDashboard;