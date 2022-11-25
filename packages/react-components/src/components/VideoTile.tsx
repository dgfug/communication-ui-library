// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Icon, IStyle, mergeStyles, Persona, Stack, Text, IIconProps } from '@fluentui/react';
/* @conditional-compile-remove(pinned-participants) */
import { MoreHorizontal20Filled } from '@fluentui/react-icons';
import { Ref } from '@fluentui/react-northstar';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useIdentifiers } from '../identifiers';
import { ComponentLocale, useLocale } from '../localization';
import { useTheme } from '../theming';
import { BaseCustomStyles, CustomAvatarOptions, OnRenderAvatarCallback } from '../types';
/* @conditional-compile-remove(one-to-n-calling) */
/* @conditional-compile-remove(PSTN-calls) */
import { ParticipantState } from '../types';
import {
  disabledVideoHint,
  displayNameStyle,
  iconContainerStyle,
  overlayContainerStyles,
  rootStyles,
  videoContainerStyles,
  videoHint,
  tileInfoContainerStyle,
  participantStateStringStyles
} from './styles/VideoTile.styles';
/* @conditional-compile-remove(pinned-participants) */
import { pinIconStyle, menuButtonStyles } from './styles/VideoTile.styles';
import { getVideoTileOverrideColor } from './utils/videoTileStylesUtils';
/* @conditional-compile-remove(pinned-participants) */
import { DefaultButton, concatStyleSets, DirectionalHint } from '@fluentui/react';
/* @conditional-compile-remove(pinned-participants) */
import { mapMenuItemsToContextualMenuItems } from './utils';
/* @conditional-compile-remove(pinned-participants) */
import useLongPress from './utils/useLongPress';

/**
 * Strings of {@link VideoTile} that can be overridden.
 * @beta
 */
export interface VideoTileStrings {
  participantStateConnecting: string;
  participantStateRinging: string;
  participantStateHold: string;
}

/**
 * Fluent styles for {@link VideoTile}.
 *
 * @public
 */
export interface VideoTileStylesProps extends BaseCustomStyles {
  /** Styles for video container. */
  videoContainer?: IStyle;
  /** Styles for container overlayed on the video container. */
  overlayContainer?: IStyle;
  /** Styles for displayName on the video container. */
  displayNameContainer?: IStyle;
}

/**
 * Props for {@link VideoTile}.
 *
 * @public
 */
export interface VideoTileProps {
  /** React Child components. Child Components will show as overlay component in the VideoTile. */
  children?: React.ReactNode;
  /**
   * Allows users to pass in an object contains custom CSS styles.
   * @Example
   * ```
   * <VideoTile styles={{ root: { background: 'blue' } }} />
   * ```
   */
  styles?: VideoTileStylesProps;
  /** user id for the VideoTile placeholder. */
  userId?: string;
  /** Component with the video stream. */
  renderElement?: JSX.Element | null;
  /** Determines if the video is mirrored or not. */
  isMirrored?: boolean;
  /** Custom render Component function for no video is available. Render a Persona Icon if undefined. */
  onRenderPlaceholder?: OnRenderAvatarCallback;
  /**
   * Show label on the VideoTile
   * @defaultValue true
   */
  showLabel?: boolean;
  /**
   * Whether to display a mute icon beside the user's display name.
   * @defaultValue true
   */
  showMuteIndicator?: boolean;
  /**
   * Whether the video is muted or not.
   */
  isMuted?: boolean;
  /* @conditional-compile-remove(pinned-participants) */
  /**
   * Display custom menu items in the VideoTile's contextual menu.
   */
  menuItems?: VideoTileMenuItems;
  /* @conditional-compile-remove(pinned-participants) */
  /**
   * If true, the video tile will show the pin icon.
   */
  isPinned?: boolean;
  /**
   * Display Name of the Participant to be shown in the label.
   * @remarks `displayName` is used to generate avatar initials if `initialsName` is not provided.
   */
  displayName?: string;
  /**
   * Name of the participant used to generate initials. For example, a name `John Doe` will display `JD` as initials.
   * @remarks `displayName` is used if this property is not specified.
   */
  initialsName?: string;
  /**
   * Minimum size of the persona avatar in px.
   * The persona avatar is the default placeholder shown when no video stream is available.
   * For more information see https://developer.microsoft.com/en-us/fluentui#/controls/web/persona
   * @defaultValue 32px
   */
  personaMinSize?: number;
  /**
   * Maximum size of the personal avatar in px.
   * The persona avatar is the default placeholder shown when no video stream is available.
   * For more information see https://developer.microsoft.com/en-us/fluentui#/controls/web/persona
   * @defaultValue 100px
   */
  personaMaxSize?: number;
  /** Optional property to set the aria label of the video tile if there is no available stream. */
  noVideoAvailableAriaLabel?: string;
  /** Whether the participant in the videoTile is speaking. Shows a speaking indicator (border). */
  isSpeaking?: boolean;

