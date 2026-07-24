
import { useRef, useState, useMemo } from "react";
import {
 Upload,
 Building2,
 MapPin,
 Users,
 CompassIcon,
 Loader2
} from "lucide-react";
import Select from "react-select";
import countryList from "react-select-country-list";

export default function JobCreatorForm({
 onSubmit,
 loading
}) {
 const fileInput = useRef(null);
 const [logo, setLogo] = useState(null);
 const [preview, setPreview] = useState("");
 const [companyName, setCompanyName] = useState("");
 const [companyType, setCompanyType] = useState("");
 const [organisationSize, setOrganisationSize] = useState("");
 const [location, setLocation] = useState("");
 const [address, setAddress] = useState("");

const countries = useMemo(() => countryList().getData(), []);
 
 const handleLogo = (e) => {
 const file = e.target.files[0];
 if (!file) return;
 setLogo(file);
 setPreview(URL.createObjectURL(file));
 };
 const submit = () => {
 const formData = new FormData();
 formData.append("type", "creator");
 formData.append("company_name", companyName);
 formData.append("company_type", companyType);
 formData.append("organisation_size", organisationSize);
 formData.append("company_location", location);
 formData.append("company_address", address);
 if (logo) {
 formData.append("company_logo", logo);
 }
 onSubmit(formData);
 };
 return (
 <div className="space-y-7 bg-[var(--bg-color)] text-[var(--text-color)]">
 <div>
 <p className=" text-center text-sm">
 Tell applicants about your company.
 </p>
 </div>
 {/* Logo step */}
 <div>
 <label className="font-semibold">
 Company Logo
 </label>
 <div
 onClick={() => fileInput.current.click()}
 className="mt-2 border-2 border-dashed rounded-2xl cursor-pointer hover:border-blue500 transition p-8 flex flex-col items-center"
 >
 {
 preview ?
 <img
 src={preview}
 alt=""
 className="w-32 h-32 rounded-full object-cover"
 />
 :
 <>
 <Upload
 className="text-blue-600"
 size={45}
 />
 <p className="mt-4">
 Click to upload logo
 </p>
 </>
 }
 </div>
 <input
 ref={fileInput}
 type="file"
 accept="image/*"
 hidden
 onChange={handleLogo}
 />
 </div>
 {/* Company Name */}
 <div>
 <label className="font-semibold">
 Company Name
 </label>
 <div className="relative mt-2">
 <Building2
 className="absolute left-4 top-3.5 text-gray-400"
 />
 <input
 className="border text-black rounded-xl pl-12 pr-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
 placeholder="OpenAI"
 value={companyName}
 onChange={(e) =>
 setCompanyName(e.target.value)
 }
 />
 </div>
 </div>
 {/* Company Type */}
 <div>
 <label className="font-semibold">
 Company Type
 </label>
 <div className="grid md:grid-cols-2 gap-4 mt-3">
 <button
 type="button"
 onClick={() =>
 setCompanyType("individual")
 }
 className={`border rounded-xl p-5 transition ${companyType === "individual"
 ? "border-blue-600 border"
 : ""
 }`}
 >
 <h4 className="font-bold">
 Individual
 </h4>
 <p className="text-sm mt-2">
 Freelancers and private employers.
 </p>
 </button>
 <button
 type="button"
 onClick={() =>
 setCompanyType("organisation")
 }
 className={`border rounded-xl p-5 transition ${companyType === "organisation"
 ? "border-blue-600 border"
 : ""
 }`}
 >
 <h4 className="font-bold">
 Organisation
 </h4>
 <p className="text-sm mt-2">
 Registered businesses and companies.
 </p>
 </button>
 </div>
 </div>
 {/* Organisation Size */}
 {
 companyType === "organisation" &&
 <div>
 <label className="font-semibold">
 Number of Employees
 </label>
 <div className="relative mt-2">
 <Users
 className="absolute left-4 top-3.5 text-gray-400"
 />
 <select
 className="border text-black rounded-xl pl-12 py-3 w-full cursor-pointer"
 value={organisationSize}
 onChange={(e) =>
 setOrganisationSize(e.target.value)
 }
 >
 <option value="">
 Select
 </option>
 <option>
 1 - 5
 </option>
 <option>
 6 - 20
 </option>
 <option>
 21 - 50
 </option>
 <option>
 51 - 100
 </option>
 <option>
 101 - 500
 </option>
 <option>
 500+
 </option>
 </select>
 </div>
 </div>
 }
 {/* Location */}
 <div>
 <label className="font-semibold">
 Company Location
 </label>
 <div className="relative mt-2">
 <MapPin
 className="absolute left-4 top-3.5 text-gray-400 z-50"
 />
 <Select
               options={countries}
               value={countries.find(option => option.label === location)}
               onChange={(selected) => {
                 setLocation(selected.label);
               }}
               placeholder="Select Location"
               isSearchable
               menuPortalTarget={document.body}
               className="mt-2 cursor-pointer"
               styles={{
                 control: (base) => ({
                   ...base,
                   minHeight: 48,
                   paddingTop: "0.25rem",
                   paddingBottom: "0.25rem",
                   paddingLeft: "2.2rem",
                   borderRadius: "0.5rem",
                 }),
 
                 singleValue: (base) => ({
                   ...base,
                   color: "#000", // Selected value
                 }),
 
                 input: (base) => ({
                   ...base,
                   color: "#000", // Search text while typing
                 }),
 
                 placeholder: (base) => ({
                   ...base,
                   color: "#6b7280", // Gray placeholder
                 }),
 
                 option: (base, state) => ({
                   ...base,
                   color: "#000",
                   backgroundColor: state.isFocused
                     ? "#f3f4f6"
                     : state.isSelected
                     ? "#e5e7eb"
                     : "#fff",
                 }),
 
                 menuPortal: (base) => ({
                   ...base,
                   zIndex: 9999,
                 }),
               }}
             />
 
 </div>
 </div>

 <div>
 <label className="font-semibold">
 Company Address
 </label>
 <div className="relative mt-2">
 <CompassIcon
 className="absolute left-4 top-3.5 text-gray-400"
 />
 <input
 className="border text-black rounded-xl pl-12 pr-4 py-3 w-full"
 placeholder="Lagos, Nigeria"
 value={address}
 onChange={(e) =>
 setAddress(e.target.value)
 }
 />
 </div>
 </div>
 {/* Footer */}
 <div className="flex justify-end pt-4">
 <button
 type="button"
 onClick={submit}
 className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl"
 >
 {loading
  ? <p className='inline-flex gap-1 items-center'> 
  <Loader2 className="animate-spin text-white" /> 
  Submitting</p>
  : "Submit Profile"}
 </button>
 </div>
 </div>
 );
}
