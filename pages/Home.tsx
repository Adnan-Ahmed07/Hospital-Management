import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, ChevronLeft, Play, Calendar, User, Activity, Heart, Brain, Bone, Eye, Microscope, ShieldCheck, X, Award, CheckCircle, Wifi, Smartphone, Globe, Database, Cpu, Zap, Phone, Info } from 'lucide-react';
import Slider from 'react-slick';
import { newsApi } from '../services/api';
import { NewsItem } from '../types';
import { useLanguage } from '../services/languageContext';

// Helper to check if url is video
const isVideo = (url: string) => {
    if (!url) return false;
    return url.includes('/video/upload/') || url.match(/\.(mp4|webm|ogg|mov)$/i);
};

// Custom Arrow Components for the Slider
const NextArrow = (props: any) => {
  const { onClick, className } = props;
  return (
    <button
      onClick={onClick}
      className={`absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-xl border border-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-600 transition-all group ${className?.includes('slick-disabled') ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      aria-label="Next"
    >
      <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { onClick, className } = props;
  return (
    <button
      onClick={onClick}
      className={`absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-xl border border-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-600 transition-all group ${className?.includes('slick-disabled') ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      aria-label="Previous"
    >
      <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
    </button>
  );
};

const Home: React.FC = () => {
  const { t } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState('Head');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showAllNews, setShowAllNews] = useState(false);
  const [loadingNews, setLoadingNews] = useState(true);
  
  // Parallax State
  const [scrollY, setScrollY] = useState(0);

  // New State for Modals
  const [showVideo, setShowVideo] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);

  useEffect(() => {
    const handleScroll = () => requestAnimationFrame(() => setScrollY(window.scrollY));
    window.addEventListener('scroll', handleScroll);
    
    newsApi.getAll()
      .then(data => setNews(data))
      .catch(err => console.warn("Using offline news data"))
      .finally(() => setLoadingNews(false));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const departments: Record<string, string[]> = {
    'Head': ['Neurology', 'Ophthalmology', 'ENT', 'Psychiatry'],
    'Chest': ['Cardiology', 'Respiratory Medicine', 'Thoracic Surgery'],
    'Stomach': ['Gastroenterology', 'General Surgery', 'Hepatology'],
    'Limbs': ['Orthopedics', 'Physical Medicine', 'Rheumatology'],
    'Reproductive': ['Gynecology', 'Urology', 'IVF Center']
  };

  const bodyIcons = [
    { name: 'Head', icon: Brain },
    { name: 'Chest', icon: Heart },
    { name: 'Stomach', icon: Activity },
    { name: 'Limbs', icon: Bone },
    { name: 'Reproductive', icon: User }
  ];

  const sliderSettings = {
    dots: true,
    infinite: news.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: news.length > 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: news.length > 1,
          arrows: false
        }
      }
    ]
  };

  return (
    <div className="flex flex-col">
      {/* Inject Keyframes for entrance animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center bg-slate-950 overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2400" 
            alt="Hospital Background"
            className="w-full h-[120%] object-cover opacity-40 will-change-transform"
            style={{ transform: `translate3d(0, ${scrollY * 0.5}px, 0)` }} 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/30" />
          
          {/* Animated decorative blobs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20">
          <div className="max-w-5xl">
            
            {/* JCI Badge */}
            <div 
                className="inline-flex items-center gap-3 px-5 py-2.5 bg-teal-900/30 border border-teal-500/30 rounded-full mb-10 backdrop-blur-md opacity-0 animate-[fadeInUp_1s_ease-out_forwards]"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
              <span className="text-teal-300 font-bold tracking-[0.2em] text-xs uppercase">{t('hero.jci')}</span>
            </div>
            
            {/* Content Container with scroll fade effect */}
            <div 
                style={{ 
                    transform: `translate3d(0, ${scrollY * -0.1}px, 0)`,
                    opacity: Math.max(0, 1 - scrollY / 600)
                }}
                className="will-change-transform"
            >
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-[1.05] tracking-tight opacity-0 animate-[fadeInUp_1s_ease-out_0.2s_forwards]">
                  {t('hero.title_start')} <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-500">
                      {t('hero.title_end')}
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-slate-300 mb-14 font-light leading-relaxed max-w-2xl opacity-0 animate-[fadeInUp_1s_ease-out_0.4s_forwards]">
                  {t('hero.subtitle')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 mb-20 opacity-0 animate-[fadeInUp_1s_ease-out_0.6s_forwards]">
                  <Link 
                    to="/appointments" 
                    className="group bg-teal-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-teal-500 transition-all shadow-2xl shadow-teal-900/40 hover:shadow-teal-900/60 flex items-center justify-center gap-3 text-lg transform hover:-translate-y-1"
                  >
                    {t('hero.book_btn')}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/doctors" 
                    className="group bg-white/5 backdrop-blur-md text-white border border-white/10 px-10 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-lg transform hover:-translate-y-1"
                  >
                    {t('hero.find_btn')}
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-300" />
                  </Link>
                </div>
            </div>

            {/* Stats - Staggered entrance and independent parallax speed */}
            <div 
                className="grid grid-cols-3 gap-6 md:gap-12 p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 opacity-0 animate-[fadeInUp_1s_ease-out_0.8s_forwards] max-w-3xl hover:bg-white/10 transition-colors"
                style={{ transform: `translate3d(0, ${scrollY * -0.05}px, 0)` }}
            >
              <div className="text-center md:text-left group">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">25+</div>
                <div className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest">{t('hero.stat_years')}</div>
              </div>
              <div className="text-center md:text-left border-l border-white/10 pl-6 md:pl-12 group">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">150+</div>
                <div className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest">{t('hero.stat_docs')}</div>
              </div>
              <div className="text-center md:text-left border-l border-white/10 pl-6 md:pl-12 group">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">24/7</div>
                <div className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest">{t('hero.stat_emergency')}</div>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 animate-bounce cursor-pointer z-20 hover:text-white transition-colors"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* REDESIGNED Body Part Selector Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-3 block">{t('find_care.tag')}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-serif">{t('find_care.title')}</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('find_care.desc')}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
            
            {/* Left: Interactive Anatomy Selector */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
              <div className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="space-y-1">
                  {bodyIcons.map((part) => {
                    const Icon = part.icon;
                    const isSelected = selectedBodyPart === part.name;
                    return (
                      <button
                        key={part.name}
                        onClick={() => setSelectedBodyPart(part.name)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                          isSelected 
                            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30 translate-x-2' 
                            : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl transition-colors ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-white border border-slate-100 text-slate-400 group-hover:border-teal-200 group-hover:text-teal-500'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-lg tracking-wide">{part.name}</span>
                        <ChevronRight className={`ml-auto w-5 h-5 transition-transform ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Quick Contact Card */}
              <div className="mt-8 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
                  <div className="relative z-10">
                      <h4 className="font-bold text-xl mb-2">{t('find_care.need_help')}</h4>
                      <p className="text-slate-400 text-sm mb-6">{t('find_care.support_text')}</p>
                      <a href="tel:10666" className="inline-flex items-center gap-2 text-teal-300 font-bold hover:text-teal-200 transition-colors">
                          <Phone className="w-4 h-4" /> {t('find_care.call_us')}
                      </a>
                  </div>
              </div>
            </div>

            {/* Right: Dynamic Content Panel */}
            <div className="w-full lg:w-2/3">
               <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[600px] flex flex-col relative animate-fade-in">
                  
                  {/* Header Image/Gradient Area */}
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-90" />
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')] opacity-10" />
                      
                      {/* Abstract Shapes */}
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />

                      <div className="absolute bottom-0 left-0 w-full p-10 flex items-end justify-between">
                          <div>
                             <div className="flex items-center gap-2 text-teal-100 font-bold uppercase tracking-widest text-xs mb-2">
                                <Activity className="w-4 h-4" /> {t('find_care.selected_region')}
                             </div>
                             <h3 className="text-4xl font-bold text-white font-serif tracking-tight">{selectedBodyPart} Care</h3>
                          </div>
                      </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-8 md:p-12 flex-grow flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                          <p className="text-slate-500 font-medium">{t('find_care.available_specialists')}</p>
                          <Link to="/doctors" className="hidden sm:flex items-center gap-2 text-teal-600 font-bold text-sm hover:underline">
                              {t('find_care.view_all')} <ArrowRight className="w-4 h-4" />
                          </Link>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                        {departments[selectedBodyPart]?.map((dept, idx) => (
                          <Link 
                            key={idx}
                            to={`/doctors?specialty=${encodeURIComponent(dept)}`}
                            className="group relative bg-slate-50 hover:bg-white border border-slate-100 hover:border-teal-100 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/5 flex items-center gap-5"
                          >
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 shrink-0">
                                <Microscope className="w-6 h-6" />
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-bold text-lg text-slate-800 group-hover:text-teal-700 transition-colors">{dept}</h4>
                                <span className="text-xs text-slate-400 font-medium group-hover:text-teal-500/70">View Specialists</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-200/50 group-hover:bg-teal-50 flex items-center justify-center transition-colors">
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Info snippet */}
                      <div className="mt-auto bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex gap-4">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg h-fit">
                              <Info className="w-5 h-5" />
                          </div>
                          <div>
                              <h5 className="font-bold text-slate-900 text-sm mb-1">{t('find_care.did_you_know')}</h5>
                              <p className="text-sm text-slate-500 leading-relaxed">
                                  Our {selectedBodyPart} department is equipped with the latest diagnostic technology, ensuring 99% accuracy in early detection and personalized treatment plans.
                              </p>
                          </div>
                      </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Section - JCI & Professional Background */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative group">
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-teal-600/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

             <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-full overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1200" 
                 alt="Medical Team" 
                 className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors"></div>
               <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={() => setShowVideo(true)}>
                 <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg border border-white/30 group/play">
                   <Play className="w-8 h-8 text-white fill-current ml-1 group-hover/play:scale-110 transition-transform" />
                 </div>
               </div>
             </div>
             
             <div className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center relative z-10">
               <div className="inline-flex items-center gap-2 mb-8">
                 <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30 rotate-3">
                   <span className="text-xl font-bold text-white">JCI</span>
                 </div>
                 <div className="h-px w-12 bg-slate-700 ml-4"></div>
                 <span className="text-slate-400 font-medium tracking-widest uppercase text-sm">Gold Standard</span>
               </div>
               
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                 Redefining Healthcare <br/>
                 <span className="text-slate-500">with</span> Innovation & Empathy
               </h2>
               
               <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                 AD Hospital combines cutting-edge medical technology with a deep commitment to human-centric care. Our facility features advanced robotic surgery systems, AI-powered diagnostic centers, and 24/7 intensive care units. We believe in treating the whole person, not just the symptoms, ensuring a recovery journey defined by comfort, dignity, and world-class expertise.
               </p>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400 mt-1">
                      <Microscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Advanced Diagnostics</h4>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">High-resolution imaging and molecular pathology labs for pinpoint accuracy.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mt-1">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Patient-Centric Care</h4>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">Personalized nursing and support teams dedicated to your emotional well-being.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 mt-1">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Robotic Surgery</h4>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">Minimally invasive procedures ensuring faster recovery and less pain.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400 mt-1">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Global Safety</h4>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">JCI-accredited protocols guaranteeing the highest standards of safety.</p>
                    </div>
                  </div>
               </div>
               
               <div className="flex flex-wrap gap-4">
                 <button 
                    onClick={() => setShowLearnMore(true)}
                    className="inline-flex bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors items-center gap-2"
                 >
                   {t('common.learn_more')} <ArrowRight className="w-4 h-4" />
                 </button>
                 <button 
                    onClick={() => setShowCertificates(true)}
                    className="inline-flex border border-slate-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                 >
                   {t('common.view_certificates')}
                 </button>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Smart Healthcare Features */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute top-10 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-teal-400 font-bold tracking-widest uppercase text-sm mb-2 block">{t('features.tag')}</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-serif">{t('features.title')}</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              {t('features.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {/* Card 1: AI Scheduling */}
             <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Cpu className="w-7 h-7 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('features.ai_scheduling')}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Intelligent booking systems that optimize doctor availability and reduce patient wait times.</p>
             </div>

             {/* Card 2: Telemedicine */}
             <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Wifi className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('features.telemedicine')}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Secure, high-definition video consultations allowing you to connect with specialists from home.</p>
             </div>

             {/* Card 3: Smart Patient Flow */}
             <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('features.patient_flow')}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Real-time tracking and automated workflows to ensure seamless admission and discharge processes.</p>
             </div>

             {/* Card 4: Local Language */}
             <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Globe className="w-7 h-7 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('features.language_support')}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Multi-language interfaces and support services ensuring clear communication for every patient.</p>
             </div>

             {/* Card 5: FHIR / EHR */}
             <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Database className="w-7 h-7 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('features.fhir')}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Interoperable health records ensuring your medical history is accurate and accessible across systems.</p>
             </div>

             {/* Card 6: Mobile First */}
             <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Smartphone className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('features.mobile')}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Manage appointments, view reports, and chat with doctors via our optimized mobile platform.</p>
             </div>
          </div>
        </div>
      </section>

      {/* News & Events Carousel */}
      <section id="news" className="py-24 bg-[#fdfbf6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-2 block">{t('news.tag')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t('news.title')}</h2>
            </div>
            <button 
              onClick={() => setShowAllNews(true)}
              className="hidden md:flex items-center text-slate-500 font-bold hover:text-teal-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              {t('news.view_all')} <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>

          <div className="px-4">
            {loadingNews ? (
                <div className="flex justify-center py-12">
                     <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                </div>
            ) : news.length > 0 ? (
                <Slider {...sliderSettings} className="-mx-4 pb-8">
                {news.map((item, index) => {
                    const dateObj = new Date(item.date);
                    const day = dateObj.getDate();
                    const month = dateObj.toLocaleString('default', { month: 'short' });
                    const isItemVideo = isVideo(item.image);
                    
                    return (
                    <div key={item.id} className="px-4 h-full outline-none">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full">
                        <div className="h-56 relative overflow-hidden bg-slate-100">
                            {isItemVideo ? (
                            <video 
                                src={item.image} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                            ) : (
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            )}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-900 rounded-xl p-2.5 text-center min-w-[64px] shadow-lg">
                            <div className="text-2xl font-bold leading-none mb-0.5">{day}</div>
                            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">{month}</div>
                            </div>
                            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
                            {item.category}
                            </div>
                        </div>
                        <div className="p-8 flex-grow flex flex-col">
                            <h3 
                            onClick={() => setSelectedNews(item)}
                            className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-teal-600 transition-colors leading-tight cursor-pointer"
                            >
                            {item.title}
                            </h3>
                            <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                            {item.content}
                            </p>
                            <button 
                            onClick={() => setSelectedNews(item)}
                            className="inline-flex items-center text-teal-600 font-bold text-sm mt-auto group-hover:translate-x-1 transition-transform cursor-pointer bg-transparent border-0 p-0 text-left"
                            >
                            {t('news.read_more')} <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                        </div>
                    </div>
                    );
                })}
                </Slider>
            ) : (
                <div className="text-center py-12 text-slate-500">
                    <p>{t('news.no_news')}</p>
                </div>
            )}
          </div>
          
          <div className="md:hidden text-center mt-8">
             <button 
               onClick={() => setShowAllNews(true)}
               className="inline-flex items-center text-slate-500 font-bold hover:text-teal-600 transition-colors bg-transparent border-none cursor-pointer"
             >
              {t('news.view_all')} <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* MODALS */}

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-50"
            >
               <X className="w-8 h-8" />
            </button>
            <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative">
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/S265yX-H6oE?autoplay=1&rel=0" 
                    title="Hospital Tour" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>
        </div>
      )}

      {/* Learn More Modal */}
      {showLearnMore && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
           <div 
             className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" 
             onClick={() => setShowLearnMore(false)}
           />
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col animate-[fadeIn_0.2s_ease-out]">
                <button 
                    onClick={() => setShowLearnMore(false)}
                    className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-50"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <div className="p-8 md:p-12">
                    <span className="text-teal-600 font-bold tracking-widest uppercase text-xs mb-2 block">About AD Hospital</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 font-serif">Pioneering Healthcare Since 1998</h2>
                    
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                            <p>
                                At AD Hospital, we believe that healing is more than just medicine—it's about understanding, compassion, and innovation. For over two decades, we have been at the forefront of medical excellence, serving our community with unwavering dedication.
                            </p>
                            <p>
                                Our facility is designed to provide a healing environment, combining state-of-the-art technology with the warmth of human touch. From complex robotic surgeries to preventive health screenings, every aspect of our care is tailored to the unique needs of our patients.
                            </p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                             <h3 className="font-bold text-slate-900 text-xl mb-4">Our Core Values</h3>
                             <ul className="space-y-4">
                                 <li className="flex items-start gap-3">
                                     <div className="bg-teal-100 text-teal-600 p-1 rounded-full mt-1"><CheckCircle className="w-4 h-4" /></div>
                                     <div>
                                         <h4 className="font-bold text-slate-800">Patient First</h4>
                                         <p className="text-sm text-slate-500">Every decision we make centers around the well-being and comfort of our patients.</p>
                                     </div>
                                 </li>
                                 <li className="flex items-start gap-3">
                                     <div className="bg-blue-100 text-blue-600 p-1 rounded-full mt-1"><CheckCircle className="w-4 h-4" /></div>
                                     <div>
                                         <h4 className="font-bold text-slate-800">Integrity & Ethics</h4>
                                         <p className="text-sm text-slate-500">We adhere to the highest standards of professionalism and ethical conduct.</p>
                                     </div>
                                 </li>
                                 <li className="flex items-start gap-3">
                                     <div className="bg-purple-100 text-purple-600 p-1 rounded-full mt-1"><CheckCircle className="w-4 h-4" /></div>
                                     <div>
                                         <h4 className="font-bold text-slate-800">Innovation</h4>
                                         <p className="text-sm text-slate-500">Continuously adopting the latest medical advancements to improve outcomes.</p>
                                     </div>
                                 </li>
                             </ul>
                        </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">500+</div>
                            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Beds</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">120+</div>
                            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">ICU Units</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">50k+</div>
                            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Happy Patients</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">15+</div>
                            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Awards</div>
                        </div>
                    </div>
                </div>
           </div>
        </div>
      )}

      {/* Certificates Modal */}
      {showCertificates && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
           <div 
             className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
             onClick={() => setShowCertificates(false)}
           />
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col animate-[fadeIn_0.2s_ease-out]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-20">
                    <div>
                         <h2 className="text-2xl font-bold text-slate-900 font-serif">Accreditations & Awards</h2>
                         <p className="text-slate-500 text-sm">Recognized globally for clinical excellence</p>
                    </div>
                    <button onClick={() => setShowCertificates(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                
                <div className="p-8 bg-slate-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Certificate Items */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-lg transition-all">
                        <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-4 text-white shadow-lg shadow-yellow-400/30">
                            <Award className="w-12 h-12" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2">JCI Accreditation</h3>
                        <p className="text-slate-500 text-sm mb-4">Gold Seal of Approval® from Joint Commission International, representing the highest standard in global healthcare.</p>
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">Valid until 2026</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-lg transition-all">
                        <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-4 text-white shadow-lg shadow-blue-500/30">
                             <ShieldCheck className="w-12 h-12" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2">ISO 9001:2015</h3>
                        <p className="text-slate-500 text-sm mb-4">Certified for Quality Management Systems, ensuring consistent and superior patient care processes.</p>
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">Certified</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-lg transition-all">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-4 text-white shadow-lg shadow-green-500/30">
                             <Heart className="w-12 h-12" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2">WHO Patient Safety</h3>
                        <p className="text-slate-500 text-sm mb-4">Recognized by World Health Organization for outstanding implementation of patient safety protocols.</p>
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">Award Winner 2023</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-lg transition-all">
                        <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center mb-4 text-white shadow-lg shadow-purple-500/30">
                             <Microscope className="w-12 h-12" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2">Best Clinical Research</h3>
                        <p className="text-slate-500 text-sm mb-4">National award for contribution to medical research and advancements in robotic surgery.</p>
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">Excellence Award</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-lg transition-all">
                        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-4 text-white shadow-lg shadow-red-500/30">
                             <Activity className="w-12 h-12" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2">Top Trauma Center</h3>
                        <p className="text-slate-500 text-sm mb-4">Ranked #1 for Emergency Response and Trauma Care in the region by Health Digest.</p>
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">Rank #1</span>
                    </div>
                </div>
           </div>
        </div>
      )}

      {/* All News Grid Modal */}
      {showAllNews && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAllNews(false)} />
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col animate-[fadeIn_0.2s_ease-out]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-20">
                    <div>
                         <span className="text-teal-600 font-bold tracking-widest uppercase text-xs mb-1 block">{t('news.tag')}</span>
                         <h2 className="text-2xl font-bold text-slate-900">{t('news.title')}</h2>
                    </div>
                    <button onClick={() => setShowAllNews(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                <div className="overflow-y-auto p-6 md:p-8 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map(item => {
                            const isItemVideo = isVideo(item.image);
                            return (
                                <div key={item.id} onClick={() => setSelectedNews(item)} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full">
                                    <div className="h-48 relative overflow-hidden shrink-0 bg-slate-100">
                                        {isItemVideo ? (
                                             <video src={item.image} className="w-full h-full object-cover" muted />
                                        ) : (
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                                        )}
                                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 uppercase tracking-wide">
                                            {item.category}
                                        </div>
                                        {isItemVideo && <div className="absolute inset-0 flex items-center justify-center"><div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center"><Play className="w-5 h-5 text-white fill-current" /></div></div>}
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">
                                            {item.content}
                                        </p>
                                        <span className="inline-flex items-center text-teal-600 font-bold text-sm mt-auto group-hover:translate-x-1 transition-transform">
                                            {t('news.read_more')} <ArrowRight className="w-4 h-4 ml-1" />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* News Details Modal */}
      {selectedNews && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setSelectedNews(null)}
            />
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col animate-[fadeIn_0.2s_ease-out]">
                {/* Modal Content */}
                 <div className="relative h-64 sm:h-80 w-full shrink-0 bg-slate-100">
                     {isVideo(selectedNews.image) ? (
                        <video 
                            src={selectedNews.image} 
                            className="w-full h-full object-cover" 
                            controls 
                            autoPlay 
                        />
                     ) : (
                        <img 
                            src={selectedNews.image} 
                            alt={selectedNews.title}
                            className="w-full h-full object-cover"
                        />
                     )}
                     <button 
                        onClick={() => setSelectedNews(null)}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md z-20"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-900 rounded-xl p-2.5 text-center min-w-[64px] shadow-lg z-20">
                          <div className="text-2xl font-bold leading-none mb-0.5">{new Date(selectedNews.date).getDate()}</div>
                          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">{new Date(selectedNews.date).toLocaleString('default', { month: 'short' })}</div>
                      </div>
                 </div>

                 <div className="p-8 md:p-10">
                     <div className="flex items-center gap-3 mb-4">
                        <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full uppercase tracking-wider border border-teal-100">
                          {selectedNews.category}
                        </span>
                        <span className="text-slate-400 text-sm font-medium">
                           {new Date(selectedNews.date).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})}
                        </span>
                     </div>
                     
                     <h2 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">{selectedNews.title}</h2>
                     
                     <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                          {selectedNews.content}
                        </p>
                        {/* Mocking extra content for "Full Story" feel */}
                        <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line mt-4">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                        </p>
                        <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line mt-4">
                          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                     </div>

                     <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
                        <button 
                          onClick={() => setSelectedNews(null)}
                          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                        >
                          {t('common.close')}
                        </button>
                     </div>
                 </div>
            </div>
         </div>
       )}

    </div>
  );
};

export default Home;