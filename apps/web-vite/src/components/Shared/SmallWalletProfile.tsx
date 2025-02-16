import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { POLYGONSCAN_URL } from '@hey/data/constants';
import formatAddress from '@hey/lib/formatAddress';
import getStampFyiURL from '@hey/lib/getStampFyiURL';
import imageKit from '@hey/lib/imageKit';
import { Image } from '@hey/ui';
import cn from '@hey/ui/cn';
import { Link } from 'react-router-dom';
import { type FC } from 'react';
import useEnsName from '@hooks/useEnsName';
import type { Address } from 'viem';

interface SmallWalletProfileProps {
  address: Address;
  smallAvatar?: boolean;
}

const SmallWalletProfile: FC<SmallWalletProfileProps> = ({
  address,
  smallAvatar
}) => {
  const { ens, loading } = useEnsName({ address, enabled: Boolean(address) });

  return (
    <div className="flex items-center justify-between">
      <Link
        to={`${POLYGONSCAN_URL}/address/${address}`}
        className="flex items-center space-x-2"
        target="_blank"
        rel="noreferrer noopener"
      >
        <Image
          onError={({ currentTarget }) => {
            currentTarget.src = getStampFyiURL(address);
          }}
          src={imageKit(getStampFyiURL(address))}
          className={cn(
            smallAvatar ? 'h-5 w-5' : 'h-6 w-6',
            'rounded-full border bg-gray-200 dark:border-gray-700'
          )}
          height={smallAvatar ? 20 : 24}
          width={smallAvatar ? 20 : 24}
          alt={address}
        />
        <div>
          <div className="flex items-center gap-1.5">
            <div>{loading ? formatAddress(address) : formatAddress(ens)}</div>
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SmallWalletProfile;
