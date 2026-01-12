import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doctorApi, appointmentApi } from '../services/api';
import { Doctor } from '../types';
import { Calendar, Clock, AlertCircle, CheckCircle, User, FileText, Phone, Mail, Loader2, X } from 'lucide-react';
import { useAuth } from '../services/authContext';

const Appointments: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedDoctorId = searchParams.get('doctorId');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Time Slot State
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    doctorId: preSelectedDoctorId || '',
    date: '',
    time: '',
    patientName: user?.name || '',
    patientEmail: user?.email || '',
    patientPhone: '',
    symptoms: ''
  });

  useEffect(() => {
    const init = async () => {
      try {
        const docs = await doctorApi.getAll();
        setDoctors(docs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Effect to check availability and validate doctor schedule
  useEffect(() => {
    const checkSlots = async () => {
      setDateError(null);
      setBookedSlots([]);
      setFormData(prev => ({ ...prev, time: '' })); // Reset time selection

      if (!formData.doctorId || !formData.date) return;

      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      if (!selectedDoctor) return;

      // Check if doctor works on this day
      const dateObj = new Date(formData.date);
      // Adjust to ensure we get the right weekday name regardless of timezone quirks for YYYY-MM-DD input
      // Creating a date from string assumes UTC in some parsers, so we use the timezone offset to get local day
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }); 
      
      if (!selectedDoctor.availability.includes(dayName)) {
        setDateError(`Dr. ${selectedDoctor.name} is not available on ${dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })}s. Available days: ${selectedDoctor.availability.join(', ')}.`);
        return;
      }

      setCheckingAvailability(true);
      try {
        const slots = await appointmentApi.getBookedSlots(formData.doctorId, formData.date);
        setBookedSlots(slots);
      } catch (e) {
        console.error("Failed to check availability", e);
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkSlots();
  }, [formData.doctorId, formData.date, doctors]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i <= 17; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      if (i !== 17) slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time) {
        setError("Please select a time slot.");
        return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      if (!selectedDoctor) throw new Error("Please select a doctor");

      const appointmentDate = new Date(`${formData.date}T${formData.time}`);
      
      await appointmentApi.create({
        doctorId: formData.doctorId,
        doctorName: selectedDoctor.name,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        date: appointmentDate.toISOString(),
        symptoms: formData.symptoms
      });

      setSuccess(true);
      setFormData({
        doctorId: '',
        date: '',
        time: '',
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        symptoms: ''
      });
      
    } catch (err: any) {
      setError(err.message || "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center border border-slate-100 animate-[fadeIn_0.5s_ease-out]">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 font-serif">Booking Confirmed!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your appointment has been successfully scheduled. We've sent a confirmation to your email.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setSuccess(false)}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              Book Another Appointment
            </button>
            <button 
              onClick={() => navigate('/')}
              className="text-slate-600 font-medium hover:text-slate-900 py-2"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availableSlots = generateTimeSlots();
  const availableCount = availableSlots.length - bookedSlots.length;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-serif">Schedule Your Visit</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Fill out the form below to book an appointment with our specialists. 
            We'll ensure you get the care you need.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Calendar className="w-6 h-6 text-teal-300" />
              </div>
              <h2 className="text-xl font-bold font-serif">Appointment Request</h2>
            </div>
            <p className="text-slate-400 text-sm relative z-10">Please provide accurate information for quick processing.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-[shake_0.5s_ease-in-out]">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Doctor Selection Section */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">1</span>
                Medical Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Choose Specialist</label>
                  <select
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none font-medium text-slate-700"
                    value={formData.doctorId}
                    onChange={e => setFormData({...formData, doctorId: e.target.value})}
                  >
                    <option value="">-- Select a Doctor --</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-11 pr-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  {dateError && (
                    <div className="mt-2 p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> 
                      <span>{dateError}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-bold text-slate-700">Select Time Slot</label>
                      {formData.date && formData.doctorId && !dateError && !checkingAvailability && (
                          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                             {availableCount} slots available
                          </span>
                      )}
                  </div>
                  
                  {!formData.date || !formData.doctorId ? (
                    <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                      <Clock className="w-8 h-8 text-slate-300" />
                      Please select a doctor and date to view available times.
                    </div>
                  ) : dateError ? (
                     <div className="p-8 bg-red-50 border border-dashed border-red-200 rounded-xl text-center text-red-500 text-sm flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-red-300" />
                        No slots available on this date due to schedule conflict.
                     </div>
                  ) : checkingAvailability ? (
                    <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100">
                      <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                      <span className="ml-2 text-slate-600 font-medium">Checking availability...</span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {availableSlots.map((slot) => {
                            const isBooked = bookedSlots.includes(slot);
                            const isSelected = formData.time === slot;
                            return (
                            <button
                                key={slot}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setFormData({...formData, time: slot})}
                                className={`
                                py-3 px-2 rounded-xl text-sm font-bold transition-all relative overflow-hidden group
                                ${isBooked 
                                    ? 'bg-white text-slate-300 cursor-not-allowed border border-slate-100' 
                                    : isSelected 
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 border border-slate-900 scale-105 z-10' 
                                    : 'bg-white text-slate-600 hover:border-teal-500 hover:text-teal-600 hover:shadow-md border border-slate-200'
                                }
                                `}
                            >
                                {slot}
                                {isBooked && (
                                <span className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-[1px]">
                                    <span className="sr-only">Booked</span>
                                    <X className="w-4 h-4 text-slate-300" />
                                </span>
                                )}
                            </button>
                            );
                        })}
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200 text-xs font-medium text-slate-500 justify-center sm:justify-start">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 bg-white border border-slate-300 rounded-full"></span> Available
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 bg-slate-900 rounded-full shadow-sm"></span> Selected
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-white border border-slate-200 rounded-full relative flex items-center justify-center">
                                    <X className="w-2 h-2 text-slate-300" />
                                </div> Booked
                            </div>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Patient Details Section */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">2</span>
                Patient Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      className="w-full pl-11 pr-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700"
                      placeholder="John Doe"
                      value={formData.patientName}
                      onChange={e => setFormData({...formData, patientName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      className="w-full pl-11 pr-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700"
                      placeholder="john@example.com"
                      value={formData.patientEmail}
                      onChange={e => setFormData({...formData, patientEmail: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="tel"
                      required
                      className="w-full pl-11 pr-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700"
                      placeholder="+1 (555) 000-0000"
                      value={formData.patientPhone}
                      onChange={e => setFormData({...formData, patientPhone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Symptoms / Reason</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-4 text-slate-400 w-5 h-5" />
                    <textarea
                      required
                      rows={4}
                      className="w-full pl-11 pr-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none font-medium text-slate-700"
                      placeholder="Describe your symptoms or reason for visit..."
                      value={formData.symptoms}
                      onChange={e => setFormData({...formData, symptoms: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-xl transition-all transform active:scale-[0.99] ${
                  submitting ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 hover:bg-slate-800 hover:shadow-slate-900/30'
                }`}
              >
                {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </span>
                ) : 'Confirm Appointment'}
              </button>
              <p className="text-xs text-center text-slate-400 mt-4">
                By clicking "Confirm Appointment", you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Appointments;