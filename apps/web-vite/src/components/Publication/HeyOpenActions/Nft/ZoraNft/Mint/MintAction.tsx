import WalletSelector from '@components/Shared/Login/WalletSelector';
import SwitchNetwork from '@components/Shared/SwitchNetwork';
import {
  CurrencyDollarIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ZoraCreator1155Impl, ZoraERC721Drop } from '@hey/abis';
import { APP_NAME, REWARDS_ADDRESS, ZERO_ADDRESS } from '@hey/data/constants';
import { ZORA_FIXED_PRICE_SALE_STRATEGY } from '@hey/data/contracts';
import { PUBLICATION } from '@hey/data/tracking';
import type { AnyPublication } from '@hey/lens';
import getZoraChainInfo from '@hey/lib/getZoraChainInfo';
import type { ZoraNft } from '@hey/types/nft';
import { Button, Spinner } from '@hey/ui';
import { Leafwatch } from '@lib/leafwatch';
import { Link } from 'react-router-dom';
import { type FC } from 'react';
import { useUpdateEffect } from 'usehooks-ts';
import type { Address } from 'viem';
import { encodeAbiParameters, parseAbiParameters, parseEther } from 'viem';
import {
  useAccount,
  useChainId,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi';

import { useZoraMintStore } from '.';

const NO_BALANCE_ERROR = 'exceeds the balance of the account';
const MAX_MINT_EXCEEDED_ERROR = 'Purchase_TooManyForAddress';
const SALE_INACTIVE_ERROR = 'Sale_Inactive';
const ALLOWED_ERRORS_FOR_MINTING = [NO_BALANCE_ERROR, MAX_MINT_EXCEEDED_ERROR];

interface MintActionProps {
  nft: ZoraNft;
  zoraLink: string;
  publication?: AnyPublication;
  onCompleted?: () => void;
}

const MintAction: FC<MintActionProps> = ({
  nft,
  zoraLink,
  publication,
  onCompleted
}) => {
  const quantity = useZoraMintStore((state) => state.quantity);
  const setCanMintOnHey = useZoraMintStore((state) => state.setCanMintOnHey);

  const chain = useChainId();
  const { address, isDisconnected } = useAccount();

  const nftAddress = nft.address;
  const recipient = (address || ZERO_ADDRESS) as Address;
  const comment = `Minted from ${APP_NAME}`;
  const mintReferral = REWARDS_ADDRESS;
  const nftPriceInEth = parseInt(nft.price) / 10 ** 18;
  const mintFee = 0.000777;
  const mintFeeInEth = parseEther(mintFee.toString());
  const value =
    (parseEther(nftPriceInEth.toString()) + mintFeeInEth) * BigInt(quantity);

  const abi =
    nft.contractStandard === 'ERC721' ? ZoraERC721Drop : ZoraCreator1155Impl;
  const args =
    nft.contractStandard === 'ERC721'
      ? [recipient, BigInt(quantity), comment, mintReferral]
      : [
          ZORA_FIXED_PRICE_SALE_STRATEGY,
          parseInt(nft.tokenId),
          BigInt(quantity),
          encodeAbiParameters(parseAbiParameters('address'), [recipient]),
          mintReferral
        ];

  const {
    config,
    isFetching: isPrepareFetching,
    isError: isPrepareError,
    error: prepareError
  } = usePrepareContractWrite({
    chainId: nft.chainId,
    address: nftAddress,
    functionName: 'mintWithRewards',
    abi,
    args,
    value
  });
  const {
    write,
    data,
    isLoading: isContractWriteLoading
  } = useContractWrite({ ...config });
  const {
    data: txnData,
    isLoading,
    isSuccess
  } = useWaitForTransaction({
    chainId: nft.chainId,
    hash: data?.hash
  });

  useUpdateEffect(() => {
    if (txnData?.transactionHash) {
      onCompleted?.();
      Leafwatch.track(PUBLICATION.OPEN_ACTIONS.ZORA_NFT.MINT, {
        ...(publication && { publication_id: publication.id }),
        chain: nft.chainId,
        nft: nftAddress,
        price: (nftPriceInEth + mintFee) * quantity,
        quantity,
        hash: txnData.transactionHash
      });
    }
  }, [isSuccess]);

  useUpdateEffect(() => {
    setCanMintOnHey(
      !isPrepareError ||
        (isPrepareError &&
          ALLOWED_ERRORS_FOR_MINTING.some(
            (error) => prepareError?.message.includes(error)
          ))
    );
  }, [isPrepareFetching]);

  const mintingOrSuccess = isLoading || isSuccess;

  // Errors
  const noBalanceError = prepareError?.message?.includes(NO_BALANCE_ERROR);
  const maxMintExceededError = prepareError?.message?.includes(
    MAX_MINT_EXCEEDED_ERROR
  );
  const saleInactiveError =
    prepareError?.message?.includes(SALE_INACTIVE_ERROR);

  return !mintingOrSuccess ? (
    <div className="flex">
      {isDisconnected ? (
        <div className="mt-5 w-full justify-center">
          <WalletSelector />
        </div>
      ) : chain !== nft.chainId ? (
        <SwitchNetwork
          className="mt-5 w-full justify-center"
          toChainId={nft.chainId}
          title={`Switch to ${getZoraChainInfo(nft.chainId).name}`}
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
        ) : maxMintExceededError ? (
          <div className="mt-5 w-full">
            <div className="divider" />
            <b className="mt-5 flex w-full justify-center">
              You exceeded the mint limit
            </b>
          </div>
        ) : (
          <Link
            className="w-full"
            to={zoraLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              className="mt-5 w-full justify-center"
              icon={<CursorArrowRaysIcon className="h-5 w-5" />}
              size="md"
              onClick={() =>
                Leafwatch.track(PUBLICATION.OPEN_ACTIONS.ZORA_NFT.OPEN_LINK, {
                  ...(publication && { publication_id: publication.id }),
                  from: 'mint_modal',
                  type: saleInactiveError ? 'collect' : 'mint'
                })
              }
            >
              {saleInactiveError ? 'Collect on Zora' : 'Mint on Zora'}
            </Button>
          </Link>
        )
      ) : (
        <Button
          className="mt-5 w-full justify-center"
          disabled={!write}
          onClick={() => write?.()}
          icon={
            isContractWriteLoading ? (
              <Spinner size="xs" />
            ) : (
              <CursorArrowRaysIcon className="h-4 w-4" />
            )
          }
        >
          Mint on Zora
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
