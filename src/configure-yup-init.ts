/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Must run before any module that defines a yup schema is loaded, so that
// `string().required()` (no message) captures the configured locale instead
// of yup's built-in default.
import { configureYup } from '@gridsuite/commons-ui/configureYup';

configureYup();
