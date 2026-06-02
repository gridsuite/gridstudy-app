/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import messages_plugins_fr from '../translations/fr.json';
import messages_plugins_en from '../translations/en.json';
import messages_plugins_fr_rte from '../translations/fr_rte.json';
import messages_plugins_en_rte from '../translations/en_rte.json';
import export_parameters_fr from './external/export-parameters-fr';
import export_parameters_en from './external/export-parameters-en';

const messages_plugins = {
    fr: {
        ...messages_plugins_fr,
        ...messages_plugins_fr_rte,
        ...export_parameters_fr,
    },
    en: {
        ...messages_plugins_en,
        ...messages_plugins_en_rte,
        ...export_parameters_en,
    },
};

export default messages_plugins;
