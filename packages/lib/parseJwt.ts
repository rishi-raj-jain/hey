/**
 * Decodes a JWT and returns the data in base64 format.
 *
 * @param str The JWT to decode.
 * @returns The decoded data in base64 format.
 */
const decoded = (str: string): string => atob(str);

/**
 * Parses a JSON Web Token and returns an object with the expiry time in seconds.
 *
 * @param token The JSON Web Token to parse.
 * @returns An object with the expiry time in seconds.
 */
const parseJwt = (
  token: string
): {
  id: string;
  evmAddress: string;
  role: string;
  authorizationId: string;
  iat: number;
  exp: number;
} => {
  try {
    return JSON.parse(decoded(token.split('.')[1]));
  } catch {
    return {
      id: '',
      evmAddress: '',
      role: '',
      authorizationId: '',
      iat: 0,
      exp: 0
    };
  }
};

export default parseJwt;
