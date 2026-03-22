/* ═══════════════════════════════════════════════════════════
   FLORES AMARILLAS — java.js
   Orden de ejecución:
   1. Splash (estrellas + pétalos cayendo + barra)
   2. Botón principal → Modal → Animación árbol
═══════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────
   1. PANTALLA DE CARGA
────────────────────────────────────────────────────────── */
(function splash() {
    const el      = document.getElementById('splash');
    const cv      = document.getElementById('splash-canvas');
    const ctx     = cv.getContext('2d');
    const tituloEl= document.getElementById('splash-titulo');
    const subEl   = document.getElementById('splash-sub');
    const barraEl = document.getElementById('splash-barra');

    // Tamaño real de pantalla
    const W = cv.width  = window.innerWidth;
    const H = cv.height = window.innerHeight;

    /* Estrellas */
    const stars = Array.from({ length: 70 }, () => ({
        x:    Math.random() * W,
        y:    Math.random() * H,
        r:    0.5 + Math.random() * 1.3,
        fase: Math.random() * Math.PI * 2,
        vel:  0.8 + Math.random() * 1.2
    }));

    /* Pétalos */
    const COLORES = ['#ff4081','#FFD700','#e040fb','#40c4ff','#fff','#ff80ab','#b2ff59','#ff6d00'];
    const petalos = Array.from({ length: 28 }, (_, i) => ({
        x:    Math.random() * W,
        y:    Math.random() * H,          // ← distribuidos ya en pantalla
        vy:   0.9 + Math.random() * 1.6,
        vx:   (Math.random() - 0.5) * 1.2,
        rot:  Math.random() * 360,
        vrot: (Math.random() - 0.5) * 3,
        r:    7 + Math.random() * 9,
        col:  COLORES[i % COLORES.length]
    }));

    function drawPetal(x, y, r, rot, col) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot * Math.PI / 180);
        ctx.fillStyle = col;
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.ellipse(
                Math.cos(a) * r * 1.45,
                Math.sin(a) * r * 1.45,
                r * 0.78, r * 0.32, a, 0, Math.PI * 2
            );
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,240,80,0.95)';
        ctx.fill();
        ctx.restore();
    }

    let activo = true;
    function loop() {
        if (!activo) return;

        /* Fondo */
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#000010');
        bg.addColorStop(1, '#0d0030');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        /* Estrellas parpadeando */
        const t = Date.now() / 1000;
        stars.forEach(s => {
            const a = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * s.vel + s.fase));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
            ctx.fill();
        });

        /* Pétalos cayendo */
        petalos.forEach(p => {
            p.y   += p.vy;
            p.x   += p.vx + Math.sin(t * 0.8 + p.r) * 0.5;
            p.rot += p.vrot;
            if (p.y > H + 20) {
                p.y = -20;
                p.x = Math.random() * W;
            }
            drawPetal(p.x, p.y, p.r, p.rot, p.col);
        });

        requestAnimationFrame(loop);
    }
    loop();

    /* Emoji con brillo */
    setTimeout(() => tituloEl.classList.add('visible'), 400);

    /* Texto letra por letra */
    const frase = 'tus flores amarillas xd';
    let idx = 0;
    setTimeout(() => {
        const iv = setInterval(() => {
            if (idx >= frase.length) { clearInterval(iv); return; }
            subEl.textContent += frase[idx++];
        }, 65);
    }, 900);

    /* Barra de progreso — 3.5 segundos */
    let pct = 0;
    const iv = setInterval(() => {
        pct += 100 / (3500 / 50);          // llega a 100 en ~3.5s
        barraEl.style.width = Math.min(pct, 100) + '%';
        if (pct >= 100) {
            clearInterval(iv);
            setTimeout(() => {
                activo = false;
                el.classList.add('oculto');
                setTimeout(() => el.remove(), 1100);
            }, 300);
        }
    }, 50);
})();


