/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, FunctionComponent, ReactNode, useMemo } from 'react';
import { LoadFlowContext } from './load-flow-parameters-context';

export const LoadFlowProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
    const [showAdvancedLfParams, setShowAdvancedLfParams] = useState(false);
    const [showSpecificLfParams, setShowSpecificLfParams] = useState(false);

    const contextValue = useMemo(
        () => ({
            showAdvancedLfParams,
            setShowAdvancedLfParams,
            showSpecificLfParams,
            setShowSpecificLfParams,
        }),
        [showAdvancedLfParams, showSpecificLfParams]
    );

    return <LoadFlowContext.Provider value={contextValue}>{children}</LoadFlowContext.Provider>;
};
