// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DefaultCallingHandlers, createDefaultCallingHandlers } from 'calling-component-bindings';
import {
  CallClientState,
  StatefulDeviceManager,
  StatefulCallClient,
  createStatefulCallClient,
  DeviceManagerState,
  CallState
} from 'calling-stateful-client';
import {
  AudioOptions,
  CallAgent,
  Call,
  CallClientOptions,
  GroupCallLocator,
  TeamsMeetingLinkLocator,
  LocalVideoStream as SDKLocalVideoStream,
  AudioDeviceInfo,
  VideoDeviceInfo,
  RemoteParticipant,
  PermissionConstraints
} from '@azure/communication-calling';
import { EventEmitter } from 'events';
import {
  CallAdapter,
  CallCompositePage,
  CallEndedListener,
  CallEvent,
  CallIdChangedListener,
  CallAdapterState,
  DisplayNameChangedListener,
  IsMuteChangedListener,
  IsScreenSharingOnChangedListener,
  IsSpeakingChangedListener,
  ParticipantJoinedListener,
  ParticipantLeftListener
} from './CallAdapter';
import { createAzureCommunicationUserCredential, isInCall } from '../../../utils';
import { VideoStreamOptions } from 'react-components';
import { fromFlatCommunicationIdentifier, toFlatCommunicationIdentifier } from 'acs-ui-common';
import { CommunicationUserIdentifier, CommunicationUserKind, getIdentifierKind } from '@azure/communication-common';
import { ParticipantSubscriber } from './ParticipantSubcriber';
import { withErrorHandling } from '../../../utils/ErrorUtils';

// Context of Chat, which is a centralized context for all state updates
export class CallContext {
  private emitter: EventEmitter = new EventEmitter();
  private state: CallAdapterState;
  private callId: string | undefined;

  constructor(clientState: CallClientState) {
    this.state = {
      isLocalPreviewMicrophoneEnabled: false,
      userId: clientState.userId,
      displayName: clientState.callAgent?.displayName,
      devices: clientState.deviceManager,
      call: undefined,
      page: 'configuration'
    };
  }

  public onStateChange(handler: (_uiState: CallAdapterState) => void): void {
    this.emitter.on('stateChanged', handler);
  }

  public offStateChange(handler: (_uiState: CallAdapterState) => void): void {
    this.emitter.off('stateChanged', handler);
  }

  public setState(state: CallAdapterState): void {
    this.state = state;
    this.emitter.emit('stateChanged', this.state);
  }

  public getState(): CallAdapterState {
    return this.state;
  }

  public setPage(page: CallCompositePage): void {
    this.setState({ ...this.state, page });
  }

  public setError(error: Error): void {
    this.setState({ ...this.state, error });
  }

  public setIsLocalMicrophoneEnabled(isLocalPreviewMicrophoneEnabled: boolean): void {
    this.setState({ ...this.state, isLocalPreviewMicrophoneEnabled });
  }

  public setCallId(callId: string | undefined): void {
    this.callId = callId;
  }

  public updateClientState(clientState: CallClientState): void {
    const call = clientState.calls.get(this.callId ?? '');
    const endedCall =
      clientState.callsEnded.length > 0 ? clientState.callsEnded[clientState.callsEnded.length - 1] : undefined;
    this.setState({
      ...this.state,
      userId: clientState.userId,
      displayName: clientState.callAgent?.displayName,
      call,
      endedCall: endedCall,
      devices: clientState.deviceManager,
      isLocalPreviewMicrophoneEnabled:
        call?.isMuted === undefined ? this.state.isLocalPreviewMicrophoneEnabled : !call?.isMuted
    });
  }

  public setEndedCall(call: CallState): void {
    this.setState({ ...this.state, endedCall: call });
  }
}

export class AzureCommunicationCallAdapter implements CallAdapter {
  private callClient: StatefulCallClient;
  private callAgent: CallAgent;
  private deviceManager: StatefulDeviceManager;
  private localStream: SDKLocalVideoStream | undefined;
  private locator: TeamsMeetingLinkLocator | GroupCallLocator;
  private call: Call | undefined;
  private context: CallContext;
  private handlers: DefaultCallingHandlers;
  private participantSubscribers = new Map<string, ParticipantSubscriber>();
  private emitter: EventEmitter = new EventEmitter();
  private onClientStateChange: (clientState: CallClientState) => void;

