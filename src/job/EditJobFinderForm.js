import { 
    
    
    
    useEffect, useMemo, useState } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import {
    MapPin,
    User,
    Award,
    FileText,
    Upload,
} from "lucide-react";

export default function EditJobFinderForm({

    profile,
    loading,
    onSubmit,
    buttonText,

}) {

    const [fullName, setFullName] =
        useState("");

    const [
        qualifications,
        setQualifications,
    ] = useState("");

    const [portfolio, setPortfolio] =
        useState("");

    const [
        certification,
        setCertification,
    ] = useState("");

    const [location, setLocation] =
        useState("");

    const [address, setAddress] =
        useState("");

    const [skills, setSkills] =
        useState([]);

    const [skill, setSkill] =
        useState("");

    const [cv, setCv] =
        useState(null);

    const [oldCv,setOldCv]=useState("");

    

        const countries = useMemo(() => countryList().getData(), []);
 
    useEffect(() => {

        if (!profile) return;

         setOldCv(
                profile.cv
            );

        setFullName(
            profile.full_name || ""
        );


        setQualifications(
            profile.qualifications || ""
        );


        setPortfolio(
            profile.portfolio || ""
        );


        setCertification(
            profile.certification || ""
        );


        setLocation(
            profile.location || ""
        );


        setAddress(
            profile.address || ""
        );


        if (
            Array.isArray(
                profile.skills
            )
        ) {

            setSkills(
                profile.skills
            );

        } else {

            setSkills([]);

        }

    }, [profile]);


    const addSkill = () => {

        if (
            skill &&
            !skills.includes(
                skill
            )
        ) {

            setSkills([
                ...skills,
                skill,
            ]);

            setSkill("");

        }

    };


    const removeSkill = (index) => {

        setSkills(

            skills.filter(
                (_, i) =>
                    i !== index
            )

        );

    };


    const handleCV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCv(file);
    };
   


    const handleSubmit = (e) => {

        e.preventDefault();

        const formData = new FormData();

        formData.append(
            "type",
            "finder"
        );

        formData.append(
            "full_name",
            fullName
        );


        formData.append(
            "qualifications",
            qualifications
        );


        formData.append(
            "portfolio",
            portfolio
        );


        formData.append(
            "certification",
            certification
        );


        formData.append(
            "location",
            location
        );


        formData.append(
            "address",
            address
        );


        skills.forEach((skill) => {

            formData.append(
                "skills[]",
                skill
            );

        });


       if (cv) {
            formData.append("cv", cv);
            }

       
        onSubmit(formData);

    };


    return (

    <form
        onSubmit={handleSubmit}
        className="
        space-y-6
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        "
    >

        {/* Full Name */}

        <div>

            <label
                className="
                block
                font-semibold
                mb-2
                "
            >
                Full Name
            </label>

            <input
                type="text"
                required
                value={fullName}
                placeholder="Enter Full Name"
                onChange={(e) =>
                    setFullName(
                        e.target.value
                    )
                }
                className="
                w-full
                text-black
                border
                rounded-xl
                p-3
                "
            />

        </div>


        {/* Qualifications */}

        <div>

            <label
                className="
                block
                font-semibold
                mb-2
                "
            >
                Qualifications
            </label>

            <textarea
                rows={4}
                value={qualifications}
                placeholder="
                Enter your qualifications
                "
                onChange={(e) =>
                    setQualifications(
                        e.target.value
                    )
                }
                className="
                w-full
                text-black
                border
                rounded-xl
                p-3
                "
            />

        </div>



        {/* Portfolio */}

        <div>

            <label
                className="
                block
                font-semibold
                mb-2
                "
            >
                Portfolio Link
            </label>

            <input
                type="text"
                value={portfolio}
                placeholder="
                Enter Portfolio Link
                "
                onChange={(e) =>
                    setPortfolio(
                        e.target.value
                    )
                }
                className="
                w-full
                text-black
                border
                rounded-xl
                p-3
                "
            />

        </div>



        {/* Certification */}

        <div>

            <label
                className="
                block
                font-semibold
                mb-2
                "
            >
                Certification
            </label>

            <input
                type="text"
                value={certification}
                placeholder="
                Enter Certification
                "
                onChange={(e) =>
                    setCertification(
                        e.target.value
                    )
                }
                className="
                w-full
                text-black
                border
                rounded-xl
                p-3
                "
            />

        </div>



        {/* Location */}

        <div>

            <label
                className="
                block
                font-semibold
                mb-2
                "
            >
                Location
            </label>

            <Select

                options={countries}

                value={
                    countries.find(
                        (option) =>
                            option.label ===
                            location
                    )
                }

                onChange={(selected) => {

                    setLocation(
                        selected.label
                    );

                }}

                placeholder="
                Select Location
                "

                isSearchable

                menuPortalTarget={
                    document.body
                }

                className="
                cursor-pointer
                "

                styles={{

                    control:
                        (base) => ({

                            ...base,

                            minHeight: 48,

                            paddingTop:
                                "0.25rem",

                            paddingBottom:
                                "0.25rem",

                            paddingLeft:
                                "0.5rem",

                            borderRadius:
                                "0.75rem",

                        }),


                    singleValue:
                        (base) => ({

                            ...base,

                            color:
                                "#000",

                        }),


                    input:
                        (base) => ({

                            ...base,

                            color:
                                "#000",

                        }),


                    placeholder:
                        (base) => ({

                            ...base,

                            color:
                                "#6b7280",

                        }),


                    option:
                        (
                            base,
                            state
                        ) => ({

                            ...base,

                            color:
                                "#000",

                            backgroundColor:
                                state.isFocused
                                    ? "#f3f4f6"
                                    : state.isSelected
                                    ? "#e5e7eb"
                                    : "#fff",

                        }),


                    menuPortal:
                        (base) => ({

                            ...base,

                            zIndex:
                                9999,

                        }),

                }}

            />

        </div>



        {/* Address */}

        <div>

            <label
                className="
                block
                font-semibold
                mb-2
                "
            >
                Address
            </label>

            <input
                type="text"
                value={address}
                placeholder="
                Enter Address
                "
                onChange={(e) =>
                    setAddress(
                        e.target.value
                    )
                }
                className="
                w-full
                text-black
                border
                rounded-xl
                p-3
                "
            />

        </div>



        {/* Skills */}

        <div>

            <label
                className="
                block
                font-semibold
                mb-2
                "
            >
                Skills
            </label>

            <div
                className="
                flex
                gap-2
                "
            >

                <input
                    type="text"
                    value={skill}
                    placeholder="
                    Add Skill
                    "
                    onChange={(e) =>
                        setSkill(
                            e.target.value
                        )
                    }
                    className="
                    flex-1
                    border
                    rounded-xl
                    p-3
                    text-black
                    "
                />


                <button
                    type="button"
                    onClick={addSkill}
                    className="
                    bg-blue-600
                    text-white
                    px-5
                    rounded-xl
                    hover:bg-blue-700
                    "
                >
                    Add
                </button>

            </div>

        </div>



        <div
            className="
            flex
            flex-wrap
            gap-2
            "
        >

            {skills.map(
                (
                    item,
                    index
                ) => (

                    <span
                        key={index}
                        onClick={() =>
                            removeSkill(
                                index
                            )
                        }
                        className="
                        px-4
                        py-2
                        rounded-full
                        cursor-pointer
                        bg-blue-100
                        text-blue-700
                        hover:bg-red-100
                        hover:text-red-600
                        transition
                        "
                    >

                        {item} ×

                    </span>

                )
            )}

        </div>



        {/* Upload CV */}

        <div>

            <label
                className="
                block
                font-semibold
                mb-3
                "
            >
                Upload CV
            </label>


            <label
                htmlFor="cv"
                className="
                border-2
                border-dashed
                rounded-2xl
                p-5
                flex
                items-center
                justify-between
                cursor-pointer
                hover:border-blue-600
                transition
                "
            >

                <div>

                   <p
                    className="
                    font-semibold
                    text-sm
                    "
                    >

                        {

                        cv
                        ?cv.name
                        :oldCv
                        ?"Current CV Uploaded"
                        :"Choose your CV"

                        }

                    </p>


                    <p
                        className="
                        text-sm
                        "
                    >
                        PDF, DOC or
                        DOCX files only.
                    </p>

                    {
                        oldCv && (

                        <a

                        href={`http://localhost:8000/storage/${oldCv}`}

                        target="_blank"

                        rel="noreferrer"

                        className="
                        text-blue-600
                        text-sm
                        font-semibold
                        "

                        >

                        View Current CV

                        </a>

                        )
                        }
                </div>


                <Upload
                    size={28}
                    className="
                    text-blue-600
                    "
                />

            </label>


            <input
                id="cv"
                type="file"
                hidden
                accept="
                .pdf,
                .doc,
                .docx
                "
                onChange={handleCV}
            />

        </div>



        {/* Submit Button */}

        <button
            type="submit"
            disabled={loading}
            className="
            w-full
            py-4
            rounded-xl
            font-bold
            bg-blue-600
            text-white
            hover:bg-blue-700
            disabled:opacity-50
            "
        >

            {buttonText}

        </button>

    </form>

);


}