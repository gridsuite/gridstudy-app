/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useTabsWithError } from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import { GeneratorDialogTab } from './generatorTabs.utils';
import { GeneratorDialogHeader, GeneratorDialogHeaderProps } from './GeneratorDialogHeader';
import { GeneratorDialogTabs } from './GeneratorDialogTabs';
import { GeneratorDialogTabsContent, GeneratorDialogTabsContentProps } from './GeneratorDialogTabsContent';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from 'components/graph/tree-node.type';

interface GeneratorModificationFormProps
    extends GeneratorDialogHeaderProps,
        Omit<GeneratorDialogTabsContentProps, 'tabIndex' | 'isModification'> {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
}

export default function GeneratorModificationForm({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    generatorToModify,
    updatePreviousReactiveCapabilityCurveTable,
    voltageLevelOptions,
    fetchBusesOrBusbarSections,
    PositionDiagramPane,
    equipmentId,
}: Readonly<GeneratorModificationFormProps>) {
    const { tabIndex, setTabIndex, tabIndexesWithError } = useTabsWithError<GeneratorDialogTab>(
        {},
        GeneratorDialogTab.CONNECTIVITY_TAB
    );

    return (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <GeneratorDialogHeader generatorToModify={generatorToModify} equipmentId={equipmentId} />
            </Grid>
            <Grid item>
                <GeneratorDialogTabs
                    tabIndex={tabIndex}
                    tabIndexesWithError={tabIndexesWithError}
                    setTabIndex={setTabIndex}
                />
            </Grid>
            <Grid item>
                <GeneratorDialogTabsContent
                    tabIndex={tabIndex}
                    generatorToModify={generatorToModify}
                    voltageLevelOptions={voltageLevelOptions}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    PositionDiagramPane={PositionDiagramPane}
                    updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </Grid>
        </Grid>
    );
}
