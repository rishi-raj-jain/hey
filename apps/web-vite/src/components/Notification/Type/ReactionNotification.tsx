import Markup from '@components/Shared/Markup';
import { HeartIcon } from '@heroicons/react/24/outline';
import { ReactionNotification } from '@hey/lens';
import getPublicationData from '@hey/lib/getPublicationData';
import pushToImpressions from '@lib/pushToImpressions';
import { Link } from 'react-router-dom';
import plur from 'plur';
import type { FC } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import AggregatedNotificationTitle from '../AggregatedNotificationTitle';
import { NotificationProfileAvatar } from '../Profile';

interface ReactionNotificationProps {
  notification: ReactionNotification;
}

const ReactionNotification: FC<ReactionNotificationProps> = ({
  notification
}) => {
  const metadata = notification?.publication.metadata;
  const filteredContent = getPublicationData(metadata)?.content || '';
  const reactions = notification?.reactions;
  const firstProfile = reactions?.[0]?.profile;
  const length = reactions.length - 1;
  const moreThanOneProfile = length > 1;

  const text = moreThanOneProfile
    ? `and ${length} ${plur('other', length)} liked your`
    : 'liked your';
  const type = notification?.publication.__typename;

  useEffectOnce(() => {
    pushToImpressions(notification.publication.id);
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <HeartIcon className="text-brand-500/70 h-6 w-6" />
        <div className="flex items-center space-x-1">
          {reactions.slice(0, 10).map((reaction) => (
            <div key={reaction.profile.id}>
              <NotificationProfileAvatar profile={reaction.profile} />
            </div>
          ))}
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
          <Markup mentions={notification.publication.profilesMentioned}>
            {filteredContent}
          </Markup>
        </Link>
      </div>
    </div>
  );
};

export default ReactionNotification;
