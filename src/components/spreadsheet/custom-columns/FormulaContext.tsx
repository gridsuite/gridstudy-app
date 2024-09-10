/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { Formula } from './Formula';
import FormulaMathJs from './FormulaMathJs';

const FormulaContext = createContext<Formula>(new FormulaMathJs());

export function useFormula() {
    return useContext(FormulaContext);
}

export function FormulaProvider(props: PropsWithChildren) {
    const [formulaInstance] = useState<Formula>(new FormulaMathJs());
    return <FormulaContext.Provider value={formulaInstance}>{props.children}</FormulaContext.Provider>;
}
