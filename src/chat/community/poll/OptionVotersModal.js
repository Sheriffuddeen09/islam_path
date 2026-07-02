import { useEffect, useState } from "react";
import { X, Users } from "lucide-react";
import api from "../../../Api/axios";

export default function OptionVotersModal({
    option,
    onClose,
}) {

    const [loading, setLoading] =
        useState(true);

    const [voters, setVoters] =
        useState([]);

    useEffect(() => {

        if (!option) return;

        fetchVoters();

    }, [option]);

    const fetchVoters = async () => {

        try {

            setLoading(true);

            const { data } =
                await api.get(
                    `/api/community/poll/options/${option.id}/voters`
                );

            setVoters(data.voters || []);

        } catch (err) {

            console.log(err);

            setVoters([]);

        } finally {

            setLoading(false);

        }

    };

    if (!option) return null;

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

    {loading ? (

        [...Array(6)].map((_, index) => (

            <div
                key={index}
                className="
                    flex
                    items-center
                    gap-3
                    px-5
                    py-4
                    border-b
                    animate-pulse
                "
            >

                <div
                    className="
                        w-12
                        h-12
                        rounded-full
                        bg-gray-300
                    "
                />

                <div className="flex-1">

                    <div
                        className="
                            h-4
                            w-40
                            bg-gray-300
                            rounded
                            mb-2
                        "
                    />

                    <div
                        className="
                            h-3
                            w-20
                            bg-gray-200
                            rounded
                        "
                    />

                </div>

            </div>

        ))

    ) : voters.length === 0 ? (

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

                            {voter.first_name?.charAt(0)}

                        </div>

                    )}

                    <div>

                        <h4 className="font-semibold">

                            {voter.first_name} {voter.last_name}

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

                    <div className="text-sm text-black">

                       
                        {voters.length === 1
                            ? "Person voted"
                            : "People voted"}

                    </div>

                     <span className="font-semibold">
                        {voters.length}
                    </span>

                </div>

            </div>

        </div>

    );

}