// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useCallback } from 'react';
import {
  CameraButton,
  ControlBar,
  EndCallButton,
  MicrophoneButton,
  ScreenShareButton,
  VideoStreamOptions
} from 'react-components';
import {
  controlBarStyle,
  groupCallLeaveButtonCompressedStyle,
  groupCallLeaveButtonStyle
} from './styles/CallControls.styles';
import { usePropsFor } from './hooks/usePropsFor';
import { devicePermissionSelector } from 'calling-component-bindings';
import { useAdaptedSelector } from './hooks/useAdaptedSelector';

const localVideoViewOption = {
  scalingMode: 'Crop',
  isMirrored: true
} as VideoStreamOptions;

export type GroupCallControlsProps = {
  onEndCallClick(): void;
  compressedMode: boolean;
};

export const CallControls = (props: GroupCallControlsProps): JSX.Element => {
  const { compressedMode, onEndCallClick } = props;
  const microphoneButtonProps = usePropsFor(MicrophoneButton);
  const cameraButtonProps = usePropsFor(CameraButton);
  const screenShareButtonProps = usePropsFor(ScreenShareButton);
  const hangUpButtonProps = usePropsFor(EndCallButton);
  const onHangUp = useCallback(async () => {
    await hangUpButtonProps.onHangUp();
    onEndCallClick();
  }, [hangUpButtonProps, onEndCallClick]);
  const { video: cameraPermissionGranted, audio: microphonePermissionGranted } = useAdaptedSelector(
    devicePermissionSelector
  );

  return (
    <ControlBar styles={controlBarStyle}>
      <CameraButton
        {...cameraButtonProps}
        onToggleCamera={() => {
          return cameraButtonProps.onToggleCamera(localVideoViewOption).catch((e) => console.log(e));
        }}
        disabled={!cameraPermissionGranted}
      />
      <MicrophoneButton {...microphoneButtonProps} disabled={!microphonePermissionGranted} />
      <ScreenShareButton {...screenShareButtonProps} />
      <EndCallButton
        {...hangUpButtonProps}
        onHangUp={onHangUp}
        styles={!compressedMode ? groupCallLeaveButtonStyle : groupCallLeaveButtonCompressedStyle}
        text={!compressedMode ? 'Leave' : ''}
      />
    </ControlBar>
  );
};
