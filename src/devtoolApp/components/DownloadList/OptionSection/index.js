import React, { useCallback } from 'react';
import { Toggle } from '../../Toggle';
import { OptionSectionWrapper } from './styles';
import * as optionActions from 'devtoolApp/store/option';
import useStore from 'devtoolApp/store';

export const OptionSection = () => {
  const {
    dispatch,
    state: {
      option: { ignoreNoContentFile, beautifyFile },
      ui: { isSaving },
    },
  } = useStore();

  const handleIgnoreNoContentFile = useCallback((willIgnore) => {
    dispatch(optionActions.setIgnoreNoContentFile(willIgnore));
  }, []);

  const handleBeautifyFile = useCallback((willBeautify) => {
    dispatch(optionActions.setBeautifyFile(willBeautify));
  }, []);

  return (
    <OptionSectionWrapper>
      <Toggle noInteraction={isSaving} isToggled={ignoreNoContentFile} onToggle={handleIgnoreNoContentFile}>
        Ignore "No Content" files
      </Toggle>
      <Toggle noInteraction={isSaving} isToggled={beautifyFile} onToggle={handleBeautifyFile}>
        Beautify HTML, CSS, JS, JSON files
      </Toggle>
    </OptionSectionWrapper>
  );
};

export default OptionSection;