  /* @conditional-compile-remove(one-to-n-calling) */
  /* @conditional-compile-remove(PSTN-calls) */
  /**
   * The call connection state of the participant.
   * For example, `Hold` means the participant is on hold.
   */
  participantState?: ParticipantState;
  /* @conditional-compile-remove(one-to-n-calling) */
  /* @conditional-compile-remove(PSTN-calls) */
  strings?: VideoTileStrings;

  /* @conditional-compile-remove(pinned-participants) */
  /**
   * Callback triggered by video tile on touch and hold.
   */
  onLongTouch?: () => void;
}

// Coin max size is set to PersonaSize.size100
const DEFAULT_PERSONA_MAX_SIZE_PX = 100;
// Coin min size is set PersonaSize.size32
const DEFAULT_PERSONA_MIN_SIZE_PX = 32;

const DefaultPlaceholder = (props: CustomAvatarOptions): JSX.Element => {
  const { text, noVideoAvailableAriaLabel, coinSize, hidePersonaDetails } = props;

  return (
    <Stack className={mergeStyles({ position: 'absolute', height: '100%', width: '100%' })}>
      <Stack styles={defaultPersonaStyles}>
        <Persona
          coinSize={coinSize}
          hidePersonaDetails={hidePersonaDetails}
          text={text ?? ''}
          initialsTextColor="white"
          aria-label={noVideoAvailableAriaLabel ?? ''}
          showOverflowTooltip={false}
        />
      </Stack>
    </Stack>
  );
};

/**
 * @beta
 * MenuItems to be diplayed in video tile in the contextual/drawer menu
 */
export type VideoTileMenuItems = Array<{
  key: string;
  ariaLabel?: string;
  text: string;
  onClick: () => void;
  iconProps: IIconProps;
}>;

/* @conditional-compile-remove(pinned-participants) */
const menuIcon = (): JSX.Element => <MoreHorizontal20Filled primaryFill="currentColor" />;

const defaultPersonaStyles = { root: { margin: 'auto', maxHeight: '100%' } };

/* @conditional-compile-remove(pinned-participants) */
const VideoTileMoreOptionsButton = (props: { menuItems?: VideoTileMenuItems; menuStyles?: IStyle }): JSX.Element => {
  const { menuItems, menuStyles } = props;
  if (!menuItems || menuItems.length === 0) {
    return <></>;
  }
  return (
    <DefaultButton
      styles={concatStyleSets(menuButtonStyles, menuStyles ?? {})}
      onRenderIcon={menuIcon}
      menuIconProps={{ hidden: true }}
      menuProps={{ items: mapMenuItemsToContextualMenuItems(menuItems), directionalHint: DirectionalHint.topRightEdge }}
    />
  );
};

/**
 * A component to render the video stream for a single call participant.
 *
 * Use with {@link GridLayout} in a {@link VideoGallery}.
 *
 * @public
 */
