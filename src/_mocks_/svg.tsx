/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { forwardRef, SVGProps } from 'react';

const SvgrMock = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => <svg ref={ref} {...props} />);

export default SvgrMock;
