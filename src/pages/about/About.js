import { useEffect, useState } from "react";
import {
  BookOpen,
  ShoppingBag,
  MessageCircle,
  Users,
  UserPlus,
  GraduationCap,
  FileText,
  Globe,
  Home,
  Video,
  Bell,
  ChevronLeft,
  ChevronRight,
  Sparkle, ShieldCheck, Sparkles, LockKeyhole,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import FeatureSlider from "./FeatureSlider";


const slides = [
  {
    title: "Welcome to Islamic Path",
    desc: "Begin your journey of authentic Islamic learning built upon Quran and Sunnah. Explore structured lessons that guide you from foundational beliefs in Aqeedah, daily worship in Fiqh, understanding Hadith, and reflections from Tafsir — all designed to strengthen your connection with Allah step by step in a clear and practical way.",
    color: "from-emerald-600 to-green-500",
    icon: BookOpen,
  },
  {
    title: "Learn with Structured Courses",
    desc: "Access a complete learning system designed for students of all levels. Whether you are a beginner or advanced learner, our structured modules help you progress gradually through Islamic studies with clarity, proper understanding, and guided resources from trusted sources.",
    color: "from-blue-600 to-cyan-500",
    icon: GraduationCap,
  },
  {
    title: "Shop Islamic Knowledge Resources",
    desc: "Discover a wide collection of authentic Islamic books, digital courses, lecture notes, and educational materials carefully selected to help you grow in knowledge. Every resource is aimed at improving your understanding of Deen and strengthening your daily practice of Islam.",
    color: "from-blue-700 to-indigo-500",
    icon: ShoppingBag,
  },
  {
    title: "Join a Living Community",
    desc: "Connect with a global community of students, teachers, and scholars where knowledge is shared, questions are answered, and meaningful discussions take place. Learn together in a respectful environment built for growth, unity, and mutual benefit in Islam.",
    color: "from-purple-600 to-pink-500",
    icon: MessageCircle,
  },
  {
    title: "Grow With Beneficial Content Every Day",
    desc: "Stay consistent in your Deen through daily reminders, Islamic content, learning challenges, and guided reflections. This platform helps you build discipline in worship, improve your character, and remain connected to your purpose as a Muslim.",
    color: "from-orange-600 to-red-500",
    icon: Sparkle,
  },
];

const sections = [
  {
    title: "Islam Path",
    desc: "A complete structured journey for learning authentic Islamic knowledge from basics of Aqeedah, Fiqh, Hadith, and Tafsir to advanced understanding of the Deen in a simple guided system.",
    icon: BookOpen,
    color: "bg-emerald-500",
    link: "/islam-path",
  },
  {
    title: "Online Shop",
    desc: "Buy carefully selected Islamic books, digital courses, educational materials, and learning resources to strengthen your understanding of Islam.",
    icon: ShoppingBag,
    color: "bg-blue-500",
    link: "/shop",
  },
  {
    title: "Posts & Content",
    desc: "Read, share, and engage with authentic Islamic posts, reminders, articles, and beneficial knowledge shared by scholars and community members.",
    icon: FileText,
    color: "bg-purple-500",
    link: "/posts",
  },
  {
    title: "Online Teaching",
    desc: "Join live lectures, Islamic classes, and structured online sessions with teachers, scholars, and mentors guiding you step-by-step.",
    icon: Video,
    color: "bg-red-500",
    link: "/teaching",
  },
  {
    title: "Exams & Assignments",
    desc: "Test your understanding through quizzes, assignments, and structured assessments designed to improve your Islamic knowledge and retention.",
    icon: GraduationCap,
    color: "bg-yellow-500",
    link: "/exams",
  },
  {
    title: "Group Chat",
    desc: "Collaborate and discuss with study groups, classmates, and learning circles in a focused Islamic learning environment.",
    icon: Users,
    color: "bg-indigo-500",
    link: "/groups",
  },
  {
    title: "Messages",
    desc: "Private messaging system for direct communication between students, teachers, and community members securely.",
    icon: MessageCircle,
    color: "bg-pink-500",
    link: "/messages",
  },
  {
    title: "Add Friends",
    desc: "Connect with fellow students, scholars, and learners to build meaningful educational and spiritual connections.",
    icon: UserPlus,
    color: "bg-cyan-500",
    link: "/friends",
  },
  {
    title: "Community Chat",
    desc: " Join a Islamic community where students, scholars, and seekers of knowledge come together to ask questions, share reminders, and grow spiritually with respect and built upon Quran and Sunnah.",
    icon: Globe,
    color: "bg-orange-500",
    link: "/community",
  },
];

const extraFeatures = [
  {
    title: "Daily Islamic Reminders",
    desc: "Receive beneficial daily reminders, Quran verses, Hadith, and motivational Islamic content that helps strengthen your Imaan and keep you connected to remembrance of Allah every single day.",
    icon: Bell,
    color: "bg-emerald-500/10 text-emerald-400",
  },
  {
    title: "Passkeys & Secure Protection",
    desc: "Advanced account security with passkeys, encrypted authentication, and safe login systems designed to keep your Islamic Path account protected and secure from unauthorized access.",
    icon: ShieldCheck,
    color: "bg-cyan-500/10 text-cyan-400",
  },
  {
    title: "Smart Message Notifications",
    desc: "Get instant notifications for new messages, class updates, replies, assignments, community discussions, and important activities happening across the platform in real time.",
    icon: LockKeyhole,
    color: "bg-purple-500/10 text-purple-400",
  },
  {
    title: "Daily Post Updates",
    desc: "Stay updated with daily beneficial Islamic posts, educational content, reflections, scholar reminders, and knowledge-sharing articles from the community and teachers.",
    icon: Sparkles,
    color: "bg-orange-500/10 text-orange-400",
  },
];


export default function About() {
  const [active, setActive] = useState(0);

  const navigate = useNavigate();

  // auto slider
  useEffect(() => {
    const t = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const next = () => setActive((p) => (p + 1) % slides.length);
  const prev = () => setActive((p) => (p - 1 + slides.length) % slides.length);
   
  const [showMore, setShowMore] = useState(false);

  const Icon = slides[active].icon;

  return (
    <div className="bg-[var(--bg-color)] text-[var(--text-color)] pb-10 sm:pb-20">

      {/* TOP SLIDER */}
      <div className="relative h-[85vh] sm:h-[92vh] overflow-hidden group">

  {/* ANIMATION STYLE */}
  <style>
    {`
      @keyframes floatUp {
        0% {
          transform: translateY(0px) translateX(0px);
          opacity: 0;
        }
        20% {
          opacity: 1;
        }
        100% {
          transform: translateY(-120vh) translateX(40px);
          opacity: 0;
        }
      }

      @keyframes twinkle {
        0%, 100% {
          opacity: 0.2;
          transform: scale(1);
        }
        50% {
          opacity: 1;
          transform: scale(1.8);
        }
      }

      @keyframes moonMove {
        0% {
          transform: translateX(0px);
        }
        50% {
          transform: translateX(-20px);
        }
        100% {
          transform: translateX(0px);
        }
      }

      @keyframes sunGlow {
        0%, 100% {
          transform: scale(1);
          opacity: 0.7;
        }
        50% {
          transform: scale(1.1);
          opacity: 1;
        }
      }
    `}
  </style>

  {/* BACKGROUND PARTICLES */}
  <div className="absolute inset-0 z-0 overflow-hidden">

    {/* SMALL STARS */}
    {[...Array(100)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          opacity: Math.random(),
          animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out`,
        }}
      />
    ))}

    {/* FLOATING LIGHT PARTICLES */}
    {[...Array(25)].map((_, i) => (
      <div
        key={`particle-${i}`}
        className="absolute rounded-full"
        style={{
          width: `${Math.random() * 120 + 50}px`,
          height: `${Math.random() * 120 + 50}px`,
          background:
            i % 2 === 0
              ? "rgba(16,185,129,0.12)"
              : "rgba(59,130,246,0.10)",
          left: `${Math.random() * 100}%`,
          bottom: `-${Math.random() * 200}px`,
          animation: `floatUp ${Math.random() * 12 + 10}s linear infinite`,
          animationDelay: `${Math.random() * 10}s`,
        }}
      />
    ))}

    {/* GLOW STARS */}
    {[...Array(20)].map((_, i) => (
      <div
        key={`glow-${i}`}
        className="absolute rounded-full bg-white blur-sm"
        style={{
          width: `${Math.random() * 8 + 4}px`,
          height: `${Math.random() * 8 + 4}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          opacity: 0.7,
          animation: `twinkle ${Math.random() * 4 + 3}s infinite ease-in-out`,
        }}
      />
    ))}

    {/* MOVING MOON */}
    <div
      className="absolute top-10 right-10 sm:right-20"
      style={{
        animation: "moonMove 10s ease-in-out infinite",
      }}
    >
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-yellow-100 shadow-[0_0_80px_rgba(255,255,255,0.6)]">

        {/* moon cut */}
        <div className="absolute top-1 left-5 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-black/80" />

      </div>
    </div>

  </div>

  {/* CONTENT h-[] */}
  <div
    className={`relative h-full w-full flex items-center justify-center text-center transition-all duration-700 bg-[var(--bg-color)]/50 backdrop-blur-sm text-[var(--text-color)]`}
  >
    <div className="px-6 mt-6 flex flex-col items-center text-center">

      <h1
        style={{ lineHeight: 1.1 }}
        className="text-4xl sm:text-[60px] max-w-2xl mx-auto font-bold"
      >
        {slides[active].title}
      </h1>

      <p className="text-lg max-w-2xl font-medium pt-4 mt-2">
        {slides[active].desc}
      </p>

    </div>
  </div>

  {/* arrows */}
  <button
    onClick={prev}
    className="absolute left-2 top-1/2 -translate-y-1/2 
    bg-black/40 p-2 rounded-full 
    opacity-0 group-hover:opacity-100 
    transition-opacity duration-300 z-20"
  >
    <ChevronLeft />
  </button>

  <button
    onClick={next}
    className="absolute right-2 top-1/2 -translate-y-1/2 
    bg-black/40 p-2 rounded-full 
    opacity-0 group-hover:opacity-100 
    transition-opacity duration-300 z-20"
  >
    <ChevronRight />
  </button>

  {/* dots */}
  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
    {slides.map((_, i) => (
      <div
        key={i}
        onClick={() => setActive(i)}
        className={`w-2 h-2 rounded-full cursor-pointer ${
          i === active ? "bg-white" : "bg-white/40"
        }`}
      />
    ))}
  </div>
</div>

      {/* HEADER */}
      <div className="flex items-center rounded-xl shadow-md my-4 mx-2 border-white border-2 
      bg-[var(--primary-color)] justify-between p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold">Islamic Path</h1>
          <p className="text-sm">
            Learn • Connect • Trade • Acquire Knowledge
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <Bell className="w-5 h-5 " />
          <div className="w-8 h-8 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-4">

        {sections.map((item, i) => {
          const Icon = item.icon;

          return (
            <div
              key={i}
              className="group relative shadow-md hover:shadow-xl overflow-hidden rounded-3xl 
              border border-white/10 bg-[var(--primary-color)] 
              from-white/[0.07] to-white/[0.03]
              hover:from-white/[0.10] hover:to-white/[0.05]
              transition-all duration-300 p-5"
            >

              {/* glow */}
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/5 blur-3xl" />

              <div className="relative">

                {/* top */}
                <div className="flex items-start gap-4">

                  <div
                    className={`${item.color} w-14 h-14 rounded-2xl 
                    flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-7 h-7 text-[var(--text-color)]" />
                  </div>

                  <div className="flex-1">

                    <h2
                      className="text-xl font-bold"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {item.title}
                    </h2>

                    <p
                      className="text-[14px] text-[var(--text-color)] mt-3 leading-2"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {item.desc}
                    </p>

                  </div>

                </div>

                {/* bottom */}
                <div className=" mt-">

                  <button
                    onClick={() => navigate(item.link)}
                    className="px-4 py-2 rounded-xl bg-white/5 
                    border border-white/10 hover:bg-white/10 float-right
                    text-emerald-400 font-semibold text-sm transition"
                  >
                    Explore →
                  </button>

                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* SEE MORE BUTTON */}
      <div className="flex justify-center mt-10 px-4">

        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl
          bg-gradient-to-r from-emerald-500 to-cyan-500
          hover:scale-[1.02] transition-all duration-300 text-[var(--text-color)]
          font-semibold shadow-xl"
        >
          {showMore ? "Hide Features" : "See More Features"}

          {showMore ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

      </div>

      {/* EXTRA FEATURES */}
      {showMore && (
        <div className="px-4 mt-8">

          <div
            className="rounded-[32px] border border-white/10
            bg-gradient-to-br from-white/[0.05] to-white/[0.02]
            p-6 sm:p-8"
          >

            <div className="text-center mb-10">

              <h2
                className="text-3xl sm:text-4xl font-black"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                More Powerful Features
              </h2>

              <p className=" mt-3 max-w-2xl mx-auto leading-7">
                Islamic Path provides modern tools and beneficial systems
                designed to improve learning, communication, security,
                reminders, and spiritual growth in one complete platform.
              </p>

            </div>

            <div className="grid md:grid-cols-2 gap-5">

              {extraFeatures.map((item, i) => {
                const Icon = item.icon;

                return (
                  <div
                    key={i}
                    className="rounded-3xl border border-white/10
                    bg-black/20 hover:bg-black/30
                    transition-all duration-300 p-6"
                  >

                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color}`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-bold mt-5">
                      {item.title}
                    </h3>

                    <p className=" leading-7 mt-3 text-[15px]">
                      {item.desc}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

        </div>
      )}

      {/* Slider Features */}

      <FeatureSlider />
      
      {/* FOUNDER SECTION */}
<div className="px-4 mt-14">
  <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl">

    <div className="grid md:grid-cols-2 gap-10 items-center p-6 sm:p-10 lg:px-14">

      <div className="flex flex-col items-center justify-center ">

        <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 p-[4px] shadow-[0_0_60px_rgba(16,185,129,0.35)]">
          <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center overflow-hidden">
            <span
              className="text-7xl sm:text-8xl font-black bg-gradient-to-br 
              from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
              style={{
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "-3px",
              }}
            >
              N
            </span>

          </div>

          {/* GLOW */}
          <div className="absolute inset-0 rounded-full blur-3xl bg-emerald-500/20 -z-10" />
        </div>

        {/* NAME */}
        <h3
          className="mt-6 text-3xl sm:text-4xl font-black text-center tracking-tight"
          style={{
            fontFamily: "'Poppins', sans-serif",
            lineHeight: 1.1,
          }}
        >
          Sheriffuddeen Ibn Nuruddeen
        </h3>

        <p className="text-emerald-400 text-sm sm:text-base mt-2 tracking-wide uppercase font-semibold">
          Founder • Visionary • Software Developer
        </p>

        {/* BIO */}
        <div className="mt-8 max-w-2xl space-y-5">

          <p
            className="text-[13px] leading-8 font-semibold italic text-[var(--text-color)]"
            style={{
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Sheriffuddeen Ibn Nuruddeen is the visionary founder behind
            Islamic Path — a modern digital platform dedicated to making
            authentic Islamic learning more accessible, engaging, and
            spiritually beneficial for Muslims around the world. His work
            combines Islamic education with modern technology to create an
            environment where learning, communication, and community growth
            can exist together in one organized ecosystem.
          </p>

          <p
            className="text-[13px] leading-8 font-semibold italic text-[var(--text-color)]"
            style={{
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Driven by a passion for beneficial knowledge, educational
            innovation, and software engineering, he developed Islamic Path
            to help Muslims strengthen their relationship with the Quran and
            Sunnah through structured lessons, interactive discussions,
            online teaching systems, community engagement, and Islamic
            resources designed for everyday practical learning.
          </p>

          <p
            className="text-[13px] leading-8 font-semibold italic text-[var(--text-color)]"
            style={{
              fontFamily: "'Inter', sans-serif",
            }}
          >
            His long-term mission is to build a trusted Islamic digital
            space that inspires growth in knowledge, worship, character, and
            unity among Muslims globally. Through creativity, dedication,
            and continuous development, he continues to expand the platform
            with tools that support meaningful learning experiences and
            positive online interaction rooted in authentic Islamic values.
          </p>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">

          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

          <span className="text-emerald-400 text-xs tracking-[3px] uppercase font-bold">
            About The Platform
          </span>

        </div>

        <h2
          className="text-4xl sm:text-5xl font-black my-6 leading-tight"
          style={{
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: "-2px",
          }}
        >
          A Modern Platform Built For Islamic Learning & Spiritual Growth
        </h2>

        <p
          className="text-[13px] leading-8 font-semibold italic text-[var(--text-color)]"
          style={{
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Islamic Path was created with a clear purpose: to provide Muslims
          with a complete digital environment where authentic Islamic
          knowledge can be learned in an organized, engaging, and practical
          way. The platform is designed to combine education, community,
          communication, and spiritual development into a single experience
          that benefits learners of all levels.
        </p>

        <p
          className="text-[13px] leading-8 font-semibold italic text-[var(--text-color)]"
          style={{
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Rather than focusing only on information delivery, Islamic Path
          aims to nurture understanding, consistency, and personal growth.
          Users can study structured Islamic subjects, join beneficial
          discussions, communicate with teachers and students, access
          educational resources, participate in assignments and exams, and
          stay connected to reminders that encourage daily improvement in
          worship and character.
        </p>

        <p
          className="text-[13px] leading-8 font-semibold italic text-[var(--text-color)]"
          style={{
            fontFamily: "'Inter', sans-serif",
          }}
        >
          The vision behind the platform is to bridge the gap between modern
          technology and authentic Islamic values by creating a safe,
          beneficial, and inspiring environment that supports Muslims in
          their journey of knowledge, discipline, unity, and spiritual
          excellence.
        </p>

        {/* STATS */}
        <div className="grid sm:grid-cols-2 grid-cols gap-4 mt-10">

          <div className="rounded-2xl shadow-md hover:shadow-xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-3xl font-black text-emerald-400">24/7</h3>
            <p className="text-sm  mt-2 leading-6">
              Continuous access to Islamic learning resources, discussions,
              and educational content.
            </p>
          </div>

          <div className="rounded-2xl shadow-md hover:shadow-xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-3xl font-black text-emerald-400 ">Global</h3>
            <p className="text-sm  mt-2 leading-6">
              Designed to connect Muslims, students, and scholars from all
              around the world.
            </p>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex flex-wrap gap-4 mt-10">

          <button
            onClick={() =>navigate('/post')}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-[var(--text-color)]
            transition-all duration-300 font-semibold shadow-lg shadow-emerald-500/20"
          >
            Explore Platform
          </button>

          

        </div>

      </div>

    </div>

  </div>
</div>


{/* WHY PLATFORM WAS CREATED */}<div className="px-4 mt-16">

  <div
    className="relative overflow-hidden rounded-[36px] border border-white/10 
    bg-gradient-[var(--bg-color)] from-[#0f172a] via-[#111827] to-black"
  >

    {/* BACKGROUND GLOW */}
    <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500/20 blur-3xl rounded-full" />
    <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full" />

    <div className="relative p-3 sm:p-10 lg:p-14">

      {/* TOP */}
      <div className="max-w-5xl mx-auto text-center">
        {/* HEADING */}
        <h2
          className="mt-8 text-3xl sm:text-5xl lg:text-6xl font-black leading-tight"
          style={{
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: "-2px",
          }}
        >
          Why Islamic Path
          <span className="block text-emerald-400 mt-2">
            Was Created
          </span>
        </h2>

        {/* SUBTEXT */}
        <p
          className="max-w-3xl mx-auto mt-7 text-[16px] sm:text-[17px] 
          leading-8 font-semibold italic text-[var(--text-color)]"
          style={{
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Islamic Path was built to create a beneficial digital space where
          Muslims can learn authentic Islamic knowledge, strengthen their
          connection with Allah, and grow within a positive Islamic
          environment free from distractions and harmful content.
        </p>

      </div>

      {/* MAIN CONTENT */}
      <div className="grid lg:grid-cols-2 sm:gap-8 gap-4 sm:mt-14 mt-2 items-center">

        {/* LEFT SIDE */}
        <div className="space-y-6">

          <div
            className="rounded-3xl border border-white/10 
            bg-white/[0.04] backdrop-blur-xl p-6"
          >
            <h3
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              The Vision Behind The Platform
            </h3>

            <p className="text-[var(--text-color)] leading-8 text-[13px] font-semibold">
              Many Muslims today desire authentic Islamic learning but often
              struggle to find organized, reliable, and engaging platforms
              dedicated to beneficial knowledge. Most online spaces are
              filled with distractions, misinformation, and content that
              weakens focus and spiritual growth.
            </p>

            <p className="text-[var(--text-color)] leading-8 text-[13px] font-semibold mt-5">
              Islamic Path was developed to solve this challenge by bringing
              together Islamic education, communication, community building,
              and modern technology into one complete experience that helps
              Muslims learn, interact, and improve consistently.
            </p>
          </div>

          <div
            className="rounded-3xl border border-white/10 
            bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-6"
          >
            <h3
              className="text-xl font-bold mb-3"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              A Platform Built For Every Muslim
            </h3>

            <p className="text-[var(--text-color)] leading-7 text-[15px]">
              Whether someone is beginning their journey in Islam or already
              seeking advanced Islamic understanding, the platform is
              designed to support continuous learning, spiritual growth,
              beneficial interaction, and a stronger connection to Quran and
              Sunnah through modern digital tools.
            </p>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="grid gap-5">

          {/* CARD 1 */}
          <div
            className="group rounded-3xl border border-white/10 
            bg-white/[0.04] hover:bg-white/[0.07]
            transition-all duration-300 p-6"
          >
            <div className="flex items-start gap-4">

              <div
                className="w-14 h-14 px-4 rounded-2xl 
                bg-emerald-500/15 flex items-center justify-center"
              >
                <BookOpen className="w-7 h-7 text-emerald-400" />
              </div>

              <div>
                <h3 className="sm:text-xl text-[15px] font-bold">
                  Authentic Islamic Learning
                </h3>

                <p className="text-[var(--text-color)] leading-7 mt-2 text-[13px]">
                  Providing structured Islamic knowledge based on Quran and
                  Sunnah with clarity, proper understanding, and organized
                  educational systems.
                </p>
              </div>

            </div>
          </div>

          {/* CARD 2 */}
          <div
            className="group rounded-3xl border border-white/10 
            bg-white/[0.04] hover:bg-white/[0.07]
            transition-all duration-300 p-6"
          >
            <div className="flex items-start gap-4">

              <div
                className="w-14 h-14 px-4 rounded-2xl 
                bg-cyan-500/15 flex items-center justify-center"
              >
                <Users className="w-7 h-7 text-cyan-400" />
              </div>

              <div>
                <h3 className="sm:text-xl text-[15px] font-bold">
                  Global Islamic Community
                </h3>

                <p className="text-[var(--text-color)] leading-7 mt-2 text-[13px]">
                  Connecting Muslims from around the world through beneficial
                  discussions, group learning, mentorship, and meaningful
                  Islamic interaction.
                </p>
              </div>

            </div>
          </div>

          {/* CARD 3 */}
          <div
            className="group rounded-3xl px-4 border border-white/10 
            bg-white/[0.04] hover:bg-white/[0.07]
            transition-all duration-300 p-6"
          >
            <div className="flex items-start gap-4">

              <div
                className="w-14 h-14 rounded-2xl 
                bg-purple-500/15 flex items-center justify-center"
              >
                <GraduationCap className="w-7 h-7 text-purple-400" />
              </div>

              <div>
                <h3 className="sm:text-xl text-[15px] font-bold">
                  Modern Educational Experience
                </h3>

                <p className="text-[var(--text-color)] leading-7 mt-2 text-[13px]">
                  Combining modern technology with Islamic values to create
                  interactive learning systems, assignments, communication,
                  online classes, and spiritual development tools.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM QUOTE */}
      <div
        className="sm:mt-14 mt-6 rounded-[30px] border border-emerald-500/20
        bg-gradient-to-r from-emerald-500/10 to-cyan-500/10
        p-8 text-center"
      >

        <p
          className="text-xs sm:text-xl font-bold leading-relaxed"
          style={{
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          “A platform created to help Muslims learn, connect,
          and grow through beneficial Islamic knowledge.”
        </p>

      </div>

    </div>

  </div>


</div>
    </div>
  );
}








