import { algorithms } from '@hey/data/algorithms';
import type { HomeFeedType } from '@hey/data/enums';
import { HOME } from '@hey/data/tracking';
import { TabButton } from '@hey/ui';
import { Leafwatch } from '@lib/leafwatch';
import { type Dispatch, type FC, type SetStateAction } from 'react';
import { useEnabledAlgorithmsStore } from '@persisted/useEnabledAlgorithmsStore';

interface FeedTypeProps {
  setFeedType: Dispatch<SetStateAction<HomeFeedType>>;
  feedType: HomeFeedType;
}

const Tabs: FC<FeedTypeProps> = ({ setFeedType, feedType }) => {
  const enabledAlgorithms = useEnabledAlgorithmsStore(
    (state) => state.enabledAlgorithms
  );
  const sanitizedEnabledAlgorithms = algorithms.filter((a) => {
    return enabledAlgorithms.includes(a.feedType);
  });

  if (sanitizedEnabledAlgorithms.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3 sm:px-0">
      {sanitizedEnabledAlgorithms.map((algorithm) => {
        return (
          <TabButton
            key={algorithm.feedType}
            name={algorithm.name}
            icon={
              <img
                className="h-4 w-4 rounded"
                src={algorithm.image}
                alt={algorithm.name}
              />
            }
            active={feedType === algorithm.feedType}
            showOnSm
            onClick={() => {
              setFeedType(algorithm.feedType as HomeFeedType);
              Leafwatch.track(HOME.ALGORITHMS.SWITCH_ALGORITHMIC_FEED, {
                algorithm: algorithm.feedType
              });
            }}
          />
        );
      })}
    </div>
  );
};

export default Tabs;
