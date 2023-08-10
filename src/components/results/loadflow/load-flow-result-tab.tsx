import React, { FunctionComponent, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { FormattedMessage } from 'react-intl/lib';
import makeStyles from '@mui/styles/makeStyles';
import { green, red } from '@mui/material/colors';
import { LoadFlowResult } from './load-flow-result.type';

interface LoadflowResultProps {
    result: LoadFlowResult;
    studyUuid: string;
    nodeUuid: string;
}

export const LoadFlowResultTab: FunctionComponent<LoadflowResultProps> = ({
    result,
    studyUuid,
    nodeUuid,
}) => {
    const useStyles = makeStyles((theme) => ({
        cell: {
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
            flex: 1,
            cursor: 'initial',
        },
        succeed: {
            color: green[500],
        },
        fail: {
            color: red[500],
        },
    }));

    const classes = useStyles();
    const [tabIndex, setTabIndex] = useState<number>(0);
    // todo : check this
    return (
        <>
            <div className={classes.succeed}>
                <div className={classes.cell}>
                    <Tabs
                        value={tabIndex}
                        onChange={(event, newTabIndex) =>
                            setTabIndex(newTabIndex)
                        }
                    >
                        <Tab
                            label={
                                <FormattedMessage
                                    id={'LoadFlowResultsCurrentViolations'}
                                />
                            }
                        />
                        <Tab
                            label={
                                <FormattedMessage
                                    id={'LoadFlowResultsVoltageViolations'}
                                />
                            }
                        />
                        <Tab
                            label={
                                <FormattedMessage
                                    id={'LoadFlowResultsStatus'}
                                />
                            }
                        />
                    </Tabs>
                </div>
            </div>
            {rendercontent()}
        </>
    );
};
