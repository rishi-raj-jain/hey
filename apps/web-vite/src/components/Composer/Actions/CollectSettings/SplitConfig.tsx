import Beta from '@components/Shared/Badges/Beta';
import SearchUser from '@components/Shared/SearchUser';
import ToggleWithHelper from '@components/Shared/ToggleWithHelper';
import {
  ArrowsRightLeftIcon,
  PlusIcon,
  UsersIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { ADDRESS_PLACEHOLDER } from '@hey/data/constants';
import { OpenActionModuleType } from '@hey/lens';
import splitNumber from '@hey/lib/splitNumber';
import { Button, Input } from '@hey/ui';
import { type FC } from 'react';
import { useCollectModuleStore } from '@store/non-persisted/useCollectModuleStore';
import useProfileStore from '@persisted/useProfileStore';
import { isAddress } from 'viem';

interface SplitConfigProps {
  isRecipientsDuplicated: () => boolean;
  setCollectType: (data: any) => void;
}

const SplitConfig: FC<SplitConfigProps> = ({
  isRecipientsDuplicated,
  setCollectType
}) => {
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const collectModule = useCollectModuleStore((state) => state.collectModule);

  const recipients = collectModule.recipients ?? [];
  const hasRecipients = (recipients ?? []).length > 0;
  const splitTotal = recipients?.reduce((acc, curr) => acc + curr.split, 0);

  const splitEvenly = () => {
    const equalSplits = splitNumber(100, recipients.length);
    const splits = recipients.map((recipient, i) => {
      return {
        recipient: recipient.recipient,
        split: equalSplits[i]
      };
    });
    setCollectType({
      recipients: [...splits]
    });
  };

  const onChangeRecipientOrSplit = (
    index: number,
    value: string,
    type: 'recipient' | 'split'
  ) => {
    const getRecipients = (value: string) => {
      return recipients.map((recipient, i) => {
        if (i === index) {
          return {
            ...recipient,
            [type]: type === 'split' ? parseInt(value) : value
          };
        }
        return recipient;
      });
    };

    setCollectType({ recipients: getRecipients(value) });
  };

  const updateRecipient = (index: number, value: string) => {
    onChangeRecipientOrSplit(index, value, 'recipient');
  };

  return (
    <div className="pt-5">
      <ToggleWithHelper
        on={recipients.length > 0}
        setOn={() => {
          setCollectType({
            type:
              recipients.length > 0
                ? OpenActionModuleType.SimpleCollectOpenActionModule
                : OpenActionModuleType.MultirecipientFeeCollectOpenActionModule,
            recipients:
              recipients.length > 0
                ? []
                : [{ recipient: currentProfile?.ownedBy.address, split: 100 }]
          });
        }}
        heading={
          <div className="flex items-center space-x-2">
            <span>Split revenue</span>
            <Beta />
          </div>
        }
        description="Set multiple recipients for the collect fee"
        icon={<UsersIcon className="h-4 w-4" />}
      />
      {hasRecipients ? (
        <div className="space-y-3 pt-4">
          <div className="space-y-2">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <SearchUser
                  placeholder={`${ADDRESS_PLACEHOLDER} or wagmi`}
                  value={recipient.recipient}
                  onChange={(event) =>
                    updateRecipient(index, event.target.value)
                  }
                  onProfileSelected={(profile) =>
                    updateRecipient(index, profile.ownedBy.address)
                  }
                  hideDropdown={isAddress(recipient.recipient)}
                  error={
                    recipient.recipient.length > 0 &&
                    !isAddress(recipient.recipient)
                  }
                />
                <div className="w-1/3">
                  <Input
                    type="number"
                    placeholder="5"
                    min="1"
                    max="100"
                    value={recipient.split}
                    iconRight="%"
                    onChange={(event) =>
                      onChangeRecipientOrSplit(
                        index,
                        event.target.value,
                        'split'
                      )
                    }
                  />
                </div>
                <button
                  onClick={() => {
                    setCollectType({
                      recipients: recipients.filter((_, i) => i !== index)
                    });
                  }}
                >
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            {recipients.length >= 5 ? (
              <div />
            ) : (
              <Button
                size="sm"
                outline
                icon={<PlusIcon className="h-3 w-3" />}
                onClick={() => {
                  setCollectType({
                    recipients: [...recipients, { recipient: '', split: 0 }]
                  });
                }}
              >
                Add recipient
              </Button>
            )}
            <Button
              size="sm"
              outline
              icon={<ArrowsRightLeftIcon className="h-3 w-3" />}
              onClick={splitEvenly}
            >
              Split evenly
            </Button>
          </div>
          {splitTotal > 100 ? (
            <div className="text-sm font-bold text-red-500">
              Splits cannot exceed 100%. Total: <span>{splitTotal}</span>%
            </div>
          ) : null}
          {isRecipientsDuplicated() ? (
            <div className="text-sm font-bold text-red-500">
              Duplicate recipient address found
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default SplitConfig;
