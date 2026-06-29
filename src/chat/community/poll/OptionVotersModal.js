import { X, Users } from "lucide-react";

export default function OptionVotersModal({
    option,
    onClose,
}) {

    if (!option) return null;

    const voters =
        option.voters || [];

    return (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">

            <div
                className="
                    bg-white
                    rounded-2xl
                    shadow-xl
                    w-full
                    max-w-md
                    overflow-hidden
                "
            >

                {/* Header */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        px-5
                        py-4
                        border-b
                    "
                >

                    <div className="flex items-center gap-3">

                        <div
                            className="
                                w-10
                                h-10
                                rounded-full
                                bg-green-100
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <Users
                                className="text-green-600"
                                size={20}
                            />

                        </div>

                        <div>

                            <h2 className="font-bold text-lg">

                                Voters

                            </h2>

                            <p className="text-sm text-gray-500">

                                {option.option}

                            </p>

                        </div>

                    </div>

                    <button
                        onClick={onClose}
                        className="
                            w-9
                            h-9
                            rounded-full
                            hover:bg-gray-100
                            flex
                            items-center
                            justify-center
                        "
                    >

                        <X size={20} />

                    </button>

                </div>

                {/* Body */}

                <div
                    className="
                        max-h-[450px]
                        overflow-y-auto
                    "
                >

                    {voters.length === 0 ? (

                        <div className="p-8 text-center text-gray-500">

                            Nobody has voted yet.

                        </div>

                    ) : (

                        voters.map(voter => (

                            <div
                                key={voter.id}
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    px-5
                                    py-3
                                    border-b
                                    hover:bg-gray-50
                                "
                            >

                                <div className="flex items-center gap-3">

                                    {voter.image ? (

                                        <img
                                            src={voter.image}
                                            alt=""
                                            className="
                                                w-12
                                                h-12
                                                rounded-full
                                                object-cover
                                            "
                                        />

                                    ) : (

                                        <div
                                            className="
                                                w-12
                                                h-12
                                                rounded-full
                                                bg-blue-600
                                                text-white
                                                flex
                                                items-center
                                                justify-center
                                                text-lg
                                                font-bold
                                            "
                                        >

                                            {voter.first_name?.[0]}

                                        </div>

                                    )}

                                    <div>

                                        <h4 className="font-semibold">

                                            {voter.first_name}{" "}
                                            {voter.last_name}

                                        </h4>

                                        <p className="text-xs text-gray-500">

                                            Member

                                        </p>

                                    </div>

                                </div>

                                                                <span
                                    className="
                                        px-3
                                        py-1
                                        rounded-full
                                        bg-green-100
                                        text-green-700
                                        text-xs
                                        font-semibold
                                    "
                                >
                                    ✓ Voted
                                </span>

                            </div>

                        ))

                    )}

                </div>

                {/* Footer */}

                <div
                    className="
                        border-t
                        px-5
                        py-4
                        flex
                        items-center
                        justify-between
                        bg-gray-50
                    "
                >

                    <div className="text-sm text-gray-600">

                        <span className="font-semibold">
                            {voters.length}
                        </span>{" "}
                        {voters.length === 1
                            ? "Person voted"
                            : "People voted"}

                    </div>

                    <button
                        onClick={onClose}
                        className="
                            px-5
                            py-2
                            rounded-lg
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            font-medium
                        "
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>

    );

}