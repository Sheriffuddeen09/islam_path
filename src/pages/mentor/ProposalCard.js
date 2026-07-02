export default function ProposalCard({

    proposal,
    onView,

}) {

    return (

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border">

            <div className="p-5">

                <div className="flex items-center gap-3">

                    <img
                        src={
                            proposal.student.image ||
                            "/avatar.png"
                        }
                        className="w-14 h-14 rounded-full object-cover"
                        alt=""
                    />

                    <div>

                        <h3 className="font-bold">

                            {proposal.student.first_name}
                            {" "}
                            {proposal.student.last_name}

                        </h3>

                        <p className="text-sm text-gray-500">

                            {proposal.subject}

                        </p>

                    </div>

                </div>

                <h2 className="font-bold text-xl mt-4">

                    {proposal.title}

                </h2>

                <div className="flex justify-between mt-4 text-sm">

                    <span>

                        💰 {proposal.currency}
                        {" "}
                        {proposal.price}

                    </span>

                    <span>

                        🧑 {proposal.teacher_type}

                    </span>

                </div>

                <div className="flex justify-between mt-2 text-sm">

                    <span>

                        📍 {proposal.preferred_location}

                    </span>

                    <span>

                        ⏰ {proposal.teaching_hours} hrs

                    </span>

                    <div className="flex items-center gap-2 text-gray-600 text-sm">

                        <span>🕒</span>

                        <span>

                            {proposal.from_time} - {proposal.to_time}

                        </span>

                    </div>

                </div>

                <p className="mt-4 text-gray-600 line-clamp-3">

                    {proposal.description}

                </p>

            </div>

            <div className="border-t p-4">

                <button

                    onClick={onView}

                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"

                >

                    View Proposal

                </button>

            </div>

        </div>

    );

}