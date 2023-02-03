// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { VideoGallery as VideoGalleryComponent } from '@azure/communication-react';
import { Image, Text } from '@fluentui/react';
import { ArgsTable, Canvas, Description, Heading, Source, Subheading, Title } from '@storybook/addon-docs';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { yellowBannerPalette } from '../BetaBanners/BannerPalettes';
import { DetailedBetaBanner } from '../BetaBanners/DetailedBetaBanner';
import { StorybookBanner } from '../BetaBanners/StorybookBanner';

import { COMPONENT_FOLDER_PREFIX } from '../constants';
import { controlsToAdd, hiddenControl } from '../controlsUtils';
import { CustomAvatarVideoGalleryExample } from './snippets/CustomAvatar.snippet';
import { CustomStyleVideoGalleryExample } from './snippets/CustomStyle.snippet';
import { DefaultVideoGalleryExample } from './snippets/Default.snippet';
import { FloatingLocalVideoExample } from './snippets/FloatingLocalVideo.snippet';
import { LocalCameraSwitcherExample } from './snippets/LocalCameraSwitcher.snippet';
import { ManagedPinnedParticipantsExample } from './snippets/ManagedPinnedParticipants.snippet';
import { MobileWrapper } from './snippets/MobileWrapper';
import { PinnedParticipantsDisabledExample } from './snippets/PinnedParticipantsDisabled.snippet';
import { PinnedParticipantsMobileExample } from './snippets/PinnedParticipantsMobile.snippet';
import { ScreenSharingFromPresenterExample } from './snippets/ScreenSharingFromPresenter.snippet';
import { ScreenSharingFromViewerExample } from './snippets/ScreenSharingFromViewer.snippet';
import { WithHorizontalGalleryExample } from './snippets/WithHorizontalGallery.snippet';

const CustomAvatarVideoGalleryExampleText = require('!!raw-loader!./snippets/CustomAvatar.snippet.tsx').default;
const CustomStyleVideoGalleryExampleText = require('!!raw-loader!./snippets/CustomStyle.snippet.tsx').default;
const DefaultVideoGalleryExampleText = require('!!raw-loader!./snippets/Default.snippet.tsx').default;
const FloatingLocalVideoExampleText = require('!!raw-loader!./snippets/FloatingLocalVideo.snippet.tsx').default;
const LocalVideoCameraCycleButtonExampleText =
  require('!!raw-loader!./snippets/LocalCameraSwitcher.snippet.tsx').default;
const ManagedPinnedParticipantsExampleText =
  require('!!raw-loader!./snippets/ManagedPinnedParticipants.snippet.tsx').default;
const PinnedParticipantsDisabledExampleText =
  require('!!raw-loader!./snippets/PinnedParticipantsDisabled.snippet.tsx').default;
const PinnedParticipantsMobileExampleText =
  require('!!raw-loader!./snippets/PinnedParticipantsMobile.snippet.tsx').default;
const ScreenSharingFromPresenterExampleText =
  require('!!raw-loader!./snippets/ScreenSharingFromPresenter.snippet.tsx').default;
const ScreenSharingFromViewerExampleText =
  require('!!raw-loader!./snippets/ScreenSharingFromViewer.snippet.tsx').default;
const WithHorizontalGalleryExampleText = require('!!raw-loader!./snippets/WithHorizontalGallery.snippet.tsx').default;

const importStatement = `import { VideoGallery } from '@azure/communication-react';`;

