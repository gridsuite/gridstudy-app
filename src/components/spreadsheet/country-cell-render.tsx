/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent } from 'react';
import { useLocalizedCountries } from '@gridsuite/commons-ui';

interface CountryCellRendererProps {
    value: string;
}

const CountryCellRenderer: FunctionComponent<CountryCellRendererProps> = ({
    value,
}) => {
    // @ts-expect-error: will be fixed in the next version of commons-ui
    const { translate } = useLocalizedCountries();
    const countryName = translate(value);
    return <span>{countryName}</span>;
};

export default CountryCellRenderer;
