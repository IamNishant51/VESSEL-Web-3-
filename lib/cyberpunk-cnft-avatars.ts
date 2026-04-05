/**
 * Premium Cyberpunk cNFT Avatars
 * Unique pixel-art style cyberpunk animals/characters on vibrant gradient backgrounds
 * Each agent gets a completely different, premium-looking avatar
 */

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashAgentId(agentId: string): number {
  let hash = 5381;
  for (let i = 0; i < agentId.length; i++) {
    hash = ((hash << 5) + hash) ^ agentId.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

const BG_GRADIENTS = [
  ["#1a0a2e", "#4a1942", "#c2185b", "#ff6b35"],
  ["#0a1628", "#1a3a5c", "#00bcd4", "#00e5ff"],
  ["#0d0d2b", "#1a237e", "#7c4dff", "#e040fb"],
  ["#1b0a2e", "#4a148c", "#d500f9", "#ff1744"],
  ["#0a1a1a", "#004d40", "#00e676", "#76ff03"],
  ["#1a0a0a", "#b71c1c", "#ff5252", "#ffab40"],
  ["#0a0a2e", "#283593", "#536dfe", "#40c4ff"],
  ["#1a0a28", "#6a1b9a", "#e040fb", "#ff80ab"],
  ["#0d1b2a", "#1b5e20", "#69f0ae", "#00e676"],
  ["#2a0a1a", "#c62828", "#ff5252", "#ff8a65"],
  ["#0a1a2e", "#0277bd", "#00e5ff", "#84ffff"],
  ["#1a0a2e", "#6a1b9a", "#ea80fc", "#ff80ab"],
  ["#0a2a1a", "#2e7d32", "#b9f6ca", "#69f0ae"],
  ["#2a1a0a", "#e65100", "#ff9100", "#ffab40"],
  ["#0a0a1a", "#311b92", "#7c4dff", "#b388ff"],
];

function drawPixelGrid(ctx: CanvasRenderingContext2D, size: number, pixelSize: number): void {
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= size; x += pixelSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += pixelSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
}

function drawGlowCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, glowSize: number): void {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = glowSize;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawPixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, pixelSize: number): void {
  const px = Math.round(x / pixelSize) * pixelSize;
  const py = Math.round(y / pixelSize) * pixelSize;
  const pw = Math.round(w / pixelSize) * pixelSize;
  const ph = Math.round(h / pixelSize) * pixelSize;
  ctx.fillStyle = color;
  ctx.fillRect(px, py, pw, ph);
}

function drawCyberWolf(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, colors: string[], rng: () => number): void {
  const ps = size / 32;
  
  // Head shape
  ctx.fillStyle = colors[2];
  // Ears
  drawPixelRect(ctx, cx - 50, cy - 80, 20, 40, colors[2], ps);
  drawPixelRect(ctx, cx + 30, cy - 80, 20, 40, colors[2], ps);
  drawPixelRect(ctx, cx - 40, cy - 60, 10, 20, colors[3], ps);
  drawPixelRect(ctx, cx + 40, cy - 60, 10, 20, colors[3], ps);
  
  // Head
  drawPixelRect(ctx, cx - 60, cy - 40, 120, 80, colors[2], ps);
  drawPixelRect(ctx, cx - 50, cy - 30, 100, 60, colors[1], ps);
  
  // Snout
  drawPixelRect(ctx, cx - 30, cy + 20, 60, 40, colors[2], ps);
  drawPixelRect(ctx, cx - 20, cy + 30, 40, 20, colors[1], ps);
  
  // Nose
  drawPixelRect(ctx, cx - 10, cy + 40, 20, 10, "#000", ps);
  
  // Eyes (glowing)
  drawGlowCircle(ctx, cx - 25, cy - 10, 8, colors[3], 15);
  drawGlowCircle(ctx, cx + 25, cy - 10, 8, colors[3], 15);
  drawPixelRect(ctx, cx - 30, cy - 15, 10, 10, "#fff", ps);
  drawPixelRect(ctx, cx + 20, cy - 15, 10, 10, "#fff", ps);
  
  // Cyber lines
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 40, cy - 20);
  ctx.lineTo(cx - 20, cy - 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 40, cy - 20);
  ctx.lineTo(cx + 20, cy - 10);
  ctx.stroke();
  
  // Circuit details
  for (let i = 0; i < 3; i++) {
    const x = cx - 40 + i * 40;
    const y = cy + 50 + i * 5;
    drawPixelRect(ctx, x, y, 8, 8, colors[3], ps);
  }
}