  constructor(
    callClient: StatefulCallClient,
    locator: TeamsMeetingLinkLocator | GroupCallLocator,
    callAgent: CallAgent,
    deviceManager: StatefulDeviceManager
  ) {
    this.callClient = callClient;
    this.callAgent = callAgent;
    this.locator = locator;
    this.deviceManager = deviceManager;
    this.context = new CallContext(callClient.getState());
    const onStateChange = (clientState: CallClientState): void => {
      // unsubscribe when the instance gets disposed
      if (!this) {
        callClient.offStateChange(onStateChange);
        return;
      }
      this.context.updateClientState(clientState);
    };

    this.handlers = createDefaultCallingHandlers(callClient, callAgent, deviceManager, undefined);

    this.onClientStateChange = onStateChange;

    this.callClient.onStateChange(onStateChange);
  }

  public dispose = async (): Promise<void> => {
    this.callClient.offStateChange(this.onClientStateChange);

    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        await this.callAgent.dispose();
      },
      Promise.resolve()
    );
  };

  public isTeamsCall = (): boolean => {
    return 'meetingLink' in this.locator;
  };

  public queryCameras = (): Promise<VideoDeviceInfo[]> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        return await this.deviceManager.getCameras();
      },
      Promise.resolve([] as VideoDeviceInfo[])
    );
  };

  public queryMicrophones = (): Promise<AudioDeviceInfo[]> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        return await this.deviceManager.getMicrophones();
      },
      Promise.resolve([] as AudioDeviceInfo[])
    );
  };

  public querySpeakers = async (): Promise<AudioDeviceInfo[]> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        return await this.deviceManager.getSpeakers();
      },
      Promise.resolve([] as AudioDeviceInfo[])
    );
  };

  public askDevicePermission = async (constrain: PermissionConstraints): Promise<void> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        await this.deviceManager.askDevicePermission(constrain);
      },
      Promise.resolve()
    );
  };

  public joinCall = async (microphoneOn?: boolean): Promise<void> => {
    if (isInCall(this.getState().call?.state ?? 'None')) {
      const e = new Error('Error joining call - user is already in the call');
      this.context.setError(e);
      this.emitter.emit('error', e);
      return;
    } else {
      const audioOptions: AudioOptions = { muted: microphoneOn ?? !this.getState().isLocalPreviewMicrophoneEnabled };
      // TODO: find a way to expose stream to here
      const videoOptions = { localVideoStreams: this.localStream ? [this.localStream] : undefined };

      const isTeamsMeeting = 'groupId' in this.locator;

      const isJoinedCall = await withErrorHandling(
        this.context,
        this.emitter,
        async () => {
          if (isTeamsMeeting) {
            this.call = this.callAgent.join(this.locator as TeamsMeetingLinkLocator, {
              audioOptions,
              videoOptions
            });
          } else {
            this.call = this.callAgent.join(this.locator as TeamsMeetingLinkLocator, {
              audioOptions,
              videoOptions
            });
          }

          return Promise.resolve(true);
        },
        Promise.resolve(false)
      );

      if (!isJoinedCall) {
        return;
      }

      this.context.setCallId(this.call?.id);
      // Resync state after callId is set
      this.context.updateClientState(this.callClient.getState());
      this.handlers = createDefaultCallingHandlers(this.callClient, this.callAgent, this.deviceManager, this.call);
      this.subscribeCallEvents();
    }
  };

  public createStreamView = async (remoteUserId?: string, options?: VideoStreamOptions): Promise<void> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        if (remoteUserId === undefined) {
          await this.handlers.onCreateLocalStreamView(options);
        } else {
          await this.handlers.onCreateRemoteStreamView(remoteUserId, options);
        }
      },
      Promise.resolve()
    );
  };

  public disposeStreamView = async (remoteUserId?: string): Promise<void> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        if (remoteUserId === undefined) {
          await this.handlers.onDisposeLocalStreamView();
        } else {
          await this.handlers.onDisposeRemoteStreamView(remoteUserId);
        }
      },
      Promise.resolve()
    );
  };

  public leaveCall = async (): Promise<void> => {
    const callId = this.call?.id;
    this.stopCamera();
    this.mute();

    const isHangUpSuccessful = await withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        await this.handlers.onHangUp();
        return true;
      },
      Promise.resolve(false)
    );

    if (!isHangUpSuccessful) {
      return;
    }

    this.unsubscribeCallEvents();
    this.call = undefined;
    this.handlers = createDefaultCallingHandlers(this.callClient, this.callAgent, this.deviceManager, undefined);
    this.context.setCallId(undefined);
    // Resync state after callId is set
    this.context.updateClientState(this.callClient.getState());
    this.emitter.emit('callEnded', { callId });
  };

  public setCamera = async (device: VideoDeviceInfo, options?: VideoStreamOptions): Promise<void> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        await this.handlers.onSelectCamera(device, options);
      },
      Promise.resolve()
    );
  };

  public setMicrophone = async (device: AudioDeviceInfo): Promise<void> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        await this.handlers.onSelectMicrophone(device);
      },
      Promise.resolve()
    );
  };

  public setSpeaker = async (device: AudioDeviceInfo): Promise<void> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        await this.handlers.onSelectSpeaker(device);
      },
      Promise.resolve()
    );
  };

  public onToggleCamera = async (options?: VideoStreamOptions): Promise<void> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        await this.handlers.onToggleCamera(options);
      },
      Promise.resolve()
    );
  };

  //TODO: seperate onToggleCamera logic in Handler
  public startCamera = async (): Promise<void> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        if (!this.isCameraOn()) await this.handlers.onToggleCamera();
      },
      Promise.resolve()
    );
  };

  public stopCamera = async (): Promise<void> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        if (this.isCameraOn()) await this.handlers.onToggleCamera();
      },
      Promise.resolve()
    );
  };

  private isCameraOn = (): boolean => {
    if (this.call) {
      const stream = this.call.localVideoStreams.find((stream) => stream.mediaStreamType === 'Video');
      return !!stream;
    } else {
      if (this.callClient.getState().deviceManager.selectedCamera) {
        const previewOn = isPreviewOn(this.callClient.getState().deviceManager);
        return previewOn;
      }
    }
    return false;
  };

  public mute = async (): Promise<void> => {
    if (!this.call) {
      this.context.setIsLocalMicrophoneEnabled(false);
    }

    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        await this.call?.mute();
      },
      Promise.resolve()
    );
  };

  public unmute = async (): Promise<void> => {
    if (!this.call) {
      this.context.setIsLocalMicrophoneEnabled(true);
    }

    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        await this.call?.unmute();
      },
      Promise.resolve()
    );
  };

  public startScreenShare = async (): Promise<void> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        if (!this.call?.isScreenSharingOn) await this.handlers.onToggleScreenShare();
      },
      Promise.resolve()
    );
  };

  public stopScreenShare = async (): Promise<void> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        if (this.call?.isScreenSharingOn) await this.handlers.onToggleScreenShare();
      },
      Promise.resolve()
    );
  };

  //TODO: a better way to expose option parameter
  public startCall = (participants: string[]): Call | undefined => {
    const idsToAdd = participants.map((participant) => {
      // FIXME: `onStartCall` does not allow a Teams user.
      // Need some way to return an error if a Teams user is provided.
      const backendId = fromFlatCommunicationIdentifier(participant) as CommunicationUserIdentifier;
      return backendId;
    });

    try {
      return this.handlers.onStartCall(idsToAdd);
    } catch (e) {
      this.context.setError(e);
      this.emitter.emit('error', e);
      return undefined;
    }
  };

  public removeParticipant = async (userId: string): Promise<void> => {
    return withErrorHandling(
      this.context,
      this.emitter,
      async () => {
        await this.handlers.onParticipantRemove(userId);
      },
      Promise.resolve()
    );
  };

  public getState = (): CallAdapterState => {
    return this.context.getState();
  };

  public onStateChange = (handler: (state: CallAdapterState) => void): void => {
    this.context.onStateChange(handler);
  };

  public offStateChange = (handler: (state: CallAdapterState) => void): void => {
    this.context.offStateChange(handler);
  };

  on(event: 'participantsJoined', listener: ParticipantJoinedListener): void;
  on(event: 'participantsLeft', listener: ParticipantLeftListener): void;
  on(event: 'isMutedChanged', listener: IsMuteChangedListener): void;
  on(event: 'callIdChanged', listener: CallIdChangedListener): void;
  on(event: 'isLocalScreenSharingActiveChanged', listener: IsScreenSharingOnChangedListener): void;
  on(event: 'displayNameChanged', listener: DisplayNameChangedListener): void;
  on(event: 'isSpeakingChanged', listener: IsSpeakingChangedListener): void;
  on(event: 'callEnded', listener: CallEndedListener): void;
  on(event: 'error', errorHandler: (e: Error) => void): void;

  public on(event: CallEvent, listener: (e: any) => void): void {
    this.emitter.on(event, listener);
  }

  private subscribeCallEvents = (): void => {
    this.call?.on('remoteParticipantsUpdated', this.onRemoteParticipantsUpdated);
    this.call?.on('isMutedChanged', this.isMyMutedChanged);
    this.call?.on('isScreenSharingOnChanged', this.isScreenSharingOnChanged);
    this.call?.on('idChanged', this.callIdChanged);
  };

  private unsubscribeCallEvents = (): void => {
    for (const subscriber of this.participantSubscribers.values()) {
      subscriber.unsubscribeAll();
    }
    this.participantSubscribers.clear();
    this.call?.off('remoteParticipantsUpdated', this.onRemoteParticipantsUpdated);
    this.call?.off('isMutedChanged', this.isMyMutedChanged);
    this.call?.off('isScreenSharingOnChanged', this.isScreenSharingOnChanged);
    this.call?.off('idChanged', this.callIdChanged);
  };

  private isMyMutedChanged = (): void => {
    this.emitter.emit('isMutedChanged', {
      participantId: this.getState().userId,
      isMuted: this.call?.isMuted
    });
  };

  public setPage = (page: CallCompositePage): void => {
    this.context.setPage(page);
  };

  private onRemoteParticipantsUpdated = ({
    added,
    removed
  }: {
    added: RemoteParticipant[];
    removed: RemoteParticipant[];
  }): void => {
    if (added && added.length > 0) {
      this.emitter.emit('participantsJoined', added);
    }
    if (removed && removed.length > 0) {
      this.emitter.emit('participantsLeft', removed);
    }

    added.forEach((participant) => {
      this.participantSubscribers.set(
        toFlatCommunicationIdentifier(participant.identifier),
        new ParticipantSubscriber(participant, this.emitter)
      );
    });

    removed.forEach((participant) => {
      const subscriber = this.participantSubscribers.get(toFlatCommunicationIdentifier(participant.identifier));
      subscriber && subscriber.unsubscribeAll();
      this.participantSubscribers.delete(toFlatCommunicationIdentifier(participant.identifier));
    });
  };

  private isScreenSharingOnChanged = (): void => {
    this.emitter.emit('isLocalScreenSharingActiveChanged', { isScreenSharingOn: this.call?.isScreenSharingOn });
  };

  private callIdChanged = (): void => {
    this.context.setCallId(this.call?.id);
    // Resync state after callId is set
    this.context.updateClientState(this.callClient.getState());
    this.emitter.emit('callIdChanged', { callId: this.callIdChanged });
  };

  off(event: 'participantsJoined', listener: ParticipantJoinedListener): void;
  off(event: 'participantsLeft', listener: ParticipantLeftListener): void;
  off(event: 'isMutedChanged', listener: IsMuteChangedListener): void;
  off(event: 'callIdChanged', listener: CallIdChangedListener): void;
  off(event: 'isLocalScreenSharingActiveChanged', listener: IsScreenSharingOnChangedListener): void;
  off(event: 'displayNameChanged', listener: DisplayNameChangedListener): void;
  off(event: 'isSpeakingChanged', listener: IsSpeakingChangedListener): void;
  off(event: 'callEnded', listener: CallEndedListener): void;
  off(event: 'error', errorHandler: (e: Error) => void): void;

  public off(event: CallEvent, listener: (e: any) => void): void {
    this.emitter.off(event, listener);
  }
}

const isPreviewOn = (deviceManager: DeviceManagerState): boolean => {
  // TODO: we should take in a LocalVideoStream that developer wants to use as their 'Preview' view. We should also
  // handle cases where 'Preview' view is in progress and not necessary completed.
  return deviceManager.unparentedViews.values().next().value?.view !== undefined;
};

export const createAzureCommunicationCallAdapter = async (
  userId: CommunicationUserIdentifier,
  token: string,
  locator: TeamsMeetingLinkLocator | GroupCallLocator,
  displayName: string,
  refreshTokenCallback?: (() => Promise<string>) | undefined,
  callClientOptions?: CallClientOptions
): Promise<CallAdapter> => {
  const callClient = createStatefulCallClient(
    { userId: getIdentifierKind(userId) as CommunicationUserKind },
    { callClientOptions }
  );
  const deviceManager = (await callClient.getDeviceManager()) as StatefulDeviceManager;
  const callAgent = await callClient.createCallAgent(
    createAzureCommunicationUserCredential(token, refreshTokenCallback),
    { displayName }
  );

  const adapter = new AzureCommunicationCallAdapter(callClient, locator, callAgent, deviceManager);
  return adapter;
};
