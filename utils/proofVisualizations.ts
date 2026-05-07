
export const drawStrategies = {
    nullLedger: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cy = h/2;
        // Real Wave (Cyan)
        ctx.beginPath(); ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2;
        for(let x=0; x<w; x++) ctx.lineTo(x, cy + Math.sin(x*0.05 + t*2)*20);
        ctx.stroke();
        // Imaginary Wave (Magenta) - Perfectly out of phase
        ctx.beginPath(); ctx.strokeStyle='#e879f9';
        for(let x=0; x<w; x++) ctx.lineTo(x, cy + Math.sin(x*0.05 + t*2 + Math.PI)*20);
        ctx.stroke();
        // The Null Sum (White Dotted)
        ctx.beginPath(); ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.setLineDash([4,4]);
        ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle='#fff'; ctx.fillText("∑ = 0", w/2 - 10, cy - 30);
    },

    leechLattice: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cols = 6, rows = 4;
        const size = 20;
        const ox = (w - (cols*size*1.5))/2;
        const oy = (h - (rows*size*1.5))/2;
        for(let i=0; i<24; i++) {
            const x = i % cols; const y = Math.floor(i/cols);
            const px = ox + x * size * 1.5; const py = oy + y * size * 1.5;
            const active = Math.sin(t*2 + i) > 0;
            ctx.fillStyle = active ? '#818cf8' : '#1e1b4b';
            ctx.fillRect(px, py, size, size);
            if (active && i < 23) {
                ctx.strokeStyle = 'rgba(129, 140, 248, 0.3)';
                ctx.beginPath(); ctx.moveTo(px+size/2, py+size/2);
                ctx.lineTo(px+size*2, py+size/2); ctx.stroke();
            }
        }
    },

    base13GCD: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        const r = 40;
        for(let i=0; i<12; i++) {
            const a = (i/12)*Math.PI*2 + t*0.5;
            const x = cx + Math.cos(a)*r;
            const y = cy + Math.sin(a)*r;
            ctx.fillStyle = '#22d3ee';
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
        }
        const pulse = 5 + Math.sin(t*3)*2;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(cx, cy, pulse, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.textAlign='center';
        ctx.fillText("13", cx, cy+4);
        ctx.fillText("GCD", cx, cy-15);
    },

    twinPrimes: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        const h1 = 60 + Math.sin(t)*10;
        const h2 = 60 + Math.sin(t + Math.PI)*10;
        
        ctx.fillStyle = '#f43f5e'; 
        ctx.fillRect(cx - 30, cy - h1/2, 20, h1);
        ctx.fillText("29", cx - 20, cy + 50);
        
        ctx.fillStyle = '#10b981'; 
        ctx.fillRect(cx + 10, cy - h2/2, 20, h2);
        ctx.fillText("31", cx + 20, cy + 50);
        
        ctx.strokeStyle = '#fff';
        ctx.beginPath(); ctx.moveTo(cx-10, cy); ctx.lineTo(cx+10, cy); ctx.stroke();
        ctx.fillText("LOCK", cx, cy - 40);
    },

    fmnProtocol: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        const stage = Math.floor(t % 3);
        
        if(stage === 0) { 
            ctx.strokeStyle = '#e879f9';
            ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI*2); ctx.stroke();
            ctx.fillText("FOLD (45°)", cx, cy+50);
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 21, cy - 21); ctx.stroke();
        } else if(stage === 1) { 
            ctx.strokeStyle = '#22d3ee';
            ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI*2); ctx.stroke();
            ctx.fillText("MIRROR (-q)", cx, cy+50);
            ctx.beginPath(); ctx.moveTo(cx-20, cy); ctx.lineTo(cx+20, cy); ctx.stroke();
            ctx.fillText("-", cx-35, cy); ctx.fillText("+", cx+35, cy);
        } else { 
            ctx.strokeStyle = '#fbbf24';
            ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI*2); ctx.stroke();
            ctx.fillText("NORMALIZE", cx, cy+50);
            for(let i=0; i<8; i++) {
                const a = (i/8)*Math.PI*2;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a)*30, cy + Math.sin(a)*30); ctx.stroke();
            }
        }
    },

    resonance: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        const locked = (t % 4) > 2;
        
        if(!locked) {
            ctx.strokeStyle = '#94a3b8';
            ctx.beginPath();
            for(let i=0; i<w; i+=5) ctx.lineTo(i, cy + Math.random()*40 - 20);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8'; ctx.fillText("SEARCHING...", cx, cy - 30);
        } else {
            ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3;
            ctx.beginPath();
            for(let i=0; i<w; i++) ctx.lineTo(i, cy + Math.sin(i*0.1)*20);
            ctx.stroke();
            ctx.fillStyle = '#10b981'; ctx.fillText("LOCKED", cx, cy - 30);
            ctx.shadowColor = '#10b981'; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }
    },

    fundamentalRegime: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        ctx.strokeStyle='#94a3b8'; ctx.beginPath(); ctx.moveTo(20, h-20); ctx.lineTo(w-20, h-20); ctx.stroke(); 
        ctx.beginPath(); ctx.moveTo(20, h-20); ctx.lineTo(20, 20); ctx.stroke(); 
        
        ctx.beginPath(); ctx.strokeStyle='#e879f9';
        for(let x=0; x<5; x+=0.1) {
            const px = 20 + x * 20;
            const py = (h-20) - Math.pow(x, x);
            if(x===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.beginPath(); ctx.strokeStyle='#22d3ee';
        for(let x=0; x<5; x+=0.1) {
            const px = 20 + x * 20;
            const py = (h-20) - (Math.pow(x/2.71, x)*Math.sqrt(2*Math.PI*x)); 
            if(x===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        ctx.fillStyle='rgba(244, 63, 94, 0.3)';
        ctx.fillRect(100, 50, 40, 50);
        ctx.fillStyle='#f43f5e'; ctx.fillText("MISMATCH", 100, 45);
    },

    observerCoordinate: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2 - 20, cy = h/2 + 20;
        const scale = 30;
        ctx.strokeStyle='rgba(255,255,255,0.1)';
        for(let i=-5; i<5; i++) {
            ctx.beginPath(); ctx.moveTo(0, cy+i*scale); ctx.lineTo(w, cy+i*scale); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx+i*scale, 0); ctx.lineTo(cx+i*scale, h); ctx.stroke();
        }
        const tx = cx + 2.5*scale;
        const ty = cy - 1.5*scale;
        
        ctx.strokeStyle='#fbbf24'; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke(); ctx.setLineDash([]);
        
        ctx.beginPath(); ctx.arc(tx, ty, 5 + Math.sin(t*5)*3, 0, Math.PI*2);
        ctx.fillStyle='#fbbf24'; ctx.fill();
        ctx.fillStyle='#fff'; ctx.fillText("O(2.5, 1.5)", tx+10, ty);
    },

    divisorBase: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        const splits = 2 + Math.floor((Math.sin(t)+1)*3); 
        const width = 120;
        const partW = width / splits;
        
        ctx.fillStyle='#4f46e5';
        for(let i=0; i<splits; i++) {
            ctx.fillRect(cx - width/2 + i*partW + 2, cy - 20, partW - 4, 40);
        }
        ctx.fillStyle='#a5b4fc';
        ctx.textAlign='center';
        ctx.fillText(`BASE ${splits}`, cx, cy + 40);
    },

    massImaginary: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        const phase = (Math.sin(t) + 1) / 2; 
        
        ctx.translate(cx, cy);
        ctx.rotate(phase * Math.PI/2); 
        
        if(phase < 0.5) {
            ctx.fillStyle='#f43f5e'; 
            ctx.fillRect(-10, -10, 20, 20);
            ctx.fillText("m", 15, 5);
        } else {
            ctx.strokeStyle='#22d3ee'; 
            ctx.beginPath();
            for(let i=-20; i<20; i++) ctx.lineTo(i, Math.sin(i*0.5 + t*10)*5);
            ctx.stroke();
            ctx.fillStyle='#22d3ee';
            ctx.fillText("i", 25, 5);
        }
        ctx.setTransform(1,0,0,1,0,0);
    },

    minimalClosure: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        const r = 40;
        const ang = t;
        const p1 = { x: cx + Math.cos(ang)*r, y: cy + Math.sin(ang)*r };
        const p2 = { x: cx + Math.cos(ang + 2.094)*r, y: cy + Math.sin(ang + 2.094)*r }; 
        const p3 = { x: cx + Math.cos(ang + 4.188)*r, y: cy + Math.sin(ang + 4.188)*r }; 
        
        ctx.strokeStyle='rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p1.x, p1.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p3.x, p3.y); ctx.stroke();
        
        ctx.strokeStyle='#fff'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath(); ctx.stroke();
        
        ctx.fillStyle='#10b981'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2); ctx.fill();
    },

    foldOperator: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        let size = 80;
        let ang = t;
        for(let i=0; i<6; i++) {
            ctx.translate(cx, cy);
            ctx.rotate(ang);
            ctx.strokeStyle = `hsl(${200 + i*20}, 100%, 70%)`;
            ctx.strokeRect(-size/2, -size/2, size, size);
            ctx.setTransform(1,0,0,1,0,0);
            size *= 0.707; 
            ang += Math.PI/4; 
        }
    },

    i4Revolution: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        const step = Math.floor(t*2) % 4; 
        const labels = ['i', '-1', '-i', '1'];
        const colors = ['#22d3ee', '#f43f5e', '#22d3ee', '#f43f5e'];
        
        ctx.font='20px mono';
        ctx.textAlign='center';
        ctx.fillStyle=colors[step];
        ctx.fillText(labels[step], cx, cy - 40);
        
        ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI*2); ctx.stroke();
        
        ctx.strokeStyle=colors[step]; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        const ang = -Math.PI/2 + (step * Math.PI/2);
        ctx.lineTo(cx + Math.cos(ang)*30, cy + Math.sin(ang)*30);
        ctx.stroke();
    },

    resolutionLimit: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const coherence = (Math.sin(t) + 1) / 2; 
        const cols = 20; const rows = 10;
        for(let i=0; i<cols; i++) {
            for(let j=0; j<rows; j++) {
                const tx = (w/cols)*i + 10;
                const ty = (h/rows)*j + 10;
                const nx = Math.random() * w;
                const ny = Math.random() * h;
                const x = nx + (tx - nx) * coherence;
                const y = ny + (ty - ny) * coherence;
                ctx.fillStyle = coherence > 0.9 ? '#22d3ee' : 'rgba(148, 163, 184, 0.5)';
                ctx.fillRect(x, y, 2, 2);
            }
        }
    },

    lionConstant: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.beginPath();
        for(let i=0; i<100; i++) {
            const ang = i * 0.1; const rad = 5 * Math.exp(0.306 * ang); 
            ctx.lineTo(cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad);
        }
        ctx.stroke();
        
        ctx.strokeStyle='#fbbf24'; ctx.lineWidth=2; ctx.beginPath();
        for(let i=0; i<100; i++) {
            const ang = i * 0.1; const rad = 5 * Math.exp(0.536 * ang * 0.5); 
            ctx.lineTo(cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad);
        }
        ctx.stroke();
        ctx.fillText("L ≈ 0.536", cx + 20, cy + 20);
    },

    lightSpeed: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cy = h/2;
        const px = (t * 300) % (w + 100) - 50;
        
        ctx.fillStyle='#fff';
        ctx.shadowColor='#fff'; ctx.shadowBlur=10;
        ctx.fillRect(px, cy, 20, 4);
        ctx.shadowBlur=0;
        
        ctx.font='10px mono'; ctx.fillStyle='rgba(34, 211, 238, 0.5)';
        for(let i=1; i<6; i++) {
            const char = ['A','B','7','3','0'][i%5];
            ctx.fillText(char, px - i*20, cy + 5);
        }
    },

    timeForce: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI*2); ctx.stroke();
        
        const push = Math.sin(t*3) * 15;
        ctx.beginPath(); ctx.ellipse(cx, cy, 30 + push, 30 - push, 0, 0, Math.PI*2);
        ctx.strokeStyle='#e879f9'; ctx.stroke();
        
        ctx.beginPath(); ctx.moveTo(cx - 60, cy); ctx.lineTo(cx - 35 - push, cy); 
        ctx.strokeStyle='#f43f5e'; ctx.lineWidth=2; ctx.stroke();
    },

    nephilim: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cy = h/2;
        ctx.beginPath(); ctx.strokeStyle='rgba(75, 85, 99, 0.5)';
        for(let x=0; x<w; x++) ctx.lineTo(x, cy + Math.sin(x*0.02 + t)*20);
        ctx.stroke();
        
        ctx.beginPath(); ctx.strokeStyle='#22d3ee';
        for(let x=0; x<w; x++) ctx.lineTo(x, cy + Math.sin(x*0.1 + t*2)*10);
        ctx.stroke();
        
        ctx.beginPath(); ctx.strokeStyle='#f43f5e';
        for(let x=0; x<w; x+=5) {
            const wVal = Math.sin(x*0.02 + t)*20;
            const hVal = Math.sin(x*0.1 + t*2)*10;
            const diff = Math.abs(wVal - hVal);
            if(diff > 15) {
                ctx.moveTo(x, cy + 40); ctx.lineTo(x, cy + 40 + diff/2);
            }
        }
        ctx.stroke();
    },

    singleAngle: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2 - 40, cy = h/2;
        const r = 40;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.strokeStyle='#334155'; ctx.stroke();
        const ang = t % (Math.PI*2);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang)*r, cy + Math.sin(ang)*r);
        ctx.strokeStyle='#22d3ee'; ctx.stroke();
        
        ctx.font='10px mono'; ctx.fillStyle='#fff';
        const bit = Math.sin(t*5) > 0 ? '1' : '0';
        ctx.fillText(`∠ = ${ang.toFixed(2)}`, cx + 60, cy);
        ctx.fillText(`BIN: ${bit}1011...`, cx + 60, cy + 15);
    },

    boundary126: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        for(let i=0; i<126; i+=2) {
            const r = 30 + Math.sin(t + i)*10;
            const a = (i/126) * Math.PI * 4 + t*0.1;
            ctx.fillStyle = `hsl(${i*3}, 70%, 60%)`;
            ctx.beginPath(); ctx.arc(cx + Math.cos(a)*r, cy + Math.sin(a)*r, 1.5, 0, Math.PI*2); ctx.fill();
        }
        ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.arc(cx, cy, 45, 0, Math.PI*2); ctx.stroke();
    },

    lagrangian: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(cx, cy, 15, 0, Math.PI*2); ctx.fill();
        const ex = cx + Math.cos(t)*50; const ey = cy + Math.sin(t)*50;
        ctx.fillStyle='#3b82f6'; ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI*2); ctx.fill();
        
        const lpoints = [
            {a: 0, r: 40}, {a: 0, r: 60}, {a: Math.PI, r: 50}, {a: Math.PI/3, r: 50}, {a: -Math.PI/3, r: 50}
        ];
        ctx.fillStyle='#f43f5e';
        lpoints.forEach(lp => {
            const lx = cx + Math.cos(t + lp.a)*lp.r;
            const ly = cy + Math.sin(t + lp.a)*lp.r;
            ctx.fillRect(lx-1, ly-1, 3, 3);
        });
        ctx.strokeStyle='rgba(255,255,255,0.05)';
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
    },

    convergence: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        // const cx = w/2; // Unused
        let xPos = 20;
        // let sum = 0; // Unused
        for(let i=1; i<=6; i++) {
            const val = 100 / Math.pow(2, i);
            // sum += val;
            ctx.fillStyle = `rgba(129, 140, 248, ${1/i})`;
            ctx.fillRect(xPos, h/2 - val/2, 15, val);
            xPos += 18;
        }
        ctx.strokeStyle='#fff'; ctx.setLineDash([2,2]);
        ctx.beginPath(); ctx.moveTo(xPos + 10, h/2 - 50); ctx.lineTo(xPos + 10, h/2 + 50); ctx.stroke();
        ctx.fillText("LIM -> 1", xPos + 15, h/2);
    },

    yangMills: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(cx-20, cy+20);
        ctx.lineTo(cx+20, cy+20); 
        ctx.lineTo(cx-20, cy-10); 
        ctx.closePath(); 
        ctx.stroke();
        ctx.fillStyle = '#10b981'; ctx.fillText("5", cx, cy);
        
        ctx.strokeStyle = '#f43f5e'; ctx.setLineDash([2,2]);
        ctx.beginPath();
        ctx.moveTo(cx-20, cy+20);
        ctx.lineTo(cx+20, cy-20); 
        ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#f43f5e'; ctx.fillText("√32", cx+25, cy-10);
        ctx.fillStyle = '#fff';
        ctx.fillText("Δ = 0.657", cx-30, cy+40);
    },

    riemann: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2;
        ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(cx-10, 20, 20, h-40);
        ctx.strokeStyle='#22d3ee'; ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx, h-20); ctx.stroke();
        
        ctx.fillStyle='#fbbf24';
        for(let i=0; i<5; i++) {
            const y = 40 + i*25 + Math.sin(t + i)*2;
            ctx.beginPath(); ctx.arc(cx, y, 2, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillText("Re=1/2", cx + 15, 30);
    },

    pnpTorsion: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cx = w/2, cy = h/2;
        const phase = Math.sin(t);
        ctx.strokeStyle = phase > 0 ? '#f43f5e' : '#10b981'; 
        ctx.lineWidth=2;
        
        ctx.beginPath();
        for(let i=0; i<Math.PI*2; i+=0.1) {
            const r = 20 + Math.sin(i*3 + t)*5 * phase; 
            ctx.lineTo(cx + Math.cos(i)*r, cy + Math.sin(i)*r);
        }
        ctx.closePath(); ctx.stroke();
        ctx.fillText(phase > 0.5 ? "NP" : "P", cx-5, cy+40);
    },

    temporalFold: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
        ctx.clearRect(0,0,w,h); 
        const cy = h/2;
        ctx.strokeStyle='#94a3b8'; ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(w-20, cy); ctx.stroke();
        
        const foldX = w/2;
        const foldFactor = (Math.sin(t)+1)/2; 
        
        ctx.strokeStyle='#e879f9'; ctx.setLineDash([3,3]);
        ctx.beginPath();
        ctx.moveTo(foldX, cy);
        ctx.quadraticCurveTo(foldX, cy - 50*foldFactor, foldX - 40*foldFactor, cy - 20*foldFactor);
        ctx.stroke(); ctx.setLineDash([]);
        
        ctx.fillStyle='#e879f9'; ctx.fillText("FOLD", foldX, cy - 10);
    },

    genericGeometry: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
        ctx.clearRect(0,0,w,h);
        const cx = w/2, cy = h/2;
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        for(let i=0; i<5; i++) {
            const ang = t + (i/5)*Math.PI*2;
            ctx.lineTo(cx + Math.cos(ang)*30, cy + Math.sin(ang)*30);
        }
        ctx.closePath(); ctx.stroke();
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'; ctx.fill();
    }
};

