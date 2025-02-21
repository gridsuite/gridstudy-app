/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContext } from 'react';

interface LoadFlowContextProps {
    showAdvancedLfParams: boolean;
    setShowAdvancedLfParams: (state: boolean) => void;
    showSpecificLfParams: boolean;
    setShowSpecificLfParams: (state: boolean) => void;
}

export const LoadFlowContext = createContext<LoadFlowContextProps | undefined>(undefined);
