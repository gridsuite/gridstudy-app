/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import React from 'react';

interface CountryCellRendererProps {
    value: string;
}

const CountryCellRenderer: React.FC<CountryCellRendererProps> = ({ value }) => {
    const { translate } = useLocalizedCountries();
    const countryName = translate(value);
    return <span>{countryName}</span>;
};

export default CountryCellRenderer;
