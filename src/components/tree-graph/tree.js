import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import G6 from '@antv/g6';

const Tree = ({ data }) => {
    const ref = React.useRef(null);
    let graph = null;

    useEffect(() => {
        if (!graph) {
            graph = new G6.TreeGraph({
                container: ReactDOM.findDOMNode(ref.current),
                width: 1200,
                height: 800,
                fitView: true,
                linkCenter: true,
                modes: {
                    default: [
                        {
                            type: 'collapse-expand',
                            onChange: function onChange(item, collapsed) {
                                const data = item.getModel();
                                data.collapsed = collapsed;
                                return true;
                            },
                        },
                        'drag-canvas',
                        'zoom-canvas',
                    ],
                },
                defaultNode: {
                    type: 'rect',
                    size: [100, 20],
                    anchorPoints: [
                        [0, 0],
                        [1, 1],
                    ],
                },
                defaultEdge: {
                    type: 'cubic-vertical',
                },
                nodeStateStyles: {
                    // The state styles defined as following will take effect on keyShape only. To define state styles on other shapes, refer to the link Configure Styles for State above
                    hover: {
                        lineWidth: 2,
                    },
                },
                layout: {
                    type: 'compactBox',
                    direction: 'TB',
                    getId: function getId(d) {
                        return d.id;
                    },
                    getHeight: function getHeight() {
                        return 20;
                    },
                    getWidth: function getWidth() {
                        return 100;
                    },
                    getVGap: function getVGap() {
                        return 30;
                    },
                    getHGap: function getHGap() {
                        return 30;
                    },
                },
            });
        }
        graph.data(data);
        graph.render();
        // Listen to the mouse enter event on node
        graph.on('node:mouseenter', (evt) => {
            const node = evt.item;
            // activate the hover state of the node
            graph.setItemState(node, 'hover', true);
        });
        // Listen to the mouse leave event on node
        graph.on('node:mouseleave', (evt) => {
            const node = evt.item;
            // inactivate the hover state of the node
            graph.setItemState(node, 'hover', false);
        });
    }, []);

    return <div ref={ref} />;
};

export default Tree;
