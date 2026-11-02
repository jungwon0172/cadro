/* =========================================================
   기본 디자인 3종 — 대표 9종 이외의 템플릿이 쓴다. variant 로 레이아웃이 달라진다.
   카드(4:5)와 스토리(9:16) 모두 높이(H)에 맞춰 배치된다.
   ========================================================= */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory;
  else factory(root.CardroEngine);
})(typeof self !== "undefined" ? self : this, function (E) {
  "use strict";
  var h = E.h, D = E.designs, PI = Math.PI;

  function onColor(c) { return h.isDark(c) ? "#FFFFFF" : "#2B2723"; }
  function fitOne(ctx, fontFn, text, maxW, size, min) {
    var s = size; ctx.font = fontFn(s);
    while (ctx.measureText(text).width > maxW && s > min) { s -= 2; ctx.font = fontFn(s); }
    return s;
  }

  /* ---------- 미니멀 기본 ---------- */
  D.basicMinimal = function (ctx, spec) {
    var W = spec.w, H = spec.h, P = spec.palette, t = h.tget(spec), r = h.rng(spec.seed + "bm"), v = spec.variant || 0, cx = W / 2;
    var dark = h.isDark(P.bg), m = 84;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
    h.paper(ctx, W, H, dark, 1);
    var left = v === 2;
    ctx.lineWidth = 2.4;
    if (v === 0) {
      ctx.strokeStyle = h.rgba(P.ink, 0.5); h.handRect(ctx, m, m, W - m * 2, H - m * 2, r, 2.4);
      ctx.strokeStyle = h.rgba(P.ink, 0.2); ctx.lineWidth = 1.4; h.handRect(ctx, m + 18, m + 18, W - m * 2 - 36, H - m * 2 - 36, r, 1.8);
    } else if (v === 1) {
      ctx.strokeStyle = h.rgba(P.ink, 0.75); ctx.lineWidth = 3.2;
      var L = 100, o = 76;
      [[o, o, 1, 1], [W - o, o, -1, 1], [o, H - o, 1, -1], [W - o, H - o, -1, -1]].forEach(function (c) {
        ctx.beginPath(); ctx.moveTo(c[0] + c[2] * L, c[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0], c[1] + c[3] * L); ctx.stroke();
      });
    } else {
      ctx.fillStyle = P.accent; ctx.fillRect(96, 130, 8, H - 260);
      ctx.fillStyle = h.rgba(P.accent, 0.18); ctx.font = h.serif(300, 700); ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("\u201C", 130, 330);
    }
    var labelY = Math.round(H * 0.125), tx = left ? 150 : cx, ta = left ? "left" : "center";
    ctx.textBaseline = "middle"; ctx.fillStyle = P.soft; ctx.font = h.sans(25, 500);
    h.spaced(ctx, t("label", "READING NOTE"), tx, labelY, 6, ta);
    ctx.strokeStyle = h.rgba(P.accent, 0.85); ctx.lineWidth = 3;
    h.handLine(ctx, left ? 150 : cx - 40, labelY + 38, left ? 230 : cx + 40, labelY + 38, r, 2);

    var hasPhoto = !!spec.photo, top = labelY + 90;
    if (hasPhoto) {
      var pw = 250, ph = 340, px = left ? 150 : cx - pw / 2;
      h.coverFrame(ctx, spec, px, top, pw, ph, -0.02);
      h.tape(ctx, px + pw / 2, top + 4, 110, 36, 0.05, P.accent, 0.5);
      top += ph + 50;
    } else top += 20;
    var bottom = H - 300, maxW = left ? W - 150 - 120 : W - 2 * (m + 76);
    var fit = h.fitMain(ctx, spec, t("title", "문장을 입력해 보세요"), maxW, bottom - top, H > 1500 ? 84 : 68, 32, false);
    var y0 = top + Math.max(0, (bottom - top - fit.h) / 2);
    ctx.fillStyle = P.ink; ctx.font = h.fontStr(spec.font, fit.px, false);
    h.drawBlock(ctx, fit, left ? 150 : cx, y0, ta);
    var sig = h.signature(t);
    if (sig) { ctx.fillStyle = P.soft; ctx.font = h.disp(spec, 31, false); ctx.textAlign = ta; ctx.fillText(sig, left ? 150 : cx, y0 + fit.h + 62); }
    var cap = t("caption");
    if (cap) { ctx.fillStyle = h.rgba(P.ink, 0.6); ctx.font = h.sans(27, 400); ctx.textAlign = ta; ctx.fillText(cap, left ? 150 : cx, H - 168); }
    if (v === 0) h.sparkle(ctx, cx, H - 118, 13, P.accent, 0.85);
    return { dark: dark };
  };

  /* ---------- 감성 기본 ---------- */
  D.basicSentimental = function (ctx, spec) {
    var W = spec.w, H = spec.h, P = spec.palette, t = h.tget(spec), r = h.rng(spec.seed + "bs"), v = spec.variant || 0, cx = W / 2, i;
    var dark = h.isDark(P.bg);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
    h.blob(ctx, 160, H * 0.16, 520, P.accent, dark ? 0.24 : 0.28);
    h.blob(ctx, W - 100, H * 0.82, 560, h.mix(P.accent, "#FFFFFF", 0.35), dark ? 0.2 : 0.38);
    h.blob(ctx, W - 160, H * 0.12, 340, P.soft, 0.22);
    h.paper(ctx, W, H, dark, 0.75);
    var lc = h.mix("#6F9272", P.accent, 0.12);
    ctx.textBaseline = "middle";
    var labelY = Math.round(H * 0.13), label = t("label");
    var textL = 150, textR = W - 150, top = Math.round(H * 0.22), bottom = H - 300;

    if (v === 0) {
      ctx.fillStyle = h.rgba(P.accent, 0.8); ctx.font = h.serif(190, 700); ctx.textAlign = "left";
      ctx.fillText("\u201C", 90, 230);
      ctx.textAlign = "right"; ctx.fillText("\u201D", W - 90, H - 330);
    } else if (v === 1) {
      var nw = W - 190, nh = H - 440, ncy = H / 2 - 20;
      ctx.save(); ctx.translate(cx, ncy); ctx.rotate(-0.02);
      h.shadowOn(ctx, 32, 14, 0.28);
      ctx.fillStyle = dark ? h.mix(P.bg, "#ffffff", 0.14) : h.mix(P.bg, "#FFFFFF", 0.7);
      ctx.fillRect(-nw / 2, -nh / 2, nw, nh); h.shadowOff(ctx);
      ctx.strokeStyle = h.rgba(P.accent, 0.14); ctx.lineWidth = 1.6;
      for (i = 1; i < Math.floor(nh / 66); i++) { ctx.beginPath(); ctx.moveTo(-nw / 2 + 40, -nh / 2 + i * 66 + 40); ctx.lineTo(nw / 2 - 40, -nh / 2 + i * 66 + 40); ctx.stroke(); }
      ctx.restore();
      h.tape(ctx, cx, ncy - nh / 2 - 2, 240, 62, 0.04, P.accent, 0.58);
      textL = 190; textR = W - 190; top = Math.round(ncy - nh / 2 + 110); bottom = Math.round(ncy + nh / 2 - 130);
    } else {
      h.branch(ctx, -30, 120, 400, 0.6, lc, spec.seed + "l1");
      h.branch(ctx, W + 30, H - 80, 400, -2.55, lc, spec.seed + "l2");
      h.sparkle(ctx, W - 150, 150, 26, P.accent, 0.85); h.sparkle(ctx, 130, H - 200, 18, P.accent, 0.75); h.sparkle(ctx, W - 220, 230, 12, P.accent, 0.6);
      h.flower(ctx, 330, 330, 24, h.mix(P.accent, "#ffffff", 0.45), "#F4D98A");
    }
    if (label) {
      var ly = v === 1 ? top - 56 : labelY;
      ctx.fillStyle = P.soft; ctx.font = h.sans(24, 500); h.spaced(ctx, label, cx, ly, 6, "center");
    }
    if (spec.photo) {
      var pr = 130, py = top + pr + 10;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, py, pr, 0, PI * 2); ctx.clip();
      h.drawCover(ctx, spec.photo, cx - pr, py - pr, pr * 2, pr * 2, spec.photoZoom); ctx.restore();
      ctx.strokeStyle = h.rgba(P.accent, 0.85); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, py, pr + 12, 0, PI * 2); ctx.stroke();
      top = py + pr + 50;
    }
    var fit = h.fitMain(ctx, spec, t("title", "마음에 남은 문장을 적어보세요"), textR - textL, bottom - top, H > 1500 ? 82 : 64, 32, false);
    var y0 = top + Math.max(0, (bottom - top - fit.h) / 2);
    ctx.fillStyle = P.ink; ctx.font = h.fontStr(spec.font, fit.px, false); h.drawBlock(ctx, fit, cx, y0, "center");
    var sig = h.signature(t);
    if (sig) { ctx.fillStyle = P.soft; ctx.font = h.disp(spec, 31, false); ctx.textAlign = "center"; ctx.fillText(sig, cx, y0 + fit.h + 64); }
    var cap = t("caption");
    if (cap) { ctx.fillStyle = h.rgba(P.accent, 0.95); ctx.font = h.disp(spec, 34, false); ctx.textAlign = "center"; ctx.fillText(cap, cx, H - 170); }
    return { dark: dark };
  };

  /* ---------- 인포그래픽 기본 ---------- */
  D.basicInfographic = function (ctx, spec) {
    var W = spec.w, H = spec.h, P = spec.palette, t = h.tget(spec), v = spec.variant || 0, cx = W / 2, i, x, y;
    var dark = h.isDark(P.bg), cardBg = dark ? h.mix(P.bg, "#ffffff", 0.1) : h.mix(P.bg, "#FFFFFF", 0.78);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = h.rgba(P.ink, 0.1);
    for (y = 40; y < H; y += 36) for (x = 40; x < W; x += 36) { ctx.beginPath(); ctx.arc(x, y, 1.5, 0, PI * 2); ctx.fill(); }
    h.paper(ctx, W, H, dark, 0.55);
    ctx.fillStyle = P.accent; ctx.fillRect(0, 0, W, 150);
    ctx.textBaseline = "middle"; ctx.fillStyle = onColor(P.accent); ctx.font = h.sans(34, 700); ctx.textAlign = "left";
    h.spaced(ctx, t("label", "BOOK CARD"), 70, 75, 5, "left");
    var hasPhoto = !!spec.photo;
    if (hasPhoto) h.coverFrame(ctx, spec, W - 70 - 120, 36, 120, 170, 0.04);
    var titleTop = 200, fit = h.fitMain(ctx, spec, t("title", "제목을 입력해 보세요"), W - 160, 190, 64, 34, true);
    ctx.fillStyle = P.ink; ctx.font = h.fontStr(spec.font, fit.px, true); h.drawBlock(ctx, fit, cx, titleTop, "center");
    var startY = Math.max(titleTop + fit.h + 50, Math.round(H * 0.3)), bh = 200, gap = 30, shapes = ["circle", "square", "triangle"];
    for (i = 0; i < 3; i++) {
      var by = startY + i * (bh + gap), lab = t("i" + (i + 1) + "l", "항목 " + (i + 1)), desc = t("i" + (i + 1) + "d");
      ctx.save(); h.shadowOn(ctx, 18, 6, 0.12);
      h.roundRectPath(ctx, 80, by, W - 160, bh, 26); ctx.fillStyle = cardBg; ctx.fill(); h.shadowOff(ctx);
      ctx.strokeStyle = h.rgba(P.ink, 0.1); ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      var ix = 170, iy = by + bh / 2;
      if (v === 0) {
        ctx.fillStyle = P.accent;
        if (shapes[i] === "circle") { ctx.beginPath(); ctx.arc(ix, iy, 40, 0, PI * 2); ctx.fill(); }
        else if (shapes[i] === "square") { h.roundRectPath(ctx, ix - 40, iy - 40, 80, 80, 14); ctx.fill(); }
        else { ctx.beginPath(); ctx.moveTo(ix, iy - 44); ctx.lineTo(ix - 44, iy + 36); ctx.lineTo(ix + 44, iy + 36); ctx.closePath(); ctx.fill(); }
      } else {
        ctx.beginPath(); ctx.arc(ix, iy, 46, 0, PI * 2); ctx.fillStyle = P.accent; ctx.fill();
        ctx.fillStyle = onColor(P.accent); ctx.font = h.sans(50, 700); ctx.textAlign = "center"; ctx.fillText(String(i + 1), ix, iy + 2);
        if (i < 2) { ctx.setLineDash([6, 8]); ctx.strokeStyle = h.rgba(P.accent, 0.5); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ix, iy + 52); ctx.lineTo(ix, iy + bh + gap - 52); ctx.stroke(); ctx.setLineDash([]); }
      }
      ctx.textAlign = "left";
      var ls = fitOne(ctx, function (s) { return h.disp(spec, s, true); }, lab, W - 160 - 200 - 40, 48, 28);
      ctx.fillStyle = P.accent; ctx.font = h.disp(spec, ls, true); ctx.fillText(lab, 260, by + 72);
      var ds = fitOne(ctx, function (s) { return h.sans(s, 400); }, desc, W - 160 - 200 - 40, 32, 20);
      ctx.fillStyle = P.soft; ctx.font = h.sans(ds, 400); ctx.fillText(desc, 260, by + 134);
    }
    var sig = h.signature(t);
    if (sig) { ctx.fillStyle = P.soft; ctx.font = h.disp(spec, 30, false); ctx.textAlign = "center"; ctx.fillText(sig, cx, startY + 3 * bh + 2 * gap + 66); }
    return { dark: dark };
  };
});
