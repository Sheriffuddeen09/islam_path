import { useState } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";

export default function CreateProposal() {
  const countries = useMemo(() => countryList().getData(), []);

  const currencyOptions = [
    "NGN",
    "USD",
    "GBP",
    "EUR",
  ];

  const teacherTypeOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "any", label: "Any" },
  ];

  const teachingModeOptions = [
    { value: "online", label: "Online" },
    { value: "physical", label: "Physical (Personal Teaching)" },
  ];

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [teacherType, setTeacherType] = useState("any");
  const [teachingMode, setTeachingMode] = useState("online");
  const [location, setLocation] = useState("");
  const [qualification, setQualification] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const clearError = (field) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const errors = {};

    if (!fromTime) {
        errors.fromTime = "Select a starting time.";
    }

    if (!toTime) {
        errors.toTime = "Select an ending time.";
    }

    if (
        fromTime &&
        toTime &&
        fromTime >= toTime
    ) {
        errors.toTime =
            "Ending time must be later than starting time.";
    }
    if (!title.trim())
      newErrors.title = "Subject title is required.";

    if (!price || Number(price) <= 0)
      newErrors.price = "Enter a valid price.";

    if (!currency)
      newErrors.currency = "Select currency.";

    if (!teacherType)
      newErrors.teacherType = "Select preferred teacher.";

    if (!teachingMode)
      newErrors.teachingMode = "Select teaching mode.";

    if (teachingMode === "physical" && !location)
      newErrors.location = "Select preferred location.";

    if (!hours || Number(hours) < 1)
      newErrors.hours = "Enter teaching hours.";

    if (!description.trim())
      newErrors.description = "Description is required.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      title,
      subject,
      price,
      currency,
      teacher_type: teacherType,
      teaching_mode: teachingMode,
      preferred_location: location,
      qualification,
      teaching_hours: hours,
      from_time: fromTime,
      to_time: toTime,
      description,
    };

    console.log(payload);

    // Part 2
    // await api.post("/api/proposals", payload);

    setLoading(false);
  };

  return (
    <div className="max-w-4xl lg:ml-64 mx-auto bg-white rounded-xl shadow-lg p-6 mt-10">
      <h2 className="text-2xl font-bold mb-6">
        Create Learning Proposal
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-2 gap-5"
      >

        {/* Title */}
        <div>
          <label className="font-semibold">
            Subject Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError("title");
            }}
            className="border rounded-lg w-full p-3 mt-2"
            placeholder="Need an experienced Mathematics Tutor"
          />

          {errors.title && (
            <p className="text-red-500 text-sm mt-1">
              {errors.title}
            </p>
          )}
        </div>

        {/* Subject */}
        <div>
        <label className="font-semibold">
          Optional Subject
        </label>

        <input
          type="text"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            clearError("subject");
          }}
          placeholder="Enter subject (e.g. Mathematics, Physics, English)"
          className="border rounded-lg w-full p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        
      </div>
        {/* Price */}
        <div>
          <label className="font-semibold">
            Payment Amount
          </label>

          <input
            type="text"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              clearError("price");
            }}
            className="border rounded-lg w-full p-3 mt-2"
            placeholder="5000"
          />

          {errors.price && (
            <p className="text-red-500 text-sm mt-1">
              {errors.price}
            </p>
          )}
        </div>

        {/* Currency */}
        <div>
          <label className="font-semibold">
            Currency
          </label>

          <select
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value);
              clearError("currency");
            }}
            className="border rounded-lg w-full p-3 mt-2"
          >
            {currencyOptions.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

                {/* Preferred Teacher */}
        <div>
          <label className="font-semibold">
            Preferred Teacher
          </label>

          <Select
            options={teacherTypeOptions}
            value={teacherTypeOptions.find(
              (item) => item.value === teacherType
            )}
            onChange={(selected) => {
              setTeacherType(selected.value);
              clearError("teacherType");
            }}
            placeholder="Select Teacher Type"
          />

          {errors.teacherType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.teacherType}
            </p>
          )}
        </div>

        {/* Teaching Mode */}
        <div>
          <label className="font-semibold">
            Teaching Mode
          </label>

          <Select
            options={teachingModeOptions}
            value={teachingModeOptions.find(
              (item) => item.value === teachingMode
            )}
            onChange={(selected) => {
              setTeachingMode(selected.value);
              clearError("teachingMode");

              if (selected.value === "online") {
                setLocation("");
              }
            }}
            placeholder="Select Teaching Mode"
          />

          {errors.teachingMode && (
            <p className="text-red-500 text-sm mt-1">
              {errors.teachingMode}
            </p>
          )}
        </div>

        {/* Preferred Location */}
        {teachingMode === "physical" && (
          <div className="md:col-span-2">
            <label className="font-semibold">
              Preferred Location
            </label>

            <Select
              options={countries}
              value={countries.find(
                (country) =>
                  country.value === location
              )}
              onChange={(selected) => {
                setLocation(selected.value);
                clearError("location");
              }}
              placeholder="Select Country"
              isSearchable
            />

            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>

              <label className="block font-semibold mb-2">
                  From Time
              </label>

              <input
                  type="time"
                  value={fromTime}
                  onChange={(e) =>
                      setFromTime(e.target.value)
                  }
                  className="w-full border rounded-lg px-4 py-3"
              />

          </div>

          <div>

              <label className="block font-semibold mb-2">
                  To Time
              </label>

              <input
                  type="time"
                  value={toTime}
                  onChange={(e) =>
                      setToTime(e.target.value)
                  }
                  className="w-full border rounded-lg px-4 py-3"
              />

          </div>

      </div>

        {/* Qualification */}
        <div className="md:col-span-2">
          <label className="font-semibold">
            Preferred Qualification
          </label>

          <input
            type="text"
            value={qualification}
            onChange={(e) => {
              setQualification(e.target.value);
            }}
            className="border rounded-lg w-full p-3 mt-2"
            placeholder="B.Sc Mathematics, M.Ed, PhD..."
          />
        </div>

        {/* Hours */}
        <div>
          <label className="font-semibold">
            Teaching Hours
          </label>

          <input
            type="number"
            min="1"
            value={hours}
            onChange={(e) => {
              setHours(e.target.value);
              clearError("hours");
            }}
            className="border rounded-lg w-full p-3 mt-2"
            placeholder="2"
          />

          {errors.hours && (
            <p className="text-red-500 text-sm mt-1">
              {errors.hours}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="font-semibold">
            Description
          </label>

          <textarea
            rows={6}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearError("description");
            }}
            className="border rounded-lg w-full p-3 mt-2 resize-none"
            placeholder="Describe what you need from the teacher..."
          />

          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? <p className='inline-flex gap-1 items-center'> 
              <Loader2 className="animate-spin text-white" /> 
              Creating Proposal</p>
              : "Create Proposal"}
          </button>
        </div>

      </form>
    </div>
  );
}