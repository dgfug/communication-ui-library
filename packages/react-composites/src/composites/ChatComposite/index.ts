// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export { createAzureCommunicationChatAdapter } from './adapter/AzureCommunicationChatAdapter';
export type { AzureCommunicationChatAdapterArgs } from './adapter/AzureCommunicationChatAdapter';

export { ChatComposite } from './ChatComposite';
export type { ChatCompositeProps, ChatOptions } from './ChatComposite';

export type {
  ChatAdapter,
  ChatAdapterErrors,
  ChatCompositeClientState,
  ChatAdapterState,
  ChatAdapterUiState,
  ChatErrorListener,
  MessageReadListener,
  MessageReceivedListener,
  MessageSentListener,
  ParticipantsAddedListener,
  ParticipantsRemovedListener,
  TopicChangedListener
} from './adapter/ChatAdapter';
