// © Microsoft Corporation. All rights reserved.

import React, { useState } from 'react';
import {
  connectFuncsToContext,
  MapToCallConfigurationProps,
  SetupContainerProps,
  LocalSettings,
  CallConfiguration
} from '@azure/communication-ui';
import { localStorageAvailable } from './utils/constants';
import { saveDisplayNameToLocalStorage } from './utils/AppUtils';
import { DisplayNameField } from './DisplayNameField';
import { StartCallButton } from './StartCallButton';

export interface ConfigurationScreenProps extends SetupContainerProps {
  screenWidth: number;
  startCallHandler(): void;
  groupId: string;
}

export const ConfigurationComponent = (props: ConfigurationScreenProps): JSX.Element => {
  const { displayName, updateDisplayName, startCallHandler, joinCall, groupId } = props;
  const [emptyWarning, setEmptyWarning] = useState(false);
  const [nameTooLongWarning, setNameTooLongWarning] = useState(false);

  return (
    <CallConfiguration {...props}>
      <DisplayNameField
        setName={updateDisplayName}
        defaultName={displayName}
        setEmptyWarning={setEmptyWarning}
        isEmpty={emptyWarning}
        isNameLengthExceedLimit={nameTooLongWarning}
        setNameLengthExceedLimit={setNameTooLongWarning}
      />
      <div>
        <LocalSettings />
      </div>
      <div>
        <StartCallButton
          onClickHandler={() => {
            if (localStorageAvailable) {
              saveDisplayNameToLocalStorage(displayName);
            }
            startCallHandler();
            joinCall(groupId);
          }}
          isDisabled={!displayName || emptyWarning || nameTooLongWarning}
        />
      </div>
    </CallConfiguration>
  );
};

export default connectFuncsToContext(ConfigurationComponent, MapToCallConfigurationProps);
