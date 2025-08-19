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
import { CATEGORIES_TABS, LineTypeInfo } from './line-catalog.type';
import { areIdsEqual } from '../../utils/utils';

interface LimitParametersSelectionProps {
    selectedRow: LineTypeInfo | null;
    currentTab: number;
    aerialAreas: Option[];
    aerialTemperatures: Option[];
    undergroundAreas: Option[];
    undergroundShapeFactor: Option[];
}

export default function LineTypesCatalogSelectorForm({
    selectedRow,
    currentTab,
    aerialAreas,
    aerialTemperatures,
    undergroundAreas,
    undergroundShapeFactor,
}: LimitParametersSelectionProps) {
    const isAerialTab = currentTab === CATEGORIES_TABS.AERIAL.id;
    const isAerialCategory = selectedRow?.category === CATEGORIES_TABS.AERIAL.name;
    const isUndergroundCategory = selectedRow?.category === CATEGORIES_TABS.UNDERGROUND.name;

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
                                isOptionEqualToValue={areIdsEqual}
                                size="small"
                            />
                        </GridItem>
                        <GridItem size={4}>
                            <AutocompleteInput
                                name={AERIAL_TEMPERATURES}
                                label="aerialTemperatures"
                                options={aerialTemperatures}
                                isOptionEqualToValue={areIdsEqual}
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
                                isOptionEqualToValue={areIdsEqual}
                                size="small"
                            />
                        </GridItem>
                        <GridItem size={4}>
                            <AutocompleteInput
                                name={UNDERGROUND_SHAPE_FACTORS}
                                label="lineTypes.currentLimits.underground.ShapeFactor"
                                options={undergroundShapeFactor}
                                isOptionEqualToValue={areIdsEqual}
                                size={'small'}
                            />
                        </GridItem>
                    </Grid>
                </>
            )}
        </>
    );
}
