import { CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import { STATIC_IMAGES_URL } from '@hey/data/constants';
import { BASEPAINT_CONTRACT } from '@hey/data/contracts';
import { PUBLICATION } from '@hey/data/tracking';
import type { AnyPublication } from '@hey/lens';
import stopEventPropagation from '@hey/lib/stopEventPropagation';
import type { BasePaintCanvasMetadata } from '@hey/types/nft';
import { Button, Card, Modal, Tooltip } from '@hey/ui';
import { Leafwatch } from '@lib/leafwatch';
import { Link } from 'react-router-dom';
import type { FC } from 'react';
import { useState } from 'react';
import useBasePaintCanvas from '@hooks/basepaint/useBasePaintCanvas';
import urlcat from 'urlcat';

import Mint, { useBasePaintMintStore } from './Mint';
import NftShimmer from './Shimmer';

interface BasePaintCanvasProps {
  nftMetadata: BasePaintCanvasMetadata;
  publication: AnyPublication;
}

const BasePaintCanvas: FC<BasePaintCanvasProps> = ({
  nftMetadata,
  publication
}) => {
  const { id } = nftMetadata;
  const [showMintModal, setShowMintModal] = useState(false);
  const setQuantity = useBasePaintMintStore((state) => state.setQuantity);

  const {
    data: canvas,
    loading,
    error
  } = useBasePaintCanvas({
    id,
    enabled: Boolean(id)
  });

  if (loading) {
    return <NftShimmer />;
  }

  if (!canvas) {
    return null;
  }

  if (error) {
    return null;
  }

  const { canMint, canContribute, bitmap, theme } = canvas;

  return (
    <Card
      className="mt-3"
      forceRounded
      onClick={(event) => stopEventPropagation(event)}
    >
      <img
        src={`data://image/gif;base64,${bitmap.gif}`}
        className="h-[400px] max-h-[400px] w-full rounded-t-xl object-cover"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="flex items-center justify-between border-t px-3 py-2 dark:border-gray-700">
        <div className="mr-5 flex flex-wrap items-center gap-2">
          <Tooltip placement="right" content="BasePaint">
            <img
              src={`${STATIC_IMAGES_URL}/brands/basepaint.jpeg`}
              className="h-5 w-5 rounded-full"
            />
          </Tooltip>
          <div className="text-sm font-bold">
            Day #{canvas.id}: {theme}
          </div>
          <div className="flex items-center space-x-1">
            {canvas.palette.map((color, index) => (
              <span
                key={index}
                className="inline-block h-4 w-4"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        {canMint ? (
          <>
            <Button
              className="text-sm"
              icon={<CursorArrowRaysIcon className="h-4 w-4" />}
              size="md"
              onClick={() => {
                setQuantity(1);
                setShowMintModal(true);
                Leafwatch.track(
                  PUBLICATION.OPEN_ACTIONS.BASEPAINT_NFT.OPEN_MINT,
                  { publication_id: publication.id }
                );
              }}
            >
              Mint
            </Button>
            <Modal
              title="Mint on BasePaint"
              show={showMintModal}
              icon={<CursorArrowRaysIcon className="text-brand-500 h-5 w-5" />}
              onClose={() => setShowMintModal(false)}
            >
              <Mint canvas={canvas} publication={publication} />
            </Modal>
          </>
        ) : canContribute ? (
          <Link
            to={urlcat('https://basepaint.art/mint/:id', { id: canvas.id })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              className="text-sm"
              icon={<CursorArrowRaysIcon className="h-4 w-4" />}
              size="md"
              onClick={() =>
                Leafwatch.track(
                  PUBLICATION.OPEN_ACTIONS.BASEPAINT_NFT.OPEN_LINK,
                  { publication_id: publication.id, from: 'mint_embed' }
                )
              }
            >
              Contribute
            </Button>
          </Link>
        ) : (
          <Link
            to={urlcat('https://opensea.io/assets/base/:contract/:token', {
              contract: BASEPAINT_CONTRACT,
              token: canvas.id
            })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              className="text-sm"
              icon={<CursorArrowRaysIcon className="h-4 w-4" />}
              size="md"
              onClick={() =>
                Leafwatch.track(
                  PUBLICATION.OPEN_ACTIONS.BASEPAINT_NFT.OPEN_OPENSEA_LINK,
                  { publication_id: publication.id, from: 'mint_embed' }
                )
              }
            >
              View on OpenSea
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};

export default BasePaintCanvas;
