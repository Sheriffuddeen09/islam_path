import {
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
  if (loading) return <span className="
                animate-spin
                h-4
                w-4
                border-2
                border-white
                border-t-transparent
                rounded-full inline-flex items-center gap-2
            " />

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
  <div className="p-4 lg:ml-64 ">

    <div className="max-w-5xl mx-auto space-y-6 shadow-md">

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
    <div className="flex items-start gap-3 mb-5 mt-2">

      <div className="bg-white/10 p-2 rounded-xl">
        {icon}
      </div>

      <div>
        <p className="text-xs ">{label}</p>
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

function Loader() {
  return (
    <div className="p-2 lg:ml-64 animate-pulse bg-[#17191c] rounded-2xl">

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white/30 border border-white/10 rounded-3xl p-5">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10" />
            <div className="h-5 w-40 rounded bg-white/10" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}