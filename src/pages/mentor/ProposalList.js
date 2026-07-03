import { useEffect, useState } from "react";
import api from "../../Api/axios";
import ProposalCard from "./ProposalCard";
import ProposalModal from "./ProposalModal";

export default function ProposalList() {

    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState(null);

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {

        try {

            const res = await api.get("/api/proposals");

            setProposals(res.data);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    };

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

    if (loading) {

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">

                {[...Array(6)].map((_, i) => (

                    <div
                        key={i}
                        className="h-72 rounded-xl bg-gray-200 animate-pulse"
                    />

                ))}

            </div>
        );

    }

    return (

        <>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">

                {proposals.map((proposal) => (

                    <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        onView={() =>
                            setSelectedProposal(proposal)
                        }
                        getColor={getColor}
                        getInitial={getInitial}
                    />

                ))}

            </div>

            {selectedProposal && (

                <ProposalModal
                    proposal={selectedProposal}
                    onClose={() =>
                        setSelectedProposal(null)
                    }
                    getColor={getColor}
                    getInitial={getInitial}
                />

            )}

        </>

    );

}