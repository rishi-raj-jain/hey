import { PencilSquareIcon } from '@heroicons/react/24/outline';
import getAvatar from '@hey/lib/getAvatar';
import getProfile from '@hey/lib/getProfile';
import { Card, Image } from '@hey/ui';
import type { FC } from 'react';
import { useGlobalModalStateStore } from '@store/non-persisted/useGlobalModalStateStore';
import { usePublicationStore } from '@store/non-persisted/usePublicationStore';
import useProfileStore from '@persisted/useProfileStore';
import { useEffectOnce } from 'usehooks-ts';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const NewPost: FC = () => {
  const navigate = useNavigate();
  const [searchParams, _] = useSearchParams();
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const setShowNewPostModal = useGlobalModalStateStore(
    (state) => state.setShowNewPostModal
  );
  const setPublicationContent = usePublicationStore(
    (state) => state.setPublicationContent
  );

  const openModal = () => {
    setShowNewPostModal(true);
  };

  useEffectOnce(() => {
    // isReady
    if (searchParams.get('text')) {
      const url = searchParams.get('url');
      const via = searchParams.get('via');
      const text = searchParams.get('text');
      const hashtags = searchParams.get('hashtags');
      let processedHashtags;

      if (hashtags) {
        processedHashtags = (hashtags as string)
          .split(',')
          .map((tag) => `#${tag} `)
          .join('');
      }

      const content = `${text}${
        processedHashtags ? ` ${processedHashtags} ` : ''
      }${url ? `\n\n${url}` : ''}${via ? `\n\nvia @${via}` : ''}`;

      setShowNewPostModal(true);
      setPublicationContent(content);
    }
  });

  return (
    <Card className="space-y-3 p-5">
      <div className="flex items-center space-x-3">
        <Image
          src={getAvatar(currentProfile)}
          className="h-9 w-9 cursor-pointer rounded-full border bg-gray-200 dark:border-gray-700"
          onClick={() => navigate(getProfile(currentProfile).link)}
          alt={currentProfile?.id}
        />
        <button
          className="outline-brand-500 flex w-full items-center space-x-2 rounded-xl border bg-gray-100 px-4 py-2 dark:border-gray-700 dark:bg-gray-900"
          type="button"
          onClick={() => openModal()}
        >
          <PencilSquareIcon className="h-5 w-5" />
          <span>What's happening?</span>
        </button>
      </div>
    </Card>
  );
};

export default NewPost;
