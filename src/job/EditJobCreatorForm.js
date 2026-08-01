



import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import {
    MapPin,
    Upload,
    FileText,
    Building2,
    Users,
} from "lucide-react";

export default function EditJobCreatorForm({

    profile,
    loading,
    onSubmit,
    buttonText,

}) {

    const [companyName, setCompanyName] =
        useState("");

    const [companyType, setCompanyType] =
        useState("");

    const [organisationSize, setOrganisationSize] =
        useState("");

    const [companyLocation, setCompanyLocation] =
        useState("");

    const [companyAddress, setCompanyAddress] =
        useState("");

    const [companyLogo, setCompanyLogo] =
        useState(null);
    const [oldLogo,
        setOldLogo]=useState("");


        const countries = useMemo(() => countryList().getData(), []);
         

    useEffect(() => {

        if (!profile) return;

        setOldLogo(
        profile.company_logo
        );


        setCompanyName(
            profile.company_name || ""
        );

        setCompanyType(
            profile.company_type || ""
        );

        setOrganisationSize(
            profile.organisation_size || ""
        );

        setCompanyLocation(
            profile.company_location || ""
        );

        setCompanyAddress(
            profile.company_address || ""
        );

    }, [profile]);


    const handleSubmit = (e) => {

        e.preventDefault();

        const formData =
            new FormData();


        formData.append(
            "type",
            "creator"
        );

        formData.append(
            "company_name",
            companyName
        );

        formData.append(
            "company_type",
            companyType
        );

        formData.append(
            "organisation_size",
            organisationSize
        );

        formData.append(
            "company_location",
            companyLocation
        );

        formData.append(
            "company_address",
            companyAddress
        );


        if (companyLogo) {

            formData.append(
                "company_logo",
                companyLogo
            );

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

        {/* Company Name */}

        <div>

            <label
                className="
                block
                font-semibold
                mb-2
                "
            >
                Company Name
            </label>


            <input
                type="text"
                value={companyName}
                placeholder="
                Enter Company Name
                "
                onChange={(e) =>
                    setCompanyName(
                        e.target.value
                    )
                }
                required
                className="
                w-full
                border
                rounded-xl
                p-3
                text-black
                "
            />

        </div>



        {/* Company Type */}

        {/* Company Type */}

<div>

    <label
        className="
        block
        font-semibold
        mb-2
        "
    >
        Company Type
    </label>


    <select
        value={companyType}
        onChange={(e) => {

            setCompanyType(
                e.target.value
            );


            //clear organisation size
            //if individual is selected

            if (
                e.target.value ===
                "individual"
            ) {

                setOrganisationSize(
                    ""
                );

            }

        }}
        required
        className="
        w-full
        border
        rounded-xl
        p-3
        text-black
        "
    >

        <option value="">
            Select Company Type
        </option>

        <option value="individual">
            Individual
        </option>

        <option value="organisation">
            Organisation
        </option>

    </select>

</div>



{/* Organisation Size */}

{companyType ===
    "organisation" && (

        <div>

            <label
                className="
                block
                font-semibold
                mb-2
                "
            >
                Organisation Size
            </label>


            <select
                value={
                    organisationSize
                }
                onChange={(e) =>
                    setOrganisationSize(
                        e.target.value
                    )
                }
                required
                className="
                w-full
                border
                rounded-xl
                p-3
                text-black
                "
            >

                <option value="">
                    Select Size
                </option>

                <option value="1 - 5">
                    1 - 5
                </option>

                <option value="6 - 20">
                    6 - 20
                </option>

                <option value="21 - 50">
                    21 - 50
                </option>

                <option value="51 - 100">
                    51 - 100
                </option>

                <option value="101 - 500">
                    101 - 500
                </option>

                <option value="500+">
                    500+
                </option>

            </select>

        </div>

)}

        {/* Company Location */}

        <div>

            <label
                className="
                block
                font-semibold
                mb-2
                "
            >
                Company Location
            </label>


            <Select

                options={countries}

                value={
                    countries.find(
                        (option) =>
                            option.label ===
                            companyLocation
                    )
                }

                onChange={(selected) => {

                    setCompanyLocation(
                        selected.label
                    );

                }}

                placeholder="
                Select Company Location
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



        {/* Company Address */}

        <div>

            <label
                className="
                block
                font-semibold
                mb-2
                "
            >
                Company Address
            </label>


            <input
                type="text"
                value={companyAddress}
                placeholder="
                Enter Company Address
                "
                onChange={(e) =>
                    setCompanyAddress(
                        e.target.value
                    )
                }
                className="
                w-full
                border
                rounded-xl
                p-3
                text-black
                "
            />

        </div>



        {/* Upload Company Logo */}

        <div>

            <label
                className="
                block
                font-semibold
                mb-3
                "
            >
                Upload Company Logo
            </label>


            <label
                htmlFor="companyLogo"
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
                     {   companyLogo
                        ?
                        companyLogo.name
                        :
                        oldLogo
                        ?
                        "Current Logo Uploaded"
                        :
                        "Choose Company Logo"}
                    </p>


                    <p
                        className="
                        text-sm
                        "
                    >
                        JPG, PNG or WEBP
                        files only.
                    </p>

                     {
            companyLogo &&(

            <img

            src={
            URL.createObjectURL(
            companyLogo
            )
            }

            alt=""

            className="
            w-24
            h-24
            rounded-xl
            object-cover
            mt-3
            border
            "

            />

            )}


                    {
                    oldLogo && !companyLogo &&(

                    <img

                    src={
                    `http://localhost:8000/storage/${oldLogo}`
                    }

                    alt=""

                    className="
                    w-24
                    h-24
                    rounded-xl
                    object-cover
                    mt-3
                    border
                    "

                    />

                    )}
                </div>


                <Upload
                    size={28}
                    className="
                    text-blue-600
                    "
                />

            </label>


            <input
                id="companyLogo"
                type="file"
                hidden
                accept="
                image/*
                "
                onChange={(e) =>
                    setCompanyLogo(
                        e.target
                            .files[0]
                    )
                }
            />

           
        </div>



        {/* Submit Button */}

        <button
            type="submit"
            disabled={loading}
            className="
            w-full
            bg-blue-600
            text-white
            py-4
            rounded-xl
            font-bold
            hover:bg-blue-700
            disabled:opacity-50
            "
        >

            {buttonText}

        </button>

    </form>

);
}