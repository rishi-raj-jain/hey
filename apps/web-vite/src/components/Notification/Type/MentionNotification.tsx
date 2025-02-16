import Markup from '@components/Shared/Markup';
import { AtSymbolIcon } from '@heroicons/react/24/outline';
import { MentionNotification } from '@hey/lens';
import getPublicationData from '@hey/lib/getPublicationData';
import { Link } from 'react-router-dom';
import type { FC } from 'react';

import AggregatedNotificationTitle from '../AggregatedNotificationTitle';
import { NotificationProfileAvatar } from '../Profile';

interface MentionNotificationProps {
  notification: MentionNotification;
}

const MentionNotification: FC<MentionNotificationProps> = ({
  notification
}) => {
  const metadata = notification?.publication.metadata;
  const filteredContent = getPublicationData(metadata)?.content || '';
  const firstProfile = notification.publication.by;

  const text = 'mentioned you in a';
  const type = notification.publication.__typename;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <AtSymbolIcon className="text-brand-500/70 h-6 w-6" />
        <div className="flex items-center space-x-1">
          <NotificationProfileAvatar profile={firstProfile} />
        </div>
      </div>
      <div className="ml-9">
        <AggregatedNotificationTitle
          firstProfile={firstProfile}
          text={text}
          type={type}
          linkToType={`/posts/${notification?.publication?.id}`}
        />
        <Link
          to={`/posts/${notification?.publication?.id}`}
          className="ld-text-gray-500 linkify mt-2 line-clamp-2"
        >
          <Markup mentions={notification?.publication.profilesMentioned}>
            {filteredContent}
          </Markup>
        </Link>
      </div>
    </div>
  );
};

export default MentionNotification;