function drawCyberFox(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, colors: string[], rng: () => number): void {
  const ps = size / 32;
  
  // Ears (pointy)
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.moveTo(cx - 50, cy - 30);
  ctx.lineTo(cx - 30, cy - 90);
  ctx.lineTo(cx - 10, cy - 30);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 50, cy - 30);
  ctx.lineTo(cx + 30, cy - 90);
  ctx.lineTo(cx + 10, cy - 30);
  ctx.fill();
  
  // Inner ears
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.moveTo(cx - 40, cy - 35);
  ctx.lineTo(cx - 30, cy - 70);
  ctx.lineTo(cx - 20, cy - 35);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 40, cy - 35);
  ctx.lineTo(cx + 30, cy - 70);
  ctx.lineTo(cx + 20, cy - 35);
  ctx.fill();
  
  // Head
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, 55, 45, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Face
  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.ellipse(cx, cy, 40, 35, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Snout
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.moveTo(cx - 25, cy + 10);
  ctx.lineTo(cx, cy + 50);
  ctx.lineTo(cx + 25, cy + 10);
  ctx.fill();
  
  // Nose
  drawGlowCircle(ctx, cx, cy + 45, 6, "#000", 0);
  
  // Eyes (slanted, glowing)
  ctx.save();
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = 15;
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.ellipse(cx - 20, cy - 10, 10, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 20, cy - 10, 10, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Pupils
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(cx - 20, cy - 10, 4, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 20, cy - 10, 4, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Cyber markings
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy - 25);
  ctx.lineTo(cx - 15, cy - 15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 35, cy - 25);
  ctx.lineTo(cx + 15, cy - 15);
  ctx.stroke();
}

function drawCyberOwl(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, colors: string[], rng: () => number): void {
  const ps = size / 32;
  
  // Body
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, 55, 65, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.ellipse(cx, cy - 30, 50, 45, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Ears (tufts)
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.moveTo(cx - 40, cy - 60);
  ctx.lineTo(cx - 30, cy - 90);
  ctx.lineTo(cx - 20, cy - 60);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 40, cy - 60);
  ctx.lineTo(cx + 30, cy - 90);
  ctx.lineTo(cx + 20, cy - 60);
  ctx.fill();
  
  // Eyes (large circles)
  ctx.save();
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = 20;
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.arc(cx - 22, cy - 35, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 22, cy - 35, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Inner eyes
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cx - 22, cy - 35, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 22, cy - 35, 10, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupils
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.arc(cx - 22, cy - 35, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 22, cy - 35, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Beak
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 15);
  ctx.lineTo(cx, cy + 5);
  ctx.lineTo(cx + 8, cy - 15);
  ctx.fill();
  
  // Chest pattern
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy + 20 + i * 12, 20 - i * 3, 0, Math.PI);
    ctx.stroke();
  }
  
  // Cyber circuit lines
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 40, cy - 50);
  ctx.lineTo(cx - 25, cy - 40);
  ctx.lineTo(cx - 25, cy - 25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 40, cy - 50);
  ctx.lineTo(cx + 25, cy - 40);
  ctx.lineTo(cx + 25, cy - 25);
  ctx.stroke();
}

function drawCyberDragon(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, colors: string[], rng: () => number): void {
  const ps = size / 32;
  
  // Head
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.ellipse(cx, cy - 20, 50, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Horns
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy - 50);
  ctx.lineTo(cx - 45, cy - 100);
  ctx.lineTo(cx - 25, cy - 50);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 35, cy - 50);
  ctx.lineTo(cx + 45, cy - 100);
  ctx.lineTo(cx + 25, cy - 50);
  ctx.fill();
  
  // Snout
  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy - 10);
  ctx.lineTo(cx - 30, cy + 30);
  ctx.lineTo(cx + 30, cy + 30);
  ctx.lineTo(cx + 35, cy - 10);
  ctx.fill();
  
  // Nostrils
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(cx - 12, cy + 20, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 12, cy + 20, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes (slit, glowing)
  ctx.save();
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = 15;
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.ellipse(cx - 20, cy - 25, 12, 5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 20, cy - 25, 12, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Pupils
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(cx - 20, cy - 25, 3, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 20, cy - 25, 3, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Teeth
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 5; i++) {
    const x = cx - 20 + i * 10;
    ctx.beginPath();
    ctx.moveTo(x - 3, cy + 30);
    ctx.lineTo(x, cy + 38);
    ctx.lineTo(x + 3, cy + 30);
    ctx.fill();
  }
  
  // Fire breath effect
  ctx.save();
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = 10;
  ctx.fillStyle = colors[3] + "40";
  ctx.beginPath();
  ctx.moveTo(cx - 15, cy + 35);
  ctx.quadraticCurveTo(cx - 25, cy + 60, cx - 10, cy + 70);
  ctx.quadraticCurveTo(cx, cy + 80, cx + 10, cy + 70);
  ctx.quadraticCurveTo(cx + 25, cy + 60, cx + 15, cy + 35);
  ctx.fill();
  ctx.restore();
  
  // Scales pattern
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      const x = cx - 30 + j * 20;
      const y = cy - 40 + i * 15;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI);
      ctx.stroke();
    }
  }
}

