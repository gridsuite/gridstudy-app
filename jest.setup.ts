/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TextEncoder, TextDecoder } from 'util';

// fix for ReferenceError: TextDecoder / TextEncoder is not defined
Object.assign(global, { TextDecoder, TextEncoder });
