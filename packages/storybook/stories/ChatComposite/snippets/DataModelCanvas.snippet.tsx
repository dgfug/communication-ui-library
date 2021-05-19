// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { toFlatCommunicationIdentifier } from '@azure/communication-react';
import { text, radios } from '@storybook/addon-knobs';
import React, { useState, useEffect, useRef } from 'react';
import { COMPOSITE_STRING_CONNECTIONSTRING } from '../../CompositeStringUtils';
import { COMPOSITE_EXPERIENCE_CONTAINER_STYLE } from '../../constants';
import { ContosoChatContainer, ContosoChatContainerProps } from './DataModelContainer.snippet';
import { createUserAndThread } from './Server.snippet';
import { ConfigHintBanner, addParrotBotToThread } from './Utils.snippet';

export const DataModelCanvas: () => JSX.Element = () => {
  const [containerProps, setContainerProps] = useState<ContosoChatContainerProps>();

  const knobs = useRef({
    connectionString: text(COMPOSITE_STRING_CONNECTIONSTRING, '', 'Server Simulator'),
    displayName: text('Local User Display Name', '', 'Server Simulator'),
    avatar: radios('Bot Avatar', avatars, 'Default', 'Server Simulator')
  });

  useEffect(() => {
    const fetchToken = async (): Promise<void> => {
      if (knobs.current.connectionString && knobs.current.displayName) {
        const newChatConfig = await createUserAndThread(knobs.current.connectionString, knobs.current.displayName);
        const botUserToken = await addParrotBotToThread(knobs.current.connectionString, newChatConfig, messageArray);
        setContainerProps({
          config: newChatConfig,
          botUserId: toFlatCommunicationIdentifier(botUserToken.user),
          botAvatar: knobs.current.avatar
        });
      }
    };
    fetchToken();
  }, [knobs]);

  return (
    <div style={COMPOSITE_EXPERIENCE_CONTAINER_STYLE}>
      {containerProps ? <ContosoChatContainer {...containerProps} /> : <ConfigHintBanner />}
    </div>
  );
};

const avatars = {
  Default: '🤖',
  Cat: '🐱',
  Fox: '🦊',
  Koala: '🐨'
};

const messageArray = [
  'Welcome to the custom data model example!',
  'Your display name is shown in the participant list, so is mine: A simple bot.',
  'Additionally, you can change my avatar from the default Robot symbol to furrier creatures.',
  'Have fun!'
];
