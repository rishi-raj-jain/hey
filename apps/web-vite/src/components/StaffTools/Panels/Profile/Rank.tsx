import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  HandRaisedIcon,
  UserCircleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { HashtagIcon } from '@heroicons/react/24/solid';
import { GITCOIN_PASSPORT_KEY } from '@hey/data/constants';
import type { Profile } from '@hey/lens';
import { formatDate } from '@lib/formatTime';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { type FC } from 'react';
import urlcat from 'urlcat';

import MetaDetails from '../MetaDetails';

interface RankProps {
  profile: Profile;
}

const Rank: FC<RankProps> = ({ profile }) => {
  const getRank = async (strategy: string) => {
    try {
      const response = await axios.get(
        urlcat('https://lens-api.k3l.io/profile/rank', {
          strategy,
          handle: profile.handle?.localName
        })
      );

      return response.data;
    } catch (error) {
      return false;
    }
  };

  const getGitcoinScore = async () => {
    try {
      const response = await axios.get(
        urlcat('https://api.scorer.gitcoin.co/registry/score/:id/:address', {
          id: 335,
          address: profile.ownedBy.address
        }),
        { headers: { 'X-API-Key': GITCOIN_PASSPORT_KEY } }
      );

      return response.data;
    } catch (error) {
      return false;
    }
  };

  const { data: followship, isLoading: followshipLoading } = useQuery({
    queryKey: ['getRank', profile.id, 'followship'],
    queryFn: async () => getRank('followship')
  });

  const { data: engagement, isLoading: engagementLoading } = useQuery({
    queryKey: ['getRank', profile.id, 'engagement'],
    queryFn: async () => getRank('engagement')
  });

  const { data: influencer, isLoading: influencerLoading } = useQuery({
    queryKey: ['getRank', profile.id, 'influencer'],
    queryFn: async () => getRank('influencer')
  });

  const { data: creator, isLoading: creatorLoading } = useQuery({
    queryKey: ['getRank', profile.id, 'creator'],
    queryFn: async () => getRank('creator')
  });

  const { data: gitcoinScore, isLoading: gitcoinScoreLoading } = useQuery({
    queryKey: ['getGitcoinScore', profile.id],
    queryFn: getGitcoinScore
  });

  return (
    <>
      <div className="mt-5 flex items-center space-x-2 text-yellow-600">
        <HashtagIcon className="h-5 w-5" />
        <div className="text-lg font-bold">Scores</div>
      </div>
      <div className="mt-3 space-y-2">
        <MetaDetails
          icon={<UserPlusIcon className="ld-text-gray-500 h-4 w-4" />}
          title="Followship Rank"
        >
          {followshipLoading ? (
            <div className="shimmer h-4 w-5 rounded" />
          ) : followship ? (
            followship.rank
          ) : (
            'Not ranked'
          )}
        </MetaDetails>
        <MetaDetails
          icon={<HandRaisedIcon className="ld-text-gray-500 h-4 w-4" />}
          title="Engagement Rank"
        >
          {engagementLoading ? (
            <div className="shimmer h-4 w-5 rounded" />
          ) : engagement ? (
            engagement.rank
          ) : (
            'Not ranked'
          )}
        </MetaDetails>
        <MetaDetails
          icon={<UserCircleIcon className="ld-text-gray-500 h-4 w-4" />}
          title="Influencer Rank"
        >
          {influencerLoading ? (
            <div className="shimmer h-4 w-5 rounded" />
          ) : influencer ? (
            influencer.rank
          ) : (
            'Not ranked'
          )}
        </MetaDetails>
        <MetaDetails
          icon={<CurrencyDollarIcon className="ld-text-gray-500 h-4 w-4" />}
          title="Creator Rank"
        >
          {creatorLoading ? (
            <div className="shimmer h-4 w-5 rounded" />
          ) : creator ? (
            creator.rank
          ) : (
            'Not ranked'
          )}
        </MetaDetails>
        <MetaDetails
          icon={<CheckCircleIcon className="ld-text-gray-500 h-4 w-4" />}
          title="Gitcoin Score"
        >
          {gitcoinScoreLoading ? (
            <div className="shimmer h-4 w-5 rounded" />
          ) : gitcoinScore ? (
            <span>
              {parseInt(gitcoinScore?.evidence?.rawScore) > 0 ? (
                <>
                  {parseFloat(gitcoinScore?.evidence?.rawScore).toFixed(2)}
                  <span className="ld-text-gray-500 text-xs">
                    {' '}
                    (Updated: {formatDate(gitcoinScore?.last_score_timestamp)})
                  </span>
                </>
              ) : (
                'Not scored'
              )}
            </span>
          ) : (
            'Not scored'
          )}
        </MetaDetails>
        {gitcoinScore?.stamp_scores &&
        Object.keys(gitcoinScore?.stamp_scores).length > 0 ? (
          <div className="ld-text-gray-500 ml-5 space-y-1 text-xs">
            {Object.keys(gitcoinScore.stamp_scores).map((key) => {
              return (
                <div key={key}>
                  <b className="ml-1">{key}: </b>
                  {gitcoinScore?.stamp_scores[key]}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Rank;
