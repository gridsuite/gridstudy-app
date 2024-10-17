/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import LogTable from './log-table';
import ReportTreeViewContext from './report-tree-view-context';
import ReportTree from './report-tree';
import ReportItem from './report-item';
import { mapReportsTree } from '../../utils/report-tree.mapper';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { setLogsFilter } from 'redux/actions';

// WARNING this file has been copied from commons-ui, and updated here. Putting it back to commons-ui has to be discussed.

const styles = {
    treeItem: {
        whiteSpace: 'nowrap',
    },
};

export default function ReportViewer({ report, reportType }) {
    const dispatch = useDispatch();

    const [expandedTreeReports, setExpandedTreeReports] = useState([]);
    const [highlightedReportId, setHighlightedReportId] = useState();
    const [reportVerticalPositionFromTop, setReportVerticalPositionFromTop] = useState(undefined);

    const [selectedReportId, setSelectedReportId] = useState(report?.id);
    const [severities, setSeverities] = useState([]);
    const [selectedReportType, setSelectedReportType] = useState();

    const reportTreeData = useRef({});
    const treeView = useRef(null);

    /**
     * Build the tree view (left pane) creating all ReportItem from json data
     * @type {Function}
     */
    const initializeTreeDataAndComponent = useCallback((report) => {
        reportTreeData.current[report.id] = report;
        return (
            <ReportItem
                labelText={report.message}
                labelIconColor={report.highestSeverity.colorName}
                key={report.id}
                sx={styles.treeItem}
                nodeId={report.id}
            >
                {report.subReports.map((value) => initializeTreeDataAndComponent(value))}
            </ReportItem>
        );
    }, []);

    useEffect(() => {
        const reportTree = mapReportsTree(report);
        treeView.current = initializeTreeDataAndComponent(reportTree);
        setExpandedTreeReports([report.id]);
        setSelectedReportId(report.id);
        setSeverities(reportTree.severities);
        setSelectedReportType(reportTreeData.current[report.id]?.type);
    }, [report, initializeTreeDataAndComponent, dispatch]);

    const handleReportVerticalPositionFromTop = useCallback((node) => {
        setReportVerticalPositionFromTop(node?.getBoundingClientRect()?.top);
    }, []);

    const handleSelectNode = (_, reportId) => {
        if (selectedReportId !== reportId) {
            // Temporary solution to reset the filter each time reports are fetched.
            // This approach removes the persistence behavior of the filter.
            // It will be removed once we have a better solution to handle the difference
            // between default severities and excluded severities.
            dispatch(setLogsFilter(reportType, []));

            setSelectedReportId(reportId);
            setSeverities(reportTreeData.current[reportId].severities);
            setSelectedReportType(reportTreeData.current[reportId].type);
        }
    };

    // The MUI TreeView/TreeItems use useMemo on our items, so it's important to avoid changing the context
    const isHighlighted = useMemo(
        () => ({
            isHighlighted: (reportId) => highlightedReportId === reportId,
        }),
        [highlightedReportId]
    );

    const onLogRowClick = (data) => {
        setExpandedTreeReports((previouslyExpandedTreeReports) => {
            let treeReportsToExpand = new Set(previouslyExpandedTreeReports);
            let parentId = data.parentId;
            while (reportTreeData.current[parentId]?.parentId) {
                parentId = reportTreeData.current[parentId].parentId;
                treeReportsToExpand.add(parentId);
            }
            return Array.from(treeReportsToExpand);
        });
        setHighlightedReportId(data.parentId);
    };

    return (
        report && (
            <Grid
                container
                ref={handleReportVerticalPositionFromTop}
                sx={{
                    // We calculate the remaining height relative to the viewport and the top position of the report.
                    height:
                        'calc(100vh - ' +
                        (reportVerticalPositionFromTop || '160') + // The value 160 is fine, but leaves a gap below the report.
                        'px)',
                }}
            >
                {/*Passing a ref to isHighlighted to all children (here
                    TreeItems) wouldn't work since TreeView children are
                    memoized and would then be rerendered only when TreeView is
                    rerendered. That's why we pass the isHighlighted callback in
                    a new context, to which all children subscribe and as soon
                    as the context is modified, children will be rerendered
                    accordingly */}
                <ReportTreeViewContext.Provider value={isHighlighted}>
                    {/*TODO do we need to useMemo/useCallback these props to avoid rerenders ?*/}
                    <ReportTree
                        selectedReportId={selectedReportId}
                        expandedTreeReports={expandedTreeReports}
                        setExpandedTreeReports={setExpandedTreeReports}
                        handleSelectNode={handleSelectNode}
                    >
                        {treeView.current}
                    </ReportTree>
                </ReportTreeViewContext.Provider>
                <Grid item xs={12} sm={9} sx={{ height: '100%' }}>
                    <LogTable
                        selectedReportId={selectedReportId}
                        reportType={reportType}
                        reportNature={selectedReportType} // GlobalReport or NodeReport
                        severities={severities}
                        onRowClick={onLogRowClick}
                    />
                </Grid>
            </Grid>
        )
    );
}

ReportViewer.propTypes = {
    report: PropTypes.shape({
        id: PropTypes.string,
        message: PropTypes.string,
        highestSeverity: PropTypes.shape({
            colorName: PropTypes.string,
        }),
        subReports: PropTypes.arrayOf(PropTypes.object),
        severities: PropTypes.arrayOf(PropTypes.string),
    }),
    reportType: PropTypes.string.isRequired,
};
