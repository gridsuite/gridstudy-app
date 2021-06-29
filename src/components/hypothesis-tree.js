import React from 'react';
import Tree from 'react-d3-tree';
import orgChartJson from '../data/poc-hypos-data.json';
import { useCallback, useState } from 'react';
import Button from '@material-ui/core/Button';

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

const renderRoot = (nodeDatum, toggleNode, foreignObjectProps) => {
    return (
        <foreignObject {...foreignObjectProps}>
            <div
                style={{
                    border: '1px solid black',
                    backgroundColor: '#dedede',
                    align: 'flex,',
                }}
            >
                <Button color="primary" onClick={toggleNode}>
                    {nodeDatum.name}
                </Button>
            </div>
        </foreignObject>
    );
};

const renderNode = (nodeDatum, toggleNode, foreignObjectProps) => {
    return (
        <foreignObject {...foreignObjectProps}>
            <div
                style={{
                    border: '1px solid black',
                    backgroundColor: '#dedede',
                    align: 'flex,',
                }}
            >
                {nodeDatum.hypos.map((hyp) => (
                    <Button color="secondary" onClick={toggleNode}>
                        {hyp}
                    </Button>
                ))}
            </div>
        </foreignObject>
    );
};

// Here we're using `renderCustomNodeElement` render a component that uses
// both SVG and HTML tags side-by-side.
// This is made possible by `foreignObject`, which wraps the HTML tags to
// allow for them to be injected into the SVG namespace.
const renderForeignObjectNode = ({
    nodeDatum,
    toggleNode,
    foreignObjectProps,
}) => {
    return (
        <g>
            {nodeDatum.__rd3t.depth === 0 &&
                renderRoot(nodeDatum, toggleNode, foreignObjectProps)}
            {nodeDatum.__rd3t.depth > 0 &&
                renderNode(nodeDatum, toggleNode, foreignObjectProps)}
        </g>
    );
};

export default function HypothesisTree() {
    const [translate, containerRef] = useCenteredTree();
    const nodeSize = { x: 200, y: 200 };
    const foreignObjectProps = {
        width: nodeSize.x,
        height: nodeSize.y,
        x: -100,
        y: 0,
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
