/**
 * Blood intro: a sheet of blood floods down the viewport behind a run of
 * drip fingers, the title stamps on, then the whole mass drops away and
 * reveals the page. Runs once per session, under 1.5s, skippable.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var overlay = document.getElementById("intro");

  if (!overlay) return;

  function teardown() {
    root.className = root.className.replace(/\bintro-armed\b/, "");
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  // Not armed: repeat visit, reduced motion, or the head failsafe already fired.
  if (root.className.indexOf("intro-armed") === -1) {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    return;
  }

  var canvas = document.getElementById("intro-canvas");
  var title = document.getElementById("intro-title");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  if (!ctx) {
    teardown();
    return;
  }

  // Timeline in milliseconds. Everything is done by END.
  var FLOOD_IN = 100;
  var FLOOD_OUT = 760;
  var TITLE_IN = 610;
  var TITLE_FULL = 870;
  var DRAIN_IN = 980;
  var DRAIN_OUT = 1420;
  var END = 1440;

  var W = 0;
  var H = 0;
  var fingers = [];
  var leaders = [];
  var trailers = [];
  var wave = { a1: 0, a2: 0, k1: 0, k2: 0, p1: 0, p2: 0 };

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function clamp01(t) {
    return t < 0 ? 0 : t > 1 ? 1 : t;
  }

  function span(t, a, b) {
    return clamp01((t - a) / (b - a));
  }

  function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  function easeInCubic(t) {
    return t * t * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function build() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Low-frequency roll along the leading edge so it never reads as a ruled line.
    wave = {
      a1: H * 0.016,
      a2: H * 0.008,
      k1: rand(0.005, 0.009),
      k2: rand(0.017, 0.026),
      p1: rand(0, Math.PI * 2),
      p2: rand(0, Math.PI * 2)
    };

    // Drip fingers hanging off the leading edge. Squaring the roll keeps most
    // of them stubby and lets a handful run long, which is what sells it.
    var count = Math.max(11, Math.min(30, Math.round(W / 62)));
    var slot = W / count;

    fingers = [];
    for (var i = 0; i < count; i++) {
      var roll = Math.random();
      var hero = roll > 0.82;

      fingers.push({
        x: slot * (i + 0.5) + rand(-slot * 0.42, slot * 0.42),
        w: hero ? rand(slot * 0.22, slot * 0.36) : rand(slot * 0.24, slot * 0.5),
        len: H * (hero ? rand(0.3, 0.5) : 0.04 + Math.pow(roll, 1.9) * 0.26),
        lag: rand(0, 0.36)
      });
    }

    // Droplets that outrun the sheet on the way down.
    leaders = [];
    for (var j = 0; j < 8; j++) {
      leaders.push({
        x: rand(W * 0.05, W * 0.95),
        r: rand(3.5, 9),
        delay: rand(0, 90),
        v: rand(1.1, 2)
      });
    }

    // Droplets left hanging behind as the sheet drops away.
    trailers = [];
    for (var k = 0; k < 11; k++) {
      trailers.push({
        x: rand(W * 0.03, W * 0.97),
        w: rand(7, 20),
        drag: rand(0.34, 0.76)
      });
    }
  }

  function bloodGradient(topY, baseY) {
    var g = ctx.createLinearGradient(0, topY - H * 0.3, 0, baseY + 70);
    g.addColorStop(0, "#080000");
    g.addColorStop(0.42, "#2b0501");
    g.addColorStop(0.78, "#560b04");
    g.addColorStop(1, "#7a1105");
    return g;
  }

  function edgeY(x, baseY) {
    return (
      baseY +
      wave.a1 * Math.sin(x * wave.k1 + wave.p1) +
      wave.a2 * Math.sin(x * wave.k2 + wave.p2)
    );
  }

  function topEdgeY(x, topY) {
    return (
      topY +
      wave.a1 * 0.5 * Math.sin(x * wave.k1 + wave.p1 + 2) +
      wave.a2 * 0.5 * Math.sin(x * wave.k2 + wave.p2 + 1.3)
    );
  }

  /** One path: the sheet plus every drip finger, unioned by nonzero winding.
      Every subpath is wound the same way or the overlaps punch holes. */
  function traceMass(topY, baseY, floodP) {
    var h = baseY - topY;

    ctx.beginPath();

    if (h > 0) {
      // Once the mass is falling away its upper edge is on show, so give it the
      // same roll as the leading edge rather than a ruled line.
      if (topY > 0.5) {
        ctx.moveTo(-4, topEdgeY(-4, topY));
        for (var xt = -4; xt <= W + 4; xt += 9) {
          ctx.lineTo(xt, topEdgeY(xt, topY));
        }
        ctx.lineTo(W + 4, topEdgeY(W + 4, topY));
      } else {
        ctx.moveTo(-4, topY);
        ctx.lineTo(W + 4, topY);
      }

      if (floodP > 0 && floodP < 1) {
        for (var x = W + 4; x >= -4; x -= 9) {
          ctx.lineTo(x, edgeY(x, baseY));
        }
      } else {
        ctx.lineTo(W + 4, baseY);
        ctx.lineTo(-4, baseY);
      }

      ctx.closePath();
    }

    if (floodP <= 0 || floodP >= 1) return;

    for (var i = 0; i < fingers.length; i++) {
      var f = fingers[i];
      var local = clamp01((floodP - f.lag) / (1 - f.lag));
      var len = f.len * Math.sin(Math.PI * local);

      if (len < 2) continue;

      var top = edgeY(f.x, baseY) - 8;
      var bot = top + len;
      var wt = f.w / 2;
      var wb = Math.max(3, f.w * 0.4);

      ctx.moveTo(f.x - wt, top);
      ctx.lineTo(f.x + wt, top);
      ctx.quadraticCurveTo(f.x + wt, top + len * 0.62, f.x + wb, bot);
      ctx.lineTo(f.x - wb, bot);
      ctx.quadraticCurveTo(f.x - wt, top + len * 0.62, f.x - wt, top);
      ctx.closePath();

      // Bead at the tip, a shade wider than the run, so it reads as hanging.
      ctx.moveTo(f.x + wb * 1.16, bot);
      ctx.arc(f.x, bot, wb * 1.16, 0, Math.PI * 2);
    }
  }

  /** Wet highlights: a bright rim on the leading edge and gloss on each tip. */
  function drawSheen(baseY, floodP) {
    if (floodP <= 0 || floodP >= 1) return;

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (var i = 0; i < fingers.length; i++) {
      var f = fingers[i];
      var local = clamp01((floodP - f.lag) / (1 - f.lag));
      var len = f.len * Math.sin(Math.PI * local);

      if (len < 6) continue;

      var bot = edgeY(f.x, baseY) - 8 + len;
      var wb = Math.max(3, f.w * 0.4) * 1.16;
      var gloss = ctx.createRadialGradient(
        f.x - wb * 0.34, bot - wb * 0.4, 0,
        f.x, bot, wb * 1.7
      );

      gloss.addColorStop(0, "rgba(255, 128, 104, 0.3)");
      gloss.addColorStop(1, "rgba(255, 70, 50, 0)");
      ctx.fillStyle = gloss;
      ctx.beginPath();
      ctx.arc(f.x, bot, wb * 1.7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawLeaders(t, baseY) {
    ctx.fillStyle = "#7d1206";

    for (var i = 0; i < leaders.length; i++) {
      var d = leaders[i];
      var dt = t - d.delay;

      if (dt <= 0) continue;

      var y = -20 + d.v * dt * 0.55 + 0.0042 * dt * dt;

      // Swallowed once the sheet catches up, and gone once off-screen.
      if (y > H + 40 || y < baseY) continue;

      var stretch = 1 + Math.min(2.4, dt / 260);

      ctx.beginPath();
      ctx.ellipse(d.x, y, d.r, d.r * stretch, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawTrailers(off) {
    if (off <= 0) return;

    ctx.fillStyle = "#5d0d04";

    for (var i = 0; i < trailers.length; i++) {
      var d = trailers[i];
      var y = off * d.drag;

      if (y > H + 30) continue;

      ctx.beginPath();
      ctx.ellipse(d.x, y, d.w * 0.5, d.w * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  var start = 0;
  var skipped = false;
  var opened = false;

  function frame(now) {
    if (!start) start = now;

    var t = skipped ? END : now - start;

    if (t >= END) {
      teardown();
      return;
    }

    ctx.clearRect(0, 0, W, H);

    // The blood covers the viewport by the time it starts falling away, so the
    // black backdrop can go now and let the page show through behind it.
    if (!opened && t >= DRAIN_IN) {
      overlay.style.background = "transparent";
      opened = true;
    }

    var floodP = easeOutQuad(span(t, FLOOD_IN, FLOOD_OUT));
    var rawFlood = span(t, FLOOD_IN, FLOOD_OUT);
    var drainP = easeInCubic(span(t, DRAIN_IN, DRAIN_OUT));
    var off = drainP * (H + 80);
    var baseY = floodP * H * 1.06 + off;

    drawLeaders(t, baseY);
    drawTrailers(off);

    traceMass(off, baseY, rawFlood);
    ctx.fillStyle = bloodGradient(off, baseY);
    ctx.fill();

    drawSheen(baseY, rawFlood);

    // Title rides the blood down as it falls away.
    var titleIn = easeOutCubic(span(t, TITLE_IN, TITLE_FULL));
    var titleOut = span(t, DRAIN_IN, DRAIN_IN + 200);

    title.style.opacity = String(titleIn * (1 - titleOut));
    title.style.transform =
      "translate3d(0," + (off + (1 - titleIn) * 26) + "px,0) scale(" +
      (1.14 - titleIn * 0.14) + ")";

    requestAnimationFrame(frame);
  }

  function skip() {
    skipped = true;
  }

  build();
  window.addEventListener("resize", build);
  window.addEventListener("pointerdown", skip, { once: true });
  window.addEventListener("keydown", skip, { once: true });
  requestAnimationFrame(frame);
})();
