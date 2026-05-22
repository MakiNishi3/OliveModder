varying vec2 v_TexCoord;
uniform sampler2D u_Texture;

uniform float u_Amount;
uniform float u_Speed;
uniform float u_Time;
uniform float u_Seed;

float hash(float n)
{
    return fract(sin(n) * 43758.5453123);
}

float noise(vec2 p)
{
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = i.x + i.y * 57.0;
    return mix(mix(hash(n + 0.0), hash(n + 1.0), f.x), mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
}

void main(void)
{
    vec2 t = vec2(u_Time * u_Speed + u_Seed, u_Time * u_Speed * 1.5 + u_Seed + 10.0);
    vec2 offset = vec2(noise(t), noise(t + vec2(20.0, 30.0))) * 2.0 - 1.0;
    vec2 uv = v_TexCoord + offset * (u_Amount * 0.1);
    gl_FragColor = texture2D(u_Texture, clamp(uv, 0.0, 1.0));
}
