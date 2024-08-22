/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Formula } from './Formula';
import FormulaMathJs from './FormulaMathJs';

class DummyFormula implements Formula {
    private static error = new Error('No provider passed for context');
    calc(formula: string, data: object): void {
        throw DummyFormula.error;
    }

    destroy(): void {
        throw DummyFormula.error;
    }

    formulaDeserialize(json: string): unknown {
        throw DummyFormula.error;
    }

    formulaToString(x: unknown): string {
        throw DummyFormula.error;
    }

    formulaSerialize(x: unknown): string {
        throw DummyFormula.error;
    }
}

const WorkerContext = createContext<Formula>(new DummyFormula());

export function useFormula() {
    return useContext(WorkerContext);
}

export type FormulaContextProps = PropsWithChildren<{}>;
export function FormulaContext(props: Readonly<FormulaContextProps>) {
    const [formulaInstance, setFormulaInstance] = useState<Formula>(undefined!);
    useEffect(() => {
        const instance = new FormulaMathJs();
        setFormulaInstance(instance);
        return () => instance?.destroy();
    }, []);
    return <WorkerContext.Provider value={formulaInstance}>{props.children}</WorkerContext.Provider>;
}
