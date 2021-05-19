// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import { CallVideoOffIcon } from '@fluentui/react-icons-northstar';
import { Stack, Text } from '@fluentui/react';
import { localPreviewContainerStyle, cameraOffLabelStyle, localPreviewTileStyle } from './styles/LocalPreview.styles';
import { CameraButton, ControlBar, MicrophoneButton, StreamMedia, VideoTile } from 'react-components';
import { useSelector } from './hooks/useSelector';
import { usePropsFor } from './hooks/usePropsFor';
import { localPreviewSelector } from '@azure/acs-calling-selector';
import { CallClientProvider } from 'react-composites';

const onRenderPlaceholder = (): JSX.Element => {
  return (
    <Stack style={{ width: '100%', height: '100%' }} verticalAlign="center">
      <Stack.Item align="center">
        <CallVideoOffIcon />
      </Stack.Item>
      <Stack.Item align="center">
        <Text className={cameraOffLabelStyle}>Your camera is turned off</Text>
      </Stack.Item>
    </Stack>
  );
};

export const LocalPreview = (): JSX.Element => {
  const cameraButtonProps = usePropsFor(CameraButton);
  const microphoneButtonProps = usePropsFor(MicrophoneButton);
  const localPreviewProps = useSelector(localPreviewSelector);
  const { setIsCallStartedWithCameraOn } = CallClientProvider.useCallClientContext();

  return (
    <Stack className={localPreviewContainerStyle}>
      <VideoTile
        userId={'LocalUser'}
        styles={localPreviewTileStyle}
        isVideoReady={!!localPreviewProps.videoStreamElement}
        renderElement={<StreamMedia videoStreamElement={localPreviewProps.videoStreamElement} />}
        onRenderPlaceholder={onRenderPlaceholder}
      >
        <ControlBar layout="floatingBottom">
          <CameraButton
            {...cameraButtonProps}
            onToggleCamera={async () => {
              setIsCallStartedWithCameraOn(!cameraButtonProps.checked);
              cameraButtonProps.onToggleCamera();
            }}
          />
          <MicrophoneButton {...microphoneButtonProps} />
        </ControlBar>
      </VideoTile>
    </Stack>
  );
};
