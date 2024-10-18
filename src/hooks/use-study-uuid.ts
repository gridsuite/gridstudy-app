/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
// @autor: RTE (http://www.rte-france.com) - capyQ

import { UUID } from 'crypto';
import { useParams } from 'react-router-dom';

const useStudyUuid = () => {
    const idInParams = useParams().studyUuid;
    return idInParams ? (decodeURIComponent(idInParams) as UUID) : undefined;
};

export default useStudyUuid;
