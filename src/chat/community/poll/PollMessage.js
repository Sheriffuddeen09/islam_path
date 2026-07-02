import { useMemo, useState } from "react";
import api from "../../../Api/axios";
import { toast } from "react-hot-toast";
import {
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";

export default function PollMessage({
  message, isAdmin, selectedOption, setSelectedOption, showVoters, setShowVoters
}) {
  const poll = message.poll_data ?? message.poll;



  const [loading, setLoading] =
    useState(false);

  const [selected, setSelected] =
    useState([]);


  if (!poll) return null;



  const isExpired =
    poll.expires_at &&
    new Date(poll.expires_at) <
      new Date();

  const alreadyVoted =
    poll.options.some(option =>
      option.user_voted
    );

  const submitVote = async (optionId) => {

    if (
        loading ||
        isExpired ||
        alreadyVoted
    ) return;

    try {

        setLoading(true);

        const { data } = await api.post(
            "/api/community/poll/vote",
            {
                poll_id: poll.id,
                option_ids: [optionId], // ✅ send an array
            }
        );

        // Replace the poll with the updated poll from Laravel
        poll.options = data.poll.options;
        poll.total_votes = data.poll.total_votes;

        toast.success("Vote submitted");

    } catch (err) {

        console.log(err.response?.data);

        toast.error(
            err.response?.data?.message ||
            "Unable to vote"
        );

    } finally {

        setLoading(false);

    }
};
  
  const disableVote =
  isAdmin ||
  loading ||
  alreadyVoted ||
  isExpired;

  return (
  <div className="px-4 mt-3">

    <div className="mb-4">

      {poll.multiple_choice && (
        <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-1">
          Multiple Choice
        </span>
      )}

    </div>

    {/* Options */}
    <div className="space-y-4">

      {poll.options.map(option => (
<div
    key={option.id}
    disabled={disableVote}
    className="rounded-xl
        border
        border-gray-300 
        p-3
        bg-white"
    >

          {isAdmin && (

            <div className="flex justify-end mb-2 z-50">

              <button
                onClick={(e) => {

                  e.stopPropagation();

                  setSelectedOption(option);

                  setShowVoters(true);

                }}
                className="
                  text-xs
                  text-blue-800
                  hover:underline
                "
              >
                View Voters
              </button>

            </div>

          )}
  <button
        type="button"
        disabled={disableVote}
        onClick={() => submitVote(option.id)}
        className={`
        relative
        overflow-hidden
        w-full
        text-left
        transition
        bg-white

        ${
            disableVote
                ? "cursor-not-allowed opacity-90"
                : "cursor-pointer hover:border-green-500"
        }
    `}
        
    >
          {/* Option */}
          <div className="flex justify-between items-center">

            <div className="flex items-center gap-3">

              {option.user_voted ? (

                <CheckCircle2
                  size={22}
                  className="text-green-600"
                />

              ) : (

                <div
                  className="
                    w-5
                    h-5
                    rounded-full
                    border-2
                    border-gray-500
                    bg-white
                    flex-shrink-0
                  "
                />

              )}

              <span className="text-black font-medium">

                {option.option}

              </span>

            </div>

            <span className="text-black font-semibold">

              {option.votes}

            </span>

          </div>

          {/* Progress Bar */}

          <div className="mt-3">

            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">

              <div
                className="
                  h-full
                  bg-green-500
                  transition-all
                  duration-500
                "
                style={{
                  width: `${option.percentage}%`,
                }}
              />

            </div>

          </div>
        </button>
        </div>

      ))}

    </div>

    {/* Footer */}

    <div className="mt-6 border-t border-gray-600 pt-4">

      <div className="flex justify-between items-center text-sm text-white">

        <div>

          Total Votes

          <span className="ml-2 font-bold">

            {poll.total_votes}

          </span>

        </div>

        {poll.expires_at && (

          <div className="flex items-center text-xs gap-1">
            <Clock size={15} />

            <span>
              {new Date(message.created_at).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })}{" "}
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}

      </div>

      {isExpired && (

        <div
          className="
            mt-4
            bg-red-100
            text-red-600
            rounded-lg
            p-3
            text-center
            font-semibold
          "
        >
          Poll Closed
        </div>

      )}

      {!isExpired &&
        alreadyVoted && (

        <div
          className="
            mt-4
            bg-green-100
            text-green-700
            rounded-lg
            p-3
            text-center
            font-semibold
          "
        >
          ✓ You have already voted.
        </div>

      )}

      {!alreadyVoted &&
        !isExpired &&
        !isAdmin && (

        <div className="mt-4 text-center text-xs lg:text-xs md::text-sm text-gray-300">

          Tap any option to vote.

        </div>

      )}

      {loading && (

        <div className="flex justify-center mt-4">

          <Loader2
            className="
              animate-spin
              text-green-600
            "
            size={24}
          />

        </div>

      )}

    </div>

   

  </div>
);


}