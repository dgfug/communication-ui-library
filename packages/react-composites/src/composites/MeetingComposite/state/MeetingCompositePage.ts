// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { CallCompositePage } from '../../CallComposite';

export type MeetingCompositePage = 'configuration' | 'meeting' | 'error' | 'errorJoiningTeamsMeeting' | 'removed';

export function callPageToMeetingPage(page: CallCompositePage): MeetingCompositePage {
  return page === 'call' ? 'meeting' : page;
}

export function meetingPageToCallPage(page: MeetingCompositePage): CallCompositePage {
  return page === 'meeting' ? 'call' : page;
}
