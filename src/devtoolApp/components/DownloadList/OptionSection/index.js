import React, { useCallback } from 'react';
import { Toggle } from '../../Toggle';
import { OptionSectionWrapper, FilterInputWrapper, FilterInput, FilterLabel } from './styles';
import * as optionActions from 'devtoolApp/store/option';
import useStore from 'devtoolApp/store';

export const OptionSection = () => {
  const {
    dispatch,
    state: {
      option: { ignoreNoContentFile, beautifyFile, urlFilter },
      ui: { isSaving },
    },
  } = useStore();

  const handleIgnoreNoContentFile = useCallback((willIgnore) => {
    dispatch(optionActions.setIgnoreNoContentFile(willIgnore));
  }, []);

  const handleBeautifyFile = useCallback((willBeautify) => {
    dispatch(optionActions.setBeautifyFile(willBeautify));
  }, []);

  const handleUrlFilterChange = useCallback((e) => {
    dispatch(optionActions.setUrlFilter(e.target.value));
  }, []);

  return (
    <OptionSectionWrapper>
      <FilterInputWrapper>
        <FilterLabel htmlFor="url-filter">
          URL Filter (supports glob patterns with negation, separate multiple rules with |):
        </FilterLabel>
        <FilterInput
          id="url-filter"
          type="text"
          value={urlFilter}
          onChange={handleUrlFilterChange}
          placeholder="e.g.: *.js|*.css|!*test*|!*min.js, https://example.com/**|!https://example.com/temp/**"
          disabled={isSaving}
        />
      </FilterInputWrapper>
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
