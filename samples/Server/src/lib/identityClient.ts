// © Microsoft Corporation. All rights reserved.

import {
  CommunicationAccessToken,
  CommunicationIdentityClient,
  CommunicationUserToken,
  TokenScope
} from '@azure/communication-identity';
import { CommunicationUserIdentifier } from '@azure/communication-common';
import { getResourceConnectionString } from './envHelper';

// lazy init to allow mocks in test
let identityClient: CommunicationIdentityClient | undefined = undefined;
const getIdentityClient = (): CommunicationIdentityClient =>
  identityClient ?? (identityClient = new CommunicationIdentityClient(getResourceConnectionString()));

// replicate here to allow for mocks in tests
export const createUser = (): Promise<CommunicationUserIdentifier> => getIdentityClient().createUser();
export const issueToken = (
  user: CommunicationUserIdentifier,
  scopes: TokenScope[]
): Promise<CommunicationAccessToken> => getIdentityClient().getToken(user, scopes);
export const createUserWithToken = (scopes: TokenScope[]): Promise<CommunicationUserToken> =>
  getIdentityClient().createUserAndToken(scopes);
