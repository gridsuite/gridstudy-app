/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContext } from 'react';

// WARNING this file has been copied from commons-ui, and updated here. Putting it back to commons-ui has to be discussed.

const ReportTreeViewContext = createContext({});

if (import.meta.env.DEV) {
    ReportTreeViewContext.displayName = 'ReportTreeViewContext';
}

export default ReportTreeViewContext;
