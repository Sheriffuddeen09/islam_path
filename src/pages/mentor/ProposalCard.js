export default function ProposalCard({
    proposal,
    onView,
}) {


    const currencySymbol = (currency) => {

    switch(currency){

        case "NGN":
            return "₦";

        case "USD":
            return "$";

        case "EUR":
            return "€";

        default:
            return currency;
    }

    }


    const colors = [
        "bg-orange-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-pink-500",
        ];
    
        const getColor = (name = "") => {
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
        };
    
        const getInitial = (name) => {
        if (!name) return "?";
        return name.charAt(0).toUpperCase();
        };

    return (

        <div
    onClick={onView}
    className="
        
        bg-white
        rounded-2xl
        border
        shadow-sm
        hover:shadow-xl
        hover:-translate-y-1
        hover:scale-[1.01]
        transition-all
        duration-300
        cursor-pointer
        overflow-hidden
        px-2
        mt-3
    "
>
    <div className="p-5">

        <div className="
            flex
            flex-col
            md:flex-row
            gap-5
        ">

            {/* Avatar */}

            <div className="flex justify-start md:block">

                <div
                    className={`w-24 h-24 md:w-28 md:h-28 rounded-full
                    flex items-center justify-center
                    text-4xl
                    font-bold
                    text-white
                    border-4 border-black
                    shadow-lg
                    ${getColor(proposal.student.first_name)}`}
                >
                    {getInitial(proposal.student.first_name)}
                </div>

            </div>

            {/* Content */}

            <div className="flex-1">

                {/* Title & Subject */}

                <h2 className="font-bold text-xl text-gray-800">

                    {proposal.title}

                    <span className="mx-2 text-black">•</span>

                    <span className="text-blue-600">

                        {proposal.subject}

                    </span>

                </h2>

                {/* Type & Location */}

                <div className="
                    flex
                    flex-wrap
                    gap-3
                    mt-2
                    text-sm
                    text-black
                    capitalize
                    font-semibold
                ">

                    
                     <span>
                            
                        📍 {proposal.student.location}

                    </span>

                    <span>

                        👨‍🏫 {proposal.teacher_type}

                    </span>

                    {proposal.teaching_mode !== "online" && (
                    <div>
                        <span>Prefer: </span>
                        <span>

                            📍 {proposal.preferred_location}

                        </span>
                    </div>
                    )}

                </div>

                {/* Price */}

                <div
                    className="
                        flex
                        flex-wrap
                        gap-5
                        mt-3
                        text-sm
                        font-medium
                    "
                >

                    <span>

                    💰 {currencySymbol(proposal.currency)}

                        {proposal.price}

                    </span>

                    <span>

                        ⏰ {proposal.teaching_hours} hrs

                    </span>

                    <span>

                        🕒 {proposal.from_time}

                        {" - "}

                        {proposal.to_time}

                    </span>

                </div>

                {/* Description */}

                <p className="mt-4 text-black text-sm font-semibold">

                    {proposal.description.length > 200
                        ? proposal.description.slice(0, 200) + "..."
                        : proposal.description}

                </p>

            </div>

        </div>

    </div>
</div>
    );

}