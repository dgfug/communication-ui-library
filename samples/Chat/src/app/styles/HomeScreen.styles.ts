// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IStackTokens, getTheme, mergeStyles } from '@fluentui/react';

const palette = getTheme().palette;

export const imgStyle = mergeStyles({
  width: '26.813rem',
  height: '20.125rem',
  '@media (max-width: 67.1875rem)': {
    display: 'none'
  }
});

export const containerTokens: IStackTokens = {
  childrenGap: '4rem'
};

export const infoContainerStackTokens: IStackTokens = {
  childrenGap: '2.625rem'
};

export const configContainerStackTokens: IStackTokens = {
  childrenGap: '2.625rem'
};

export const nestedStackTokens: IStackTokens = {
  childrenGap: '0.75rem'
};

export const containerStyle = mergeStyles({
  height: '100%',
  width: '100% ',
  padding: '2rem', // half childrenGap from Stack (to add to compensate inner stack defined by 'wrap' prop of Stack)
  minWidth: '27.188rem', // min-width from stack items + padding * 2 = 23.188 + 2 * 2
  minHeight: 'auto'
});

export const listStyle = mergeStyles({
  listStyleType: 'none',
  paddingLeft: '0px',
  fontSize: '0.875rem' // 14px
});

export const iconStyle = mergeStyles({
  marginRight: 7,
  color: palette.themePrimary
});

export const headerStyle = mergeStyles({
  fontWeight: 600,
  fontSize: '2.25rem', // 36px
  width: 'inherit'
});

export const videoCameraIconStyle = mergeStyles({
  marginRight: '0.375rem',
  fontSize: '1.375rem' // 22px
});

export const buttonStyle = mergeStyles({
  fontWeight: 600,
  fontSize: '0.875rem', // 14px
  width: 'fit-content',
  height: '2.5rem',
  borderRadius: 3
});

export const infoContainerStyle = mergeStyles({
  width: '23.188rem'
});

export const configContainerStyle = mergeStyles({
  width: 'inherit'
});

export const startChatTextStyle = mergeStyles({
  fontSize: '0.875rem' // 14px
});
