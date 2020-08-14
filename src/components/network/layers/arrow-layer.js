/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Layer, project32, picking } from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {
    Model,
    Geometry,
    Texture2D,
    FEATURES,
    hasFeatures,
    isWebGL2,
} from '@luma.gl/core';

import vs from './arrow-layer-vertex.glsl';
import fs from './arrow-layer-fragment.glsl';

const DEFAULT_COLOR = [0, 0, 0, 255];

// this value has to be consistent with the one in vertex shader
const MAX_LINE_POINT_COUNT = 2 ** 15;

export const ArrowDirection = {
    NONE: 'none',
    FROM_SIDE_1_TO_SIDE_2: 'fromSide1ToSide2',
    FROM_SIDE_2_TO_SIDE_1: 'fromSide2ToSide1',
};

const defaultProps = {
    sizeMinPixels: { type: 'number', min: 0, value: 0 }, //  min size in pixels
    sizeMaxPixels: { type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER }, // max size in pixels

    getDistance: { type: 'accessor', value: (arrow) => arrow.distance },
    getLine: { type: 'accessor', value: (arrow) => arrow.line },
    getLinePositions: { type: 'accessor', value: (line) => line.positions },
    getSize: { type: 'accessor', value: 1 },
    getColor: { type: 'accessor', value: DEFAULT_COLOR },
    getSpeedFactor: { type: 'accessor', value: 1.0 },
    getDirection: { type: 'accessor', value: ArrowDirection.NONE },
    animated: { type: 'boolean', value: true },
    getLineParallelIndex: { type: 'accessor', value: 0 },
    getLineAngle: { type: 'accessor', value: 0 },
    distanceBetweenLines: { type: 'number', value: 1000 },
    maxParallelOffset: { type: 'number', value: 100 },
    minParallelOffset: { type: 'number', value: 3 },
};

/**
 * A layer that draws arrows over the lines between voltage levels. The arrows are drawn on a direct line
 * or with a parallel offset. The initial point is also shifted to coincide with the fork line ends.
 * Needs to be kept in sync with ForkLineLayer and ParallelPathLayer because they draw the lines.
 * props : getLineParallelIndex: accessor for real number representing the parallel translation, normalized to distanceBetweenLines
 *         getLineAngle: accessor for line angle in radian
 *         distanceBetweenLines: distance in meters between line when no pixel clamping is applied
 *         maxParallelOffset: max pixel distance
 *         minParallelOffset: min pixel distance
 */
export default class ArrowLayer extends Layer {
    getShaders(id) {
        return super.getShaders({ vs, fs, modules: [project32, picking] });
    }

    getArrowLineAttributes(arrow) {
        const line = this.props.getLine(arrow);
        if (!line) {
            throw new Error('Invalid line');
        }
        const attributes = this.state.lineAttributes.get(line);
        if (!attributes) {
            throw new Error(`Line ${line.id} not found`);
        }
        return attributes;
    }

    initializeState() {
        const { gl } = this.context;

        if (!hasFeatures(gl, [FEATURES.TEXTURE_FLOAT])) {
            throw new Error('Arrow layer not supported on this browser');
        }

        const maxTextureSize = gl.getParameter(GL.MAX_TEXTURE_SIZE);
        this.state = {
            maxTextureSize,
            webgl2: isWebGL2(gl),
        };

        this.getAttributeManager().addInstanced({
            instanceSize: {
                size: 1,
                transition: true,
                accessor: 'getSize',
                defaultValue: 1,
            },
            instanceColor: {
                size: this.props.colorFormat.length,
                transition: true,
                normalized: true,
                type: GL.UNSIGNED_BYTE,
                accessor: 'getColor',
                defaultValue: [0, 0, 0, 255],
            },
            instanceSpeedFactor: {
                size: 1,
                transition: true,
                accessor: 'getSpeedFactor',
                defaultValue: 1.0,
            },
            instanceArrowDistance: {
                size: 1,
                transition: true,
                accessor: 'getDistance',
                type: GL.FLOAT,
                defaultValue: 0,
            },
            instanceArrowDirection: {
                size: 1,
                transition: true,
                accessor: 'getDirection',
                transform: (direction) => {
                    switch (direction) {
                        case ArrowDirection.NONE:
                            return 0.0;
                        case ArrowDirection.FROM_SIDE_1_TO_SIDE_2:
                            return 1.0;
                        case ArrowDirection.FROM_SIDE_2_TO_SIDE_1:
                            return 2.0;
                    }
                },
                defaultValue: 0.0,
            },
            instanceLineDistance: {
                size: 1,
                transition: true,
                type: GL.FLOAT,
                accessor: (arrow) =>
                    this.getArrowLineAttributes(arrow).distance,
            },
            instanceLinePositionsTextureOffset: {
                size: 1,
                transition: true,
                type: GL.FLOAT,
                accessor: (arrow) =>
                    this.getArrowLineAttributes(arrow).positionsTextureOffset,
            },
            instanceLineDistancesTextureOffset: {
                size: 1,
                transition: true,
                type: GL.FLOAT,
                accessor: (arrow) =>
                    this.getArrowLineAttributes(arrow).distancesTextureOffset,
            },
            instanceLinePointCount: {
                size: 1,
                transition: true,
                type: GL.FLOAT,
                accessor: (arrow) =>
                    this.getArrowLineAttributes(arrow).pointCount,
            },
            instanceLineParallelIndex: {
                size: 1,
                accessor: 'getLineParallelIndex',
                type: GL.FLOAT,
            },
            instanceLineAngle: {
                size: 1,
                accessor: 'getLineAngle',
                type: GL.FLOAT,
            },
        });
    }

