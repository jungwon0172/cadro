/* =========================================================
   대표 디자인 9종 — 종이 질감 · 손글씨 · 일러스트
   ========================================================= */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory;
  else factory(root.CardroEngine);
})(typeof self !== "undefined" ? self : this, function (E) {
  "use strict";
  var h = E.h, D = E.designs;
  var PI = Math.PI;

  function fitOne(ctx, fontFn, text, maxW, size, min) {
    var s = size;
    ctx.font = fontFn(s);
    while (ctx.measureText(text).width > maxW && s > min) { s -= 2; ctx.font = fontFn(s); }
    return s;
  }
  function star(ctx, x, y, R, r, color) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -PI / 2 + i * PI / 5, rad = i % 2 ? r : R;
      if (i) ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
      else ctx.moveTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }
  function onColor(c) { return h.isDark(c) ? "#FFFFFF" : "#2B2723"; }
  function leafColor(P) { return h.mix("#6F9272", P.accent, 0.12); }

  /* ---------- 1. 종이 노트 (오늘의 한 문장) ---------- */
  D.paperNote = function (ctx, spec) {
    var W = spec.w, H = spec.h, P = spec.palette, t = h.tget(spec), r = h.rng(spec.seed + "pn"), cx = W / 2;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
    h.paper(ctx, W, H, h.isDark(P.bg), 1);
    ctx.strokeStyle = h.rgba(P.ink, 0.5); ctx.lineWidth = 2.4; h.handRect(ctx, 60, 60, W - 120, H - 150, r, 2.4);
    ctx.strokeStyle = h.rgba(P.ink, 0.2); ctx.lineWidth = 1.4; h.handRect(ctx, 80, 80, W - 160, H - 190, r, 1.8);
    h.ribbon(ctx, W - 200, 60, 66, 220, P.accent);

    ctx.textBaseline = "middle"; ctx.textAlign = "center";
    ctx.fillStyle = P.soft; ctx.font = h.sans(24, 500);
    h.spaced(ctx, "TODAY'S SENTENCE", cx, 190, 6, "center");
    ctx.fillStyle = h.rgba(P.ink, 0.55); ctx.font = h.sans(22, 400); ctx.textAlign = "center";
    ctx.fillText(t("date") || h.todayStr(), cx, 236);
    ctx.strokeStyle = h.rgba(P.accent, 0.85); ctx.lineWidth = 3; h.handLine(ctx, cx - 46, 282, cx + 46, 282, r, 2);

    var hasPhoto = !!spec.photo;
    var top = 330, bottom = hasPhoto ? 740 : 940;
    ctx.fillStyle = h.rgba(P.accent, 0.85); ctx.font = h.serif(150, 700); ctx.textAlign = "center";
    ctx.fillText("\u201C", cx, top + 40);
    var areaTop = top + 100, areaH = bottom - areaTop;
    var fit = h.fitMain(ctx, spec, t("title", "문장을 입력해 보세요"), W - 300, areaH, 68, 34, false);
    var y0 = areaTop + (areaH - fit.h) * 0.3;
    ctx.fillStyle = P.ink; ctx.font = h.fontStr(spec.font, fit.px, false);
    h.drawBlock(ctx, fit, cx, y0, "center");
    var yEnd = y0 + fit.h;
    ctx.strokeStyle = h.rgba(P.accent, 0.75); ctx.lineWidth = 3.4; h.handLine(ctx, cx - 90, yEnd + 36, cx + 90, yEnd + 32, r, 5);
    var sig = h.signature(t);
    if (sig) {
      ctx.fillStyle = P.soft; ctx.font = h.disp(spec, 32, false);
      ctx.textAlign = "center"; ctx.fillText(sig, cx, yEnd + 94);
    }
    if (hasPhoto) {
      h.polaroid(ctx, spec, cx, 1030, 340, 400, -0.04, "");
      h.tape(ctx, cx + 10, 842, 130, 40, 0.05, P.accent, 0.5);
    } else {
      var lc = leafColor(P);
      h.branch(ctx, cx - 20, 1140, 150, PI + 0.25, lc, spec.seed + "s1");
      h.branch(ctx, cx + 20, 1140, 150, -0.25, lc, spec.seed + "s2");
      h.sparkle(ctx, cx, 1140, 14, P.accent, 0.9);
    }
    return { dark: h.isDark(P.bg) };
  };

  /* ---------- 2. 도서 대출카드 (완독) ---------- */
  D.libraryCard = function (ctx, spec) {
    var W = spec.w, H = spec.h, P = spec.palette, t = h.tget(spec), r = h.rng(spec.seed + "lc"), dark = h.isDark(P.bg), i;
    var desk = dark ? h.mix(P.bg, "#000000", 0.2) : h.mix(P.bg, "#8a7457", 0.4);
    ctx.fillStyle = desk; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = h.rgba("#000000", 0.05); ctx.lineWidth = 2;
    for (i = 0; i < 28; i++) {
      var gy = r() * H;
      ctx.beginPath(); ctx.moveTo(0, gy);
      ctx.bezierCurveTo(W * 0.3, gy + (r() - 0.5) * 30, W * 0.6, gy + (r() - 0.5) * 30, W, gy + (r() - 0.5) * 20); ctx.stroke();
    }
    h.paper(ctx, W, H, dark, 1);

    var cw = W - 190, ch = H - 260;
    var manila = dark ? h.mix(P.bg, "#ffffff", 0.18) : h.mix(P.bg, "#F0DDB0", 0.85);
    var inkc = dark ? "#F2EAD8" : "#3A2F25";
    ctx.save();
    ctx.translate(W / 2, H / 2 - 6); ctx.rotate(-0.012);
    h.shadowOn(ctx, 34, 16, 0.35);
    h.roundRectPath(ctx, -cw / 2, -ch / 2, cw, ch, 10);
    ctx.fillStyle = manila; ctx.fill(); h.shadowOff(ctx);
    ctx.save(); h.roundRectPath(ctx, -cw / 2, -ch / 2, cw, ch, 10); ctx.clip();
    ctx.translate(-W / 2, -H / 2); h.paper(ctx, W, H, false, 0.9); ctx.restore();

    var L = -cw / 2, T = -ch / 2, R = cw / 2;
    // 펀치 구멍
    ctx.beginPath(); ctx.arc(0, T + 54, 17, 0, PI * 2); ctx.fillStyle = desk; ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 3; ctx.stroke();
    // 헤더
    ctx.textBaseline = "middle"; ctx.textAlign = "center";
    ctx.fillStyle = h.rgba(inkc, 0.55); ctx.font = h.sans(20, 500); h.spaced(ctx, "LIBRARY CARD", 0, T + 108, 6, "center");
    ctx.fillStyle = inkc; ctx.font = h.serif(58, 700); ctx.textAlign = "center"; ctx.fillText("도서 대출카드", 0, T + 164);
    ctx.fillStyle = h.rgba(inkc, 0.5); ctx.font = h.sans(20, 500); ctx.textAlign = "right";
    ctx.fillText("NO. " + String(1000 + Math.floor(r() * 8999)), R - 56, T + 70);
    ctx.strokeStyle = P.accent; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(L + 56, T + 218); ctx.lineTo(R - 56, T + 218); ctx.stroke();
    ctx.strokeStyle = h.rgba(P.accent, 0.6); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(L + 56, T + 230); ctx.lineTo(R - 56, T + 230); ctx.stroke();

    // 기록 항목
    var rows = [["도서명", t("book", "책 제목")], ["저자", t("author", "저자 이름")], ["읽기 시작", t("startDate")], ["완독일", t("endDate")]];
    var hasPhoto = !!spec.photo, rowEnd = hasPhoto ? R - 56 - 220 : R - 56, vx = L + 210;
    for (i = 0; i < rows.length; i++) {
      var ry = T + 300 + i * 88;
      ctx.fillStyle = h.rgba(inkc, 0.6); ctx.font = h.sans(23, 500); ctx.textAlign = "left"; ctx.fillText(rows[i][0], L + 56, ry);
      ctx.strokeStyle = h.rgba(inkc, 0.35); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(vx - 14, ry + 30); ctx.lineTo(rowEnd, ry + 30); ctx.stroke();
      var size = fitOne(ctx, function (s) { return h.disp(spec, s, false); }, rows[i][1], rowEnd - vx, 42, 24);
      ctx.fillStyle = inkc; ctx.font = h.disp(spec, size, false); ctx.textAlign = "left"; ctx.fillText(rows[i][1], vx, ry - 4);
    }
    if (hasPhoto) {
      h.coverFrame(ctx, spec, R - 56 - 200, T + 258, 200, 282, 0.04);
      h.tape(ctx, R - 56 - 100, T + 262, 110, 36, -0.06, P.accent, 0.5);
    }
    // 한 줄 소감
    var secY = T + 656;
    ctx.fillStyle = h.rgba(inkc, 0.6); ctx.font = h.sans(23, 500); ctx.textAlign = "left"; ctx.fillText("한 줄 소감", L + 56, secY);
    var lineY0 = secY + 98, step = 76, maxLines = 5;
    for (i = 0; i < maxLines; i++) {
      ctx.strokeStyle = h.rgba(inkc, 0.28); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(L + 56, lineY0 + i * step); ctx.lineTo(R - 56, lineY0 + i * step); ctx.stroke();
    }
    var s2 = 46, lines;
    for (;;) {
      ctx.font = h.disp(spec, s2, false);
      lines = h.wrapLines(ctx, t("title", "한 줄 소감을 적어보세요"), cw - 112);
      if (lines.length <= maxLines || s2 <= 24) break;
      s2 -= 2;
    }
    ctx.fillStyle = inkc; ctx.textAlign = "left";
    for (i = 0; i < Math.min(lines.length, maxLines); i++) ctx.fillText(lines[i], L + 60, lineY0 + i * step - 30);

    // 완독 도장
    var sx = R - 200, sy = ch / 2 - 150, sr = 104;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.26);
    var stampC = P.accent;
    ctx.globalAlpha = 0.88; ctx.strokeStyle = stampC; ctx.fillStyle = stampC;
    ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, sr, 0, PI * 2); ctx.stroke();
    ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, sr - 14, 0, PI * 2); ctx.stroke();
    var stampTxt = t("stamp", "완독");
    var ss = fitOne(ctx, function (s) { return h.serif(s, 700); }, stampTxt, sr * 1.5, 66, 28);
    ctx.font = h.serif(ss, 700); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(stampTxt, 0, -6);
    ctx.font = h.sans(19, 700); h.spaced(ctx, t("endDate", "").replace(/\s/g, "") || "READ", 0, 46, 2, "center");
    ctx.globalAlpha = 1;
    ctx.fillStyle = manila;
    for (i = 0; i < 130; i++) {
      var a = r() * PI * 2, rr = Math.sqrt(r()) * (sr + 6);
      ctx.globalAlpha = 0.5 + r() * 0.4;
      ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 0.8 + r() * 2.2, 0, PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.restore();
    return { dark: h.isDark(desk) };
  };

  /* ---------- 3. 독서 목표 체크리스트 ---------- */
  D.checklist = function (ctx, spec) {
    var W = spec.w, H = spec.h, P = spec.palette, t = h.tget(spec), r = h.rng(spec.seed + "ck"), cx = W / 2, i, x, y;
    var dark = h.isDark(P.bg);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
    h.paper(ctx, W, H, dark, 1);
    ctx.fillStyle = h.rgba(P.ink, 0.17);
    for (y = 120; y < H - 80; y += 40) for (x = 150; x < W - 50; x += 40) { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, PI * 2); ctx.fill(); }
    // 바인더 구멍
    for (i = 0; i < 4; i++) {
      var hy = 200 + i * 300;
      ctx.beginPath(); ctx.arc(62, hy, 18, 0, PI * 2); ctx.fillStyle = h.mix(P.bg, "#000000", 0.28); ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(60, hy - 2, 18, PI * 1.1, PI * 1.9); ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 2; ctx.stroke();
    }
    h.tape(ctx, cx, 112, 400, 72, -0.025, P.accent, 0.62);
    ctx.textBaseline = "middle"; ctx.textAlign = "center";
    var ts = fitOne(ctx, function (s) { return h.disp(spec, s, true); }, t("title", "나의 독서 목표"), W - 300, 100, 54);
    ctx.fillStyle = P.ink; ctx.font = h.disp(spec, ts, true); ctx.fillText(t("title", "나의 독서 목표"), cx, 262);
    ctx.strokeStyle = h.rgba(P.accent, 0.85); ctx.lineWidth = 5; h.handLine(ctx, cx - 190, 326, cx + 190, 322, r, 6);
    var period = t("period");
    if (period) {
      ctx.font = h.sans(26, 700);
      var pw = ctx.measureText(period).width + 64;
      h.roundRectPath(ctx, cx - pw / 2, 372, pw, 52, 26); ctx.fillStyle = P.accent; ctx.fill();
      ctx.fillStyle = onColor(P.accent); ctx.textAlign = "center"; ctx.fillText(period, cx, 399);
    }
    // 목표 항목
    var yy = 500, shown = 0;
    for (i = 1; i <= 5; i++) {
      var raw = t("goal" + i); if (!raw) continue;
      var checked = /^\s*[✓✔]/.test(raw), txt = raw.replace(/^\s*[✓✔]\s*/, "");
      var iy = yy + shown * 112;
      ctx.strokeStyle = h.rgba(P.ink, 0.8); ctx.lineWidth = 3.4; h.handRect(ctx, 150, iy - 30, 60, 60, r, 3);
      var fs = fitOne(ctx, function (s) { return h.disp(spec, s, false); }, txt, W - 250 - 110, 50, 28);
      ctx.font = h.disp(spec, fs, false);
      var tw = ctx.measureText(txt).width;
      if (checked) {
        ctx.fillStyle = h.rgba(P.accent, 0.2); ctx.fillRect(244, iy + 2, tw + 16, 26);
        ctx.strokeStyle = P.accent; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(162, iy - 2); ctx.lineTo(180, iy + 18); ctx.lineTo(228, iy - 40); ctx.stroke();
      }
      ctx.fillStyle = P.ink; ctx.textAlign = "left"; ctx.fillText(txt, 252, iy - 2);
      ctx.strokeStyle = h.rgba(P.ink, 0.18); ctx.lineWidth = 2; h.handLine(ctx, 240, iy + 40, W - 100, iy + 40, r, 3);
      shown++;
    }
    // 스티커
    var sx = W - 235, sy = H - 250, sr = 132;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(0.14);
    h.shadowOn(ctx, 16, 8, 0.28);
    ctx.beginPath(); ctx.arc(0, 0, sr, 0, PI * 2); ctx.fillStyle = P.accent; ctx.fill(); h.shadowOff(ctx);
    ctx.setLineDash([10, 9]); ctx.strokeStyle = h.rgba(onColor(P.accent), 0.6); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, sr - 16, 0, PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = onColor(P.accent); ctx.textAlign = "center";
    var gc = t("goalCount", "12");
    ctx.font = h.sans(gc.length > 2 ? 86 : 118, 700); ctx.fillText(gc, 0, -12);
    ctx.font = h.sans(38, 500); ctx.fillText(t("unit", "권"), 0, 66);
    ctx.restore();
    h.sparkle(ctx, sx - 170, sy - 130, 22, P.accent, 0.9);
    h.sparkle(ctx, sx + 150, sy - 160, 14, P.accent, 0.7);
    // 응원 문구
    var cap = t("caption");
    if (cap) {
      var cf = h.fitMain(ctx, spec, cap, 560, 160, 54, 30, false);
      ctx.fillStyle = h.rgba(P.ink, 0.82); ctx.font = h.fontStr(spec.font, cf.px, false);
      h.drawBlock(ctx, cf, 150, H - 250 - cf.h / 2, "left");
      h.heart(ctx, 170, H - 250 + cf.h / 2 + 36, 18, P.accent);
    }
    return { dark: dark };
  };

  /* ---------- 4. 폴라로이드 인용 ---------- */
  D.polaroidQuote = function (ctx, spec) {
    var W = spec.w, H = spec.h, P = spec.palette, t = h.tget(spec), r = h.rng(spec.seed + "pq"), i;
    var dark = h.isDark(P.bg);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
    h.blob(ctx, 200, 220, 560, P.accent, dark ? 0.25 : 0.3);
    h.blob(ctx, W - 120, H - 280, 600, h.mix(P.accent, "#FFFFFF", 0.35), dark ? 0.2 : 0.4);
    h.blob(ctx, W - 200, 160, 360, P.soft, 0.25);
    h.paper(ctx, W, H, dark, 0.8);
    var lc = leafColor(P);
    h.branch(ctx, -30, 130, 440, 0.62, lc, spec.seed + "b1");
    h.flower(ctx, 360, 360, 26, h.mix(P.accent, "#ffffff", 0.45), "#F4D98A");
    h.flower(ctx, 400, 318, 17, h.mix(P.accent, "#ffffff", 0.6), "#F4D98A");

    var nw = 800, nh = 900, ncx = W / 2, ncy = H / 2 - 30;
    ctx.save(); ctx.translate(ncx, ncy); ctx.rotate(-0.022);
    h.shadowOn(ctx, 36, 16, 0.3);
    ctx.fillStyle = dark ? h.mix(P.bg, "#ffffff", 0.14) : h.mix(P.bg, "#FFFFFF", 0.72);
    ctx.fillRect(-nw / 2, -nh / 2, nw, nh); h.shadowOff(ctx);
    var ink = dark ? P.ink : P.ink;
    ctx.strokeStyle = h.rgba(P.accent, 0.3); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-nw / 2 + 96, -nh / 2); ctx.lineTo(-nw / 2 + 96, nh / 2); ctx.stroke();
    ctx.textBaseline = "middle"; ctx.textAlign = "center";
    var label = t("label");
    if (label) { ctx.fillStyle = P.soft; ctx.font = h.sans(23, 500); h.spaced(ctx, label, 0, -nh / 2 + 100, 5, "center"); }
    ctx.fillStyle = h.rgba(P.accent, 0.5); ctx.font = h.serif(130, 700); ctx.textAlign = "left"; ctx.fillText("\u201C", -nw / 2 + 120, -nh / 2 + 196);
    var areaX = -nw / 2 + 136, areaW = nw - 136 - 80, areaTop = -nh / 2 + 232, areaH = nh - 232 - 190;
    var fit = h.fitMain(ctx, spec, t("title", "마음에 남은 문장을 적어보세요"), areaW, areaH, 84, 34, false);
    var y0 = areaTop + Math.max(0, (areaH - fit.h) * 0.28);
    ctx.strokeStyle = h.rgba(P.accent, 0.2); ctx.lineWidth = 1.6;
    for (i = 0; i <= fit.lines.length; i++) {
      var ly = y0 + fit.lh * (i + 1) - fit.lh * 0.1;
      ctx.beginPath(); ctx.moveTo(-nw / 2 + 110, ly); ctx.lineTo(nw / 2 - 60, ly); ctx.stroke();
    }
    ctx.fillStyle = ink; ctx.font = h.fontStr(spec.font, fit.px, false);
    h.drawBlock(ctx, fit, areaX, y0, "left");
    var sig = h.signature(t);
    if (sig) { ctx.fillStyle = P.soft; ctx.font = h.disp(spec, 32, false); ctx.textAlign = "left"; ctx.fillText(sig, -nw / 2 + 130, nh / 2 - 84); }
    ctx.restore();
    h.tape(ctx, ncx - 6, ncy - nh / 2 + 4, 250, 64, 0.04, P.accent, 0.58);

    if (spec.photo) {
      h.polaroid(ctx, spec, W - 240, H - 290, 330, 400, 0.1, "");
      h.tape(ctx, W - 222, H - 478, 130, 40, -0.2, P.accent, 0.55);
    } else {
      h.branch(ctx, W + 20, H - 70, 430, -2.62, lc, spec.seed + "b2");
      h.flower(ctx, W - 150, H - 330, 28, h.mix(P.accent, "#ffffff", 0.4), "#F4D98A");
      h.flower(ctx, W - 100, H - 380, 18, h.mix(P.accent, "#ffffff", 0.55), "#F4D98A");
    }
    h.sparkle(ctx, W - 130, 120, 22, P.accent, 0.8);
    h.sparkle(ctx, 120, H - 160, 16, P.accent, 0.7);
    return { dark: dark };
  };

  /* ---------- 5. 비 오는 창가 ---------- */
  D.rainWindow = function (ctx, spec) {
    var W = spec.w, H = spec.h, P = spec.palette, t = h.tget(spec), r = h.rng(spec.seed + "rw"), cx = W / 2, i;
    var deep = h.isDark(P.ink) ? P.ink : P.bg, light = h.isDark(P.bg) ? P.ink : P.bg;
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, h.mix(deep, "#000000", 0.3)); g.addColorStop(1, h.mix(deep, P.accent, 0.28));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var warm = [h.mix(P.accent, "#FFD79A", 0.6), "#FFE2B8", h.mix(light, P.accent, 0.4), "#FFC98A"];
    for (i = 0; i < 18; i++) h.blob(ctx, r() * W, H * 0.5 + r() * H * 0.5, 50 + r() * 90, warm[Math.floor(r() * warm.length)], 0.16 + r() * 0.14);
    h.blob(ctx, cx, H * 0.3, 640, light, 0.07);
    ctx.fillStyle = "rgba(0,0,0,0.16)"; ctx.fillRect(cx - 8, 0, 16, H); ctx.fillRect(0, H * 0.72 - 8, W, 16);
    ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(cx + 8, 0, 3, H); ctx.fillRect(0, H * 0.72 + 8, W, 3);
    // 빗줄기
    ctx.lineCap = "round";
    for (i = 0; i < 180; i++) {
      var x = r() * (W + 200) - 100, y = r() * H, len = 40 + r() * 90;
      ctx.strokeStyle = h.rgba(light, 0.07 + r() * 0.2); ctx.lineWidth = 1.2 + r() * 1.4;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * 0.18, y + len); ctx.stroke();
    }
    // 물방울
    for (i = 0; i < 34; i++) {
      var dx = r() * W, dy = r() * H, dw = 8 + r() * 14, dh = dw * (1.3 + r() * 0.7);
      if (r() < 0.45) { ctx.strokeStyle = h.rgba(light, 0.12); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx, dy - dh - 40 - r() * 60); ctx.lineTo(dx, dy - dh); ctx.stroke(); }
      var dg = ctx.createRadialGradient(dx - dw * 0.3, dy - dh * 0.3, 1, dx, dy, dh);
      dg.addColorStop(0, h.rgba(light, 0.28)); dg.addColorStop(1, h.rgba(light, 0.05));
      ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(dx, dy, dw, dh, 0, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = h.rgba(light, 0.3); ctx.lineWidth = 1.4; ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.beginPath(); ctx.ellipse(dx - dw * 0.35, dy - dh * 0.4, dw * 0.2, dh * 0.18, 0, 0, PI * 2); ctx.fill();
    }
    ctx.textBaseline = "middle"; ctx.textAlign = "center";
    ctx.fillStyle = h.rgba(light, 0.8); ctx.font = h.sans(26, 500); h.spaced(ctx, t("label", "RAINY DAY"), cx, 220, 7, "center");
    ctx.fillStyle = h.rgba(light, 0.62); ctx.font = h.sans(26, 400); ctx.textAlign = "center"; ctx.fillText(t("weather"), cx, 274);
    ctx.strokeStyle = h.rgba(P.accent, 0.9); ctx.lineWidth = 3; h.handLine(ctx, cx - 44, 322, cx + 44, 322, r, 2);
    var fit = h.fitMain(ctx, spec, t("title", "비 오는 날의 문장을 적어보세요"), W - 280, 520, 68, 34, false);
    var y0 = 380 + (520 - fit.h) / 2;
    h.shadowOn(ctx, 16, 3, 0.45);
    ctx.fillStyle = light; ctx.font = h.fontStr(spec.font, fit.px, false); h.drawBlock(ctx, fit, cx, y0, "center");
    var sig = h.signature(t);
    if (sig) { ctx.fillStyle = h.rgba(light, 0.7); ctx.font = h.disp(spec, 32, false); ctx.textAlign = "center"; ctx.fillText(sig, cx, y0 + fit.h + 70); }
    h.shadowOff(ctx);
    // 우산
    var ux = cx, uy = H - 270, ur = 88, uc = h.mix(P.accent, light, 0.18);
    ctx.fillStyle = h.rgba(uc, 0.95);
    ctx.beginPath(); ctx.moveTo(ux - ur, uy); ctx.arc(ux, uy, ur, PI, 0);
    ctx.quadraticCurveTo(ux + ur * 0.66, uy + 26, ux + ur * 0.33, uy);
    ctx.quadraticCurveTo(ux, uy + 26, ux - ur * 0.33, uy);
    ctx.quadraticCurveTo(ux - ur * 0.66, uy + 26, ux - ur, uy); ctx.fill();
    ctx.strokeStyle = h.rgba(uc, 0.95); ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(ux, uy - ur); ctx.lineTo(ux, uy - ur - 14); ctx.moveTo(ux, uy); ctx.lineTo(ux, uy + 96);
    ctx.arc(ux - 18, uy + 96, 18, 0, PI); ctx.stroke();
    return { dark: true };
  };

  /* ---------- 6. 밤하늘 독서 ---------- */
  D.nightSky = function (ctx, spec) {
    var W = spec.w, H = spec.h, P = spec.palette, t = h.tget(spec), r = h.rng(spec.seed + "ns"), cx = W / 2, i;
    var deep = h.isDark(P.bg) ? P.bg : h.mix(P.ink, "#000000", 0.2), light = h.isDark(P.bg) ? P.ink : P.bg;
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, h.mix(deep, "#000000", 0.45)); g.addColorStop(0.7, deep); g.addColorStop(1, h.mix(deep, P.accent, 0.2));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    h.paper(ctx, W, H, true, 0.55);
    for (i = 0; i < 170; i++) {
      var sx = r() * W, sy = r() * H * 0.78, sr = 0.6 + r() * 1.7;
      ctx.fillStyle = h.rgba(light, 0.25 + r() * 0.65); ctx.beginPath(); ctx.arc(sx, sy, sr, 0, PI * 2); ctx.fill();
    }
    for (i = 0; i < 9; i++) {
      var spx = r() * W, spy = 80 + r() * 700, spr = 10 + r() * 12, spa = 0.55 + r() * 0.35;
      if (spx < 560 && spy > 170 && spy < 310) continue;
      h.sparkle(ctx, spx, spy, spr, light, spa);
    }
    // 달
    var mx = W - 230, my = 250, R = 86, rr = 74, d = 34;
    h.blob(ctx, mx, my, 320, P.accent, 0.3);
    var x0 = (d * d + R * R - rr * rr) / (2 * d), y0 = Math.sqrt(Math.max(0, R * R - x0 * x0));
    ctx.save(); ctx.translate(mx, my);
    ctx.beginPath(); ctx.moveTo(x0, -y0);
    ctx.arc(0, 0, R, Math.atan2(-y0, x0), Math.atan2(y0, x0), true);
    ctx.arc(d, 0, rr, Math.atan2(y0, x0 - d), Math.atan2(-y0, x0 - d), false);
    ctx.closePath(); ctx.fillStyle = h.mix(P.accent, "#FFF6DC", 0.7); ctx.fill(); ctx.restore();

    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    ctx.fillStyle = P.accent; ctx.font = h.sans(25, 500); h.spaced(ctx, t("label", "MIDNIGHT PAGE"), 110, 220, 6, "left");
    ctx.fillStyle = h.rgba(light, 0.7); ctx.font = h.sans(28, 400); ctx.textAlign = "left"; ctx.fillText(t("time"), 110, 272);
    var fit = h.fitMain(ctx, spec, t("title", "밤에 읽은 문장을 적어보세요"), W - 300, 460, 66, 34, false);
    var y0t = 420 + (460 - fit.h) / 2;
    h.shadowOn(ctx, 18, 0, 0.5);
    ctx.shadowColor = h.rgba(P.accent, 0.35);
    ctx.fillStyle = h.mix(light, "#FFF6DC", 0.4); ctx.font = h.fontStr(spec.font, fit.px, false); h.drawBlock(ctx, fit, cx, y0t, "center");
    h.shadowOff(ctx);
    var sig = h.signature(t);
    if (sig) { ctx.fillStyle = h.rgba(light, 0.65); ctx.font = h.disp(spec, 31, false); ctx.textAlign = "center"; ctx.fillText(sig, cx, y0t + fit.h + 66); }
    // 스탠드 불빛 + 펼친 책
    var by = 1130;
    h.blob(ctx, cx, by - 40, 560, "#FFD58A", 0.34);
    var page = h.mix("#FFF3D6", P.accent, 0.08);
    ctx.fillStyle = page;
    ctx.beginPath(); ctx.moveTo(cx - 6, by - 56); ctx.lineTo(cx - 340, by - 92); ctx.lineTo(cx - 372, by + 62); ctx.lineTo(cx - 6, by + 100); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + 6, by - 56); ctx.lineTo(cx + 340, by - 92); ctx.lineTo(cx + 372, by + 62); ctx.lineTo(cx + 6, by + 100); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath(); ctx.moveTo(cx - 6, by - 56); ctx.lineTo(cx - 80, by - 48); ctx.lineTo(cx - 80, by + 92); ctx.lineTo(cx - 6, by + 100); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + 6, by - 56); ctx.lineTo(cx + 80, by - 48); ctx.lineTo(cx + 80, by + 92); ctx.lineTo(cx + 6, by + 100); ctx.fill();
    ctx.strokeStyle = "rgba(90,70,50,0.35)"; ctx.lineWidth = 2.2;
    for (i = 0; i < 6; i++) {
      var o = i * 22;
      ctx.beginPath(); ctx.moveTo(cx - 60, by - 40 + o * 0.9); ctx.lineTo(cx - 300, by - 68 + o); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 60, by - 40 + o * 0.9); ctx.lineTo(cx + 300, by - 68 + o); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(60,40,20,0.5)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 372, by + 62); ctx.lineTo(cx - 6, by + 100); ctx.lineTo(cx + 372, by + 62); ctx.stroke();
    h.sparkle(ctx, cx + 250, by - 190, 20, "#FFE7A8", 0.9);
    h.sparkle(ctx, cx - 280, by - 160, 13, "#FFE7A8", 0.75);
    return { dark: true };
  };

  /* ---------- 7. 키워드 카드 ---------- */
  D.keywordCards = function (ctx, spec) {
    var W = spec.w, H = spec.h, P = spec.palette, t = h.tget(spec), r = h.rng(spec.seed + "kc"), i, x, y;
    var dark = h.isDark(P.bg), cardBg = dark ? h.mix(P.bg, "#ffffff", 0.1) : h.mix(P.bg, "#FFFFFF", 0.78);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = h.rgba(P.ink, 0.12);
    for (y = 40; y < H; y += 36) for (x = 40; x < W; x += 36) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, PI * 2); ctx.fill(); }
    h.paper(ctx, W, H, dark, 0.6);
    ctx.textBaseline = "middle";
    h.roundRectPath(ctx, 90, 94, 196, 50, 25); ctx.fillStyle = P.accent; ctx.fill();
    ctx.fillStyle = onColor(P.accent); ctx.font = h.sans(22, 700); ctx.textAlign = "center"; h.spaced(ctx, "KEYWORDS", 188, 120, 4, "center");
    var hasPhoto = !!spec.photo, tw = hasPhoto ? 600 : W - 180;
    var fit = h.fitMain(ctx, spec, t("book", "책 제목"), tw, 150, 70, 36, true);
    ctx.fillStyle = P.ink; ctx.font = h.fontStr(spec.font, fit.px, true); h.drawBlock(ctx, fit, 90, 176, "left");
    ctx.fillStyle = P.soft; ctx.font = h.sans(30, 400); ctx.textAlign = "left"; ctx.fillText(t("author", "저자 이름"), 92, 176 + fit.h + 34);
    if (hasPhoto) {
      h.coverFrame(ctx, spec, W - 90 - 210, 100, 210, 296, 0.04);
      h.tape(ctx, W - 195, 104, 110, 36, -0.08, P.accent, 0.5);
    } else {
      h.sparkle(ctx, W - 160, 190, 38, P.accent, 0.85); h.sparkle(ctx, W - 110, 130, 18, P.accent, 0.6);
    }
    var cy0 = 430, chh = 222, gap = 26;
    for (i = 0; i < 3; i++) {
      var cy = cy0 + i * (chh + gap), k = t("k" + (i + 1), "키워드"), d = t("d" + (i + 1));
      ctx.save();
      h.shadowOn(ctx, 22, 8, 0.12);
      h.roundRectPath(ctx, 70, cy, W - 140, chh, 26); ctx.fillStyle = cardBg; ctx.fill(); h.shadowOff(ctx);
      ctx.strokeStyle = h.rgba(P.ink, 0.1); ctx.lineWidth = 2; ctx.stroke();
      h.roundRectPath(ctx, 70, cy, 16, chh, 8); ctx.fillStyle = P.accent; ctx.fill();
      ctx.restore();
      ctx.textBaseline = "middle"; ctx.textAlign = "left";
      ctx.fillStyle = h.rgba(P.accent, 0.92); ctx.font = h.sans(80, 700); ctx.fillText("0" + (i + 1), 118, cy + chh / 2);
      ctx.strokeStyle = h.rgba(P.ink, 0.12); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(268, cy + 34); ctx.lineTo(268, cy + chh - 34); ctx.stroke();
      var ks = fitOne(ctx, function (s) { return h.disp(spec, s, true); }, k, 470, 60, 30);
      ctx.fillStyle = P.ink; ctx.font = h.disp(spec, ks, true); ctx.fillText(k, 304, cy + 84);
      var ds = fitOne(ctx, function (s) { return h.sans(s, 400); }, d, 470, 30, 20);
      ctx.fillStyle = P.soft; ctx.font = h.sans(ds, 400); ctx.fillText(d, 304, cy + 156);
      var ix = W - 70 - 96, iy = cy + chh / 2;
      ctx.beginPath(); ctx.arc(ix, iy, 56, 0, PI * 2); ctx.fillStyle = h.rgba(P.accent, 0.14); ctx.fill();
      if (i === 0) star(ctx, ix, iy + 2, 30, 13, P.accent);
      else if (i === 1) h.heart(ctx, ix, iy + 4, 32, P.accent);
      else h.sparkle(ctx, ix, iy, 32, P.accent, 1);
    }
    var sm = t("summary");
    if (sm) {
      var sy = cy0 + 3 * chh + 2 * gap + 38;
      ctx.font = h.disp(spec, 34, false);
      var ss = fitOne(ctx, function (s) { return h.disp(spec, s, false); }, sm, W - 240, 36, 22);
      ctx.font = h.disp(spec, ss, false);
      var sw = Math.min(W - 140, ctx.measureText(sm).width + 90);
      h.roundRectPath(ctx, W / 2 - sw / 2, sy, sw, 72, 36); ctx.fillStyle = h.rgba(P.accent, 0.13); ctx.fill();
      ctx.setLineDash([10, 8]); ctx.strokeStyle = h.rgba(P.accent, 0.8); ctx.lineWidth = 2.4; ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = P.ink; ctx.textAlign = "center"; ctx.fillText(sm, W / 2, sy + 37);
    }
    return { dark: dark };
  };

  /* ---------- 8. 독서 진행률 링 ---------- */
  D.progressRing = function (ctx, spec) {
    var W = spec.w, H = spec.h, P = spec.palette, t = h.tget(spec), i, cx = W / 2;
    var dark = h.isDark(P.bg);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
    h.blob(ctx, cx, 700, 620, P.accent, dark ? 0.16 : 0.13);
    h.paper(ctx, W, H, dark, 0.8);
    ctx.textBaseline = "middle";
    ctx.fillStyle = P.accent; ctx.font = h.sans(24, 700); ctx.textAlign = "center";
    var hasPhoto = !!spec.photo;
    var tx = hasPhoto ? 300 : cx, ta = hasPhoto ? "left" : "center", tw = hasPhoto ? 690 : W - 200;
    h.spaced(ctx, "READING PROGRESS", tx, 112, 5, ta);
    var fit = h.fitMain(ctx, spec, t("book", "책 제목"), tw, 120, 60, 34, true);
    ctx.fillStyle = P.ink; ctx.font = h.fontStr(spec.font, fit.px, true); h.drawBlock(ctx, fit, tx, 150, ta);
    ctx.fillStyle = P.soft; ctx.font = h.sans(28, 400); ctx.textAlign = ta; ctx.fillText(t("author", "저자 이름"), tx, 150 + fit.h + 34);
    if (hasPhoto) h.coverFrame(ctx, spec, 90, 92, 170, 240, -0.03);

    var ringY = 690, RR = 250, LW = 64;
    var pr = parseFloat(t("percent")), pr2 = parseFloat(t("pagesRead")), pt = parseFloat(t("pagesTotal"));
    var pct = isNaN(pr) ? (pt > 0 && !isNaN(pr2) ? pr2 / pt * 100 : 0) : pr;
    pct = h.clamp(pct, 0, 100);
    for (i = 0; i < 40; i++) {
      var a = i / 40 * PI * 2 - PI / 2, big = i % 4 === 0;
      ctx.strokeStyle = h.rgba(P.ink, big ? 0.3 : 0.14); ctx.lineWidth = big ? 4 : 2.4;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (RR + 50), ringY + Math.sin(a) * (RR + 50));
      ctx.lineTo(cx + Math.cos(a) * (RR + (big ? 76 : 66)), ringY + Math.sin(a) * (RR + (big ? 76 : 66))); ctx.stroke();
    }
    ctx.lineCap = "round"; ctx.lineWidth = LW;
    ctx.strokeStyle = h.rgba(P.ink, 0.1); ctx.beginPath(); ctx.arc(cx, ringY, RR, 0, PI * 2); ctx.stroke();
    if (pct > 0) {
      var end = -PI / 2 + pct / 100 * PI * 2;
      ctx.strokeStyle = P.accent; ctx.beginPath(); ctx.arc(cx, ringY, RR, -PI / 2, end); ctx.stroke();
      var kx = cx + Math.cos(end) * RR, ky = ringY + Math.sin(end) * RR;
      ctx.beginPath(); ctx.arc(kx, ky, 12, 0, PI * 2); ctx.fillStyle = onColor(P.accent); ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
    }
    var pstr = String(Math.round(pct));
    ctx.fillStyle = P.ink; ctx.font = h.sans(pstr.length > 2 ? 140 : 170, 700); ctx.textAlign = "center"; ctx.fillText(pstr, cx - 16, ringY - 12);
    var pw = ctx.measureText(pstr).width;
    ctx.font = h.sans(60, 500); ctx.fillStyle = P.accent; ctx.textAlign = "left"; ctx.fillText("%", cx - 16 + pw / 2 + 8, ringY + 14);
    ctx.fillStyle = P.soft; ctx.font = h.sans(32, 500); ctx.textAlign = "center"; ctx.fillText(pct >= 100 ? "완독!" : "읽는 중", cx, ringY + 112);

    var rd = t("pagesRead"), tt = t("pagesTotal");
    if (rd || tt) {
      ctx.fillStyle = P.ink; ctx.font = h.sans(50, 700); ctx.textAlign = "center";
      ctx.fillText((rd || "0") + (tt ? " / " + tt : "") + "쪽", cx, 1042);
    }
    var cap = t("caption");
    if (cap) { ctx.fillStyle = P.soft; ctx.font = h.disp(spec, 32, false); ctx.textAlign = "center"; ctx.fillText(cap, cx, 1102); }
    var st = h.clamp(parseInt(t("streak", "0"), 10) || 0, 0, 7), days = ["월", "화", "수", "목", "금", "토", "일"];
    for (i = 0; i < 7; i++) {
      var dx = cx + (i - 3) * 118, dy = 1190;
      ctx.beginPath(); ctx.arc(dx, dy, 30, 0, PI * 2);
      if (i < st) {
        ctx.fillStyle = P.accent; ctx.fill();
        ctx.strokeStyle = onColor(P.accent); ctx.lineWidth = 6; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(dx - 12, dy + 1); ctx.lineTo(dx - 3, dy + 11); ctx.lineTo(dx + 14, dy - 10); ctx.stroke();
      } else { ctx.strokeStyle = h.rgba(P.ink, 0.25); ctx.lineWidth = 3; ctx.stroke(); }
      ctx.fillStyle = h.rgba(P.ink, i < st ? 0.7 : 0.4); ctx.font = h.sans(22, 500); ctx.textAlign = "center"; ctx.fillText(days[i], dx, dy + 54);
    }
    return { dark: dark };
  };

  /* ---------- 9. 월간 책장 ---------- */
  D.bookshelf = function (ctx, spec) {
    var W = spec.w, H = spec.h, P = spec.palette, t = h.tget(spec), r = h.rng(spec.seed + "bs"), cx = W / 2, i, j;
    var dark = h.isDark(P.bg);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = h.rgba(P.ink, 0.04);
    for (i = 0; i < W; i += 60) ctx.fillRect(i, 0, 28, H);
    h.paper(ctx, W, H, dark, 1);
    var raw = t("books", "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 10);
    var month = t("month", ""), title = month ? (month.indexOf("책장") >= 0 ? month : month + "의 책장") : "이번 달 책장";
    ctx.textBaseline = "middle"; ctx.textAlign = "center";
    var ts = fitOne(ctx, function (s) { return h.disp(spec, s, true); }, title, W - 200, 100, 50);
    ctx.fillStyle = P.ink; ctx.font = h.disp(spec, ts, true); ctx.fillText(title, cx, 190);
    var pill = "이번 달 " + raw.length + "권";
    ctx.font = h.sans(27, 700); var pw = ctx.measureText(pill).width + 60;
    h.roundRectPath(ctx, cx - pw / 2, 262, pw, 52, 26); ctx.fillStyle = P.accent; ctx.fill();
    ctx.fillStyle = onColor(P.accent); ctx.fillText(pill, cx, 289);

    var wood = h.mix("#B58A5B", P.bg, dark ? 0.55 : 0.2), woodD = h.mix(wood, "#000000", 0.22);
    var ux = 70, uw = W - 140, topY = 360, p1 = 720, p2 = 1110, bot = 1138;
    ctx.fillStyle = h.mix(P.bg, "#000000", dark ? 0.25 : 0.1); ctx.fillRect(ux + 26, topY + 28, uw - 52, bot - topY - 28);
    h.shadowOn(ctx, 18, 6, 0.2);
    ctx.fillStyle = wood; ctx.fillRect(ux, topY, uw, 28); ctx.fillRect(ux, p1, uw, 28); ctx.fillRect(ux, p2, uw, 28); ctx.fillRect(ux, bot - 2, uw, 20);
    ctx.fillRect(ux, topY, 26, bot - topY); ctx.fillRect(ux + uw - 26, topY, 26, bot - topY);
    h.shadowOff(ctx);
    ctx.fillStyle = "rgba(255,255,255,0.18)"; [topY, p1, p2].forEach(function (yy) { ctx.fillRect(ux, yy, uw, 4); });
    ctx.fillStyle = h.rgba(woodD, 0.5); [topY + 24, p1 + 24, p2 + 24].forEach(function (yy) { ctx.fillRect(ux, yy, uw, 4); });

    var cols = ["#C06C4F", "#E0B25B", "#6D8F78", "#4F7289", "#A5657B", "#8A7A5E", "#D98F7A", "#59687F", "#7A9C5E", "#9D6B4B"];
    function shelf(books, baseY, minH, maxH, startI) {
      var x = ux + 26 + 26;
      books.forEach(function (name, k) {
        var bw = 92 + Math.floor(r() * 30), bh = minH + Math.floor(r() * (maxH - minH));
        var c = h.mix(cols[(startI + k) % cols.length], P.bg, 0.12), tilt = (k === books.length - 1 && books.length < 5 && r() < 0.5) ? 0.1 : 0;
        ctx.save(); ctx.translate(x + bw / 2, baseY); ctx.rotate(tilt);
        h.shadowOn(ctx, 8, 2, 0.25);
        ctx.fillStyle = c; ctx.fillRect(-bw / 2, -bh, bw, bh); h.shadowOff(ctx);
        ctx.fillStyle = "rgba(255,255,255,0.14)"; ctx.fillRect(-bw / 2, -bh, 6, bh);
        ctx.fillStyle = "rgba(0,0,0,0.14)"; ctx.fillRect(bw / 2 - 6, -bh, 6, bh);
        ctx.fillStyle = h.rgba(onColor(c), 0.55); ctx.fillRect(-bw / 2 + 10, -bh + 22, bw - 20, 4); ctx.fillRect(-bw / 2 + 10, -22, bw - 20, 4);
        ctx.save(); ctx.translate(0, -bh / 2); ctx.rotate(PI / 2);
        var tl = bh - 120, fs = 36;
        ctx.font = h.disp(spec, fs, true);
        while (ctx.measureText(name).width > tl && fs > 18) { fs -= 2; ctx.font = h.disp(spec, fs, true); }
        var shown = name;
        if (ctx.measureText(shown).width > tl) { while (shown.length > 1 && ctx.measureText(shown + "…").width > tl) shown = shown.slice(0, -1); shown += "…"; }
        ctx.fillStyle = onColor(c); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(shown, 0, 0);
        ctx.restore();
        ctx.restore();
        x += bw + 8 + (tilt ? 22 : 0);
      });
      return x;
    }
    var s1 = raw.slice(0, 5), s2 = raw.slice(5, 10);
    var e1 = shelf(s1, p1, 232, 296, 0);
    var e2 = shelf(s2, p2, 256, 322, 5);
    // 소품: 화분 / 책 더미
    var potX = W - ux - 26 - 120;
    ctx.fillStyle = h.mix("#C98A6B", P.bg, 0.1);
    ctx.beginPath(); ctx.moveTo(potX - 56, p1 - 84); ctx.lineTo(potX + 56, p1 - 84); ctx.lineTo(potX + 42, p1); ctx.lineTo(potX - 42, p1); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(potX - 56, p1 - 84, 112, 12);
    var lc = h.mix("#6D8F78", P.accent, 0.1);
    [-0.9, -0.45, 0, 0.45, 0.9].forEach(function (a, k) { h.leaf(ctx, potX, p1 - 84, 74 - Math.abs(a) * 14, 20, -PI / 2 + a, lc, 0.95 - k * 0.02); });
    if (s2.length === 0) {
      ctx.fillStyle = h.rgba(P.ink, 0.35); ctx.font = h.disp(spec, 34, false); ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("다음 달의 책이 꽂힐 자리", cx, p2 - 150);
    }
    var sx = W - ux - 26 - 270, sy = p2;
    [["#59687F", 250, 40], ["#D98F7A", 226, 38], ["#E0B25B", 206, 36]].forEach(function (b) {
      sy -= b[2];
      ctx.fillStyle = h.mix(b[0], P.bg, 0.1); ctx.fillRect(sx + (250 - b[1]) / 2, sy, b[1], b[2]);
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(sx + (250 - b[1]) / 2 + 8, sy + 6, b[1] - 16, 3);
    });
    h.sparkle(ctx, sx + 200, sy - 36, 16, P.accent, 0.9);
    var cap = t("caption");
    if (cap) { ctx.fillStyle = h.rgba(P.ink, 0.75); ctx.font = h.disp(spec, 40, false); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(cap, cx, 1228); }
    return { dark: dark };
  };
});