export const getProofVisualization = (id: string, title: string, _domain: string) => {
    const map: Record<string, keyof typeof drawStrategies> = {
        "Proof 1": "nullLedger",
        "Proof 1 (24)": "leechLattice",
        "Proof 14": "base13GCD",
        "Proof 16": "twinPrimes",
        "Proof 3": "fmnProtocol",
        "Proof 7 (P)": "resonance",
        "Proof 9": "pnpTorsion",
        "Proof 1 (F)": "foldOperator",
        "Proof 2": "observerCoordinate",
        "Theorem 1": "divisorBase",
        "Proof 21": "massImaginary",
        "Proof 3 (D)": "minimalClosure",
        "Proof 4 (i4)": "i4Revolution",
        "Proof 2 (L)": "resolutionLimit",
        "Proof 18": "lionConstant",
        "Proof 6 (C)": "lightSpeed",
        "Proof 6": "timeForce",
        "Proof 6 (N)": "nephilim",
        "Proof 19": "singleAngle",
        "Proof 7 (126)": "boundary126",
        "Proof 24 (L)": "lagrangian",
        "Proof 9 (Conv)": "convergence",
        "Proof 8": "yangMills",
        "Proof 10": "riemann",
        "Proof 67": "temporalFold",
        "Proof 110": "timeForce",
        "Proof 15": "singleAngle",
        "Proof 42": "resonance",
        "Proof 52": "resonance",
        "Proof 5 (NL)": "nullLedger"
    };

    if (map[id]) return drawStrategies[map[id]];
    
    // Fallbacks
    if (title.includes("Fold") || title.includes("Folding")) return drawStrategies.foldOperator;
    if (title.includes("Lattice") || title.includes("Grid")) return drawStrategies.leechLattice;
    if (title.includes("Wave") || title.includes("Hz") || title.includes("Resonance")) return drawStrategies.resonance;
    if (title.includes("Time") || title.includes("Temporal")) return drawStrategies.temporalFold;
    if (title.includes("Mass") || title.includes("Gravity")) return drawStrategies.yangMills;
    if (title.includes("Zero") || title.includes("Null")) return drawStrategies.nullLedger;
    if (title.includes("Observer")) return drawStrategies.observerCoordinate;
    
    return drawStrategies.genericGeometry;
};
