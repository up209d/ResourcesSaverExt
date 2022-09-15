import React, { useEffect, useMemo, useState } from 'react';
import { ToggleWrapper } from './styles';

export const Toggle = (props) => {
  const { activeColor, onToggle, initialToggle, isToggled, noInteraction, children } = props;
  const [isInternalToggled, setIsInternalToggled] = useState(initialToggle);

  const handleToggle = useMemo(
    () => () => {
      setIsInternalToggled(!isInternalToggled);
      onToggle && onToggle(!isInternalToggled);
    },
    [isInternalToggled, onToggle]
  );

  useEffect(() => {
    setIsInternalToggled(isToggled);
  }, [isToggled]);

  return (
    <ToggleWrapper noInteraction={noInteraction} activeColor={activeColor} onClick={handleToggle} isToggled={isInternalToggled}>
      {children}
    </ToggleWrapper>
  );
};
