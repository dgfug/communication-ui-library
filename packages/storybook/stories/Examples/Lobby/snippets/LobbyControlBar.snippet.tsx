// LobbyControlBar.example.tsx

import {
  ControlBar,
  MicrophoneButton,
  labeledHangupButtonProps,
  labeledOptionsButtonProps,
  labeledVideoButtonProps
} from '@azure/communication-ui';
import { DefaultButton } from '@fluentui/react';
import React from 'react';

export const LobbyCallControlBar = (): JSX.Element => {
  return (
    <ControlBar
      layout="dockedBottom"
      styles={{ root: { background: 'white', minHeight: '4.25rem', alignItems: 'center' } }}
    >
      <DefaultButton {...labeledVideoButtonProps} checked={true} />
      <MicrophoneButton showLabel={true} checked={true} />
      <DefaultButton {...labeledOptionsButtonProps} />
      <DefaultButton {...labeledHangupButtonProps} style={{ borderRadius: '0.25rem', marginLeft: '0.25rem' }} />
    </ControlBar>
  );
};
