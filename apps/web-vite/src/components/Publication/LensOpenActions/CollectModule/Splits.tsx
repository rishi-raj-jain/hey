import Slug from '@components/Shared/Slug';
import { POLYGONSCAN_URL } from '@hey/data/constants';
import type { Profile, RecipientDataOutput } from '@hey/lens';
import { useProfilesQuery } from '@hey/lens';
import formatAddress from '@hey/lib/formatAddress';
import getAvatar from '@hey/lib/getAvatar';
import getProfile from '@hey/lib/getProfile';
import getStampFyiURL from '@hey/lib/getStampFyiURL';
import { Link } from 'react-router-dom';
import { type FC } from 'react';

interface SplitsProps {
  recipients: RecipientDataOutput[];
}

const Splits: FC<SplitsProps> = ({ recipients }) => {
  const { data: recipientProfilesData, loading } = useProfilesQuery({
    variables: {
      request: { where: { ownedBy: recipients?.map((r) => r.recipient) } }
    },
    skip: !recipients?.length
  });

  if (recipients.length === 0) {
    return null;
  }

  const getProfileByAddress = (address: string) => {
    const profiles = recipientProfilesData?.profiles?.items;
    if (profiles) {
      return profiles.find((p) => p.ownedBy.address === address);
    }
  };

  return (
    <div className="space-y-2 pt-3">
      <div className="mb-2 font-bold">Fee recipients</div>
      {recipients.map((recipient) => {
        const { recipient: address, split } = recipient;
        const profile = getProfileByAddress(address) as Profile;

        return (
          <div
            key={address}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex w-full items-center space-x-2">
              {loading ? (
                <>
                  <div className="shimmer h-5 w-5 rounded-full" />
                  <div className="shimmer h-3 w-1/4 rounded-full" />
                </>
              ) : (
                <>
                  <img
                    className="h-5 w-5 rounded-full border bg-gray-200 dark:border-gray-700"
                    src={profile ? getAvatar(profile) : getStampFyiURL(address)}
                    alt="Avatar"
                  />
                  {profile ? (
                    <Link to={getProfile(profile).link}>
                      <Slug slug={getProfile(profile).slugWithPrefix} />
                    </Link>
                  ) : (
                    <Link
                      to={`${POLYGONSCAN_URL}/address/${address}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {formatAddress(address, 6)}
                    </Link>
                  )}
                </>
              )}
            </div>
            <div className="font-bold">{split}%</div>
          </div>
        );
      })}
    </div>
  );
};

export default Splits;
