/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { B, G, R, RATED_S, RATED_U1, RATED_U2, X } from '../../../../utils/field-constants';

// TODO remove this file when moving twt modification to commons-ui

export type CharacteristicsFormSchema = {
    [R]: number | null;
    [X]: number | null;
    [G]: number | null;
    [B]: number | null;
    [RATED_S]: number | null;
    [RATED_U1]: number | null;
    [RATED_U2]: number | null;
};
