export default function ProposalModal({

    proposal,
    onClose,

}) {

    return (

        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">

            <div className="bg-white w-full max-w-3xl rounded-xl p-6 max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center">

                    <h2 className="font-bold text-2xl">

                        {proposal.title}

                    </h2>

                    <button

                        onClick={onClose}

                        className="text-2xl"

                    >

                        ✕

                    </button>

                </div>

                <div className="flex items-center gap-4 mt-6">

                    <img
                        src={
                            proposal.student.image ||
                            "/avatar.png"
                        }
                        className="w-20 h-20 rounded-full"
                        alt=""
                    />

                    <div>

                        <h3 className="font-bold">

                            {proposal.student.first_name}
                            {" "}
                            {proposal.student.last_name}

                        </h3>

                        <p>

                            {proposal.subject}

                        </p>

                    </div>

                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">

                    <div>

                        <strong>Budget</strong>

                        <p>

                            {proposal.currency}
                            {" "}
                            {proposal.price}

                        </p>

                    </div>

                    <div>

                        <strong>Teacher</strong>

                        <p>

                            {proposal.teacher_type}

                        </p>

                    </div>

                    <div>

                        <strong>Teaching Mode</strong>

                        <p>

                            {proposal.teaching_mode}

                        </p>

                    </div>

                    <div>

                        <strong>Preferred Location</strong>

                        <p>

                            {proposal.preferred_location}

                        </p>

                    </div>

                    <div>

                        <strong>Qualification</strong>

                        <p>

                            {proposal.qualification}

                        </p>

                    </div>

                    <div>

                        <strong>Teaching Hours</strong>

                        <p>

                            {proposal.teaching_hours} Hours

                        </p>

                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm">

                        <span>🕒</span>

                        <span>

                            {proposal.from_time} - {proposal.to_time}

                        </span>

                    </div>

                </div>

                <div className="mt-6">

                    <h3 className="font-bold mb-2">

                        Description

                    </h3>

                    <p>

                        {proposal.description}

                    </p>

                </div>

                <div className="flex justify-end mt-8 gap-3">

                    <button

                        onClick={onClose}

                        className="px-6 py-3 bg-gray-300 rounded-lg"

                    >

                        Close

                    </button>

                    <button

                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"

                    >

                        Send Proposal

                    </button>

                </div>

            </div>

        </div>

    );

}