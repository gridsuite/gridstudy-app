/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

export const useIsAnyNodeBuilding = () => {
    const [iAnyNodeBuild, setAnyNodeBuilding] = useState(false);

    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);

    useEffect(() => {
        setAnyNodeBuilding(treeModel?.isAnyNodeBuilding || false);
    }, [treeModel]);

    return iAnyNodeBuild;
};
