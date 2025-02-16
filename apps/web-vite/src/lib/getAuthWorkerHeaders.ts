import { IS_MAINNET } from '@hey/data/constants';
import { hydrateAuthTokens } from '@persisted/useAuthStore';

const getAuthWorkerHeaders = () => {
  return {
    'X-Access-Token': hydrateAuthTokens().accessToken,
    'X-Lens-Network': IS_MAINNET ? 'mainnet' : 'testnet'
  };
};

export default getAuthWorkerHeaders;
