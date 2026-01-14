import React, { useState, useEffect } from 'react';
import { doctorApi } from '../services/api';
import { Doctor } from '../types';
import { Search, Filter, Star, Clock, ChevronRight, X, Calendar, GraduationCap, AlertCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const MiniCalendar = ({ availability }: { availability: string[] }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = [];
  
  // Empty slots for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayName = weekDays[date.getDay()];
    const isAvailable = availability.includes(dayName);
    const isToday = d === today.getDate();
    const isPast = d < today.getDate();

    days.push(
      <div 
        key={d}
        className={`
            aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all relative
            ${isPast 
                ? 'text-slate-300 bg-slate-50/50' 
                : isAvailable 
                    ? 'bg-teal-50 text-teal-700 font-bold border border-teal-100 shadow-sm' 
                    : 'text-slate-400'
            }
            ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 z-10' : ''}
        `}
        title={isAvailable ? 'Available' : 'Not Available'}
      >
        {d}
        {isAvailable && !isPast && (
             <div className="absolute -bottom-1 w-1 h-1 bg-teal-500 rounded-full"></div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm w-full">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
             <span className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
             </span>
             <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Available</span>
             </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {weekDays.map(d => (
                <div key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.slice(0, 3)}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
            {days}
        </div>
    </div>
  );
};

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await doctorApi.getAll();
        setDoctors(data);
        
        // Handle URL params after data is loaded to match properly
        const paramSpecialty = searchParams.get('specialty');
        if (paramSpecialty) {
            setSpecialtyFilter(paramSpecialty);
        }
      } catch (err) {
        console.warn("Using offline doctor data");
        // Fallback handled in API
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [searchParams]);

  const specialties = Array.from(new Set(doctors.map(d => d.specialization)));

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter ? doc.specialization === specialtyFilter : true;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 relative">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Our Specialists</h1>
            <p className="text-slate-600 text-lg">World-class doctors committed to your health.</p>
          </div>
          <Link to="/appointments" className="hidden md:inline-flex bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
            Book Appointment
          </Link>
        </div>

        {/* Filters - Sticky for Mobile "Fixed" */}
        <div className="sticky top-20 z-30 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-10 transition-all">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Doctor</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="e.g. Dr. Johnson or Cardiology"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Specialty</label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none transition-all"
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {specialties.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Grid - Flexible Layout */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map(doctor => (
                <div key={doctor.id} className="h-full">
                  <div 
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group flex flex-col h-full cursor-pointer relative" 
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="p-6 pb-0 flex items-start gap-4">
                      <img 
                        src={doctor.image} 
                        alt={doctor.name} 
                        className="w-24 h-24 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full mb-2">
                          {doctor.specialization}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 truncate mb-1 group-hover:text-teal-600 transition-colors">{doctor.name}</h3>
                        <div className="flex items-center gap-1 text-amber-500 text-sm font-medium">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-slate-600">{doctor.experience}+ Years Exp.</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-grow">
                      <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                        {doctor.description}
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4 mt-0.5 text-slate-400" />
                          <div className="flex flex-wrap gap-2">
                            {doctor.availability.map(day => (
                              <span key={day} className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium text-slate-600">
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 mt-auto">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoctor(doctor);
                        }}
                        className="block w-full text-center bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-semibold py-3 rounded-xl transition-all duration-300"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg">No doctors found matching your criteria.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSpecialtyFilter('')}}
              className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
           <div 
             className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" 
             onClick={() => setSelectedDoctor(null)}
           />
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col md:flex-row animate-[fadeIn_0.2s_ease-out]">
              {/* Close Button */}
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-30 backdrop-blur-md md:text-slate-500 md:bg-white/50 md:hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Section */}
              <div className="w-full md:w-2/5 h-64 md:h-auto relative shrink-0">
                 <img 
                   src={selectedDoctor.image} 
                   alt={selectedDoctor.name}
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent md:hidden" />
                 <div className="absolute bottom-6 left-6 text-white md:hidden">
                    <span className="inline-block px-2 py-0.5 bg-teal-500 text-white text-xs font-bold rounded-md mb-2">
                      {selectedDoctor.specialization}
                    </span>
                    <h2 className="text-2xl font-bold leading-tight">{selectedDoctor.name}</h2>
                 </div>
              </div>

              {/* Content Section */}
              <div className="w-full md:w-3/5 p-6 md:p-10 overflow-y-auto bg-white flex flex-col">
                 <div className="hidden md:block mb-8">
                    <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full mb-3">
                      {selectedDoctor.specialization}
                    </span>
                    <h2 className="text-3xl font-bold text-slate-900">{selectedDoctor.name}</h2>
                 </div>

                 <div className="space-y-8 flex-grow">
                    <div className="flex flex-wrap gap-4 text-sm">
                       <div className="flex items-center gap-3 text-slate-700 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                             <Star className="w-4 h-4 fill-current" />
                          </div>
                          <div>
                             <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Experience</p>
                             <p className="font-bold">{selectedDoctor.experience}+ Years</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 text-slate-700 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                             <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Education</p>
                             <p className="font-bold">MBBS, FCPS</p>
                          </div>
                       </div>
                    </div>

                    <div>
                       <h3 className="font-bold text-slate-900 mb-3 text-lg">About Doctor</h3>
                       <p className="text-slate-600 leading-relaxed">
                          {selectedDoctor.description}
                       </p>
                    </div>

                    <div>
                       <h3 className="font-bold text-slate-900 mb-4 text-lg">Availability Schedule</h3>
                       <div className="flex flex-col gap-6">
                            {/* Generic Week Schedule */}
                            <div className="flex flex-wrap gap-3">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                    const isAvailable = selectedDoctor.availability.includes(day);
                                    return (
                                        <div 
                                        key={day}
                                        className={`
                                            flex flex-col items-center justify-center w-10 h-10 rounded-lg border text-xs font-bold transition-all
                                            ${isAvailable 
                                            ? 'bg-slate-900 text-white border-slate-900' 
                                            : 'bg-white text-slate-300 border-slate-100'
                                            }
                                        `}
                                        >
                                            <span className="opacity-90">{day.slice(0,1)}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mini Calendar */}
                            <MiniCalendar availability={selectedDoctor.availability} />
                            
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Proceed to booking for exact time slots.</span>
                            </p>
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 pt-6 border-t border-slate-100 sticky bottom-0 bg-white">
                    <Link
                      to={`/appointments?doctorId=${selectedDoctor.id}`}
                      className="flex items-center justify-center w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-0.5 gap-2"
                    >
                      <span>Book Appointment</span>
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;