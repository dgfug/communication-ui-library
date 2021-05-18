// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { CallState } from '../adapter/CallAdapter';
import { useSelectorWithAdaptation } from './useAdaptedSelector';

// This function highly depends on callClient.onChange event
export const useSelector = <SelectorT extends (state: CallState, props: any) => any>(
  selector: SelectorT,
  selectorProps?: Parameters<SelectorT>[1]
): ReturnType<SelectorT> => {
  // use selector with no adaptation
  return useSelectorWithAdaptation(selector, (state) => state, selectorProps);
};
