import { STATIC_IMAGES_URL } from '@hey/data/constants';
import type { Profile } from '@hey/lens';
import getProfile from '@hey/lib/getProfile';
import { Button } from '@hey/ui';
import type { FC } from 'react';
import { useState } from 'react';
import useProfileStore from '@persisted/useProfileStore';

import Create from './Create';

interface NoGalleryProps {
  profile: Profile;
}

const NoGallery: FC<NoGalleryProps> = ({ profile }) => {
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isOwner = profile.id === currentProfile?.id;

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-10">
      <div className="grid w-full max-w-sm grid-cols-3 gap-4">
        <Create showModal={showCreateModal} setShowModal={setShowCreateModal} />
        <div className="bg-brand-100 col-span-2 flex h-[250px] items-center justify-center rounded-xl">
          <img
            width={80}
            height={80}
            className="h-20 w-20"
            src={`${STATIC_IMAGES_URL}/emojis/pinata.png`}
            alt="Pinata emoji"
            draggable={false}
          />
        </div>
        <div className="space-y-2">
          <div className="bg-brand-100 flex h-[120px] items-center justify-center rounded-xl">
            <img
              width={56}
              height={56}
              className="h-14 w-14"
              src={`${STATIC_IMAGES_URL}/emojis/sunset.png`}
              alt="Sunset emoji"
              draggable={false}
            />
          </div>
          <div className="bg-brand-100 flex h-[120px] items-center justify-center rounded-xl">
            <img
              width={56}
              height={56}
              className="h-14 w-14"
              src={`${STATIC_IMAGES_URL}/emojis/sunrise.png`}
              alt="Sunrise emoji"
              draggable={false}
            />
          </div>
        </div>
      </div>
      <div className="text-center">
        {!isOwner ? (
          <>
            <h5 className="mb-2 text-xl">
              {getProfile(profile).displayName} hasn't setup gallery yet!
            </h5>
            <p className="text-sm opacity-60">Check again later</p>
          </>
        ) : (
          <>
            <h5 className="mb-2 text-xl">Welcome to your gallery</h5>
            <p className="text-sm opacity-60">
              Create a curated space for your digital collectibles
            </p>
          </>
        )}
      </div>
      {isOwner ? (
        <Button onClick={() => setShowCreateModal(true)}>Let's do it!</Button>
      ) : null}
    </div>
  );
};

export default NoGallery;
