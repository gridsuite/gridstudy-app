export default `\
#version 300 es
#define SHADER_NAME arrow-layer-fragment-shader

precision highp float;

in vec4 vFillColor;
in float shouldDiscard;
out vec4 fragmentColor;

void main(void) {
    if (shouldDiscard > 0.0) {
        discard;
    }
    fragmentColor = vFillColor;
}
`;
