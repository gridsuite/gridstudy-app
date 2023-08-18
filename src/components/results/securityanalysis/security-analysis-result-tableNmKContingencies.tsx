import React, { FunctionComponent, useCallback, useMemo } from 'react';
import {
    NmKConstraintRow,
    PostContingencyResultProps,
} from './security-analysis.type';
import {
    getNoRowsMessage,
    getRows,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import {
    flattenNmKresultsContingencies,
    groupPostSort,
    securityAnalysisTableNmKContingenciesColumnsDefinition,
} from './security-analysis-result-utils';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { ReduxState } from '../../../redux/reducer.type';
import { Button } from '@mui/material';
import {
    GridReadyEvent,
    ICellRendererParams,
    PostSortRowsParams,
    RowClassParams,
} from 'ag-grid-community';
import makeStyles from '@mui/styles/makeStyles';
import { GridStudyTheme } from '../../app-wrapper.type';
import { useTheme } from '@mui/styles';
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';

export const SecurityAnalysisResultTableNmKContingencies: FunctionComponent<
    PostContingencyResultProps
> = ({ postContingencyResults, onClickNmKConstraint }) => {
    const theme: GridStudyTheme = useTheme();
    const useStyles = makeStyles<GridStudyTheme>((theme) => ({
        button: {
            color: theme.link.color,
        },
    }));
    const classes = useStyles();
    const intl = useIntl();
    const messages = useIntlResultStatusMessages(intl);
    const securityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );
    const SubjectIdRenderer = useCallback(
        (props: ICellRendererParams) => {
            const onClick = () => {
                console.log(' daata :', props);
                console.log(' daata :', typeof props?.node?.data);
                console.log(' daata :', typeof props?.colDef);
                const row: NmKConstraintRow = { ...props?.node?.data };
                onClickNmKConstraint(row, props?.colDef);
                console.log('alert bbbbbbbb');
            };
            if (props.value) {
                return (
                    <Button className={classes.button} onClick={onClick}>
                        {props.value}
                    </Button>
                );
            }
        },
        [classes.button]
    );

    const getRowStyle = useCallback(
        (params: RowClassParams, isFromContingency: boolean) => {
            if (
                (isFromContingency && params?.data?.contingencyId) ||
                (!isFromContingency && params?.data?.subjectId)
            ) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
    );
    const defaultColDef = useMemo(
        () => ({
            sortable: true,
            resizable: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            suppressMovable: true,
            flex: 1,
        }),
        []
    );

    const onGridReady = useCallback((params: GridReadyEvent) => {
        if (params?.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);

    const handlePostSortRows = (
        params: PostSortRowsParams,
        isFromContingency: boolean
    ) => {
        const rows = params.nodes;
        return Object.assign(
            rows,
            groupPostSort(
                rows,
                isFromContingency ? 'contingencyId' : 'subjectId',
                'linkedElementId',
                !isFromContingency
            )
        );
    };

    const securityAnalysisTableNmKContingenciesColumns = useMemo(() => {
        return securityAnalysisTableNmKContingenciesColumnsDefinition(
            intl,
            SubjectIdRenderer
        );
    }, [intl]);

    const rows = flattenNmKresultsContingencies(postContingencyResults, intl);
    const message = getNoRowsMessage(messages, rows, securityAnalysisStatus);

    const rowsToShow = getRows(rows, securityAnalysisStatus);
    return (
        <CustomAGGrid
            rowData={rowsToShow}
            columnDefs={securityAnalysisTableNmKContingenciesColumns}
            postSortRows={(params) => handlePostSortRows(params, true)}
            defaultColDef={defaultColDef}
            getRowStyle={(params) => getRowStyle(params, true)}
            onGridReady={onGridReady}
            overlayNoRowsTemplate={message}
        />
    );
};