const getDocs: () => JSX.Element = () => {
  return (
    <>
      <Title>VideoGallery</Title>
      <Description>
        VideoGallery lays out the local user and each remote participant in a call in a
        [VideoTile](./?path=/docs/ui-components-videotile--video-tile) component. The VideoGallery component is made up
        of a [Grid Layout](./?path=/docs/ui-components-videogallery--video-gallery#grid-layout), [Horizontal
        Gallery](./?path=/docs/ui-components-videogallery--video-gallery#grid-layout), and a [Local Video
        Tile](./?path=/docs/ui-components-videogallery--video-gallery#local-video-tile). The logic used to place each
        [VideoTile](./?path=/docs/ui-components-videotile--video-tile) component into which section is explained below.
      </Description>

      <Heading>Importing</Heading>
      <Source code={importStatement} />

      <Heading>Grid Layout</Heading>
      <Description>
        If there are no remote video streams on, all participants are placed in the [Grid
        Layout](./?path=/docs/ui-components-gridlayout--grid-layout) including the local user. Otherwise, only remote
        participants with their video streams on are placed in the Grid Layout upto a max of `maxRemoteVideoStreams`.
        The remaining participants are placed in the Horizontal Gallery.
      </Description>
      <Canvas mdxSource={DefaultVideoGalleryExampleText}>
        <DefaultVideoGalleryExample />
      </Canvas>
      <Description>
        Note: The `maxRemoteVideoStreams` prop limits the number of remote video streams in the
        [GridLayout](./?path=/docs/ui-components-gridlayout--grid-layout). If the number of remote participants with
        their video stream on exceeds `maxRemoteVideoStreams` then remote participants in the `dominantSpeakers` prop
        will be prioritized. Furthermore, the VideoGallery is designed to limit the re-ordering when the
        `dominantSpeakers` prop is changed.
      </Description>

      <Heading>Horizontal Gallery</Heading>
      <Description>
        The remote participants not in the Grid Layout are placed in a Horizontal Gallery in the lower section. A gif
        element is used to simulate a remote video stream to move the other remote participants to the Horizontal
        Gallery in the example below.
      </Description>
      <Canvas mdxSource={WithHorizontalGalleryExampleText}>
        <WithHorizontalGalleryExample />
      </Canvas>

      <Heading>Local Video Tile</Heading>
      <Description>
        By default, the local video tile is placed in the Grid Layout. But the local video tile can be placed in a
        floating and draggable video tile in the bottom right corner by setting the `layout` prop to
        &apos;floatingLocalVideo&apos;.
      </Description>
      <Canvas mdxSource={FloatingLocalVideoExampleText}>
        <FloatingLocalVideoExample />
      </Canvas>

      <Heading>Screen Sharing Experience</Heading>
      <Description>
        The screen shared is the only element placed in the GridLayout and all remote participants are placed in the
        horizontal gallery in the lower section. To be able to view this screen share, the sharing participant should
        have their `isScreenSharingOn` prop set to true as well as a defined `screenShareStream` prop (see
        `localParticipant` and `remoteParticipants` props).
      </Description>
      <Subheading>From a presenter point of view</Subheading>
      <Canvas mdxSource={ScreenSharingFromPresenterExampleText}>
        <ScreenSharingFromPresenterExample />
      </Canvas>
      <Subheading>From a viewer point of view</Subheading>
      <Description>
        Note that in this example, we substitute the screenshare video stream with an image just for mocking experience.
      </Description>
      <Canvas mdxSource={ScreenSharingFromViewerExampleText}>
        <ScreenSharingFromViewerExample />
      </Canvas>

      <Heading>Custom Avatar</Heading>
      <Description>
        Rendering of avatars can be customized through the VideoGallery callback `onRenderAvatar`.
      </Description>
      <Canvas mdxSource={CustomAvatarVideoGalleryExampleText}>
        <CustomAvatarVideoGalleryExample />
      </Canvas>

      <Heading>Custom Style</Heading>
      <Description>
        Style of the VideoGallery container can be customized through its `styles` prop. The `styles` prop is a
        `VideoGalleryStyles` type with subproperties for each part of the VideoGallery as shown in the example below.
      </Description>
      <Canvas mdxSource={CustomStyleVideoGalleryExampleText}>
        <CustomStyleVideoGalleryExample />
      </Canvas>

      <Heading>Local Video Camera Button</Heading>
      <DetailedBetaBanner />
      <Description>
        The VideoGallery can take in customization to allow for the introduction of local camera controls where the
        button will cycle through the different camera's in the users device. Typical usage is to enable this button on
        mobile devices. This button is enabled through the use of the `showCameraSwitcherInLocalPreview` prop.
      </Description>
      <StorybookBanner palette={yellowBannerPalette}>
        <Text style={{ display: 'inline-block' }}>
          This feature when enabled will disable the ability to drag the local video tile around the video gallery.
        </Text>
      </StorybookBanner>
      <Canvas mdxSource={LocalVideoCameraCycleButtonExampleText}>
        <LocalCameraSwitcherExample />
      </Canvas>

      <Heading>Remote video tile contextual menu</Heading>
      <DetailedBetaBanner />
      <Description>
        The VideoGallery provides a contextual menu for each remote video tile which can be accessed by hovering the
        remote video tile and clicking menu button next to the participant display name. You can try it out in any of
        the above VideoGallery components on this Docs page. The pin/unpin menu item will be available by default to
        allow pinning participants. To learn more about pinning participants go to the Pinning Participants section
        below. Menu items to change remote video stream rendering options are also available when the `useProps` hook is
        used to provide the props to VideoGallery.
      </Description>
      <Subheading>Disabling remote video tile contextual menu</Subheading>
      <Description>
        Remote video tile contextual menu is be enabled by default but can be disabled by setting the
        `remoteVideoTileMenu` prop to false like in the example below.
      </Description>
      <Canvas mdxSource={PinnedParticipantsDisabledExampleText}>
        <PinnedParticipantsDisabledExample />
      </Canvas>

      <Heading>Pinning Participants</Heading>
      <DetailedBetaBanner />
      <Description>
        The contextual menu will have a menu item to pin a participant's video tile such that only pinned participants
        are shown in the GridLayout. This is shown in the video clip below. Pinned participants will be shown in the
        order that they are pinned.
      </Description>
      <video width="90%" controls>
        <source src="videos/video-gallery-pinning.mp4" type="video/mp4" />
        Your browser does not support the video element.
      </video>
      <Description>
        When screensharing is active, pinned participants are placed first in the horizontal gallery as shown in video
        clip below.
      </Description>
      <video width="90%" controls>
        <source src="videos/video-gallery-pinning-with-screenshare.mp4" type="video/mp4" />
        Your browser does not support the video element.
      </video>
      <Description>
        Pinned participants can be unpinned through the contextual menu as shown in the video clip below.
      </Description>
      <video width="90%" controls>
        <source src="videos/video-gallery-unpinning.mp4" type="video/mp4" />
        Your browser does not support the video element.
      </video>
      <Description>
        The maximum pinned participants is currently set to 4 for the VideoGallery. The pin menu item will be disabled
        when this limit is reached as shown in the screenshot below.
      </Description>
      <Image
        style={{ width: '90%' }}
        /* set an approximate default height to avoid reflow when the image loads */ src="images/pinned-limit-reached-video-gallery.png"
        alt="Disabled pin menu item in VideoGallery when limit reached"
      />
      <Subheading>Pinning participants via long touch for mobile</Subheading>
      <Description>
        The VideoGallery also caters to pinning participants on mobile by setting the prop `remoteVideoTileMenuOptions`
        to object `&#123; kind: 'drawer' &#125;`. This changes the contextual menu to a drawer menu that is opened via
        long touch. The result is demonstrated in the example below where all mouse clicks are converted to touch to
        simulate a mobile browser. You can simulate a long touch by long clicking a remote video tile below to see that
        a drawer menu will appear.
      </Description>
      <Canvas mdxSource={PinnedParticipantsMobileExampleText}>
        <MobileWrapper>
          <PinnedParticipantsMobileExample />
        </MobileWrapper>
      </Canvas>
      <Subheading>Managing the pinned participants state</Subheading>
      <Description>
        The state of which remote participants are pinned can be managed by defining the value of the
        `pinnedParticipants` prop. But the callback props `onPinParticipant` and `onUnpinParticipant` must be defined to
        update the managed state. In the example below, the pinned participants state is managed outside of the
        VideoGallery component using a `useState` hook . The display names of the pinned participants are shown in text
        above the VideoGallery.
      </Description>
      <Canvas mdxSource={ManagedPinnedParticipantsExampleText}>
        <ManagedPinnedParticipantsExample />
      </Canvas>

      <Heading>Props</Heading>
      <ArgsTable of={VideoGalleryComponent} />
    </>
  );
};

const MockLocalParticipant = {
  userId: 'user1',
  displayName: 'You',
  state: 'Connected',
  isMuted: true,
  isScreenSharingOn: false
};

const VideoGalleryStory = (args): JSX.Element => {
  const remoteParticipants = args.remoteParticipants
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p)
    .map((p, i) => {
      return {
        userId: `user${i}`,
        displayName: p,
        videoStream: { isAvailable: true }
      };
    });

  const localParticipant = MockLocalParticipant;
  localParticipant.isScreenSharingOn = args.screenShareExperience === 'presenter';

  if (remoteParticipants.length > 0) {
    remoteParticipants[0].isScreenSharingOn = args.screenShareExperience === 'viewer';

    if (args.screenShareExperience === 'viewer') {
      const mockVideoElement = document.createElement('div');
      mockVideoElement.style.width = '100%';
      mockVideoElement.style.height = '100%';
      mockVideoElement.style.textAlign = 'center';
      const imageElement = document.createElement('img');
      imageElement.src = 'images/screenshare-example.png';
      imageElement.style.maxWidth = decodeURIComponent('100%25');
      imageElement.style.maxHeight = decodeURIComponent('100%25');
      mockVideoElement.appendChild(imageElement);
      const mockScreenShareStream = {
        isAvailable: true,
        renderElement: mockVideoElement as HTMLElement
      };
      remoteParticipants[0].screenShareStream = mockScreenShareStream;
    }
  }

  return (
    <VideoGalleryComponent
      layout={args.layout}
      localParticipant={MockLocalParticipant}
      remoteParticipants={remoteParticipants}
    />
  );
};

