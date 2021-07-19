// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import { MicOn20Filled, MicOff20Filled } from '@fluentui/react-icons';
import { useLocale } from '../localization';
import { ControlBarButton, ControlBarButtonProps } from './ControlBarButton';

/**
 * Strings of MicrophoneButton that can be overridden
 */
export interface MicrophoneButtonStrings {
  /** Label when button is on. */
  onLabel: string;
  /** Label when button is off. */
  offLabel: string;
}

/**
 * Props for MicrophoneButton component
 */
export interface MicrophoneButtonProps extends ControlBarButtonProps {
  /**
   * Utility property for using this component with `communication react eventHandlers`.
   * Maps directly to the `onClick` property.
   */
  onToggleMicrophone?: () => Promise<void>;

  /**
   * Optional strings to override in component
   */
  strings?: Partial<MicrophoneButtonStrings>;
}

const onRenderMicOnIcon = (): JSX.Element => <MicOn20Filled primaryFill="currentColor" key={'microphoneIconKey'} />;
const onRenderMicOffIcon = (): JSX.Element => (
  <MicOff20Filled primaryFill="currentColor" key={'microphoneOffIconKey'} />
);

/**
 * `MicrophoneButton` allows you to easily create a component for rendering an audio button. It can be used in your ControlBar component for example.
 * @param props - of type MicrophoneButtonProps
 */
export const MicrophoneButton = (props: MicrophoneButtonProps): JSX.Element => {
  const localeStrings = useLocale().strings.microphoneButton;
  const strings = { ...localeStrings, ...props.strings };

  return (
    <ControlBarButton
      {...props}
      onClick={props.onToggleMicrophone ?? props.onClick}
      onRenderOnIcon={props.onRenderOnIcon ?? onRenderMicOnIcon}
      onRenderOffIcon={props.onRenderOffIcon ?? onRenderMicOffIcon}
      strings={strings}
      labelKey={props.labelKey ?? 'microphoneButtonLabel'}
    />
  );
};
