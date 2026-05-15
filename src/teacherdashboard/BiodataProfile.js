import { useEffect, useState } from "react";
import api from "../Api/axios";
import {
  Loader2,
  User2,
  GraduationCap,
  BriefcaseBusiness,
  MapPin,
  Heart,
  Phone,
  Mail,
} from "lucide-react";

export default function BiodataProfile({ userId }) {

  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {

    try {

      setLoading(true);

      const res = await api.get(`/api/biodata/${userId}`);

      setBio(res.data);

    } catch (err) {

      console.log(err);

      setBio(null);

    } finally {

      setLoading(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  // ================= EMPTY =================
  if (!bio) {
    return (
      <div className="text-center text-white opacity-70 p-10">
        No biodata found
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-white space-y-6">

      {/* ================= HEADER ================= */}
      <div className="bg-white/10 border border-white/10 rounded-3xl p-6">

        <div className="flex items-center gap-3 mb-3">
          <User2 className="text-blue-400" />
          <h1 className="text-xl font-bold">
            User Biodata
          </h1>
        </div>

        <p className="opacity-80 leading-6">
          {bio.bio || "No bio available"}
        </p>

      </div>

      {/* ================= PERSONAL INFO ================= */}
      <Section title="Personal Information" icon={<User2 />}>

        <InfoRow label="Marital Status" value={bio.marital_status} icon={<Heart />} />
        <InfoRow label="Address" value={bio.address} icon={<MapPin />} />
        <InfoRow label="State" value={bio.state} icon={<MapPin />} />
        <InfoRow label="Phone" value={bio.phone} icon={<Phone />} />
        <InfoRow label="Email" value={bio.email} icon={<Mail />} />

      </Section>

      {/* ================= EDUCATION ================= */}
      <Section title="Education" icon={<GraduationCap />}>

        {bio.educations?.length > 0 ? (

          <div className="space-y-3">

            {bio.educations.map((e) => (
              <div
                key={e.id}
                className="bg-black/20 border border-white/10 p-4 rounded-2xl"
              >
                <p className="font-semibold">{e.school}</p>
                <p className="text-sm opacity-70">{e.course}</p>

                <span className="inline-block mt-2 text-xs px-3 py-1 bg-green-500/20 text-green-300 rounded-full">
                  {e.year}
                </span>
              </div>
            ))}

          </div>

        ) : (
          <Empty text="No education records" />
        )}

      </Section>

      {/* ================= CAREER ================= */}
      <Section title="Career" icon={<BriefcaseBusiness />}>

        {bio.careers?.length > 0 ? (

          <div className="space-y-3">

            {bio.careers.map((c) => (
              <div
                key={c.id}
                className="bg-black/20 border border-white/10 p-4 rounded-2xl"
              >
                <p className="font-semibold">{c.company}</p>
                <p className="text-sm opacity-70">{c.role}</p>

                <span className="inline-block mt-2 text-xs px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full">
                  {c.duration}
                </span>
              </div>
            ))}

          </div>

        ) : (
          <Empty text="No career history" />
        )}

      </Section>

    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Section({ title, icon, children }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-3xl p-5">

      <div className="flex items-center gap-3 mb-4">
        <div className="text-blue-400">{icon}</div>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      {children}

    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 mb-3">

      <div className="bg-white/10 p-2 rounded-xl">
        {icon}
      </div>

      <div>
        <p className="text-xs opacity-60">{label}</p>
        <p className="font-medium">{value || "Not added"}</p>
      </div>

    </div>
  );
}

function Empty({ text }) {
  return (
    <p className="text-sm opacity-60 italic">
      {text}
    </p>
  );
}