// This must be the only named export from this module, and must be named to match the storybook path suffix.
// This ensures that storybook hoists the story instead of creating a folder with a single entry.
export const VideoGallery = VideoGalleryStory.bind({});

export default {
  id: `${COMPONENT_FOLDER_PREFIX}-videogallery`,
  title: `${COMPONENT_FOLDER_PREFIX}/Video Gallery`,
  component: VideoGalleryComponent,
  argTypes: {
    remoteParticipants: controlsToAdd.remoteParticipantNames,
    layout: controlsToAdd.videoGallerylayout,
    screenShareExperience: controlsToAdd.screenShareExperience,
    // Hiding auto-generated controls
    styles: hiddenControl,
    localParticipant: hiddenControl,
    localVideoViewOptions: hiddenControl,
    remoteVideoViewOption: hiddenControl,
    onCreateLocalStreamView: hiddenControl,
    onDisposeLocalStreamView: hiddenControl,
    onRenderLocalVideoTile: hiddenControl,
    onCreateRemoteStreamView: hiddenControl,
    onRenderRemoteVideoTile: hiddenControl,
    onDisposeRemoteStreamView: hiddenControl,
    onRenderAvatar: hiddenControl,
    showMuteIndicator: hiddenControl,
    dominantSpeakers: hiddenControl,
    strings: hiddenControl,
    maxRemoteVideoStreams: hiddenControl,
    pinnedParticipants: hiddenControl,
    onPinParticipant: hiddenControl,
    onUnpinParticipant: hiddenControl
  },
  parameters: {
    docs: {
      page: () => getDocs()
    }
  }
} as Meta;
