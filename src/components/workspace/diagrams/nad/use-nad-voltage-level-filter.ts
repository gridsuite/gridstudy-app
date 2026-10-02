/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo } from 'react';
import type { DiagramMetadata } from '@powsybl/network-viewer';
import { useBaseVoltages } from '../../../../hooks/use-base-voltages';

interface UseNadVoltageLevelFilterReturn {
    /** Representative nominal voltages shown on the filtering tab. */
    presentNominalVoltages: number[];
    /** Representative voltages currently checked. */
    selectedNominalVoltages: number[];
    /** Band names whose representative is unchecked → need to be hidden in the diagram. */
    unselectedVlNames: string[];
}

/**
 * Voltage-level band filtering logic for NAD.
 */
export function useNadVoltageLevelFilter(
    svgMetadata: DiagramMetadata | null | undefined,
    // Representative voltages checked, `undefined` until a diagram is drawn
    voltageSelection: number[] | undefined,
    setVoltageSelection: (voltageSelection: number[]) => void
): UseNadVoltageLevelFilterReturn {
    const { baseVoltages } = useBaseVoltages();

    // Voltages actually present in the current diagram, derived from the SVG metadata CSS classes.
    const presentVlNames = useMemo(() => {
        const vlNames = new Set<string>();
        const collectVlNames = (classes?: string[]) =>
            classes?.forEach((cls) => {
                // CSS class carried by NAD elements for their voltage-level band, e.g. "nad-voltage-level-6".
                const matchedVlNames = /^nad-(voltage-level-\d+)$/.exec(cls);
                if (matchedVlNames) {
                    vlNames.add(matchedVlNames[1]);
                }
            });
        svgMetadata?.nodes?.forEach((node) => collectVlNames(node.classes));
        svgMetadata?.busNodes?.forEach((busNode) => collectVlNames(busNode.classes));
        return vlNames;
    }, [svgMetadata]);

    const presentBaseVoltages = useMemo(
        () => (baseVoltages ?? []).filter((bv) => presentVlNames.has(bv.name)),
        [baseVoltages, presentVlNames]
    );

    // The voltages displayed to the user on the filtering tab
    const presentNominalVoltages = useMemo(() => presentBaseVoltages.map((bv) => bv.minValue), [presentBaseVoltages]);

    // Everything is checked on the first drawing, and saved so that voltages appearing afterwards (expand, add
    // from a filter, another node or root network) stay unchecked, even after a reload or a workspace switch.
    useEffect(() => {
        if (voltageSelection === undefined && presentNominalVoltages.length > 0) {
            setVoltageSelection(presentNominalVoltages);
        }
    }, [voltageSelection, presentNominalVoltages, setVoltageSelection]);

    const selectedNominalVoltages = voltageSelection ?? presentNominalVoltages;

    // Bands whose representative is unchecked → hidden in the diagram.
    const unselectedVlNames = useMemo(
        () => presentBaseVoltages.filter((bv) => !selectedNominalVoltages.includes(bv.minValue)).map((bv) => bv.name),
        [presentBaseVoltages, selectedNominalVoltages]
    );

    return {
        presentNominalVoltages,
        selectedNominalVoltages,
        unselectedVlNames,
    };
}