function drawCyberCat(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, colors: string[], rng: () => number): void {
  const ps = size / 32;
  
  // Ears
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.moveTo(cx - 45, cy - 30);
  ctx.lineTo(cx - 35, cy - 85);
  ctx.lineTo(cx - 15, cy - 30);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 45, cy - 30);
  ctx.lineTo(cx + 35, cy - 85);
  ctx.lineTo(cx + 15, cy - 30);
  ctx.fill();
  
  // Inner ears
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.moveTo(cx - 38, cy - 35);
  ctx.lineTo(cx - 32, cy - 70);
  ctx.lineTo(cx - 22, cy - 35);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 38, cy - 35);
  ctx.lineTo(cx + 32, cy - 70);
  ctx.lineTo(cx + 22, cy - 35);
  ctx.fill();
  
  // Head
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, 50, 45, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Face
  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.ellipse(cx, cy, 35, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes (large, glowing)
  ctx.save();
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = 15;
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.ellipse(cx - 18, cy - 15, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 18, cy - 15, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Pupils (vertical slits)
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(cx - 18, cy - 15, 3, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 18, cy - 15, 3, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.moveTo(cx, cy + 5);
  ctx.lineTo(cx - 5, cy + 12);
  ctx.lineTo(cx + 5, cy + 12);
  ctx.fill();
  
  // Whiskers
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 1.5;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + side * 15, cy + 10 + i * 5);
      ctx.lineTo(cx + side * 45, cy + 5 + i * 8);
      ctx.stroke();
    }
  }
  
  // Cyber markings
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy - 35);
  ctx.lineTo(cx - 15, cy - 25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 30, cy - 35);
  ctx.lineTo(cx + 15, cy - 25);
  ctx.stroke();
}

function drawCyberPanda(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, colors: string[], rng: () => number): void {
  const ps = size / 32;
  
  // Ears
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.arc(cx - 45, cy - 55, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 45, cy - 55, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, 60, 55, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye patches
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.ellipse(cx - 22, cy - 15, 22, 18, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 22, cy - 15, 22, 18, 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes (glowing)
  ctx.save();
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = 12;
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.arc(cx - 22, cy - 15, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 22, cy - 15, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Pupils
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cx - 22, cy - 15, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 22, cy - 15, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Mouth
  ctx.strokeStyle = colors[2];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 16);
  ctx.lineTo(cx, cy + 25);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - 8, cy + 25, 8, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 8, cy + 25, 8, 0, Math.PI);
  ctx.stroke();
  
  // Cyber circuit lines
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 50, cy - 40);
  ctx.lineTo(cx - 35, cy - 30);
  ctx.lineTo(cx - 35, cy - 15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 50, cy - 40);
  ctx.lineTo(cx + 35, cy - 30);
  ctx.lineTo(cx + 35, cy - 15);
  ctx.stroke();
}

