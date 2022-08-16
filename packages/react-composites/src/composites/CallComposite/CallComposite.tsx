// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { _isInCall } from '@internal/calling-component-bindings';
import { OnRenderAvatarCallback, ParticipantMenuItemsCallback } from '@internal/react-components';
import React, { useEffect, useMemo } from 'react';
import { AvatarPersonaDataCallback } from '../common/AvatarPersona';
import { BaseProvider, BaseCompositeProps } from '../common/BaseComposite';
import { CallCompositeIcons } from '../common/icons';
import { useLocale } from '../localization';
import { CallAdapter } from './adapter/CallAdapter';
import { CallAdapterProvider, useAdapter } from './adapter/CallAdapterProvider';
import { CallPage } from './pages/CallPage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { NoticePage } from './pages/NoticePage';
import { useSelector } from './hooks/useSelector';
import { getPage } from './selectors/baseSelectors';
import { LobbyPage } from './pages/LobbyPage';
import { mainScreenContainerStyleDesktop, mainScreenContainerStyleMobile } from './styles/CallComposite.styles';
import { CallControlOptions } from './types/CallControlOptions';

/* @conditional-compile-remove(rooms) */
import { _PermissionsProvider, Role, _getPermissions } from '@internal/react-components';
/* @conditional-compile-remove(one-to-n-calling) */
import { LayerHost, mergeStyles } from '@fluentui/react';
/* @conditional-compile-remove(one-to-n-calling) */
import { modalLayerHostStyle } from '../common/styles/ModalLocalAndRemotePIP.styles';
/* @conditional-compile-remove(one-to-n-calling) */
import { useId } from '@fluentui/react-hooks';
/* @conditional-compile-remove(one-to-n-calling) */ /* @conditional-compile-remove(PSTN-calls) */
import { HoldPage } from './pages/HoldPage';

/**
 * Props for {@link CallComposite}.
 *
 * @public
 */
export interface CallCompositeProps extends BaseCompositeProps<CallCompositeIcons> {
  /**
   * An adapter provides logic and data to the composite.
   * Composite can also be controlled using the adapter.
   */
  adapter: CallAdapter;
  /**
   * Optimizes the composite form factor for either desktop or mobile.
   * @remarks `mobile` is currently only optimized for Portrait mode on mobile devices and does not support landscape.
   * @defaultValue 'desktop'
   */
  formFactor?: 'desktop' | 'mobile';
  /**
   * URL to invite new participants to the current call. If this is supplied, a button appears in the Participants
   * Button flyout menu.
   */
  callInvitationUrl?: string;
  /**
   * Flags to enable/disable or customize UI elements of the {@link CallComposite}.
   */
  options?: CallCompositeOptions;

  /* @conditional-compile-remove(rooms) */
  /**
   * Set this to enable/disable capacities for different roles
   */
  role?: Role;
}

/**
 * Optional features of the {@link CallComposite}.
 *
 * @public
 */
export type CallCompositeOptions = {
  /**
   * Surface Azure Communication Services backend errors in the UI with {@link @azure/communication-react#ErrorBar}.
   * Hide or show the error bar.
   * @defaultValue true
   */
  errorBar?: boolean;
  /**
   * Hide or Customize the control bar element.
   * Can be customized by providing an object of type {@link @azure/communication-react#CallControlOptions}.
   * @defaultValue true
   */
  callControls?: boolean | CallControlOptions;
};

type MainScreenProps = {
  mobileView: boolean;
  /* @conditional-compile-remove(one-to-n-calling) */
  modalLayerHostId: string;
  onRenderAvatar?: OnRenderAvatarCallback;
  callInvitationUrl?: string;
  onFetchAvatarPersonaData?: AvatarPersonaDataCallback;
  onFetchParticipantMenuItems?: ParticipantMenuItemsCallback;
  options?: CallCompositeOptions;
  /* @conditional-compile-remove(rooms) */
  role?: Role;
};

