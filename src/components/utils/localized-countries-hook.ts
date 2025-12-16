/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';
import { PARAM_LANGUAGE, useLocalizedCountries as useLocalizedCountriesCUI } from '@gridsuite/commons-ui';

export const useLocalizedCountries = () => {
    const [languageLocal] = useParameterState(PARAM_LANGUAGE);
    const { translate, countryCodes } = useLocalizedCountriesCUI(languageLocal);

    return { translate, countryCodes };
};