function drawCyberLion(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, colors: string[], rng: () => number): void {
  const ps = size / 32;
  
  // Mane
  ctx.fillStyle = colors[2];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const x = cx + Math.cos(angle) * 65;
    const y = cy - 10 + Math.sin(angle) * 65;
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 20, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Mane inner
  ctx.fillStyle = colors[1];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + 0.2;
    const x = cx + Math.cos(angle) * 50;
    const y = cy - 10 + Math.sin(angle) * 50;
    ctx.beginPath();
    ctx.ellipse(x, y, 12, 15, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Head
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, 45, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Face
  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.ellipse(cx, cy, 30, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes (glowing)
  ctx.save();
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = 15;
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.ellipse(cx - 15, cy - 15, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 15, cy - 15, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Pupils
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(cx - 15, cy - 15, 3, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 15, cy - 15, 3, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.ellipse(cx, cy + 5, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Mouth
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 11);
  ctx.lineTo(cx, cy + 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - 6, cy + 20, 6, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 6, cy + 20, 6, 0, Math.PI);
  ctx.stroke();
  
  // Cyber crown
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 25, cy - 45);
  ctx.lineTo(cx - 15, cy - 55);
  ctx.lineTo(cx - 5, cy - 45);
  ctx.lineTo(cx + 5, cy - 55);
  ctx.lineTo(cx + 15, cy - 45);
  ctx.lineTo(cx + 25, cy - 55);
  ctx.stroke();
}

function drawCyberRobot(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, colors: string[], rng: () => number): void {
  const ps = size / 32;
  
  // Head
  ctx.fillStyle = colors[2];
  ctx.fillRect(cx - 50, cy - 60, 100, 80);
  
  // Face plate
  ctx.fillStyle = colors[1];
  ctx.fillRect(cx - 40, cy - 50, 80, 60);
  
  // Antenna
  ctx.fillStyle = colors[3];
  ctx.fillRect(cx - 3, cy - 80, 6, 20);
  drawGlowCircle(ctx, cx, cy - 85, 6, colors[3], 10);
  
  // Eyes (rectangular, glowing)
  ctx.save();
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = 15;
  ctx.fillStyle = colors[3];
  ctx.fillRect(cx - 30, cy - 40, 25, 15);
  ctx.fillRect(cx + 5, cy - 40, 25, 15);
  ctx.restore();
  
  // Eye details
  ctx.fillStyle = "#000";
  ctx.fillRect(cx - 25, cy - 35, 15, 5);
  ctx.fillRect(cx + 10, cy - 35, 15, 5);
  
  // Mouth (grill)
  ctx.fillStyle = colors[2];
  ctx.fillRect(cx - 25, cy - 10, 50, 15);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = colors[3];
    ctx.fillRect(cx - 20 + i * 8, cy - 8, 3, 10);
  }
  
  // Bolts
  ctx.fillStyle = colors[3];
  drawGlowCircle(ctx, cx - 42, cy - 52, 4, colors[3], 5);
  drawGlowCircle(ctx, cx + 42, cy - 52, 4, colors[3], 5);
  drawGlowCircle(ctx, cx - 42, cy + 12, 4, colors[3], 5);
  drawGlowCircle(ctx, cx + 42, cy + 12, 4, colors[3], 5);
  
  // Circuit lines
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy + 25);
  ctx.lineTo(cx - 20, cy + 25);
  ctx.lineTo(cx - 20, cy + 35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 35, cy + 25);
  ctx.lineTo(cx + 20, cy + 25);
  ctx.lineTo(cx + 20, cy + 35);
  ctx.stroke();
}

function drawCyberSnake(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, colors: string[], rng: () => number): void {
  const ps = size / 32;
  
  // Head
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.ellipse(cx, cy - 20, 40, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Body coils
  ctx.strokeStyle = colors[2];
  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy + 10);
  ctx.quadraticCurveTo(cx - 50, cy + 40, cx - 30, cy + 70);
  ctx.quadraticCurveTo(cx, cy + 90, cx + 30, cy + 70);
  ctx.quadraticCurveTo(cx + 50, cy + 40, cx, cy + 10);
  ctx.stroke();
  
  // Body pattern
  ctx.strokeStyle = colors[1];
  ctx.lineWidth = 15;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 10);
  ctx.quadraticCurveTo(cx - 50, cy + 40, cx - 30, cy + 70);
  ctx.quadraticCurveTo(cx, cy + 90, cx + 30, cy + 70);
  ctx.quadraticCurveTo(cx + 50, cy + 40, cx, cy + 10);
  ctx.stroke();
  
  // Eyes (slit, glowing)
  ctx.save();
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = 15;
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.ellipse(cx - 15, cy - 25, 8, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 15, cy - 25, 8, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Pupils
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(cx - 15, cy - 25, 2, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 15, cy - 25, 2, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Tongue
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 5);
  ctx.lineTo(cx, cy + 10);
  ctx.lineTo(cx - 5, cy + 18);
  ctx.moveTo(cx, cy + 10);
  ctx.lineTo(cx + 5, cy + 18);
  ctx.stroke();
  
  // Scales pattern
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = cy + 20 + i * 12;
    ctx.beginPath();
    ctx.arc(cx - 20, y, 8, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 20, y, 8, 0, Math.PI);
    ctx.stroke();
  }
}

