import type { Notification } from '@hey/lens';
import {
  useAuthorizationRecordRevokedSubscriptionSubscription,
  useNewNotificationSubscriptionSubscription,
  useUserSigNoncesQuery,
  useUserSigNoncesSubscriptionSubscription
} from '@hey/lens';
import { BrowserPush } from '@lib/browserPush';
import getCurrentSession from '@lib/getCurrentSession';
import getPushNotificationData from '@lib/getPushNotificationData';
import { type FC } from 'react';
import { isSupported, share } from 'shared-zustand';
import { useNonceStore } from '@store/non-persisted/useNonceStore';
import { signOut } from '@persisted/useAuthStore';
import { useNotificationStore } from '@persisted/useNotificationStore';
import { useUpdateEffect } from 'usehooks-ts';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

const LensSubscriptionsProvider: FC = () => {
  const setLatestNotificationId = useNotificationStore(
    (state) => state.setLatestNotificationId
  );
  const setLensHubOnchainSigNonce = useNonceStore(
    (state) => state.setLensHubOnchainSigNonce
  );
  const setLensPublicActProxyOnchainSigNonce = useNonceStore(
    (state) => state.setLensPublicActProxyOnchainSigNonce
  );
  const { address } = useAccount();
  const { authorizationId, id: sessionProfileId } = getCurrentSession();
  const canUseSubscriptions = Boolean(sessionProfileId) && address;

  // Begin: New Notification
  const { data: newNotificationData } =
    useNewNotificationSubscriptionSubscription({
      variables: { for: sessionProfileId },
      skip: !canUseSubscriptions || isAddress(sessionProfileId)
    });

  useUpdateEffect(() => {
    const notification = newNotificationData?.newNotification as Notification;

    if (notification) {
      if (notification && getPushNotificationData(notification)) {
        const notify = getPushNotificationData(notification);
        BrowserPush.notify({ title: notify?.title || '' });
      }
      setLatestNotificationId(notification?.id);
    }
  }, [newNotificationData]);
  // End: New Notification

  // Begin: User Sig Nonces
  const { data: userSigNoncesData } = useUserSigNoncesSubscriptionSubscription({
    variables: { address },
    skip: !canUseSubscriptions
  });

  useUpdateEffect(() => {
    const userSigNonces = userSigNoncesData?.userSigNonces;

    if (userSigNonces) {
      setLensHubOnchainSigNonce(userSigNonces.lensHubOnchainSigNonce);
      setLensPublicActProxyOnchainSigNonce(
        userSigNonces.lensPublicActProxyOnchainSigNonce
      );
    }
  }, [userSigNoncesData]);
  // End: User Sig Nonces

  // Begin: Authorization Record Revoked
  const { data: authorizationRecordRevokedData } =
    useAuthorizationRecordRevokedSubscriptionSubscription({
      variables: { authorizationId },
      skip: !canUseSubscriptions
    });

  useUpdateEffect(() => {
    const authorizationRecordRevoked =
      authorizationRecordRevokedData?.authorizationRecordRevoked;

    // Using not null assertion because api returns null if revoked
    if (!authorizationRecordRevoked) {
      signOut();
      location.reload();
    }
  }, [authorizationRecordRevokedData]);
  // End: Authorization Record Revoked

  useUserSigNoncesQuery({
    onCompleted: (data) => {
      setLensPublicActProxyOnchainSigNonce(
        data.userSigNonces.lensPublicActProxyOnchainSigNonce
      );
    },
    skip: Boolean(sessionProfileId) ? !isAddress(sessionProfileId) : true
  });

  // Sync zustand stores between tabs
  if (isSupported()) {
    share('lensHubOnchainSigNonce', useNonceStore);
    share('lensPublicActProxyOnchainSigNonce', useNonceStore);
  }

  return null;
};

export default LensSubscriptionsProvider;
