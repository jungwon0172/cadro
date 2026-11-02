/* =========================================================
   카드로 편집기 (브라우저)
   - 글꼴/색상/사진/여러 장 세트/PNG·ZIP 다운로드/자동 저장
   - 모든 처리는 브라우저 안에서만 이루어진다 (사진·텍스트는 서버로 전송되지 않음)
   ========================================================= */
(function () {
  var E = window.CardroEngine, Z = window.CardroZip;
  var cfgEl = document.getElementById("studio-config");
  var root = document.getElementById("studio");
  if (!E || !cfgEl || !root) return;
  var CFG = JSON.parse(cfgEl.textContent), T = CFG.tpl, G = CFG.global;
  var canvas = root.querySelector("canvas"), ctx = canvas.getContext("2d");
  var MAX_SLIDES = 8, KEY = "cardro:v2:" + T.slug;

  function $(sel) { return root.querySelector(sel); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function defaults() { var v = {}; T.fields.forEach(function (f) { v[f.key] = f.default; }); return v; }
  function defaultWm() {
    var h = location.hostname || "";
    if (!h || h === "localhost" || h.indexOf(".") < 0 || /^\d+\.\d+\.\d+\.\d+$/.test(h)) return "카드로";
    return "카드로 · " + h.replace(/^www\./, "");
  }

  var state = {
    slides: [defaults()], active: 0, palette: T.palette, font: T.font,
    wmOn: true, wmText: defaultWm(), pageNum: false, zoom: 1,
  };
  var photo = null, photoUrl = null;

  /* ---------- 저장 / 복원 ---------- */
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var s = JSON.parse(raw);
      if (!s || !Array.isArray(s.slides) || !s.slides.length) return;
      var base = defaults();
      state.slides = s.slides.slice(0, MAX_SLIDES).map(function (sl) {
        var o = {}; T.fields.forEach(function (f) { o[f.key] = sl && sl[f.key] != null ? String(sl[f.key]) : base[f.key]; }); return o;
      });
      state.active = Math.min(Math.max(0, s.active | 0), state.slides.length - 1);
      if (G.palettes[s.palette]) state.palette = s.palette;
      if (G.fonts[s.font]) state.font = s.font;
      state.wmOn = s.wmOn !== false;
      if (typeof s.wmText === "string") state.wmText = s.wmText;
      state.pageNum = !!s.pageNum;
      state.zoom = Math.min(2.5, Math.max(1, +s.zoom || 1));
    } catch (e) {}
  }
  function cur() { return state.slides[state.active]; }

  /* ---------- 렌더링 ---------- */
  function spec(i) {
    return {
      design: T.design, variant: T.variant, w: T.w, h: T.h,
      palette: G.palettes[state.palette], font: G.fonts[state.font],
      text: state.slides[i], photo: photo, photoZoom: state.zoom,
      watermark: state.wmOn ? state.wmText : "",
      page: { index: i, total: state.slides.length, show: state.pageNum },
      seed: T.slug,
    };
  }
  function draw() { E.render(ctx, spec(state.active)); }
  var raf = 0, fontTimer = 0;
  function schedule() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; draw(); }); }
  function ensureFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var f = G.fonts[state.font], txt = "가나다라마바사0123456789";
    state.slides.forEach(function (s) { for (var k in s) txt += s[k]; });
    txt += state.wmText;
    var specs = [f.weight + " 40px " + f.family, (f.boldWeight || 700) + " 40px " + f.family,
      '400 30px "Noto Sans KR"', '500 30px "Noto Sans KR"', '700 30px "Noto Sans KR"', '700 60px "Noto Serif KR"'];
    return Promise.all(specs.map(function (s) { return document.fonts.load(s, txt).catch(function () {}); }));
  }
  function scheduleFonts() { clearTimeout(fontTimer); fontTimer = setTimeout(function () { ensureFonts().then(schedule); }, 180); }
  function changed(skipFonts) { save(); schedule(); if (!skipFonts) scheduleFonts(); }

  /* ---------- 입력 항목 ---------- */
  function buildFields() {
    var box = $("#fieldsBox"); box.innerHTML = "";
    T.fields.forEach(function (f) {
      var wrap = el("div", "fld"), id = "f-" + f.key;
      var lab = el("label", null, f.label); lab.htmlFor = id; wrap.appendChild(lab);
      var inp;
      if (f.type === "textarea") { inp = el("textarea"); inp.rows = f.rows || 3; }
      else {
        inp = el("input"); inp.type = f.type === "number" ? "number" : "text";
        if (f.type === "number") inp.inputMode = "numeric";
        if (f.min != null) inp.min = f.min;
        if (f.max != null) inp.max = f.max;
        if (f.maxlength) inp.maxLength = f.maxlength;
      }
      inp.id = id; inp.value = cur()[f.key];
      if (f.placeholder) inp.placeholder = f.placeholder;
      inp.addEventListener("input", function () { cur()[f.key] = inp.value; changed(); });
      wrap.appendChild(inp);
      if (f.hint) wrap.appendChild(el("div", "hint", f.hint));
      box.appendChild(wrap);
    });
  }
  function syncFields() {
    T.fields.forEach(function (f) { var i = document.getElementById("f-" + f.key); if (i) i.value = cur()[f.key]; });
  }

  /* ---------- 스타일 (팔레트 / 글꼴 / 워터마크) ---------- */
  function buildStyle() {
    var pb = $("#paletteBox"); pb.innerHTML = "";
    G.paletteOrder.forEach(function (id) {
      var p = G.palettes[id], b = el("button", "swatch"); b.type = "button"; b.dataset.id = id;
      b.title = p.label; b.setAttribute("aria-label", p.label + " 색상");
      b.style.background = "linear-gradient(135deg," + p.bg + " 50%," + p.accent + " 50%)";
      b.addEventListener("click", function () { state.palette = id; markPalette(); changed(true); });
      pb.appendChild(b);
    });
    markPalette();
    var fs = $("#fontSel"); fs.innerHTML = "";
    G.fontOrder.forEach(function (id) { var o = el("option", null, G.fonts[id].label); o.value = id; fs.appendChild(o); });
    fs.value = state.font;
    fs.addEventListener("change", function () { state.font = fs.value; changed(); });
    var wm = $("#wmOn"), wt = $("#wmText"), pn = $("#pageNum");
    wm.checked = state.wmOn; wt.value = state.wmText; pn.checked = state.pageNum;
    wm.addEventListener("change", function () { state.wmOn = wm.checked; changed(true); });
    wt.addEventListener("input", function () { state.wmText = wt.value; changed(); });
    pn.addEventListener("change", function () { state.pageNum = pn.checked; changed(true); });
  }
  function markPalette() {
    var all = root.querySelectorAll(".swatch");
    for (var i = 0; i < all.length; i++) all[i].classList.toggle("on", all[i].dataset.id === state.palette);
    var nm = $("#paletteName"); if (nm) nm.textContent = G.palettes[state.palette].label;
  }

  /* ---------- 사진 ---------- */
  function setupPhoto() {
    var input = $("#photoInput"); if (!input) return;
    var thumb = $("#photoThumb"), rm = $("#photoRemove"), zoom = $("#photoZoom"), ctl = $("#photoCtl");
    zoom.value = state.zoom;
    input.addEventListener("change", function () {
      var f = input.files && input.files[0]; if (!f) return;
      if (!/^image\//.test(f.type)) { say("이미지 파일만 올릴 수 있어요."); return; }
      var url = URL.createObjectURL(f), img = new Image();
      img.onload = function () {
        var max = 1800, s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        photo = c;
        if (photoUrl) URL.revokeObjectURL(photoUrl);
        photoUrl = url; thumb.src = url; ctl.hidden = false; say("");
        schedule();
      };
      img.onerror = function () { URL.revokeObjectURL(url); say("이미지를 불러오지 못했어요. 다른 파일로 시도해 주세요."); };
      img.src = url;
    });
    rm.addEventListener("click", function () {
      photo = null; input.value = ""; ctl.hidden = true;
      if (photoUrl) { URL.revokeObjectURL(photoUrl); photoUrl = null; }
      schedule();
    });
    zoom.addEventListener("input", function () { state.zoom = +zoom.value; save(); schedule(); });
  }

  /* ---------- 여러 장 세트 ---------- */
  function renderTabs() {
    var box = $("#slideTabs"); box.innerHTML = "";
    state.slides.forEach(function (s, i) {
      var b = el("button", "slide-tab" + (i === state.active ? " on" : ""), String(i + 1)); b.type = "button";
      b.setAttribute("aria-label", (i + 1) + "번째 장");
      b.addEventListener("click", function () { state.active = i; syncFields(); renderTabs(); changed(true); });
      box.appendChild(b);
    });
    if (state.slides.length < MAX_SLIDES) {
      var add = el("button", "slide-tab add", "+"); add.type = "button"; add.setAttribute("aria-label", "장 추가 (현재 장 복제)");
      add.addEventListener("click", addSlide); box.appendChild(add);
    }
    var many = state.slides.length > 1;
    $("#btnZip").hidden = !many; $("#btnDel").hidden = !many;
    $("#setInfo").textContent = state.slides.length + "장 / 최대 " + MAX_SLIDES + "장";
  }
  function addSlide() {
    if (state.slides.length >= MAX_SLIDES) return;
    var copy = JSON.parse(JSON.stringify(cur()));
    state.slides.splice(state.active + 1, 0, copy); state.active++;
    syncFields(); renderTabs(); changed(true);
  }
  function delSlide() {
    if (state.slides.length < 2) return;
    state.slides.splice(state.active, 1); state.active = Math.min(state.active, state.slides.length - 1);
    syncFields(); renderTabs(); changed(true);
  }

  /* ---------- 다운로드 ---------- */
  function renderTo(i) {
    var c = document.createElement("canvas"); c.width = T.w; c.height = T.h;
    E.render(c.getContext("2d"), spec(i)); return c;
  }
  function toBlob(c) { return new Promise(function (res) { c.toBlob(res, "image/png"); }); }
  function saveBlob(blob, name) {
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
  }
  function say(msg) { var m = $("#studioMsg"); if (m) m.textContent = msg || ""; }
  function downloadOne() {
    say("이미지를 만드는 중…");
    ensureFonts().then(function () { return toBlob(renderTo(state.active)); }).then(function (b) {
      saveBlob(b, T.slug + "-" + (state.active + 1) + ".png"); say("다운로드했어요.");
    }).catch(function () { say("이미지를 만들지 못했어요. 다시 시도해 주세요."); });
  }
  function downloadZip() {
    say("전체 " + state.slides.length + "장을 만드는 중…");
    ensureFonts().then(function () {
      var files = [], chain = Promise.resolve();
      state.slides.forEach(function (s, i) {
        chain = chain.then(function () { return toBlob(renderTo(i)); }).then(function (b) { return b.arrayBuffer(); }).then(function (buf) {
          files.push({ name: T.slug + "-" + (i + 1) + ".png", data: new Uint8Array(buf) });
        });
      });
      return chain.then(function () { return files; });
    }).then(function (files) { saveBlob(Z.make(files), T.slug + ".zip"); say("ZIP으로 저장했어요."); })
      .catch(function () { say("ZIP을 만들지 못했어요. 장 수를 줄여 다시 시도해 주세요."); });
  }
  function resetAll() {
    if (!confirm("지금까지 입력한 내용을 모두 지우고 처음 상태로 되돌릴까요?")) return;
    try { localStorage.removeItem(KEY); } catch (e) {}
    state.slides = [defaults()]; state.active = 0; state.palette = T.palette; state.font = T.font;
    state.wmOn = true; state.wmText = defaultWm(); state.pageNum = false; state.zoom = 1;
    var rm = $("#photoRemove"); if (rm) rm.click();
    buildFields(); buildStyle(); renderTabs(); schedule(); scheduleFonts(); say("처음 상태로 되돌렸어요.");
  }

  /* ---------- 패널 탭 ---------- */
  function setupPanels() {
    var tabs = root.querySelectorAll(".panel-tab"), panels = root.querySelectorAll(".panel");
    for (var i = 0; i < tabs.length; i++) (function (t) {
      t.addEventListener("click", function () {
        for (var j = 0; j < tabs.length; j++) tabs[j].classList.toggle("on", tabs[j] === t);
        for (var k = 0; k < panels.length; k++) panels[k].hidden = panels[k].dataset.panel !== t.dataset.tab;
      });
    })(tabs[i]);
  }

  /* ---------- 시작 ---------- */
  load();
  buildFields(); buildStyle(); setupPhoto(); renderTabs(); setupPanels();
  $("#btnDownload").addEventListener("click", downloadOne);
  $("#btnZip").addEventListener("click", downloadZip);
  $("#btnDel").addEventListener("click", delSlide);
  $("#btnDup").addEventListener("click", addSlide);
  $("#btnReset").addEventListener("click", resetAll);
  draw();
  ensureFonts().then(schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
})();
