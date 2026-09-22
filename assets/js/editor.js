/* =========================================================
   카드로 — 카드뉴스 실시간 편집기 (Canvas)
   PIL로 만든 원본 템플릿 디자인을 브라우저에서 동일한 톤으로 재현.
   card(1080x1350)와 story(1080x1920) 두 포맷을 canvas 크기 기준으로 지원.
   ========================================================= */
(function () {
  var MOOD_COLORS = {
    minimal: { bg: "#F7F5F1", accent: "#2B2B2B", sub: "#8A8578" },
    sentimental: { bg: "#FBEFE9", accent: "#B8624F", sub: "#D9A79C" },
    infographic: { bg: "#EAF1F3", accent: "#1F5C6E", sub: "#5B96A8" },
  };

  function hashSeed(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function wrapText(ctx, text, maxWidth) {
    var lines = [];
    var current = "";
    var chars = Array.from(text || "");
    for (var i = 0; i < chars.length; i++) {
      var test = current + chars[i];
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = chars[i];
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function drawCenteredMultiline(ctx, lines, cx, top, lineHeight) {
    var y = top;
    for (var i = 0; i < lines.length; i++) {
      var w = ctx.measureText(lines[i]).width;
      ctx.fillText(lines[i], cx - w / 2, y);
      y += lineHeight;
    }
    return y;
  }

  function drawMinimal(ctx, cfg, w, h) {
    var c = MOOD_COLORS.minimal;
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, w, h);
    ctx.textBaseline = "top"; ctx.textAlign = "left";

    var margin = 90;
    ctx.strokeStyle = c.accent; ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);

    ctx.fillStyle = c.sub;
    ctx.font = '500 28px "Noto Sans KR", sans-serif';
    ctx.fillText("READING NOTE", margin + 40, margin + 50);

    ctx.strokeStyle = c.accent; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(margin + 40, margin + 110);
    ctx.lineTo(margin + 200, margin + 110);
    ctx.stroke();

    ctx.fillStyle = c.accent;
    ctx.font = '700 66px "Noto Serif KR", serif';
    var title = cfg.title || "문장을 입력해 보세요";
    var lines = wrapText(ctx, title, w - 2 * (margin + 40));
    var startY = h / 2 - (lines.length * 84) / 2;
    drawCenteredMultiline(ctx, lines, w / 2, startY, 84);

    ctx.fillStyle = c.sub;
    ctx.font = '400 26px "Noto Sans KR", sans-serif';
    var cap = cfg.caption || "여기에 문장을 채워 넣어보세요";
    var cw = ctx.measureText(cap).width;
    ctx.fillText(cap, w / 2 - cw / 2, h - margin - 130);

    ctx.font = '400 22px "Noto Sans KR", sans-serif';
    ctx.fillText("카드로 · cardro.kr", margin + 40, h - margin - 60);
  }

  function drawSentimental(ctx, cfg, w, h, slug) {
    var c = MOOD_COLORS.sentimental;
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, w, h);

    // soft blobs (seeded so it's stable per template)
    var rand = mulberry32(hashSeed(slug || "seed"));
    var blobColors = [
      "rgba(216,167,156,0.28)",
      "rgba(184,98,79,0.16)",
      "rgba(250,235,225,0.5)",
    ];
    ctx.save();
    try { ctx.filter = "blur(70px)"; } catch (e) {}
    for (var i = 0; i < 5; i++) {
      var cx = rand() * w;
      var cy = rand() * h * 0.5;
      var r = 150 + rand() * 170;
      ctx.fillStyle = blobColors[Math.floor(rand() * blobColors.length)];
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.textBaseline = "top"; ctx.textAlign = "left";
    ctx.fillStyle = c.accent;
    ctx.font = '700 160px "Noto Serif KR", serif';
    ctx.fillText("\u201C", 90, 90);

    ctx.font = '500 58px "Noto Serif KR", serif';
    var quote = cfg.title || "인상 깊은 문장을 입력해 보세요";
    var lines = wrapText(ctx, quote, w - 260);
    var y = h / 2 - (lines.length * 76) / 2;
    for (var i2 = 0; i2 < lines.length; i2++) {
      var lw = ctx.measureText(lines[i2]).width;
      ctx.fillText(lines[i2], w / 2 - lw / 2, y);
      y += 76;
    }

    ctx.font = '700 160px "Noto Serif KR", serif';
    var w2 = ctx.measureText("\u201D").width;
    ctx.fillText("\u201D", w - 90 - w2, h - 400);

    ctx.fillStyle = c.sub;
    ctx.font = '400 24px "Noto Sans KR", sans-serif';
    var cap = cfg.caption || "오늘, 이 문장이 마음에 남았다";
    var capw = ctx.measureText(cap).width;
    ctx.fillText(cap, w / 2 - capw / 2, h - 170);

    ctx.font = '400 20px "Noto Sans KR", sans-serif';
    ctx.fillText("카드로 · cardro.kr", 90, h - 90);
  }

  function drawInfographic(ctx, cfg, w, h) {
    var c = MOOD_COLORS.infographic;
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, w, h);
    ctx.textBaseline = "top"; ctx.textAlign = "left";

    ctx.fillStyle = c.accent; ctx.fillRect(0, 0, w, 140);
    ctx.fillStyle = "#fff";
    ctx.font = '700 40px "Noto Sans KR", sans-serif';
    ctx.fillText("BOOK CARD", 60, 45);

    ctx.fillStyle = c.accent;
    ctx.font = '700 52px "Noto Sans KR", sans-serif';
    var titleLines = wrapText(ctx, cfg.title || "제목을 입력해 보세요", w - 120);
    var y = 200;
    y = drawCenteredMultiline(ctx, titleLines, w / 2, y, 66);

    var blockTop = y + 60;
    var blockH = 150;
    var shapes = ["circle", "square", "triangle"];
    var items = cfg.items || [];

    for (var i = 0; i < 3; i++) {
      var it = items[i] || {};
      var by = blockTop + i * (blockH + 30);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = c.sub; ctx.lineWidth = 2;
      roundRect(ctx, 80, by, w - 160, blockH, 18);
      ctx.fill(); ctx.stroke();

      var iconCx = 160, iconCy = by + blockH / 2, r = 34;
      ctx.fillStyle = c.accent;
      if (shapes[i] === "circle") {
        ctx.beginPath(); ctx.arc(iconCx, iconCy, r, 0, Math.PI * 2); ctx.fill();
      } else if (shapes[i] === "square") {
        roundRect(ctx, iconCx - r, iconCy - r, r * 2, r * 2, 10); ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(iconCx, iconCy - r);
        ctx.lineTo(iconCx - r, iconCy + r);
        ctx.lineTo(iconCx + r, iconCy + r);
        ctx.closePath(); ctx.fill();
      }

      ctx.fillStyle = c.accent;
      ctx.font = '700 30px "Noto Sans KR", sans-serif';
      ctx.fillText(it.label || ("항목 " + (i + 1)), 230, by + 30);

      ctx.fillStyle = c.sub;
      ctx.font = '400 24px "Noto Sans KR", sans-serif';
      ctx.fillText(it.desc || "내용을 채워보세요", 230, by + 78);
    }

    ctx.fillStyle = c.sub;
    ctx.font = '400 22px "Noto Sans KR", sans-serif';
    ctx.fillText("카드로 · cardro.kr", 60, h - 70);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  var RENDERERS = {
    minimal: drawMinimal,
    sentimental: drawSentimental,
    infographic: drawInfographic,
  };

  function collectConfig(mood, root) {
    var cfg = {};
    var titleEl = root.querySelector('[data-field="title"]');
    if (titleEl) cfg.title = titleEl.value;
    var capEl = root.querySelector('[data-field="caption"]');
    if (capEl) cfg.caption = capEl.value;
    if (mood === "infographic") {
      cfg.items = [];
      for (var i = 1; i <= 3; i++) {
        var lab = root.querySelector('[data-field="item' + i + 'label"]');
        var desc = root.querySelector('[data-field="item' + i + 'desc"]');
        cfg.items.push({
          label: lab ? lab.value : "",
          desc: desc ? desc.value : "",
        });
      }
    }
    return cfg;
  }

  function initEditor(opts) {
    var root = document.getElementById(opts.rootId);
    if (!root) return;
    var canvas = root.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var slug = opts.slug;
    var mood = opts.mood;
    // 캔버스 자체의 width/height 속성(포맷별로 build.py가 지정)을 그대로 사용
    var w = canvas.width || 1080;
    var h = canvas.height || 1350;

    function redraw() {
      var cfg = collectConfig(mood, root);
      var renderer = RENDERERS[mood];
      if (mood === "sentimental") {
        renderer(ctx, cfg, w, h, slug);
      } else {
        renderer(ctx, cfg, w, h);
      }
    }

    // Draw immediately so something always shows, even if the Font Loading
    // API is unavailable in this browser.
    redraw();

    if (window.FontFace && document.fonts && typeof document.fonts.load === "function") {
      var fontSpecs = [
        '700 66px "Noto Serif KR"',
        '500 58px "Noto Serif KR"',
        '400 26px "Noto Sans KR"',
        '700 40px "Noto Sans KR"',
      ];
      Promise.all(
        fontSpecs.map(function (f) {
          try {
            return document.fonts.load(f, "가").catch(function () {});
          } catch (e) {
            return Promise.resolve();
          }
        })
      ).then(redraw).catch(function () {});

      if (document.fonts.ready && typeof document.fonts.ready.then === "function") {
        document.fonts.ready.then(redraw).catch(function () {});
      }
    } else {
      // Fallback for older browsers: redraw once more after a short delay
      // to give web fonts a chance to swap in.
      setTimeout(redraw, 400);
      setTimeout(redraw, 1200);
    }

    var inputs = root.querySelectorAll("[data-field]");
    inputs.forEach(function (inp) {
      inp.addEventListener("input", redraw);
    });

    var downloadBtn = root.querySelector("[data-download]");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function () {
        canvas.toBlob(function (blob) {
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = slug + ".png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        }, "image/png");
      });
    }
  }

  window.CardroEditor = { init: initEditor };
})();
