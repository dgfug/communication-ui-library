// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export {
  createAzureCommunicationCallAdapter,
  createAzureCommunicationCallAdapterFromClient
} from './AzureCommunicationCallAdapter';
export type { AzureCommunicationCallAdapterArgs } from './AzureCommunicationCallAdapter';

export type {
  CallAdapter,
  CallAdapterClientState,
  CallAdapterState,
  CallAdapterUiState,
  CallAdapterCallManagement,
  CallAdapterDeviceManagement,
  CallAdapterSubscribers,
  CallCompositePage,
  CallEndedListener,
  CallIdChangedListener,
  DisplayNameChangedListener,
  IsMutedChangedListener,
  IsLocalScreenSharingActiveChangedListener,
  IsSpeakingChangedListener,
  ParticipantsJoinedListener,
  ParticipantsLeftListener
} from './CallAdapter';
