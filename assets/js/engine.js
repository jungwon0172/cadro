/* =========================================================
   카드로 렌더링 엔진 (브라우저 + Node 공용)
   - 편집기(브라우저)와 서버 썸네일 생성이 같은 코드를 쓴다.
   - 디자인 함수는 designs.js / designs-basic.js 가 E.designs 에 등록한다.
   ========================================================= */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CardroEngine = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var env = {
    createCanvas: function (w, h) {
      var c = document.createElement("canvas");
      c.width = w; c.height = h;
      return c;
    },
  };

  /* ---------- 기본 유틸 ---------- */
  function hash(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var a = hash(String(seed));
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hex(c) {
    c = String(c).replace("#", "");
    if (c.length === 3) c = c.split("").map(function (x) { return x + x; }).join("");
    return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)];
  }
  function rgba(c, a) {
    if (String(c).charAt(0) !== "#") return c;
    var v = hex(c);
    return "rgba(" + v[0] + "," + v[1] + "," + v[2] + "," + a + ")";
  }
  function toHex(v) {
    return "#" + v.map(function (x) {
      x = Math.round(clamp(x, 0, 255));
      return (x < 16 ? "0" : "") + x.toString(16);
    }).join("");
  }
  function mix(a, b, t) {
    var x = hex(a), y = hex(b);
    return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
  }
  function luma(c) { var v = hex(c); return (0.299 * v[0] + 0.587 * v[1] + 0.114 * v[2]) / 255; }
  function isDark(c) { return luma(c) < 0.45; }

  /* ---------- 폰트 ---------- */
  var SANS = '"Noto Sans KR","Gowun Dodum",sans-serif';
  var SERIF = '"Noto Serif KR","Gowun Batang",serif';
  function sans(px, w) { return (w || 400) + " " + Math.round(px) + "px " + SANS; }
  function serif(px, w) { return (w || 500) + " " + Math.round(px) + "px " + SERIF; }
  function fontStr(f, px, bold) {
    return (bold ? (f.boldWeight || 700) : f.weight) + " " + Math.round(px) + "px " + f.family;
  }
  // 사용자가 고른 글꼴로 size(기준 크기)를 보정해서 쓰는 헬퍼
  function disp(spec, size, bold) { return fontStr(spec.font, size * spec.font.scale, bold); }

  /* ---------- 텍스트 배치 ---------- */
  function wrapGreedy(ctx, text, maxW) {
    var out = [];
    String(text == null ? "" : text).split("\n").forEach(function (par) {
      if (par === "") { out.push(""); return; }
      var words = par.split(" "), line = "";
      words.forEach(function (w) {
        var test = line ? line + " " + w : w;
        if (ctx.measureText(test).width <= maxW) { line = test; return; }
        if (line) { out.push(line); line = ""; }
        if (ctx.measureText(w).width <= maxW) { line = w; return; }
        var cur = "";
        Array.from(w).forEach(function (ch) {
          if (ctx.measureText(cur + ch).width > maxW && cur) { out.push(cur); cur = ch; }
          else cur += ch;
        });
        line = cur;
      });
      out.push(line);
    });
    return out;
  }
  // 줄 수는 그대로 두고 줄 길이를 고르게 맞춘다 (마지막 줄에 한두 글자만 남는 현상 방지)
  function wrapLines(ctx, text, maxW) {
    var paras = String(text == null ? "" : text).split("\n"), out = [];
    paras.forEach(function (par) {
      var g = wrapGreedy(ctx, par, maxW);
      if (g.length > 1) {
        var lo = maxW * 0.55, hi = maxW, best = g, n = g.length;
        for (var k = 0; k < 9; k++) {
          var mid = (lo + hi) / 2, tr = wrapGreedy(ctx, par, mid);
          if (tr.length === n) { best = tr; hi = mid; } else lo = mid;
        }
        g = best;
      }
      out = out.concat(g);
    });
    return out;
  }
  // 영역(maxW x maxH)에 들어가도록 글자 크기를 줄여가며 맞춘다. size 는 기준 크기(글꼴 보정 전)
  function fitMain(ctx, spec, text, maxW, maxH, size, min, bold) {
    var f = spec.font, s = size, res;
    for (;;) {
      var px = Math.round(s * f.scale);
      ctx.font = fontStr(f, px, bold);
      var lines = wrapLines(ctx, text, maxW);
      var lh = px * f.lh;
      res = { lines: lines, px: px, lh: lh, h: lines.length * lh };
      if (res.h <= maxH || s <= min) return res;
      s -= 2;
    }
  }
  // 임의 폰트 문자열용 (고정 폰트 블록)
  function fitFixed(ctx, fontFn, text, maxW, maxH, size, min, lhMul) {
    var s = size, res;
    for (;;) {
      ctx.font = fontFn(s);
      var lines = wrapLines(ctx, text, maxW);
      var lh = s * lhMul;
      res = { lines: lines, px: s, lh: lh, h: lines.length * lh };
      if (res.h <= maxH || s <= min) return res;
      s -= 2;
    }
  }
  function drawBlock(ctx, fit, x, y, align) {
    ctx.textAlign = align || "center";
    ctx.textBaseline = "middle";
    for (var i = 0; i < fit.lines.length; i++) ctx.fillText(fit.lines[i], x, y + fit.lh * (i + 0.5));
  }
  function spaced(ctx, text, x, y, gap, align) {
    var chars = Array.from(String(text)), ws = chars.map(function (c) { return ctx.measureText(c).width; });
    var total = ws.reduce(function (a, b) { return a + b; }, 0) + gap * Math.max(0, chars.length - 1);
    var sx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    chars.forEach(function (c, i) { ctx.fillText(c, sx, y); sx += ws[i] + gap; });
  }
  function tget(spec) {
    return function (k, d) {
      var v = spec.text ? spec.text[k] : undefined;
      return (v === undefined || v === null || String(v).trim() === "") ? (d || "") : String(v);
    };
  }
  function signature(t) {
    var a = t("author"), b = t("book");
    if (a && b) return "— " + a + ", 『" + b + "』";
    if (b) return "『" + b + "』";
    if (a) return "— " + a;
    return "";
  }
  function todayStr() {
    var d = new Date(), wd = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    function p(n) { return (n < 10 ? "0" : "") + n; }
    return d.getFullYear() + ". " + p(d.getMonth() + 1) + ". " + p(d.getDate()) + " (" + wd + ")";
  }

  /* ---------- 도형/손그림 ---------- */
  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function handLine(ctx, x1, y1, x2, y2, r, amp) {
    var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    var n = Math.max(2, Math.round(dist / 70)), pts = [], i;
    for (i = 0; i <= n; i++) {
      var t = i / n, k = (i === 0 || i === n) ? 0.35 : 1;
      pts.push([x1 + (x2 - x1) * t + (r() - 0.5) * amp * k, y1 + (y2 - y1) * t + (r() - 0.5) * amp * k]);
    }
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length - 1; i++) {
      var mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    ctx.stroke();
  }
  function handRect(ctx, x, y, w, h, r, amp) {
    handLine(ctx, x - 3, y, x + w + 3, y + (r() - 0.5) * 2, r, amp);
    handLine(ctx, x + w, y - 3, x + w + (r() - 0.5) * 2, y + h + 3, r, amp);
    handLine(ctx, x + w + 3, y + h, x - 3, y + h + (r() - 0.5) * 2, r, amp);
    handLine(ctx, x, y + h + 3, x + (r() - 0.5) * 2, y - 3, r, amp);
  }
  function handCircle(ctx, cx, cy, rad, r, amp, turns) {
    var n = 36, a0 = r() * 6.28, ph = r() * 6.28;
    ctx.beginPath();
    for (var i = 0; i <= n * (turns || 1.04); i++) {
      var a = a0 + (i / n) * 6.2832;
      var rr = rad + Math.sin(a * 2 + ph) * amp * 0.6 + (r() - 0.5) * amp * 0.5;
      var x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /* ---------- 종이 질감 / 빛 ---------- */
  var grainCache = {};
  function grainTile() {
    if (grainCache.t) return grainCache.t;
    var t = env.createCanvas(256, 256), c = t.getContext("2d"), r = rng("grain"), i;
    for (i = 0; i < 5600; i++) {
      var x = r() * 256, y = r() * 256;
      c.fillStyle = r() < 0.5 ? "rgba(70,50,30," + (0.03 + r() * 0.05) + ")" : "rgba(255,255,255," + (0.06 + r() * 0.1) + ")";
      c.fillRect(x, y, r() < 0.16 ? 2 : 1, 1);
    }
    c.lineWidth = 1;
    for (i = 0; i < 70; i++) {
      var fx = r() * 256, fy = r() * 256;
      c.strokeStyle = "rgba(90,70,50," + (0.025 + r() * 0.03) + ")";
      c.beginPath(); c.moveTo(fx, fy);
      c.quadraticCurveTo(fx + (r() - 0.5) * 12, fy + (r() - 0.5) * 8, fx + (r() - 0.5) * 22, fy + (r() - 0.5) * 12);
      c.stroke();
    }
    grainCache.t = t;
    return t;
  }
  function paper(ctx, W, H, dark, strength) {
    ctx.save();
    ctx.globalAlpha = strength == null ? 1 : strength;
    ctx.fillStyle = ctx.createPattern(grainTile(), "repeat");
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    var g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.38, W / 2, H / 2, Math.max(W, H) * 0.78);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, dark ? "rgba(0,0,0,0.38)" : "rgba(80,55,30,0.13)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  function blob(ctx, x, y, rad, color, alpha) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  function shadowOn(ctx, blur, oy, a) {
    ctx.shadowColor = "rgba(40,25,10," + (a == null ? 0.25 : a) + ")";
    ctx.shadowBlur = blur; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = oy;
  }
  function shadowOff(ctx) { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.shadowOffsetX = 0; }

  /* ---------- 일러스트 부품 ---------- */
  function ribbon(ctx, x, y, w, h, color) {
    ctx.save();
    shadowOn(ctx, 10, 4, 0.22);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w / 2, y + h - w * 0.45); ctx.lineTo(x, y + h);
    ctx.closePath(); ctx.fill();
    shadowOff(ctx);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x + w * 0.2, y, 3, h - w * 0.5);
    ctx.restore();
  }
  function tape(ctx, x, y, w, h, rot, color, alpha) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    var t = 6, i;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(w / 2, -h / 2);
    for (i = 0; i < 6; i++) ctx.lineTo(w / 2 + (i % 2 ? 0 : t), -h / 2 + (h * (i + 1)) / 6);
    ctx.lineTo(-w / 2, h / 2);
    for (i = 0; i < 6; i++) ctx.lineTo(-w / 2 + (i % 2 ? t : 0), h / 2 - (h * (i + 1)) / 6);
    ctx.closePath(); ctx.fill();
    ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 6;
    for (i = -w; i < w; i += 22) { ctx.beginPath(); ctx.moveTo(i, -h); ctx.lineTo(i + h, h); ctx.stroke(); }
    ctx.restore();
  }
  function leaf(ctx, x, y, len, wid, rot, color, alpha) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(len * 0.25, -wid, len * 0.75, -wid * 0.8, len, 0);
    ctx.bezierCurveTo(len * 0.75, wid * 0.8, len * 0.25, wid, 0, 0);
    ctx.fillStyle = rgba(color, alpha); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.32)"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(len * 0.06, 0); ctx.lineTo(len * 0.9, 0); ctx.stroke();
    ctx.restore();
  }
  // 곡선 줄기에 잎이 달린 가지. (x,y) 시작점, angle 방향
  function branch(ctx, x, y, len, angle, color, seed) {
    var r = rng(seed), n = Math.max(3, Math.round(len / 52)), i;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);
    var cy = -len * 0.14;
    ctx.strokeStyle = rgba(color, 0.9); ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len / 2, cy, len, 0); ctx.stroke();
    for (i = 0; i < n; i++) {
      var t = (i + 1) / (n + 1);
      var px = 2 * (1 - t) * t * (len / 2) + t * t * len;
      var py = 2 * (1 - t) * t * cy;
      var side = i % 2 ? 1 : -1;
      leaf(ctx, px, py, 40 + r() * 30, 15 + r() * 8, side * (0.7 + r() * 0.5), color, 0.78 + r() * 0.2);
    }
    leaf(ctx, len, 0, 48, 17, -0.05, color, 0.9);
    ctx.restore();
  }
  function flower(ctx, x, y, rad, color, center) {
    ctx.save();
    ctx.translate(x, y);
    for (var i = 0; i < 5; i++) {
      ctx.rotate(Math.PI * 2 / 5);
      ctx.beginPath(); ctx.ellipse(0, -rad * 0.62, rad * 0.42, rad * 0.62, 0, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(0, 0, rad * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = center; ctx.fill();
    ctx.restore();
  }
  function sparkle(ctx, x, y, rad, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = rgba(color, alpha);
    ctx.beginPath();
    ctx.moveTo(0, -rad);
    ctx.quadraticCurveTo(0, 0, rad, 0);
    ctx.quadraticCurveTo(0, 0, 0, rad);
    ctx.quadraticCurveTo(0, 0, -rad, 0);
    ctx.quadraticCurveTo(0, 0, 0, -rad);
    ctx.fill();
    ctx.restore();
  }
  function heart(ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s, -s * 0.2, -s * 0.5, -s * 0.9, 0, -s * 0.35);
    ctx.bezierCurveTo(s * 0.5, -s * 0.9, s, -s * 0.2, 0, s * 0.35);
    ctx.fill(); ctx.restore();
  }

  /* ---------- 사진 ---------- */
  function drawCover(ctx, img, x, y, w, h, zoom) {
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    var s = Math.max(w / iw, h / ih) * (zoom || 1), dw = iw * s, dh = ih * s;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    ctx.restore();
  }
  function polaroid(ctx, spec, cx, cy, w, h, rot, caption, font) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot);
    shadowOn(ctx, 22, 10, 0.3);
    ctx.fillStyle = "#FFFEFA";
    ctx.fillRect(-w / 2, -h / 2, w, h);
    shadowOff(ctx);
    var pad = Math.round(w * 0.055), ph = h - pad * 2 - Math.round(h * 0.13);
    if (spec.photo) drawCover(ctx, spec.photo, -w / 2 + pad, -h / 2 + pad, w - pad * 2, ph, spec.photoZoom);
    else { ctx.fillStyle = "rgba(0,0,0,0.06)"; ctx.fillRect(-w / 2 + pad, -h / 2 + pad, w - pad * 2, ph); }
    if (caption) {
      ctx.fillStyle = "#6a5f55"; ctx.font = font || sans(26, 400);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(caption, 0, h / 2 - Math.round(h * 0.065));
    }
    ctx.restore();
  }
  // 책 표지 느낌의 사진 프레임 (그림자 + 책등 하이라이트)
  function coverFrame(ctx, spec, x, y, w, h, rot) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot || 0);
    shadowOn(ctx, 20, 10, 0.32);
    ctx.fillStyle = "#fff"; ctx.fillRect(-w / 2, -h / 2, w, h);
    shadowOff(ctx);
    if (spec.photo) drawCover(ctx, spec.photo, -w / 2, -h / 2, w, h, spec.photoZoom);
    var g = ctx.createLinearGradient(-w / 2, 0, -w / 2 + 22, 0);
    g.addColorStop(0, "rgba(0,0,0,0.22)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, 22, h);
    ctx.restore();
  }

  /* ---------- 마무리(워터마크 / 페이지 번호) ---------- */
  function finish(ctx, spec, res) {
    var W = spec.w, H = spec.h, P = spec.palette;
    var onDark = res && res.dark != null ? res.dark : isDark(P.bg);
    var col = onDark ? "rgba(255,255,255,0.55)" : rgba(P.ink, 0.45);
    ctx.save();
    ctx.textBaseline = "middle";
    if (spec.watermark) {
      ctx.fillStyle = col; ctx.font = sans(23, 500);
      ctx.textAlign = "center";
      spaced(ctx, spec.watermark, W / 2, H - 48, 3, "center");
    }
    if (spec.page && spec.page.show && spec.page.total > 1) {
      var txt = spec.page.index + 1 + " / " + spec.page.total;
      ctx.font = sans(22, 500);
      var tw = ctx.measureText(txt).width + 34;
      roundRectPath(ctx, W - 56 - tw, H - 48 - 20, tw, 40, 20);
      ctx.fillStyle = onDark ? "rgba(255,255,255,0.14)" : rgba(P.ink, 0.08); ctx.fill();
      ctx.fillStyle = col; ctx.textAlign = "center";
      ctx.fillText(txt, W - 56 - tw / 2, H - 48);
    }
    ctx.restore();
  }

  /* ---------- 공개 API ---------- */
  var E = {
    designs: {},
    setEnv: function (e) { for (var k in e) env[k] = e[k]; },
    render: function (ctx, spec) {
      ctx.save();
      ctx.clearRect(0, 0, spec.w, spec.h);
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      var fn = E.designs[spec.design] || E.designs.basicMinimal;
      var res = fn(ctx, spec) || {};
      shadowOff(ctx);
      ctx.globalAlpha = 1;
      finish(ctx, spec, res);
      ctx.restore();
    },
    h: {
      hash: hash, rng: rng, clamp: clamp, rgba: rgba, mix: mix, luma: luma, isDark: isDark,
      sans: sans, serif: serif, fontStr: fontStr, disp: disp,
      wrapLines: wrapLines, fitMain: fitMain, fitFixed: fitFixed, drawBlock: drawBlock, spaced: spaced,
      tget: tget, signature: signature, todayStr: todayStr,
      roundRectPath: roundRectPath, handLine: handLine, handRect: handRect, handCircle: handCircle,
      paper: paper, blob: blob, shadowOn: shadowOn, shadowOff: shadowOff,
      ribbon: ribbon, tape: tape, leaf: leaf, branch: branch, flower: flower, sparkle: sparkle, heart: heart,
      drawCover: drawCover, polaroid: polaroid, coverFrame: coverFrame,
    },
  };
  return E;
});
