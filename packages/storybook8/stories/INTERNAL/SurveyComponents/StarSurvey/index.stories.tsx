import { Meta } from '@storybook/react';
import { hiddenControl } from '../../../controlsUtils';
import { _StarSurvey as StarSurveyComponent } from '@internal/react-components';
import { StarSurveyExample } from './snippets/StarSurvey.snippet';
export { StarSurvey } from './StarSurvey.story';

export const StarSurveyExampleDocsOnly = {
  render: StarSurveyExample
};

export default {
  title: 'Components/Internal/Survey Components/Star Survey',
  component: StarSurveyComponent,
  argTypes: {
    selectedIcon: hiddenControl,
    unselectedIcon: hiddenControl,
    onStarRatingSelected: hiddenControl,
    strings: hiddenControl
  },
  parameters: {},
  args: {}
} as Meta;