export const VideoTile = (props: VideoTileProps): JSX.Element => {
  const {
    children,
    displayName,
    initialsName,
    isMirrored,
    isMuted,
    /* @conditional-compile-remove(pinned-participants) */
    isPinned,
    onRenderPlaceholder,
    renderElement,
    showLabel = true,
    showMuteIndicator = true,
    styles,
    userId,
    noVideoAvailableAriaLabel,
    isSpeaking,
    /* @conditional-compile-remove(pinned-participants) */
    menuItems,
    personaMinSize = DEFAULT_PERSONA_MIN_SIZE_PX,
    personaMaxSize = DEFAULT_PERSONA_MAX_SIZE_PX
  } = props;

  const [personaSize, setPersonaSize] = useState(100);
  const videoTileRef = useRef<HTMLElement>(null);

  const locale = useLocale();
  const theme = useTheme();

  const isVideoRendered = !!renderElement;

  const observer = useRef(
    new ResizeObserver((entries): void => {
      const { width, height } = entries[0].contentRect;
      const personaSize = Math.min(width, height) / 3;
      setPersonaSize(Math.max(Math.min(personaSize, personaMaxSize), personaMinSize));
    })
  );

  useLayoutEffect(() => {
    if (videoTileRef.current) {
      observer.current.observe(videoTileRef.current);
    }
    const currentObserver = observer.current;
    return () => currentObserver.disconnect();
  }, [observer, videoTileRef]);

  /* @conditional-compile-remove(pinned-participants) */
  const useLongPressProps = useMemo(() => {
    return {
      onLongPress: () => {
        props.onLongTouch?.();
      },
      touchEventsOnly: true
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.onLongTouch]);
  /* @conditional-compile-remove(pinned-participants) */
  const longPressHandlers = useLongPress(useLongPressProps);
  const longPressHandlersTrampoline = useMemo(() => {
    /* @conditional-compile-remove(pinned-participants) */
    return longPressHandlers;
    return {};
  }, [
    /* @conditional-compile-remove(pinned-participants) */
    longPressHandlers
  ]);

  const placeholderOptions = {
    userId,
    text: initialsName || displayName,
    noVideoAvailableAriaLabel,
    coinSize: personaSize,
    styles: defaultPersonaStyles,
    hidePersonaDetails: true
  };

  const videoHintWithBorderRadius = mergeStyles(videoHint, { borderRadius: theme.effects.roundedCorner4 });

  const tileInfoStyle = useMemo(
    () =>
      mergeStyles(
        isVideoRendered ? videoHintWithBorderRadius : disabledVideoHint,
        getVideoTileOverrideColor(isVideoRendered, theme, 'neutralPrimary'),
        styles?.displayNameContainer
      ),
    [isVideoRendered, videoHintWithBorderRadius, theme, styles?.displayNameContainer]
  );

  const ids = useIdentifiers();

  const canShowLabel = showLabel && (displayName || (showMuteIndicator && isMuted));
  const participantStateString = participantStateStringTrampoline(props, locale);
  return (
    <Ref innerRef={videoTileRef}>
      <Stack
        data-ui-id={ids.videoTile}
        className={mergeStyles(
          rootStyles,
          {
            background: theme.palette.neutralLighter,
            borderRadius: theme.effects.roundedCorner4
          },
          isSpeaking && {
            '&::before': {
              content: `''`,
              position: 'absolute',
              zIndex: 1,
              border: `0.25rem solid ${theme.palette.themePrimary}`,
              borderRadius: theme.effects.roundedCorner4,
              width: '100%',
              height: '100%'
            }
          },
          styles?.root
        )}
        {...longPressHandlersTrampoline}
      >
        {isVideoRendered ? (
          <Stack
            className={mergeStyles(
              videoContainerStyles,
              isMirrored && { transform: 'scaleX(-1)' },
              styles?.videoContainer
            )}
          >
            {renderElement}
          </Stack>
        ) : (
          <Stack className={mergeStyles(videoContainerStyles)} style={{ opacity: participantStateString ? 0.4 : 1 }}>
            {onRenderPlaceholder ? (
              onRenderPlaceholder(userId ?? '', placeholderOptions, DefaultPlaceholder)
            ) : (
              <DefaultPlaceholder {...placeholderOptions} />
            )}
          </Stack>
        )}

        {(canShowLabel || participantStateString) && (
          <Stack horizontal className={tileInfoContainerStyle} tokens={tileInfoContainerTokens}>
            <Stack horizontal className={tileInfoStyle}>
              {canShowLabel && (
                <Text
                  className={mergeStyles(displayNameStyle)}
                  title={displayName}
                  style={{ color: participantStateString ? theme.palette.neutralSecondary : 'inherit' }}
                >
                  {displayName}
                </Text>
              )}
              {participantStateString && (
                <Text className={mergeStyles(participantStateStringStyles(theme))}>
                  {bracketedParticipantString(participantStateString, !!canShowLabel)}
                </Text>
              )}
              {showMuteIndicator && isMuted && (
                <Stack className={mergeStyles(iconContainerStyle)}>
                  <Icon iconName="VideoTileMicOff" />
                </Stack>
              )}
              {
                /* @conditional-compile-remove(pinned-participants) */
                <VideoTileMoreOptionsButton menuItems={menuItems} menuStyles={props.styles} />
              }
              {
                /* @conditional-compile-remove(pinned-participants) */
                isPinned && (
                  <Stack className={mergeStyles(iconContainerStyle)}>
                    <Icon iconName="VideoTilePinned" className={mergeStyles(pinIconStyle)} />
                  </Stack>
                )
              }
            </Stack>
          </Stack>
        )}

        {children && (
          <Stack className={mergeStyles(overlayContainerStyles, styles?.overlayContainer)}>{children}</Stack>
        )}
      </Stack>
    </Ref>
  );
};

const participantStateStringTrampoline = (props: VideoTileProps, locale: ComponentLocale): string | undefined => {
  /* @conditional-compile-remove(one-to-n-calling) */
  /* @conditional-compile-remove(PSTN-calls) */
  const strings = { ...locale.strings.videoTile, ...props.strings };
  /* @conditional-compile-remove(one-to-n-calling) */
  /* @conditional-compile-remove(PSTN-calls) */
  return props.participantState === 'Idle' || props.participantState === 'Connecting'
    ? strings?.participantStateConnecting
    : props.participantState === 'EarlyMedia' || props.participantState === 'Ringing'
    ? strings?.participantStateRinging
    : props.participantState === 'Hold'
    ? strings?.participantStateHold
    : undefined;

  return undefined;
};

const tileInfoContainerTokens = {
  // A horizontal Stack sets the left margin to 0 for all it's children.
  // We need to allow the children to set their own margins
  childrenGap: 'none'
};

const bracketedParticipantString = (participantString: string, withBrackets: boolean): string => {
  return withBrackets ? `(${participantString})` : participantString;
};
