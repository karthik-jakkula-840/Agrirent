import os
import math
from PIL import Image, ImageDraw

def render_master_icon(size=2048):
    # High-resolution canvas for supersampled anti-aliasing
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    scale = size / 512.0

    # 1. Background Gradient Squircle
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    
    # Rich agricultural emerald gradient (#22C55E -> #16A34A -> #15803D)
    for y in range(size):
        ratio = y / size
        r = int(34 * (1 - ratio) + 18 * ratio)
        g = int(197 * (1 - ratio) + 120 * ratio)
        b = int(94 * (1 - ratio) + 55 * ratio)
        bg_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    # Mask for smooth rounded corners (Squircle / iOS / Android app style)
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    radius = int(112 * scale)
    mask_draw.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=radius, fill=255)
    
    img.paste(bg, (0, 0), mask)
    draw = ImageDraw.Draw(img)

    # Subtle inner border stroke
    border_w = int(6 * scale)
    draw.rounded_rectangle(
        [(border_w + int(2 * scale), border_w + int(2 * scale)), 
         (size - border_w - int(3 * scale), size - border_w - int(3 * scale))],
        radius=radius - int(4 * scale),
        outline=(255, 255, 255, 50),
        width=border_w
    )

    # 2. Golden Sprout / Growth Symbol (Top-Right of Tractor)
    gold_main = (245, 158, 11, 255)      # Amber-500 #F59E0B
    gold_light = (253, 224, 71, 255)     # Yellow-300 #FDE047
    
    # Primary curved sprout leaf
    leaf1_pts = [
        (int(340 * scale), int(190 * scale)),
        (int(368 * scale), int(140 * scale)),
        (int(410 * scale), int(98 * scale)),
        (int(438 * scale), int(90 * scale)),
        (int(442 * scale), int(118 * scale)),
        (int(418 * scale), int(168 * scale)),
        (int(376 * scale), int(200 * scale)),
        (int(340 * scale), int(190 * scale)),
    ]
    draw.polygon(leaf1_pts, fill=gold_main)
    # Leaf central spine
    draw.line([
        (int(346 * scale), int(186 * scale)),
        (int(390 * scale), int(140 * scale)),
        (int(432 * scale), int(100 * scale))
    ], fill=gold_light, width=int(5 * scale))

    # Secondary smaller sprout leaf
    leaf2_pts = [
        (int(340 * scale), int(190 * scale)),
        (int(306 * scale), int(165 * scale)),
        (int(280 * scale), int(150 * scale)),
        (int(275 * scale), int(162 * scale)),
        (int(290 * scale), int(185 * scale)),
        (int(320 * scale), int(200 * scale)),
        (int(340 * scale), int(190 * scale)),
    ]
    draw.polygon(leaf2_pts, fill=gold_light)

    # 3. Tractor Body Elements
    white = (255, 255, 255, 255)
    dark_slate = (15, 23, 42, 255)      # #0F172A

    # Vertical Exhaust Stack
    draw.rounded_rectangle(
        [(int(332 * scale), int(140 * scale)), (int(346 * scale), int(230 * scale))],
        radius=int(4 * scale),
        fill=white
    )
    # Exhaust rain cap
    draw.line(
        [(int(346 * scale), int(140 * scale)), (int(358 * scale), int(140 * scale))],
        fill=white,
        width=int(5 * scale)
    )

    # Cabin Roof
    draw.rounded_rectangle(
        [(int(115 * scale), int(155 * scale)), (int(255 * scale), int(176 * scale))],
        radius=int(6 * scale),
        fill=white
    )
    # Cabin Pillars
    draw.rounded_rectangle(
        [(int(120 * scale), int(174 * scale)), (int(138 * scale), int(280 * scale))],
        radius=int(4 * scale),
        fill=white
    )
    draw.rounded_rectangle(
        [(int(236 * scale), int(174 * scale)), (int(254 * scale), int(280 * scale))],
        radius=int(4 * scale),
        fill=white
    )
    # Cabin Glass (translucent cyan-white)
    draw.rounded_rectangle(
        [(int(138 * scale), int(176 * scale)), (int(236 * scale), int(255 * scale))],
        radius=int(4 * scale),
        fill=(255, 255, 255, 85)
    )
    # Driver Seat silhouette
    draw.rounded_rectangle(
        [(int(155 * scale), int(210 * scale)), (int(178 * scale), int(255 * scale))],
        radius=int(3 * scale),
        fill=(255, 255, 255, 170)
    )
    # Steering Column
    draw.line(
        [(int(215 * scale), int(245 * scale)), (int(228 * scale), int(218 * scale))],
        fill=(255, 255, 255, 220),
        width=int(4 * scale)
    )

    # Engine Hood (aerodynamic modern tractor hood)
    hood_pts = [
        (int(250 * scale), int(225 * scale)),
        (int(395 * scale), int(225 * scale)),
        (int(416 * scale), int(245 * scale)),
        (int(416 * scale), int(315 * scale)),
        (int(250 * scale), int(315 * scale)),
    ]
    draw.polygon(hood_pts, fill=white)

    # Front Grille Vents (emerald accent cutouts)
    grille_color = (21, 128, 61, 255)
    for gy in [252, 272, 292]:
        draw.rounded_rectangle(
            [(int(380 * scale), int(gy * scale)), (int(406 * scale), int((gy + 10) * scale))],
            radius=int(3 * scale),
            fill=grille_color
        )

    # Headlight (Warm Amber Glow)
    draw.rounded_rectangle(
        [(int(411 * scale), int(238 * scale)), (int(422 * scale), int(260 * scale))],
        radius=int(3 * scale),
        fill=gold_main
    )

    # Chassis / Body Base
    draw.rectangle(
        [(int(130 * scale), int(265 * scale)), (int(390 * scale), int(340 * scale))],
        fill=white
    )

    # 4. Heavy Duty Wheels
    # Big Rear Wheel: Center (170, 345), Radius 80
    rx, ry, rr = int(170 * scale), int(345 * scale), int(80 * scale)
    # Outer white rim border
    draw.ellipse([(rx - rr, ry - rr), (rx + rr, ry + rr)], fill=white)
    # Rugged Dark Tire
    tr = int(70 * scale)
    draw.ellipse([(rx - tr, ry - tr), (rx + tr, ry + tr)], fill=dark_slate)
    # Golden Rim Center
    hr = int(43 * scale)
    draw.ellipse([(rx - hr, ry - hr), (rx + hr, ry + hr)], fill=gold_main)
    # Center Axle Cap
    cr = int(18 * scale)
    draw.ellipse([(rx - cr, ry - cr), (rx + cr, ry + cr)], fill=dark_slate)

    # Rim Lug Nuts
    bolt_dist = int(29 * scale)
    bolt_r = int(3.5 * scale)
    for angle in [0, 45, 90, 135, 180, 225, 270, 315]:
        rad = math.radians(angle)
        bx = rx + int(bolt_dist * math.cos(rad))
        by = ry + int(bolt_dist * math.sin(rad))
        draw.ellipse([(bx - bolt_r, by - bolt_r), (bx + bolt_r, by + bolt_r)], fill=white)

    # Front Steer Wheel: Center (380, 370), Radius 54
    fx, fy, fr = int(380 * scale), int(370 * scale), int(54 * scale)
    # White border
    draw.ellipse([(fx - fr, fy - fr), (fx + fr, fy + fr)], fill=white)
    # Dark tire
    ftr = int(46 * scale)
    draw.ellipse([(fx - ftr, fy - ftr), (fx + ftr, fy + ftr)], fill=dark_slate)
    # Golden Hub
    fhr = int(27 * scale)
    draw.ellipse([(fx - fhr, fy - fhr), (fx + fhr, fy + fhr)], fill=gold_main)
    # Center Cap
    fcr = int(11 * scale)
    draw.ellipse([(fx - fcr, fy - fcr), (fx + fcr, fy + fcr)], fill=dark_slate)

    # 5. Field Ground Base Track
    draw.rounded_rectangle(
        [(int(80 * scale), int(432 * scale)), (int(435 * scale), int(442 * scale))],
        radius=int(5 * scale),
        fill=(255, 255, 255, 75)
    )

    return img

