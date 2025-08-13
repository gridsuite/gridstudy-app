/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { AutocompleteInput, Option } from '@gridsuite/commons-ui';
import GridItem from '../commons/grid-item';
import GridSection from '../commons/grid-section';
import { Grid } from '@mui/material';
import {
    AERIAL_AREAS,
    AERIAL_TEMPERATURES,
    UNDERGROUND_AREAS,
    UNDERGROUND_SHAPE_FACTORS,
} from '../../utils/field-constants';
import { CATEGORIES, TABS } from './segment-utils';
import { LineTypeInfo } from './line-catalog.type';

interface LimitParametersSelectionProps {
    selectedRow: LineTypeInfo | null;
    currentTab: number;
    aerialAreas: Option[];
    aerialTemperatures: Option[];
    undergroundAreas: Option[];
    undergroundShapeFactor: Option[];
}

export default function LimitParametersSelection({
    selectedRow,
    currentTab,
    aerialAreas,
    aerialTemperatures,
    undergroundAreas,
    undergroundShapeFactor,
}: LimitParametersSelectionProps) {
    const isAerialTab = currentTab === TABS.AERIAL;
    const isAerialCategory = selectedRow?.category === CATEGORIES.AERIAL;
    const isUndergroundCategory = selectedRow?.category === CATEGORIES.UNDERGROUND;

    return (
        <>
            {isAerialCategory && isAerialTab && (
                <>
                    <GridSection title="parameters" />
                    <Grid container spacing={2}>
                        <GridItem size={4}>
                            <AutocompleteInput
                                name={AERIAL_AREAS}
                                label="aerialAreas"
                                options={aerialAreas}
                                disabled={false}
                                size="small"
                            />
                        </GridItem>
                        <GridItem size={4}>
                            <AutocompleteInput
                                name={AERIAL_TEMPERATURES}
                                label="aerialTemperatures"
                                options={aerialTemperatures}
                                disabled={false}
                                size="small"
                            />
                        </GridItem>
                    </Grid>
                </>
            )}
            {isUndergroundCategory && !isAerialTab && (
                <>
                    <GridSection title="parameters" />
                    <Grid container spacing={2}>
                        <GridItem size={4}>
                            <AutocompleteInput
                                name={UNDERGROUND_AREAS}
                                label="lineTypes.currentLimits.underground.Area"
                                options={undergroundAreas}
                                disabled={false}
                                size="small"
                            />
                        </GridItem>
                        <GridItem size={4}>
                            <AutocompleteInput
                                name={UNDERGROUND_SHAPE_FACTORS}
                                label="lineTypes.currentLimits.underground.ShapeFactor"
                                options={undergroundShapeFactor}
                                disabled={false}
                                size={'small'}
                            />
                        </GridItem>
                    </Grid>
                </>
            )}
        </>
    );
}