    finalizeState() {
        super.finalizeState();
        // we do not use setState to avoid a redraw, it is just used to stop the animation
        this.state.stop = true;
    }

    createTexture2D(gl, data, elementSize, format, dataFormat) {
        const start = performance.now();

        // we calculate the smallest square texture that is a power of 2 but less or equals to MAX_TEXTURE_SIZE
        // (which is an property of the graphic card)
        const elementCount = data.length / elementSize;
        const n = Math.ceil(Math.log2(elementCount) / 2);
        const textureSize = 2 ** n;
        const { maxTextureSize } = this.state;
        if (textureSize > maxTextureSize) {
            throw new Error(
                `Texture size (${textureSize}) cannot be greater than ${maxTextureSize}`
            );
        }

        // data length needs to be width * height (otherwise we get an error), so we pad the data array with zero until
        // reaching the correct size.
        if (data.length < textureSize * textureSize * elementSize) {
            const oldLength = data.length;
            data.length = textureSize * textureSize * elementSize;
            data.fill(0, oldLength, textureSize * textureSize * elementSize);
        }

        const texture2d = new Texture2D(gl, {
            width: textureSize,
            height: textureSize,
            format: format,
            dataFormat: dataFormat,
            type: GL.FLOAT,
            data: new Float32Array(data),
            parameters: {
                [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
                [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
                [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
                [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
            },
            mipmaps: false,
        });

        const stop = performance.now();
        console.info(
            `Texture of ${elementCount} elements (${textureSize} * ${textureSize}) created in ${
                stop - start
            } ms`
        );

        return texture2d;
    }

    createTexturesStructure(props) {
        const start = performance.now();

        const linePositionsTextureData = [];
        const lineDistancesTextureData = [];
        const lineAttributes = new Map();
        let lineDistance = 0;

        // build line list from arrow list
        const lines = [
            ...new Set(props.data.map((arrow) => this.props.getLine(arrow))),
        ];

        lines.forEach((line) => {
            const positions = props.getLinePositions(line);
            if (!positions) {
                throw new Error(`Invalid positions for line ${line.id}`);
            }
            const linePositionsTextureOffset =
                linePositionsTextureData.length / 2;
            const lineDistancesTextureOffset = lineDistancesTextureData.length;
            let linePointCount = 0;
            if (positions.length > 0) {
                positions.forEach((position) => {
                    // fill line positions texture
                    linePositionsTextureData.push(position[0]);
                    linePositionsTextureData.push(position[1]);
                    linePointCount++;
                });
                lineDistancesTextureData.push(...line.cumulativeDistances);
                lineDistance =
                    line.cumulativeDistances[
                        line.cumulativeDistances.length - 1
                    ];
            }
            if (linePointCount > MAX_LINE_POINT_COUNT) {
                throw new Error(
                    `Too many line point count (${linePointCount}), maximum is ${MAX_LINE_POINT_COUNT}`
                );
            }

            lineAttributes.set(line, {
                distance: lineDistance,
                positionsTextureOffset: linePositionsTextureOffset,
                distancesTextureOffset: lineDistancesTextureOffset,
                pointCount: linePointCount,
            });
        });

        const stop = performance.now();
        console.info(`Texture data created in ${stop - start} ms`);

        return {
            linePositionsTextureData,
            lineDistancesTextureData,
            lineAttributes,
        };
    }

    updateGeometry({ props, changeFlags }) {
        const geometryChanged =
            changeFlags.dataChanged ||
            (changeFlags.updateTriggersChanged &&
                (changeFlags.updateTriggersChanged.all ||
                    changeFlags.updateTriggersChanged.getLinePositions));

        if (geometryChanged) {
            const { gl } = this.context;

            const {
                linePositionsTextureData,
                lineDistancesTextureData,
                lineAttributes,
            } = this.createTexturesStructure(props);

            const linePositionsTexture = this.createTexture2D(
                gl,
                linePositionsTextureData,
                2,
                this.state.webgl2 ? GL.RG32F : GL.LUMINANCE_ALPHA,
                this.state.webgl2 ? GL.RG : GL.LUMINANCE_ALPHA
            );
            const lineDistancesTexture = this.createTexture2D(
                gl,
                lineDistancesTextureData,
                1,
                this.state.webgl2 ? GL.R32F : GL.LUMINANCE,
                this.state.webgl2 ? GL.RED : GL.LUMINANCE
            );

            this.setState({
                linePositionsTexture,
                lineDistancesTexture,
                lineAttributes,
            });

            if (!changeFlags.dataChanged) {
                this.getAttributeManager().invalidateAll();
            }
        }
    }

    updateModel({ changeFlags }) {
        if (changeFlags.extensionsChanged) {
            const { gl } = this.context;

            const { model } = this.state;
            if (model) {
                model.delete();
            }

            this.setState({
                model: this._getModel(gl),
            });

            this.getAttributeManager().invalidateAll();
        }
    }

    updateState(updateParams) {
        super.updateState(updateParams);

        this.updateGeometry(updateParams);
        this.updateModel(updateParams);

        const { props, oldProps } = updateParams;

        if (props.animated !== oldProps.animated) {
            this.setState({
                stop: !props.animated,
                timestamp: 0,
            });
            if (props.animated) {
                this.startAnimation();
            }
        }
    }

    animate(timestamp) {
        if (this.state.stop) {
            return;
        }
        this.setState({
            timestamp: timestamp,
        });
        this.startAnimation();
    }

    startAnimation() {
        window.requestAnimationFrame((timestamp) => this.animate(timestamp));
    }

    draw({ uniforms }) {
        const { viewport } = this.context;

        const { sizeMinPixels, sizeMaxPixels } = this.props;

        const {
            linePositionsTexture,
            lineDistancesTexture,
            timestamp,
            webgl2,
        } = this.state;

        this.state.model
            .setUniforms(uniforms)
            .setUniforms({
                sizeMinPixels,
                sizeMaxPixels,
                linePositionsTexture,
                lineDistancesTexture,
                linePositionsTextureSize: [
                    linePositionsTexture.width,
                    linePositionsTexture.height,
                ],
                lineDistancesTextureSize: [
                    lineDistancesTexture.width,
                    lineDistancesTexture.height,
                ],
                timestamp,
                webgl2,
                distanceBetweenLines: this.props.distanceBetweenLines,
                maxParallelOffset: this.props.maxParallelOffset,
                minParallelOffset: this.props.minParallelOffset,
            })
            .draw();
    }

    _getModel(gl) {
        const positions = [
            -1,
            -1,
            0,
            0,
            1,
            0,
            0,
            -0.6,
            0,
            1,
            -1,
            0,
            0,
            1,
            0,
            0,
            -0.6,
            0,
        ];

        return new Model(
            gl,
            Object.assign(this.getShaders(), {
                id: this.props.id,
                geometry: new Geometry({
                    drawMode: GL.TRIANGLES,
                    vertexCount: 6,
                    attributes: {
                        positions: {
                            size: 3,
                            value: new Float32Array(positions),
                        },
                    },
                }),
                isInstanced: true,
            })
        );
    }
}

ArrowLayer.layerName = 'ArrowLayer';
ArrowLayer.defaultProps = defaultProps;
