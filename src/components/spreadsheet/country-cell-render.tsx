/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useLocalizedCountries } from '@gridsuite/commons-ui';
import React from 'react';
import { useParameterState } from '../dialogs/parameters/parameters';
import { PARAM_LANGUAGE } from '../../utils/config-params';

interface CountryCellRendererProps {
    value: string;
}

const CountryCellRenderer: React.FC<CountryCellRendererProps> = ({ value }) => {
    const [language] = useParameterState(PARAM_LANGUAGE);
    const { translate } = useLocalizedCountries(language);
    const countryName = translate(value);
    return <span>{countryName}</span>;
};

export default CountryCellRenderer;
