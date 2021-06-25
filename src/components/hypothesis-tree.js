import React from 'react';
import Tree from 'react-d3-tree';
import orgChartJson from '../data/poc-hypos-data.json';
import { useCallback, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

const containerStyles = {
    width: '100vw',
    height: '100vh',
};

const useCenteredTree = () => {
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const containerRef = useCallback((containerElem) => {
        if (containerElem !== null) {
            const { width, height } = containerElem.getBoundingClientRect();
            setTranslate({ x: width / 2, y: height / 2 });
        }
    }, []);
    return [translate, containerRef];
};

const renderNode = (hypo) => {
    return (
        <h3 style={{ textAlign: 'center' }}>hypo</h3>
    )
};

// Here we're using `renderCustomNodeElement` render a component that uses
// both SVG and HTML tags side-by-side.
// This is made possible by `foreignObject`, which wraps the HTML tags to
// allow for them to be injected into the SVG namespace.
const renderForeignObjectNode = ({
    nodeDatum,
    toggleNode,
    foreignObjectProps,
}) => (
    <g>
        {/* `foreignObject` requires width & height to be explicitly set. */}
        <foreignObject {...foreignObjectProps}>

            <div
                style={{
                    border: '1px solid black',
                    backgroundColor: '#dedede',
                    align: 'flex,'
                }}
            >
                {nodeDatum.__rd3t.depth == 0 && (
                    <Button color="primary" onClick={toggleNode}>{nodeDatum.name}</Button>
                )}
                {nodeDatum.__rd3t.depth > 0 && (
                    nodeDatum.hypos.map( (hyp) =>
                        <Button color="secondary" onClick={toggleNode}>{hyp}</Button>
                )
                )}
            </div>
        </foreignObject>
    </g>
);

export default function HypothesisTree() {
    const [translate, containerRef] = useCenteredTree();
    const nodeSize = { x: 200, y: 100 };
    const foreignObjectProps = {
        width: nodeSize.x,
        height: nodeSize.y,
        x: -100,
        y: -50,
    };
    return (
        <div style={containerStyles} ref={containerRef}>
            <Tree
                data={orgChartJson}
                translate={translate}
                nodeSize={nodeSize}
                renderCustomNodeElement={(rd3tProps) =>
                    renderForeignObjectNode({
                        ...rd3tProps,
                        foreignObjectProps,
                    })
                }
                orientation="vertical"
            />
        </div>
    );
}
