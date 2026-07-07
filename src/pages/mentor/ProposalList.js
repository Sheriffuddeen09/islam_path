import { useEffect, useState } from "react";
import api from "../../Api/axios";
import ProposalCard from "./ProposalCard";
import ProposalModal from "./ProposalModal";
import toast from "react-hot-toast";

export default function ProposalList({badges, setBadges}) {

    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState(null);

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {

        try {
            setLoading(true);

            const res = await api.get("/api/proposals-get");

            setProposals(res.data);
            console.log(res.data);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    };
    

    if (loading) {

    return (

        <div
            className="
            lg:ml-64
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
            p-6"
        >

            {[...Array(6)].map((_,i)=>(

                <div
                    key={i}
                    className="
                    bg-white
                    rounded-2xl
                    border
                    p-5
                    animate-pulse"
                >

                    <div className="flex gap-5">

                        <div className="w-24 h-24 rounded-full bg-gray-300"/>

                        <div className="flex-1">

                            <div className="h-6 w-3/4 rounded bg-gray-300"/>

                            <div className="h-4 w-1/2 mt-3 rounded bg-gray-200"/>

                            <div className="h-4 w-2/3 mt-3 rounded bg-gray-200"/>

                            <div className="h-4 w-full mt-6 rounded bg-gray-200"/>

                            <div className="h-4 w-4/5 mt-2 rounded bg-gray-200"/>

                        </div>

                    </div>

                </div>

            ))}

        </div>

    );

}


    return (

        <>



            <div className="lg:ml-64">     
            <h1 className="w-full text-[var(--text-color)] border-b-2 border-blue-500 mb-6 pb-2 text-2xl font-bold ">Student Proposal</h1>
            {!loading && proposals.length === 0 && (
            <div className="col-span-full">
                <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-xl shadow p-10 text-center">
                    <h2 className="text-xl font-bold">
                        No Proposal
                    </h2>
                    <p className="mt-2">
                        Students haven't sent any proposal request yet.
                    </p>
                </div>
            </div>
            )}
                {proposals.map((proposal) => (

                    <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        onView={() =>
                            setSelectedProposal(proposal)
                        }
                    />

                ))}

            </div>

            {selectedProposal && (

                <ProposalModal
                    proposal={selectedProposal}
                    onClose={() =>
                        setSelectedProposal(null)
                    }
                    
                    setProposals={setProposals}
                    badges={badges}
                    setBadges={setBadges}
                />

            )}

        </>

    );

}