function drawCyberEagle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, colors: string[], rng: () => number): void {
  const ps = size / 32;
  
  // Wings spread
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy - 20);
  ctx.quadraticCurveTo(cx - 80, cy - 60, cx - 100, cy - 20);
  ctx.quadraticCurveTo(cx - 90, cy, cx - 70, cy + 10);
  ctx.quadraticCurveTo(cx - 50, cy - 10, cx - 20, cy);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 20, cy - 20);
  ctx.quadraticCurveTo(cx + 80, cy - 60, cx + 100, cy - 20);
  ctx.quadraticCurveTo(cx + 90, cy, cx + 70, cy + 10);
  ctx.quadraticCurveTo(cx + 50, cy - 10, cx + 20, cy);
  ctx.fill();
  
  // Wing feathers
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const x = cx - 80 + i * 15;
    ctx.beginPath();
    ctx.moveTo(x, cy - 30);
    ctx.lineTo(x - 5, cy - 10);
    ctx.stroke();
  }
  for (let i = 0; i < 5; i++) {
    const x = cx + 80 - i * 15;
    ctx.beginPath();
    ctx.moveTo(x, cy - 30);
    ctx.lineTo(x + 5, cy - 10);
    ctx.stroke();
  }
  
  // Head
  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.ellipse(cx, cy - 30, 30, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Beak
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 20);
  ctx.lineTo(cx, cy + 5);
  ctx.lineTo(cx + 8, cy - 20);
  ctx.fill();
  
  // Eyes (glowing)
  ctx.save();
  ctx.shadowColor = colors[3];
  ctx.shadowBlur = 12;
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.arc(cx - 12, cy - 35, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 12, cy - 35, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Pupils
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cx - 12, cy - 35, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 12, cy - 35, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Cyber markings
  ctx.strokeStyle = colors[3];
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 25, cy - 40);
  ctx.lineTo(cx - 15, cy - 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 25, cy - 40);
  ctx.lineTo(cx + 15, cy - 30);
  ctx.stroke();
}

const ANIMAL_DRAWERS = [
  drawCyberWolf,
  drawCyberFox,
  drawCyberOwl,
  drawCyberDragon,
  drawCyberCat,
  drawCyberPanda,
  drawCyberLion,
  drawCyberRobot,
  drawCyberSnake,
  drawCyberEagle,
];

export function generateCyberpunkCNFT(agentId: string): string {
  if (typeof document === "undefined") {
    return "";
  }

  const hash = hashAgentId(agentId);
  const rng = seededRandom(hash);

  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d")!;

  const bgIdx = Math.floor(rng() * BG_GRADIENTS.length);
  const bgColors = BG_GRADIENTS[bgIdx];
  const animalIdx = Math.floor(rng() * ANIMAL_DRAWERS.length);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 400, 400);
  bgGrad.addColorStop(0, bgColors[0]);
  bgGrad.addColorStop(0.33, bgColors[1]);
  bgGrad.addColorStop(0.66, bgColors[2]);
  bgGrad.addColorStop(1, bgColors[3]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 400, 400);

  // Pixel grid
  drawPixelGrid(ctx, 400, 12);

  // Background glow circles
  for (let i = 0; i < 3; i++) {
    const x = rng() * 400;
    const y = rng() * 400;
    const r = 50 + rng() * 100;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, bgColors[2] + "20");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);
  }

  // Target circles
  ctx.strokeStyle = bgColors[2] + "15";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(200, 180, i * 60, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw animal
  ANIMAL_DRAWERS[animalIdx](ctx, 200, 180, 400, bgColors, rng);

  // SYS.ONLINE box
  ctx.fillStyle = bgColors[2] + "20";
  ctx.fillRect(140, 340, 120, 25);
  ctx.strokeStyle = bgColors[2] + "40";
  ctx.lineWidth = 1;
  ctx.strokeRect(140, 340, 120, 25);
  ctx.font = "10px monospace";
  ctx.fillStyle = bgColors[2];
  ctx.textAlign = "center";
  ctx.fillText("SYS.ONLINE", 200, 357);

  // ID hash
  const idHash = agentId.slice(0, 6).toUpperCase();
  ctx.font = "8px monospace";
  ctx.fillStyle = bgColors[2] + "40";
  ctx.fillText(`#${idHash}`, 200, 385);

  // Scanlines
  ctx.fillStyle = "#00000008";
  for (let y = 0; y < 400; y += 2) {
    ctx.fillRect(0, y, 400, 1);
  }

  // Frame corners
  const m = 15;
  const b = 25;
  ctx.strokeStyle = bgColors[2] + "40";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(m, m + b);
  ctx.lineTo(m, m);
  ctx.lineTo(m + b, m);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(400 - m - b, m);
  ctx.lineTo(400 - m, m);
  ctx.lineTo(400 - m, m + b);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(m, 400 - m - b);
  ctx.lineTo(m, 400 - m);
  ctx.lineTo(m + b, 400 - m);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(400 - m - b, 400 - m);
  ctx.lineTo(400 - m, 400 - m);
  ctx.lineTo(400 - m, 400 - m - b);
  ctx.stroke();

  return canvas.toDataURL("image/png", 0.95);
}
