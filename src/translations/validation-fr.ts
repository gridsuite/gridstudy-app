/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { COLUMN_SELECTION_REQUIRED, WRONG_REF_OR_VALUE_ERROR } from '../utils/validation-translation-keys';

export const validationFr = {
    [COLUMN_SELECTION_REQUIRED]: 'Au moins une colonne doit être sélectionnée',
    [WRONG_REF_OR_VALUE_ERROR]:
        'Veuillez saisir une valeur numérique valide ou une référence de champ valide. Utiliser # pour sélectionner un champ',
};
