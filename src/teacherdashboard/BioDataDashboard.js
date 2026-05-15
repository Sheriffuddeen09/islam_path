import {
  Loader2,
  MapPin,
  Heart,
  GraduationCap,
  BriefcaseBusiness,
  Phone,
  Mail,
  Globe,
  User2,
  User,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";

import { useEffect, useState } from "react";
import api from "../Api/axios";

export default function BiodataDashboard({visibility, editVisibility, handleToggleVisibility, profile}) {

  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState(null);

  useEffect(() => {
    fetchBiodata();
  }, []);

  const fetchBiodata = async () => {

    try {

      setLoading(true);

      const res = await api.get("/api/biodata/me");

      setBio(res.data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex justify-center items-center mx-auto my-3 lg:ml-52">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  // ================= EMPTY =================
  if (!bio) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center lg:ml-64  bg-[var(--bg-color)] text-[var(--text-color)]">
        <User2 size={40} className="mx-auto mb-4" />
        <h2 className="text-2xl font-bold">No Biodata Added</h2>
        <p className="mt-2">
          Your profile data will appear here once created.
        </p>
      </div>
    );
  }

  return (
  <div className="min-h-screen p-4 bg-gradient-to-br from-[#050816] lg:ml-64 via-[#0b1120] to-[#111827] text-white">

    <div className="max-w-5xl mx-auto space-y-6">

      {/* ================= PROFILE SECTION (ALWAYS SHOW) ================= */}
      <Section title="Personal Information" icon={<Calendar />}>

        <InfoRow
          icon={<Heart size={16} />}
          label="Date of Birth"
          value={visibility.dob ? profile.dob : "Hidden"}
          editable={editVisibility}
          onToggle={() => handleToggleVisibility("dob")}
          isVisible={visibility.dob}
        />

        <InfoRow
          icon={<MapPin />}
          label="Location"
          value={visibility.location ? profile.location : "Hidden"}
          editable={editVisibility}
          onToggle={() => handleToggleVisibility("location")}
          isVisible={visibility.location}
        />

        <InfoRow
          icon={<Mail />}
          label="Email"
          value={visibility.email ? profile.email : "Hidden"}
          editable={editVisibility}
          onToggle={() => handleToggleVisibility("email")}
          isVisible={visibility.email}
        />

        <InfoRow
          icon={<Phone />}
          label="Phone"
          value={visibility.phone ? profile.phone : "Hidden"}
          editable={editVisibility}
          onToggle={() => handleToggleVisibility("phone")}
          isVisible={visibility.phone}
        />

        <InfoRow
          icon={<User />}
          label="Gender"
          value={visibility.gender ? profile.gender : "Hidden"}
          editable={editVisibility}
          onToggle={() => handleToggleVisibility("gender")}
          isVisible={visibility.gender}
        />

      </Section>

      {/* ================= SHOW ONLY IF BIODATA EXISTS ================= */}
      {bio && (
        <>
          {/* ================= BIO DATA ================= */}
          {(bio.marital_status ||
            bio.address ||
            bio.state) && (
            <Section title="Bio Data" icon={<User2 />}>

              {bio.marital_status && (
                <InfoRow
                  icon={<Heart size={16} />}
                  label="Marital Status"
                  value={bio.marital_status}
                />
              )}

              {bio.address && (
                <InfoRow
                  icon={<MapPin size={16} />}
                  label="Address"
                  value={bio.address}
                />
              )}

              {bio.state && (
                <InfoRow
                  icon={<Globe size={16} />}
                  label="State"
                  value={bio.state}
                />
              )}

            </Section>
          )}

          {/* ================= EDUCATION ================= */}
          {bio.educations?.length > 0 && (
            <Section title="Education" icon={<GraduationCap />}>

              <div className="space-y-3">

                {bio.educations.map((item) => (
                  <div
                    key={item.id}
                    className="bg-black/20 p-4 rounded-2xl"
                  >

                    <h3 className="font-semibold">
                      {item.school}
                    </h3>

                    <p className="text-sm opacity-70">
                      {item.course}
                    </p>

                    {item.year && (
                      <span className="inline-block mt-2 text-xs px-3 py-1 bg-green-500/20 text-green-300 rounded-full">
                        {item.year}
                      </span>
                    )}

                  </div>
                ))}

              </div>

            </Section>
          )}

          {/* ================= CAREER ================= */}
          {bio.careers?.length > 0 && (
            <Section title="Career" icon={<BriefcaseBusiness />}>

              <div className="space-y-3">

                {bio.careers.map((item) => (
                  <div
                    key={item.id}
                    className="bg-black/20 p-4 rounded-2xl"
                  >

                    <h3 className="font-semibold">
                      {item.company}
                    </h3>

                    <p className="text-sm opacity-70">
                      {item.role}
                    </p>

                    {item.duration && (
                      <span className="inline-block mt-2 text-xs px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full">
                        {item.duration}
                      </span>
                    )}

                  </div>
                ))}

              </div>

            </Section>
          )}
        </>
      )}

    </div>
  </div>
);
}

/* ================= COMPONENT HELPERS ================= */

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

function InfoRow({ icon, label, value, editable, onToggle, isVisible }) {
  return (
    <div className="flex items-start gap-3 mb-3">

      <div className="bg-white/10 p-2 rounded-xl">
        {icon}
      </div>

      <div>
        <p className="text-xs opacity-60">{label}</p>
        <p className="font-medium">{value || "Not added"}</p>
      </div>

      {editable && (
        <button onClick={onToggle}>
          {isVisible ? <Eye className="text-green-500" /> : <EyeOff className="text-red-500" />}
        </button>
      )}
    </div>
  );
}
