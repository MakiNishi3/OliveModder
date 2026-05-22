// lumiwavewarp.frag
#version 130

in vec2 uv;
out vec4 fragColor;

uniform sampler2D tex;
uniform float time;

uniform float frequency_x;
uniform float frequency_y;
uniform float amplitude_x;
uniform float amplitude_y;
uniform float speed;
uniform float luminance_influence;

void main()
{
    vec4 baseColor = texture(tex, uv);
    float luminance = dot(baseColor.rgb, vec3(0.299, 0.587, 0.114));
    
    float modifier = 1.0 + (luminance * luminance_influence);
    
    float offsetX = sin((uv.y * frequency_x) + (time * speed)) * amplitude_x * modifier;
    float offsetY = cos((uv.x * frequency_y) + (time * speed)) * amplitude_y * modifier;
    
    vec2 distortedUv = uv + vec2(offsetX, offsetY);
    
    if (distortedUv.x < 0.0 || distortedUv.x > 1.0 || distortedUv.y < 0.0 || distortedUv.y > 1.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 0.0);
    } else {
        fragColor = texture(tex, distortedUv);
    }
}