def create_svg():
    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="agriBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22C55E" />
      <stop offset="50%" stop-color="#16A34A" />
      <stop offset="100%" stop-color="#15803D" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#052e16" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect width="512" height="512" rx="112" fill="url(#agriBg)" />
  <rect x="7" y="7" width="498" height="498" rx="106" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="6" />

  <!-- Harvest / Sprout Accent -->
  <g filter="url(#subtleShadow)">
    <path d="M340 190 C368 140 410 98 438 90 C442 118 418 168 376 200 C350 195 344 192 340 190 Z" fill="url(#goldGrad)" />
    <path d="M346 186 Q390 140 432 100" stroke="#FEF08A" stroke-width="5" stroke-linecap="round" fill="none" />
    <path d="M340 190 C306 165 280 150 275 162 C290 185 320 200 340 190 Z" fill="#FDE047" />
  </g>

  <!-- Tractor Silhouette -->
  <g filter="url(#subtleShadow)">
    <!-- Exhaust Pipe -->
    <rect x="332" y="140" width="14" height="90" rx="4" fill="#FFFFFF" />
    <path d="M346 140 L358 140" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" />

    <!-- Cabin Roof and Pillars -->
    <rect x="115" y="155" width="140" height="21" rx="6" fill="#FFFFFF" />
    <rect x="120" y="174" width="18" height="106" rx="4" fill="#FFFFFF" />
    <rect x="236" y="174" width="18" height="106" rx="4" fill="#FFFFFF" />
    <rect x="138" y="176" width="98" height="79" rx="4" fill="rgba(255,255,255,0.32)" />
    <rect x="155" y="210" width="23" height="45" rx="3" fill="rgba(255,255,255,0.65)" />
    <line x1="215" y1="245" x2="228" y2="218" stroke="rgba(255,255,255,0.85)" stroke-width="4" stroke-linecap="round" />

    <!-- Engine Hood -->
    <path d="M250 225 L395 225 Q416 225 416 245 L416 315 L250 315 Z" fill="#FFFFFF" />
    
    <!-- Grille Slots -->
    <rect x="380" y="252" width="26" height="10" rx="3" fill="#15803D" />
    <rect x="380" y="272" width="26" height="10" rx="3" fill="#15803D" />
    <rect x="380" y="292" width="26" height="10" rx="3" fill="#15803D" />

    <!-- Headlight -->
    <rect x="411" y="238" width="11" height="22" rx="3" fill="#F59E0B" />

    <!-- Chassis Base -->
    <rect x="130" y="265" width="260" height="75" fill="#FFFFFF" />

    <!-- Rear Heavy Wheel -->
    <g>
      <circle cx="170" cy="345" r="80" fill="#FFFFFF" />
      <circle cx="170" cy="345" r="70" fill="#0F172A" />
      <circle cx="170" cy="345" r="43" fill="url(#goldGrad)" />
      <circle cx="170" cy="345" r="18" fill="#0F172A" />
      <!-- Lug nuts -->
      <circle cx="141" cy="345" r="3.5" fill="#FFFFFF" />
      <circle cx="199" cy="345" r="3.5" fill="#FFFFFF" />
      <circle cx="170" cy="316" r="3.5" fill="#FFFFFF" />
      <circle cx="170" cy="374" r="3.5" fill="#FFFFFF" />
      <circle cx="149" cy="324" r="3.5" fill="#FFFFFF" />
      <circle cx="191" cy="366" r="3.5" fill="#FFFFFF" />
      <circle cx="149" cy="366" r="3.5" fill="#FFFFFF" />
      <circle cx="191" cy="324" r="3.5" fill="#FFFFFF" />
    </g>

    <!-- Front Steer Wheel -->
    <g>
      <circle cx="380" cy="370" r="54" fill="#FFFFFF" />
      <circle cx="380" cy="370" r="46" fill="#0F172A" />
      <circle cx="380" cy="370" r="27" fill="url(#goldGrad)" />
      <circle cx="380" cy="370" r="11" fill="#0F172A" />
    </g>
  </g>

  <!-- Ground Track Line -->
  <rect x="80" y="432" width="355" height="10" rx="5" fill="rgba(255,255,255,0.25)" />
</svg>"""

def main():
    os.makedirs("public", exist_ok=True)
    os.makedirs("app", exist_ok=True)

    # 1. Supersampled high-res rendering (2048x2048)
    master_2048 = render_master_icon(2048)
    
    # 2. Downsample to master 512x512 with high-quality Lanczos resampling
    img_512 = master_2048.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save("public/icon-512.png", format="PNG")
    img_512.save("public/icon.png", format="PNG")
    img_512.save("app/icon.png", format="PNG")

    # 3. 192x192 PWA Icon
    img_192 = master_2048.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save("public/icon-192.png", format="PNG")

    # 4. 180x180 Apple Touch Icon
    img_180 = master_2048.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save("public/apple-touch-icon.png", format="PNG")
    img_180.save("app/apple-icon.png", format="PNG")

    # 5. Multi-resolution ICO (16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img_512.save("public/favicon.ico", format="ICO", sizes=ico_sizes)
    img_512.save("app/favicon.ico", format="ICO", sizes=ico_sizes)

    # 6. Scalable SVG icons
    svg_content = create_svg()
    with open("public/icon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    with open("public/favicon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    with open("app/icon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)

    print("All favicon, apple-touch, and PWA assets generated successfully!")

if __name__ == "__main__":
    main()