const MainScreen = (props: MainScreenProps): JSX.Element => {
  const { callInvitationUrl, onRenderAvatar, onFetchAvatarPersonaData, onFetchParticipantMenuItems } = props;
  const page = useSelector(getPage);

  const adapter = useAdapter();
  const locale = useLocale();

  let pageElement: JSX.Element;
  switch (page) {
    case 'configuration':
      pageElement = (
        <ConfigurationPage
          mobileView={props.mobileView}
          startCallHandler={(): void => {
            adapter.joinCall();
          }}
        />
      );
      break;
    case 'accessDeniedTeamsMeeting':
      pageElement = (
        <NoticePage
          iconName="NoticePageAccessDeniedTeamsMeeting"
          title={locale.strings.call.failedToJoinTeamsMeetingReasonAccessDeniedTitle}
          moreDetails={locale.strings.call.failedToJoinTeamsMeetingReasonAccessDeniedMoreDetails}
          dataUiId={'access-denied-teams-meeting-page'}
        />
      );
      break;
    case 'removedFromCall':
      pageElement = (
        <NoticePage
          iconName="NoticePageRemovedFromCall"
          title={locale.strings.call.removedFromCallTitle}
          moreDetails={locale.strings.call.removedFromCallMoreDetails}
          dataUiId={'removed-from-call-page'}
        />
      );
      break;
    case 'joinCallFailedDueToNoNetwork':
      pageElement = (
        <NoticePage
          iconName="NoticePageJoinCallFailedDueToNoNetwork"
          title={locale.strings.call.failedToJoinCallDueToNoNetworkTitle}
          moreDetails={locale.strings.call.failedToJoinCallDueToNoNetworkMoreDetails}
          dataUiId={'join-call-failed-due-to-no-network-page'}
        />
      );
      break;
    case 'leftCall':
      pageElement = (
        <NoticePage
          iconName="NoticePageLeftCall"
          title={locale.strings.call.leftCallTitle}
          moreDetails={locale.strings.call.leftCallMoreDetails}
          dataUiId={'left-call-page'}
        />
      );
      break;
    case 'lobby':
      pageElement = (
        <LobbyPage
          mobileView={props.mobileView}
          /* @conditional-compile-remove(one-to-n-calling) */
          modalLayerHostId={props.modalLayerHostId}
          options={props.options}
        />
      );
      break;
    case 'call':
      pageElement = (
        <CallPage
          onRenderAvatar={onRenderAvatar}
          callInvitationURL={callInvitationUrl}
          onFetchAvatarPersonaData={onFetchAvatarPersonaData}
          onFetchParticipantMenuItems={onFetchParticipantMenuItems}
          mobileView={props.mobileView}
          /* @conditional-compile-remove(one-to-n-calling) */
          modalLayerHostId={props.modalLayerHostId}
          options={props.options}
        />
      );
      break;
    /* @conditional-compile-remove(PSTN-calls) */ /* @conditional-compile-remove(one-to-n-calling) */
    case holdPageTrampoline():
      pageElement = (
        <>
          {
            /* @conditional-compile-remove(PSTN-calls) */ /* @conditional-compile-remove(one-to-n-calling) */ <HoldPage
              mobileView={props.mobileView}
              modalLayerHostId={props.modalLayerHostId}
              options={props.options}
            />
          }
        </>
      );
      break;
    default:
      throw new Error('Invalid call composite page');
  }
  /* @conditional-compile-remove(rooms) */
  const permissions = _getPermissions(props.role);

  // default retElement for stable version
  let retElement = pageElement;
  /* @conditional-compile-remove(rooms) */
  retElement = <_PermissionsProvider permissions={permissions}>{pageElement}</_PermissionsProvider>;

  return retElement;
};

/**
 * A customizable UI composite for calling experience.
 *
 * @remarks Call composite min width/height are as follow:
 * - mobile: 17.5rem x 21rem (280px x 336px, with default rem at 16px)
 * - desktop: 30rem x 22rem (480px x 352px, with default rem at 16px)
 *
 * @public
 */
export const CallComposite = (props: CallCompositeProps): JSX.Element => {
  const {
    adapter,
    callInvitationUrl,
    onFetchAvatarPersonaData,
    onFetchParticipantMenuItems,
    options,
    formFactor = 'desktop',
    /* @conditional-compile-remove(rooms) */
    role
  } = props;
  useEffect(() => {
    (async () => {
      await adapter.askDevicePermission({ video: true, audio: true });
      adapter.queryCameras();
      adapter.queryMicrophones();
      adapter.querySpeakers();
    })();
  }, [adapter]);

  const mobileView = formFactor === 'mobile';

  /* @conditional-compile-remove(one-to-n-calling) */
  const modalLayerHostId = useId('modalLayerhost');

  const mainScreenContainerClassName = useMemo(() => {
    return mobileView ? mainScreenContainerStyleMobile : mainScreenContainerStyleDesktop;
  }, [mobileView]);

  return (
    <div className={mainScreenContainerClassName}>
      <BaseProvider {...props}>
        <CallAdapterProvider adapter={adapter}>
          <MainScreen
            callInvitationUrl={callInvitationUrl}
            onFetchAvatarPersonaData={onFetchAvatarPersonaData}
            onFetchParticipantMenuItems={onFetchParticipantMenuItems}
            mobileView={mobileView}
            /* @conditional-compile-remove(one-to-n-calling) */
            modalLayerHostId={modalLayerHostId}
            options={options}
            /* @conditional-compile-remove(rooms) */
            role={role}
          />
          {
            // This layer host is for ModalLocalAndRemotePIP in CallPane. This LayerHost cannot be inside the CallPane
            // because when the CallPane is hidden, ie. style property display is 'none', it takes up no space. This causes problems when dragging
            // the Modal because the draggable bounds thinks it has no space and will always return to its initial position after dragging.
            // Additionally, this layer host cannot be in the Call Arrangement as it needs to be rendered before useMinMaxDragPosition() in
            // common/utils useRef is called.
            // Warning: this is fragile and works because the call arrangement page is only rendered after the call has connected and thus this LayerHost will be guaranteed to have rendered (and subsequently mounted in the DOM). This ensures the DOM element will be available before the call to `document.getElementById(modalLayerHostId)` is made.
            /* @conditional-compile-remove(one-to-n-calling) */
            mobileView && <LayerHost id={modalLayerHostId} className={mergeStyles(modalLayerHostStyle)} />
          }
        </CallAdapterProvider>
      </BaseProvider>
    </div>
  );
};

const holdPageTrampoline = (): string => {
  /* @conditional-compile-remove(one-to-n-calling) */
  /* @conditional-compile-remove(PSTN-calls) */
  return 'hold';
  return 'call';
};
