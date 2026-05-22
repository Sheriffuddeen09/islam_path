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
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEjO4Td1E_YFJLs-1MLnmEKWnnb6Tm-tnArw&s"
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
                      src="https://cdn.shopify.com/s/files/1/0011/0850/8735/files/3_daily_480x480.png?v=1645717178"
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
                      src="https://muslimaid-2022.storage.googleapis.com/upload/img_cache/file-22050-5c099713a00707878dac7d9d2c6bc4a2.jpg"
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
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyPBDvs0pUmKaKgZFPpHa0PKp9ciLpFjQ5vw&s"
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
                      src="https://i0.wp.com/afosa.org/wp-content/uploads/2019/01/quran-2784477_1920.jpg?resize=1170%2C600&ssl=1"
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
                      src="https://content.kaspersky-labs.com/se/com/content/en-global/images/repository/isc/2021/encryption-1/encryption-1.jpg"
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
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDFufe2wx3VtRVvUrnEkGxFUqSu3EJ0CMeKQ&s"
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
                      src="https://makemyassignment419318342.wordpress.com/wp-content/uploads/2019/11/images-53.jpg?w=524"
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
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJQbYGuVBumZoE9-j2Qe0ic1QZ7CJ1lY6m-g&s"
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
                      src="https://t4.ftcdn.net/jpg/04/56/20/89/360_F_456208906_h2bZ51348xqpFcYXh4sGUiQDF5zolfRm.jpg"
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
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWYsz-NuqWeF3KuhNI6hY2a8eQJj73b21lug&s"
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
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf2ui4bOD9PJalHQ6FX_m1VR5XvJQ8989JKg&s"
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
                      src="https://www.shareicon.net/data/2017/02/15/878677_community_512x512.png"
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
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8SWo4Ma368FDs8DzgXatNpLiY6IaUjJJY9w&s"
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
                      src="https://yt3.googleusercontent.com/bPyfOFWXnrbOvJevGg8J0AI1SSc0c0TJODtfu8hv1mlvCmQ1nxEyNwMMYvCo9qauPswkxr8jERM=s900-c-k-c0x00ffffff-no-rj"
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
          width: 300px;
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
          color: black;

        }

        .card-content h3 {
          font-size: 18px;
          margin: 0;
          color: black;
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