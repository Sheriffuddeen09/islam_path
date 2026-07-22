import { X } from "lucide-react";

export default function JobProfileDetailsModal({
    profile,
    onClose,
}) {
    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center p-4">

            <div
                className="
                bg-white
                rounded-3xl
                max-w-3xl
                w-full
                max-h-[90vh]
                overflow-y-auto
                "
            >
                <div className="flex justify-between items-center p-6 border-b">

                    <h2 className="text-2xl font-bold">

                        Profile Details

                    </h2>

                    <button
                        onClick={onClose}
                    >
                        <X />
                    </button>

                </div>

                <div className="p-6 space-y-5">

                    <div>

                        <h3 className="font-bold">
                            Profile Type
                        </h3>

                        <p>
                            {profile.type}
                        </p>

                    </div>

                    <div>

                        <h3 className="font-bold">
                            Status
                        </h3>

                        <p>
                            {profile.status}
                        </p>

                    </div>

                    {profile.type === "creator" && (

                        <>

                            <div>

                                <h3 className="font-bold">

                                    Company Name

                                </h3>

                                <p>
                                    {profile.company_name}
                                </p>

                            </div>

                            <div>

                                <h3 className="font-bold">

                                    Company Type

                                </h3>

                                <p>
                                    {profile.company_type}
                                </p>

                            </div>

                            <div>

                                <h3 className="font-bold">

                                    Organisation Size

                                </h3>

                                <p>
                                    {profile.organisation_size}
                                </p>

                            </div>

                            <div>

                                <h3 className="font-bold">

                                    Company Location

                                </h3>

                                <p>
                                    {profile.company_location}
                                </p>

                            </div>

                            <div>

                                <h3 className="font-bold">

                                    Company Address

                                </h3>

                                <p>
                                    {profile.company_address}
                                </p>

                            </div>

                            {profile.company_logo && (

                                <img
                                    src={
                                        profile.company_logo
                                    }
                                    alt=""
                                    className="w-32 rounded-xl"
                                />

                            )}

                        </>

                    )}

                    {profile.type === "finder" && (

                        <>

                            <div>

                                <h3 className="font-bold">
                                    Full Name
                                </h3>

                                <p>
                                    {profile.full_name}
                                </p>

                            </div>

                            <div>

                                <h3 className="font-bold">
                                    Qualifications
                                </h3>

                                <p>
                                    {profile.qualifications}
                                </p>

                            </div>

                            <div>

                                <h3 className="font-bold">
                                    Skills
                                </h3>

                                <div className="flex flex-wrap gap-2">

                                    {profile.skills?.map(
                                        (skill, index) => (
                                            <span
                                                key={index}
                                                className="
                                                px-3
                                                py-1
                                                rounded-full
                                                bg-blue-100
                                                text-blue-700
                                                "
                                            >
                                                {skill}
                                            </span>
                                        )
                                    )}

                                </div>

                            </div>

                            <div>

                                <h3 className="font-bold">
                                    Portfolio
                                </h3>

                                <a
                                    href={profile.portfolio}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600"
                                >
                                    View Portfolio
                                </a>

                            </div>

                            <div>

                                <h3 className="font-bold">
                                    CV
                                </h3>

                                <a
                                    href={profile.cv}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600"
                                >
                                    View CV
                                </a>

                            </div>

                            <div>

                                <h3 className="font-bold">
                                    Location
                                </h3>

                                <p>
                                    {profile.location}
                                </p>

                            </div>

                            <div>

                                <h3 className="font-bold">
                                    Address
                                </h3>

                                <p>
                                    {profile.address}
                                </p>

                            </div>

                        </>

                    )}

                    {profile.status === "declined" && (

                        <div>

                            <h3 className="font-bold text-red-600">
                                Decline Reason
                            </h3>

                            <p>
                                {profile.decline_reason}
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}