/* ──────────────────────────────────────────────────────────
   2. APP PRINCIPAL
────────────────────────────────────────────────────────── */
(function app() {

    const btn    = document.getElementById('playButton');
    const cv     = document.getElementById('c');
    const ctx    = cv.getContext('2d');
    const tit    = document.getElementById('titulo');
    const bgCv   = document.getElementById('bgCanvas');
    const bgCtx  = bgCv.getContext('2d');
    const overlay= document.getElementById('modal-overlay');

    const W = cv.width = bgCv.width  = window.innerWidth;
    const H = cv.height= bgCv.height = window.innerHeight;

    /* Posiciones base */
    const TX  = W / 2;                       // tronco X
    const TY  = H - 45;                      // base tronco
    const TH  = H * 0.18;                    // altura tronco
    const HCX = W / 2;                       // corazón centro X
    const HCY = TY - TH - H * 0.27;         // corazón centro Y
    const HRX = W * 0.40;                    // radio H del corazón
    const HRY = H * 0.26;                    // radio V del corazón
    const FR  = W * 0.026;                   // radio flor

    /* ── Fondo nocturno con luna ──────────────────────── */
    function drawNight() {
        const g = bgCtx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#000010');
        g.addColorStop(1, '#0a0025');
        bgCtx.fillStyle = g;
        bgCtx.fillRect(0, 0, W, H);

        // Luna
        const lx = W * 0.82, ly = H * 0.18, lr = W * 0.07;
        const halo = bgCtx.createRadialGradient(lx, ly, lr * 0.7, lx, ly, lr * 2);
        halo.addColorStop(0, 'rgba(255,250,180,0.2)');
        halo.addColorStop(1, 'rgba(255,250,180,0)');
        bgCtx.fillStyle = halo;
        bgCtx.beginPath();
        bgCtx.arc(lx, ly, lr * 2, 0, Math.PI * 2);
        bgCtx.fill();

        const lg = bgCtx.createRadialGradient(lx - lr * 0.2, ly - lr * 0.2, 0, lx, ly, lr);
        lg.addColorStop(0, '#fffde0');
        lg.addColorStop(0.6, '#f5e87a');
        lg.addColorStop(1, '#c8a000');
        bgCtx.fillStyle = lg;
        bgCtx.beginPath();
        bgCtx.arc(lx, ly, lr, 0, Math.PI * 2);
        bgCtx.fill();

        // Cráteres
        [[lx+lr*.22, ly+lr*.12, lr*.14],[lx-lr*.24, ly+lr*.28, lr*.09],[lx+lr*.08, ly-lr*.28, lr*.07]]
        .forEach(([cx,cy,cr]) => {
            bgCtx.beginPath();
            bgCtx.arc(cx, cy, cr, 0, Math.PI * 2);
            bgCtx.fillStyle = 'rgba(160,130,0,0.28)';
            bgCtx.fill();
        });
    }

    /* Estrellas en bucle */
    function animarEstrellas() {
        const stars = Array.from({ length: 75 }, () => ({
            x: Math.random() * W, y: Math.random() * H * 0.8,
            r: 0.4 + Math.random() * 1.2, fase: Math.random() * Math.PI * 2,
            vel: 0.7 + Math.random() * 1.2
        }));
        function tick() {
            drawNight();
            const t = Date.now() / 1000;
            stars.forEach(s => {
                const a = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * s.vel + s.fase));
                bgCtx.beginPath();
                bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                bgCtx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
                bgCtx.fill();
            });
            requestAnimationFrame(tick);
        }
        tick();
    }

    /* ── Suelo verde con flores ───────────────────────── */
    let floresSuelo = [];

    function drawSuelo() {
        const sY = TY, sH = H * 0.14;
        const g1 = ctx.createLinearGradient(0, sY - sH, 0, sY + 10);
        g1.addColorStop(0, '#66bb6a'); g1.addColorStop(0.5, '#4caf50'); g1.addColorStop(1, '#2e7d32');
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.ellipse(W / 2, sY + 8, W / 2, sH * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        const g2 = ctx.createLinearGradient(0, sY, 0, sY + 14);
        g2.addColorStop(0, '#2e7d32'); g2.addColorStop(1, '#1b5e20');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.ellipse(W / 2, sY + 10, W * 0.45, sH * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pasto
        for (let gx = 4; gx < W - 4; gx += 5) {
            const dc = Math.abs(gx - W/2) / (W/2);
            if (dc > 0.95) continue;
            const altMax = sH * (0.55 - dc * 0.4);
            ctx.beginPath();
            ctx.moveTo(gx, sY + 2);
            ctx.quadraticCurveTo(gx+(Math.random()-.5)*7, sY-altMax*0.4, gx+(Math.random()-.5)*5, sY-altMax*(0.5+Math.random()*.4));
            ctx.strokeStyle = Math.random()>.5 ? '#81c784' : '#a5d6a7';
            ctx.lineWidth = 1 + Math.random() * 0.7;
            ctx.stroke();
        }

        // Flores del suelo
        const cols = [
            {p:'#ff4081',c:'#ffff00'},{p:'#ff6d00',c:'#fff9c4'},
            {p:'#e040fb',c:'#ffeb3b'},{p:'#ffffff',c:'#ffd600'},
            {p:'#f48fb1',c:'#fff176'},{p:'#b2ff59',c:'#ff6f00'},
            {p:'#40c4ff',c:'#fff59d'},{p:'#ff80ab',c:'#f9a825'},
            {p:'#ea80fc',c:'#ffffff'},{p:'#ccff90',c:'#e65100'},
        ];
        floresSuelo = [];
        for (let f = 0; f < 45; f++) {
            const t      = f / 45;
            const fx     = 10 + t * (W-20) + (Math.random()-.5)*18;
            const dc     = Math.abs(fx - W/2) / (W/2);
            if (dc > 0.95) continue;
            const talloH = sH * (0.4 + Math.random() * 0.6) * (1 - dc * 0.3);
            const fy     = sY - talloH;
            const col    = cols[f % cols.length];
            const r      = 2.5 + Math.random() * 2.8;

            ctx.beginPath();
            ctx.moveTo(fx, sY - 2);
            ctx.quadraticCurveTo(fx+(Math.random()-.5)*6, sY-talloH*0.55, fx, fy);
            ctx.strokeStyle = '#388e3c';
            ctx.lineWidth = 0.9 + Math.random() * 0.5;
            ctx.stroke();

            ctx.fillStyle = col.p;
            for (let p = 0; p < 6; p++) {
                const a = (p/6)*Math.PI*2;
                ctx.beginPath();
                ctx.ellipse(fx+Math.cos(a)*r*1.5, fy+Math.sin(a)*r*1.5, r*.85, r*.38, a, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(fx, fy, r*.52, 0, Math.PI*2);
            ctx.fillStyle = col.c;
            ctx.fill();

            floresSuelo.push({ x:fx, baseY:sY, talloH, col, r });
        }
    }

    /* ── Tronco ───────────────────────────────────────── */
    function drawTronco(prog) {
        const base = TY, tipY = base - TH*prog, tipX = TX + 4*prog;
        const g = ctx.createLinearGradient(TX-8,0,TX+8,0);
        g.addColorStop(0,'#3b1f08'); g.addColorStop(.5,'#7a4010'); g.addColorStop(1,'#4a2a0a');
        ctx.save();
        ctx.strokeStyle = g;
        ctx.lineWidth   = 20*(1-prog*.3);
        ctx.lineCap = ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(TX, base);
        ctx.bezierCurveTo(TX-3, base-TH*.35*prog, TX+5, base-TH*.65*prog, tipX, tipY);
        ctx.stroke();
        ctx.restore();
    }

    /* ── Ramas ────────────────────────────────────────── */
    function rama(x, y, len, ang, d, gw) {
        if (d===0 || len<5) return;
        const c = (Math.random()-.5)*.4;
        const ex = x + Math.sin(ang+c*.5)*len;
        const ey = y - Math.cos(ang+c*.5)*len;
        const cx = x + Math.sin(ang-.15)*len*.5;
        const cy = y - Math.cos(ang-.15)*len*.5;
        ctx.beginPath(); ctx.moveTo(x,y);
        ctx.quadraticCurveTo(cx,cy,ex,ey);
        ctx.strokeStyle = d>2 ? '#5a3010' : '#8a5530';
        ctx.lineWidth = gw; ctx.lineCap='round'; ctx.stroke();
        const sp = .42+Math.random()*.18;
        rama(ex,ey,len*.68,ang-sp,d-1,gw*.65);
        rama(ex,ey,len*.68,ang+sp,d-1,gw*.65);
        if (d>2) rama(ex,ey,len*.52,ang+(Math.random()-.5)*.3,d-2,gw*.5);
    }

    /* ── Flor girasol ─────────────────────────────────── */
    function flor(x, y, r) {
        ctx.save(); ctx.translate(x,y);
        ctx.fillStyle='#F5C518';
        for (let i=0;i<8;i++){
            const a=(i/8)*Math.PI*2; ctx.save(); ctx.rotate(a);
            ctx.beginPath(); ctx.ellipse(0,-r*1.55,r*.42,r*.85,0,0,Math.PI*2); ctx.fill(); ctx.restore();
        }
        ctx.fillStyle='#e8b800';
        for (let i=0;i<8;i++){
            const a=((i+.5)/8)*Math.PI*2; ctx.save(); ctx.rotate(a);
            ctx.beginPath(); ctx.ellipse(0,-r*1.35,r*.28,r*.6,0,0,Math.PI*2); ctx.fill(); ctx.restore();
        }
        ctx.beginPath(); ctx.arc(0,0,r*.65,0,Math.PI*2);
        const cg=ctx.createRadialGradient(-r*.15,-r*.15,0,0,0,r*.65);
        cg.addColorStop(0,'#5a2d00'); cg.addColorStop(.6,'#2c1503'); cg.addColorStop(1,'#1a0a00');
        ctx.fillStyle=cg; ctx.fill(); ctx.restore();
    }

    /* ── Ecuación corazón ─────────────────────────────── */
    function inHeart(px, py) {
        const nx = (px-HCX)/HRX, ny = -(py-HCY)/HRY;
        return Math.pow(nx*nx+ny*ny-1,3) - nx*nx*Math.pow(ny,3) <= 0;
    }

    function generarFlores() {
        const pts=[], paso=FR*2.1, j=paso*.35;
        for (let px=FR; px<W-FR; px+=paso)
            for (let py=FR; py<H-FR; py+=paso) {
                const jx=px+(Math.random()-.5)*j, jy=py+(Math.random()-.5)*j;
                if (inHeart(jx,jy)) pts.push({x:jx,y:jy});
            }
        return pts.sort(()=>Math.random()-.5);
    }

    /* ── Animaciones ──────────────────────────────────── */
    function animTronco(cb) {
        let p=0;
        (function tick(){
            ctx.clearRect(TX-22,TY-TH-5,44,TH+10);
            drawTronco(p); p+=.022;
            if(p<1) requestAnimationFrame(tick); else { drawTronco(1); cb(); }
        })();
    }

    function animRamas(cb) {
        rama(TX, TY-TH, H*.14, 0, 8, 5.5);
        setTimeout(cb, 200);
    }

    let puntosFlores = [];
    function animFlores(cb) {
        const pts=generarFlores(); puntosFlores=pts;
        const total=pts.length, dt=Math.max(10,Math.round(5000/total));
        let i=0;
        (function sig(){
            if(i>=total){cb();return;}
            flor(pts[i].x,pts[i].y,FR); i++;
            setTimeout(sig,dt);
        })();
    }

    /* ── Balanceo tronco (canvas dedicado) ────────────── */
    function iniciarBalanceo() {
        const tc=document.createElement('canvas');
        tc.width=W; tc.height=H;
        tc.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;z-index:2;pointer-events:none;';
        document.querySelector('.container').appendChild(tc);
        const tctx=tc.getContext('2d');
        (function tick(){
            tctx.clearRect(0,0,W,H);
            const sw=Math.sin(Date.now()/1100)*.028;
            tctx.save(); tctx.translate(TX,TY); tctx.rotate(sw); tctx.translate(-TX,-TY);
            const g=tctx.createLinearGradient(TX-8,0,TX+8,0);
            g.addColorStop(0,'#3b1f08'); g.addColorStop(.5,'#7a4010'); g.addColorStop(1,'#4a2a0a');
            tctx.strokeStyle=g; tctx.lineWidth=14; tctx.lineCap=tctx.lineJoin='round';
            tctx.beginPath(); tctx.moveTo(TX,TY);
            tctx.bezierCurveTo(TX-3,TY-TH*.35,TX+5,TY-TH*.65,TX+4,TY-TH);
            tctx.stroke(); tctx.restore();
            requestAnimationFrame(tick);
        })();
    }

    /* ── Brisa flores suelo (canvas dedicado) ─────────── */
    function iniciarBrisa() {
        const bc=document.createElement('canvas');
        bc.width=W; bc.height=H;
        bc.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;z-index:3;pointer-events:none;';
        document.querySelector('.container').appendChild(bc);
        const bctx=bc.getContext('2d');
        (function tick(){
            bctx.clearRect(0,0,W,H);
            const t=Date.now()/1000;
            floresSuelo.forEach((f,i)=>{
                const sw=Math.sin(t*1.4+i*.7)*3;
                bctx.save(); bctx.translate(f.x,f.baseY); bctx.rotate(sw*Math.PI/180);
                bctx.beginPath(); bctx.moveTo(0,0); bctx.lineTo(0,-f.talloH);
                bctx.strokeStyle='#43a047'; bctx.lineWidth=1.2; bctx.stroke();
                bctx.fillStyle=f.col.p;
                for(let p=0;p<6;p++){
                    const a=(p/6)*Math.PI*2;
                    bctx.beginPath();
                    bctx.ellipse(Math.cos(a)*f.r*1.5,-f.talloH+Math.sin(a)*f.r*1.5,f.r*.85,f.r*.38,a,0,Math.PI*2);
                    bctx.fill();
                }
                bctx.beginPath(); bctx.arc(0,-f.talloH,f.r*.52,0,Math.PI*2);
                bctx.fillStyle=f.col.c; bctx.fill(); bctx.restore();
            });
            requestAnimationFrame(tick);
        })();
    }

    /* ── Toque en flor del corazón ────────────────────── */
    const touchCols=['#ff4081','#40c4ff','#b2ff59','#ea80fc','#ff6d00','#fff','#ffeb3b'];
    function onTap(e) {
        if(!puntosFlores.length) return;
        const rect=cv.getBoundingClientRect();
        const tx=(e.clientX||e.changedTouches[0].clientX)-rect.left;
        const ty=(e.clientY||e.changedTouches[0].clientY)-rect.top;
        puntosFlores.forEach(p=>{
            if(Math.hypot(tx-p.x,ty-p.y)<FR*2.5){
                const col=touchCols[Math.floor(Math.random()*touchCols.length)];
                ctx.save(); ctx.translate(p.x,p.y); ctx.fillStyle=col;
                for(let i=0;i<8;i++){
                    const a=(i/8)*Math.PI*2; ctx.save(); ctx.rotate(a);
                    ctx.beginPath(); ctx.ellipse(0,-FR*1.55,FR*.42,FR*.85,0,0,Math.PI*2);
                    ctx.fill(); ctx.restore();
                }
                ctx.beginPath(); ctx.arc(0,0,FR*.65,0,Math.PI*2);
                ctx.fillStyle='#1a0a00'; ctx.fill(); ctx.restore();
                setTimeout(()=>flor(p.x,p.y,FR), 800);
            }
        });
    }
    cv.addEventListener('click', onTap);
    cv.addEventListener('touchend', e=>{ e.preventDefault(); onTap(e); },{passive:false});

    /* ── Flores cayendo al final ──────────────────────── */
    function particulas() {
        const cols=[
            {p:'#ff4081',c:'#ffff00'},{p:'#ff6d00',c:'#fff9c4'},{p:'#e040fb',c:'#ffeb3b'},
            {p:'#ffffff',c:'#ffd600'},{p:'#f48fb1',c:'#fff176'},{p:'#b2ff59',c:'#ff6f00'},
            {p:'#40c4ff',c:'#fff59d'},{p:'#ff80ab',c:'#f9a825'},{p:'#ea80fc',c:'#ffffff'},
            {p:'#ccff90',c:'#e65100'},
        ];
        function svgFlor(col,sz){
            const r=sz*.22, cx=sz/2;
            let ps='';
            for(let i=0;i<6;i++){
                const a=(i/6)*Math.PI*2;
                const px=cx+Math.cos(a)*r*1.5, py=cx+Math.sin(a)*r*1.5;
                ps+=`<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(r*.85).toFixed(1)}" ry="${(r*.38).toFixed(1)}" fill="${col.p}" transform="rotate(${(a*180/Math.PI).toFixed(1)},${px.toFixed(1)},${py.toFixed(1)})"/>`;
            }
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}">${ps}<circle cx="${cx}" cy="${cx}" r="${(r*.52).toFixed(1)}" fill="${col.c}"/></svg>`;
        }
        for(let i=0;i<40;i++){
            const col=cols[i%cols.length], sz=20+Math.random()*18;
            const dur=3+Math.random()*4, delay=Math.random()*3;
            const d=document.createElement('div');
            d.classList.add('florCayendo');
            d.innerHTML=svgFlor(col,sz);
            d.style.cssText=`left:${Math.random()*96}vw;top:-${sz+5}px;width:${sz}px;height:${sz}px;animation-duration:${dur}s;animation-delay:${delay}s;`;
            document.body.appendChild(d);
            setTimeout(()=>d.remove(),(dur+delay+.5)*1000);
        }
    }

    /* ── Inicio ───────────────────────────────────────── */
    let iniciado = false;
    animarEstrellas();

    btn.addEventListener('click', () => {
        if (iniciado) return;
        overlay.style.display = 'flex';
    });

    document.getElementById('modal-cerrar').addEventListener('click', () => {
        overlay.style.display = 'none';
        if (iniciado) return;
        iniciado = true;
        btn.classList.add('oculto');
        cv.classList.add('visible');
        drawSuelo();
        animTronco(() => {
            iniciarBalanceo();
            animRamas(() => {
                animFlores(() => {
                    iniciarBrisa();
                    setTimeout(() => {
                        tit.classList.add('visible');
                        particulas();
                    }, 300);
                });
            });
        });
    });

    function animarEstrellas() {
        const stars=Array.from({length:75},()=>({
            x:Math.random()*W, y:Math.random()*H*.8,
            r:.4+Math.random()*1.2, fase:Math.random()*Math.PI*2, vel:.7+Math.random()*1.2
        }));
        (function tick(){
            drawNight();
            const t=Date.now()/1000;
            stars.forEach(s=>{
                const a=.2+.8*(.5+.5*Math.sin(t*s.vel+s.fase));
                bgCtx.beginPath(); bgCtx.arc(s.x,s.y,s.r,0,Math.PI*2);
                bgCtx.fillStyle=`rgba(255,255,255,${a.toFixed(2)})`; bgCtx.fill();
            });
            requestAnimationFrame(tick);
        })();
    }

})();
