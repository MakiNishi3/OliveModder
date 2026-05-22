uniform sampler2D tex;
varying vec2 uv;

uniform bool preserve_hue;
uniform float rotation;
uniform vec2 position;
uniform vec2 scale;
uniform float pre_brightness;
uniform float new_opacity;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 st = uv - vec2(0.5);
    float rad = radians(-rotation);
    mat2 rotMat = mat2(cos(rad), -sin(rad), sin(rad), cos(rad));
    st = rotMat * st;
    st = st / vec2(max(scale.x, 0.001), max(scale.y, 0.001));
    st = st - position;
    vec2 texCoord = st + vec2(0.5);

    if (texCoord.x < 0.0 || texCoord.x > 1.0 || texCoord.y < 0.0 || texCoord.y > 1.0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec4 color = texture2D(tex, texCoord);
    vec3 rgb = color.rgb * pre_brightness;

    if (preserve_hue) {
        float originalLuminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
        vec3 hsv = rgb2hsv(rgb);
        float targetLuminance = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
        if (originalLuminance > 0.001) {
            rgb = color.rgb * (targetLuminance / originalLuminance);
        }
    }

    gl_FragColor = vec4(rgb, color.a * new_opacity);
}
