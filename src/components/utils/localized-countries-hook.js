/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useLocalizedCountries as useLocalizedCountriesWithoutLanguage } from '@gridsuite/commons-ui';
import { useParameterState } from '../dialogs/parameters/parameters';
import { PARAM_LANGUAGE } from '../../utils/config-params';

export const useLocalizedCountries = () => {
    const [languageLocal] = useParameterState(PARAM_LANGUAGE);
    return useLocalizedCountriesWithoutLanguage(languageLocal);
};
