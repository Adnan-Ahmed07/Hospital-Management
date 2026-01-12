import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Play,
  Calendar,
  User,
  Activity,
  Heart,
  Brain,
  Bone,
  Eye,
  Microscope,
  ShieldCheck,
  X,
  Award,
  CheckCircle,
} from "lucide-react";
import Slider from "react-slick";
import { newsApi } from "../services/api";
import { NewsItem } from "../types";

// Helper to check if url is video
const isVideo = (url: string) => {
  if (!url) return false;
  return url.includes("/video/upload/") || url.match(/\.(mp4|webm|ogg|mov)$/i);
};

// Custom Arrow Components for the Slider
const NextArrow = (props: any) => {
  const { onClick, className } = props;
  return (
    <button
      onClick={onClick}
      className={`absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-xl border border-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-600 transition-all group ${
        className?.includes("slick-disabled")
          ? "opacity-0 pointer-events-none"
          : "opacity-100"
      }`}
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
      className={`absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-xl border border-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-600 transition-all group ${
        className?.includes("slick-disabled")
          ? "opacity-0 pointer-events-none"
          : "opacity-100"
      }`}
      aria-label="Previous"
    >
      <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
    </button>
  );
};

const Home: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState("Head");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showAllNews, setShowAllNews] = useState(false);
  const [loadingNews, setLoadingNews] = useState(true);

  // New State for Modals
  const [showVideo, setShowVideo] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);

  useEffect(() => {
    newsApi
      .getAll()
      .then((data) => setNews(data))
      .catch((err) => console.warn("Using offline news data"))
      .finally(() => setLoadingNews(false));
  }, []);

  const departments: Record<string, string[]> = {
    Head: ["Neurology", "Ophthalmology", "ENT", "Psychiatry"],
    Chest: ["Cardiology", "Respiratory Medicine", "Thoracic Surgery"],
    Stomach: ["Gastroenterology", "General Surgery", "Hepatology"],
    Limbs: ["Orthopedics", "Physical Medicine", "Rheumatology"],
    Reproductive: ["Gynecology", "Urology", "IVF Center"],
  };

  const bodyIcons = [
    { name: "Head", icon: Brain },
    { name: "Chest", icon: Heart },
    { name: "Stomach", icon: Activity },
    { name: "Limbs", icon: Bone },
    { name: "Reproductive", icon: User },
  ];

  const sliderSettings = {
    dots: true,
    infinite: news.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000, // change: advance every 3 seconds
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: news.length > 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: news.length > 1,
          arrows: false,
        },
      },
    ],
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2400"
            alt="Hospital Background"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900/20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/20 border border-teal-500/30 rounded-full mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-teal-300 font-bold tracking-wide text-xs uppercase">
                JCI Accredited Facility
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
              A Vision for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                Complete Healthcare
              </span>
            </h1>

            <p className="text-xl text-slate-200 mb-10 font-light leading-relaxed max-w-2xl">
              Experience world-class medical excellence where advanced
              technology meets compassionate care. Your health journey starts
              here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/appointments"
                className="group bg-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2"
              >
                Book Appointment
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/doctors"
                className="group bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                Find Doctors
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-300" />
              </Link>
            </div>

            <div className="mt-16 flex items-center gap-8 border-t border-white/10 pt-8">
              <div>
                <div className="text-3xl font-bold text-white mb-0.5">25+</div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                  Years of Service
                </div>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div>
                <div className="text-3xl font-bold text-white mb-0.5">150+</div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                  Specialist Doctors
                </div>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div>
                <div className="text-3xl font-bold text-white mb-0.5">24/7</div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                  Emergency Care
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body Part Selector Section */}
      <section className="py-24 bg-[#fdfbf6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Find Care by Condition
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Select a body region to instantly find relevant specialist
              departments and doctors available for consultation.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 items-start justify-center">
            {/* Left: Selector */}
            <div className="w-full lg:w-1/3 space-y-3">
              <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest pl-2">
                Select Region
              </h3>
              {bodyIcons.map((part) => {
                const Icon = part.icon;
                const isSelected = selectedBodyPart === part.name;
                return (
                  <button
                    key={part.name}
                    onClick={() => setSelectedBodyPart(part.name)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border-2 ${
                      isSelected
                        ? "bg-white shadow-xl border-teal-500 scale-105 z-10"
                        : "border-transparent hover:bg-white hover:shadow-md text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl transition-colors ${
                        isSelected
                          ? "bg-teal-500 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`font-bold text-lg ${
                        isSelected ? "text-slate-900" : ""
                      }`}
                    >
                      {part.name}
                    </span>
                    {isSelected && (
                      <ChevronRight className="ml-auto w-5 h-5 text-teal-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: Departments Grid */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[500px] flex flex-col">
                <div className="mb-10 flex items-end justify-between border-b border-slate-100 pb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Departments for{" "}
                      <span className="text-teal-600 border-b-4 border-teal-200/50">
                        {selectedBodyPart}
                      </span>
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Specialized care units available
                    </p>
                  </div>
                  <Link
                    to="/doctors"
                    className="hidden sm:flex items-center text-teal-600 font-bold hover:text-teal-700"
                  >
                    View All Doctors <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow content-start">
                  {departments[selectedBodyPart]?.map((dept, idx) => (
                    <Link
                      key={idx}
                      to={`/doctors?specialty=${encodeURIComponent(dept)}`}
                      className="group flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-teal-600 hover:text-white transition-all duration-300 border border-slate-100 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-600/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-teal-400 group-hover:bg-white transition-colors"></div>
                        <span className="font-bold text-lg">{dept}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/0 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-white transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 sm:hidden">
                  <Link
                    to="/doctors"
                    className="flex items-center justify-center w-full py-3 text-teal-600 font-bold bg-teal-50 rounded-xl"
                  >
                    View All Doctors
                  </Link>
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
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={() => setShowVideo(true)}
              >
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
                <span className="text-slate-400 font-medium tracking-widest uppercase text-sm">
                  Gold Standard
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                Redefining Healthcare <br />
                <span className="text-slate-500">with</span> Innovation &
                Empathy
              </h2>

              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                AD Hospital stands as a beacon of medical excellence, seamlessly
                blending advanced scientific capabilities with deep human
                compassion. As a JCI-accredited facility, we are committed to
                delivering superior clinical outcomes through rigorous safety
                standards and a tireless dedication to patient well-being.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400 mt-1">
                    <Microscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">
                      Precision Medicine
                    </h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      Leveraging AI-driven diagnostics and robotic surgery for
                      treatments defined by accuracy and faster recovery.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mt-1">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">
                      Holistic Care
                    </h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      Our multidisciplinary approach ensures every treatment
                      plan is tailored to the physical and emotional needs of
                      the patient.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowLearnMore(true)}
                  className="inline-flex bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors items-center gap-2"
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowCertificates(true)}
                  className="inline-flex border border-slate-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                >
                  View Certificates
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News & Events Carousel */}
      <section id="news" className="py-24 bg-[#fdfbf6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-2 block">
                Updates
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                News & Events
              </h2>
            </div>
            <button
              onClick={() => setShowAllNews(true)}
              className="hidden md:flex items-center text-slate-500 font-bold hover:text-teal-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              View All Posts <ArrowRight className="w-4 h-4 ml-2" />
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
                  const month = dateObj.toLocaleString("default", {
                    month: "short",
                  });
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
                            <div className="text-2xl font-bold leading-none mb-0.5">
                              {day}
                            </div>
                            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                              {month}
                            </div>
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
                            Read Full Story{" "}
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Slider>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>No news updates available at the moment.</p>
              </div>
            )}
          </div>

          <div className="md:hidden text-center mt-8">
            <button
              onClick={() => setShowAllNews(true)}
              className="inline-flex items-center text-slate-500 font-bold hover:text-teal-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              View All Posts <ArrowRight className="w-4 h-4 ml-2" />
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
              <span className="text-teal-600 font-bold tracking-widest uppercase text-xs mb-2 block">
                About AD Hospital
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 font-serif">
                Pioneering Healthcare Since 1998
              </h2>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                  <p>
                    At AD Hospital, we believe that healing is more than just
                    medicine—it's about understanding, compassion, and
                    innovation. For over two decades, we have been at the
                    forefront of medical excellence, serving our community with
                    unwavering dedication.
                  </p>
                  <p>
                    Our facility is designed to provide a healing environment,
                    combining state-of-the-art technology with the warmth of
                    human touch. From complex robotic surgeries to preventive
                    health screenings, every aspect of our care is tailored to
                    the unique needs of our patients.
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 text-xl mb-4">
                    Our Core Values
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-teal-100 text-teal-600 p-1 rounded-full mt-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">
                          Patient First
                        </h4>
                        <p className="text-sm text-slate-500">
                          Every decision we make centers around the well-being
                          and comfort of our patients.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-600 p-1 rounded-full mt-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">
                          Integrity & Ethics
                        </h4>
                        <p className="text-sm text-slate-500">
                          We adhere to the highest standards of professionalism
                          and ethical conduct.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-purple-100 text-purple-600 p-1 rounded-full mt-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">Innovation</h4>
                        <p className="text-sm text-slate-500">
                          Continuously adopting the latest medical advancements
                          to improve outcomes.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    500+
                  </div>
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Beds
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    120+
                  </div>
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    ICU Units
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    50k+
                  </div>
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Happy Patients
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    15+
                  </div>
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Awards
                  </div>
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
                <h2 className="text-2xl font-bold text-slate-900 font-serif">
                  Accreditations & Awards
                </h2>
                <p className="text-slate-500 text-sm">
                  Recognized globally for clinical excellence
                </p>
              </div>
              <button
                onClick={() => setShowCertificates(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <div className="p-8 bg-slate-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Certificate Items */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-lg transition-all">
                <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-4 text-white shadow-lg shadow-yellow-400/30">
                  <Award className="w-12 h-12" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  JCI Accreditation
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Gold Seal of Approval® from Joint Commission International,
                  representing the highest standard in global healthcare.
                </p>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                  Valid until 2026
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-lg transition-all">
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-4 text-white shadow-lg shadow-blue-500/30">
                  <ShieldCheck className="w-12 h-12" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  ISO 9001:2015
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Certified for Quality Management Systems, ensuring consistent
                  and superior patient care processes.
                </p>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                  Certified
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-lg transition-all">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-4 text-white shadow-lg shadow-green-500/30">
                  <Heart className="w-12 h-12" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  WHO Patient Safety
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Recognized by World Health Organization for outstanding
                  implementation of patient safety protocols.
                </p>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                  Award Winner 2023
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-lg transition-all">
                <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center mb-4 text-white shadow-lg shadow-purple-500/30">
                  <Microscope className="w-12 h-12" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  Best Clinical Research
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  National award for contribution to medical research and
                  advancements in robotic surgery.
                </p>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                  Excellence Award
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-lg transition-all">
                <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-4 text-white shadow-lg shadow-red-500/30">
                  <Activity className="w-12 h-12" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  Top Trauma Center
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Ranked #1 for Emergency Response and Trauma Care in the region
                  by Health Digest.
                </p>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                  Rank #1
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All News Grid Modal */}
      {showAllNews && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAllNews(false)}
          />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col animate-[fadeIn_0.2s_ease-out]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-20">
              <div>
                <span className="text-teal-600 font-bold tracking-widest uppercase text-xs mb-1 block">
                  Archives
                </span>
                <h2 className="text-2xl font-bold text-slate-900">
                  All News & Events
                </h2>
              </div>
              <button
                onClick={() => setShowAllNews(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 md:p-8 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => {
                  const isItemVideo = isVideo(item.image);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNews(item)}
                      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                    >
                      <div className="h-48 relative overflow-hidden shrink-0 bg-slate-100">
                        {isItemVideo ? (
                          <video
                            src={item.image}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        )}
                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 uppercase tracking-wide">
                          {item.category}
                        </div>
                        {isItemVideo && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Play className="w-5 h-5 text-white fill-current" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(item.date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">
                          {item.content}
                        </p>
                        <span className="inline-flex items-center text-teal-600 font-bold text-sm mt-auto group-hover:translate-x-1 transition-transform">
                          Read Full Story{" "}
                          <ArrowRight className="w-4 h-4 ml-1" />
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
                <div className="text-2xl font-bold leading-none mb-0.5">
                  {new Date(selectedNews.date).getDate()}
                </div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  {new Date(selectedNews.date).toLocaleString("default", {
                    month: "short",
                  })}
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full uppercase tracking-wider border border-teal-100">
                  {selectedNews.category}
                </span>
                <span className="text-slate-400 text-sm font-medium">
                  {new Date(selectedNews.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">
                {selectedNews.title}
              </h2>

              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                  {selectedNews.content}
                </p>
                {/* Mocking extra content for "Full Story" feel */}
                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line mt-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line mt-4">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Close Article
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
