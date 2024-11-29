/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, Tab, Tabs } from '@mui/material';
import {
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    LIMITS,
    SELECTED_LIMIT_GROUP_1,
    SELECTED_LIMIT_GROUP_2,
} from 'components/utils/field-constants';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { LimitsSidePane } from './limits-side-pane';
import { SelectedOperationalLimitGroup } from './selected-operational-limit-group.jsx';
import { CurrentTreeNode } from '../../../redux/reducer';
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";

const styles = {
    limitsBackground: {
        backgroundColor: '#383838', // TODO : may be found in the theme ??
        padding: 2,
    },
    limitsBackgroundUnselected: {
        backgroundColor: '#1a1919', // TODO : may be found in the theme ??
    },
};
export interface LimitsPaneProps {
    id?: string;
    currentNode?: CurrentTreeNode;
    equipmentToModify?: any;
    clearableFields?: any;
}
interface LimitSet { // TODO : voir avec les boss si je fais des trucs comme ça ?
    id: string;
    temporaryLimits: Object[];
    permanentLimit?: number;
}

export function LimitsPane({
    id = LIMITS,
    currentNode,
    equipmentToModify,
    clearableFields,
}: Readonly<LimitsPaneProps>) {
    const [limitSets, setLimitSets] = useState<string[]>([]);
    const [selectedSetStr, setSelectedSetStr] = useState<string | null>(limitSets[0] || null);
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setSelectedSetStr(limitSets[newValue] || null);
    };

    const limitSets1 = useWatch({
        name: `${id}.${CURRENT_LIMITS_1}`,
    });
    const limitSets2 = useWatch({
        name: `${id}.${CURRENT_LIMITS_2}`,
    });
    const [ indexSelectedLimitSet1, setIndexSelectedLimitSet1 ] = useState<number|undefined>(undefined); // in the limitSets1 array
    const [ indexSelectedLimitSet2, setIndexSelectedLimitSet2 ] = useState<number|undefined>(undefined); // in the limitSets2 array

    useEffect(() => { // TODO faire ça avec des beaux streams
        for (let i=0; i < limitSets1.length;++i) {
            if (limitSets1[i].id === selectedSetStr) {
                setIndexSelectedLimitSet1(i);
            }
        }
        for (let i=0; i < limitSets2.length;++i) {
            if (limitSets2[i].id === selectedSetStr) {
                setIndexSelectedLimitSet2(i);
            }
        }

    }, [selectedSetStr, setIndexSelectedLimitSet1, setIndexSelectedLimitSet2, limitSets1, limitSets2]);

    useEffect(() => { // TODO : plutôt un useMemo
        let allLimitSets: string[] = [];
        if (limitSets1) {
            allLimitSets = [...limitSets1.map((limitSet: { id: any }) => limitSet.id)];
        }
        if (limitSets2) {
            allLimitSets = [...limitSets2.map((limitSet: { id: any }) => limitSet.id)];
        }
        setLimitSets(allLimitSets);
    }, [limitSets1, limitSets2]);

    /*
    const handleCopy = (direction: 'toRight' | 'toLeft') => {
    if (selectedSet) {
      const updatedSets = limitSets.map(set => {
        if (set.id === selectedSet.id) {
          const updatedSet = { ...set };
          if (direction === 'toRight') {
            updatedSet.side_2 = [...set.side_1];
          } else {
            updatedSet.side_1 = [...set.side_2];
          }
          return updatedSet;
        }
        return set;
      });
      setLimitSets(updatedSets);
      setSelectedSet(updatedSets[tabValue]);
    }
  };
     */

    const addNewLimitSet = () => {
    /*const newLimitSet: LimitSet = {
        id: `New Limit Set ${limitSets.length - 1}`,
        temporaryLimits: [],
        permanentLimit: undefined,
    };*/
    const newLimitSet: string = `New Limit Set ${limitSets.length - 1}`;
    setLimitSets([...limitSets, newLimitSet]); // TODO : l'ajouter dans les deux côtés ? cf createRows
    setTabValue(limitSets.length);
    setSelectedSetStr(newLimitSet);
  };

    return (
        <Grid container spacing={2}>
            {/* titles */}
            <Grid container item xs={12} columns={11} spacing={2}>
                <Grid item xs={1} />
                <Grid item xs={5}>
                    <Box component={`h3`}>
                        <FormattedMessage id="Side1" />
                    </Box>
                </Grid>
                <Grid item xs={5}>
                    <Box component={`h3`}>
                        <FormattedMessage id="Side2" />
                    </Box>
                </Grid>
            </Grid>
            {/* active limit set */}
            <Grid container item xs={12} columns={11} spacing={2}>
                <Grid item xs={1} />
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        selectedName={`${id}.${SELECTED_LIMIT_GROUP_1}`}
                        optionsFormName={`${id}.${CURRENT_LIMITS_1}`}
                    />
                </Grid>
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        selectedName={`${id}.${SELECTED_LIMIT_GROUP_2}`}
                        optionsFormName={`${id}.${CURRENT_LIMITS_2}`}
                    />
                </Grid>
            </Grid>
            {/* limits */}
            <Grid container item xs={12} columns={11}>
                <Grid item xs={1}>
                    <IconButton color="primary" onClick={() => addNewLimitSet()}>
                        <AddCircleIcon />
                    </IconButton>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{ flexGrow: 1 }}
                    >
                        {limitSets.map((set, index) => (
                            <Tab
                                key={set}
                                label={set}
                                sx={{
                                    backgroundColor: index === tabValue ? styles.limitsBackground.backgroundColor : styles.limitsBackgroundUnselected.backgroundColor,
                                    '&.Mui-selected': { backgroundColor: styles.limitsBackground.backgroundColor },
                                }}
                            />
                        ))}
                    </Tabs>
                </Grid>
                <Grid item xs={5}>
                    {limitSets1.map((item: any, index: number) =>
                        (index === indexSelectedLimitSet1 &&
                            <LimitsSidePane
                                limitSetFormName={`${id}.${CURRENT_LIMITS_1}`}
                                clearableFields={clearableFields}
                                indexLimitSet={index}
                                permanentCurrentLimitPreviousValue={equipmentToModify?.currentLimits1?.permanentLimit}
                                previousValues={equipmentToModify?.currentLimits1?.temporaryLimits}
                                currentNode={currentNode}
                            />
                        )
                    )}
                </Grid>
                <Grid item xs={5}>
                    {limitSets2.map((item: any, index: number) =>
                        (index === indexSelectedLimitSet2 &&
                            <LimitsSidePane
                                limitSetFormName={`${id}.${CURRENT_LIMITS_2}`}
                                clearableFields={clearableFields}
                                indexLimitSet={index}
                                permanentCurrentLimitPreviousValue={equipmentToModify?.currentLimits2?.permanentLimit}
                                previousValues={equipmentToModify?.currentLimits2?.temporaryLimits}
                                currentNode={currentNode}
                            />
                        )
                    )}
                </Grid>
            </Grid>
        </Grid>
    );
}
