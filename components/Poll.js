import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { shortenNumber, truncate } from '@/lib/projectFunctions';

export default function Poll({
    pollId,
}) {
  
  const [pollLoading, setPollLoading] = useState(true);
  const [pollOptions, setPollOptions] = useState([]);
  const [pollDisabled, setPollDisabled] = useState(false); // To stop the user from clicking multiple times before the vote is handled
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [totalVotes, setTotalVotes] = useState(null);

  // Fetch only poll options (no votes)
  const fetchPollOptions = async () => {

    const { data: hasVotedData, error: hasVotedError } = await supabase.rpc("has_user_voted", {
        p_poll_id: pollId
    });

    if (hasVotedError)
    {
        console.log(hasVotedError);
        return;
    }

    if (hasVotedData?.[0].has_voted) {
        setVotedOptionId(hasVotedData[0].voted_option_id);
        setHasVoted(true);
        await fetchResults();
        return;
    }

    const { data, error } = await supabase
        .from("poll_options")
        .select("id, option_text")
        .eq("poll_id", pollId)
        .order("option_order", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    setPollOptions(data);
    setPollLoading(false);
  };

  useEffect(() => {
    fetchPollOptions();
  }, [pollId]);

  const fetchResults = async () => {
    const { data: pollData, error } = await supabase.rpc("get_poll_results", {
        p_poll_id: pollId
    });

    if (error) {
        console.log(error);
        return;
    }

    setPollOptions(pollData);
    setTotalVotes(pollData[0]?.total_votes)
    setPollLoading(false);
  }

  const handleVote = async (optionId) => {
        setPollDisabled(true);

        const { data } = await supabase.auth.getUser();

        if (!data.user)
        {
            window.location.href = '/login';
            return;
        }

        if (hasVoted) return;
        
        const { error } = await supabase.rpc("cast_vote", { p_option_id: optionId });

        if (error) {
            console.log(error);
            setPollDisabled(false);
            return;
        }

        setVotedOptionId(optionId);
        setHasVoted(true);
        await fetchResults();
    }

    function getPercent(vote_count, total_votes) {
        if (totalVotes == 0)
        {
            return "0%";
        }

        const number = (vote_count / total_votes) * 100;
        return truncate(number, 1) + "%";
    }

    function getTruePercent(vote_count, total_votes) {
        if (totalVotes == 0)
        {
            return "0%";
        }
        
        const number = (vote_count / total_votes) * 100;
        return number + "%";
    }

    return (
    <>
    <ul className="poll">
        {pollLoading &&
        <li>
            <div className="poll-option no-select-pointer skeleton">
                <div className="color">
                    <span className="bodyFont">Poll Option</span>
                </div>
                <div className="percent label-color bodyFont caption-size">
                    <span className="hide">0%</span>
                </div>
            </div>
        </li>
        }
        {pollOptions.map((pollOption, i) => (
        <li key={i}>
            <div className={`poll-option ${(hasVoted || pollDisabled) ? "no-pointer-events" : "no-select-pointer"}`} onClick={() => handleVote(pollOption.id || pollOption.option_id)}>
                <div className="color" style={{ width: `${getTruePercent(pollOption.vote_count, pollOption.total_votes)}` }}>
                    <span className={`bodyFont` + (votedOptionId == (pollOption.id || pollOption.option_id) ? " bold" : "")}>{pollOption.option_text}</span>
                </div>
                <div className="percent label-color bodyFont caption-size">
                    <span className={`${hasVoted ? "" : "hide"}`}>{getPercent(pollOption.vote_count, pollOption.total_votes)}</span>
                </div>
            </div>
        </li>         
        ))}
    </ul>
    {(hasVoted && totalVotes != null) && <span style={{marginRight: "auto"}} className='bodyFont label-color'>{shortenNumber(totalVotes || 0)} Vote{totalVotes != 1 ? "s" : ""}</span>}
    </>
  );
}
