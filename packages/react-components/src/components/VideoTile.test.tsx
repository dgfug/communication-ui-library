// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { initializeIcons } from '@fluentui/react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { VideoTile } from './VideoTile';
import { act } from 'react-dom/test-utils';

Enzyme.configure({ adapter: new Adapter() });

describe('VideoTile', () => {
  beforeAll(() => {
    initializeIcons();
  });

  test('onLongTouch should trigger callback', async () => {
    const mockCallback = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videoTileProps = { onLongTouch: mockCallback } as any;
    const wrapper = mount(<VideoTile {...videoTileProps} />);
    await act(async () => {
      wrapper.simulate('touchstart');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      wrapper.simulate('touchend');
    });
    /* @conditional-compile-remove(pinned-participants) */
    expect(mockCallback).toBeCalledTimes(1);
  });
});
