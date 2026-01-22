
import Navbar from "../layout/Header";
import { useEffect, useState } from "react"
//import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { homesdata } from "./Data";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { BookOpen, MessageCircle, Search, UserCheck } from "lucide-react";

//import PropertySection from "./PropertySection";

export default function HomePage({handleMessageOpen}) {

  const [index, setIndex] = useState(0);
  const [messageOPen, setMessageOpen] = useState(false)


  // Auto Slide
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % homesdata.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [homesdata.length]);

  // Initialize AOS
  useEffect(() => {
    AOS.init();
  }, []);

  const btnStyle = {
  textDecoration: "none",
  color: "white",
  fontSize: "12px",
  fontWeight: "bold",
};

  const contentSlider =  (
    <div>
      <div className="slider-container h-[95vh] md:h-[100vh] relative  -translate-y-20">
        {/* ✅ Slides */}
        {homesdata.map((slide, i) => (
          <section
            key={slide.id}
           className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          i === index ? "opacity-100 z-20" : "opacity-0 z-0"
        }`}
          >
            <img src={slide.images} alt={slide.title} className="w-full h-full md:h-[100vh] -translate-y-2" />
            <div className="bg-opacity-80 absolute inset-0 bg-black "></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <h2 style={{ color: "white" }} className="sunmukhi-desktop letter-scale">
              {slide.title}
            </h2>
            <hr className="line" />
            <p className="text-white z-50 text-lg mt-0 font-semibold ">{slide.body}</p>
            <Link to={`${slide.link}`} className="text- font-semibold rounded-lg z-50 text-[16px] font-semibody bg-white 
            text-lg text-black my-10 hover:bg-gray-200 px-6 py-2">
              {slide.click} →
            </Link>
            <hr className="line" />
            </div>
          </section>
        ))}

        {/* ✅ Navigation */}
       <button
      className=" absolute left-4 top-1/2 transform -translate-y-1/2 z-40 bg-white bg-opacity-10 hover:bg-opacity-70 text-white hover:text-black p-3 rounded-full"
      onClick={() => setIndex((index - 1 + homesdata.length) % homesdata.length)}
    >
      ❮
    </button>
    <button
      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 bg-white bg-opacity-10 hover:bg-opacity-70 text-white hover:text-black p-3 rounded-full"
      onClick={() => setIndex((index + 1) % homesdata.length)}
    >
      ❯
    </button>

      </div>
    </div>
  );



  const content = (
    <div className="font-sans lg:rounded-2xl text-gray-800 ">
     
      {/* Slider Section */}
      <section className="translate-y-20 ">
        {contentSlider}
      </section>

      {/* What We Do */}
      <section className="py-16 px-6 md:px-12 text-center">
      <h2
        className="text-3xl md:text-4xl font-bold text-blue-800 mb-4"
        data-aos="fade-up"
      >
        What We Do?
      </h2>
      <p
        className="text-black text-lg font-semibold mb-12 max-w-2xl mx-auto"
        data-aos="fade-up"
      >
        Empowering students and seekers to connect with scholars, mentors, and authentic Islamic knowledge.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            icon: UserCheck,
            title: "Get an Arabic Mentor",
            text: "Learn the Arabic language from experienced and qualified teachers who guide you step-by-step.",
          },
          {
            icon: BookOpen,
            title: "Get a Course Mentor",
            text: "Join structured Islamic courses and receive mentorship to stay consistent in your studies.",
          },
          {
            icon: MessageCircle,
            title: "Chat with Students of Knowledge",
            text: "Connect and engage in beneficial discussions with students and seekers from around the world.",
          },
          {
            icon: Search,
            title: "Find Knowledge of Islam",
            text: "Explore verified resources, lessons, and programs to deepen your understanding of Islam.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-2xl shadow-md p-6 hover:shadow-xl hover:scale-100 hover:scale-105 transition"
            data-aos="fade-up"
            data-aos-delay={i * 200}
          >
            <item.icon className="w-12 h-12 mx-auto text-blue-700 mb-4 bg-blue-100 rounded-full p-2" />
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
    </div>
  );

  return (
    <div>
      <Navbar handleMessageOpen={handleMessageOpen}/>
      {content}
    

    </div>
  )
}
