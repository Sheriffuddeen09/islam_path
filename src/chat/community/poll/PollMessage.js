import { useMemo, useState } from "react";
import api from "../../../Api/axios";
import { toast } from "react-hot-toast";
import {
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import OptionVotersModal from "./OptionVotersModal";

export default function PollMessage({
  message, isAdmin
}) {
  const poll = message.poll_data;

  const [loading, setLoading] =
    useState(false);

  const [selected, setSelected] =
    useState([]);

const [selectedOption, setSelectedOption] = useState(null);
const [showVoters, setShowVoters] = useState(false);

  if (!poll) return null;

  const totalVotes =
    poll.total_votes || 0;

  const isExpired =
    poll.expires_at &&
    new Date(poll.expires_at) <
      new Date();

  const alreadyVoted =
    poll.options.some(option =>
      option.user_voted
    );

  const submitVote = async (
    optionId
  ) => {
    if (
      loading ||
      isExpired ||
      alreadyVoted
    )
      return;

    try {
      setLoading(true);

      await api.post(
        "/api/community/poll/vote",
        {
          poll_id: poll.id,
          option_id: optionId,
        }
      );

      poll.options =
        poll.options.map(option => {
          if (
            option.id === optionId
          ) {
            option.votes += 1;
            option.user_voted = true;
          }

          return option;
        });

      poll.total_votes += 1;

      poll.options.forEach(option => {
        option.percentage =
          poll.total_votes
            ? Math.round(
                (option.votes /
                  poll.total_votes) *
                  100
              )
            : 0;
      });

      toast.success(
        "Vote submitted"
      );
    } catch (err) {
      toast.error(
        "Unable to vote"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
      bg-white
      rounded-2xl
      shadow
      border
      border-gray-200
      p-4
      max-w-md
      w-full
      "
    >
      <div className="flex items-center justify-between">

        <h3 className="font-semibold text-gray-900 text-lg">
          📊 {poll.question}
        </h3>

        {poll.multiple_choice && (
          <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-1">
            Multiple
          </span>
        )}
      </div>

      <div className="mt-5 space-y-3">

        {poll.options.map(option => (

          <button
            key={option.id}
            disabled={
              loading ||
              alreadyVoted ||
              isExpired
            }
            onClick={() =>
              submitVote(option.id)
            }
            className="
              relative
              overflow-hidden
              w-full
              rounded-xl
              border
              border-gray-300
              p-3
              text-left
              hover:border-green-500
              transition
            "
          >
                {isAdmin && (

            <button
                onClick={() => {

                    setSelectedOption(option);

                    setShowVoters(true);

                }}
                className="
                    text-xs
                    text-blue-600
                    hover:underline
                    ml-2
                "
            >
                View Voters
            </button>

        )}
            <div
              className="
                absolute
                left-0
                top-0
                bottom-0
                bg-green-200
                transition-all
              "
              style={{
                width: `${option.percentage}%`,
              }}
            />

            <div className="relative flex justify-between items-center">

              <div className="flex items-center gap-2">

                {option.user_voted && (
                  <CheckCircle2
                    size={18}
                    className="text-green-600"
                  />
                )}

                <span className="font-medium">
                  {option.option}
                </span>

              </div>

              <span className="font-semibold">
                {option.percentage}%
              </span>

            </div>

            <div className="relative mt-2 text-xs text-gray-500">

              {option.votes} vote
              {option.votes !== 1
                ? "s"
                : ""}

            </div>

          </button>

        ))}

        
      </div>
      {/* Footer */}
      <div className="mt-5 border-t pt-4">

        <div className="flex items-center justify-between text-sm text-gray-600">

          <div className="font-medium">
            Total Votes:{" "}
            <span className="font-bold">
              {poll.total_votes}
            </span>
          </div>

          {poll.expires_at && (
            <div className="flex items-center gap-1">

              <Clock size={15} />

              <span>
                {new Date(
                  poll.expires_at
                ).toLocaleString()}
              </span>

            </div>
          )}

        </div>

        {isExpired && (
          <div
            className="
              mt-3
              rounded-lg
              bg-red-50
              border
              border-red-200
              text-red-600
              text-sm
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
                mt-3
                rounded-lg
                bg-green-50
                border
                border-green-200
                text-green-700
                text-sm
                p-3
                text-center
                font-semibold
              "
            >
              ✓ You have already voted.
            </div>
          )}

        {!alreadyVoted &&
          !isExpired && (
            <div className="mt-3 text-xs text-gray-500 text-center">

              Tap an option to vote.

            </div>
          )}

        {loading && (

          <div className="flex justify-center mt-4">

            <Loader2
              size={24}
              className="animate-spin text-green-600"
            />

          </div>

        )}

      </div>

      {showVoters && selectedOption && (
            <OptionVotersModal
                option={selectedOption}
                onClose={() => {
                    setShowVoters(false);
                    setSelectedOption(null);
                }}
            />
        )}

    </div>

  );

}