import React, { useCallback, useMemo, useState } from 'react';
import {
  LogSectionFilter,
  LogSectionFilterInput,
  LogSectionFilterToggle,
  LogSectionList,
  LogSectionListItem,
  LogSectionTitle,
  LogSectionWrapper,
} from './styles';
import { Toggle } from '../../Toggle';

export const LOG_TABS = {
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
  NO_CONTENT: 'NO_CONTENT',
};

export const TABS_COLORS = {
  SUCCESS: 'secondary',
  FAIL: 'danger',
};

export const LogSection = (props) => {
  const { log } = props;
  const [filter, setFilter] = useState(``);
  const [viewTab, setViewTab] = useState(LOG_TABS.SUCCESS);
  const [toggleUrls, setToggleUrls] = useState({});
  const result = useMemo(() => {
    const { logs = [] } = log;
    return {
      [LOG_TABS.SUCCESS]: logs.filter(
        (i) => !i.failed && i.hasContent && (!filter || (filter && i.url.includes(filter.toLowerCase())))
      ),
      [LOG_TABS.FAIL]: logs.filter((i) => i.failed && (!filter || (filter && i.url.includes(filter.toLowerCase())))),
      [LOG_TABS.NO_CONTENT]: logs.filter((i) => !i.hasContent && (!filter || (filter && i.url.includes(filter.toLowerCase())))),
    };
  }, [log, filter]);
  const handleFilterChange = useMemo(() => (e) => setFilter(e.target.value), []);

  const handleToggle = useCallback((currentViewTab) => () => setViewTab(currentViewTab), []);
  const handleToggleUrls = useCallback(
    (url) => () =>
      setToggleUrls((urls) => ({
        ...urls,
        [url]: !urls[url],
      })),
    []
  );

  return (
    <LogSectionWrapper>
      <LogSectionTitle>Download log</LogSectionTitle>
      <LogSectionFilter>
        <LogSectionFilterToggle>
          <Toggle
            activeColor={`secondary`}
            noInteraction={viewTab === LOG_TABS.SUCCESS}
            isToggled={viewTab === LOG_TABS.SUCCESS}
            onToggle={handleToggle(LOG_TABS.SUCCESS)}
          >
            Success ({result.SUCCESS.length})
          </Toggle>
          <Toggle
            activeColor={`danger`}
            noInteraction={viewTab === LOG_TABS.FAIL}
            isToggled={viewTab === LOG_TABS.FAIL}
            onToggle={handleToggle(LOG_TABS.FAIL)}
          >
            Fail ({result.FAIL.length})
          </Toggle>
          <Toggle
            noInteraction={viewTab === LOG_TABS.NO_CONTENT}
            isToggled={viewTab === LOG_TABS.NO_CONTENT}
            onToggle={handleToggle(LOG_TABS.NO_CONTENT)}
          >
            No Content ({result.NO_CONTENT.length})
          </Toggle>
        </LogSectionFilterToggle>
      </LogSectionFilter>
      <LogSectionFilter>
        <LogSectionFilterInput value={filter} onChange={handleFilterChange} placeholder={`Enter filter keywords...`} />
      </LogSectionFilter>
      <LogSectionList>
        {result[viewTab].map((i) => {
          const urlText = i.url?.length > 256 ? `${i.url.slice(0, 253)}...` : i.url;
          const toggled = !!toggleUrls[i.url];
          return (
            <LogSectionListItem key={i.url} bgColor={TABS_COLORS[viewTab]} onClick={handleToggleUrls(i.url)}>
              {toggled ? i.url : urlText}
            </LogSectionListItem>
          );
        })}
      </LogSectionList>
    </LogSectionWrapper>
  );
};

export default LogSection;
