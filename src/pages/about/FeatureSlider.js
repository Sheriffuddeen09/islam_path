import { useEffect } from "react";

export default function FeatureSlider() {

  useEffect(() => {

    function initSlider(wrapperId) {

      const wrapper = document.querySelector(wrapperId);

      if (!wrapper) return;

      const slidesContainer = wrapper.querySelector(".slides");
      const slides = wrapper.querySelectorAll(".slide_image");

      let index = 0;
      const total = slides.length;

      const interval = setInterval(() => {
        index = (index + 1) % total;

        slidesContainer.style.transform = `translateX(-${index * 100}%)`;
      }, 3000);

      return () => clearInterval(interval);
    }

    const sliders = [
      "#slider1",
      "#slider2",
      "#slider3",
      "#slider4",
      "#slider5",
      "#slider6",
      "#slider7",
      "#slider8",
    ];

    const cleanups = sliders.map(initSlider);

    return () => {
      cleanups.forEach((cleanup) => cleanup && cleanup());
    };

  }, []);

  return (
    <>
      <section className="ingredients-section testimonials">

        <div className="my-slider-block">

          <div className="slide_image-flex">

            {/* SLIDER 1 */}
            <div className="slider-wrapper" id="slider1">
              <div className="slides">

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Dua</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Daily Reminder</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Calendar</h3>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SLIDER 2 */}
            <div className="slider-wrapper" id="slider2">
              <div className="slides">

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Prayer Time</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Quran Download</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Encryption</h3>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SLIDER 3 */}
            <div className="slider-wrapper" id="slider3">
              <div className="slides">

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Student Performance</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Exam & Assignment</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Product Visibility</h3>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SLIDER 4 */}
            <div className="slider-wrapper" id="slider4">
              <div className="slides">

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Library</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Reels</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1516321165247-4aa89a48be28?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Switch Account</h3>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SLIDER 5 */}
            <div className="slider-wrapper" id="slider5">
              <div className="slides">

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Delete Account</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Bio Data</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Appearance Update</h3>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SLIDER 6 */}
            <div className="slider-wrapper" id="slider6">
              <div className="slides">

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Passkeys Security</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1516321310764-8d3f1b8fdb2f?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Secure Messaging</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Daily Notifications</h3>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SLIDER 7 */}
            <div className="slider-wrapper" id="slider7">
              <div className="slides">

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1516321165247-4aa89a48be28?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Community Groups</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Online Teaching</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Islamic Discussions</h3>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SLIDER 8 */}
            <div className="slider-wrapper" id="slider8">
              <div className="slides">

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Islamic Articles</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Student Learning</h3>
                    </div>
                  </div>
                </div>

                <div className="slide_image">
                  <div className="facepack-card">
                    <img
                      src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1200&auto=format&fit=crop"
                      alt=""
                    />
                    <div className="card-content">
                      <h3>Knowledge Hub</h3>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </section>

      <style jsx>{`
        @media (min-width: 310px) {
          .ingredients-section .slide_image-flex {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 20px;
            overflow-x: auto;
            padding: 20px 0;
          }
        }

        @media (min-width: 768px) {
          .ingredients-section .slide_image-flex {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            gap: 20px;
            flex-wrap: nowrap;
            overflow-x: auto;
            padding: 20px 0;
          }
        }

        .ingredients-section .slide_image-flex {
          display: flex;
          flex-direction: row;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          overflow-x: auto;
          padding: 20px 0;
        }

        .ingredients-section .slider-wrapper {
          width: 250px;
          overflow: hidden;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .ingredients-section .slides {
          display: flex;
          transition: transform 0.5s ease-in-out;
        }

        .ingredients-section .slide_image {
          flex: 0 0 100%;
        }

        .testimonials {
          padding: 40px 0;
          text-align: center;
          display: block;
        }

        .slider-wrapper {
          width: 300px;
          overflow: hidden;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .slides {
          display: flex;
          transition: transform 0.5s ease-in-out;
        }

        .slide_image {
          flex: 0 0 100%;
          padding: 0;
        }

        .facepack-card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }

        .facepack-card {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .facepack-card:hover {
          transform: translateY(-5px);
        }

        .card-content {
          padding: 15px;
          text-align: center;
        }

        .card-content h3 {
          font-size: 18px;
          margin: 0;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .slide_image-flex {
            flex-direction: column;
            align-items: center;
          }

          .slider-wrapper {
            width: 90%;
          }
        }

        .my-slider-block {
          display: block;
          width: 100%;
        }
      `}</style>
    </>
  );
}