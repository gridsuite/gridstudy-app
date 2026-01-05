/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { AutocompleteInput, EquipmentType, Option, TextInput } from '@gridsuite/commons-ui';
import {
    ATTACHED_LINE_ID,
    LINE_TO_ATTACH_TO_1_ID,
    LINE_TO_ATTACH_TO_2_ID,
    REPLACING_LINE_1_ID,
    REPLACING_LINE_1_NAME,
} from 'components/utils/field-constants';
import { areIdsEqual, getObjectId } from 'components/utils/utils';
import { fetchEquipmentsIds } from '../../../../services/study/network-map';
import GridSection from '../../commons/grid-section';
import GridItem from '../../commons/grid-item';
import { UUID } from 'node:crypto';
import { getIdOrValue } from 'components/dialogs/commons/utils';
import { CurrentTreeNode } from 'components/graph/tree-node.type';

const GRID_ITEM_SIZE = 5;
const GRID_SPACING = 2;

const LINE_AUTOCOMPLETE_SHARED_PROPS = {
    isOptionEqualToValue: areIdsEqual,
    allowNewValue: true,
    forcePopupIcon: true,
    getOptionLabel: getObjectId,
    outputTransform: getIdOrValue,
    size: 'small' as const,
} as const;

interface DeleteAttachingLineFormProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
}

interface LineFieldConfig {
    name: string;
    label: string;
    sectionTitle: string;
}

const LINE_FIELDS: readonly LineFieldConfig[] = [
    { name: LINE_TO_ATTACH_TO_1_ID, label: 'Line1', sectionTitle: 'Line1' },
    { name: LINE_TO_ATTACH_TO_2_ID, label: 'Line2', sectionTitle: 'Line2' },
    { name: ATTACHED_LINE_ID, label: 'LineAttached', sectionTitle: 'LineAttached' },
] as const;

const sortAlphabetically = (a: string, b: string): number => a.localeCompare(b);

const DeleteAttachingLineForm = ({ studyUuid, currentNode, currentRootNetworkUuid }: DeleteAttachingLineFormProps) => {
    const [linesOptions, setLinesOptions] = useState<Option[]>([]);

    const loadLineOptions = useCallback(async () => {
        try {
            const values = await fetchEquipmentsIds(
                studyUuid,
                currentNode.id,
                currentRootNetworkUuid,
                [],
                EquipmentType.LINE,
                true
            );
            setLinesOptions(values.toSorted(sortAlphabetically));
        } catch (error) {
            console.error('Failed to fetch line options:', error);
            setLinesOptions([]);
        }
    }, [studyUuid, currentNode.id, currentRootNetworkUuid]);

    useEffect(() => {
        loadLineOptions();
    }, [loadLineOptions]);

    return (
        <>
            {LINE_FIELDS.map(({ name, label, sectionTitle }) => (
                <Fragment key={name}>
                    <GridSection title={sectionTitle} />
                    <Grid container spacing={GRID_SPACING} alignItems="center">
                        <GridItem size={GRID_ITEM_SIZE}>
                            <AutocompleteInput
                                {...LINE_AUTOCOMPLETE_SHARED_PROPS}
                                name={name}
                                label={label}
                                options={linesOptions}
                            />
                        </GridItem>
                    </Grid>
                </Fragment>
            ))}

            <GridSection title="ReplacingLine" />
            <Grid container spacing={GRID_SPACING}>
                <GridItem>
                    <TextInput name={REPLACING_LINE_1_ID} label="ReplacingLineId" />
                </GridItem>
                <GridItem>
                    <TextInput name={REPLACING_LINE_1_NAME} label="ReplacingLineName" />
                </GridItem>
            </Grid>
        </>
    );
};

export default DeleteAttachingLineForm;
