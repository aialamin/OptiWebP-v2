/**
 * Generates sample test images directly on client-side canvas so users can test immediately
 */

export interface SampleImageDef {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  format: 'image/jpeg' | 'image/png';
  generate: (canvas: HTMLCanvasElement) => void;
}

export const SAMPLE_IMAGES: SampleImageDef[] = [
  {
    id: 'sample-photo',
    name: 'coastal_sunset_highres.jpg',
    description: 'High-resolution landscape photo with rich gradients',
    width: 1920,
    height: 1080,
    format: 'image/jpeg',
    generate: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7);
      sky.addColorStop(0, '#0f172a');
      sky.addColorStop(0.3, '#312e81');
      sky.addColorStop(0.6, '#9333ea');
      sky.addColorStop(0.8, '#f43f5e');
      sky.addColorStop(1, '#fbbf24');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sun
      const sunGrad = ctx.createRadialGradient(
        canvas.width * 0.65,
        canvas.height * 0.62,
        10,
        canvas.width * 0.65,
        canvas.height * 0.62,
        180
      );
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.3, '#fef08a');
      sunGrad.addColorStop(0.8, 'rgba(251, 191, 36, 0.4)');
      sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.65, canvas.height * 0.62, 180, 0, Math.PI * 2);
      ctx.fill();

      // Mountain layers
      const drawMountain = (baseY: number, color: string, roughness: number) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(0, baseY);
        for (let x = 0; x <= canvas.width; x += 30) {
          const y = baseY + Math.sin(x * 0.005) * 120 + Math.cos(x * 0.012) * 60 + Math.sin(x * 0.02) * roughness;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
      };

      drawMountain(canvas.height * 0.65, '#4c1d95', 40);
      drawMountain(canvas.height * 0.75, '#1e1b4b', 30);
      drawMountain(canvas.height * 0.85, '#09090b', 20);

      // Fine stars/noise for detail inspection
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 300; i++) {
        const sx = (i * 137.5) % canvas.width;
        const sy = (i * 93.3) % (canvas.height * 0.5);
        const radius = (i % 3) * 0.8 + 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    id: 'sample-transparent',
    name: 'brand_badge_transparent.png',
    description: 'Crisp vector graphic with alpha transparency',
    width: 1200,
    height: 1200,
    format: 'image/png',
    generate: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Soft circular gradient backdrop with transparency
      const circleGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        100,
        canvas.width / 2,
        canvas.height / 2,
        500
      );
      circleGrad.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      circleGrad.addColorStop(0.6, 'rgba(5, 150, 105, 0.12)');
      circleGrad.addColorStop(1, 'rgba(5, 150, 105, 0)');
      ctx.fillStyle = circleGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Geometric badge
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Outer ring
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 360, 0, Math.PI * 2);
      ctx.stroke();

      // Inner polygon
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? 320 : 250;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Sharp central typography
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 84px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('WEBP LAB', 0, -30);

      ctx.font = '500 32px monospace';
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText('ALPHA CHANNEL · 32-BIT', 0, 60);

      ctx.restore();
    },
  },
  {
    id: 'sample-ui-card',
    name: 'ecommerce_product_showcase.jpg',
    description: 'Clean product photo & typographic composition',
    width: 1400,
    height: 900,
    format: 'image/jpeg',
    generate: (canvas) => {
      const ctx = canvas.getContext('2d')!;
      // Studio background
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Studio floor reflection
      const floorGrad = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
      floorGrad.addColorStop(0, '#e2e8f0');
      floorGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

      // Product silhouette / device frame
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.52;
      const pw = 480;
      const ph = 640;

      // Soft drop shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + ph / 2 + 20, pw * 0.6, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Device body
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, 42);
      ctx.fill();

      // Screen interior
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.roundRect(cx - pw / 2 + 14, cy - ph / 2 + 14, pw - 28, ph - 28, 30);
      ctx.fill();

      // Screen artwork
      const screenGrad = ctx.createLinearGradient(
        cx - pw / 2 + 20,
        cy - ph / 2 + 20,
        cx + pw / 2 - 20,
        cy + ph / 2 - 20
      );
      screenGrad.addColorStop(0, '#2563eb');
      screenGrad.addColorStop(0.5, '#7c3aed');
      screenGrad.addColorStop(1, '#db2777');
      ctx.fillStyle = screenGrad;
      ctx.beginPath();
      ctx.roundRect(cx - pw / 2 + 28, cy - ph / 2 + 28, pw - 56, ph - 56, 20);
      ctx.fill();

      // Overlay text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Retina Display', cx, cy);

      ctx.font = '16px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText('2880 × 1800 · P3 WIDE COLOR', cx, cy + 45);
    },
  },
  {
    id: 'sample-optiweb',
    name: 'Optiweb_Penthouse.jpg',
    description: 'High-res coastal penthouse interior photography (Optiweb.jpg)',
    width: 1600,
    height: 1067,
    format: 'image/jpeg',
    generate: (canvas) => {
      // Placeholder if offline/fallback
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Modern Ocean Penthouse', canvas.width / 2, canvas.height / 2);
    },
  },
];

export async function createSampleFile(sample: SampleImageDef): Promise<File> {
  // If it's sample-optiweb, fetch directly from public/Optiweb.jpg
  if (sample.id === 'sample-optiweb') {
    try {
      const res = await fetch('/Optiweb.jpg');
      if (res.ok) {
        const blob = await res.blob();
        return new File([blob], sample.name, { type: 'image/jpeg' });
      }
    } catch {}
  }

  const canvas = document.createElement('canvas');
  canvas.width = sample.width;
  canvas.height = sample.height;
  sample.generate(canvas);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) throw new Error('Failed to generate sample');
        const file = new File([blob], sample.name, { type: sample.format });
        resolve(file);
      },
      sample.format,
      sample.format === 'image/jpeg' ? 0.95 : undefined
    );
  });
}
