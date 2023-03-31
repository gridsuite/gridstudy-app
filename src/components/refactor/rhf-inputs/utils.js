import { useWatch } from 'react-hook-form';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { getPreviousValueFieldName } from '../utils/utils';

export const usePreviousValue = (name) => {
    const intl = useIntl();
    const previousFieldName = getPreviousValueFieldName(name);
    const previousValueWatch = useWatch({ name: previousFieldName });
    return useMemo(
        () => intl.messages[previousValueWatch] ?? previousValueWatch,
        [previousValueWatch, intl.messages]
    );
};
