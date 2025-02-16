import WalletSelector from '@components/Shared/Login/WalletSelector';
import SwitchNetwork from '@components/Shared/SwitchNetwork';
import {
  CurrencyDollarIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { BasePaint } from '@hey/abis';
import { BASEPAINT_CONTRACT } from '@hey/data/contracts';
import { PUBLICATION } from '@hey/data/tracking';
import type { AnyPublication } from '@hey/lens';
import type { BasePaintCanvas } from '@hey/types/nft';
import { Button, Spinner } from '@hey/ui';
import { Leafwatch } from '@lib/leafwatch';
import { Link } from 'react-router-dom';
import { type FC } from 'react';
import { useUpdateEffect } from 'usehooks-ts';
import { parseEther } from 'viem';
import { base } from 'viem/chains';
import {
  useAccount,
  useChainId,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi';

import { useBasePaintMintStore } from '.';

const NO_BALANCE_ERROR = 'exceeds the balance of the account';

interface MintActionProps {
  canvas: BasePaintCanvas;
  openEditionPrice: number;
  publication: AnyPublication;
}

const MintAction: FC<MintActionProps> = ({
  canvas,
  openEditionPrice,
  publication
}) => {
  const quantity = useBasePaintMintStore((state) => state.quantity);

  const chain = useChainId();
  const { isDisconnected } = useAccount();

  const nftAddress = BASEPAINT_CONTRACT;
  const day = canvas.id;
  const value = parseEther(openEditionPrice.toString()) * BigInt(quantity);

  const {
    config,
    isError: isPrepareError,
    error: prepareError
  } = usePrepareContractWrite({
    chainId: base.id,
    address: nftAddress,
    functionName: 'mint',
    abi: BasePaint,
    args: [day, quantity],
    value
  });
  const {
    write,
    data,
    isLoading: isContractWriteLoading
  } = useContractWrite({
    ...config
  });
  const {
    data: txnData,
    isLoading,
    isSuccess
  } = useWaitForTransaction({
    chainId: base.id,
    hash: data?.hash
  });

  useUpdateEffect(() => {
    if (txnData?.transactionHash) {
      Leafwatch.track(PUBLICATION.OPEN_ACTIONS.BASEPAINT_NFT.MINT, {
        publication_id: publication.id,
        nft: nftAddress,
        price: openEditionPrice * quantity,
        quantity
      });
    }
  }, [isSuccess]);

  const mintingOrSuccess = isLoading || isSuccess;

  // Errors
  const noBalanceError = prepareError?.message?.includes(NO_BALANCE_ERROR);

  return !mintingOrSuccess ? (
    <div className="flex">
      {isDisconnected ? (
        <div className="mt-5 w-full justify-center">
          <WalletSelector />
        </div>
      ) : chain !== base.id ? (
        <SwitchNetwork
          className="mt-5 w-full justify-center"
          toChainId={base.id}
          title={`Switch to ${base.name}`}
        />
      ) : isPrepareError ? (
        noBalanceError ? (
          <Link
            className="w-full"
            to="https://app.uniswap.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              className="mt-5 w-full justify-center"
              icon={<CurrencyDollarIcon className="h-5 w-5" />}
              size="md"
            >
              You don't have balance
            </Button>
          </Link>
        ) : null
      ) : (
        <Button
          className="mt-5 w-full justify-center"
          disabled={!write}
          onClick={() => write?.()}
          icon={
            isContractWriteLoading ? (
              <Spinner size="xs" />
            ) : (
              <CursorArrowRaysIcon className="h-5 w-5" />
            )
          }
        >
          Mint
        </Button>
      )}
    </div>
  ) : (
    <div className="mt-5 text-sm font-medium">
      {isLoading ? (
        <div className="flex items-center space-x-1.5">
          <Spinner size="xs" />
          <div>Minting in progress</div>
        </div>
      ) : null}
      {isSuccess ? (
        <div className="flex items-center space-x-1.5">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <div>Minted successful</div>
        </div>
      ) : null}
    </div>
  );
};

export default MintAction;
