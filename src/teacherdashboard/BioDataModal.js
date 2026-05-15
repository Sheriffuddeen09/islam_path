import { useEffect, useState } from "react";
import api from "../Api/axios";

import {
  Loader2,
  X,
  Trash2,
  User,
  GraduationCap,
  BriefcaseBusiness,
} from "lucide-react";

import { toast } from "react-hot-toast";

export default function BiodataModal({ onClose, userId }) {

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState(null);

  const [biodataList, setBiodataList] = useState([
    {
      marital_status: "",
      address: "",
      state: "",
      bio: "",
    },
  ]);

  // =========================
  // EDUCATION INPUT + LIST
  // =========================
  const [education, setEducation] = useState({
    school: "",
    course: "",
    year: "",
  });

  const [educationList, setEducationList] = useState([]);

  // =========================
  // CAREER INPUT + LIST
  // =========================
  const [career, setCareer] = useState({
    company: "",
    role: "",
    duration: "",
  });

  const [careerList, setCareerList] = useState([]);

  // =========================
  // FETCH DATA
  // =========================
  const fetchBio = async () => {

    try {

      setFetching(true);

      const url = userId
        ? `/api/biodata/${userId}`
        : `/api/biodata/me`;

      const res = await api.get(url);

      const data = res.data;

      setBio(data || null);

      if (!userId && data) {

        setBiodataList(
          data.biodata?.length
            ? data.biodata
            : [
                {
                  marital_status: data.marital_status || "",
                  address: data.address || "",
                  state: data.state || "",
                  bio: data.bio || "",
                },
              ]
        );

        setEducationList(data.educations || []);
        setCareerList(data.careers || []);
      }

    } catch (err) {
      console.log(err);
      toast.error("Failed to load biodata");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBio();
  }, [userId]);


  const updateBiodata = (index, field, value) => {
    const updated = [...biodataList];
    updated[index][field] = value;
    setBiodataList(updated);
  };


  const saveBio = async () => {

  try {

    setSaving(true);

    await api.post("/api/biodata", {
      biodata: biodataList,
      education: educationList,
      career: careerList,
    });

    toast.success(
      bio
        ? "Biodata updated"
        : "Biodata saved"
    );

    await fetchBio();

    // CLOSE MODAL
    onClose();

  } catch (err) {

    console.log(err);

    toast.error("Save failed");

  } finally {

    setSaving(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">

      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto scrollbar-thin bg-white/10 border border-white/20 backdrop-blur-2xl rounded-3xl text-white p-6 relative">

        {/* CLOSE */}
        <button onClick={onClose} className="absolute top-4 right-4">
          <X />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {userId ? "Edit Biodata" : " User Biodata"}
        </h2>

        {fetching ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>

            {/* ================= BIODATA ================= */}
            <div className="space-y-4">

              <div className="flex items-center gap-2">
                <User />
                <h3 className="font-bold text-lg">Biodata</h3>
              </div>

              {biodataList.map((item, index) => (
                <div key={index} className="bg-black/30 p-4 rounded-2xl">

                  <input
                    placeholder="State"
                    className="w-full p-3 mb-2 bg-black/20 rounded-xl"
                    value={item.state}
                    onChange={(e) =>
                      updateBiodata(index, "state", e.target.value)
                    }
                  />

                  <input
                    placeholder="Address"
                    className="w-full p-3 mb-2 bg-black/20 rounded-xl"
                    value={item.address}
                    onChange={(e) =>
                      updateBiodata(index, "address", e.target.value)
                    }
                  />

                  <input
                    placeholder="Marital Status"
                    className="w-full p-3 mb-2 bg-black/20 rounded-xl"
                    value={item.marital_status}
                    onChange={(e) =>
                      updateBiodata(index, "marital_status", e.target.value)
                    }
                  />

                  <textarea
                    placeholder="Bio"
                    className="w-full p-3 bg-black/20 rounded-xl"
                    rows={4}
                    value={item.bio}
                    onChange={(e) =>
                      updateBiodata(index, "bio", e.target.value)
                    }
                  />

                  
                </div>
              ))}
            </div>

            {/* ================= EDUCATION ================= */}
            <div className="mt-6">

              <div className="flex items-center gap-2 mb-3">
                <GraduationCap />
                <h3 className="font-bold">Education</h3>
              </div>

              {/* INPUTS */}
              <div className="bg-black/20 p-4 rounded-xl space-y-2">

                <input
                  placeholder="School"
                  className="w-full p-3 bg-black/30 rounded-xl"
                  value={education.school}
                  onChange={(e) =>
                    setEducation({ ...education, school: e.target.value })
                  }
                />

                <input
                  placeholder="Course"
                  className="w-full p-3 bg-black/30 rounded-xl"
                  value={education.course}
                  onChange={(e) =>
                    setEducation({ ...education, course: e.target.value })
                  }
                />

                <input
                  placeholder="Year"
                  className="w-full p-3 bg-black/30 rounded-xl"
                  value={education.year}
                  onChange={(e) =>
                    setEducation({ ...education, year: e.target.value })
                  }
                />

              </div>

              {/* LIST */}
              {educationList.map((e, index) => (
                <div
                  key={index}
                  className="bg-black/20 p-3 rounded-xl mt-2 flex justify-between"
                >
                  <div>
                    <p className="font-semibold">{e.school}</p>
                    <p className="text-sm opacity-70">{e.course}</p>
                  </div>
                </div>
              ))}

            </div>

            {/* ================= CAREER ================= */}
            <div className="mt-6">

              <div className="flex items-center gap-2 mb-3">
                <BriefcaseBusiness />
                <h3 className="font-bold">Career</h3>
              </div>

              {/* INPUTS */}
              <div className="bg-black/20 p-4 rounded-xl space-y-2">

                <input
                  placeholder="Company"
                  className="w-full p-3 bg-black/30 rounded-xl"
                  value={career.company}
                  onChange={(e) =>
                    setCareer({ ...career, company: e.target.value })
                  }
                />

                <input
                  placeholder="Role"
                  className="w-full p-3 bg-black/30 rounded-xl"
                  value={career.role}
                  onChange={(e) =>
                    setCareer({ ...career, role: e.target.value })
                  }
                />

                <input
                  placeholder="Duration"
                  className="w-full p-3 bg-black/30 rounded-xl"
                  value={career.duration}
                  onChange={(e) =>
                    setCareer({ ...career, duration: e.target.value })
                  }
                />

              </div>

              {/* LIST */}
              {careerList.map((c, index) => (
                <div
                  key={index}
                  className="bg-black/20 p-3 rounded-xl mt-2 flex justify-between"
                >
                  <div>
                    <p className="font-semibold">{c.company}</p>
                    <p className="text-sm opacity-70">{c.role}</p>
                  </div>
                </div>
              ))}

            </div>

            {/* SAVE */}
            <button
              onClick={saveBio}
              disabled={saving}
              className="w-full mt-8 bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl flex justify-center items-center gap-2"
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save Biodata"
              )}
            </button>

          </>
        )}
      </div>
    </div>
  );
}