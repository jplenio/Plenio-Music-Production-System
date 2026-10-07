function As(_) {
  return _ && _.__esModule && Object.prototype.hasOwnProperty.call(_, "default") ? _.default : _;
}
var je, ra;
function Ms() {
  if (ra) return je;
  ra = 1;
  var _ = "6.7.1";
  return je = _, je;
}
var $e, aa;
function Rr() {
  if (aa) return $e;
  aa = 1;
  var _ = function(g, l) {
    var r = this;
    l || (l = {}), r.qpm = l.qpm ? parseInt(l.qpm, 10) : null, r.extraMeasuresAtBeginning = l.extraMeasuresAtBeginning ? parseInt(l.extraMeasuresAtBeginning, 10) : 0, r.beatCallback = l.beatCallback, r.eventCallback = l.eventCallback, r.lineEndCallback = l.lineEndCallback, r.lineEndAnticipation = l.lineEndAnticipation ? parseInt(l.lineEndAnticipation, 10) : 0, r.beatSubdivisions = l.beatSubdivisions ? parseInt(l.beatSubdivisions, 10) : 1, r.beatSubdivisions || (r.beatSubdivisions = 1), r.joggerTimer = null, r.replaceTarget = function(a) {
      if (!l.qpm) {
        var s = a.metaText ? a.metaText.tempo : null;
        r.qpm = a.getBpm(s);
      }
      if (r.noteTimings = a.setTiming(r.qpm, r.extraMeasuresAtBeginning), a.noteTimings.length === 0 && (r.noteTimings = a.setTiming(0, 0)), r.lineEndCallback && (r.lineEndTimings = m(a.noteTimings, r.lineEndAnticipation)), r.startTime = null, r.currentBeat = 0, r.currentEvent = 0, r.currentLine = 0, r.currentTime = 0, r.isPaused = !1, r.isRunning = !1, r.pausedPercent = null, r.justUnpaused = !1, r.newSeekPercent = 0, r.lastTimestamp = 0, r.noteTimings.length !== 0) {
        r.millisecondsPerBeat = 1e3 / (r.qpm / 60) / r.beatSubdivisions, r.lastMoment = r.noteTimings[r.noteTimings.length - 1].milliseconds;
        var p = a.getMeter(), u = "";
        if (p && p.type === "specified" && p.value && p.value.length > 0 && p.value[0].num.indexOf("+") > 0 && (u = p.value[0].num), r.beatStarts = [], u) {
          for (var d = r.noteTimings[r.noteTimings.length - 1].millisecondsPerMeasure, f = r.lastMoment / d, i = u.split("+"), n = 0; n < i.length; n++)
            i[n] = parseInt(i[n], 10) / 2;
          for (var t = 0, e = 0, c = 0; c < f; c++)
            for (var v = c * d, h = 0, y = 0; y < i.length; y++) {
              var w = i[y];
              if (r.beatSubdivisions === 1)
                r.beatSubdivisions === 1 && t < r.lastMoment && r.beatStarts.push({ b: e, ts: t }), t += w * r.millisecondsPerBeat;
              else
                for (var A = w * r.beatSubdivisions, P = 0; P < Math.floor(A); P++) {
                  var N = P / A, T = Math.round(v + h * r.millisecondsPerBeat);
                  T < r.lastMoment && r.beatStarts.push({ b: e + N, ts: T }), h++;
                }
              e++;
            }
          r.beatStarts.push({ b: f * i.length, ts: r.lastMoment }), r.totalBeats = r.beatStarts.length;
        } else {
          r.totalBeats = Math.round(r.lastMoment / r.millisecondsPerBeat);
          for (var q = 0; q < r.totalBeats + 1; q++)
            r.beatStarts.push({ b: q / r.beatSubdivisions, ts: Math.round(q * r.millisecondsPerBeat) });
        }
      }
    }, r.replaceTarget(g), r.doTiming = function(a) {
      if (r.lastTimestamp !== a && (r.lastTimestamp = a, !r.isPaused && r.isRunning)) {
        for (r.startTime || (r.startTime = a), r.currentTime = a - r.startTime, r.currentTime += 16; r.noteTimings.length > r.currentEvent && r.noteTimings[r.currentEvent].milliseconds < r.currentTime; ) {
          if (r.eventCallback && r.noteTimings[r.currentEvent].type === "event") {
            var s = r.startTime;
            r.eventCallback(r.noteTimings[r.currentEvent]), s !== r.startTime && (r.currentTime = a - r.startTime);
          }
          r.currentEvent++;
        }
        if (r.lineEndCallback && r.lineEndTimings.length > r.currentLine && r.lineEndTimings[r.currentLine].milliseconds < r.currentTime && r.currentEvent < r.noteTimings.length) {
          var p = r.noteTimings[r.currentEvent].milliseconds === r.currentTime ? r.noteTimings[r.currentEvent] : r.noteTimings[r.currentEvent - 1];
          r.lineEndCallback(r.lineEndTimings[r.currentLine], p, { line: r.currentLine, endTimings: r.lineEndTimings, currentTime: r.currentTime }), r.currentLine++;
        }
        if (r.currentTime < r.lastMoment) {
          if (requestAnimationFrame(r.doTiming), r.currentBeat < r.beatStarts.length && r.beatStarts[r.currentBeat].ts <= r.currentTime) {
            var u = r.doBeatCallback(a);
            r.currentBeat++, u !== null && (r.currentTime = u);
          }
        } else if (r.currentBeat <= r.totalBeats && r.beatCallback) {
          var d = r.doBeatCallback(a);
          r.currentBeat++, d !== null && (r.currentTime = d), requestAnimationFrame(r.doTiming);
        }
        if (r.currentTime >= r.lastMoment)
          if (r.eventCallback) {
            var f = r.eventCallback(null);
            r.shouldStop(f).then(function(i) {
              i && r.stop();
            });
          } else
            r.stop();
      }
    }, r.shouldStop = function(a) {
      return new Promise(function(s) {
        if (!a)
          return s(!0);
        if (a === "continue")
          return s(!1);
        a.then && a.then(function(p) {
          s(p !== "continue");
        });
      });
    }, r.doBeatCallback = function(a) {
      if (r.beatCallback) {
        for (var s = r.currentEvent; s < r.noteTimings.length && r.noteTimings[s].left === null; )
          s++;
        var p, u;
        if (s < r.noteTimings.length) {
          for (p = r.noteTimings[s].milliseconds, s = Math.max(0, r.currentEvent - 1); s >= 0 && r.noteTimings[s].left === null; )
            s--;
          u = r.noteTimings[s];
        }
        var d = {}, f = {};
        if (u) {
          d.top = u.top, d.height = u.height;
          var i = Math.max(0, a - r.startTime - u.milliseconds), n = p - u.milliseconds, t = u.endX - u.left, e = n ? i * t / n : 0;
          d.left = u.left + e, r.currentEvent === 0 && u.milliseconds > a - r.startTime && (d.left = void 0), f = {
            timestamp: a,
            startTime: r.startTime,
            ev: u,
            endMs: p,
            offMs: i,
            offPx: e,
            gapMs: n,
            gapPx: t
          };
        } else
          f = {
            timestamp: a,
            startTime: r.startTime
          };
        if (r.currentBeat < 0 || r.currentBeat >= r.beatStarts.length || !r.beatStarts[r.currentBeat]) {
          var c = {
            currentBeat: r.currentBeat,
            beatStartLength: r.beatStarts.length,
            totalBeats: r.totalBeats,
            startTime: r.startTime,
            currentTime: r.currentTime,
            lastMoment: r.lastMoment,
            lastTimestamp: r.lastTimestamp,
            qpm: r.qpm,
            millisecondsPerBeat: r.millisecondsPerBeat,
            beatSubdivisions: r.beatSubdivisions,
            currentEvent: r.currentEvent,
            currentLine: r.currentLine,
            isPaused: r.isPaused,
            isRunning: r.isRunning,
            pausedPercent: r.pausedPercent,
            justUnpaused: r.justUnpaused,
            newSeekPercent: r.newSeekPercent
          };
          setTimeout(function() {
            throw new Error("abcjs-timing-callback error: " + JSON.stringify(c));
          }, 1);
        } else {
          var v = r.startTime;
          if (r.beatCallback(
            r.beatStarts[r.currentBeat].b,
            r.totalBeats / r.beatSubdivisions,
            r.lastMoment,
            d,
            f
          ), v !== r.startTime)
            return a - r.startTime;
        }
      }
      return null;
    };
    var o = 60;
    r.animationJogger = function() {
      r.isRunning && (r.doTiming(performance.now()), r.joggerTimer = setTimeout(r.animationJogger, o));
    }, r.start = function(a, s) {
      if (r.isRunning = !0, r.isPaused && (r.isPaused = !1, a === void 0 && (r.justUnpaused = !0)), a)
        r.setProgress(a, s);
      else if (a === 0)
        r.reset();
      else if (r.pausedPercent !== null) {
        var p = performance.now();
        r.currentTime = r.lastMoment * r.pausedPercent, r.startTime = p - r.currentTime, r.pausedPercent = null, r.reportNext = !0;
      }
      requestAnimationFrame(r.doTiming), r.joggerTimer = setTimeout(r.animationJogger, o);
    }, r.pause = function() {
      r.isPaused = !0;
      var a = performance.now();
      r.pausedPercent = (a - r.startTime) / r.lastMoment, r.isRunning = !1, r.joggerTimer && (clearTimeout(r.joggerTimer), r.joggerTimer = null);
    }, r.currentMillisecond = function() {
      return r.currentTime;
    }, r.reset = function() {
      r.currentBeat = 0, r.currentEvent = 0, r.currentLine = 0, r.startTime = null, r.pausedPercent = null;
    }, r.stop = function() {
      r.pause(), r.reset();
    }, r.setProgress = function(a, s) {
      var p;
      switch (s) {
        case "seconds":
          r.currentTime = a * 1e3, r.currentTime < 0 && (r.currentTime = 0), r.currentTime > r.lastMoment && (r.currentTime = r.lastMoment), p = r.currentTime / r.lastMoment;
          break;
        case "beats":
          r.currentTime = a * r.millisecondsPerBeat * r.beatSubdivisions, r.currentTime < 0 && (r.currentTime = 0), r.currentTime > r.lastMoment && (r.currentTime = r.lastMoment), p = r.currentTime / r.lastMoment;
          break;
        default:
          p = a, p < 0 && (p = 0), p > 1 && (p = 1), r.currentTime = r.lastMoment * p;
          break;
      }
      r.isRunning || (r.pausedPercent = p);
      var u = performance.now();
      for (r.startTime = u - r.currentTime, r.currentEvent = 0; r.noteTimings.length > r.currentEvent && r.noteTimings[r.currentEvent].milliseconds < r.currentTime; )
        r.currentEvent++;
      if (r.lineEndCallback)
        for (r.currentLine = 0; r.lineEndTimings.length > r.currentLine && r.lineEndTimings[r.currentLine].milliseconds + r.lineEndAnticipation < r.currentTime; )
          r.currentLine++;
      var d = r.currentBeat;
      for (r.currentBeat = 0; r.currentBeat < r.beatStarts.length && !(r.beatStarts[r.currentBeat].ts > r.currentTime); r.currentBeat++)
        ;
      r.currentBeat--, r.beatCallback && d !== r.currentBeat && (r.doBeatCallback(r.startTime + r.currentTime), r.currentBeat++), r.eventCallback && r.currentEvent >= 0 && r.noteTimings[r.currentEvent].type === "event" && r.eventCallback(r.noteTimings[r.currentEvent]), r.lineEndCallback && r.lineEndCallback(r.lineEndTimings[r.currentLine], r.noteTimings[r.currentEvent], { line: r.currentLine, endTimings: r.lineEndTimings }), r.joggerTimer = setTimeout(r.animationJogger, o);
    };
  };
  function m(g, l) {
    for (var r = [], o = null, a = 0; a < g.length; a++) {
      var s = g[a];
      s.type !== "end" && s.top !== o && (r.push({ measureNumber: s.measureNumber, milliseconds: s.milliseconds - l, top: s.top, bottom: s.top + s.height }), o = s.top);
    }
    return r;
  }
  return $e = _, $e;
}
var Ve, na;
function Bs() {
  if (na) return Ve;
  na = 1;
  var _ = Rr(), m = {};
  return (function() {
    var g, l;
    m.startAnimation = function(r, o, a) {
      g && (g.stop(), g = void 0), a.showCursor && (l = r.querySelector(".abcjs-cursor"), l || (l = document.createElement("DIV"), l.className = "abcjs-cursor cursor", l.style.position = "absolute", r.appendChild(l), r.style.position = "relative"));
      function s(t) {
        for (var e = 0; e < t.length; e++) {
          var c = t[e];
          c.classList.contains("abcjs-bar") || (c.style.display = "none");
        }
      }
      var p;
      function u(t) {
        if (p) {
          var e = r.querySelectorAll(p);
          s(e);
        }
        p = t;
      }
      function d(t) {
        var e = r.querySelectorAll(t);
        s(e);
      }
      function f(t) {
        a.hideCurrentMeasure ? d(t) : a.hideFinishedMeasures && u(t);
      }
      function i(t) {
        return ".abcjs-l" + t.line + ".abcjs-m" + t.measureNumber;
      }
      function n(t) {
        if (t) {
          if (t.measureStart) {
            var e = i(t);
            e && f(e);
          }
          l && (l.style.left = t.left + "px", l.style.top = t.top + "px", l.style.width = t.width + "px", l.style.height = t.height + "px");
        } else
          g.stop(), g = void 0;
      }
      g = new _(o, {
        qpm: a.bpm,
        eventCallback: n
      }), g.start();
    }, m.pauseAnimation = function(r) {
      g && (r ? g.pause() : g.start());
    }, m.stopAnimation = function() {
      g && (g.stop(), g = void 0);
    };
  })(), Ve = m, Ve;
}
var Ke, ia;
function _e() {
  if (ia) return Ke;
  ia = 1;
  var _ = {};
  return _.cloneArray = function(m) {
    for (var g = [], l = 0; l < m.length; l++)
      g.push(Object.assign({}, m[l]));
    return g;
  }, _.cloneHashOfHash = function(m) {
    var g = {};
    for (var l in m)
      m.hasOwnProperty(l) && (g[l] = Object.assign({}, m[l]));
    return g;
  }, _.cloneHashOfArrayOfHash = function(m) {
    var g = {};
    for (var l in m)
      m.hasOwnProperty(l) && (g[l] = _.cloneArray(m[l]));
    return g;
  }, _.strip = function(m) {
    return m.replace(/^\s+/, "").replace(/\s+$/, "");
  }, _.startsWith = function(m, g) {
    return m.indexOf(g) === 0;
  }, _.endsWith = function(m, g) {
    var l = m.length - g.length;
    return l >= 0 && m.lastIndexOf(g) === l;
  }, _.last = function(m) {
    return m.length === 0 ? null : m[m.length - 1];
  }, Ke = _, Ke;
}
var Qe, sa;
function Ir() {
  if (sa) return Qe;
  sa = 1;
  var _ = _e(), m = {};
  return (function() {
    var g, l, r, o, a;
    m.initialize = function(b, x, E, D, O) {
      g = b, l = x, r = E, o = D, a = O, s();
    };
    function s() {
      r.annotationfont = { face: "Helvetica", size: 12, weight: "normal", style: "normal", decoration: "none" }, r.gchordfont = { face: "Helvetica", size: 12, weight: "normal", style: "normal", decoration: "none" }, r.historyfont = { face: '"Times New Roman"', size: 16, weight: "normal", style: "normal", decoration: "none" }, r.infofont = { face: '"Times New Roman"', size: 14, weight: "normal", style: "italic", decoration: "none" }, r.measurefont = { face: '"Times New Roman"', size: 14, weight: "normal", style: "italic", decoration: "none" }, r.partsfont = { face: '"Times New Roman"', size: 15, weight: "normal", style: "normal", decoration: "none" }, r.repeatfont = { face: '"Times New Roman"', size: 13, weight: "normal", style: "normal", decoration: "none" }, r.textfont = { face: '"Times New Roman"', size: 16, weight: "normal", style: "normal", decoration: "none" }, r.tripletfont = { face: "Times", size: 11, weight: "normal", style: "italic", decoration: "none" }, r.vocalfont = { face: '"Times New Roman"', size: 13, weight: "bold", style: "normal", decoration: "none" }, r.wordsfont = { face: '"Times New Roman"', size: 16, weight: "normal", style: "normal", decoration: "none" }, o.formatting.composerfont = { face: '"Times New Roman"', size: 14, weight: "normal", style: "italic", decoration: "none" }, o.formatting.subtitlefont = { face: '"Times New Roman"', size: 16, weight: "normal", style: "normal", decoration: "none" }, o.formatting.tempofont = { face: '"Times New Roman"', size: 15, weight: "bold", style: "normal", decoration: "none" }, o.formatting.titlefont = { face: '"Times New Roman"', size: 20, weight: "normal", style: "normal", decoration: "none" }, o.formatting.footerfont = { face: '"Times New Roman"', size: 12, weight: "normal", style: "normal", decoration: "none" }, o.formatting.headerfont = { face: '"Times New Roman"', size: 12, weight: "normal", style: "normal", decoration: "none" }, o.formatting.voicefont = { face: '"Times New Roman"', size: 13, weight: "bold", style: "normal", decoration: "none" }, o.formatting.tablabelfont = { face: '"Trebuchet MS"', size: 16, weight: "normal", style: "normal", decoration: "none" }, o.formatting.tabnumberfont = { face: '"Arial"', size: 11, weight: "normal", style: "normal", decoration: "none" }, o.formatting.tabgracefont = { face: '"Arial"', size: 8, weight: "normal", style: "normal", decoration: "none" }, o.formatting.annotationfont = r.annotationfont, o.formatting.gchordfont = r.gchordfont, o.formatting.historyfont = r.historyfont, o.formatting.infofont = r.infofont, o.formatting.measurefont = r.measurefont, o.formatting.partsfont = r.partsfont, o.formatting.repeatfont = r.repeatfont, o.formatting.textfont = r.textfont, o.formatting.tripletfont = r.tripletfont, o.formatting.vocalfont = r.vocalfont, o.formatting.wordsfont = r.wordsfont;
    }
    var p = { gchordfont: !0, measurefont: !0, partsfont: !0, annotationfont: !0, composerfont: !0, historyfont: !0, infofont: !0, subtitlefont: !0, textfont: !0, titlefont: !0, voicefont: !0 }, u = function(b) {
      switch (b) {
        case "Arial-Italic":
          return { face: "Arial", weight: "normal", style: "italic", decoration: "none" };
        case "Arial-Bold":
          return { face: "Arial", weight: "bold", style: "normal", decoration: "none" };
        case "Bookman-Demi":
          return { face: "Bookman,serif", weight: "bold", style: "normal", decoration: "none" };
        case "Bookman-DemiItalic":
          return { face: "Bookman,serif", weight: "bold", style: "italic", decoration: "none" };
        case "Bookman-Light":
          return { face: "Bookman,serif", weight: "normal", style: "normal", decoration: "none" };
        case "Bookman-LightItalic":
          return { face: "Bookman,serif", weight: "normal", style: "italic", decoration: "none" };
        case "Courier":
          return { face: '"Courier New"', weight: "normal", style: "normal", decoration: "none" };
        case "Courier-Oblique":
          return { face: '"Courier New"', weight: "normal", style: "italic", decoration: "none" };
        case "Courier-Bold":
          return { face: '"Courier New"', weight: "bold", style: "normal", decoration: "none" };
        case "Courier-BoldOblique":
          return { face: '"Courier New"', weight: "bold", style: "italic", decoration: "none" };
        case "AvantGarde-Book":
          return { face: "AvantGarde,Arial", weight: "normal", style: "normal", decoration: "none" };
        case "AvantGarde-BookOblique":
          return { face: "AvantGarde,Arial", weight: "normal", style: "italic", decoration: "none" };
        case "AvantGarde-Demi":
        case "Avant-Garde-Demi":
          return { face: "AvantGarde,Arial", weight: "bold", style: "normal", decoration: "none" };
        case "AvantGarde-DemiOblique":
          return { face: "AvantGarde,Arial", weight: "bold", style: "italic", decoration: "none" };
        case "Helvetica-Oblique":
          return { face: "Helvetica", weight: "normal", style: "italic", decoration: "none" };
        case "Helvetica-Bold":
          return { face: "Helvetica", weight: "bold", style: "normal", decoration: "none" };
        case "Helvetica-BoldOblique":
          return { face: "Helvetica", weight: "bold", style: "italic", decoration: "none" };
        case "Helvetica-Narrow":
          return { face: '"Helvetica Narrow",Helvetica', weight: "normal", style: "normal", decoration: "none" };
        case "Helvetica-Narrow-Oblique":
          return { face: '"Helvetica Narrow",Helvetica', weight: "normal", style: "italic", decoration: "none" };
        case "Helvetica-Narrow-Bold":
          return { face: '"Helvetica Narrow",Helvetica', weight: "bold", style: "normal", decoration: "none" };
        case "Helvetica-Narrow-BoldOblique":
          return { face: '"Helvetica Narrow",Helvetica', weight: "bold", style: "italic", decoration: "none" };
        case "Palatino-Roman":
          return { face: "Palatino", weight: "normal", style: "normal", decoration: "none" };
        case "Palatino-Italic":
          return { face: "Palatino", weight: "normal", style: "italic", decoration: "none" };
        case "Palatino-Bold":
          return { face: "Palatino", weight: "bold", style: "normal", decoration: "none" };
        case "Palatino-BoldItalic":
          return { face: "Palatino", weight: "bold", style: "italic", decoration: "none" };
        case "NewCenturySchlbk-Roman":
          return { face: '"New Century",serif', weight: "normal", style: "normal", decoration: "none" };
        case "NewCenturySchlbk-Italic":
          return { face: '"New Century",serif', weight: "normal", style: "italic", decoration: "none" };
        case "NewCenturySchlbk-Bold":
          return { face: '"New Century",serif', weight: "bold", style: "normal", decoration: "none" };
        case "NewCenturySchlbk-BoldItalic":
          return { face: '"New Century",serif', weight: "bold", style: "italic", decoration: "none" };
        case "Times":
        case "Times-Roman":
        case "Times-Narrow":
        case "Times-Courier":
        case "Times-New-Roman":
          return { face: '"Times New Roman"', weight: "normal", style: "normal", decoration: "none" };
        case "Times-Italic":
        case "Times-Italics":
          return { face: '"Times New Roman"', weight: "normal", style: "italic", decoration: "none" };
        case "Times-Bold":
          return { face: '"Times New Roman"', weight: "bold", style: "normal", decoration: "none" };
        case "Times-BoldItalic":
          return { face: '"Times New Roman"', weight: "bold", style: "italic", decoration: "none" };
        case "ZapfChancery-MediumItalic":
          return { face: '"Zapf Chancery",cursive,serif', weight: "normal", style: "normal", decoration: "none" };
        default:
          return null;
      }
    }, d = function(b, x, E, D, O) {
      function z() {
        var ue = parseInt(b[0].token);
        return b.shift(), x ? b.length === 0 ? { face: x.face, weight: x.weight, style: x.style, decoration: x.decoration, size: ue } : b.length === 1 && b[0].token === "box" && p[O] ? { face: x.face, weight: x.weight, style: x.style, decoration: x.decoration, size: ue, box: !0 } : (l("Extra parameters in font definition.", E, D), { face: x.face, weight: x.weight, style: x.style, decoration: x.decoration, size: ue }) : (l("Can't set just the size of the font since there is no default value.", E, D), { face: '"Times New Roman"', weight: "normal", style: "normal", decoration: "none", size: ue });
      }
      if (b[0].token === "*") {
        if (b.shift(), b[0].type === "number")
          return z();
        l("Expected font size number after *.", E, D);
      }
      if (b[0].type === "number")
        return z();
      for (var H = [], $, Q = "normal", W = "normal", ne = "none", J = !1, te = "face", U = !1; b.length; ) {
        var re = b.shift(), V = re.token.toLowerCase();
        switch (te) {
          case "face":
            U || V !== "utf" && re.type !== "number" && V !== "bold" && V !== "italic" && V !== "underline" && V !== "box" ? H.length > 0 && re.token === "-" ? (U = !0, H[H.length - 1] = H[H.length - 1] + re.token) : U ? (U = !1, H[H.length - 1] = H[H.length - 1] + re.token) : H.push(re.token) : re.type === "number" ? ($ ? l("Font size specified twice in font definition.", E, D) : $ = re.token, te = "modifier") : V === "bold" ? Q = "bold" : V === "italic" ? W = "italic" : V === "underline" ? ne = "underline" : V === "box" ? (p[O] ? J = !0 : l(`This font style doesn't support "box"`, E, D), te = "finished") : V === "utf" ? (re = b.shift(), te = "size") : l("Unknown parameter " + re.token + " in font definition.", E, D);
            break;
          case "size":
            re.type === "number" ? $ ? l("Font size specified twice in font definition.", E, D) : $ = re.token : l("Expected font size in font definition.", E, D), te = "modifier";
            break;
          case "modifier":
            V === "bold" ? Q = "bold" : V === "italic" ? W = "italic" : V === "underline" ? ne = "underline" : V === "box" ? (p[O] ? J = !0 : l(`This font style doesn't support "box"`, E, D), te = "finished") : l("Unknown parameter " + re.token + " in font definition.", E, D);
            break;
          case "finished":
            l('Extra characters found after "box" in font definition.', E, D);
            break;
        }
      }
      $ === void 0 ? x ? $ = x.size : (l("Must specify the size of the font since there is no default value.", E, D), $ = 12) : $ = parseFloat($), H = H.join(" "), H === "" && (x ? H = x.face : (l("Must specify the name of the font since there is no default value.", E, D), H = "sans-serif"));
      var oe = u(H), ce = {};
      return oe ? (ce.face = oe.face, ce.weight = oe.weight, ce.style = oe.style, ce.decoration = oe.decoration, ce.size = $, J && (ce.box = !0), ce) : (ce.face = H, ce.weight = Q, ce.style = W, ce.decoration = ne, ce.size = $, J && (ce.box = !0), ce);
    }, f = function(b, x, E) {
      return x.length === 0 ? 'Directive "' + b + '" requires a font as a parameter.' : (r[b] = d(x, r[b], E, 0, b), r.is_in_header && (o.formatting[b] = r[b]), null);
    }, i = function(b, x, E) {
      return x.length === 0 ? 'Directive "' + b + '" requires a font as a parameter.' : (o.formatting[b] = d(x, o.formatting[b], E, 0, b), null);
    }, n = function(b, x) {
      var E = "";
      x.forEach(function(O) {
        E += O.token;
      });
      var D = parseFloat(E);
      if (isNaN(D) || D === 0)
        return 'Directive "' + b + '" requires a number as a parameter.';
      o.formatting.scale = D;
    }, t = [
      "acoustic-bass-drum",
      "bass-drum-1",
      "side-stick",
      "acoustic-snare",
      "hand-clap",
      "electric-snare",
      "low-floor-tom",
      "closed-hi-hat",
      "high-floor-tom",
      "pedal-hi-hat",
      "low-tom",
      "open-hi-hat",
      "low-mid-tom",
      "hi-mid-tom",
      "crash-cymbal-1",
      "high-tom",
      "ride-cymbal-1",
      "chinese-cymbal",
      "ride-bell",
      "tambourine",
      "splash-cymbal",
      "cowbell",
      "crash-cymbal-2",
      "vibraslap",
      "ride-cymbal-2",
      "hi-bongo",
      "low-bongo",
      "mute-hi-conga",
      "open-hi-conga",
      "low-conga",
      "high-timbale",
      "low-timbale",
      "high-agogo",
      "low-agogo",
      "cabasa",
      "maracas",
      "short-whistle",
      "long-whistle",
      "short-guiro",
      "long-guiro",
      "claves",
      "hi-wood-block",
      "low-wood-block",
      "mute-cuica",
      "open-cuica",
      "mute-triangle",
      "open-triangle"
    ], e = function(b) {
      var x = b.split(/\s+/);
      if (x.length !== 2 && x.length !== 3)
        return { error: 'Expected parameters "abc-note", "drum-sound", and optionally "note-head"' };
      var E = x[0], D = parseInt(x[1], 10);
      if ((isNaN(D) || D < 35 || D > 81) && x[1] && (D = t.indexOf(x[1].toLowerCase()) + 35), isNaN(D) || D < 35 || D > 81)
        return { error: 'Expected drum name, received "' + x[1] + '"' };
      var O = { sound: D };
      return x.length === 3 && (O.noteHead = x[2]), { key: E, value: O };
    }, c = function(b, x) {
      var E = g.getMeasurement(x);
      return E.used === 0 || x.length !== 0 ? { error: 'Directive "' + b + '" requires a measurement as a parameter.' } : E.value;
    }, v = function(b, x) {
      var E = g.getMeasurement(x);
      return E.used === 0 || x.length !== 0 ? 'Directive "' + b + '" requires a measurement as a parameter.' : (o.formatting[b] = E.value, null);
    }, h = function(b, x, E, D, O) {
      if (E.length !== 1 || E[0].type !== "number")
        return 'Directive "' + x + '" requires a number as a parameter.';
      var z = E[0].intt;
      return D !== void 0 && z < D ? 'Directive "' + x + '" requires a number greater than or equal to ' + D + " as a parameter." : O !== void 0 && z > O ? 'Directive "' + x + '" requires a number less than or equal to ' + O + " as a parameter." : (r[b] = z, null);
    }, y = function(b, x, E) {
      if (E.length === 1 && (E[0].token === "true" || E[0].token === "false"))
        return r[b] = E[0].token === "true", null;
      var D = h(b, x, E, 0, 1);
      return D !== null ? D : (r[b] = r[b] === 1, null);
    }, w = function(b, x, E, D) {
      if (E.length !== 1)
        return 'Directive "' + x + '" requires one of [ ' + D.join(", ") + " ] as a parameter.";
      for (var O = E[0].token, z = !1, H = 0; !z && H < D.length; H++)
        D[H] === O && (z = !0);
      return z ? (r[b] = O, null) : 'Directive "' + x + '" requires one of [ ' + D.join(", ") + " ] as a parameter.";
    }, A = [
      "nobarlines",
      "barlines",
      "beataccents",
      "nobeataccents",
      "droneon",
      "droneoff",
      "drumon",
      "drumoff",
      "fermatafixed",
      "fermataproportional",
      "gchordon",
      "gchordoff",
      "controlcombo",
      "temperamentnormal",
      "noportamento"
    ], P = [
      "gchord",
      "ptstress",
      "beatstring"
    ], N = [
      "bassvol",
      "chordvol",
      "c",
      "channel",
      "beatmod",
      "deltaloudness",
      "drumbars",
      "gracedivider",
      "makechordchannels",
      "randomchordattack",
      "chordattack",
      "stressmodel",
      "transpose",
      "rtranspose",
      "vol",
      "volinc",
      "gchordbars"
    ], T = [
      "program"
    ], q = [
      "ratio",
      "snt",
      "bendvelocity",
      "pitchbend",
      "control",
      "temperamentlinear"
    ], I = [
      "beat"
    ], C = [
      "drone"
    ], B = [
      "portamento"
    ], R = [
      "expand",
      "grace",
      "trim"
    ], S = [
      "drum",
      "chordname"
    ], k = [
      "bassprog",
      "chordprog"
    ], M = function(b, x, E) {
      var D = b.shift().token, O = [];
      if (A.indexOf(D) >= 0)
        b.length !== 0 && l("Unexpected parameter in MIDI " + D, E, 0);
      else if (P.indexOf(D) >= 0)
        b.length !== 1 ? l("Expected one parameter in MIDI " + D, E, 0) : O.push(b[0].token);
      else if (N.indexOf(D) >= 0)
        b.length !== 1 ? l("Expected one parameter in MIDI " + D, E, 0) : b[0].type !== "number" ? l("Expected one integer parameter in MIDI " + D, E, 0) : O.push(b[0].intt);
      else if (T.indexOf(D) >= 0)
        b.length !== 1 && b.length !== 2 ? l("Expected one or two parameters in MIDI " + D, E, 0) : b[0].type !== "number" || b.length === 2 && b[1].type !== "number" ? l("Expected integer parameter in MIDI " + D, E, 0) : (O.push(b[0].intt), b.length === 2 && O.push(b[1].intt));
      else if (q.indexOf(D) >= 0)
        b.length !== 2 ? l("Expected two parameters in MIDI " + D, E, 0) : b[0].type !== "number" || b[1].type !== "number" ? l("Expected two integer parameters in MIDI " + D, E, 0) : (O.push(b[0].intt), O.push(b[1].intt));
      else if (B.indexOf(D) >= 0)
        b.length !== 2 ? l("Expected two parameters in MIDI " + D, E, 0) : b[0].type !== "alpha" || b[1].type !== "number" ? l("Expected one string and one integer parameters in MIDI " + D, E, 0) : (O.push(b[0].token), O.push(b[1].intt));
      else if (D === "drummap")
        b.length === 2 && b[0].type === "alpha" && b[1].type === "number" ? (x.formatting || (x.formatting = {}), x.formatting.midi || (x.formatting.midi = {}), x.formatting.midi.drummap || (x.formatting.midi.drummap = {}), x.formatting.midi.drummap[b[0].token] = b[1].intt, O = x.formatting.midi.drummap) : b.length === 3 && b[0].type === "punct" && b[1].type === "alpha" && b[2].type === "number" ? (x.formatting || (x.formatting = {}), x.formatting.midi || (x.formatting.midi = {}), x.formatting.midi.drummap || (x.formatting.midi.drummap = {}), x.formatting.midi.drummap[b[0].token + b[1].token] = b[2].intt, O = x.formatting.midi.drummap) : l("Expected one note name and one integer parameter in MIDI " + D, E, 0);
      else if (R.indexOf(D) >= 0)
        b.length !== 3 || b[0].type !== "number" || b[1].token !== "/" || b[2].type !== "number" ? l("Expected fraction parameter in MIDI " + D, E, 0) : (O.push(b[0].intt), O.push(b[2].intt));
      else if (I.indexOf(D) >= 0)
        b.length !== 4 ? l("Expected four parameters in MIDI " + D, E, 0) : b[0].type !== "number" || b[1].type !== "number" || b[2].type !== "number" || b[3].type !== "number" ? l("Expected four integer parameters in MIDI " + D, E, 0) : (O.push(b[0].intt), O.push(b[1].intt), O.push(b[2].intt), O.push(b[3].intt));
      else if (C.indexOf(D) >= 0)
        b.length !== 5 ? l("Expected five parameters in MIDI " + D, E, 0) : b[0].type !== "number" || b[1].type !== "number" || b[2].type !== "number" || b[3].type !== "number" || b[4].type !== "number" ? l("Expected five integer parameters in MIDI " + D, E, 0) : (O.push(b[0].intt), O.push(b[1].intt), O.push(b[2].intt), O.push(b[3].intt), O.push(b[4].intt));
      else if (T.indexOf(D) >= 0)
        b.length !== 1 || b.length !== 4 ? l("Expected one or two parameters in MIDI " + D, E, 0) : b[0].type !== "number" ? l("Expected integer parameter in MIDI " + D, E, 0) : b.length === 4 ? (b[1].token !== "octave" && l("Expected octave parameter in MIDI " + D, E, 0), b[2].token !== "=" && l("Expected octave parameter in MIDI " + D, E, 0), b[3].type !== "number" && l("Expected integer parameter for octave in MIDI " + D, E, 0)) : (O.push(b[0].intt), b.length === 4 && O.push(b[3].intt));
      else if (S.indexOf(D) >= 0)
        if (b.length < 2)
          l("Expected string parameter and at least one integer parameter in MIDI " + D, E, 0);
        else if (b[0].type !== "alpha")
          l("Expected string parameter and at least one integer parameter in MIDI " + D, E, 0);
        else {
          var z = b.shift();
          for (O.push(z.token); b.length > 0; )
            z = b.shift(), z.type !== "number" && l("Expected integer parameter in MIDI " + D, E, 0), O.push(z.intt);
        }
      else if (k.indexOf(D) >= 0) {
        if (b.length !== 1 && b.length !== 2)
          l("Expected one or two parameters in MIDI " + D, E, 0);
        else if (b[0].type !== "number")
          l("Expected integer parameter in MIDI " + D, E, 0);
        else if (b.length === 2 && b[1].type !== "alpha")
          l("Expected alpha parameter in MIDI " + D, E, 0);
        else if (O.push(b[0].intt), b.length === 2) {
          var H = b[1].token;
          H.indexOf("octave=") != -1 ? (H = H.replace("octave=", ""), H = parseInt(H), isNaN(H) ? l("Expected octave value in MIDI" + D) : (H < -1 && (l("Expected octave= in MIDI " + D + " to be >= -1 (recv:" + H + ")"), H = -1), H > 3 && (l("Expected octave= in MIDI " + D + " to be <= 3 (recv:" + H + ")"), H = 3), O.push(H))) : l("Expected octave= in MIDI" + D);
        }
      }
      a.hasBeginMusic() ? a.appendElement("midi", -1, -1, { cmd: D, params: O }) : (x.formatting.midi === void 0 && (x.formatting.midi = {}), x.formatting.midi[D] = O);
    };
    m.parseFontChangeLine = function(b) {
      b = b.replace(/\$\$/g, "");
      var x = b.split("$");
      if (x.length > 1 && r.setfont) {
        var E = [];
        x[0] !== "" && E.push({ text: x[0] });
        for (var D = 1; D < x.length; D++)
          if (x[D][0] === "0")
            E.push({ text: x[D].substring(1).replace(/\x03/g, "$$") });
          else {
            var O = parseInt(x[D][0], 10);
            r.setfont[O] ? E.push({ font: r.setfont[O], text: x[D].substring(1).replace(/\x03/g, "$$") }) : E[E.length - 1].text += "$" + x[D].replace(/\x03/g, "$$");
          }
        return E;
      }
      return b.replace(/\x03/g, "$$");
    };
    var F = ["auto", "above", "below", "hidden"];
    m.addDirective = function(b) {
      var x = g.tokenize(b, 0, b.length);
      if (x.length === 0 || x[0].type !== "alpha") return null;
      var E = b.substring(b.indexOf(x[0].token) + x[0].token.length);
      E = g.stripComment(E);
      var D = x.shift().token.toLowerCase(), O = "", z;
      switch (D) {
        // The following directives were added to abc_parser_lint, but haven't been implemented here.
        // Most of them are direct translations from the directives that will be parsed in. See abcm2ps's format.txt for info on each of these.
        //					alignbars: { type: "number", optional: true },
        //					aligncomposer: { type: "string", Enum: [ 'left', 'center','right' ], optional: true },
        //					bstemdown: { type: "boolean", optional: true },
        //					continueall: { type: "boolean", optional: true },
        //					dynalign: { type: "boolean", optional: true },
        //					exprabove: { type: "boolean", optional: true },
        //					exprbelow: { type: "boolean", optional: true },
        //					gchordbox: { type: "boolean", optional: true },
        //					gracespacebefore: { type: "number", optional: true },
        //					gracespaceinside: { type: "number", optional: true },
        //					gracespaceafter: { type: "number", optional: true },
        //					infospace: { type: "number", optional: true },
        //					lineskipfac: { type: "number", optional: true },
        //					maxshrink: { type: "number", optional: true },
        //					maxstaffsep: { type: "number", optional: true },
        //					maxsysstaffsep: { type: "number", optional: true },
        //					notespacingfactor: { type: "number", optional: true },
        //					parskipfac: { type: "number", optional: true },
        //					slurheight: { type: "number", optional: true },
        //					splittune: { type: "boolean", optional: true },
        //					squarebreve: { type: "boolean", optional: true },
        //					stemheight: { type: "number", optional: true },
        //					straightflags: { type: "boolean", optional: true },
        //					stretchstaff: { type: "boolean", optional: true },
        //					titleformat: { type: "string", optional: true },
        case "bagpipes":
          o.formatting.bagpipes = !0;
          break;
        case "flatbeams":
          o.formatting.flatbeams = !0;
          break;
        case "jazzchords":
          o.formatting.jazzchords = !0;
          break;
        case "accentAbove":
          o.formatting.accentAbove = !0;
          break;
        case "germanAlphabet":
          o.formatting.germanAlphabet = !0;
          break;
        case "landscape":
          r.landscape = !0;
          break;
        case "papersize":
          r.papersize = E;
          break;
        case "graceslurs":
          if (x.length !== 1)
            return "Directive graceslurs requires one parameter: 0 or 1";
          if (x[0].token === "0" || x[0].token === "false")
            o.formatting.graceSlurs = !1;
          else if (x[0].token === "1" || x[0].token === "true")
            o.formatting.graceSlurs = !0;
          else
            return "Directive graceslurs requires one parameter: 0 or 1 (received " + x[0].token + ")";
          break;
        case "lineThickness":
          var H = L(x);
          if (H.value !== void 0 && (o.formatting.lineThickness = H.value), H.error)
            return H.error;
          break;
        case "stretchlast":
          var $ = L(x);
          if ($.value !== void 0 && (o.formatting.stretchlast = $.value), $.error)
            return $.error;
          break;
        case "titlecaps":
          r.titlecaps = !0;
          break;
        case "titleleft":
          o.formatting.titleleft = !0;
          break;
        case "measurebox":
          o.formatting.measurebox = !0;
          break;
        case "vocal":
          return w("vocalPosition", D, x, F);
        case "dynamic":
          return w("dynamicPosition", D, x, F);
        case "gchord":
          return w("chordPosition", D, x, F);
        case "ornament":
          return w("ornamentPosition", D, x, F);
        case "volume":
          return w("volumePosition", D, x, F);
        case "botmargin":
        case "botspace":
        case "composerspace":
        case "indent":
        case "leftmargin":
        case "linesep":
        case "musicspace":
        case "partsspace":
        case "pageheight":
        case "pagewidth":
        case "rightmargin":
        case "stafftopmargin":
        case "staffsep":
        case "staffwidth":
        case "subtitlespace":
        case "sysstaffsep":
        case "systemsep":
        case "textspace":
        case "titlespace":
        case "topmargin":
        case "topspace":
        case "vocalspace":
        case "wordsspace":
          return v(D, x);
        case "voicescale":
          if (x.length !== 1 || x[0].type !== "number")
            return "voicescale requires one float as a parameter";
          var Q = x.shift();
          return r.currentVoice && (r.currentVoice.scale = Q.floatt, a.changeVoiceScale(r.currentVoice.scale)), null;
        case "voicecolor":
          if (x.length !== 1)
            return "voicecolor requires one string as a parameter";
          var W = x.shift();
          return r.currentVoice && (r.currentVoice.color = W.token, a.changeVoiceColor(r.currentVoice.color)), null;
        case "vskip":
          var ne = Math.round(c(D, x));
          return ne.error ? ne.error : (a.addSpacing(ne), null);
        case "scale":
          n(D, x);
          break;
        case "sep":
          if (x.length === 0)
            a.addSeparator(14, 14, 85, { startChar: r.iChar, endChar: r.iChar + 5 });
          else {
            var J = g.getMeasurement(x);
            if (J.used === 0)
              return 'Directive "' + D + '" requires 3 numbers: space above, space below, length of line';
            var te = J.value;
            if (J = g.getMeasurement(x), J.used === 0)
              return 'Directive "' + D + '" requires 3 numbers: space above, space below, length of line';
            var U = J.value;
            if (J = g.getMeasurement(x), J.used === 0 || x.length !== 0)
              return 'Directive "' + D + '" requires 3 numbers: space above, space below, length of line';
            var re = J.value;
            a.addSeparator(te, U, re, { startChar: r.iChar, endChar: r.iChar + E.length });
          }
          break;
        case "barsperstaff":
          if (O = h("barsperstaff", D, x), O !== null) return O;
          break;
        case "staffnonote":
          if (x.length !== 1)
            return "Directive staffnonote requires one parameter: 0 or 1";
          if (x[0].token === "0")
            r.staffnonote = !0;
          else if (x[0].token === "1")
            r.staffnonote = !1;
          else
            return "Directive staffnonote requires one parameter: 0 or 1 (received " + x[0].token + ")";
          break;
        case "printtempo":
          if (O = y("printTempo", D, x), O !== null) return O;
          break;
        case "partsbox":
          if (O = y("partsBox", D, x), O !== null) return O;
          r.partsfont.box = r.partsBox;
          break;
        case "freegchord":
          if (O = y("freegchord", D, x), O !== null) return O;
          break;
        case "measurenb":
        case "barnumbers":
          if (O = h("barNumbers", D, x), O !== null) return O;
          break;
        case "setbarnb":
          if (x.length !== 1 || x[0].type !== "number")
            return "Directive setbarnb requires a number as a parameter.";
          r.currBarNumber = a.setBarNumberImmediate(x[0].intt);
          break;
        case "keywarn":
          if (x.length !== 1 || x[0].type !== "number" || x[0].intt !== 1 && x[0].intt !== 0)
            return "Directive " + D + " requires 0 or 1 as a parameter.";
          r[D] = x[0].intt === 1;
          break;
        case "begintext":
          var V = "";
          for (z = g.nextLine(); z && z.indexOf("%%endtext") !== 0; ) {
            if (_.startsWith(z, "%%")) {
              var oe = z.substring(2);
              oe = oe.trim() + `
`, V += oe;
            } else
              V += z.trim() + `
`;
            z = g.nextLine();
          }
          a.addText(V, { startChar: r.iChar, endChar: r.iChar + V.length + 7 });
          break;
        case "continueall":
          r.continueall = !0;
          break;
        case "beginps":
          for (z = g.nextLine(); z && z.indexOf("%%endps") !== 0; )
            g.nextLine();
          l("Postscript ignored", b, 0);
          break;
        case "deco":
          E.length > 0 && r.ignoredDecorations.push(E.substring(0, E.indexOf(" "))), l("Decoration redefinition ignored", b, 0);
          break;
        case "text":
          var ce = g.translateString(E);
          a.addText(m.parseFontChangeLine(ce), { startChar: r.iChar, endChar: r.iChar + E.length + 7 });
          break;
        case "center":
          var ue = g.translateString(E);
          a.addCentered(m.parseFontChangeLine(ue));
          break;
        case "font":
          break;
        case "setfont":
          var fe = g.tokenize(E, 0, E.length);
          if (fe.length >= 4 && fe[0].token === "-" && fe[1].type === "number") {
            var be = parseInt(fe[1].token);
            be >= 1 && be <= 9 && (r.setfont || (r.setfont = []), fe.shift(), fe.shift(), r.setfont[be] = d(fe, r.setfont[be], b, 0, "setfont"));
          }
          break;
        case "gchordfont":
        case "partsfont":
        case "tripletfont":
        case "vocalfont":
        case "textfont":
        case "annotationfont":
        case "historyfont":
        case "infofont":
        case "measurefont":
        case "repeatfont":
        case "wordsfont":
          return f(D, x, b);
        case "composerfont":
        case "subtitlefont":
        case "tempofont":
        case "titlefont":
        case "voicefont":
        case "footerfont":
        case "headerfont":
          return i(D, x, b);
        case "barlabelfont":
        case "barnumberfont":
        case "barnumfont":
          return f("measurefont", x, b);
        case "staves":
        case "score":
          r.score_is_present = !0;
          for (var ge = function(Fe, Ss, ea, ta, Es) {
            (Ss || r.staves.length === 0) && r.staves.push({ index: r.staves.length, numVoices: 0 });
            var Be = _.last(r.staves);
            ea !== void 0 && Be.bracket === void 0 && (Be.bracket = ea), ta !== void 0 && Be.brace === void 0 && (Be.brace = ta), Es && (Be.connectBarLines = "end"), r.voices[Fe] === void 0 && (r.voices[Fe] = { staffNum: Be.index, index: Be.numVoices }, Be.numVoices++);
          }, ye = !1, Y = !1, j = !1, G = !1, X = !1, K = !1, Z = !1, ae, le = function() {
            if (Z = !0, ae) {
              var Fe = "start";
              ae.staffNum > 0 && (r.staves[ae.staffNum - 1].connectBarLines === "start" || r.staves[ae.staffNum - 1].connectBarLines === "continue") && (Fe = "continue"), r.staves[ae.staffNum].connectBarLines = Fe;
            }
          }; x.length; ) {
            var ee = x.shift();
            switch (ee.token) {
              case "(":
                ye ? l("Can't nest parenthesis in %%score", b, ee.start) : (ye = !0, G = !0);
                break;
              case ")":
                !ye || G ? l("Unexpected close parenthesis in %%score", b, ee.start) : ye = !1;
                break;
              case "[":
                Y ? l("Can't nest brackets in %%score", b, ee.start) : (Y = !0, X = !0);
                break;
              case "]":
                !Y || X ? l("Unexpected close bracket in %%score", b, ee.start) : (Y = !1, r.staves[ae.staffNum].bracket = "end");
                break;
              case "{":
                j ? l("Can't nest braces in %%score", b, ee.start) : (j = !0, K = !0);
                break;
              case "}":
                !j || K ? l("Unexpected close brace in %%score", b, ee.start) : (j = !1, r.staves[ae.staffNum].brace = "end");
                break;
              case "|":
                le();
                break;
              default:
                for (var se = ""; (ee.type === "alpha" || ee.type === "number") && (se += ee.token, ee.continueId); )
                  ee = x.shift();
                var pe = !ye || G, ve = X ? "start" : Y ? "continue" : void 0, ie = K ? "start" : j ? "continue" : void 0;
                ge(se, pe, ve, ie, Z), G = !1, X = !1, K = !1, Z = !1, ae = r.voices[se], D === "staves" && le();
                break;
            }
          }
          break;
        case "maxstaves":
          var de = g.getInt(E);
          de.digits === 0 ? l("Expected number of staves in maxstaves") : de.value > 0 && (o.formatting.maxStaves = de.value);
          break;
        case "newpage":
          var me = g.getInt(E);
          a.addNewPage(me.digits === 0 ? -1 : me.value);
          break;
        case "abc":
          var he = E.split(" ");
          switch (he[0]) {
            case "-copyright":
            case "-creator":
            case "-edited-by":
            case "-version":
            case "-charset":
              var Ee = he.shift();
              a.addMetaText(D + Ee, he.join(" "), { startChar: r.iChar, endChar: r.iChar + E.length + 5 });
              break;
            default:
              return "Unknown directive: " + D + he[0];
          }
          break;
        case "header":
        case "footer":
          var xe = g.getMeat(E, 0, E.length);
          xe = E.substring(xe.start, xe.end), xe[0] === '"' && xe[xe.length - 1] === '"' && (xe = xe.substring(1, xe.length - 1));
          var we = xe.split("	"), Le = {};
          we.length === 1 ? Le = { left: "", center: we[0], right: "" } : we.length === 2 ? Le = { left: we[0], center: we[1], right: "" } : Le = { left: we[0], center: we[1], right: we[2] }, we.length > 3 && l("Too many tabs in " + D + ": " + we.length + " found.", E, 0), a.addMetaTextObj(D, Le, { startChar: r.iChar, endChar: r.iChar + b.length });
          break;
        case "midi":
          var Ae = g.tokenize(E, 0, E.length, !0);
          Ae.length > 0 && Ae[0].token === "=" && Ae.shift(), Ae.length === 0 ? l("Expected midi command", E, 0) : M(Ae, o, E);
          break;
        case "percmap":
          var Me = e(E);
          Me.error ? l(Me.error, b, 8) : (o.formatting.percmap || (o.formatting.percmap = {}), o.formatting.percmap[Me.key] = Me.value);
          break;
        case "visualtranspose":
          var Ie = g.getInt(E);
          Ie.digits === 0 ? l("Expected number of half steps in visualTranspose") : r.globalTranspose = Ie.value;
          break;
        case "map":
        case "playtempo":
        case "auquality":
        case "continuous":
        case "nobarcheck":
          o.formatting[D] = E;
          break;
        default:
          return "Unknown directive: " + D;
      }
      return null;
    }, m.globalFormatting = function(b) {
      for (var x in b)
        if (b.hasOwnProperty(x)) {
          var E = "" + b[x], D = g.tokenize(E, 0, E.length), O;
          switch (x) {
            case "titlefont":
            case "gchordfont":
            case "composerfont":
            case "footerfont":
            case "headerfont":
            case "historyfont":
            case "infofont":
            case "measurefont":
            case "partsfont":
            case "repeatfont":
            case "subtitlefont":
            case "tempofont":
            case "textfont":
            case "voicefont":
            case "tripletfont":
            case "vocalfont":
            case "wordsfont":
            case "annotationfont":
            case "tablabelfont":
            case "tabnumberfont":
            case "tabgracefont":
              f(x, D, E);
              break;
            case "scale":
              n(x, D);
              break;
            case "partsbox":
              O = y("partsBox", x, D), O !== null && l(O), r.partsfont.box = r.partsBox;
              break;
            case "freegchord":
              O = y("freegchord", x, D), O !== null && l(O);
              break;
            case "fontboxpadding":
              (D.length !== 1 || D[0].type !== "number") && l('Directive "' + x + '" requires a number as a parameter.'), o.formatting.fontboxpadding = D[0].floatt;
              break;
            case "stafftopmargin":
              (D.length !== 1 || D[0].type !== "number") && l('Directive "' + x + '" requires a number as a parameter.'), o.formatting.stafftopmargin = D[0].floatt;
              break;
            case "stretchlast":
              var z = L(D);
              if (z.value !== void 0 && (o.formatting.stretchlast = z.value), z.error)
                return z.error;
              break;
            default:
              l("Formatting directive unrecognized: ", x, 0);
          }
        }
    };
    function L(b) {
      if (b.length === 0)
        return { value: 1 };
      if (b.length === 1)
        if (b[0].type === "number") {
          if (b[0].floatt >= 0 || b[0].floatt <= 1)
            return { value: b[0].floatt };
        } else {
          if (b[0].token === "false")
            return { value: 0 };
          if (b[0].token === "true")
            return { value: 1 };
        }
      return { error: "Directive stretchlast requires zero or one parameter: false, true, or number between 0 and 1 (received " + b[0].token + ")" };
    }
  })(), Qe = m, Qe;
}
var Je, oa;
function Ns() {
  if (oa) return Je;
  oa = 1;
  var _ = {};
  const m = [
    "C,,,",
    "D,,,",
    "E,,,",
    "F,,,",
    "G,,,",
    "A,,,",
    "B,,,",
    "C,,",
    "D,,",
    "E,,",
    "F,,",
    "G,,",
    "A,,",
    "B,,",
    "C,",
    "D,",
    "E,",
    "F,",
    "G,",
    "A,",
    "B,",
    "C",
    "D",
    "E",
    "F",
    "G",
    "A",
    "B",
    "c",
    "d",
    "e",
    "f",
    "g",
    "a",
    "b",
    "c'",
    "d'",
    "e'",
    "f'",
    "g'",
    "a'",
    "b'",
    "c''",
    "d''",
    "e''",
    "f''",
    "g''",
    "a''",
    "b''",
    "c'''",
    "d'''",
    "e'''",
    "f'''",
    "g'''",
    "a'''",
    "b'''"
  ];
  return _.pitchIndex = function(g) {
    return m.indexOf(g);
  }, _.noteName = function(g) {
    return m[g];
  }, Je = _, Je;
}
var Ze, ca;
function $i() {
  if (ca) return Ze;
  ca = 1;
  var _ = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"], m = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"], g = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], l = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  function r(o, a, s, p) {
    if (!a || a % 12 === 0)
      return o;
    for (; a < 0; ) a += 12;
    a > 11 && (a = a % 12);
    var u = o.match(/^([A-G][b#♭♯]?)([^\/]+)?\/?([A-G][b#♭♯]?)?(.+)?/);
    if (!u)
      return o;
    var d = u[1], f = u[2], i = u[3], n = u[4], t = _.indexOf(d);
    if (t < 0 && (t = m.indexOf(d)), t < 0 && (t = g.indexOf(d)), t < 0 && (t = l.indexOf(d)), t < 0)
      return o;
    t += a, t = t % 12, s ? p ? o = l[t] : o = m[t] : p ? o = g[t] : o = _[t];
    var e = f && (f.indexOf("dim") >= 0 || f.indexOf("°") >= 0);
    if (e && o === "A#" && (o = "Bb"), e && o === "D#" && (o = "Eb"), e && o === "A♯" && (o = "B♭"), e && o === "D♯" && (o = "E♭"), f && (o += f), i) {
      var t = _.indexOf(i);
      t < 0 && (t = m.indexOf(i)), t < 0 && (t = g.indexOf(i)), t < 0 && (t = l.indexOf(i)), o += "/", t >= 0 ? (t += a, t = t % 12, s ? p ? o += l[t] : o += m[t] : p ? o += g[t] : o += _[t]) : o += i;
    }
    return n && (o += n), o;
  }
  return Ze = r, Ze;
}
var et, la;
function Vi() {
  if (la) return et;
  la = 1;
  var _ = {
    C: { modes: ["CMaj", "CIon", "Amin", "AAeo", "Am", "GMix", "DDor", "EPhr", "FLyd", "BLoc"], stepsFromC: 0 },
    Db: { modes: ["DbMaj", "DbIon", "Bbmin", "BbAeo", "Bbm", "AbMix", "EbDor", "FPhr", "GbLyd", "CLoc"], stepsFromC: 1 },
    D: { modes: ["DMaj", "DIon", "Bmin", "BAeo", "Bm", "AMix", "EDor", "F#Phr", "GLyd", "C#Loc"], stepsFromC: 2 },
    Eb: { modes: ["EbMaj", "EbIon", "Cmin", "CAeo", "Cm", "BbMix", "FDor", "GPhr", "AbLyd", "DLoc"], stepsFromC: 3 },
    E: { modes: ["EMaj", "EIon", "C#min", "C#Aeo", "C#m", "BMix", "F#Dor", "G#Phr", "ALyd", "D#Loc"], stepsFromC: 4 },
    F: { modes: ["FMaj", "FIon", "Dmin", "DAeo", "Dm", "CMix", "GDor", "APhr", "BbLyd", "ELoc"], stepsFromC: 5 },
    Gb: { modes: ["GbMaj", "GbIon", "Ebmin", "EbAeo", "Ebm", "DbMix", "AbDor", "BbPhr", "CbLyd", "FLoc"], stepsFromC: 6 },
    G: { modes: ["GMaj", "GIon", "Emin", "EAeo", "Em", "DMix", "ADor", "BPhr", "CLyd", "F#Loc"], stepsFromC: 7 },
    Ab: { modes: ["AbMaj", "AbIon", "Fmin", "FAeo", "Fm", "EbMix", "BbDor", "CPhr", "DbLyd", "GLoc"], stepsFromC: 8 },
    A: { modes: ["AMaj", "AIon", "F#min", "F#Aeo", "F#m", "EMix", "BDor", "C#Phr", "DLyd", "G#Loc"], stepsFromC: 9 },
    Bb: { modes: ["BbMaj", "BbIon", "Gmin", "GAeo", "Gm", "FMix", "CDor", "DPhr", "EbLyd", "ALoc"], stepsFromC: 10 },
    B: { modes: ["BMaj", "BIon", "G#min", "G#Aeo", "G#m", "F#Mix", "C#Dor", "D#Phr", "ELyd", "A#Loc"], stepsFromC: 11 },
    // Enharmonic keys
    "C#": { modes: ["C#Maj", "C#Ion", "A#min", "A#Aeo", "A#m", "G#Mix", "D#Dor", "E#Phr", "F#Lyd", "B#Loc"], stepsFromC: 1 },
    "F#": { modes: ["F#Maj", "F#Ion", "D#min", "D#Aeo", "D#m", "C#Mix", "G#Dor", "A#Phr", "BLyd", "E#Loc"], stepsFromC: 6 },
    Cb: { modes: ["CbMaj", "CbIon", "Abmin", "AbAeo", "Abm", "GbMix", "DbDor", "EbPhr", "FbLyd", "BbLoc"], stepsFromC: 11 }
  }, m = ["maj", "ion", "min", "aeo", "m", "mix", "dor", "phr", "lyd", "loc"];
  function g(p) {
    return m.indexOf(p.toLowerCase()) >= 0;
  }
  var l = null;
  function r() {
    l = {};
    for (var p = Object.keys(_), u = 0; u < p.length; u++) {
      var d = _[p[u]];
      l[p[u].toLowerCase()] = p[u];
      for (var f = 0; f < d.modes.length; f++) {
        var i = d.modes[f].toLowerCase();
        l[i] = p[u];
      }
    }
  }
  function o(p) {
    l || r();
    var u = p.toLowerCase().match(/([a-g][b#]?)(maj|ion|min|aeo|mix|dor|phr|lyd|loc|m)?/);
    if (!u || !u[2])
      return p;
    u = u[1] + u[2];
    var d = l[u];
    return d || p;
  }
  function a(p, u) {
    var d = _[p];
    if (!d || u === "")
      return p;
    var f = u.toLowerCase().match(/^(maj|ion|min|aeo|mix|dor|phr|lyd|loc|m)/);
    if (!f)
      return p;
    for (var i = f[1], n = 0; n < d.modes.length; n++) {
      var t = d.modes[n], e = t.toLowerCase().indexOf(i);
      if (e !== -1 && e === t.length - i.length)
        return t.substring(0, t.length - i.length);
    }
    return p;
  }
  function s(p, u) {
    var d = _[p];
    if (!d)
      return p;
    for (; u < 0; ) u += 12;
    for (var f = (d.stepsFromC + u) % 12, i = 0; i < Object.keys(_).length; i++) {
      var n = Object.keys(_)[i];
      if (_[n].stepsFromC === f)
        return n;
    }
    return p;
  }
  return et = { relativeMajor: o, relativeMode: a, transposeKey: s, isLegalMode: g }, et;
}
var tt, fa;
function Ki() {
  if (fa) return tt;
  fa = 1;
  var { relativeMajor: _ } = Vi(), m = { acc: "sharp", note: "f" }, g = { acc: "sharp", note: "c" }, l = { acc: "sharp", note: "g" }, r = { acc: "sharp", note: "d" }, o = { acc: "sharp", note: "A" }, a = { acc: "sharp", note: "e" }, s = { acc: "sharp", note: "B" }, p = { acc: "flat", note: "B" }, u = { acc: "flat", note: "e" }, d = { acc: "flat", note: "A" }, f = { acc: "flat", note: "d" }, i = { acc: "flat", note: "G" }, n = { acc: "flat", note: "c" }, t = { acc: "flat", note: "F" }, e = {
    "C#": [m, g, l, r, o, a, s],
    "F#": [m, g, l, r, o, a],
    B: [m, g, l, r, o],
    E: [m, g, l, r],
    A: [m, g, l],
    D: [m, g],
    G: [m],
    C: [],
    F: [p],
    Bb: [p, u],
    Eb: [p, u, d],
    Cm: [p, u, d],
    Ab: [p, u, d, f],
    Db: [p, u, d, f, i],
    Gb: [p, u, d, f, i, n],
    Cb: [p, u, d, f, i, n, t],
    // The following are not in the 2.0 spec, but seem normal enough.
    // TODO-PER: These SOUND the same as what's written, but they aren't right
    "A#": [p, u],
    "B#": [],
    "D#": [p, u, d],
    "E#": [p],
    "G#": [p, u, d, f],
    none: []
  };
  function c(v) {
    var h = e[_(v)];
    return h ? JSON.parse(JSON.stringify(h)) : null;
  }
  return tt = c, tt;
}
var rt, ha;
function Qi() {
  if (ha) return rt;
  ha = 1;
  var _ = Ns(), m = $i(), g = Ki(), l = {}, r = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11
  }, o = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"], a = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
  l.keySignature = function(i, n, t, e, c) {
    if (i.clef.type === "perc" || i.clef.type === "none")
      return { accidentals: g(n), root: t, acc: e };
    c || (c = 0), i.localTransposeVerticalMovement = 0, i.localTransposePreferFlats = !1;
    var v = g(n);
    if (!v) return i.key;
    if (i.localTranspose = (i.globalTranspose ? i.globalTranspose : 0) + c, !i.localTranspose)
      return { accidentals: v, root: t, acc: e };
    if (i.globalTransposeOrigKeySig = v, i.localTranspose % 12 === 0)
      return i.localTransposeVerticalMovement = i.localTranspose / 12 * 7, { accidentals: v, root: t, acc: e };
    var h = n[0];
    n[1] === "b" || n[1] === "#" ? (h += n[1], n = n.substr(2)) : n = n.substr(1);
    var y = r[h], w = y !== void 0;
    w || (y = 0, h = "C", n = "");
    for (var A = y + i.localTranspose; A < 0; ) A += 12;
    A > 11 && (A = A % 12);
    var P = n[0] === "m" ? a[A] : o[A], N = P + n, T = g(N);
    (T.length === 0 || T[0].acc === "flat") && (i.localTransposePreferFlats = !0);
    var q = N.charCodeAt(0) - h.charCodeAt(0);
    return i.localTranspose > 0 ? (q < 0 || q === 0 && (h[1] === "#" || N[1] === "b")) && (q += 7) : i.localTranspose < 0 && (q > 0 || q === 0 && (h[1] === "b" || N[1] === "#")) && (q -= 7), i.localTranspose > 0 ? i.localTransposeVerticalMovement = q + Math.floor(i.localTranspose / 12) * 7 : i.localTransposeVerticalMovement = q + Math.ceil(i.localTranspose / 12) * 7, w ? { accidentals: T, root: P[0], acc: P.length > 1 ? P[1] : "" } : { accidentals: [], root: t, acc: e };
  }, l.chordName = function(i, n) {
    return m(n, i.localTranspose, i.localTransposePreferFlats, i.freegchord);
  };
  var s = ["c", "d", "e", "f", "g", "a", "b"];
  function p(i, n, t, e, c) {
    for (var v = s[(i + 49) % 7], h = 0, y = 0; y < e.length; y++)
      e[y].note.toLowerCase() === v && (h = u[e[y].acc]);
    for (var w = u[t], A = w - h, P = s[(n + 49) % 7], N = 0, T = 0; T < c.accidentals.length; T++)
      c.accidentals[T].note.toLowerCase() === P && (N = u[c.accidentals[T].acc]);
    var q = A + N;
    return q < -2 && (n--, q += P === "c" || P === "f" ? 1 : 2), q > 2 && (n++, q -= P === "b" || P === "e" ? 1 : 2), [n, q];
  }
  var u = {
    dblflat: -2,
    flat: -1,
    natural: 0,
    sharp: 1,
    dblsharp: 2
  }, d = {
    "-2": "dblflat",
    "-1": "flat",
    0: "natural",
    1: "sharp",
    2: "dblsharp"
  }, f = {
    "-2": "__",
    "-1": "_",
    0: "=",
    1: "^",
    2: "^^"
  };
  return l.note = function(i, n) {
    if (!(!i.localTranspose || i.clef.type === "perc")) {
      var t = n.pitch;
      if (i.localTransposeVerticalMovement && (n.pitch = n.pitch + i.localTransposeVerticalMovement, n.name)) {
        var e = n.accidental ? n.name.substring(1) : n.name, c = n.accidental ? n.name[0] : "", v = _.pitchIndex(e);
        n.name = c + _.noteName(v + i.localTransposeVerticalMovement);
      }
      if (n.accidental) {
        var h = p(t, n.pitch, n.accidental, i.globalTransposeOrigKeySig, i.targetKey);
        n.pitch = h[0], n.accidental = d[h[1]], n.name && (n.name = f[h[1]] + n.name.replace(/[_^=]/g, ""));
      }
    }
  }, rt = l, rt;
}
var at, ua;
function Fr() {
  if (ua) return at;
  ua = 1;
  var _ = Ir(), m = Qi(), g = {};
  return (function() {
    var l, r, o, a;
    g.initialize = function(t, e, c, v, h) {
      l = t, r = e, o = c, a = h;
    }, g.standardKey = function(t, e, c, v) {
      return m.keySignature(o, t, e, c, v);
    };
    var s = {
      treble: { clef: "treble", pitch: 4, mid: 0 },
      "treble+8": { clef: "treble+8", pitch: 4, mid: 0 },
      "treble-8": { clef: "treble-8", pitch: 4, mid: 0 },
      "treble^8": { clef: "treble+8", pitch: 4, mid: 0 },
      treble_8: { clef: "treble-8", pitch: 4, mid: 0 },
      treble1: { clef: "treble", pitch: 2, mid: 2 },
      treble2: { clef: "treble", pitch: 4, mid: 0 },
      treble3: { clef: "treble", pitch: 6, mid: -2 },
      treble4: { clef: "treble", pitch: 8, mid: -4 },
      treble5: { clef: "treble", pitch: 10, mid: -6 },
      perc: { clef: "perc", pitch: 6, mid: 0 },
      none: { clef: "none", mid: 0 },
      bass: { clef: "bass", pitch: 8, mid: -12 },
      "bass+8": { clef: "bass+8", pitch: 8, mid: -12 },
      "bass-8": { clef: "bass-8", pitch: 8, mid: -12 },
      "bass^8": { clef: "bass+8", pitch: 8, mid: -12 },
      bass_8: { clef: "bass-8", pitch: 8, mid: -12 },
      "bass+16": { clef: "bass", pitch: 8, mid: -12 },
      "bass-16": { clef: "bass", pitch: 8, mid: -12 },
      "bass^16": { clef: "bass", pitch: 8, mid: -12 },
      bass_16: { clef: "bass", pitch: 8, mid: -12 },
      bass1: { clef: "bass", pitch: 2, mid: -6 },
      bass2: { clef: "bass", pitch: 4, mid: -8 },
      bass3: { clef: "bass", pitch: 6, mid: -10 },
      bass4: { clef: "bass", pitch: 8, mid: -12 },
      bass5: { clef: "bass", pitch: 10, mid: -14 },
      tenor: { clef: "alto", pitch: 8, mid: -8 },
      tenor1: { clef: "alto", pitch: 2, mid: -2 },
      tenor2: { clef: "alto", pitch: 4, mid: -4 },
      tenor3: { clef: "alto", pitch: 6, mid: -6 },
      tenor4: { clef: "alto", pitch: 8, mid: -8 },
      tenor5: { clef: "alto", pitch: 10, mid: -10 },
      alto: { clef: "alto", pitch: 6, mid: -6 },
      alto1: { clef: "alto", pitch: 2, mid: -2 },
      alto2: { clef: "alto", pitch: 4, mid: -4 },
      alto3: { clef: "alto", pitch: 6, mid: -6 },
      alto4: { clef: "alto", pitch: 8, mid: -8 },
      alto5: { clef: "alto", pitch: 10, mid: -10 },
      "alto+8": { clef: "alto+8", pitch: 6, mid: -6 },
      "alto-8": { clef: "alto-8", pitch: 6, mid: -6 },
      "alto^8": { clef: "alto+8", pitch: 6, mid: -6 },
      alto_8: { clef: "alto-8", pitch: 6, mid: -6 }
    }, p = function(t, e) {
      var c = s[t], v = c ? c.mid : 0;
      return v + e;
    };
    g.fixClef = function(t) {
      var e = s[t.type];
      e && (t.clefPos = e.pitch, t.type = e.clef);
    }, g.deepCopyKey = function(t) {
      var e = { accidentals: [], root: t.root, acc: t.acc, mode: t.mode };
      return t.accidentals.forEach(function(c) {
        e.accidentals.push(Object.assign({}, c));
      }), t.explicitAccidentals && (e.explicitAccidentals = [], t.explicitAccidentals.forEach(function(c) {
        e.explicitAccidentals.push(Object.assign({}, c));
      })), e;
    };
    var u = function() {
      o.currentVoice && (o.currentVoice.key = g.deepCopyKey(o.key));
    }, d = { A: 5, B: 6, C: 0, D: 1, E: 2, F: 3, G: 4, a: 12, b: 13, c: 7, d: 8, e: 9, f: 10, g: 11 };
    g.addPosToKey = function(t, e) {
      var c = t.verticalPos;
      e.accidentals.forEach(function(v) {
        var h = d[v.note];
        h = h - c, v.verticalPos = h;
      }), e.impliedNaturals && e.impliedNaturals.forEach(function(v) {
        var h = d[v.note];
        h = h - c, v.verticalPos = h;
      }), c < -10 ? (e.accidentals.forEach(function(v) {
        v.verticalPos -= 7, (v.verticalPos >= 11 || v.verticalPos === 10 && v.acc === "flat") && (v.verticalPos -= 7), v.note === "A" && v.acc === "sharp" && (v.verticalPos -= 7), (v.note === "G" || v.note === "F") && v.acc === "flat" && (v.verticalPos -= 7);
      }), e.impliedNaturals && e.impliedNaturals.forEach(function(v) {
        v.verticalPos -= 7, (v.verticalPos >= 11 || v.verticalPos === 10 && v.acc === "flat") && (v.verticalPos -= 7), v.note === "A" && v.acc === "sharp" && (v.verticalPos -= 7), (v.note === "G" || v.note === "F") && v.acc === "flat" && (v.verticalPos -= 7);
      })) : c < -4 ? (e.accidentals.forEach(function(v) {
        v.verticalPos -= 7, c === -8 && (v.note === "f" || v.note === "g") && v.acc === "sharp" && (v.verticalPos -= 7);
      }), e.impliedNaturals && e.impliedNaturals.forEach(function(v) {
        v.verticalPos -= 7, c === -8 && (v.note === "f" || v.note === "g") && v.acc === "sharp" && (v.verticalPos -= 7);
      })) : c >= 7 && (e.accidentals.forEach(function(v) {
        v.verticalPos += 7;
      }), e.impliedNaturals && e.impliedNaturals.forEach(function(v) {
        v.verticalPos += 7;
      }));
    }, g.fixKey = function(t, e) {
      var c = Object.assign({}, e);
      return g.addPosToKey(t, c), c;
    };
    var f = function(t) {
      var e = 0, c = t[e++];
      (c === "^" || c === "_") && (c = t[e++]);
      var v = d[c];
      for (v === void 0 && (v = 6); e < t.length; e++)
        if (t[e] === ",") v -= 7;
        else if (t[e] === "'") v += 7;
        else break;
      return { mid: v - 6, str: t.substring(e) };
    }, i = function(t) {
      for (var e = 0; e < t.length; e++)
        t[e].note === "b" ? t[e].note = "B" : t[e].note === "a" ? t[e].note = "A" : t[e].note === "F" ? t[e].note = "f" : t[e].note === "E" ? t[e].note = "e" : t[e].note === "D" ? t[e].note = "d" : t[e].note === "C" ? t[e].note = "c" : t[e].note === "G" && t[e].acc === "sharp" ? t[e].note = "g" : t[e].note === "g" && t[e].acc === "flat" && (t[e].note = "G");
    };
    g.parseKey = function(t, e) {
      t.length === 0 && (t = "none");
      var c = l.tokenize(t, 0, t.length), v = {};
      if (c.length === 0)
        return r("Must pass in key signature.", t, 0), v;
      switch (c[0].token) {
        case "HP":
          _.addDirective("bagpipes"), o.key = { root: "HP", accidentals: [], acc: "", mode: "" }, v.foundKey = !0, c.shift(), e || (o.globalKey = g.deepCopyKey(o.key)), u();
          break;
        case "Hp":
          _.addDirective("bagpipes"), o.key = { root: "Hp", accidentals: [{ acc: "natural", note: "g" }, { acc: "sharp", note: "f" }, { acc: "sharp", note: "c" }], acc: "", mode: "" }, v.foundKey = !0, c.shift(), e || (o.globalKey = g.deepCopyKey(o.key)), u();
          break;
        case "none":
          o.key = { root: "none", accidentals: [], acc: "", mode: "" }, v.foundKey = !0, c.shift(), e || (o.globalKey = g.deepCopyKey(o.key)), u();
          break;
        default:
          var h = l.getKeyPitch(c[0].token);
          if (h.len > 0) {
            v.foundKey = !0;
            var y = "", w = "";
            c[0].token.length > 1 ? c[0].token = c[0].token.substring(1) : c.shift();
            var A = h.token;
            if (c.length > 0) {
              var P = l.getSharpFlat(c[0].token);
              if (P.len > 0 && (c[0].token.length > 1 ? c[0].token = c[0].token.substring(1) : c.shift(), A += P.token, y = P.token), c.length > 0) {
                var N = l.getMode(c[0].token);
                N.len > 0 && (c.shift(), A += N.token, w = N.token);
              }
              if (g.standardKey(A, h.token, y, 0) === void 0)
                return r("Unsupported key signature: " + A, t, 0), v;
            }
            var T = g.deepCopyKey(o.key), q = !e && o.globalTranspose ? -o.globalTranspose : 0, I;
            if (e && (I = o.globalTransposeOrigKeySig), o.key = g.deepCopyKey(g.standardKey(A, h.token, y, q)), e && (o.globalTransposeOrigKeySig = I), o.key.mode = w, T && o.keywarn !== !1) {
              for (var C, B = 0; B < o.key.accidentals.length; B++)
                for (C = 0; C < T.accidentals.length; C++)
                  T.accidentals[C].note && o.key.accidentals[B].note.toLowerCase() === T.accidentals[C].note.toLowerCase() && (T.accidentals[C].note = null);
              for (C = 0; C < T.accidentals.length; C++)
                T.accidentals[C].note && (o.key.impliedNaturals || (o.key.impliedNaturals = []), o.key.impliedNaturals.push({ acc: "natural", note: T.accidentals[C].note }));
            }
            e || (o.globalKey = g.deepCopyKey(o.key)), u();
          }
          break;
      }
      if (c.length === 0 || (c[0].token === "exp" && c.shift(), c.length === 0) || (c[0].token === "oct" && c.shift(), c.length === 0)) return v;
      var R = l.getKeyAccidentals2(c);
      if (R.warn && r(R.warn, t, 0), R.accs) {
        v.foundKey || (v.foundKey = !0, o.key = { root: "none", acc: "", mode: "", accidentals: [] }), i(R.accs);
        for (var S = 0; S < R.accs.length; S++) {
          for (var k = !1, M = 0; M < o.key.accidentals.length && !k; M++)
            o.key.accidentals[M].note === R.accs[S].note && (k = !0, o.key.accidentals[M].acc !== R.accs[S].acc && (o.key.accidentals[M].acc = R.accs[S].acc, o.key.explicitAccidentals || (o.key.explicitAccidentals = []), o.key.explicitAccidentals.push(R.accs[S])));
          if (!k && (o.key.explicitAccidentals || (o.key.explicitAccidentals = []), o.key.explicitAccidentals.push(R.accs[S]), o.key.accidentals.push(R.accs[S]), o.key.impliedNaturals))
            for (var F = 0; F < o.key.impliedNaturals.length; F++)
              o.key.impliedNaturals[F].note === R.accs[S].note && o.key.impliedNaturals.splice(F, 1);
        }
        e || (o.globalKey = g.deepCopyKey(o.key)), u();
      }
      for (var L; c.length > 0; )
        switch (c[0].token) {
          case "m":
          case "middle":
            if (c.shift(), c.length === 0)
              return r("Expected = after middle", t, 0), v;
            if (L = c.shift(), L.token !== "=") {
              r("Expected = after middle", t, L.start);
              break;
            }
            if (c.length === 0)
              return r("Expected parameter after middle=", t, 0), v;
            var b = l.getPitchFromTokens(c);
            b.warn && r(b.warn, t, 0), b.position && (o.clef.verticalPos = b.position - 6);
            break;
          case "transpose":
            if (c.shift(), c.length === 0)
              return r("Expected = after transpose", t, 0), v;
            if (L = c.shift(), L.token !== "=") {
              r("Expected = after transpose", t, L.start);
              break;
            }
            if (c.length === 0)
              return r("Expected parameter after transpose=", t, 0), v;
            if (c[0].type !== "number") {
              r("Expected number after transpose", t, c[0].start);
              break;
            }
            o.clef.transpose = c[0].intt, c.shift();
            break;
          case "stafflines":
            if (c.shift(), c.length === 0)
              return r("Expected = after stafflines", t, 0), v;
            if (L = c.shift(), L.token !== "=") {
              r("Expected = after stafflines", t, L.start);
              break;
            }
            if (c.length === 0)
              return r("Expected parameter after stafflines=", t, 0), v;
            if (c[0].type !== "number") {
              r("Expected number after stafflines", t, c[0].start);
              break;
            }
            o.clef.stafflines = c[0].intt, c.shift();
            break;
          case "staffscale":
            if (c.shift(), c.length === 0)
              return r("Expected = after staffscale", t, 0), v;
            if (L = c.shift(), L.token !== "=") {
              r("Expected = after staffscale", t, L.start);
              break;
            }
            if (c.length === 0)
              return r("Expected parameter after staffscale=", t, 0), v;
            if (c[0].type !== "number") {
              r("Expected number after staffscale", t, c[0].start);
              break;
            }
            o.clef.staffscale = c[0].floatt, c.shift();
            break;
          case "octave":
            if (c.shift(), c.length === 0)
              return r("Expected = after octave", t, 0), v;
            if (L = c.shift(), L.token !== "=") {
              r("Expected = after octave", t, L.start);
              break;
            }
            if (c.length === 0)
              return r("Expected parameter after octave=", t, 0), v;
            if (c[0].type !== "number") {
              r("Expected number after octave", t, c[0].start);
              break;
            }
            o.octave = c[0].intt, c.shift();
            break;
          case "style":
            if (c.shift(), c.length === 0)
              return r("Expected = after style", t, 0), v;
            if (L = c.shift(), L.token !== "=") {
              r("Expected = after style", t, L.start);
              break;
            }
            if (c.length === 0)
              return r("Expected parameter after style=", t, 0), v;
            switch (c[0].token) {
              case "normal":
              case "harmonic":
              case "rhythm":
              case "x":
              case "triangle":
                o.style = c[0].token, c.shift();
                break;
              default:
                r("error parsing style element: " + c[0].token, t, c[0].start);
                break;
            }
            break;
          case "clef":
            if (c.shift(), c.length === 0)
              return r("Expected = after clef", t, 0), v;
            if (L = c.shift(), L.token !== "=") {
              r("Expected = after clef", t, L.start);
              break;
            }
            if (c.length === 0)
              return r("Expected parameter after clef=", t, 0), v;
          //break; yes, we want to fall through. That allows "clef=" to be optional.
          case "treble":
          case "bass":
          case "alto":
          case "tenor":
          case "perc":
          case "none":
            var x = c.shift();
            switch (x.token) {
              case "treble":
              case "tenor":
              case "alto":
              case "bass":
              case "perc":
              case "none":
                break;
              case "C":
                x.token = "alto";
                break;
              case "F":
                x.token = "bass";
                break;
              case "G":
                x.token = "treble";
                break;
              case "c":
                x.token = "alto";
                break;
              case "f":
                x.token = "bass";
                break;
              case "g":
                x.token = "treble";
                break;
              default:
                r("Expected clef name. Found " + x.token, t, x.start);
                break;
            }
            c.length > 0 && c[0].type === "number" && (x.token += c[0].token, c.shift()), c.length > 1 && (c[0].token === "-" || c[0].token === "+" || c[0].token === "^" || c[0].token === "_") && c[1].token === "8" && (x.token += c[0].token + c[1].token, c.shift(), c.shift()), o.clef = { type: x.token, verticalPos: p(x.token, 0) }, o.currentVoice && o.currentVoice.transpose !== void 0 && (o.clef.transpose = o.currentVoice.transpose), v.foundClef = !0;
            break;
          default:
            r("Unknown parameter: " + c[0].token, t, c[0].start), c.shift();
        }
      return v;
    };
    var n = function(t) {
      var e = o.voices[t];
      if (!(o.currentVoice && o.currentVoice.index === e.index && o.currentVoice.staffNum === e.staffNum))
        return o.currentVoice = e, e.key ? o.key = g.deepCopyKey(e.key) : o.globalKey && (o.key = g.deepCopyKey(o.globalKey)), a.setCurrentVoice(e.staffNum, e.index, t);
    };
    g.parseVoice = function(t, e, c) {
      var v = l.getMeat(t, e, c), h = v.start, y = v.end, w = l.getToken(t, h, y);
      if (w.length === 0) {
        r("Expected a voice id", t, h);
        return;
      }
      var A = !1;
      o.voices[w] === void 0 && (o.voices[w] = {}, A = !0, o.score_is_present && r("Can't have an unknown V: id when the %score directive is present", t, h)), h += w.length, h += l.eatWhiteSpace(t, h);
      for (var P = { startStaff: A }, N = function(b) {
        var x = l.getVoiceToken(t, h, y);
        x.warn !== void 0 ? r("Expected value for " + b + " in voice: " + x.warn, t, h) : x.err !== void 0 ? r("Expected value for " + b + " in voice: " + x.err, t, h) : x.token.length === 0 && t[h] !== '"' ? r("Expected value for " + b + " in voice", t, h) : P[b] = x.token, h += x.len;
      }, T = function(b, x, E) {
        var D = l.getVoiceToken(t, h, y);
        D.warn !== void 0 ? r("Expected value for " + x + " in voice: " + D.warn, t, h) : D.err !== void 0 ? r("Expected value for " + x + " in voice: " + D.err, t, h) : D.token.length === 0 && t[h] !== '"' ? r("Expected value for " + x + " in voice", t, h) : (D.token = parseFloat(D.token), o.voices[b][x] = D.token), h += D.len;
      }, q = function(b, x) {
        var E = l.getVoiceToken(t, h, y);
        if (E.warn !== void 0)
          r("Expected value for " + b + " in voice: " + E.warn, t, h);
        else if (E.err !== void 0)
          r("Expected value for " + b + " in voice: " + E.err, t, h);
        else if (E.token.length === 0 && t[h] !== '"')
          r("Expected value for " + b + " in voice", t, h);
        else
          return E.token;
        h += E.len;
      }, I = function(b, x) {
        var E = {
          _B: 2,
          _E: 9,
          _b: -10,
          _e: -3
        }, D = l.getVoiceToken(t, h, y);
        if (D.warn !== void 0)
          r("Expected one of (_B, _E, _b, _e) for " + x + " in voice: " + D.warn, t, h);
        else if (D.token.length === 0 && t[h] !== '"')
          r("Expected one of (_B, _E, _b, _e) for " + x + " in voice", t, h);
        else {
          var O = E[D.token];
          O ? o.voices[b][x] = O : r("Expected one of (_B, _E, _b, _e) for " + x + " in voice", t, h);
        }
        h += D.len;
      }; h < y; ) {
        var C = l.getVoiceToken(t, h, y);
        if (h += C.len, C.warn)
          r("Error parsing voice: " + C.warn, t, h);
        else {
          var B = null;
          switch (C.token) {
            case "clef":
            case "cl":
              N("clef");
              var R = 0;
              P.clef !== void 0 && (P.clef = P.clef.replace(/[',]/g, ""), P.clef.indexOf("+16") !== -1 && (R += 14, P.clef = P.clef.replace("+16", "")), P.verticalPos = p(P.clef, R));
              break;
            case "treble":
            case "bass":
            case "tenor":
            case "alto":
            case "perc":
            case "none":
            case "treble'":
            case "bass'":
            case "tenor'":
            case "alto'":
            case "none'":
            case "treble''":
            case "bass''":
            case "tenor''":
            case "alto''":
            case "none''":
            case "treble,":
            case "bass,":
            case "tenor,":
            case "alto,":
            case "none,":
            case "treble,,":
            case "bass,,":
            case "tenor,,":
            case "alto,,":
            case "none,,":
            // MAE 26 May 2025 Start of additional clefs
            case "treble+8":
            case "treble-8":
            case "treble^8":
            case "treble_8":
            case "treble1":
            case "treble2":
            case "treble3":
            case "treble4":
            case "treble5":
            case "bass+8":
            case "bass-8":
            case "bass^8":
            case "bass_8":
            case "bass+16":
            case "bass-16":
            case "bass^16":
            case "bass_16":
            case "bass1":
            case "bass2":
            case "bass3":
            case "bass4":
            case "bass5":
            case "tenor1":
            case "tenor2":
            case "tenor3":
            case "tenor4":
            case "tenor5":
            case "alto1":
            case "alto2":
            case "alto3":
            case "alto4":
            case "alto5":
            case "alto+8":
            case "alto-8":
            case "alto^8":
            case "alto_8":
              var S = 0;
              P.clef = C.token.replace(/[',]/g, ""), P.verticalPos = p(P.clef, S), o.voices[w].clef = C.token;
              break;
            case "staves":
            case "stave":
            case "stv":
              N("staves");
              break;
            case "brace":
            case "brc":
              N("brace");
              break;
            case "bracket":
            case "brk":
              N("bracket");
              break;
            case "name":
            case "nm":
              N("name");
              break;
            case "subname":
            case "sname":
            case "snm":
              N("subname");
              break;
            case "merge":
              P.startStaff = !1;
              break;
            case "stem":
            case "stems":
              B = l.getVoiceToken(t, h, y), B.warn !== void 0 ? r("Expected value for stems in voice: " + B.warn, t, h) : B.err !== void 0 ? r("Expected value for stems in voice: " + B.err, t, h) : B.token === "up" || B.token === "down" ? o.voices[w].stem = B.token : r("Expected up or down for voice stem", t, h), h += B.len;
              break;
            case "up":
            case "down":
              o.voices[w].stem = C.token;
              break;
            case "middle":
            case "m":
              N("verticalPos"), P.verticalPos = f(P.verticalPos).mid;
              break;
            case "gchords":
            case "gch":
              o.voices[w].suppressChords = !0, B = l.getVoiceToken(t, h, y), B.token === "0" && (h = h + B.len);
              break;
            case "space":
            case "spc":
              N("spacing");
              break;
            case "scale":
              T(w, "scale");
              break;
            case "score":
              I(w, "scoreTranspose");
              break;
            case "transpose":
              T(w, "transpose");
              break;
            case "stafflines":
              T(w, "stafflines");
              break;
            case "staffscale":
              T(w, "staffscale");
              break;
            case "octave":
              T(w, "octave");
              break;
            case "volume":
              T(w, "volume");
              break;
            case "cue":
              var k = q("cue");
              k === "on" ? o.voices[w].scale = 0.6 : o.voices[w].scale = 1;
              break;
            case "style":
              B = l.getVoiceToken(t, h, y), B.warn !== void 0 ? r("Expected value for style in voice: " + B.warn, t, h) : B.err !== void 0 ? r("Expected value for style in voice: " + B.err, t, h) : B.token === "normal" || B.token === "harmonic" || B.token === "rhythm" || B.token === "x" || B.token === "triangle" ? o.voices[w].style = B.token : r("Expected one of [normal, harmonic, rhythm, x, triangle] for voice style", t, h), h += B.len;
              break;
          }
        }
        h += l.eatWhiteSpace(t, h);
      }
      if ((P.startStaff || o.staves.length === 0) && (o.staves.push({ index: o.staves.length, meter: o.origMeter }), o.score_is_present || (o.staves[o.staves.length - 1].numVoices = 0)), o.voices[w].staffNum === void 0) {
        o.voices[w].staffNum = o.staves.length - 1;
        var M = 0;
        for (var F in o.voices)
          o.voices.hasOwnProperty(F) && o.voices[F].staffNum === o.voices[w].staffNum && M++;
        o.voices[w].index = M - 1;
      }
      var L = o.staves[o.voices[w].staffNum];
      return o.score_is_present || L.numVoices++, P.clef && (L.clef = { type: P.clef, verticalPos: P.verticalPos }), P.spacing && (L.spacing_below_offset = P.spacing), P.verticalPos && (L.verticalPos = P.verticalPos), P.name && (L.name ? L.name.push(P.name) : L.name = [P.name]), P.subname && (L.subname ? L.subname.push(P.subname) : L.subname = [P.subname]), n(w);
    };
  })(), at = g, at;
}
var nt, da;
function Ps() {
  if (da) return nt;
  da = 1;
  var _ = _e(), m = Ir(), g = Fr(), l = function(r, o, a, s, p) {
    this.reset = function(f, i, n, t) {
      g.initialize(f, i, n, t, p), m.initialize(f, i, n, t, p);
    }, this.reset(r, o, a, s), this.setTitle = function(f, i) {
      a.hasMainTitle ? p.addSubtitle(f, { startChar: a.iChar, endChar: a.iChar + i + 2 }) : (p.addMetaText("title", f, { startChar: a.iChar, endChar: a.iChar + i + 2 }), a.hasMainTitle = !0);
    }, this.setMeter = function(f) {
      if (f = r.stripComment(f), f === "C")
        return a.havent_set_length === !0 && (a.default_length = 0.125, a.havent_set_length = !1), { type: "common_time" };
      if (f === "C|")
        return a.havent_set_length === !0 && (a.default_length = 0.125, a.havent_set_length = !1), { type: "cut_time" };
      if (f === "o")
        return a.havent_set_length === !0 && (a.default_length = 0.125, a.havent_set_length = !1), { type: "tempus_perfectum" };
      if (f === "c")
        return a.havent_set_length === !0 && (a.default_length = 0.125, a.havent_set_length = !1), { type: "tempus_imperfectum" };
      if (f === "o.")
        return a.havent_set_length === !0 && (a.default_length = 0.125, a.havent_set_length = !1), { type: "tempus_perfectum_prolatio" };
      if (f === "c.")
        return a.havent_set_length === !0 && (a.default_length = 0.125, a.havent_set_length = !1), { type: "tempus_imperfectum_prolatio" };
      if (f.length === 0 || f.toLowerCase() === "none")
        return a.havent_set_length === !0 && (a.default_length = 0.125, a.havent_set_length = !1), null;
      var i = r.tokenize(f, 0, f.length);
      try {
        var n = function() {
          var y = { value: 0, num: "" }, w = i.shift();
          for (w.token === "(" && (w = i.shift()); ; ) {
            if (w.type !== "number") throw "Expected top number of meter";
            if (y.value += parseInt(w.token), y.num += w.token, i.length === 0 || i[0].token === "/") return y;
            if (w = i.shift(), w.token === ")") {
              if (i.length === 0 || i[0].token === "/") return y;
              throw "Unexpected paren in meter";
            }
            if (w.token !== "." && w.token !== "+" || (y.num += w.token, i.length === 0)) throw "Expected top number of meter";
            w = i.shift();
          }
          return y;
        }, t = function() {
          var y = n();
          if (i.length === 0) return y;
          var w = i.shift();
          if (w.token !== "/") throw "Expected slash in meter";
          if (w = i.shift(), w.type !== "number") throw "Expected bottom number of meter";
          return y.den = w.token, y.value = y.value / parseInt(y.den), y;
        };
        if (i.length === 0) throw "Expected meter definition in M: line";
        for (var e = { type: "specified", value: [] }, c = 0; ; ) {
          var v = t();
          c += v.value;
          var h = { num: v.num };
          if (v.den !== void 0 && (h.den = v.den), e.value.push(h), i.length === 0) break;
        }
        return a.havent_set_length === !0 && (a.default_length = c < 0.75 ? 0.0625 : 0.125, a.havent_set_length = !1), e;
      } catch (y) {
        o(y, f, 0);
      }
      return null;
    }, this.calcTempo = function(f) {
      var i = 0.25;
      a.meter && a.meter.type === "specified" ? i = 1 / parseInt(a.meter.value[0].den) : a.origMeter && a.origMeter.type === "specified" && (i = 1 / parseInt(a.origMeter.value[0].den));
      for (var n = 0; n < f.duration; n++)
        f.duration[n] = i * f.duration[n];
      return f;
    }, this.resolveTempo = function() {
      a.tempo && (this.calcTempo(a.tempo), s.metaText.tempo = a.tempo, delete a.tempo);
    }, this.addUserDefinition = function(f, i, n) {
      var t = f.indexOf("=", i);
      if (t === -1) {
        o("Need an = in a macro definition", f, i);
        return;
      }
      var e = _.strip(f.substring(i, t)), c = _.strip(f.substring(t + 1));
      if (e.length !== 1) {
        o("Macro definitions can only be one character", f, i);
        return;
      }
      var v = "HIJKLMNOPQRSTUVWXYhijklmnopqrstuvw~";
      if (v.indexOf(e) === -1) {
        o("Macro definitions must be H-Y, h-w, or tilde", f, i);
        return;
      }
      if (c.length === 0) {
        o("Missing macro definition", f, i);
        return;
      }
      a.macros === void 0 && (a.macros = {}), a.macros[e] = c;
    }, this.setDefaultLength = function(f, i, n) {
      var t = f.substring(i, n).replace(/ /g, ""), e = t.split("/");
      if (e.length === 2) {
        var c = parseInt(e[0]), v = parseInt(e[1]);
        v > 0 && (a.default_length = c / v, a.havent_set_length = !1);
      } else e.length === 1 && e[0] === "1" && (a.default_length = 1, a.havent_set_length = !1);
    };
    var u = {
      larghissimo: 20,
      adagissimo: 24,
      sostenuto: 28,
      grave: 32,
      largo: 40,
      lento: 50,
      larghetto: 60,
      adagio: 68,
      adagietto: 74,
      andante: 80,
      andantino: 88,
      "marcia moderato": 84,
      "andante moderato": 100,
      moderato: 112,
      allegretto: 116,
      "allegro moderato": 120,
      allegro: 126,
      animato: 132,
      agitato: 140,
      veloce: 148,
      "mosso vivo": 156,
      vivace: 164,
      vivacissimo: 172,
      allegrissimo: 176,
      presto: 184,
      prestissimo: 210
    };
    this.setTempo = function(f, i, n, t) {
      try {
        var e = r.tokenize(f, i, n);
        if (e.length === 0) throw "Missing parameter in Q: field";
        var c = { startChar: t + i - 2, endChar: t + n }, v = !0, h = e.shift();
        if (h.type === "quote" && (c.preString = h.token, h = e.shift(), e.length === 0))
          return u[c.preString.toLowerCase()] && (c.bpm = u[c.preString.toLowerCase()], c.suppressBpm = !0), { type: "immediate", tempo: c };
        if (h.type === "alpha" && h.token === "C") {
          if (e.length === 0) throw "Missing tempo after C in Q: field";
          if (h = e.shift(), h.type === "punct" && h.token === "=") {
            if (e.length === 0) throw "Missing tempo after = in Q: field";
            if (h = e.shift(), h.type !== "number") throw "Expected number after = in Q: field";
            c.duration = [1], c.bpm = parseInt(h.token);
          } else if (h.type === "number") {
            if (c.duration = [parseInt(h.token)], e.length === 0) throw "Missing = after duration in Q: field";
            if (h = e.shift(), h.type !== "punct" || h.token !== "=") throw "Expected = after duration in Q: field";
            if (e.length === 0) throw "Missing tempo after = in Q: field";
            if (h = e.shift(), h.type !== "number") throw "Expected number after = in Q: field";
            c.bpm = parseInt(h.token);
          } else throw "Expected number or equal after C in Q: field";
        } else if (h.type === "number") {
          var y = parseInt(h.token);
          if (e.length === 0 || e[0].type === "quote")
            c.duration = [1], c.bpm = y;
          else {
            if (v = !1, h = e.shift(), h.type !== "punct" && h.token !== "/" || (h = e.shift(), h.type !== "number")) throw "Expected fraction in Q: field";
            var w = parseInt(h.token);
            for (c.duration = [y / w]; e.length > 0 && e[0].token !== "=" && e[0].type !== "quote"; ) {
              if (h = e.shift(), h.type !== "number" || (y = parseInt(h.token), h = e.shift(), h.type !== "punct" && h.token !== "/") || (h = e.shift(), h.type !== "number")) throw "Expected fraction in Q: field";
              w = parseInt(h.token), c.duration.push(y / w);
            }
            if (h = e.shift(), h.type !== "punct" && h.token !== "=") throw "Expected = in Q: field";
            if (h = e.shift(), h.type !== "number") throw "Expected tempo in Q: field";
            c.bpm = parseInt(h.token);
          }
        } else throw "Unknown value in Q: field";
        if (e.length !== 0 && (h = e.shift(), h.type === "quote" && (c.postString = h.token, h = e.shift()), e.length !== 0))
          throw "Unexpected string at end of Q: field";
        return a.printTempo === !1 && (c.suppress = !0), { type: v ? "delaySet" : "immediate", tempo: c };
      } catch (A) {
        return o(A, f, i), { type: "none" };
      }
    }, this.letter_to_inline_header = function(f, i, n) {
      var t = !1, e = r.eatWhiteSpace(f, i);
      if (i += e, f.length >= i + 5 && f[i] === "[" && f[i + 2] === ":") {
        var c = f.indexOf("]", i), v = a.iChar + i, h = a.iChar + c + 1;
        switch (f.substring(i, i + 3)) {
          case "[I:":
            var y = m.addDirective(f.substring(i + 3, c));
            return y && o(y, f, i), [c - i + 1 + e];
          case "[M:":
            var w = this.setMeter(f.substring(i + 3, c));
            return n && a.currentVoice && w ? a.staves[a.currentVoice.staffNum].meter = w : p.hasBeginMusic() && w ? p.appendStartingElement("meter", v, h, w) : a.meter = w, [c - i + 1 + e];
          case "[K:":
            var A = g.parseKey(f.substring(i + 3, c), !0);
            return A.foundClef && p.hasBeginMusic() && p.appendStartingElement("clef", v, h, a.clef), A.foundKey && p.hasBeginMusic() && p.appendStartingElement("key", v, h, g.fixKey(a.clef, a.key)), [c - i + 1 + e];
          case "[P:":
            var P = m.parseFontChangeLine(f.substring(i + 3, c));
            return n || s.lines.length <= s.lineNum ? a.partForNextLine = { title: P, startChar: v, endChar: h } : p.appendElement("part", v, h, { title: P }), [c - i + 1 + e];
          case "[L:":
            return this.setDefaultLength(f, i + 3, c), [c - i + 1 + e];
          case "[Q:":
            if (c > 0) {
              var N = this.setTempo(f, i + 3, c, a.iChar);
              return N.type === "delaySet" ? p.hasBeginMusic() ? p.appendElement("tempo", v, h, this.calcTempo(N.tempo)) : a.tempoForNextLine = ["tempo", v, h, this.calcTempo(N.tempo)] : N.type === "immediate" && (!n && p.hasBeginMusic() ? p.appendElement("tempo", v, h, N.tempo) : a.tempoForNextLine = ["tempo", v, h, N.tempo]), [c - i + 1 + e, f[i + 1], f.substring(i + 3, c)];
            }
            break;
          case "[V:":
            if (c > 0)
              return t = g.parseVoice(f, i + 3, c), [c - i + 1 + e, f[i + 1], f.substring(i + 3, c), t];
            break;
          case "[r:":
            return [c - i + 1 + e];
        }
      }
      return [0];
    }, this.letter_to_body_header = function(f, i) {
      var n = !1;
      if (f.length >= i + 3)
        switch (f.substring(i, i + 2)) {
          case "I:":
            var t = m.addDirective(f.substring(i + 2));
            return t && o(t, f, i), [f.length];
          case "M:":
            var e = this.setMeter(f.substring(i + 2));
            return p.hasBeginMusic() && e && p.appendStartingElement("meter", a.iChar + i, a.iChar + f.length, e), [f.length];
          case "K:":
            var c = g.parseKey(f.substring(i + 2), p.hasBeginMusic());
            return c.foundClef && p.hasBeginMusic() && a.keywarn !== !1 && p.appendStartingElement("clef", a.iChar + i, a.iChar + f.length, a.clef), c.foundKey && p.hasBeginMusic() && a.keywarn !== !1 && p.appendStartingElement("key", a.iChar + i, a.iChar + f.length, g.fixKey(a.clef, a.key)), [f.length];
          case "P:":
            return p.hasBeginMusic() && p.appendElement("part", a.iChar + i, a.iChar + f.length, { title: f.substring(i + 2) }), [f.length];
          case "L:":
            return this.setDefaultLength(f, i + 2, f.length), [f.length];
          case "Q:":
            var v = f.indexOf("", i + 2);
            v === -1 && (v = f.length);
            var h = this.setTempo(f, i + 2, v, a.iChar);
            return h.type === "delaySet" ? p.appendElement("tempo", a.iChar + i, a.iChar + f.length, this.calcTempo(h.tempo)) : h.type === "immediate" && p.appendElement("tempo", a.iChar + i, a.iChar + f.length, h.tempo), [v, f[i], _.strip(f.substring(i + 2))];
          case "V:":
            return n = g.parseVoice(f, i + 2, f.length), [f.length, f[i], _.strip(f.substring(i + 2)), n];
        }
      return [0];
    };
    var d = {
      A: "author",
      B: "book",
      C: "composer",
      D: "discography",
      F: "url",
      G: "group",
      I: "instruction",
      N: "notes",
      O: "origin",
      R: "rhythm",
      S: "source",
      W: "unalignedWords",
      Z: "transcription"
    };
    this.parseHeader = function(f) {
      var i = d[f[0]], n = f.length - 2, t = r.translateString(r.stripComment(f.substring(2)));
      if (i === "unalignedWords" || i === "notes")
        p.addMetaTextArray(i, m.parseFontChangeLine(t), { startChar: a.iChar, endChar: a.iChar + f.length });
      else if (i !== void 0)
        p.addMetaText(i, m.parseFontChangeLine(t), { startChar: a.iChar, endChar: a.iChar + f.length });
      else {
        var e = a.iChar, c = e + f.length;
        switch (f[0]) {
          case "H":
            for (p.addMetaTextArray("history", m.parseFontChangeLine(t), { startChar: a.iChar, endChar: a.iChar + f.length }), f = r.peekLine(); f && f[1] !== ":"; )
              r.nextLine(), p.addMetaTextArray("history", m.parseFontChangeLine(r.translateString(r.stripComment(f))), { startChar: a.iChar, endChar: a.iChar + f.length }), f = r.peekLine();
            break;
          case "K":
            this.resolveTempo();
            var v = g.parseKey(f.substring(2), !1);
            !a.is_in_header && p.hasBeginMusic() && a.keywarn !== !1 && (v.foundClef && p.appendStartingElement("clef", e, c, a.clef), v.foundKey && p.appendStartingElement("key", e, c, g.fixKey(a.clef, a.key))), a.is_in_header = !1;
            break;
          case "L":
            this.setDefaultLength(f, 2, f.length);
            break;
          case "M":
            a.origMeter = a.meter = this.setMeter(f.substring(2));
            break;
          case "P":
            a.is_in_header ? p.addMetaText("partOrder", m.parseFontChangeLine(t), { startChar: a.iChar, endChar: a.iChar + f.length }) : a.partForNextLine = { title: t, startChar: e, endChar: c };
            break;
          case "Q":
            var h = this.setTempo(f, 2, f.length, a.iChar);
            h.type === "delaySet" ? a.tempo = h.tempo : h.type === "immediate" && (s.metaText.tempo ? a.tempoForNextLine = ["tempo", e, c, h.tempo] : s.metaText.tempo = h.tempo);
            break;
          case "T":
            a.titlecaps && (t = t.toUpperCase()), this.setTitle(m.parseFontChangeLine(r.theReverser(t)), n);
            break;
          case "U":
            this.addUserDefinition(f, 2, f.length);
            break;
          case "V":
            if (g.parseVoice(f, 2, f.length), !a.is_in_header)
              return { newline: !0 };
            break;
          case "s":
            return { symbols: !0 };
          case "w":
            return { words: !0 };
          case "X":
            break;
          case "E":
          case "m":
            o("Ignored header", f, 0);
            break;
          default:
            return { regular: !0 };
        }
      }
      return {};
    };
  };
  return nt = l, nt;
}
var ke = {}, pa;
function Ls() {
  return pa || (pa = 1, ke.legalAccents = [
    "trill",
    "trillh",
    "lowermordent",
    "uppermordent",
    "mordent",
    "pralltriller",
    "accent",
    "fermata",
    "invertedfermata",
    "tenuto",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "+",
    "wedge",
    "open",
    "thumb",
    "snap",
    "turn",
    "roll",
    "breath",
    "shortphrase",
    "mediumphrase",
    "longphrase",
    "segno",
    "coda",
    "D.S.",
    "D.C.",
    "fine",
    "beambr1",
    "beambr2",
    "slide",
    "marcato",
    "upbow",
    "downbow",
    "/",
    "//",
    "///",
    "////",
    "trem1",
    "trem2",
    "trem3",
    "trem4",
    "turnx",
    "invertedturn",
    "invertedturnx",
    "trill(",
    "trill)",
    "arpeggio",
    "xstem",
    "mark",
    "umarcato",
    "style=normal",
    "style=harmonic",
    "style=rhythm",
    "style=x",
    "style=triangle",
    "D.C.alcoda",
    "D.C.alfine",
    "D.S.alcoda",
    "D.S.alfine",
    "editorial",
    "courtesy"
  ], ke.volumeDecorations = [
    "p",
    "pp",
    "f",
    "ff",
    "mf",
    "mp",
    "ppp",
    "pppp",
    "fff",
    "ffff",
    "sfz"
  ], ke.dynamicDecorations = [
    "crescendo(",
    "crescendo)",
    "diminuendo(",
    "diminuendo)",
    "glissando(",
    "glissando)",
    "~(",
    "~)"
  ], ke.accentPseudonyms = [
    ["<", "accent"],
    [">", "accent"],
    ["tr", "trill"],
    ["plus", "+"],
    ["emphasis", "accent"],
    ["^", "umarcato"],
    ["marcato", "umarcato"]
  ], ke.accentDynamicPseudonyms = [
    ["<(", "crescendo("],
    ["<)", "crescendo)"],
    [">(", "diminuendo("],
    [">)", "diminuendo)"]
  ], ke.nonDecorations = "ABCDEFGabcdefgxyzZ[]|^_{", ke.durations = [
    0.5,
    0.75,
    0.875,
    0.9375,
    0.96875,
    0.984375,
    0.25,
    0.375,
    0.4375,
    0.46875,
    0.484375,
    0.4921875,
    0.125,
    0.1875,
    0.21875,
    0.234375,
    0.2421875,
    0.24609375,
    0.0625,
    0.09375,
    0.109375,
    0.1171875,
    0.12109375,
    0.123046875,
    0.03125,
    0.046875,
    0.0546875,
    0.05859375,
    0.060546875,
    0.0615234375,
    0.015625,
    0.0234375,
    0.02734375,
    0.029296875,
    0.0302734375,
    0.03076171875
  ], ke.pitches = {
    A: 5,
    B: 6,
    C: 0,
    D: 1,
    E: 2,
    F: 3,
    G: 4,
    a: 12,
    b: 13,
    c: 7,
    d: 8,
    e: 9,
    f: 10,
    g: 11
  }, ke.rests = {
    x: "invisible",
    X: "invisible-multimeasure",
    y: "spacer",
    z: "rest",
    Z: "multimeasure"
  }, ke.accMap = {
    dblflat: "__",
    flat: "_",
    natural: "=",
    sharp: "^",
    dblsharp: "^^",
    quarterflat: "_/",
    quartersharp: "^/"
  }, ke.tripletQ = {
    2: 3,
    3: 2,
    4: 3,
    5: 2,
    // TODO-PER: not handling 6/8 rhythm yet
    6: 2,
    7: 2,
    // TODO-PER: not handling 6/8 rhythm yet
    8: 3,
    9: 2
    // TODO-PER: not handling 6/8 rhythm yet
  }), ke;
}
var it, va;
function qs() {
  if (va) return it;
  va = 1;
  var _ = Fr(), m = Qi(), g, l, r, o, a, s, {
    legalAccents: p,
    volumeDecorations: u,
    dynamicDecorations: d,
    accentPseudonyms: f,
    accentDynamicPseudonyms: i,
    nonDecorations: n,
    durations: t,
    pitches: e,
    rests: c,
    accMap: v,
    tripletQ: h
  } = Ls(), y = function(b, x, E, D, O, z) {
    g = b, l = x, r = E, o = D, a = O, s = z, this.lineContinuation = !1;
  }, w = function(b, x, E) {
    if (b.inTie[x] === void 0)
      return !1;
    var D = b.currentVoice ? b.currentVoice.staffNum * 100 + b.currentVoice.index : 0;
    return !!(b.inTie[x][D] && (E.pitches !== void 0 || E.rest.type !== "spacer"));
  }, A = {};
  y.prototype.parseMusic = function(b) {
    s.resolveTempo(), r.is_in_header = !1;
    for (var x = 0, E = r.iChar; g.isWhiteSpace(b[x]) && x < b.length; )
      x++;
    if (!(x === b.length || b[x] === "%")) {
      var D = r.start_new_line;
      r.continueall === void 0 ? r.start_new_line = !0 : r.start_new_line = !1;
      var O = 0, z = s.letter_to_body_header(b, x);
      z[0] > 0 && (x += z[0], z[1] === "V" && this.startNewLine());
      for (var H = 0; x < b.length; ) {
        var $ = x;
        if (b[x] === "%")
          break;
        var Q = s.letter_to_inline_header(b, x, D);
        if (Q[0] > 0)
          x += Q[0], Q[1] === "V" && (D = !0);
        else {
          (!a.hasBeginMusic() || D && !this.lineContinuation) && (this.startNewLine(), D = !1);
          for (var W; ; )
            if (W = g.eatWhiteSpace(b, x), W > 0 && (x += W), x > 0 && b[x - 1] === "" && (W = s.letter_to_body_header(b, x), W[0] > 0 && (W[1] === "V" && this.startNewLine(), x = W[0], r.start_new_line = !1)), W = B(b, x), W[0] > 0 && (x += W[0]), W = N(b, x), W[0] > 0) {
              A.chord || (A.chord = []);
              var ne = g.translateString(W[1]);
              ne = ne.replace(/;/g, `
`);
              for (var J = !1, te = 0; te < A.chord.length; te++)
                A.chord[te].position === W[2] && (J = !0, A.chord[te].name += `
` + ne);
              J === !1 && (W[2] === null && W[3] ? A.chord.push({ name: ne, rel_position: W[3] }) : A.chord.push({ name: ne, position: W[2] })), x += W[0];
              var U = g.skipWhiteSpace(b.substring(x));
              U > 0 && (A.force_end_beam_last = !0), x += U;
            } else if (n.indexOf(b[x]) === -1 ? W = C(b, x) : W = [0], W[0] > 0)
              W[1] === null ? x + 1 < b.length && this.startNewLine() : W[1].length > 0 && (W[1].indexOf("style=") === 0 ? A.style = W[1].substring(6) : W[1].indexOf("class=") === 0 ? A.extraClass = W[1].substring(6) : (A.decoration === void 0 && (A.decoration = []), W[1] === "beambr1" ? A.beambr = 1 : W[1] === "beambr2" ? A.beambr = 2 : A.decoration.push(W[1]))), x += W[0];
            else if (W = T(b, x), W[0] > 0)
              A.gracenotes = W[1], x += W[0];
            else
              break;
          if (W = R(b, x), W[0] > 0) {
            H = 0, A.gracenotes !== void 0 && (A.rest = { type: "spacer" }, A.duration = 0.125, r.addFormattingOptions(A, o.formatting, "note"), a.appendElement("note", E + x, E + x + W[0], A), r.measureNotEmpty = !0, A = {});
            var re = { type: W[1] };
            re.type.length === 0 ? l("Unknown bar type", b, x) : (r.inEnding && re.type !== "bar_thin" && (re.endEnding = !0, r.inEnding = !1), W[2] && (re.startEnding = W[2], r.inEnding && (re.endEnding = !0), r.inEnding = !0, W[1] === "bar_right_repeat" ? r.restoreStartEndingHoldOvers() : r.duplicateStartEndingHoldOvers()), A.decoration !== void 0 && (re.decoration = A.decoration), A.chord !== void 0 && (re.chord = A.chord), re.startEnding && r.barFirstEndingNum === void 0 ? r.barFirstEndingNum = r.currBarNumber : re.startEnding && re.endEnding && r.barFirstEndingNum ? r.currBarNumber = r.barFirstEndingNum : re.endEnding && (r.barFirstEndingNum = void 0), re.type !== "bar_invisible" && r.measureNotEmpty && L() && (r.currBarNumber++, r.barNumbers && r.currBarNumber % r.barNumbers === 0 && (re.barNumber = r.currBarNumber)), r.addFormattingOptions(A, o.formatting, "bar"), a.appendElement("bar", E + $, E + x + W[0], re), r.measureNotEmpty = !1, A = {}), x += W[0];
          } else if (b[x] === "&")
            W = q(b, x), W[0] > 0 && (a.appendElement("overlay", E, E + 1, {}), x += 1, H++);
          else {
            if (W = S(b, x), W.consumed > 0 && (W.startSlur !== void 0 && (A.startSlur = W.startSlur), W.dottedSlur && (A.dottedSlur = !0), W.triplet !== void 0 && (O > 0 ? l("Can't nest triplets", b, x) : (A.startTriplet = W.triplet, A.tripletMultiplier = W.tripletQ / W.triplet, A.tripletR = W.num_notes, O = W.num_notes === void 0 ? W.triplet : W.num_notes)), x += W.consumed), b[x] === "[") {
              x++;
              for (var V = null, oe = !1, ce = !1; !ce; ) {
                var ue = C(b, x);
                ue[0] > 0 && (x += ue[0]);
                var fe = M(b, x, {}, !1);
                if (fe !== null && fe.pitch !== void 0)
                  ue[0] > 0 && ue[1].indexOf("style=") !== 0 && (A.decoration === void 0 && (A.decoration = []), A.decoration.push(ue[1])), fe.end_beam && (A.end_beam = !0, delete fe.end_beam), A.pitches === void 0 ? (A.duration = fe.duration, A.pitches = [fe]) : A.pitches.push(fe), delete fe.duration, ue[0] > 0 && ue[1].indexOf("style=") === 0 && (A.pitches[A.pitches.length - 1].style = ue[1].substr(6)), r.inTieChord[A.pitches.length] && (fe.endTie = !0, r.inTieChord[A.pitches.length] = void 0), fe.startTie && (r.inTieChord[A.pitches.length] = !0), x = fe.endChar, delete fe.endChar;
                else if (b[x] === " ")
                  l("Spaces are not allowed in chords", b, x), x++;
                else {
                  if (x < b.length && b[x] === "]") {
                    x++, r.next_note_duration !== 0 && (A.duration = A.duration * r.next_note_duration, r.next_note_duration = 0), w(r, H, A) && (A.pitches.forEach(function(K) {
                      K.endTie = !0;
                    }), P(r, H, !1)), O > 0 && !(A.rest && A.rest.type === "spacer") && (O--, O === 0 && (A.endTriplet = !0));
                    for (var be = !1; x < b.length && !be; ) {
                      switch (b[x]) {
                        case " ":
                        case "	":
                          k(A);
                          break;
                        case ")":
                          A.endSlur === void 0 ? A.endSlur = 1 : A.endSlur++;
                          break;
                        case "-":
                          A.pitches.forEach(function(K) {
                            K.startTie = {};
                          }), P(r, H, !0);
                          break;
                        case ">":
                        case "<":
                          var ge = F(b, x);
                          x += ge[0] - 1, r.next_note_duration = ge[2], V ? V = V * ge[1] : V = ge[1];
                          break;
                        case "1":
                        case "2":
                        case "3":
                        case "4":
                        case "5":
                        case "6":
                        case "7":
                        case "8":
                        case "9":
                        case "/":
                          var ye = g.getFraction(b, x);
                          V = ye.value, x = ye.index;
                          var Y = b[x];
                          Y === " " && (oe = !0), Y === "-" || Y === ")" || Y === " " || Y === "<" || Y === ">" ? x-- : be = !0;
                          break;
                        case "0":
                          V = 0;
                          break;
                        default:
                          be = !0;
                          break;
                      }
                      be || x++;
                    }
                  } else
                    l("Expected ']' to end the chords", b, x);
                  A.pitches !== void 0 && (V !== null && (A.duration = A.duration * V, oe && k(A)), r.addFormattingOptions(A, o.formatting, "note"), a.appendElement("note", E + $, E + x, A), r.measureNotEmpty = !0, A = {}), ce = !0;
                }
              }
            } else {
              var j = {}, G = M(b, x, j, !0);
              if (j.endTie !== void 0 && P(r, H, !0), G !== null) {
                G.pitch !== void 0 ? (A.pitches = [{}], G.accidental !== void 0 && (A.pitches[0].accidental = G.accidental), A.pitches[0].pitch = G.pitch, A.pitches[0].name = G.name, (G.midipitch || G.midipitch === 0) && (A.pitches[0].midipitch = G.midipitch), G.endSlur !== void 0 && (A.pitches[0].endSlur = G.endSlur), G.endTie !== void 0 && (A.pitches[0].endTie = G.endTie), G.startSlur !== void 0 && (A.pitches[0].startSlur = G.startSlur), A.startSlur !== void 0 && (A.pitches[0].startSlur = A.startSlur), A.dottedSlur !== void 0 && (A.pitches[0].dottedSlur = !0), G.startTie !== void 0 && (A.pitches[0].startTie = G.startTie), A.startTie !== void 0 && (A.pitches[0].startTie = A.startTie)) : (A.rest = G.rest, G.rest.type === "multimeasure" && L() && (r.currBarNumber += G.rest.text - 1), G.endSlur !== void 0 && (A.endSlur = G.endSlur), G.endTie !== void 0 && (A.rest.endTie = G.endTie), G.startSlur !== void 0 && (A.startSlur = G.startSlur), G.startTie !== void 0 && (A.rest.startTie = G.startTie), A.startTie !== void 0 && (A.rest.startTie = A.startTie)), G.chord !== void 0 && (A.chord = G.chord), G.duration !== void 0 && (A.duration = G.duration), G.decoration !== void 0 && (A.decoration = G.decoration), G.graceNotes !== void 0 && (A.graceNotes = G.graceNotes), delete A.startSlur, delete A.dottedSlur, w(r, H, A) && (A.pitches !== void 0 ? A.pitches[0].endTie = !0 : A.rest.type !== "spacer" && (A.rest.endTie = !0), P(r, H, !1)), (G.startTie || A.startTie) && P(r, H, !0), x = G.endChar, O > 0 && !(G.rest && G.rest.type === "spacer") && (O--, O === 0 && (A.endTriplet = !0)), G.end_beam && k(A), A.rest && A.rest.type === "rest" && A.duration === 1 && I(r) <= 1 && (A.rest.type = "whole", A.duration = I(r)), A.duration < 1 && t.indexOf(A.duration) === -1 && A.duration !== 0 && (!A.rest || A.rest.type !== "spacer") && l("Duration not representable: " + b.substring($, x), b, x), r.addFormattingOptions(A, o.formatting, "note");
                var X = a.appendElement("note", E + $, E + x, A);
                X || (this.startNewLine(), a.appendElement("note", E + $, E + x, A)), r.measureNotEmpty = !0, A = {};
              }
            }
            x === $ && (b[x] !== " " && b[x] !== "`" && l("Unknown character ignored", b, x), x++);
          }
        }
      }
      this.lineContinuation = b.indexOf("") >= 0 || z[0] > 0, this.lineContinuation || (A = {});
    }
  };
  var P = function(b, x, E) {
    var D = b.currentVoice ? b.currentVoice.staffNum * 100 + b.currentVoice.index : 0;
    b.inTie[x] === void 0 && (b.inTie[x] = []), b.inTie[x][D] = E;
  }, N = function(b, x) {
    if (b[x] === '"') {
      var E = g.getBrackettedSubstring(b, x, 5);
      if (E[2] || l("Missing the closing quote while parsing the chord symbol", b, x), E[0] > 0 && E[1].length > 0 && E[1][0] === "^")
        E[1] = E[1].substring(1), E[2] = "above";
      else if (E[0] > 0 && E[1].length > 0 && E[1][0] === "_")
        E[1] = E[1].substring(1), E[2] = "below";
      else if (E[0] > 0 && E[1].length > 0 && E[1][0] === "<")
        E[1] = E[1].substring(1), E[2] = "left";
      else if (E[0] > 0 && E[1].length > 0 && E[1][0] === ">")
        E[1] = E[1].substring(1), E[2] = "right";
      else if (E[0] > 0 && E[1].length > 0 && E[1][0] === "@") {
        E[1] = E[1].substring(1);
        var D = g.getFloat(E[1]);
        if (D.digits === 0)
          return l("Missing first position in absolutely positioned annotation.", b, x), E[1] = E[1].replace("@", ""), E[2] = "above", E;
        if (E[1] = E[1].substring(D.digits), E[1][0] !== ",")
          return l("Missing comma absolutely positioned annotation.", b, x), E[1] = E[1].replace("@", ""), E[2] = "above", E;
        E[1] = E[1].substring(1);
        var O = g.getFloat(E[1]);
        if (O.digits === 0)
          return l("Missing second position in absolutely positioned annotation.", b, x), E[1] = E[1].replace("@", ""), E[2] = "above", E;
        E[1] = E[1].substring(O.digits);
        var z = g.skipWhiteSpace(E[1]);
        E[1] = E[1].substring(z), E[2] = null, E[3] = {
          x: D.value,
          y: O.value
        };
      } else
        r.freegchord !== !0 && (E[1] = E[1].replace(/([ABCDEFG0-9])b/g, "$1♭"), E[1] = E[1].replace(/([ABCDEFG0-9])#/g, "$1♯"), E[1] = E[1].replace(/^([ABCDEFG])([♯♭]?)o([^A-Za-z])/g, "$1$2°$3"), E[1] = E[1].replace(/^([ABCDEFG])([♯♭]?)o$/g, "$1$2°"), E[1] = E[1].replace(/^([ABCDEFG])([♯♭]?)0([^A-Za-z])/g, "$1$2ø$3"), E[1] = E[1].replace(/^([ABCDEFG])([♯♭]?)\^([^A-Za-z])/g, "$1$2∆$3")), E[2] = "default", E[1] = m.chordName(r, E[1]);
      return E;
    }
    return [0, ""];
  }, T = function(b, x) {
    if (b[x] === "{") {
      var E = g.getBrackettedSubstring(b, x, 1, "}");
      E[2] || l("Missing the closing '}' while parsing grace note", b, x), b[x + E[0]] === ")" && (E[0]++, E[1] += ")");
      for (var D = [], O = 0, z = !1; O < E[1].length; ) {
        var H = !1;
        E[1][O] === "/" && (H = !0, O++);
        var $ = M(E[1], O, {}, !1);
        $ !== null ? ($.duration = $.duration / (r.default_length * 8), H && ($.acciaccatura = !0), $.rest ? l("Rests not allowed as grace notes '" + E[1][O] + "' while parsing grace note", b, x) : D.push($), z && ($.endTie = !0, z = !1), $.startTie && (z = !0), O = $.endChar, delete $.endChar, $.end_beam && ($.endBeam = !0, delete $.end_beam)) : (E[1][O] === " " ? D.length > 0 && (D[D.length - 1].endBeam = !0) : l("Unknown character '" + E[1][O] + "' while parsing grace note", b, x), O++);
      }
      if (D.length)
        return [E[0], D];
    }
    return [0];
  };
  function q(b, x) {
    if (b[x] === "&") {
      for (var E = x; b[x] && b[x] !== ":" && b[x] !== "|"; )
        x++;
      return [x - E, b.substring(E + 1, x)];
    }
    return [0];
  }
  function I(b) {
    var x = b.origMeter;
    return !x || x.type !== "specified" || !x.value || x.value.length === 0 ? 1 : parseInt(x.value[0].num, 10) / parseInt(x.value[0].den, 10);
  }
  var C = function(b, x) {
    var E = r.macros[b[x]];
    if (E !== void 0)
      return (E[0] === "!" || E[0] === "+") && (E = E.substring(1)), (E[E.length - 1] === "!" || E[E.length - 1] === "+") && (E = E.substring(0, E.length - 1)), p.includes(E) ? [1, E] : u.includes(E) ? (r.volumePosition === "hidden" && (E = ""), [1, E]) : d.includes(E) ? (r.dynamicPosition === "hidden" && (E = ""), [1, E]) : (r.ignoredDecorations.includes(E) || l("Unknown macro: " + E, b, x), [1, ""]);
    switch (b[x]) {
      case ".":
        if (b[x + 1] === "(" || b[x + 1] === "-")
          break;
        return [1, "staccato"];
      case "u":
        return [1, "upbow"];
      case "v":
        return [1, "downbow"];
      case "~":
        return [1, "irishroll"];
      case "!":
      case "+":
        var D = g.getBrackettedSubstring(b, x, 5);
        if (D[1].length > 1 && (D[1][0] === "^" || D[1][0] === "_") && (D[1] = D[1].substring(1)), p.includes(D[1]) || D[1].indexOf("class=") === 0)
          return D;
        if (u.includes(D[1]))
          return r.volumePosition === "hidden" && (D[1] = ""), D;
        if (d.includes(D[1]))
          return r.dynamicPosition === "hidden" && (D[1] = ""), D;
        var O = f.findIndex(function(z) {
          return D[1] === z[0];
        });
        return O >= 0 ? (D[1] = f[O][1], D) : (O = i.findIndex(function(z) {
          return D[1] === z[0];
        }), O >= 0 ? (D[1] = i[O][1], r.dynamicPosition === "hidden" && (D[1] = ""), D) : b[x] === "!" && (D[0] === 1 || b[x + D[0] - 1] !== "!") ? [1, null] : (l("Unknown decoration: " + D[1], b, x), D[1] = "", D));
      case "H":
        return [1, "fermata"];
      case "J":
        return [1, "slide"];
      case "L":
        return [1, "accent"];
      case "M":
        return [1, "mordent"];
      case "O":
        return [1, "coda"];
      case "P":
        return [1, "pralltriller"];
      case "R":
        return [1, "roll"];
      case "S":
        return [1, "segno"];
      case "T":
        return [1, "trill"];
      case "t":
        return [1, "trillh"];
    }
    return [0, 0];
  }, B = function(b, x) {
    for (var E = x; g.isWhiteSpace(b[x]); )
      x++;
    return [x - E];
  }, R = function(b, x) {
    var E = g.getBarLine(b, x);
    if (E.len === 0)
      return [0, ""];
    if (E.warn)
      return l(E.warn, b, x), [E.len, ""];
    for (var D = 0; D < b.length && b[x + E.len + D] === " "; D++)
      ;
    var O = E.len;
    if (b[x + E.len + D] === "[" && (E.len += D + 1), b[x + E.len] === '"' && b[x + E.len - 1] === "[") {
      var z = g.getBrackettedSubstring(b, x + E.len, 5);
      return [E.len + z[0], E.token, z[1]];
    }
    var H = g.getTokenOf(b.substring(x + E.len), "1234567890-,");
    return H.len === 0 || H.token[0] === "-" ? [O, E.token] : [E.len + H.len, E.token, H.token];
  }, S = function(b, x) {
    var E = {}, D = x;
    for (b[x] === "." && b[x + 1] === "(" && (E.dottedSlur = !0, x++); b[x] === "(" || g.isWhiteSpace(b[x]); )
      b[x] === "(" && (x + 1 < b.length && b[x + 1] >= "2" && b[x + 1] <= "9" ? (E.triplet !== void 0 ? l("Can't nest triplets", b, x) : (E.triplet = b[x + 1] - "0", E.tripletQ = h[E.triplet], E.num_notes = E.triplet, x + 2 < b.length && b[x + 2] === ":" && (x + 3 < b.length && b[x + 3] === ":" ? x + 4 < b.length && b[x + 4] >= "1" && b[x + 4] <= "9" ? (E.num_notes = b[x + 4] - "0", x += 3) : l("expected number after the two colons after the triplet to mark the duration", b, x) : x + 3 < b.length && b[x + 3] >= "1" && b[x + 3] <= "9" ? (E.tripletQ = b[x + 3] - "0", x + 4 < b.length && b[x + 4] === ":" ? x + 5 < b.length && b[x + 5] >= "1" && b[x + 5] <= "9" && (E.num_notes = b[x + 5] - "0", x += 4) : x += 2) : l("expected number after the triplet to mark the duration", b, x))), x++) : E.startSlur === void 0 ? E.startSlur = 1 : E.startSlur++), x++;
    return E.consumed = x - D, E;
  };
  y.prototype.startNewLine = function() {
    var b = { startChar: -1, endChar: -1 };
    r.partForNextLine.title && (b.part = r.partForNextLine), b.clef = r.currentVoice && r.staves[r.currentVoice.staffNum].clef !== void 0 ? Object.assign({}, r.staves[r.currentVoice.staffNum].clef) : Object.assign({}, r.clef);
    var x = r.currentVoice ? r.currentVoice.scoreTranspose : 0;
    if (b.key = _.standardKey(r.key.root + r.key.acc + r.key.mode, r.key.root, r.key.acc, x), b.key.mode = r.key.mode, r.key.impliedNaturals && (b.key.impliedNaturals = r.key.impliedNaturals), r.key.explicitAccidentals)
      for (var E = 0; E < r.key.explicitAccidentals.length; E++) {
        for (var D = !1, O = 0; O < b.key.accidentals.length; O++)
          b.key.accidentals[O].note === r.key.explicitAccidentals[E].note && (b.key.accidentals[O].acc = r.key.explicitAccidentals[E].acc, D = !0);
        D || b.key.accidentals.push(r.key.explicitAccidentals[E]);
      }
    if (r.targetKey = b.key, b.key.explicitAccidentals && delete b.key.explicitAccidentals, _.addPosToKey(b.clef, b.key), r.meter !== null ? (r.currentVoice ? (r.staves.forEach(function(Q) {
      Q.meter = r.meter;
    }), b.meter = r.staves[r.currentVoice.staffNum].meter, r.staves[r.currentVoice.staffNum].meter = null) : b.meter = r.meter, r.meter = null) : r.currentVoice && r.staves[r.currentVoice.staffNum].meter && (b.meter = r.staves[r.currentVoice.staffNum].meter, r.staves[r.currentVoice.staffNum].meter = null), r.currentVoice && r.currentVoice.name && (b.name = r.currentVoice.name), r.vocalfont && (b.vocalfont = r.vocalfont), r.tripletfont && (b.tripletfont = r.tripletfont), r.gchordfont && (b.gchordfont = r.gchordfont), r.style && (b.style = r.style), r.currentVoice) {
      var z = r.staves[r.currentVoice.staffNum];
      z.brace && (b.brace = z.brace), z.bracket && (b.bracket = z.bracket), z.connectBarLines && (b.connectBarLines = z.connectBarLines), z.name && (b.name = z.name[r.currentVoice.index]), z.subname && (b.subname = z.subname[r.currentVoice.index]), r.currentVoice.stem && (b.stem = r.currentVoice.stem), r.currentVoice.stafflines && (b.stafflines = r.currentVoice.stafflines), r.currentVoice.staffscale && (b.staffscale = r.currentVoice.staffscale), r.currentVoice.scale && (b.scale = r.currentVoice.scale), r.currentVoice.color && (b.color = r.currentVoice.color), r.currentVoice.style && (b.style = r.currentVoice.style), r.currentVoice.transpose && (b.clef.transpose = r.currentVoice.transpose), b.currentVoice = r.currentVoice;
      for (var H = Object.keys(r.voices), $ = 0; $ < H.length; $++)
        b.currentVoice.staffNum === r.voices[H[$]].staffNum && b.currentVoice.index === r.voices[H[$]].index && (b.currentVoiceName = H[$]);
    }
    r.barNumbers === 0 && L() && r.currBarNumber !== 1 && (b.barNumber = r.currBarNumber), a.startNewLine(b), r.key.impliedNaturals && delete r.key.impliedNaturals, r.partForNextLine = {}, r.tempoForNextLine.length === 4 && a.appendElement(r.tempoForNextLine[0], r.tempoForNextLine[1], r.tempoForNextLine[2], r.tempoForNextLine[3]), r.tempoForNextLine = [];
  };
  var k = function(b) {
    return b.duration !== void 0 && b.duration < 0.25 && (b.end_beam = !0), b;
  }, M = function(b, x, E, D) {
    var O = function(te) {
      return te === "octave" || te === "duration" || te === "Zduration" || te === "broken_rhythm" || te === "end_slur";
    }, z;
    b[x] === "." && b[x + 1] === "-" && (z = !0, x++);
    for (var H = "startSlur", $ = !1; ; ) {
      switch (b[x]) {
        case "(":
          if (H === "startSlur")
            E.startSlur === void 0 ? E.startSlur = 1 : E.startSlur++;
          else return O(H) ? (E.endChar = x, E) : null;
          break;
        case ")":
          if (O(H))
            E.endSlur === void 0 ? E.endSlur = 1 : E.endSlur++;
          else return null;
          break;
        case "^":
          if (H === "startSlur")
            E.accidental = "sharp", H = "sharp2";
          else if (H === "sharp2")
            E.accidental = "dblsharp", H = "pitch";
          else return O(H) ? (E.endChar = x, E) : null;
          break;
        case "_":
          if (H === "startSlur")
            E.accidental = "flat", H = "flat2";
          else if (H === "flat2")
            E.accidental = "dblflat", H = "pitch";
          else return O(H) ? (E.endChar = x, E) : null;
          break;
        case "=":
          if (H === "startSlur")
            E.accidental = "natural", H = "pitch";
          else return O(H) ? (E.endChar = x, E) : null;
          break;
        case "A":
        case "B":
        case "C":
        case "D":
        case "E":
        case "F":
        case "G":
        case "a":
        case "b":
        case "c":
        case "d":
        case "e":
        case "f":
        case "g":
          if (H === "startSlur" || H === "sharp2" || H === "flat2" || H === "pitch") {
            if (E.pitch = e[b[x]], E.pitch += 7 * (r.currentVoice && r.currentVoice.octave !== void 0 ? r.currentVoice.octave : r.octave), E.name = b[x], E.accidental && (E.name = v[E.accidental] + E.name), m.note(r, E), H = "octave", D && r.next_note_duration !== 0 ? (E.duration = r.default_length * r.next_note_duration, r.next_note_duration = 0, $ = !0) : E.duration = r.default_length, r.clef && r.clef.type === "perc" || r.currentVoice && r.currentVoice.clef === "perc") {
              var Q = b[x];
              E.accidental && (Q = v[E.accidental] + Q), o.formatting && o.formatting.midi && o.formatting.midi.drummap && (E.midipitch = o.formatting.midi.drummap[Q]);
            }
          } else return O(H) ? (E.endChar = x, E) : null;
          break;
        case ",":
          if (H === "octave")
            E.pitch -= 7, E.name += ",";
          else return O(H) ? (E.endChar = x, E) : null;
          break;
        case "'":
          if (H === "octave")
            E.pitch += 7, E.name += "'";
          else return O(H) ? (E.endChar = x, E) : null;
          break;
        case "x":
        case "X":
        case "y":
        case "z":
        case "Z":
          if (H === "startSlur")
            E.rest = { type: c[b[x]] }, delete E.accidental, delete E.startSlur, delete E.startTie, delete E.endSlur, delete E.endTie, delete E.end_beam, delete E.grace_notes, E.rest.type.indexOf("multimeasure") >= 0 ? (E.duration = o.getBarLength(), E.rest.text = 1, H = "Zduration") : (D && r.next_note_duration !== 0 ? (E.duration = r.default_length * r.next_note_duration, r.next_note_duration = 0, $ = !0) : E.duration = r.default_length, H = "duration");
          else return O(H) ? (E.endChar = x, E) : null;
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case "0":
        case "/":
          if (H === "octave" || H === "duration") {
            var W = g.getFraction(b, x);
            for (E.duration = E.duration * W.value, E.endChar = W.index; W.index < b.length && (g.isWhiteSpace(b[W.index]) || b[W.index] === "-"); )
              b[W.index] === "-" ? E.startTie = {} : E = k(E), W.index++;
            x = W.index - 1, H = "broken_rhythm";
          } else if (H === "sharp2")
            E.accidental = "quartersharp", H = "pitch";
          else if (H === "flat2")
            E.accidental = "quarterflat", H = "pitch";
          else if (H === "Zduration") {
            var ne = g.getNumber(b, x);
            return E.duration = ne.num * o.getBarLength(), E.rest.text = ne.num, E.endChar = ne.index, E;
          } else return null;
          break;
        case "-":
          if (H === "startSlur")
            a.addTieToLastNote(z), E.endTie = !0;
          else if (H === "octave" || H === "duration" || H === "end_slur")
            if (E.startTie = {}, !$ && D)
              H = "broken_rhythm";
            else
              return g.isWhiteSpace(b[x + 1]) && k(E), E.endChar = x + 1, E;
          else return H === "broken_rhythm" ? (E.endChar = x, E) : null;
          break;
        case " ":
        case "	":
          if (O(H)) {
            E.end_beam = !0, z = !1;
            do
              b[x] === "." && b[x + 1] === "-" && (z = !0, x++), b[x] === "-" && (E.startTie = {}, z && (E.startTie.style = "dotted")), x++;
            while (x < b.length && (g.isWhiteSpace(b[x]) || b[x] === "-") || b[x] === "." && b[x + 1] === "-");
            if (E.endChar = x, !$ && D && (b[x] === "<" || b[x] === ">"))
              x--, H = "broken_rhythm";
            else
              return E;
          } else return null;
          break;
        case ">":
        case "<":
          if (O(H))
            if (D) {
              var J = F(b, x);
              x += J[0] - 1, r.next_note_duration = J[2], E.duration = J[1] * E.duration, H = "end_slur";
            } else
              return E.endChar = x, E;
          else
            return null;
          break;
        default:
          return O(H) ? (E.endChar = x, E) : null;
      }
      if (x++, x === b.length)
        return O(H) ? (E.endChar = x, E) : null;
    }
    return null;
  }, F = function(b, x) {
    switch (b[x]) {
      case ">":
        return x < b.length - 2 && b[x + 1] === ">" && b[x + 2] === ">" ? [3, 1.875, 0.125] : x < b.length - 1 && b[x + 1] === ">" ? [2, 1.75, 0.25] : [1, 1.5, 0.5];
      case "<":
        return x < b.length - 2 && b[x + 1] === "<" && b[x + 2] === "<" ? [3, 0.125, 1.875] : x < b.length - 1 && b[x + 1] === "<" ? [2, 0.25, 1.75] : [1, 0.5, 1.5];
    }
    return null;
  };
  function L() {
    return r.currentVoice === void 0 || r.currentVoice.staffNum === 0 && r.currentVoice.index === 0;
  }
  return it = y, it;
}
var st, ga;
function Ds() {
  if (ga) return st;
  ga = 1;
  var _ = _e(), m = function(g, l) {
    this.lineIndex = 0, this.lines = g, this.multilineVars = l, this.skipWhiteSpace = function(n) {
      for (var t = 0; t < n.length; t++)
        if (!this.isWhiteSpace(n[t]))
          return t;
      return n.length;
    };
    var r = function(n, t) {
      return t >= n.length;
    };
    this.eatWhiteSpace = function(n, t) {
      for (var e = t; e < n.length; e++)
        if (!this.isWhiteSpace(n[e]))
          return e - t;
      return e - t;
    }, this.getKeyPitch = function(n) {
      var t = this.skipWhiteSpace(n);
      if (r(n, t))
        return { len: 0 };
      switch (n[t]) {
        case "A":
          return { len: t + 1, token: "A" };
        case "B":
          return { len: t + 1, token: "B" };
        case "C":
          return { len: t + 1, token: "C" };
        case "D":
          return { len: t + 1, token: "D" };
        case "E":
          return { len: t + 1, token: "E" };
        case "F":
          return { len: t + 1, token: "F" };
        case "G":
          return { len: t + 1, token: "G" };
      }
      return { len: 0 };
    }, this.getSharpFlat = function(n) {
      if (n === "bass")
        return { len: 0 };
      switch (n[0]) {
        case "#":
          return { len: 1, token: "#" };
        case "b":
          return { len: 1, token: "b" };
      }
      return { len: 0 };
    }, this.getMode = function(n) {
      var t = function(v, h) {
        for (; h < v.length && (v[h] >= "a" && v[h] <= "z" || v[h] >= "A" && v[h] <= "Z"); )
          h++;
        return h;
      }, e = this.skipWhiteSpace(n);
      if (r(n, e))
        return { len: 0 };
      var c = n.substring(e, e + 3).toLowerCase();
      switch ((c.length > 1 && c[1] === " " || c[1] === "^" || c[1] === "_" || c[1] === "=") && (c = c[0]), c) {
        case "mix":
          return { len: t(n, e), token: "Mix" };
        case "dor":
          return { len: t(n, e), token: "Dor" };
        case "phr":
          return { len: t(n, e), token: "Phr" };
        case "lyd":
          return { len: t(n, e), token: "Lyd" };
        case "loc":
          return { len: t(n, e), token: "Loc" };
        case "aeo":
          return { len: t(n, e), token: "m" };
        case "maj":
          return { len: t(n, e), token: "" };
        case "ion":
          return { len: t(n, e), token: "" };
        case "min":
          return { len: t(n, e), token: "m" };
        case "m":
          return { len: t(n, e), token: "m" };
      }
      return { len: 0 };
    }, this.getClef = function(n, t) {
      var e = n, c = this.skipWhiteSpace(n);
      if (r(n, c))
        return { len: 0 };
      var v = !1, h = n.substring(c);
      if (_.startsWith(h, "clef=") && (v = !0, h = h.substring(5), c += 5), h.length === 0 && v)
        return { len: c + 5, warn: "No clef specified: " + e };
      var y = this.skipWhiteSpace(h);
      if (r(h, y))
        return { len: 0 };
      y > 0 && (c += y, h = h.substring(y));
      var w = null;
      if (_.startsWith(h, "treble"))
        w = "treble";
      else if (_.startsWith(h, "bass3"))
        w = "bass3";
      else if (_.startsWith(h, "bass"))
        w = "bass";
      else if (_.startsWith(h, "tenor"))
        w = "tenor";
      else if (_.startsWith(h, "alto2"))
        w = "alto2";
      else if (_.startsWith(h, "alto1"))
        w = "alto1";
      else if (_.startsWith(h, "alto"))
        w = "alto";
      else if (!t && v && _.startsWith(h, "none"))
        w = "none";
      else if (_.startsWith(h, "perc"))
        w = "perc";
      else if (!t && v && _.startsWith(h, "C"))
        w = "tenor";
      else if (!t && v && _.startsWith(h, "F"))
        w = "bass";
      else if (!t && v && _.startsWith(h, "G"))
        w = "treble";
      else
        return { len: c + 5, warn: "Unknown clef specified: " + e };
      return h = h.substring(w.length), y = this.isMatch(h, "+8"), y > 0 ? w += "+8" : (y = this.isMatch(h, "-8"), y > 0 && (w += "-8")), { len: c + w.length, token: w, explicit: v };
    }, this.getBarLine = function(n, t) {
      switch (n[t]) {
        case "]":
          switch (++t, n[t]) {
            case "|":
              return { len: 2, token: "bar_thick_thin" };
            case "[":
              return ++t, n[t] >= "1" && n[t] <= "9" || n[t] === '"' ? { len: 2, token: "bar_invisible" } : { len: 1, warn: "Unknown bar symbol" };
            default:
              return { len: 1, token: "bar_invisible" };
          }
        case ":":
          switch (++t, n[t]) {
            case ":":
              return { len: 2, token: "bar_dbl_repeat" };
            case "|":
              switch (++t, n[t]) {
                case "]":
                  return ++t, n[t] === "|" ? (++t, n[t] === ":" ? { len: 5, token: "bar_dbl_repeat" } : { len: 3, token: "bar_right_repeat" }) : { len: 3, token: "bar_right_repeat" };
                case "|":
                  return ++t, n[t] === ":" ? { len: 4, token: "bar_dbl_repeat" } : { len: 3, token: "bar_right_repeat" };
                default:
                  return { len: 2, token: "bar_right_repeat" };
              }
            default:
              return { len: 1, warn: "Unknown bar symbol" };
          }
        case "[":
          if (++t, n[t] === "|")
            switch (++t, n[t]) {
              case ":":
                return { len: 3, token: "bar_left_repeat" };
              case "]":
                return { len: 3, token: "bar_invisible" };
              default:
                return { len: 2, token: "bar_thick_thin" };
            }
          else
            return n[t] >= "1" && n[t] <= "9" || n[t] === '"' ? { len: 1, token: "bar_invisible" } : { len: 0 };
        case "|":
          switch (++t, n[t]) {
            case "]":
              return { len: 2, token: "bar_thin_thick" };
            case "|":
              return ++t, n[t] === ":" ? { len: 3, token: "bar_left_repeat" } : { len: 2, token: "bar_thin_thin" };
            case ":":
              for (var e = 0; n[t + e] === ":"; ) e++;
              return { len: 1 + e, token: "bar_left_repeat" };
            default:
              return { len: 1, token: "bar_thin" };
          }
      }
      return { len: 0 };
    }, this.getTokenOf = function(n, t) {
      for (var e = 0; e < n.length; e++)
        if (t.indexOf(n[e]) < 0)
          return { len: e, token: n.substring(0, e) };
      return { len: e, token: n };
    }, this.getToken = function(n, t, e) {
      for (var c = t; c < e && !this.isWhiteSpace(n[c]); )
        c++;
      return n.substring(t, c);
    }, this.isMatch = function(n, t) {
      var e = this.skipWhiteSpace(n);
      return r(n, e) ? 0 : _.startsWith(n.substring(e), t) ? e + t.length : 0;
    }, this.getPitchFromTokens = function(n) {
      var t = {}, e = { A: 5, B: 6, C: 0, D: 1, E: 2, F: 3, G: 4, a: 12, b: 13, c: 7, d: 8, e: 9, f: 10, g: 11 };
      if (t.position = e[n[0].token], t.position === void 0)
        return { warn: "Pitch expected. Found: " + n[0].token };
      for (n.shift(); n.length; )
        switch (n[0].token) {
          case ",":
            t.position -= 7, n.shift();
            break;
          case "'":
            t.position += 7, n.shift();
            break;
          default:
            return t;
        }
      return t;
    }, this.getKeyAccidentals2 = function(n) {
      for (var t; n.length > 0; ) {
        var e;
        if (n[0].token === "^") {
          if (e = "sharp", n.shift(), n.length === 0) return { accs: t, warn: "Expected note name after " + e };
          switch (n[0].token) {
            case "^":
              e = "dblsharp", n.shift();
              break;
            case "/":
              e = "quartersharp", n.shift();
              break;
          }
        } else if (n[0].token === "=")
          e = "natural", n.shift();
        else if (n[0].token === "_") {
          if (e = "flat", n.shift(), n.length === 0) return { accs: t, warn: "Expected note name after " + e };
          switch (n[0].token) {
            case "_":
              e = "dblflat", n.shift();
              break;
            case "/":
              e = "quarterflat", n.shift();
              break;
          }
        } else
          return { accs: t };
        if (n.length === 0) return { accs: t, warn: "Expected note name after " + e };
        switch (n[0].token[0]) {
          case "a":
          case "b":
          case "c":
          case "d":
          case "e":
          case "f":
          case "g":
          case "A":
          case "B":
          case "C":
          case "D":
          case "E":
          case "F":
          case "G":
            t === void 0 && (t = []), t.push({ acc: e, note: n[0].token[0] }), n[0].token.length === 1 ? n.shift() : n[0].token = n[0].token.substring(1);
            break;
          default:
            return { accs: t, warn: "Expected note name after " + e + " Found: " + n[0].token };
        }
      }
      return { accs: t };
    }, this.getKeyAccidental = function(n) {
      var t = {
        "^": "sharp",
        "^^": "dblsharp",
        "=": "natural",
        _: "flat",
        __: "dblflat",
        "_/": "quarterflat",
        "^/": "quartersharp"
      }, e = this.skipWhiteSpace(n);
      if (r(n, e))
        return { len: 0 };
      var c = null;
      switch (n[e]) {
        case "^":
        case "_":
        case "=":
          c = n[e];
          break;
        default:
          return { len: 0 };
      }
      if (e++, r(n, e))
        return { len: 1, warn: "Expected note name after accidental" };
      switch (n[e]) {
        case "a":
        case "b":
        case "c":
        case "d":
        case "e":
        case "f":
        case "g":
        case "A":
        case "B":
        case "C":
        case "D":
        case "E":
        case "F":
        case "G":
          return { len: e + 1, token: { acc: t[c], note: n[e] } };
        case "^":
        case "_":
        case "/":
          if (c += n[e], e++, r(n, e))
            return { len: 2, warn: "Expected note name after accidental" };
          switch (n[e]) {
            case "a":
            case "b":
            case "c":
            case "d":
            case "e":
            case "f":
            case "g":
            case "A":
            case "B":
            case "C":
            case "D":
            case "E":
            case "F":
            case "G":
              return { len: e + 1, token: { acc: t[c], note: n[e] } };
            default:
              return { len: 2, warn: "Expected note name after accidental" };
          }
          break;
        default:
          return { len: 1, warn: "Expected note name after accidental" };
      }
    }, this.isWhiteSpace = function(n) {
      return n === " " || n === "	" || n === "";
    }, this.getMeat = function(n, t, e) {
      var c = n.indexOf("%", t);
      for (c >= 0 && c < e && (e = c); t < e && (n[t] === " " || n[t] === "	" || n[t] === ""); )
        t++;
      for (; t < e && (n[e - 1] === " " || n[e - 1] === "	" || n[e - 1] === ""); )
        e--;
      return { start: t, end: e };
    };
    var o = function(n) {
      return n >= "A" && n <= "Z" || n >= "a" && n <= "z";
    }, a = function(n) {
      return n >= "0" && n <= "9";
    };
    this.tokenize = function(n, t, e, c) {
      var v = this.getMeat(n, t, e);
      t = v.start, e = v.end;
      for (var h = [], y; t < e; ) {
        if (n[t] === '"') {
          for (y = t + 1; y < e && n[y] !== '"'; ) y++;
          h.push({ type: "quote", token: n.substring(t + 1, y), start: t + 1, end: y }), y++;
        } else if (o(n[t])) {
          if (y = t + 1, c)
            for (; y < e && !this.isWhiteSpace(n[y]); ) y++;
          else
            for (; y < e && o(n[y]); ) y++;
          h.push({ type: "alpha", token: n.substring(t, y), continueId: a(n[y]), start: t, end: y }), t = y + 1;
        } else if (n[t] === "." && a(n[y + 1])) {
          y = t + 1;
          for (var w = null, A = null; y < e && a(n[y]); ) y++;
          A = parseFloat(n.substring(t, y)), h.push({ type: "number", token: n.substring(t, y), intt: w, floatt: A, continueId: o(n[y]), start: t, end: y }), t = y + 1;
        } else if (a(n[t]) || n[t] === "-" && a(n[y + 1])) {
          y = t + 1;
          for (var P = null, N = null; y < e && a(n[y]); ) y++;
          if (n[y] === "." && a(n[y + 1]))
            for (y++; y < e && a(n[y]); ) y++;
          else
            P = parseInt(n.substring(t, y));
          N = parseFloat(n.substring(t, y)), h.push({ type: "number", token: n.substring(t, y), intt: P, floatt: N, continueId: o(n[y]), start: t, end: y }), t = y + 1;
        } else n[t] === " " || n[t] === "	" || h.push({ type: "punct", token: n[t], start: t, end: t + 1 }), y = t + 1;
        t = y;
      }
      return h;
    }, this.getVoiceToken = function(n, t, e) {
      for (var c = t; c < e && this.isWhiteSpace(n[c]) || n[c] === "="; )
        c++;
      if (n[c] === '"') {
        var v = n.indexOf('"', c + 1);
        return v === -1 || v >= e ? { len: 1, err: "Missing close quote" } : { len: v - t + 1, token: this.translateString(n.substring(c + 1, v)) };
      } else {
        for (var h = c; h < e && !this.isWhiteSpace(n[h]) && n[h] !== "="; )
          h++;
        return { len: h - t + 1, token: n.substring(c, h) };
      }
    };
    var s = {
      "`a": "à",
      "'a": "á",
      "^a": "â",
      "~a": "ã",
      '"a': "ä",
      oa: "å",
      aa: "å",
      "=a": "ā",
      ua: "ă",
      ";a": "ą",
      "`e": "è",
      "'e": "é",
      "^e": "ê",
      '"e': "ë",
      "=e": "ē",
      ue: "ĕ",
      ";e": "ę",
      ".e": "ė",
      "`i": "ì",
      "'i": "í",
      "^i": "î",
      '"i': "ï",
      "=i": "ī",
      ui: "ĭ",
      ";i": "į",
      "`o": "ò",
      "'o": "ó",
      "^o": "ô",
      "~o": "õ",
      '"o': "ö",
      "=o": "ō",
      uo: "ŏ",
      "/o": "ø",
      "`u": "ù",
      "'u": "ú",
      "^u": "û",
      "~u": "ũ",
      '"u': "ü",
      ou: "ů",
      "=u": "ū",
      uu: "ŭ",
      ";u": "ų",
      "`A": "À",
      "'A": "Á",
      "^A": "Â",
      "~A": "Ã",
      '"A': "Ä",
      oA: "Å",
      AA: "Å",
      "=A": "Ā",
      uA: "Ă",
      ";A": "Ą",
      "`E": "È",
      "'E": "É",
      "^E": "Ê",
      '"E': "Ë",
      "=E": "Ē",
      uE: "Ĕ",
      ";E": "Ę",
      ".E": "Ė",
      "`I": "Ì",
      "'I": "Í",
      "^I": "Î",
      "~I": "Ĩ",
      '"I': "Ï",
      "=I": "Ī",
      uI: "Ĭ",
      ";I": "Į",
      ".I": "İ",
      "`O": "Ò",
      "'O": "Ó",
      "^O": "Ô",
      "~O": "Õ",
      '"O': "Ö",
      "=O": "Ō",
      uO: "Ŏ",
      "/O": "Ø",
      "`U": "Ù",
      "'U": "Ú",
      "^U": "Û",
      "~U": "Ũ",
      '"U': "Ü",
      oU: "Ů",
      "=U": "Ū",
      uU: "Ŭ",
      ";U": "Ų",
      ae: "æ",
      AE: "Æ",
      oe: "œ",
      OE: "Œ",
      ss: "ß",
      "'c": "ć",
      "^c": "ĉ",
      uc: "č",
      cc: "ç",
      ".c": "ċ",
      cC: "Ç",
      "'C": "Ć",
      "^C": "Ĉ",
      uC: "Č",
      ".C": "Ċ",
      "~N": "Ñ",
      "~n": "ñ",
      "=s": "š",
      vs: "š",
      DH: "Ð",
      dh: "ð",
      HO: "Ő",
      Ho: "ő",
      HU: "Ű",
      Hu: "ű",
      "'Y": "Ý",
      "'y": "ý",
      "^Y": "Ŷ",
      "^y": "ŷ",
      '"Y': "Ÿ",
      '"y': "ÿ",
      vS: "Š",
      vZ: "Ž",
      vz: "ž"
      // More chars: Ĳ ĳ Ď ď Đ đ Ĝ ĝ Ğ ğ Ġ ġ Ģ ģ Ĥ ĥ Ħ ħ Ĵ ĵ Ķ ķ ĸ Ĺ ĺ Ļ ļ Ľ ľ Ŀ ŀ Ł ł Ń ń Ņ ņ Ň ň ŉ Ŋ ŋ Ŕ ŕ Ŗ ŗ Ř ř Ś ś Ŝ ŝ Ş ş Š Ţ ţ Ť ť Ŧ ŧ Ŵ ŵ Ź ź Ż ż Ž
    }, p = {
      "#": "♯",
      b: "♭",
      "=": "♮"
    }, u = {
      201: "♯",
      202: "♭",
      203: "♮",
      241: "¡",
      242: "¢",
      252: "a",
      262: "2",
      272: "o",
      302: "Â",
      312: "Ê",
      322: "Ò",
      332: "Ú",
      342: "â",
      352: "ê",
      362: "ò",
      372: "ú",
      243: "£",
      253: "«",
      263: "3",
      273: "»",
      303: "Ã",
      313: "Ë",
      323: "Ó",
      333: "Û",
      343: "ã",
      353: "ë",
      363: "ó",
      373: "û",
      244: "¤",
      254: "¬",
      264: "  ́",
      274: "1⁄4",
      304: "Ä",
      314: "Ì",
      324: "Ô",
      334: "Ü",
      344: "ä",
      354: "ì",
      364: "ô",
      374: "ü",
      245: "¥",
      255: "-",
      265: "μ",
      275: "1⁄2",
      305: "Å",
      315: "Í",
      325: "Õ",
      335: "Ý",
      345: "å",
      355: "í",
      365: "õ",
      375: "ý",
      246: "¦",
      256: "®",
      266: "¶",
      276: "3⁄4",
      306: "Æ",
      316: "Î",
      326: "Ö",
      336: "Þ",
      346: "æ",
      356: "î",
      366: "ö",
      376: "þ",
      247: "§",
      257: " ̄",
      267: "·",
      277: "¿",
      307: "Ç",
      317: "Ï",
      327: "×",
      337: "ß",
      347: "ç",
      357: "ï",
      367: "÷",
      377: "ÿ",
      250: " ̈",
      260: "°",
      270: " ̧",
      300: "À",
      310: "È",
      320: "Ð",
      330: "Ø",
      340: "à",
      350: "è",
      360: "ð",
      370: "ø",
      251: "©",
      261: "±",
      271: "1",
      301: "Á",
      311: "É",
      321: "Ñ",
      331: "Ù",
      341: "á",
      351: "é",
      361: "ñ",
      371: "ù"
    };
    this.translateString = function(n) {
      var t = n.split("\\");
      if (t.length === 1) return n;
      var e = null;
      return t.forEach(function(c) {
        if (e === null)
          e = c;
        else {
          var v = s[c.substring(0, 2)];
          v !== void 0 ? e += v + c.substring(2) : (v = u[c.substring(0, 3)], v !== void 0 ? e += v + c.substring(3) : (v = p[c.substring(0, 1)], v !== void 0 ? e += v + c.substring(1) : e += "\\" + c));
        }
      }), e;
    }, this.getNumber = function(n, t) {
      for (var e = 0; t < n.length; )
        switch (n[t]) {
          case "0":
            e = e * 10, t++;
            break;
          case "1":
            e = e * 10 + 1, t++;
            break;
          case "2":
            e = e * 10 + 2, t++;
            break;
          case "3":
            e = e * 10 + 3, t++;
            break;
          case "4":
            e = e * 10 + 4, t++;
            break;
          case "5":
            e = e * 10 + 5, t++;
            break;
          case "6":
            e = e * 10 + 6, t++;
            break;
          case "7":
            e = e * 10 + 7, t++;
            break;
          case "8":
            e = e * 10 + 8, t++;
            break;
          case "9":
            e = e * 10 + 9, t++;
            break;
          default:
            return { num: e, index: t };
        }
      return { num: e, index: t };
    }, this.getFraction = function(n, t) {
      var e = 1, c = 1;
      if (n[t] !== "/") {
        var v = this.getNumber(n, t);
        e = v.num, t = v.index;
      }
      if (n[t] === "/")
        if (t++, n[t] === "/") {
          for (var h = 0.5; n[t++] === "/"; )
            h = h / 2;
          return { value: e * h, index: t - 1 };
        } else {
          var y = t, w = this.getNumber(n, t);
          w.num === 0 && y === t && (w.num = 2), w.num !== 0 && (c = w.num), t = w.index;
        }
      return { value: e / c, index: t };
    };
    function d(n) {
      const e = /^(\d+)\./.exec(n);
      return e ? e[1] : null;
    }
    var f = [
      { match: /,\s*The$/, replace: "The " },
      { match: /,\s*the$/, replace: "the " },
      { match: /,\s*A$/, replace: "A " },
      { match: /,\s*a$/, replace: "a " },
      { match: /,\s*An$/, replace: "An " },
      { match: /,\s*an$/, replace: "an " },
      { match: /,\s*Da$/, replace: "Da " },
      { match: /,\s*La$/, replace: "La " },
      { match: /,\s*Le$/, replace: "Le " },
      { match: /,\s*Les$/, replace: "Les " },
      { match: /,\s*Ye$/, replace: "Ye " }
    ];
    this.theReverser = function(n) {
      for (var t = 0; t < f.length; t++) {
        var e = f[t], c = n.match(e.match);
        if (c) {
          var v = d(n);
          v && (n = n.replace(v + ".", ""), n = n.trim());
          var h = c[0].length, y = e.replace + n.substring(0, n.length - h);
          return v && (y = v + ". " + y), y;
        }
      }
      return n;
    }, this.stripComment = function(n) {
      var t = n.indexOf("%");
      return t >= 0 ? _.strip(n.substring(0, t)) : _.strip(n);
    }, this.getInt = function(n) {
      var t = parseInt(n);
      if (isNaN(t))
        return { digits: 0 };
      var e = "" + t, c = n.indexOf(e);
      return { value: t, digits: c + e.length };
    }, this.getFloat = function(n) {
      var t = parseFloat(n);
      if (isNaN(t))
        return { digits: 0 };
      var e = "" + t, c = n.indexOf(e);
      return { value: t, digits: c + e.length };
    }, this.getMeasurement = function(n) {
      if (n.length === 0) return { used: 0 };
      var t = 1, e = "";
      if (n[0].token === "-")
        n.shift(), e = "-", t++;
      else if (n[0].type !== "number") return { used: 0 };
      if (e += n.shift().token, n.length === 0) return { used: 1, value: parseInt(e) };
      var c = n.shift();
      if (c.token === ".") {
        if (t++, n.length === 0) return { used: t, value: parseInt(e) };
        if (n[0].type === "number" && (c = n.shift(), e = e + "." + c.token, t++, n.length === 0))
          return { used: t, value: parseFloat(e) };
        c = n.shift();
      }
      switch (c.token) {
        case "pt":
          return { used: t + 1, value: parseFloat(e) };
        case "px":
          return { used: t + 1, value: parseFloat(e) };
        case "cm":
          return { used: t + 1, value: parseFloat(e) / 2.54 * 72 };
        case "in":
          return { used: t + 1, value: parseFloat(e) * 72 };
        default:
          return n.unshift(c), { used: t, value: parseFloat(e) };
      }
    };
    var i = function(n) {
      return n = n.replace(/\\n/g, `
`), n = n.replace(/\\"/g, '"'), n;
    };
    this.getBrackettedSubstring = function(n, t, e, c) {
      for (var v = c || n[t], h = t + 1, y = !1; h < n.length && (y || n[h] !== v); )
        y = n[h] === "\\", ++h;
      return n[h] === v ? [h - t + 1, i(n.substring(t + 1, h)), !0] : (h = t + e, h > n.length - 1 && (h = n.length - 1), [h - t + 1, i(n.substring(t + 1, h)), !1]);
    };
  };
  return m.prototype.peekLine = function() {
    return this.lines[this.lineIndex];
  }, m.prototype.nextLine = function() {
    if (this.lineIndex > 0 && (this.multilineVars.iChar += this.lines[this.lineIndex - 1].length + 1), this.lineIndex < this.lines.length) {
      var g = this.lines[this.lineIndex];
      return this.lineIndex++, g;
    }
    return null;
  }, st = m, st;
}
var ot, ba;
function Ji() {
  if (ba) return ot;
  ba = 1;
  function _(d, f, i) {
    if (!(!f || d.lines.length === 0)) {
      var n = d.deline({ lineBreaks: !1 }), t = g(n, f);
      d.lines = m(n, t, i), d.lineBreaks = t;
    }
  }
  function m(d, f, i) {
    for (var n = [], t = [], e = [], c = 1, v = 0; v < f.length; v++) {
      var h = f[v];
      if (d[h.ogLine].staff) {
        var y = d[h.ogLine].staff[h.staff];
        if (n[h.line] || (n[h.line] = { staff: [] }), !n[h.line].staff[h.staff]) {
          n[h.line].staff[h.staff] = { voices: [] }, i !== void 0 && h.staff === 0 && h.line > 0 && (n[h.line].staff[h.staff].barNumber = c);
          for (var w = Object.keys(y), A = 0; A < w.length; A++) {
            var P = w[A] === "voices";
            w[A] === "meter" && h.line !== 0 && (P = !0), P || (n[h.line].staff[h.staff][w[A]] = y[w[A]]);
          }
          t[h.staff] && (n[h.line].staff[h.staff].key = t[h.staff]);
        }
        n[h.line].staff[h.staff].voices[h.voice] || (n[h.line].staff[h.staff].voices[h.voice] = []), n[h.line].staff[h.staff].voices[h.voice] = d[h.ogLine].staff[h.staff].voices[h.voice].slice(h.start, h.end + 1), e[h.staff * 10 + h.voice] && n[h.line].staff[h.staff].voices[h.voice].unshift({ el_type: "stem", direction: e[h.staff * 10 + h.voice].direction });
        for (var N = n[h.line].staff[h.staff].voices[h.voice], T = N.length - 1; T >= 0; T--)
          if (N[T].el_type === "key") {
            t[h.staff] = {
              root: N[T].root,
              acc: N[T].acc,
              mode: N[T].mode,
              accidentals: N[T].accidentals.filter(function(I) {
                return I.acc !== "natural";
              })
            };
            break;
          }
        for (T = N.length - 1; T >= 0; T--)
          if (N[T].el_type === "stem") {
            e[h.staff * 10 + h.voice] = {
              direction: N[T].direction
            };
            break;
          }
        if (i !== void 0 && h.staff === 0 && h.voice === 0)
          for (T = 0; T < N.length; T++)
            N[T].el_type === "bar" && (c++, T === N.length - 1 ? delete N[T].barNumber : N[T].barNumber = c);
      } else
        n[h.line] = d[h.ogLine];
    }
    for (var q = 0; q < n.length; q++)
      n[q].staff && (n[q].staff = n[q].staff.filter(function(I) {
        return I != null;
      }));
    return n;
  }
  function g(d, f) {
    for (var i = [], n = 0, t = 0, e = 0, c = 0; c < d.length; c++) {
      var v = d[c];
      if (v.staff) {
        var h = t, y = f[n];
        n++;
        for (var w = 0; w < v.staff.length; w++)
          for (var A = v.staff[w], P = 0; P < A.voices.length; P++) {
            e = h;
            for (var N = 0, T = 0, q = A.voices[P], I = 0, C = 0; C < q.length; C++) {
              var B = q[C];
              B.el_type === "bar" && (y[T] === N && (i.push({ ogLine: c, line: e, staff: w, voice: P, start: I, end: C }), I = C + 1, e++, t = Math.max(t, e), T++), N++);
            }
            i.push({ ogLine: c, line: e, staff: w, voice: P, start: I, end: q.length }), e++, t = Math.max(t, e);
          }
      } else
        i.push({ ogLine: c, line: e }), e++, t = Math.max(t, e);
    }
    return i;
  }
  function l(d, f) {
    for (var i = [], n = [], t = 0, e = 0; e < d.length; e++) {
      var c = d[e], v = t + c;
      if (v < f)
        t = v;
      else {
        var h = f - t, y = v - f;
        h < y && t > 0 ? (i.push(e - 1), n.push(Math.round(t - c)), t = c) : e < d.length - 1 && (i.push(e), n.push(Math.round(t)), t = 0);
      }
    }
    return n.push(Math.round(t)), { lineBreaks: i, totals: n };
  }
  function r(d) {
    for (var f = [], i = 0; i < d.length; i++)
      f.push(d[i]);
    return f;
  }
  function o(d, f, i, n, t, e, c, v, h, y, w) {
    for (var A = y; A < d.length; A++) {
      var P = d[A];
      i += P, n += P;
      var N = Math.abs(i - f[v]), T = Math.abs(N - e) < f[0] / 10;
      if (T)
        if (N < e) {
          var q = r(t), I = r(h);
          I.push(A - 1), q.push(n - P), w.push({
            accumulator: i,
            lineAccumulator: P,
            lineWidths: q,
            lastVariance: Math.abs(i - f[v + 1]),
            highestVariance: Math.max(c, e),
            currLine: v + 1,
            lineBreaks: I,
            startIndex: A + 1
          });
        } else N > e && A < d.length - 1 && (q = r(t), I = r(h), w.push({
          accumulator: i,
          lineAccumulator: n,
          lineWidths: q,
          lastVariance: N,
          highestVariance: Math.max(c, N),
          currLine: v,
          lineBreaks: I,
          startIndex: A + 1
        }));
      N > e ? (h.push(A - 1), v++, c = Math.max(c, e), e = Math.abs(i - f[v]), t.push(n - P), n = P) : e = N;
    }
    t.push(n);
  }
  function a(d, f, i, n) {
    for (var t = Math.ceil(d.total / f), e = Math.floor(d.total / t), c = [], v = 0; v < t; v++)
      c.push(e * (v + 1));
    var h = [];
    h.push({
      accumulator: 0,
      lineAccumulator: 0,
      lineWidths: [],
      lastVariance: 999999,
      highestVariance: 0,
      currLine: 0,
      lineBreaks: [],
      // These are the zero-based last measure on each line
      startIndex: 0
    });
    for (var y = 0; y < h.length; )
      o(
        d.measureWidths,
        c,
        h[y].accumulator,
        h[y].lineAccumulator,
        h[y].lineWidths,
        h[y].lastVariance,
        h[y].highestVariance,
        h[y].currLine,
        h[y].lineBreaks,
        h[y].startIndex,
        h
      ), y++;
    for (v = 0; v < h.length; v++) {
      var w = h[v];
      w.variances = [], w.aveVariance = 0;
      for (var A = 0; A < w.lineWidths.length; A++) {
        var P = w.lineWidths[A];
        w.variances.push(P - c[0]), w.aveVariance += Math.abs(P - c[0]);
      }
      w.aveVariance = w.aveVariance / w.lineWidths.length, n.attempts.push({ type: "optimizeLineWidths", lineBreaks: w.lineBreaks, variances: w.variances, aveVariance: w.aveVariance, widths: d.measureWidths });
    }
    var N = 9999999, T = -1;
    for (v = 0; v < h.length; v++)
      w = h[v], w.aveVariance < N && (N = w.aveVariance, T = v);
    return { failed: !1, lineBreaks: h[T].lineBreaks, variance: h[T].highestVariance };
  }
  function s(d, f, i) {
    for (var n = [], t = [], e = 0, c = !1, v = 0; v < d.length; v++)
      e += d[v], e > f && (c = !0), v % i === i - 1 && (v !== d.length - 1 && n.push(v), t.push(Math.round(e)), e = 0);
    return { failed: c, totals: t, lineBreaks: n };
  }
  function p(d, f, i) {
    var n = {
      lineBreaks: d,
      staffwidth: f
    };
    for (var t in i)
      i.hasOwnProperty(t) && t !== "wrap" && t !== "staffwidth" && (n[t] = i[t]);
    return { revisedParams: n };
  }
  function u(d, f, i) {
    if (f.length === 0 || i.staffwidth < f[0].left)
      return {
        reParse: !1,
        explanation: "Staff width is narrower than the margin",
        revisedParams: i
      };
    var n = i.scale ? Math.max(i.scale, 0.1) : 1, t = i.wrap.minSpacing ? Math.max(parseFloat(i.wrap.minSpacing), 1) : 1, e = i.wrap.minSpacingLimit ? Math.max(parseFloat(i.wrap.minSpacingLimit), 1) : t - 0.1, c = i.wrap.maxSpacing ? Math.max(parseFloat(i.wrap.maxSpacing), 1) : void 0;
    i.wrap.lastLineLimit && !c && (c = Math.max(parseFloat(i.wrap.lastLineLimit), 1));
    for (var v = i.wrap.preferredMeasuresPerLine ? Math.max(parseInt(i.wrap.preferredMeasuresPerLine, 10), 0) : void 0, h = [], y = [], w = 0; w < f.length; w++) {
      var A = f[w], P = i.staffwidth - A.left, N = P / t / n, T = P / c / n, q = P / e / n, I = {
        widths: A,
        lineBreakPoint: N,
        minLineSize: T,
        attempts: [],
        staffWidth: i.staffwidth,
        minWidth: Math.round(q)
      }, C = null;
      if (v) {
        var B = s(A.measureWidths, N, v);
        I.attempts.push({
          type: "Fixed Measures Per Line",
          preferredMeasuresPerLine: v,
          lineBreaks: B.lineBreaks,
          failed: B.failed,
          totals: B.totals
        }), B.failed || (C = B.lineBreaks);
      }
      if (!C) {
        var R = l(A.measureWidths, N);
        I.attempts.push({ type: "Free Form", lineBreaks: R.lineBreaks, totals: R.totals }), C = R.lineBreaks, C.length > 0 && A.measureWidths.length < 25 && (R = a(A, N, C, I), I.attempts.push({
          type: "Optimize",
          failed: R.failed,
          reason: R.reason,
          lineBreaks: R.lineBreaks,
          totals: R.totals
        }), R.failed || (C = R.lineBreaks));
      }
      h.push(C), y.push(I);
    }
    var S = i.staffwidth, k = p(h, S, i);
    return k.explanation = y, k.reParse = !0, k;
  }
  return ot = { wrapLines: _, calcLineWraps: u }, ot;
}
var ct, ma;
function Rs() {
  if (ma) return ct;
  ma = 1;
  function _(p) {
    const u = p.getMeterFraction(), d = u.num === 4 && u.den === 4;
    if (!(u.num === 2 && u.den === 2) && !d)
      throw new Error("notCommonTime");
    const i = p.deline();
    let n = [], t = !1;
    return i.forEach((e) => {
      if (e.subtitle)
        t && n.push({
          type: "subtitle",
          subtitle: e.subtitle.text
        });
      else if (e.text)
        t = !0, n.push({
          type: "text",
          text: e.text.text
        });
      else if (e.staff) {
        t = !0;
        const c = e.staff, v = g(c);
        n = n.concat(v);
      }
    }), r(n), o(n), a(n), n;
  }
  const m = ["break", "(break)", "no chord", "n.c.", "tacet"];
  function g(p) {
    const u = [];
    let d = "", f = [], i = { chord: ["", "", "", ""] }, n = "", t = "";
    if (p.forEach((e, c) => {
      e.voices && e.voices.forEach((v, h) => {
        let y = 0, w = 0;
        v.forEach((A) => {
          if (A.el_type === "part")
            f.length > 0 && c === 0 && h === 0 && (u.push({
              type: "part",
              name: d,
              lines: [f]
            }), f = []), d = A.title;
          else if (A.el_type === "note") {
            s(A, i);
            const P = Math.floor(y);
            if (A.chord && A.chord.length > 0) {
              const N = A.chord[0], T = N.position === "default" || m.indexOf(N.name.toLowerCase()) >= 0 ? N.name : "";
              T && (P > 0 && !i.chord[0] && (i.chord[0] = n), n = T, i.chord[P] ? P < 4 && !i.chord[P + 1] && (i.chord[P + 1] = T) : i.chord[P] = T), A.chord.forEach((q) => {
                q.position !== "default" && m.indexOf(N.name.toLowerCase()) < 0 && (i.annotations || (i.annotations = []), i.annotations.push(q.name));
              });
            }
            if (!A.rest || A.rest.type !== "spacer") {
              const N = A.duration === 0 && !A.rest ? 0.25 : A.duration, T = Math.floor(N * 4);
              if (T > 4)
                w += Math.floor(T / 4), y = 0;
              else {
                let q = N * 4;
                A.tripletMultiplier && (q *= A.tripletMultiplier), y += q;
              }
            }
          } else if (A.el_type === "bar") {
            if (t && (i.ending = t, t = ""), s(A, i), A.chord && A.chord.forEach((P) => {
              P.position !== "default" && (i.annotations || (i.annotations = []), i.annotations.push(P.name));
            }), (A.type === "bar_dbl_repeat" || A.type === "bar_left_repeat") && (i.hasStartRepeat = !0), (A.type === "bar_dbl_repeat" || A.type === "bar_right_repeat") && (i.hasEndRepeat = !0), A.startEnding && (t = A.startEnding), y >= 4) {
              if (i.chord[0] === "" && (i.chord[1] || i.chord[2] || i.chord[3]) && (i.chord[0] = l(f)), c === 0 && h === 0)
                f.push(i);
              else {
                let P = w, N = 0;
                for (; P >= u[N].lines[0].length && N < u.length; )
                  P -= u[N].lines[0].length, N++;
                if (N < u.length && P < u[N].lines[0].length) {
                  const T = u[N].lines[0][P];
                  !T.chord[0] && i.chord[0] && (T.chord[0] = i.chord[0]), !T.chord[1] && i.chord[1] && (T.chord[1] = i.chord[1]), !T.chord[2] && i.chord[2] && (T.chord[2] = i.chord[2]), !T.chord[3] && i.chord[3] && (T.chord[3] = i.chord[3]), i.annotations && (T.annotations ? T.annotations = T.annotations.concat(i.annotations) : T.annotations = i.annotations);
                }
                w++;
              }
              i = { chord: ["", "", "", ""] };
            } else
              i.chord = ["", "", "", ""];
            y = 0;
          } else A.el_type;
        }), c === 0 && h === 0 && u.push({
          type: "part",
          name: d,
          lines: [f]
        });
      });
    }), !n)
      throw new Error("noChords");
    return u;
  }
  function l(p) {
    for (let u = p.length - 1; u >= 0; u--)
      for (let d = p[u].chord.length - 1; d >= 0; d--)
        if (p[u].chord[d])
          return p[u].chord[d];
  }
  function r(p) {
    p.forEach((u) => {
      if (u.type === "part") {
        const d = u.lines[0], f = d.findIndex((n) => !!n.ending), i = d.findIndex((n, t) => t > f && !!n.ending);
        if (f >= 0 && i >= 0 && i - f === d.length - i) {
          let n = !0;
          for (let t = 0; t < i - f && n; t++) {
            const e = d[f + t], c = d[i + t];
            if (e.chord[0] !== c.chord[0] && (n = !1), e.chord[1] !== c.chord[1] && (n = !1), e.chord[2] !== c.chord[2] && (n = !1), e.chord[3] !== c.chord[3] && (n = !1), e.annotations && !c.annotations && (n = !1), !e.annotations && c.annotations && (n = !1), e.annotations && c.annotations)
              if (e.annotations.length !== c.annotations.length)
                n = !1;
              else
                for (let v = 0; v < e.annotations.length; v++)
                  e.annotations[v] !== c.annotations[v] && (n = !1);
          }
          n && (delete d[f].ending, d.splice(i, d.length - i));
        }
      }
    });
  }
  function o(p) {
    p.forEach((u) => {
      if (u.type === "part") {
        const d = [], f = u.lines[0];
        let i = !1;
        const n = f.findIndex((c) => !!c.hasEndRepeat);
        (n >= 0 ? Math.min(n + 1, f.length) : f.length) === 12 && (i = !0);
        const e = i ? 4 : 8;
        for (let c = 0; c < f.length; c += e) {
          const v = f.slice(c, c + e), h = v.findIndex((y) => !!y.hasEndRepeat);
          h >= 0 && h < v.length - 1 ? (d.push(v.slice(0, h + 1)), d.push(v.slice(h + 1))) : d.push(v);
        }
        for (let c = 0; c < d.length; c++)
          if (d[c][0].ending) {
            const v = Math.max(0, c - 1), h = d[v].length - d[c].length, y = [];
            for (let w = 0; w < h; w++)
              y.push({ noBorder: !0, chord: ["", "", "", ""] });
            d[c] = y.concat(d[c]);
          }
        u.lines = d;
      }
    });
  }
  function a(p) {
    p.forEach((u) => {
      if (u.lines) {
        let d = !1, f = "";
        u.lines.forEach((i) => {
          i.forEach((n) => {
            if (!n.noBorder) {
              const t = n.chord;
              !t[0] && !t[1] && !t[2] && !t[3] ? (d ? f && (t[0] = "%") : t[0] = f, d = !0) : !t[1] && !t[2] && !t[3] ? (d = !0, f = t[0]) : (d = !1, f = t[3] || t[2] || t[1]);
            }
          });
        });
      }
    });
  }
  function s(p, u) {
    if (p.decoration)
      for (let d = 0; d < p.decoration.length; d++)
        switch (p.decoration[d]) {
          case "fermata":
          case "segno":
          case "coda":
          case "D.C.":
          case "D.S.":
          case "D.C.alcoda":
          case "D.C.alfine":
          case "D.S.alcoda":
          case "D.S.alfine":
          case "fine":
            u.annotations || (u.annotations = []), u.annotations.push(p.decoration[d]);
            break;
        }
  }
  return ct = _, ct;
}
var lt, ya;
function Ce() {
  if (ya) return lt;
  ya = 1;
  var _ = {};
  return _.FONTEM = 360, _.FONTSIZE = 30, _.STEP = _.FONTSIZE * 93 / 720, _.SPACE = 10, _.TOPNOTE = 15, _.STAVEHEIGHT = 100, _.INDENT = 50, lt = _, lt;
}
var ft, wa;
function Is() {
  if (wa) return ft;
  wa = 1;
  const _ = _e();
  function m(a) {
    this.sections = [{ type: "startRepeat", index: -1 }], this.addBar = function(s) {
      var p = a.length - 1, u = s.type === "bar_left_repeat" || s.type === "bar_dbl_repeat", d = s.type === "bar_right_repeat" || s.type === "bar_dbl_repeat", f = s.startEnding ? o(s.startEnding) : void 0;
      d && (this.sections.length > 0 && this.sections[this.sections.length - 1].type === "endRepeat" && this.sections.push({ type: "startRepeat", index: this.sections[this.sections.length - 1].index }), this.sections.push({ type: "endRepeat", index: p })), f && this.sections.push({ type: "startEnding", index: p, endings: f }), u && this.sections.push({ type: "startRepeat", index: p });
    }, this.resolveRepeats = function() {
      var s, p = this.sections[this.sections.length - 1], u = a.length - 1;
      if (p.type === "startRepeat" ? p.end = u : p.index + 1 < u && this.sections.push({ type: "startRepeat", index: p.index + 1 }), this.sections.length < 2)
        return a;
      for (var d = [], f = null, i = 0; i < this.sections.length; i++) {
        var n = this.sections[i];
        switch (n.type) {
          case "startRepeat":
            if (f) {
              if (f.common.end || (f.common.end = n.index), f.endings)
                for (s = 0; s < f.endings.length; s++)
                  f.endings[s] && !f.endings[s].end && f.endings[s].start !== n.index && (f.endings[s].end = n.index);
              this.sections[i - 1].type === "endRepeat" && f.endings && f.endings.length && (f.endings[f.endings.length] = { start: -1, end: -1 }), d.push(f);
            }
            if (f) {
              var t = f.common.end;
              if (f.endings)
                for (s = 0; s < f.endings.length; s++)
                  f.endings[s] && (t = Math.max(t, f.endings[s].end));
              t < n.index - 1 && d.push({ common: { start: t + 1, end: n.index } });
            }
            f = { common: { start: n.index } };
            break;
          case "startEnding": {
            if (f)
              for (f.common.end || (f.common.end = n.index), f.endings || (f.endings = []), s = 0; s < n.endings.length; s++)
                f.endings[n.endings[s]] = { start: n.index + 1 };
            break;
          }
          case "endRepeat":
            if (f) {
              if (f.endings || (f.endings = []), f.endings.length > 0)
                for (s = 0; s < f.endings.length; s++)
                  f.endings[s] && !f.endings[s].end && (f.endings[s].end = n.index);
              f.common.end || (f.common.end = n.index);
            }
            break;
        }
      }
      if (f) {
        if (f.common.end || (f.common.end = u), f.endings)
          for (s = 0; s < f.endings.length; s++)
            f.endings[s] && !f.endings[s].end && (f.endings[s].end = u);
        d.push(f);
      }
      for (var e = [], c = -1, v = 0; v < d.length; v++) {
        var h = d[v];
        if (!h.endings)
          g(a, e, h.common.start, h.common.end);
        else if (h.endings.length === 0)
          g(a, e, h.common.start, h.common.end), g(a, e, h.common.start, h.common.end);
        else
          for (s = 0; s < h.endings.length; s++) {
            var y = h.endings[s];
            y && (g(a, e, h.common.start, h.common.end), y.start > 0 && g(a, e, y.start, y.end), c = Math.max(c, y.end));
          }
      }
      return e;
    };
  }
  function g(a, s, p, u) {
    p < 0 && (p = 0), s.length > 0 && a[p].el_type === "bar" && s[s.length - 1].el_type === "bar" && p++;
    for (var d = p; d <= u; d++) {
      var f, i = !1;
      if (a[d].el_type === "key" || a[d].el_type === "meter" || a[d].el_type === "tempo" || a[d].el_type === "instrument") {
        for (f = s.length - 1; f >= 0 && s[f].el_type !== a[d].el_type; )
          f--;
        f >= 0 && (a[d].el_type === "key" && r(a[d], s[f]) || a[d].el_type === "meter" && a[d].num === s[f].num && a[d].den === s[f].den || a[d].el_type === "instrument" && a[d].program === s[f].program || a[d].el_type === "tempo" && a[d].qpm === s[f].qpm) && (i = !0);
      }
      i || s.push(l(a[d]));
    }
  }
  function l(a) {
    var s = Object.assign({}, a);
    return s.pitches && (s.pitches = _.cloneArray(s.pitches)), s;
  }
  function r(a, s) {
    return !a.accidentals || !s.accidentals ? !1 : JSON.stringify(a.accidentals) === JSON.stringify(s.accidentals);
  }
  function o(a) {
    var s = [], p, u, d;
    if (a.indexOf(",") > 0)
      for (u = a.split(","), d = 0; d < u.length; d++)
        p = parseInt(u[d], 10), p > 0 && s.push(p);
    else if (a.indexOf("-") > 0) {
      u = a.split("-");
      var f = parseInt(u[0], 10), i = parseInt(u[1], 10);
      for (d = f; d <= i; d++)
        s.push(d);
    } else
      p = parseInt(a, 10), p > 0 && s.push(p);
    return s;
  }
  return ft = m, ft;
}
var ht, xa;
function Zi() {
  if (xa) return ht;
  xa = 1;
  var _, m = _e(), g = Is();
  return (function() {
    var l = 1, r = 128;
    _ = function(c, v) {
      v = v || {};
      var h, y = v.program || 0, w = v.midiTranspose || 0;
      c.visualTranspose && (w -= c.visualTranspose);
      var A = v.channel || 0, P = !1, N = v.drum || "", T = v.drumBars || 1, q = v.drumIntro || 0, I = N !== "", C = !!v.drumOff, B = [], R = 50;
      y = parseInt(y, 10), w = parseInt(w, 10), A = parseInt(A, 10), A === 10 && (y = r), N = N.split(" "), T = parseInt(T, 10), q = parseInt(q, 10);
      var S = c.formatting.bagpipes;
      S && (y = 71);
      var k = [];
      if (c.formatting.midi) {
        var M = c.formatting.midi;
        M.program && M.program.length > 0 && (y = M.program[0], M.program.length > 1 && (y = M.program[1], A = M.program[0]), P = !0), M.transpose && (w = M.transpose[0]), M.channel && (A = M.channel[0], P = !0), M.drum && (N = M.drum), M.drumbars && (T = M.drumbars[0]), M.drumon && (I = !0), A === 10 && (y = r), M.beat && k.push({ el_type: "beat", beats: M.beat }), M.nobeataccents && k.push({ el_type: "beataccents", value: !1 });
      }
      v.qpm ? h = parseInt(v.qpm, 10) : c.metaText.tempo ? h = d(c.metaText.tempo, c.getBeatLength()) : v.defaultQpm ? h = v.defaultQpm : h = 180;
      var F = [];
      S && F.push({ el_type: "bagpipes" }), F.push({ el_type: "instrument", program: y }), A && F.push({ el_type: "channel", channel: A }), w && F.push({ el_type: "transpose", transpose: w }), F.push({ el_type: "tempo", qpm: h });
      for (var L = 0; L < k.length; L++)
        F.push(k[L]);
      var b = [], x = [], E = [], D = [], O = [0], z = {};
      z[0] = { el_type: "tempo", qpm: h, timing: 0 };
      for (var H, $ = [], Q = !1, W = c.lines, ne = 0; ne < W.length; ne++) {
        var J = W[ne];
        if (J.staff) {
          let ve = function(ie) {
            var de = {
              //stressBeat1, stressBeatDown, stressBeatUp
              pppp: [15, 10, 5, 1],
              ppp: [30, 20, 10, 1],
              pp: [45, 35, 20, 1],
              p: [60, 50, 35, 1],
              mp: [75, 65, 50, 1],
              mf: [90, 80, 65, 1],
              f: [105, 95, 80, 1],
              ff: [120, 110, 95, 1],
              fff: [127, 125, 110, 1],
              ffff: [127, 125, 110, 1]
            }, me;
            if (ie.decoration) {
              if (ie.decoration.indexOf("pppp") >= 0 ? me = "pppp" : ie.decoration.indexOf("ppp") >= 0 ? me = "ppp" : ie.decoration.indexOf("pp") >= 0 ? me = "pp" : ie.decoration.indexOf("p") >= 0 ? me = "p" : ie.decoration.indexOf("mp") >= 0 ? me = "mp" : ie.decoration.indexOf("mf") >= 0 ? me = "mf" : ie.decoration.indexOf("f") >= 0 ? me = "f" : ie.decoration.indexOf("ff") >= 0 ? me = "ff" : ie.decoration.indexOf("fff") >= 0 ? me = "fff" : ie.decoration.indexOf("ffff") >= 0 && (me = "ffff"), me) {
                H = de[me].slice(0);
                let Me = [H];
                Array.isArray(ie.decoration) && (Me = [], ie.decoration.forEach((Ie) => {
                  Ie in de && Me.push(de[Ie].slice(0));
                })), b[U].push({ el_type: "beat", beats: H.slice(0), volumesPerNotePitch: Me }), E[oe] = !1, D[oe] = !1;
              }
              if (ie.decoration.indexOf("crescendo(") >= 0) {
                var he = o(ce, j, "crescendo)"), Ee = Math.min(127, H[0] + R), xe = a(ce, j + he + 1, Object.keys(de));
                xe && (Ee = de[xe][0]), he > 0 ? E[oe] = Math.floor((Ee - H[0]) / he) : E[oe] = !1, D[oe] = !1;
              } else if (ie.decoration.indexOf("crescendo)") >= 0)
                E[oe] = !1;
              else if (ie.decoration.indexOf("diminuendo(") >= 0) {
                var we = o(ce, j, "diminuendo)"), Le = Math.max(15, H[0] - R), Ae = a(ce, j + we + 1, Object.keys(de));
                Ae && (Le = de[Ae][0]), E[oe] = !1, we > 0 ? D[oe] = Math.floor((Le - H[0]) / we) : D[oe] = !1;
              } else ie.decoration.indexOf("diminuendo)") >= 0 && (D[oe] = !1);
            }
          };
          for (var te = J.staff, U = 0, re = 0; re < te.length; re++) {
            var V = te[re];
            if (!(V.clef && V.clef.type === "TAB"))
              for (var oe = 0; oe < V.voices.length; oe++) {
                var ce = V.voices[oe];
                if (!b[U]) {
                  b[U] = [].concat(JSON.parse(JSON.stringify(F)));
                  var ue = u(J.staff, U);
                  ue && b[U].unshift({ el_type: "name", trackName: ue }), $[U] = new g(b[U]);
                }
                if (w && V.clef.type === "perc" && b[U].push({ el_type: "transpose", transpose: 0 }), V.clef && V.clef.type === "perc" && !P)
                  for (var fe = 0; fe < b[U].length; fe++)
                    b[U][fe].el_type === "instrument" && (b[U][fe].program = r);
                else V.key && n(b[U], V.key);
                V.meter && t(b[U], V.meter), !Q && I && (b[U].push({ el_type: "drum", params: { pattern: N, bars: T, on: I, intro: q } }), Q = !0), V.clef && V.clef.type !== "perc" && V.clef.transpose && (V.clef.el_type = "clef", b[U].push({ el_type: "transpose", transpose: V.clef.transpose }), x[U] = !1), V.clef && V.clef.type && (V.clef.type.indexOf("-8") >= 0 ? (b[U].push({ el_type: "transpose", transpose: -12 }), x[U] = !0) : V.clef.type.indexOf("+8") >= 0 ? (b[U].push({ el_type: "transpose", transpose: 12 }), x[U] = !0) : x[U] && (b[U].push({ el_type: "transpose", transpose: 0 }), x[U] = !1)), c.formatting.midi && c.formatting.midi.drumoff && (b[U].push({ el_type: "bar" }), b[U].push({ el_type: "drum", params: { pattern: "", on: !1 } }));
                var be = 0, ge = 0, ye = 0, Y = 0;
                H = [105, 95, 85, 1];
                for (var j = 0; j < ce.length; j++) {
                  var G = ce[j];
                  switch (G.el_type) {
                    case "note":
                      if (E[oe] && (H[0] += E[oe], H[1] += E[oe], H[2] += E[oe], b[U].push({ el_type: "beat", beats: H.slice(0) })), D[oe] && (H[0] += D[oe], H[1] += D[oe], H[2] += D[oe], b[U].push({ el_type: "beat", beats: H.slice(0) })), ve(G), !G.rest || G.rest.type !== "spacer") {
                        var X = { elem: G, el_type: "note", timing: O[U] };
                        if (G.style ? X.style = G.style : B[U] && (X.style = B[U]), X.duration = G.duration === 0 ? 0.25 : G.duration, G.startTriplet) {
                          if (ge = G.tripletMultiplier, ye = G.startTriplet * ge * G.duration, G.startTriplet !== G.tripletR && j + G.tripletR <= ce.length) {
                            for (var K = 0, Z = j; Z < j + G.tripletR; Z++)
                              K += ce[Z].duration;
                            ye = ge * K;
                          }
                          X.duration = X.duration * ge, X.duration = Math.round(X.duration * 1e6) / 1e6, Y = X.duration;
                        } else ge && (G.endTriplet ? (ge = 0, X.duration = Math.round((ye - Y) * 1e6) / 1e6) : (X.duration = X.duration * ge, X.duration = Math.round(X.duration * 1e6) / 1e6, Y += X.duration));
                        G.rest && (X.rest = G.rest), G.decoration && (X.decoration = G.decoration.slice(0)), G.pitches && (X.pitches = m.cloneArray(G.pitches)), G.gracenotes && (X.gracenotes = m.cloneArray(G.gracenotes)), G.chord && (X.chord = m.cloneArray(G.chord)), b[U].push(X), G.style === "rhythm" && p(b), be++, O[U] += X.duration;
                      }
                      break;
                    case "key":
                    case "keySignature":
                      n(b[U], G);
                      break;
                    case "meter":
                      t(b[U], G);
                      break;
                    case "clef":
                      G.transpose && b[U].push({ el_type: "transpose", transpose: G.transpose }), G.type && (G.type.indexOf("-8") >= 0 ? b[U].push({ el_type: "transpose", transpose: -12 }) : G.type.indexOf("+8") >= 0 && b[U].push({ el_type: "transpose", transpose: 12 }));
                      break;
                    case "tempo":
                      h = d(G, c.getBeatLength()), b[U].push({ el_type: "tempo", qpm: h, timing: O[U] }), z["" + O[U]] = { el_type: "tempo", qpm: h, timing: O[U] };
                      break;
                    case "bar":
                      be > 0 && b[U].push({ el_type: "bar" }), ve(G), be = 0, $[U].addBar(G, U);
                      break;
                    case "style":
                      B[U] = G.head;
                      break;
                    case "timeSignature":
                      b[U].push(f(G));
                      break;
                    case "part":
                      break;
                    case "stem":
                    case "scale":
                    case "break":
                    case "font":
                      break;
                    case "midi":
                      var ae = !1;
                      switch (G.cmd) {
                        case "drumon":
                          I = !0, ae = !0;
                          break;
                        case "drumoff":
                          I = !1, ae = !0;
                          break;
                        case "drum":
                          N = G.params, ae = !0;
                          break;
                        case "drumbars":
                          T = G.params[0], ae = !0;
                          break;
                        case "drummap":
                          break;
                        case "channel":
                          G.params[0] === 10 && b[U].push({ el_type: "instrument", program: r });
                          break;
                        case "program":
                          e(b[U], { el_type: "instrument", program: G.params[0] }), P = !0;
                          break;
                        case "transpose":
                          b[U].push({ el_type: "transpose", transpose: G.params[0] });
                          break;
                        case "gchordoff":
                          b[U].push({ el_type: "gchordOn", tacet: !0 });
                          break;
                        case "gchordon":
                          b[U].push({ el_type: "gchordOn", tacet: !1 });
                          break;
                        case "beat":
                          b[U].push({ el_type: "beat", beats: G.params });
                          break;
                        case "nobeataccents":
                          b[U].push({ el_type: "beataccents", value: !1 });
                          break;
                        case "beataccents":
                          b[U].push({ el_type: "beataccents", value: !0 });
                          break;
                        case "vol":
                        case "volinc":
                          b[U].push({ el_type: G.cmd, volume: G.params[0] });
                          break;
                        case "swing":
                        case "gchord":
                        case "bassvol":
                        case "chordvol":
                          b[U].push({ el_type: G.cmd, param: G.params[0] });
                          break;
                        case "bassprog":
                        // MAE 22 May 2024
                        case "chordprog":
                          b[U].push({
                            el_type: G.cmd,
                            value: G.params[0],
                            octaveShift: G.params[1]
                          });
                          break;
                        // MAE 23 Jun 2024
                        case "gchordbars":
                          b[U].push({
                            el_type: G.cmd,
                            param: G.params[0]
                          });
                          break;
                        default:
                          console.log("MIDI seq: midi cmd not handled: ", G.cmd, G);
                      }
                      ae && (b[0].push({ el_type: "drum", params: { pattern: N, bars: T, intro: q, on: I } }), Q = !0);
                      break;
                    default:
                      console.log("MIDI: element type " + G.el_type + " not handled.");
                  }
                }
                U++, O[U] || (O[U] = 0);
              }
          }
        }
      }
      for (var le = 0; le < $.length; le++)
        b[le] = $[le].resolveRepeats();
      if (s(b, z), q)
        for (var ee = c.getPickupLength(), se = 0; se < b.length; se++) {
          for (var pe = 0; b[se][pe].el_type !== "note" && b[se].length > pe; )
            pe++;
          if (b[se].length > pe) {
            for (var Z = 0; Z < q; Z++)
              ee === 0 || Z < q - 1 ? (b[se].splice(
                pe,
                0,
                { el_type: "note", rest: { type: "rest" }, duration: l },
                { el_type: "bar" }
              ), pe += 2) : b[se].splice(pe++, 0, { el_type: "note", rest: { type: "rest" }, duration: l - ee });
            C && (I = !1, b[se].splice(pe++, 0, { el_type: "drum", params: { pattern: N, bars: T, intro: q, on: I } }), C = !1);
          }
        }
      return b.length > 0 && b[0].length > 0 && (b[0][0].pickupLength = c.getPickupLength()), b;
    };
    function o(c, v, h) {
      for (var y = 0, w = v + 1; w < c.length; w++)
        if (c[w].el_type === "note" && y++, c[w].decoration && c[w].decoration.indexOf(h) >= 0)
          return y;
      return y;
    }
    function a(c, v, h) {
      for (var y = Math.min(c.length, v + 3), w = v; w < y; w++)
        if (c[w].el_type === "note" && c[w].decoration) {
          for (var A = 0; A < c[w].decoration.length; A++)
            if (h.indexOf(c[w].decoration[A]) >= 0)
              return c[w].decoration[A];
        }
      return null;
    }
    function s(c, v) {
      if (!(!v || v.length === 0))
        for (var h = Object.keys(v), y = 0; y < c.length; y++)
          for (var w = c[y], A = v[0] ? v[0].qpm : 0, P = 0; P < w.length; P++) {
            var N = w[P];
            N.el_type === "tempo" && (A = N.qpm), h.indexOf("" + N.timing) >= 0 && A !== v["" + N.timing].qpm && (A = v["" + N.timing].qpm, N.el_type === "tempo" ? (N.qpm = v["" + N.timing].qpm, P++) : (c[y].splice(P, 0, { el_type: "tempo", qpm: v["" + N.timing].qpm, timing: N.timing }), P += 2));
          }
    }
    function p(c) {
      for (var v = 0; v < c.length; v++)
        for (var h = c[v], y = h.length - 1; y >= 0 && h[y].el_type !== "bar"; )
          h[y].noChordVoice = !0, y--;
    }
    function u(c, v) {
      if (!(!c || c.length <= v || !c[v].title))
        return c[v].title.join(" ");
    }
    function d(c, v) {
      var h = 0.25;
      c.duration && (h = c.duration[0]);
      var y = 60;
      return c.bpm && (y = c.bpm), h * y / v;
    }
    function f(c) {
      var v;
      switch (c.type) {
        case "common_time":
          v = { el_type: "meter", num: 4, den: 4 }, l = 4 / 4;
          break;
        case "cut_time":
          v = { el_type: "meter", num: 2, den: 2 }, l = 2 / 2;
          break;
        case "specified":
          let w = 0;
          if (c.value && c.value.length > 0 && c.value[0].num.indexOf("+") > 0)
            for (var h = c.value[0].num.split("+"), y = 0; y < h.length; y++)
              w += parseInt(h[y], 10);
          else
            w = parseInt(c.value[0].num, 10);
          v = { el_type: "meter", num: w, den: c.value[0].den }, l = w / parseInt(c.value[0].den, 10);
          break;
        default:
          v = { el_type: "meter" }, l = 1;
      }
      return v;
    }
    function i(c) {
      for (var v = [], h = 0; h < c.length; h++)
        c[h].acc !== "natural" && v.push(c[h]);
      return v;
    }
    function n(c, v) {
      var h;
      v.root === "HP" ? h = { el_type: "key", accidentals: [{ acc: "natural", note: "g" }, { acc: "sharp", note: "f" }, { acc: "sharp", note: "c" }] } : h = { el_type: "key", accidentals: i(v.accidentals) }, e(c, h);
    }
    function t(c, v) {
      var h = f(v);
      e(c, h);
    }
    function e(c, v) {
      for (var h = c.length - 1; h >= 0; h--)
        if (c[h].el_type === v.el_type) {
          JSON.stringify(c[h]) !== JSON.stringify(v) && c.push(v);
          return;
        }
      c.push(v);
    }
  })(), ht = _, ht;
}
var ut, Ca;
function Fs() {
  if (Ca) return ut;
  Ca = 1;
  var _ = function(d, f, i, n) {
    this.chordTrack = [], this.chordTrackFinished = !1, this.chordChannel = d, this.currentChords = [], this.lastChord, this.chordLastBar, this.chordsOff = !!f, this.gChordTacet = this.chordsOff, this.hasRhythmHead = !1, this.transpose = 0, this.lastBarTime = 0, this.meter = n, this.tempoChangeFactor = 1, this.bassInstrument = i.bassprog && i.bassprog.length >= 1 ? i.bassprog[0] : 0, this.chordInstrument = i.chordprog && i.chordprog.length >= 1 ? i.chordprog[0] : 0, this.bassOctaveShift = i.bassprog && i.bassprog.length === 2 ? i.bassprog[1] : 0, this.chordOctaveShift = i.chordprog && i.chordprog.length === 2 ? i.chordprog[1] : 0, this.boomVolume = i.bassvol && i.bassvol.length === 1 ? i.bassvol[0] : 64, this.chickVolume = i.chordvol && i.chordvol.length === 1 ? i.chordvol[0] : 48, i.gchord && i.gchord.length > 0 ? this.overridePattern = l(i.gchord[0]) : this.overridePattern = void 0;
  };
  _.prototype.setMeter = function(u) {
    this.meter = u;
  }, _.prototype.setTempoChangeFactor = function(u) {
    this.tempoChangeFactor = u;
  }, _.prototype.setLastBarTime = function(u) {
    this.lastBarTime = u;
  }, _.prototype.setTranspose = function(u) {
    this.transpose = u;
  }, _.prototype.setRhythmHead = function(u, d) {
    this.hasRhythmHead = u;
    var f = [];
    if (u && this.lastChord && this.lastChord.chick)
      for (var i = 0; i < this.lastChord.chick.length; i++) {
        var n = Object.assign({}, d.pitches[0]);
        n.actualPitch = this.lastChord.chick[i], f.push(n);
      }
    return f;
  }, _.prototype.barEnd = function(u) {
    this.chordTrack.length > 0 && !this.chordTrackFinished && (this.resolveChords(this.lastBarTime, s(u.time)), this.currentChords = []), this.chordLastBar = this.lastChord;
  }, _.prototype.gChordOn = function(u) {
    this.chordsOff || (this.gChordTacet = u.tacet);
  }, _.prototype.paramChange = function(u) {
    switch (u.el_type) {
      case "gchord":
        u.param && u.param.length > 0 ? this.overridePattern = l(u.param) : this.overridePattern = void 0;
        break;
      case "bassprog":
        this.bassInstrument = u.value, u.octaveShift != null && u.octaveShift != null ? this.bassOctaveShift = u.octaveShift : this.bassOctaveShift = 0;
        break;
      case "chordprog":
        this.chordInstrument = u.value, u.octaveShift != null && u.octaveShift != null ? this.chordOctaveShift = u.octaveShift : this.chordOctaveShift = 0;
        break;
      case "bassvol":
        this.boomVolume = u.param;
        break;
      case "chordvol":
        this.chickVolume = u.param;
        break;
      default:
        console.log("unhandled midi param", u);
    }
  }, _.prototype.finish = function() {
    this.chordTrackEmpty() || (this.chordTrackFinished = !0);
  }, _.prototype.addTrack = function(u) {
    this.chordTrackEmpty() || u.push(this.chordTrack);
  }, _.prototype.findChord = function(u) {
    if (this.gChordTacet)
      return "break";
    if (this.chordTrackFinished || !u.chord || u.chord.length === 0)
      return null;
    for (var d = 0; d < u.chord.length; d++) {
      var f = u.chord[d];
      if (f.position === "default")
        return f.name;
      if (this.breakSynonyms.indexOf(f.name.toLowerCase()) >= 0)
        return "break";
    }
    return null;
  }, _.prototype.interpretChord = function(u) {
    if (u.length !== 0) {
      if (u === "break")
        return { chick: [] };
      var d = u.substring(0, 1);
      if (d === "(") {
        if (u = u.substring(1, u.length - 1), u.length === 0)
          return;
        d = u.substring(0, 1);
      }
      var f = this.basses[d];
      if (f) {
        for (var i = this.transpose; i < -8; )
          i += 12;
        for (; i > 8; )
          i -= 12;
        f += i, f < 33 ? f += 12 : f > 44 && (f -= 12);
        var n = f;
        f += this.bassOctaveShift * 12;
        var t = f - 5, e;
        u.length === 1 && (e = this.chordNotes(f, ""));
        var c = u.substring(1), v = c.substring(0, 1);
        v === "b" || v === "♭" ? (n--, f--, t--, c = c.substring(1)) : (v === "#" || v === "♯") && (n++, f++, t++, c = c.substring(1));
        var h = c.split("/");
        if (e = this.chordNotes(n, h[0]), e.length >= 3) {
          var y = e[2] - e[0];
          t = t + y - 7;
        }
        if (h.length === 2) {
          var w = this.basses[h[1].substring(0, 1)];
          if (w) {
            var A = h[1].substring(1), P = { "#": 1, "♯": 1, b: -1, "♭": -1 }[A] || 0;
            f = this.basses[h[1].substring(0, 1)] + P + i, f += this.bassOctaveShift * 12, t = f;
          }
        }
        return { boom: f, boom2: t, chick: e };
      }
    }
  }, _.prototype.chordNotes = function(u, d) {
    d = d.replace(/♭/g, "b").replace(/♯/g, "#");
    var f = a[d];
    f || (d.slice(0, 2).toLowerCase() === "ma" || d[0] === "M" ? f = a.M : d[0] === "m" || d[0] === "-" ? f = a.m : f = a.M), u += 12, u += this.chordOctaveShift * 12;
    for (var i = [], n = 0; n < f.length; n++)
      i.push(u + f[n]);
    return i;
  }, _.prototype.writeNote = function(u, d, f, i, n, t) {
    u !== void 0 && this.chordTrack.push({ cmd: "note", pitch: u, volume: f, start: this.lastBarTime + i * p(d, this.tempoChangeFactor), duration: p(n, this.tempoChangeFactor), gap: 0, instrument: t });
  }, _.prototype.chordTrackEmpty = function() {
    for (var u = !0, d = 0; d < this.chordTrack.length && u; d++)
      this.chordTrack[d].cmd === "note" && (u = !1);
    return u;
  }, _.prototype.resolveChords = function(u, d) {
    if (!this.hasRhythmHead) {
      var f = this.meter.num, i = this.meter.den, n = 1 / i, t = n / 2, e = parseInt(f, 10) / parseInt(i, 10), c = e - (d - u) / this.tempoChangeFactor;
      Math.abs(c) < 1e-5 && (c = 0), (this.currentChords.length === 0 || this.currentChords[0].beat !== 0) && this.currentChords.unshift({ beat: 0, chord: this.chordLastBar });
      var v = r(this.currentChords, 8 * f / i), h = this.overridePattern ? this.overridePattern : this.rhythmPatterns[f + "/" + i];
      if (c) {
        h = [];
        for (var y = (d - u) / this.tempoChangeFactor * 8, w = 0; w < y / 2; w += 2)
          h.push("chick"), h.push("");
      }
      if (!h) {
        h = [];
        for (var w = 0; w < 8 * f / i / 2; w++)
          h.push("chick"), h.push("");
      }
      for (var A = !0, P = Math.min(h.length, v.length), w = 0; w < P; w++) {
        w > 0 && v[w - 1] && v[w] && v[w - 1].boom !== v[w].boom && (A = !0);
        var N = h[w], T = N.indexOf("boom") >= 0, q = !T && w !== 0 && h[0].indexOf("boom") >= 0 && (!v[w - 1] || v[w - 1].boom !== v[w].boom), I = m(v[w], N, A, q);
        T && (A = !1);
        for (var C = 0; C < I.length; C++)
          this.writeNote(
            I[C],
            0.125,
            T || q ? this.boomVolume : this.chickVolume,
            w,
            t,
            T || q ? this.bassInstrument : this.chordInstrument
          ), q ? q = !1 : T = !1;
      }
    }
  }, _.prototype.processChord = function(u) {
    if (!this.chordTrackFinished) {
      var d = this.findChord(u);
      if (d) {
        var f = this.interpretChord(d);
        if (f) {
          this.chordTrack.length === 0 && this.chordTrack.push({ cmd: "program", channel: this.chordChannel, instrument: this.chordInstrument }), this.lastChord = f;
          var i = o(this.lastBarTime, s(u.time));
          this.currentChords.push({ chord: this.lastChord, beat: i, start: s(u.time) });
        }
      }
    }
  };
  function m(u, d, f, i) {
    var n = [];
    if (!u)
      return n;
    d.indexOf("boom") >= 0 ? n.push(f ? u.boom : u.boom2) : i && n.push(u.boom);
    var t = u.chick.length;
    if (d.indexOf("chick") >= 0)
      for (var e = 0; e < t; e++)
        n.push(u.chick[e]);
    switch (d) {
      case "DO":
        n.push(u.chick[0]);
        break;
      case "MI":
        n.push(u.chick[1]);
        break;
      case "SOL":
        n.push(g(u, 2));
        break;
      case "TI":
        n.push(g(u, 3));
        break;
      case "TOP":
        n.push(g(u, 4));
        break;
      case "do":
        n.push(u.chick[0] + 12);
        break;
      case "mi":
        n.push(u.chick[1] + 12);
        break;
      case "sol":
        n.push(g(u, 2) + 12);
        break;
      case "ti":
        n.push(g(u, 3) + 12);
        break;
      case "top":
        n.push(g(u, 4) + 12);
        break;
    }
    return n;
  }
  function g(u, d) {
    var f = Math.floor(d / u.chick.length), i = u.chick[d % u.chick.length];
    return i + f * 12;
  }
  function l(u) {
    for (var d = [], f = 0; f < u.length; f++) {
      var i = u[f];
      switch (i) {
        case "z":
          d.push("");
          break;
        case "2":
          d.push("");
          break;
        // TODO-PER: This should extend the last note, but that's a small effect
        case "c":
          d.push("chick");
          break;
        case "b":
          d.push("boom&chick");
          break;
        case "f":
          d.push("boom");
          break;
        case "G":
          d.push("DO");
          break;
        case "H":
          d.push("MI");
          break;
        case "I":
          d.push("SOL");
          break;
        case "J":
          d.push("TI");
          break;
        case "K":
          d.push("TOP");
          break;
        case "g":
          d.push("do");
          break;
        case "h":
          d.push("mi");
          break;
        case "i":
          d.push("sol");
          break;
        case "j":
          d.push("ti");
          break;
        case "k":
          d.push("top");
          break;
      }
    }
    return d;
  }
  function r(u, d, f) {
    var i = [];
    if (u.length === 0)
      return i;
    for (var n = u[0].chord, t = 1; t < u.length; t++) {
      for (var e = u[t]; i.length < e.beat; )
        i.push(n);
      n = e.chord;
    }
    for (; i.length < d; )
      i.push(n);
    return i;
  }
  function o(u, d) {
    var f = d - u;
    return f * 8;
  }
  _.prototype.breakSynonyms = ["break", "(break)", "no chord", "n.c.", "tacet"], _.prototype.basses = {
    A: 33,
    B: 35,
    C: 36,
    D: 38,
    E: 40,
    F: 41,
    G: 43
  };
  var a = {
    // unusual chords
    "-addb2": [0, 1, 3, 7],
    maddb2: [0, 1, 3, 7],
    addb2: [0, 1, 4, 7],
    susb2: [0, 1, 7],
    "-add2": [0, 2, 3, 7],
    madd2: [0, 2, 3, 7],
    add2: [0, 2, 4, 7],
    sus2: [0, 2, 7],
    "-7sus2": [0, 2, 7, 10],
    "7sus2": [0, 2, 7, 10],
    m7sus2: [0, 2, 7, 10],
    min7sus2: [0, 2, 7, 10],
    "7sus2/9": [0, 2, 7, 10, 14],
    "add#2": [0, 3, 4, 7],
    "-add4": [0, 3, 5, 7],
    madd4: [0, 3, 5, 7],
    // diminished chords
    dim: [0, 3, 6],
    "m(b5)": [0, 3, 6],
    "°": [0, 3, 6],
    "˚": [0, 3, 6],
    "-add#4": [0, 3, 6, 7],
    "madd#4": [0, 3, 6, 7],
    dim7: [0, 3, 6, 9],
    "°7": [0, 3, 6, 9],
    "˚7": [0, 3, 6, 9],
    "-7(b5)": [0, 3, 6, 10],
    "-7b5": [0, 3, 6, 10],
    "m7(b5)": [0, 3, 6, 10],
    m7b5: [0, 3, 6, 10],
    ø: [0, 3, 6, 10],
    ø7: [0, 3, 6, 10],
    // minor chords
    "-": [0, 3, 7],
    m: [0, 3, 7],
    "-(b6)": [0, 3, 7, 8],
    "-b6": [0, 3, 7, 8],
    "m(b6)": [0, 3, 7, 8],
    mb6: [0, 3, 7, 8],
    "-6": [0, 3, 7, 9],
    m6: [0, 3, 7, 9],
    "-6(9)": [0, 3, 7, 9, 14],
    "-6/9": [0, 3, 7, 9, 14],
    "-69": [0, 3, 7, 9, 14],
    "m6(9)": [0, 3, 7, 9, 14],
    "m6/9": [0, 3, 7, 9, 14],
    m69: [0, 3, 7, 9, 14],
    "-7": [0, 3, 7, 10],
    m7: [0, 3, 7, 10],
    "-7(b9)": [0, 3, 7, 10, 13],
    "-7b9": [0, 3, 7, 10, 13],
    "-7(9)": [0, 3, 7, 10, 14],
    "-7/9": [0, 3, 7, 10, 14],
    "-9": [0, 3, 7, 10, 14],
    "m7(9)": [0, 3, 7, 10, 14],
    "m7/9": [0, 3, 7, 10, 14],
    m9: [0, 3, 7, 10, 14],
    "-7(9,11)": [0, 3, 7, 10, 14, 17],
    "-7/9/11": [0, 3, 7, 10, 14, 17],
    "m7(9,11)": [0, 3, 7, 10, 14, 17],
    "m7/9/11": [0, 3, 7, 10, 14, 17],
    "-13": [0, 3, 7, 10, 14, 17, 21],
    "-7(9,11,13)": [0, 3, 7, 10, 14, 17, 21],
    "-7/9/11/13": [0, 3, 7, 10, 14, 17, 21],
    m13: [0, 3, 7, 10, 14, 17, 21],
    "m7(9,11,13)": [0, 3, 7, 10, 14, 17, 21],
    "m7/9/11/13": [0, 3, 7, 10, 14, 17, 21],
    "-7(9,13)": [0, 3, 7, 10, 14, 21],
    "-7/9/13": [0, 3, 7, 10, 14, 21],
    "m7(9,13)": [0, 3, 7, 10, 14, 21],
    "m7/9/13": [0, 3, 7, 10, 14, 21],
    "-7(11)": [0, 3, 7, 10, 17],
    "-7/11": [0, 3, 7, 10, 17],
    "m7(11)": [0, 3, 7, 10, 17],
    "m7/11": [0, 3, 7, 10, 17],
    "-7(11,13)": [0, 3, 7, 10, 17, 21],
    "-7/11/13": [0, 3, 7, 10, 17, 21],
    "m7(11,13)": [0, 3, 7, 10, 17, 21],
    "m7/11/13": [0, 3, 7, 10, 17, 21],
    "-(maj7)": [0, 3, 7, 11],
    "-7M": [0, 3, 7, 11],
    "-maj7": [0, 3, 7, 11],
    "-∆7": [0, 3, 7, 11],
    "m(maj7)": [0, 3, 7, 11],
    mM7: [0, 3, 7, 11],
    "min(maj7)": [0, 3, 7, 11],
    "-9+7": [0, 3, 7, 11, 13],
    "-(maj9)": [0, 3, 7, 11, 14],
    "-7M(9)": [0, 3, 7, 11, 14],
    "-maj9": [0, 3, 7, 11, 14],
    "-∆9": [0, 3, 7, 11, 14],
    "m(maj9)": [0, 3, 7, 11, 14],
    mM9: [0, 3, 7, 11, 14],
    "min(maj9)": [0, 3, 7, 11, 14],
    "-11": [0, 3, 7, 11, 14, 17],
    m11: [0, 3, 7, 11, 14, 17],
    "-addb9": [0, 3, 7, 13],
    maddb9: [0, 3, 7, 13],
    "-add9": [0, 3, 7, 14],
    madd9: [0, 3, 7, 14],
    "-add11": [0, 3, 7, 17],
    madd11: [0, 3, 7, 17],
    "-add#11": [0, 3, 7, 18],
    "madd#11": [0, 3, 7, 18],
    // altered minor chords
    "-#5": [0, 3, 8],
    "-(#5)": [0, 3, 8],
    "m#5": [0, 3, 8],
    "m(#5)": [0, 3, 8],
    "-7#5": [0, 3, 8, 10],
    "-7(#5)": [0, 3, 8, 10],
    "dim7(b13)": [0, 3, 9, 20],
    "°7(b13)": [0, 3, 9, 20],
    "˚7(b13)": [0, 3, 9, 20],
    // altered major chords
    add4: [0, 4, 5, 7],
    "maj(b5)": [0, 4, 6],
    majb5: [0, 4, 6],
    "add#4": [0, 4, 6, 7],
    "7(b5)": [0, 4, 6, 10],
    "7b5": [0, 4, 6, 10],
    "7(b5,b9)": [0, 4, 6, 10, 13],
    "7(b9,b5)": [0, 4, 6, 10, 13],
    "7b5(b9)": [0, 4, 6, 10, 13],
    "7b9,b5": [0, 4, 6, 10, 13],
    "7b9b5": [0, 4, 6, 10, 13],
    "7(b5,b9,b13)": [0, 4, 6, 10, 13, 20],
    "7/b5/b9/b13": [0, 4, 6, 10, 13, 20],
    "7b5/b9/b13": [0, 4, 6, 10, 13, 20],
    "7(b5,b9,13)": [0, 4, 6, 10, 13, 21],
    "7/b5/b9/13": [0, 4, 6, 10, 13, 21],
    "7b5/b9/13": [0, 4, 6, 10, 13, 21],
    "7(9,b5)": [0, 4, 6, 10, 14],
    "7(b5,9)": [0, 4, 6, 10, 14],
    "7b5(9)": [0, 4, 6, 10, 14],
    "9b5": [0, 4, 6, 10, 14],
    "13(b5)": [0, 4, 6, 10, 14, 21],
    "13b5": [0, 4, 6, 10, 14, 21],
    "7(b5,9,13)": [0, 4, 6, 10, 14, 21],
    "7/b5/9/13": [0, 4, 6, 10, 14, 21],
    "7b5/9/13": [0, 4, 6, 10, 14, 21],
    "7#9b5": [0, 4, 6, 10, 15],
    "7(#9,b5)": [0, 4, 6, 10, 15],
    "7(b5,#9)": [0, 4, 6, 10, 15],
    "7b5(#9)": [0, 4, 6, 10, 15],
    "7(b5,#9,b13)": [0, 4, 6, 10, 15, 20],
    "7/b5/#9/b13": [0, 4, 6, 10, 15, 20],
    "7b5/#9/b13": [0, 4, 6, 10, 15, 20],
    "7(b5,#9,13)": [0, 4, 6, 10, 15, 21],
    "7/b5/#9/13": [0, 4, 6, 10, 15, 21],
    "7b5/#9/13": [0, 4, 6, 10, 15, 21],
    "7(b5,b13)": [0, 4, 6, 10, 20],
    "7/b5/b13": [0, 4, 6, 10, 20],
    "7b5/b13": [0, 4, 6, 10, 20],
    "7(b5,13)": [0, 4, 6, 10, 21],
    "7/b5/13": [0, 4, 6, 10, 21],
    "7b5(13)": [0, 4, 6, 10, 21],
    "7b5/13": [0, 4, 6, 10, 21],
    "7M(b5)": [0, 4, 6, 11],
    "maj7(b5)": [0, 4, 6, 11],
    maj7b5: [0, 4, 6, 11],
    "7M(b5,9)": [0, 4, 6, 11, 14],
    "maj7(b5,9)": [0, 4, 6, 11, 14],
    "maj7b5/9": [0, 4, 6, 11, 14],
    "7M(b5,9,13)": [0, 4, 6, 11, 14, 21],
    "maj7(b5,9,13)": [0, 4, 6, 11, 14, 21],
    "maj7b5/9/13": [0, 4, 6, 11, 14, 21],
    "7M(b5,13)": [0, 4, 6, 11, 21],
    "maj7(b5,13)": [0, 4, 6, 11, 21],
    "maj7b5/13": [0, 4, 6, 11, 21],
    // major chords
    M: [0, 4, 7],
    Δ: [0, 4, 7],
    "∆": [0, 4, 7],
    6: [0, 4, 7, 9],
    "6(9)": [0, 4, 7, 9, 14],
    "6/9": [0, 4, 7, 9, 14],
    69: [0, 4, 7, 9, 14],
    "6add9": [0, 4, 7, 9, 14],
    "6(9,11)": [0, 4, 7, 9, 14, 17],
    "6/9/11": [0, 4, 7, 9, 14, 17],
    6911: [0, 4, 7, 9, 14, 17],
    "6(9,#11)": [0, 4, 7, 9, 14, 18],
    "6/9/#11": [0, 4, 7, 9, 14, 18],
    "69#11": [0, 4, 7, 9, 14, 18],
    "6(11)": [0, 4, 7, 9, 17],
    "6/11": [0, 4, 7, 9, 17],
    611: [0, 4, 7, 9, 17],
    "6#11": [0, 4, 7, 9, 18],
    "6(#11)": [0, 4, 7, 9, 18],
    "6/#11": [0, 4, 7, 9, 18],
    7: [0, 4, 7, 10],
    "7(b9)": [0, 4, 7, 10, 13],
    "7b9": [0, 4, 7, 10, 13],
    "7(9)": [0, 4, 7, 10, 14],
    "7/9": [0, 4, 7, 10, 14],
    9: [0, 4, 7, 10, 14],
    "7(9,11)": [0, 4, 7, 10, 14, 17],
    "7/9/11": [0, 4, 7, 10, 14, 17],
    "7(9,11,13)": [0, 4, 7, 10, 14, 17, 21],
    "7/9/11/13": [0, 4, 7, 10, 14, 17, 21],
    "7#11": [0, 4, 7, 10, 14, 18],
    "7(#11)": [0, 4, 7, 10, 14, 18],
    "9#11": [0, 4, 7, 10, 14, 18],
    "9(#11)": [0, 4, 7, 10, 14, 18],
    "(13)": [0, 4, 7, 10, 14, 21],
    13: [0, 4, 7, 10, 14, 21],
    "7(9,13)": [0, 4, 7, 10, 14, 21],
    "7/9/13": [0, 4, 7, 10, 14, 21],
    "9/13": [0, 4, 7, 10, 14, 21],
    "7#9": [0, 4, 7, 10, 15],
    "7(#9)": [0, 4, 7, 10, 15],
    "7(#9,b13)": [0, 4, 7, 10, 15, 20],
    "7(11)": [0, 4, 7, 10, 17],
    "7/11": [0, 4, 7, 10, 17],
    "7(11,13)": [0, 4, 7, 10, 17, 21],
    "7/11/13": [0, 4, 7, 10, 17, 21],
    "13#11": [0, 4, 7, 10, 18, 21],
    "13(#11)": [0, 4, 7, 10, 18, 21],
    "7(b13)": [0, 4, 7, 10, 20],
    "7b13": [0, 4, 7, 10, 20],
    "7(13)": [0, 4, 7, 10, 21],
    "7/13": [0, 4, 7, 10, 21],
    "7M": [0, 4, 7, 11],
    maj7: [0, 4, 7, 11],
    Δ7: [0, 4, 7, 11],
    "∆7": [0, 4, 7, 11],
    "7M(9)": [0, 4, 7, 11, 14],
    "7M/9": [0, 4, 7, 11, 14],
    "maj7(9)": [0, 4, 7, 11, 14],
    "maj7/9": [0, 4, 7, 11, 14],
    maj9: [0, 4, 7, 11, 14],
    Δ9: [0, 4, 7, 11, 14],
    "∆9": [0, 4, 7, 11, 14],
    "7M(9,11)": [0, 4, 7, 11, 14, 17],
    "7M/9/11": [0, 4, 7, 11, 14, 17],
    maj11: [0, 4, 7, 11, 14, 17],
    "maj7(9,11)": [0, 4, 7, 11, 14, 17],
    "maj7/9/11": [0, 4, 7, 11, 14, 17],
    Δ11: [0, 4, 7, 11, 14, 17],
    "∆11": [0, 4, 7, 11, 14, 17],
    "7M(9,11,13)": [0, 4, 7, 11, 14, 17, 21],
    "7M/9/11/13": [0, 4, 7, 11, 14, 17, 21],
    maj13: [0, 4, 7, 11, 14, 17, 21],
    "maj7(9,11,13)": [0, 4, 7, 11, 14, 17, 21],
    "maj7/9/11/13": [0, 4, 7, 11, 14, 17, 21],
    "Δ11(13)": [0, 4, 7, 11, 14, 17, 21],
    Δ13: [0, 4, 7, 11, 14, 17, 21],
    "∆11(13)": [0, 4, 7, 11, 14, 17, 21],
    "7M(9,#11)": [0, 4, 7, 11, 14, 18],
    "7M/9/#11": [0, 4, 7, 11, 14, 18],
    "maj7(9,#11)": [0, 4, 7, 11, 14, 18],
    "maj7/9/#11": [0, 4, 7, 11, 14, 18],
    "maj9#11": [0, 4, 7, 11, 14, 18],
    "maj9(#11)": [0, 4, 7, 11, 14, 18],
    "maj9/#11": [0, 4, 7, 11, 14, 18],
    "Δ9(#11)": [0, 4, 7, 11, 14, 18],
    "7M(9,#11,13)": [0, 4, 7, 11, 14, 18, 21],
    "7M/9/#11/13": [0, 4, 7, 11, 14, 18, 21],
    "maj13#11": [0, 4, 7, 11, 14, 18, 21],
    "maj13(#11)": [0, 4, 7, 11, 14, 18, 21],
    "maj13/#11": [0, 4, 7, 11, 14, 18, 21],
    "Δ13(#11)": [0, 4, 7, 11, 14, 18, 21],
    "∆13(#11)": [0, 4, 7, 11, 14, 18, 21],
    "7M(9,13)": [0, 4, 7, 11, 14, 21],
    "7M/9/13": [0, 4, 7, 11, 14, 21],
    "maj7(9,13)": [0, 4, 7, 11, 14, 21],
    "maj7/9/13": [0, 4, 7, 11, 14, 21],
    "maj9(13)": [0, 4, 7, 11, 14, 21],
    "Δ9(13)": [0, 4, 7, 11, 14, 21],
    "∆9(13)": [0, 4, 7, 11, 14, 21],
    "7M(11)": [0, 4, 7, 11, 17],
    "7M/11": [0, 4, 7, 11, 17],
    "maj7(11)": [0, 4, 7, 11, 17],
    "maj7/11": [0, 4, 7, 11, 17],
    "Δ7(11)": [0, 4, 7, 11, 17],
    "∆7(11)": [0, 4, 7, 11, 17],
    "7M(#11)": [0, 4, 7, 11, 18],
    "7M/#11": [0, 4, 7, 11, 18],
    "maj7(#11)": [0, 4, 7, 11, 18],
    "maj7/#11": [0, 4, 7, 11, 18],
    "Δ7(#11)": [0, 4, 7, 11, 18],
    "∆7(#11)": [0, 4, 7, 11, 18],
    "7M(13)": [0, 4, 7, 11, 21],
    "7M/13": [0, 4, 7, 11, 21],
    "maj7(13)": [0, 4, 7, 11, 21],
    "maj7/13": [0, 4, 7, 11, 21],
    "Δ7(13)": [0, 4, 7, 11, 21],
    "∆7(13)": [0, 4, 7, 11, 21],
    addb9: [0, 4, 7, 13],
    add9: [0, 4, 7, 14],
    "add#9": [0, 4, 7, 15],
    add11: [0, 4, 7, 17],
    "add#11": [0, 4, 7, 18],
    // augmented chords
    "+": [0, 4, 8],
    aug: [0, 4, 8],
    "+7": [0, 4, 8, 10],
    "7#5": [0, 4, 8, 10],
    "7(#5)": [0, 4, 8, 10],
    "7+5": [0, 4, 8, 10],
    aug7: [0, 4, 8, 10],
    "7(b9,#5)": [0, 4, 8, 10, 13],
    "7b9#5": [0, 4, 8, 10, 13],
    "9#5": [0, 4, 8, 10, 14],
    "9(#5)": [0, 4, 8, 10, 14],
    "9+5": [0, 4, 8, 10, 14],
    "13#5": [0, 4, 8, 10, 14, 21],
    "13(#5)": [0, 4, 8, 10, 14, 21],
    "7M(#5)": [0, 4, 8, 11],
    "maj7#5": [0, 4, 8, 11],
    "maj7(#5)": [0, 4, 8, 11],
    "7M(#5,9)": [0, 4, 8, 11, 14],
    "maj7#5/9": [0, 4, 8, 11, 14],
    "maj7(#5,9)": [0, 4, 8, 11, 14],
    "maj7#5#11": [0, 4, 8, 11, 18],
    "maj7(#5,#11)": [0, 4, 8, 11, 18],
    // sus4 chords
    sus: [0, 5, 7],
    sus4: [0, 5, 7],
    "-7sus4": [0, 5, 7, 10],
    "7sus": [0, 5, 7, 10],
    "7sus4": [0, 5, 7, 10],
    m7sus4: [0, 5, 7, 10],
    min7sus4: [0, 5, 7, 10],
    "7sus(b9)": [0, 5, 7, 10, 13],
    "7sus4(b9)": [0, 5, 7, 10, 13],
    "-9sus4": [0, 5, 7, 10, 14],
    "7sus4(9)": [0, 5, 7, 10, 14],
    "7sus4/9": [0, 5, 7, 10, 14],
    "9sus": [0, 5, 7, 10, 14],
    "9sus4": [0, 5, 7, 10, 14],
    m9sus4: [0, 5, 7, 10, 14],
    min9sus4: [0, 5, 7, 10, 14],
    "11sus4": [0, 5, 7, 10, 14, 17],
    "13sus4": [0, 5, 7, 10, 14, 21],
    "7sus(#9)": [0, 5, 7, 10, 15],
    "7sus4(#9)": [0, 5, 7, 10, 15],
    "7sus4(11)": [0, 5, 7, 10, 17],
    "7sus4(13)": [0, 5, 7, 10, 21],
    "7Msus": [0, 5, 7, 11],
    "7Msus4": [0, 5, 7, 11],
    maj7sus: [0, 5, 7, 11],
    maj7sus4: [0, 5, 7, 11],
    // power chords and unusual chords
    "#4": [0, 6],
    b5: [0, 6],
    "sus#4": [0, 6, 7],
    "7Msus#4": [0, 6, 11],
    "maj7sus#4": [0, 6, 11],
    5: [0, 7],
    11: [0, 7, 10, 14, 17],
    "5(8)": [0, 7, 12],
    "5add8": [0, 7, 12],
    "5(9)": [0, 7, 14],
    "5add9": [0, 7, 14],
    "#5": [0, 8],
    b6: [0, 8]
  };
  _.prototype.rhythmPatterns = {
    "2/2": ["boom", "", "", "", "chick", "", "", ""],
    "3/2": ["boom", "", "", "", "chick", "", "", "", "chick", "", "", ""],
    "4/2": ["boom", "", "", "", "chick", "", "", "", "boom", "", "", "", "chick", "", "", ""],
    "2/4": ["boom", "", "chick", ""],
    "3/4": ["boom", "", "chick", "", "chick", ""],
    "4/4": ["boom", "", "chick", "", "boom", "", "chick", ""],
    "5/4": ["boom", "", "chick", "", "chick", "", "boom", "", "chick", ""],
    "6/4": ["boom", "", "chick", "", "boom", "", "chick", "", "boom", "", "chick", ""],
    "3/8": ["boom", "", "chick"],
    "5/8": ["boom", "chick", "chick", "boom", "chick"],
    "6/8": ["boom", "", "chick", "boom", "", "chick"],
    "7/8": ["boom", "chick", "chick", "boom", "chick", "boom", "chick"],
    "9/8": ["boom", "", "chick", "boom", "", "chick", "boom", "", "chick"],
    "10/8": ["boom", "chick", "chick", "boom", "chick", "chick", "boom", "chick", "boom", "chick"],
    "11/8": ["boom", "chick", "chick", "boom", "chick", "chick", "boom", "chick", "boom", "chick", "chick"],
    "12/8": ["boom", "", "chick", "boom", "", "chick", "boom", "", "chick", "boom", "", "chick"]
  };
  function s(u) {
    return u / 1e6;
  }
  function p(u, d) {
    return Math.round(u * d * 1e6) / 1e6;
  }
  return ut = _, ut;
}
var dt, ka;
function es() {
  if (ka) return dt;
  ka = 1;
  var _ = {
    f0: "_C",
    n0: "=C",
    s0: "^C",
    x0: "C",
    f1: "_D",
    n1: "=D",
    s1: "^D",
    x1: "D",
    f2: "_E",
    n2: "=E",
    s2: "^E",
    x2: "E",
    f3: "_F",
    n3: "=F",
    s3: "^F",
    x3: "F",
    f4: "_G",
    n4: "=G",
    s4: "^G",
    x4: "G",
    f5: "_A",
    n5: "=A",
    s5: "^A",
    x5: "A",
    f6: "_B",
    n6: "=B",
    s6: "^B",
    x6: "B",
    f7: "_c",
    n7: "=c",
    s7: "^c",
    x7: "c",
    f8: "_d",
    n8: "=d",
    s8: "^d",
    x8: "d",
    f9: "_e",
    n9: "=e",
    s9: "^e",
    x9: "e",
    f10: "_f",
    n10: "=f",
    s10: "^f",
    x10: "f",
    f11: "_g",
    n11: "=g",
    s11: "^g",
    x11: "g",
    f12: "_a",
    n12: "=a",
    s12: "^a",
    x12: "a",
    f13: "_b",
    n13: "=b",
    s13: "^b",
    x13: "b",
    f14: "_c'",
    n14: "=c'",
    s14: "^c'",
    x14: "c'",
    f15: "_d'",
    n15: "=d'",
    s15: "^d'",
    x15: "d'",
    f16: "_e'",
    n16: "=e'",
    s16: "^e'",
    x16: "e'"
  };
  function m(g) {
    var l = (g.accidental ? g.accidental[0] : "x") + g.verticalPos;
    return _[l];
  }
  return dt = m, dt;
}
var pt, _a;
function Os() {
  if (_a) return pt;
  _a = 1;
  var _, m = Fs(), g = es();
  return (function() {
    var l, r, o, a, s, p = 1, u, d, f, i, n, t, e = { num: 4, den: 4 }, c = 128, v, h = !0, y = 105, w = 95, A = 85, P = [[y, w, A]], N = 0.25, T, q, I = 0, C, B = {}, R, S = 0, k, M = 0, F = -1e-3, L = 0.4;
    _ = function(Y, j, G, X) {
      j || (j = {}), X || (X = {}), l = [], r = [0, 0, 0, 0, 0, 0, 0], a = [], s = j.qpm, p = 1, u = void 0, d = void 0, f = void 0, i = void 0, n = 0, k = G, e = { num: 4, den: 4 }, h = !0, y = 105, w = 95, A = 85, P = [], N = 0.25, T = void 0, q = void 0, I = 0, C = [], B = {}, R = 1, Y.length > 0 && Y[0].length > 0 && (S = Y[0][0].pickupLength), j.bassprog !== void 0 && !X.bassprog && (X.bassprog = [j.bassprog]), j.bassvol !== void 0 && !X.bassvol && (X.bassvol = [j.bassvol]), j.chordprog !== void 0 && !X.chordprog && (X.chordprog = [j.chordprog]), j.chordvol !== void 0 && !X.chordvol && (X.chordvol = [j.chordvol]), j.gchord !== void 0 && !X.gchord && (X.gchord = [j.gchord]), t = new m(Y.length, j.chordsOff, X, e), D(Y, j);
      for (var K = 0; K < Y.length; K++) {
        o = 0, t.setTranspose(o);
        var Z = Y[K];
        f = [{ cmd: "program", channel: K, instrument: u }], i = void 0, v = 0, t.setLastBarTime(0);
        var ae = !1;
        (j.voicesOff === !0 || j.voicesOff && j.voicesOff.length && j.voicesOff.indexOf(K) >= 0) && (ae = !0);
        for (var le = 0; le < Z.length; le++) {
          var ee = Z[le];
          switch (ee.el_type) {
            case "name":
              i = { cmd: "text", type: "name", text: ee.trackName };
              break;
            case "note":
              W(ee, ae);
              break;
            case "key":
              r = U(ee);
              break;
            case "meter":
              e = ee, t.setMeter(e), N = O(e), be();
              break;
            case "tempo":
              s ? p = ee.qpm ? s / ee.qpm : 1 : s = ee.qpm, t.setTempoChangeFactor(p);
              break;
            case "transpose":
              o = ee.transpose, t.setTranspose(o);
              break;
            case "bar":
              t.barEnd(ee), l = [], K === 0 && ge(Y.length + 1), t.setRhythmHead(!1), v = x(ee.time), t.setLastBarTime(v);
              break;
            case "bagpipes":
              break;
            case "instrument":
              if (u === void 0 && (u = ee.program), d = ee.program, f.length > 0 && f[f.length - 1].cmd === "program")
                f[f.length - 1].instrument = ee.program;
              else {
                var se;
                for (se = f.length - 1; se >= 0 && f[se].cmd !== "program"; se--)
                  ;
                (se < 0 || f[se].instrument !== ee.program) && f.push({ cmd: "program", channel: 0, instrument: ee.program });
              }
              break;
            case "channel":
              b(ee.channel);
              break;
            case "drum":
              B = fe(ee.params), be();
              break;
            case "gchordOn":
              t.gChordOn(ee);
              break;
            case "beat":
              y = ee.beats[0], w = ee.beats[1], A = ee.beats[2], ee.volumesPerNotePitch ? P = ee.volumesPerNotePitch : P = [];
              break;
            case "vol":
              T = ee.volume;
              break;
            case "volinc":
              q = ee.volume;
              break;
            case "beataccents":
              h = ee.value;
              break;
            case "gchord":
            case "bassprog":
            case "chordprog":
            case "bassvol":
            case "chordvol":
            case "gchordbars":
              t.paramChange(ee);
              break;
            default:
              console.log("MIDI creation. Unknown el_type: " + ee.el_type + `
`);
              break;
          }
        }
        f[0].instrument === void 0 && (f[0].instrument = u || 0), i && f.unshift(i), a.push(f), t.finish(), C.length > 0;
      }
      return j.detuneOctave && ye(a, parseInt(j.detuneOctave, 10)), t.addTrack(a), C.length > 0 && a.push(C), { tempo: s, instrument: u, tracks: a, totalDuration: n };
    };
    function b(Y) {
      for (var j = f.length - 1; j >= 0; j--)
        if (f[j].cmd === "program") {
          f[j].channel = Y;
          return;
        }
    }
    function x(Y) {
      return Y / 1e6;
    }
    function E(Y) {
      return Math.round(Y * p * 1e6) / 1e6;
    }
    function D(Y, j) {
      for (var G = 0; G < Y.length; G++) {
        for (var X = Y[G], K = {}, Z = j.qpm, ae = 0, le = 1, ee = 0; ee < X.length; ee++) {
          var se = X[ee];
          if (se.el_type === "tempo") {
            Z ? le = se.qpm ? Z / se.qpm : 1 : Z = se.qpm;
            continue;
          }
          se.time = ae;
          var pe = se.duration ? se.duration : 0;
          if (ae += Math.round(pe * le * 1e6), se.pitches) {
            for (var ve = 0; ve < se.pitches.length; ve++) {
              var ie = se.pitches[ve];
              if (ie) {
                if (ie.duration = se.duration, ie.startTie)
                  K[ie.pitch] === void 0 ? K[ie.pitch] = { el: ee, pitch: ve } : (X[K[ie.pitch].el].pitches[K[ie.pitch].pitch].duration += ie.duration, se.pitches[ve] = null);
                else if (ie.endTie) {
                  var de = K[ie.pitch];
                  if (de) {
                    var me = ie.duration;
                    delete X[de.el].pitches[de.pitch].startTie, X[de.el].pitches[de.pitch].duration += me, se.pitches[ve] = null, delete K[ie.pitch];
                  } else
                    delete ie.endTie;
                }
              }
            }
            delete se.duration;
          }
        }
        for (var he in K)
          if (K.hasOwnProperty(he)) {
            var Ee = K[he];
            delete X[Ee.el].pitches[Ee.pitch].startTie;
          }
      }
    }
    function O(Y) {
      switch (parseInt(Y.den, 10)) {
        case 2:
          return 0.5;
        case 4:
          return 0.25;
        case 8:
          return Y.num % 3 === 0 ? 0.375 : 0.125;
        case 16:
          return 0.125;
      }
      return 0.25;
    }
    function z(Y, j, G) {
      var X = G - Y;
      return X / j;
    }
    function H(Y, j, G) {
      if (j)
        return 0;
      let X = y, K = w, Z = A;
      G !== void 0 && P.length >= G + 1 && (X = P[G][0], K = P[G][1], Z = P[G][2]);
      var ae;
      if (T !== void 0)
        ae = T, T = void 0;
      else if (!h)
        ae = K;
      else if (S > Y)
        ae = Z;
      else {
        var le = z(v, O(e), Y);
        le === 0 ? ae = X : parseInt(le, 10) === le ? ae = K : ae = Z;
      }
      return q && (ae += q, q = void 0), ae < 0 && (ae = 0), ae > 127 && (ae = 127), j ? 0 : ae;
    }
    function $(Y, j) {
      var G = {};
      if (Y.decoration)
        for (var X = 0; X < Y.decoration.length; X++)
          Y.decoration[X] === "staccato" ? G.thisBreakBetweenNotes = "staccato" : Y.decoration[X] === "tenuto" ? G.thisBreakBetweenNotes = "tenuto" : Y.decoration[X] === "accent" ? G.velocity = Math.min(127, j * 1.5) : Y.decoration[X] === "trill" ? G.noteModification = "trill" : Y.decoration[X] === "lowermordent" ? G.noteModification = "lowermordent" : Y.decoration[X] === "uppermordent" ? G.noteModification = "pralltriller" : Y.decoration[X] === "mordent" ? G.noteModification = "mordent" : Y.decoration[X] === "turn" ? G.noteModification = "turn" : Y.decoration[X] === "roll" ? G.noteModification = "roll" : Y.decoration[X] === "pralltriller" ? G.noteModification = "pralltriller" : Y.decoration[X] === "trillh" && (G.noteModification = "trillh");
      return G;
    }
    function Q(Y, j) {
      var G = j.start, X = j.duration, K = E(1 / 32);
      switch (Y) {
        case "trill":
          for (var Z = 2; X > 0; )
            f.push({ cmd: "note", pitch: j.pitch + Z, volume: j.volume, start: G, duration: K, gap: 0, instrument: d, style: "decoration" }), Z = Z === 2 ? 0 : 2, X -= K, G += K;
          break;
        case "trillh":
          for (var Z = 1; X > 0; )
            f.push({
              cmd: "note",
              pitch: j.pitch + Z,
              volume: j.volume,
              start: G,
              duration: K,
              gap: 0,
              instrument: d,
              style: "decoration"
            }), Z = Z === 1 ? 0 : 1, X -= K, G += K;
          break;
        case "pralltriller":
          f.push({ cmd: "note", pitch: j.pitch, volume: j.volume, start: G, duration: K, gap: 0, instrument: d, style: "decoration" }), X -= K, G += K, f.push({ cmd: "note", pitch: j.pitch + 2, volume: j.volume, start: G, duration: K, gap: 0, instrument: d, style: "decoration" }), X -= K, G += K, f.push({ cmd: "note", pitch: j.pitch, volume: j.volume, start: G, duration: X, gap: 0, instrument: d });
          break;
        case "mordent":
        case "lowermordent":
          f.push({ cmd: "note", pitch: j.pitch, volume: j.volume, start: G, duration: K, gap: 0, instrument: d, style: "decoration" }), X -= K, G += K, f.push({ cmd: "note", pitch: j.pitch - 2, volume: j.volume, start: G, duration: K, gap: 0, instrument: d, style: "decoration" }), X -= K, G += K, f.push({ cmd: "note", pitch: j.pitch, volume: j.volume, start: G, duration: X, gap: 0, instrument: d });
          break;
        case "turn":
          K = j.duration / 4, f.push({ cmd: "note", pitch: j.pitch + 2, volume: j.volume, start: G, duration: K, gap: 0, instrument: d, style: "decoration" }), f.push({ cmd: "note", pitch: j.pitch, volume: j.volume, start: G + K, duration: K, gap: 0, instrument: d, style: "decoration" }), f.push({ cmd: "note", pitch: j.pitch - 1, volume: j.volume, start: G + K * 2, duration: K, gap: 0, instrument: d, style: "decoration" }), f.push({ cmd: "note", pitch: j.pitch, volume: j.volume, start: G + K * 3, duration: K, gap: 0, instrument: d, style: "decoration" });
          break;
        case "roll":
          for (; X > 0; )
            f.push({ cmd: "note", pitch: j.pitch, volume: j.volume, start: G, duration: K, gap: 0, instrument: d, style: "decoration" }), X -= K * 2, G += K * 2;
          break;
      }
    }
    function W(Y, j) {
      var G = H(x(Y.time), j);
      t.processChord(Y);
      var X;
      if (Y.gracenotes && Y.pitches && Y.pitches.length > 0 && Y.pitches[0] && (X = re(Y.gracenotes, Y.pitches[0].duration), Y.elem && (Y.elem.midiGraceNotePitches = V(X, x(Y.time), G * 2 / 3, d))), Y.elem) {
        var K = x(Y.time), Z = K / N / s * 60 * 1e3;
        if (Y.elem.currentTrackMilliseconds === void 0)
          Y.elem.currentTrackMilliseconds = Z, Y.elem.currentTrackWholeNotes = K;
        else if (Y.elem.currentTrackMilliseconds.length === void 0)
          Y.elem.currentTrackMilliseconds !== Z && (Y.elem.currentTrackMilliseconds = [Y.elem.currentTrackMilliseconds, Z], Y.elem.currentTrackWholeNotes = [Y.elem.currentTrackWholeNotes, K]);
        else {
          for (var ae = !1, le = 0; le < Y.elem.currentTrackMilliseconds.length; le++)
            Y.elem.currentTrackMilliseconds[le] === Z && (ae = !0);
          ae || (Y.elem.currentTrackMilliseconds.push(Z), Y.elem.currentTrackWholeNotes.push(K));
        }
      }
      if (Y.pitches) {
        var ee = "", se = $(Y, G);
        se.thisBreakBetweenNotes && (ee = se.thisBreakBetweenNotes), se.velocity && (G = se.velocity);
        var pe = Y.pitches;
        Y.style === "rhythm" && (pe = t.setRhythmHead(!0, Y)), Y.elem && (Y.elem.midiPitches = []);
        for (var ve = 0; ve < pe.length; ve++) {
          let we = G;
          !se.velocity && Array.isArray(Y.decoration) && Y.decoration.length > ve && (we = H(x(Y.time), j, ve));
          var ie = pe[ve];
          if (ie) {
            ie.startSlur && (I += ie.startSlur.length), ie.endSlur && (I -= ie.endSlur.length);
            var de = ie.actualPitch ? ie.actualPitch : te(ie);
            if (d === c && k) {
              var me = g(ie);
              me && k[me] && (de = k[me].sound);
            }
            var he = { cmd: "note", pitch: de, volume: we, start: x(Y.time), duration: E(ie.duration), instrument: d, startChar: Y.elem.startChar, endChar: Y.elem.endChar };
            if (he = oe(he), Y.gracenotes && (he.duration = he.duration / 2, he.start = he.start + he.duration), Y.elem && Y.elem.midiPitches.push(he), se.noteModification)
              Q(se.noteModification, he);
            else {
              switch (I > 0 ? he.endType = "tenuto" : ee && (he.endType = ee), he.endType) {
                case "tenuto":
                  he.gap = F;
                  break;
                case "staccato":
                  var Ee = he.duration * L;
                  he.gap = s / 60 * Ee;
                  break;
                default:
                  he.gap = M;
                  break;
              }
              f.push(he);
            }
          }
        }
        f.length - 1;
      }
      var xe = ne(Y);
      n = Math.max(n, x(Y.time) + E(xe));
    }
    function ne(Y) {
      return Y.pitches && Y.pitches.length > 0 && Y.pitches[0] ? Y.pitches[0].duration : Y.elem ? Y.elem.duration : Y.duration;
    }
    var J = [0, 2, 4, 5, 7, 9, 11];
    function te(Y) {
      if (Y.midipitch !== void 0)
        return Y.midipitch;
      var j = Y.pitch;
      if (Y.accidental)
        switch (Y.accidental) {
          // change that pitch (not other octaves) for the rest of the bar
          case "sharp":
            l[j] = 1;
            break;
          case "flat":
            l[j] = -1;
            break;
          case "natural":
            l[j] = 0;
            break;
          case "dblsharp":
            l[j] = 2;
            break;
          case "dblflat":
            l[j] = -2;
            break;
          case "quartersharp":
            l[j] = 0.25;
            break;
          case "quarterflat":
            l[j] = -0.25;
            break;
        }
      var G = ce(j) * 12 + J[ue(j)] + 60;
      return l[j] !== void 0 ? G += l[j] : G += r[ue(j)], G += o, G;
    }
    function U(Y) {
      var j = [0, 0, 0, 0, 0, 0, 0];
      if (!Y.accidentals) return j;
      for (var G = 0; G < Y.accidentals.length; G++) {
        var X = Y.accidentals[G], K;
        switch (X.acc) {
          case "flat":
            K = -1;
            break;
          case "quarterflat":
            K = -0.25;
            break;
          case "sharp":
            K = 1;
            break;
          case "quartersharp":
            K = 0.25;
            break;
          default:
            K = 0;
            break;
        }
        var Z = X.note.toLowerCase(), ae = ue(Z.charCodeAt(0) - 99);
        j[ae] += K;
      }
      return j;
    }
    function re(Y, j) {
      for (var G = 0, X = [], K, Z = 0; Z < Y.length; Z++)
        K = Y[Z], G += K.duration;
      var ae = j / 2 / G;
      for (Z = 0; Z < Y.length; Z++) {
        K = Y[Z];
        var le = te(K);
        if (d === c && k) {
          var ee = g(K);
          ee && k[ee] && (le = k[ee].sound);
        }
        var se = { pitch: le, duration: K.duration * ae };
        se = oe(se), X.push(se);
      }
      return X;
    }
    function V(Y, j, G, X) {
      var K = [];
      G = Math.round(G);
      for (var Z = 0; Z < Y.length; Z++) {
        var ae = Y[Z];
        f.push({ cmd: "note", pitch: ae.pitch, volume: G, start: j, duration: ae.duration, gap: 0, instrument: X, style: "grace" }), K.push({
          pitch: ae.pitch,
          durationInMeasures: ae.duration,
          volume: G,
          instrument: X
        }), j += ae.duration;
      }
      return K;
    }
    function oe(Y) {
      var j = "" + Y.pitch;
      return j.indexOf(".75") >= 0 ? (Y.pitch = Math.round(Y.pitch), Y.cents = -50) : j.indexOf(".25") >= 0 && (Y.pitch = Math.round(Y.pitch), Y.cents = 50), Y;
    }
    function ce(Y) {
      return Math.floor(Y / 7);
    }
    function ue(Y) {
      return Y = Y % 7, Y < 0 && (Y += 7), Y;
    }
    function fe(Y) {
      if (Y.pattern.length === 0 || Y.on === !1)
        return { on: !1 };
      for (var j = Y.pattern[0], G = [], X = "", K = 0, Z = 0; Z < j.length; Z++)
        if (j[Z] === "d" && K++, j[Z] === "d" || j[Z] === "z")
          X.length !== 0 ? (G.push(X), X = j[Z]) : X = X + j[Z];
        else {
          if (X.length === 0)
            return { on: !1 };
          X = X + j[Z];
        }
      if (X.length !== 0 && G.push(X), Y.pattern.length !== K * 2 + 1)
        return { on: !1 };
      for (var ae = { on: !0, bars: Y.bars, pattern: [] }, le = O(e), ee = 0, se = 0; se < G.length; se++) {
        X = G[se];
        for (var pe = 1, ve = !1, ie = 0, de = 1; de < X.length; de++)
          switch (X[de]) {
            case "/":
              ie !== 0 && (pe *= ie), ie = 0, ve = !0;
              break;
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
              ie = ie * 10 + X[de];
              break;
            default:
              return { on: !1 };
          }
        ve ? (ie === 0 && (ie = 2), pe /= ie) : ie && (pe *= ie), X[0] === "d" ? (ae.pattern.push({ len: pe * le, pitch: Y.pattern[1 + ee], velocity: Y.pattern[1 + ee + K] }), ee++) : ae.pattern.push({ len: pe * le, pitch: null });
      }
      return R = Y.bars ? Y.bars : 1, ae;
    }
    function be() {
      if (!(!B || !B.pattern)) {
        for (var Y = B, j = 0, G = e.num / e.den, X = 0; X < Y.pattern.length; X++)
          j += Y.pattern[X].len;
        var K = j / R / G;
        for (X = 0; X < Y.pattern.length; X++)
          Y.pattern[X].len = Y.pattern[X].len / K;
        B = Y;
      }
    }
    function ge(Y) {
      if (!(C.length === 0 && !B.on)) {
        var j = e.num / e.den;
        if (C.length === 0) {
          if (n < j)
            return;
          C.push({ cmd: "program", channel: Y, instrument: c });
        }
        if (B.on)
          for (var G = v, X = 0; X < B.pattern.length; X++) {
            var K = E(B.pattern[X].len);
            B.pattern[X].pitch && C.push({
              cmd: "note",
              pitch: B.pattern[X].pitch,
              volume: B.pattern[X].velocity,
              start: G,
              duration: K,
              gap: 0,
              instrument: c
            }), G += K;
          }
      }
    }
    function ye(Y, j) {
      for (var G = {}, X = 0; X < Y.length; X++)
        for (var K = 0; K < Y[X].length; K++) {
          var Z = Y[X][K];
          Z.cmd === "note" && (G[Z.start] === void 0 && (G[Z.start] = []), G[Z.start].push({ track: X, event: K, pitch: Z.pitch }));
        }
      var ae = Object.keys(G);
      for (X = 0; X < ae.length; X++) {
        var le = G[ae[X]];
        if (le.length > 1) {
          le = le.sort(function(ie, de) {
            return ie.pitch - de.pitch;
          });
          var ee = le[le.length - 1], se = ee.pitch % 12, pe = !1;
          for (K = 0; !pe && K < le.length - 1; K++)
            le[K].pitch % 12 === se && (pe = !0);
          if (pe) {
            var ve = Y[ee.track][ee.event];
            ve.cents || (ve.cents = 0), ve.cents += j;
          }
        }
      }
    }
  })(), pt = _, pt;
}
var vt, Ta;
function Hs() {
  if (Ta) return vt;
  Ta = 1;
  function _(p, u) {
    u || (u = {});
    for (var d = !!u.lineBreaks, f = [], i = !1, n = [], t = [], e = [], c = [], v = [], h = [], y = [], w = 0; w < p.length; w++) {
      var A = s(p[w]);
      if (A.staff) {
        if (i && !A.vskip)
          for (var P = f[f.length - 1], N = 0; N < P.staff.length; N++) {
            var T = A.staff[N], q = P.staff[N];
            if (T && (a(T.meter, n[N]) || (g(T.meter, T.voices), n[N] = T.meter, delete T.meter), a(T.key, t[N]) || (l(T.key, T.voices), t[N] = T.key, delete T.key), T.title && (q.abbrevTitle = T.title), a(T.clef, e[N]) || (r(T.clef, T.voices), e[N] = T.clef, delete T.clef), a(T.vocalfont, c[N]) || (o(T.vocalfont, T.voices, "vocalfont"), c[N] = T.vocalfont, delete T.vocalfont), a(T.gchordfont, v[N]) || (o(T.gchordfont, T.voices, "gchordfont"), v[N] = T.gchordfont, delete T.gchordfont), a(T.tripletfont, h[N]) || (o(T.tripletfont, T.voices, "tripletfont"), h[N] = T.tripletfont, delete T.tripletfont), a(T.annotationfont, y[N]) || (o(T.annotationfont, T.voices, "annotationfont"), y[N] = T.annotationfont, delete T.annotationfont)), T)
              for (var I = 0; I < q.voices.length; I++) {
                var C = q.voices[I], B = T.voices[I];
                d && C.push({ el_type: "break" }), B && (q.voices[I] = C.concat(B));
              }
          }
        else {
          for (var R = 0; R < A.staff.length; R++)
            t[R] = A.staff[R].key, n[R] = A.staff[R].meter, e[R] = A.staff[R].clef;
          f.push(s(A));
        }
        i = !0;
      } else
        i = !1, f.push(A);
    }
    return f;
  }
  function m(p, u) {
    return p === "abselem" ? "abselem" : u;
  }
  function g(p, u) {
    p.el_type = "meter", p.startChar = -1, p.endChar = -1;
    for (var d = 0; d < u.length; d++)
      u[d].unshift(p);
  }
  function l(p, u) {
    p.el_type = "key", p.startChar = -1, p.endChar = -1;
    for (var d = 0; d < u.length; d++)
      u[d].unshift(p);
  }
  function r(p, u) {
    p.el_type = "clef", p.startChar = -1, p.endChar = -1;
    for (var d = 0; d < u.length; d++)
      u[d].unshift(p);
  }
  function o(p, u, d) {
    p.el_type = "font", p.type = d, p.startChar = -1, p.endChar = -1;
    for (var f = 0; f < u.length; f++)
      u[f].unshift(p);
  }
  function a(p, u) {
    if (!p)
      return !0;
    var d = JSON.stringify(p, m), f = JSON.stringify(u, m);
    return d === f;
  }
  function s(p) {
    for (var u = {}, d = Object.keys(p), f = 0; f < d.length; f++)
      if (d[f] !== "staff")
        u[d[f]] = p[d[f]];
      else {
        u.staff = [];
        for (var i = 0; i < p.staff.length; i++) {
          for (var n = {}, t = Object.keys(p.staff[i]), e = 0; e < t.length; e++)
            if (t[e] !== "voices")
              n[t[e]] = p.staff[i][t[e]];
            else {
              n.voices = [];
              for (var c = 0; c < p.staff[i].voices.length; c++)
                n.voices.push([].concat(p.staff[i].voices[c]));
            }
          u.staff.push(n);
        }
      }
    return u;
  }
  return vt = _, vt;
}
var gt, Sa;
function ts() {
  if (Sa) return gt;
  Sa = 1;
  var _ = _e(), m = Ce(), g = Zi(), l = Os(), r = Hs(), o = function() {
    this.reset = function() {
      this.version = "1.1.0", this.media = "screen", this.metaText = {}, this.metaTextInfo = {}, this.formatting = {}, this.lines = [], this.staffNum = 0, this.voiceNum = 0, this.lineNum = 0, this.runningFonts = {}, delete this.visualTranspose;
    }, this.reset();
    function a(i, n, t, e) {
      for (var c = 0; c < e.length; c++)
        i[t][e[c]] = n[t][e[c]];
    }
    this.copyTopInfo = function(i) {
      var n = ["tempo", "title", "header", "rhythm", "origin", "composer", "author", "partOrder"];
      a(this, i, "metaText", n), a(this, i, "metaTextInfo", n);
    }, this.copyBottomInfo = function(i) {
      var n = [
        "unalignedWords",
        "book",
        "source",
        "discography",
        "notes",
        "transcription",
        "history",
        "abc-copyright",
        "abc-creator",
        "abc-edited-by",
        "footer"
      ];
      a(this, i, "metaText", n), a(this, i, "metaTextInfo", n);
    }, this.getBeatLength = function() {
      var i = this.getMeterFraction(), n = 1;
      return i.num === 6 || i.num === 9 || i.num === 12 || i.num === 3 && i.den === 8 ? n = 3 : i.den === 8 && (i.num === 5 || i.num === 7) && (n = 2), n / i.den;
    };
    function s(i, n) {
      for (var t = 0, e = 0; e < i.length; e++)
        if (i[e].staff)
          for (var c = 0; c < i[e].staff.length; c++)
            for (var v = 0; v < i[e].staff[c].voices.length; v++)
              for (var h = i[e].staff[c].voices[v], y = 1, w = 0; w < h.length; w++) {
                var A = h[w].rest && h[w].rest.type === "spacer";
                if (h[w].startTriplet && (y = h[w].tripletMultiplier), h[w].duration && !A && h[w].el_type !== "tempo" && (t += h[w].duration * y), h[w].endTriplet && (y = 1), t >= n && (t -= n), h[w].el_type === "bar")
                  return t;
              }
      return t;
    }
    this.getPickupLength = function() {
      var i = this.getBarLength(), n = s(this.lines, i);
      return n < 1e-8 || i - n < 1e-8 ? 0 : n;
    }, this.getBarLength = function() {
      var i = this.getMeterFraction();
      return i.num / i.den;
    }, this.getTotalTime = function() {
      return this.totalTime;
    }, this.getTotalBeats = function() {
      return this.totalBeats;
    }, this.millisecondsPerMeasure = function(i) {
      var n;
      if (i)
        n = i;
      else {
        var t = this.metaText ? this.metaText.tempo : null;
        n = this.getBpm(t);
      }
      n <= 0 && (n = 1);
      var e = this.getBeatsPerMeasure(), c = e / n;
      return c * 6e4;
    }, this.getBeatsPerMeasure = function() {
      var i = this.getBeatLength(), n = this.getBarLength();
      return n / i;
    }, this.getMeter = function() {
      for (var i = 0; i < this.lines.length; i++) {
        var n = this.lines[i];
        if (n.staff)
          for (var t = 0; t < n.staff.length; t++) {
            var e = n.staff[t].meter;
            if (e)
              return e;
          }
      }
      return { type: "common_time" };
    }, this.getMeterFraction = function() {
      var i = this.getMeter(), n = 4, t = 4;
      if (i)
        if (i.type === "specified") {
          if (i.value && i.value.length > 0 && i.value[0].num.indexOf("+") > 0) {
            var e = i.value[0].num.split("+");
            n = 0;
            for (var c = 0; c < e.length; c++)
              n += parseInt(e[c], 10);
          } else
            n = parseInt(i.value[0].num, 10);
          t = parseInt(i.value[0].den, 10);
        } else i.type === "cut_time" ? (n = 2, t = 2) : i.type === "common_time" && (n = 4, t = 4);
      return this.meter = { num: n, den: t }, this.meter;
    }, this.getKeySignature = function() {
      for (var i = 0; i < this.lines.length; i++) {
        var n = this.lines[i];
        if (n.staff) {
          for (var t = 0; t < n.staff.length; t++)
            if (n.staff[t].key)
              return n.staff[t].key;
        }
      }
      return {};
    }, this.getElementFromChar = function(i) {
      for (var n = 0; n < this.lines.length; n++) {
        var t = this.lines[n];
        if (t.staff)
          for (var e = 0; e < t.staff.length; e++)
            for (var c = t.staff[e], v = 0; v < c.voices.length; v++)
              for (var h = c.voices[v], y = 0; y < h.length; y++) {
                var w = h[y];
                if (w.startChar && w.endChar && w.startChar <= i && w.endChar > i)
                  return w;
              }
      }
      return null;
    };
    function p(i) {
      for (var n, t, e, c, v = i.length - 1; v >= 0; v--) {
        var h = i[v];
        h.type === "bar" ? (h.top = e, h.nextTop = n, n = e, h.bottom = c, h.nextBottom = t, t = c) : h.type === "event" && (e = h.top, c = h.top + h.height);
      }
    }
    function u(i) {
      var n = [];
      for (var t in i)
        i.hasOwnProperty(t) && n.push(i[t]);
      return n = n.sort(function(e, c) {
        var v = e.milliseconds - c.milliseconds;
        return v !== 0 ? v : e.type === "bar" ? -1 : 1;
      }), n;
    }
    this.addElementToEvents = function(i, n, t, e, c, v, h, y, w, A) {
      if (n.hint)
        return { isTiedState: void 0, duration: 0 };
      var P = n.durationClass ? n.durationClass : n.duration;
      if (n.abcelem.rest && n.abcelem.rest.type === "spacer" && (P = 0), P > 0) {
        for (var N = [], T = 0; T < n.elemset.length; T++)
          n.elemset[T] !== null && N.push(n.elemset[T]);
        var q = n.startTie;
        if (w !== void 0)
          i["event" + w].elements.push(N), A && (i["event" + t] || (i["event" + t] = {
            type: "event",
            milliseconds: t,
            line: v,
            measureNumber: h,
            top: e,
            height: c,
            left: null,
            width: 0,
            elements: [],
            startChar: null,
            endChar: null,
            startCharArray: [],
            endCharArray: []
          }), i["event" + t].measureStart = !0, A = !1), q || (w = void 0);
        else {
          if (!i["event" + t])
            i["event" + t] = {
              type: "event",
              milliseconds: t,
              line: v,
              measureNumber: h,
              top: e,
              height: c,
              left: n.x,
              width: n.w,
              elements: [N],
              startChar: n.abcelem.startChar,
              endChar: n.abcelem.endChar,
              startCharArray: [n.abcelem.startChar],
              endCharArray: [n.abcelem.endChar],
              midiPitches: n.abcelem.midiPitches ? _.cloneArray(n.abcelem.midiPitches) : []
            }, n.abcelem.midiGraceNotePitches && (i["event" + t].midiGraceNotePitches = _.cloneArray(n.abcelem.midiGraceNotePitches));
          else {
            if (i["event" + t].left ? i["event" + t].left = Math.min(i["event" + t].left, n.x) : i["event" + t].left = n.x, i["event" + t].elements.push(N), i["event" + t].startCharArray.push(n.abcelem.startChar), i["event" + t].endCharArray.push(n.abcelem.endChar), i["event" + t].startChar === null && (i["event" + t].startChar = n.abcelem.startChar), i["event" + t].endChar === null && (i["event" + t].endChar = n.abcelem.endChar), n.abcelem.midiPitches && n.abcelem.midiPitches.length) {
              i["event" + t].midiPitches || (i["event" + t].midiPitches = []);
              for (var T = 0; T < n.abcelem.midiPitches.length; T++)
                i["event" + t].midiPitches.push(n.abcelem.midiPitches[T]);
            }
            if (n.abcelem.midiGraceNotePitches && n.abcelem.midiGraceNotePitches.length) {
              i["event" + t].midiGraceNotePitches || (i["event" + t].midiGraceNotePitches = []);
              for (var I = 0; I < n.abcelem.midiGraceNotePitches.length; I++)
                i["event" + t].midiGraceNotePitches.push(n.abcelem.midiGraceNotePitches[I]);
            }
          }
          A && (i["event" + t].measureStart = !0, A = !1);
        }
      }
      return { isTiedState: w, duration: P / y, nextIsBar: A || n.type === "bar" };
    }, this.makeVoicesArray = function() {
      for (var i = [], n = [], t = {}, e = 0; e < this.engraver.staffgroups.length; e++) {
        var c = this.engraver.staffgroups[e];
        if (c && c.staffs && c.staffs.length > 0) {
          var v = c.staffs[0], h = v.absoluteY, y = h - v.top * m.STEP, w = c.staffs[c.staffs.length - 1];
          h = w.absoluteY;
          for (var A = h - w.bottom * m.STEP, P = A - y, N = c.voices, T = 0; T < N.length; T++)
            if (!(N[T].staff && N[T].staff.isTabStaff)) {
              var q = !1;
              i[T] || (i[T] = []), n[T] === void 0 && (n[T] = 0);
              for (var I = N[T].children, C = 0; C < I.length; C++)
                I[C].type === "tempo" && (t[n[T]] = this.getBpm(I[C].abcelem)), i[T].push({ top: y, height: P, line: c.line, measureNumber: n[T], elem: I[C] }), I[C].type === "bar" && q && n[T]++, (I[C].type === "note" || I[C].type === "rest") && (q = !0);
            }
        }
      }
      return this.tempoLocations = t, i;
    }, this.setupEvents = function(i, n, t, e) {
      e || (e = 1);
      for (var c = [], v = {}, h = i, y, w = !0, A = this.makeVoicesArray(), P = 0, N = 0; N < A.length; N++) {
        var T = h, q = Math.round(T * 1e3), I = 0, C = -1, B = A[N], R = t;
        n = this.getBeatLength() * R / 60;
        for (var S = -1, k = 0; k < B.length; k++) {
          var M = B[k].measureNumber;
          S !== M && this.tempoLocations[M] && (R = this.tempoLocations[M], n = e * this.getBeatLength() * R / 60, S = M);
          var F = B[k].elem, L = this.addElementToEvents(v, F, q, B[k].top, B[k].height, B[k].line, B[k].measureNumber, n, y, w);
          y = L.isTiedState, w = L.nextIsBar, T += L.duration;
          var b;
          if (F.duration > 0 && v["event" + q] && (b = "event" + q), q = Math.round(T * 1e3), F.type === "bar") {
            var x = F.abcelem.type, E = x === "bar_right_repeat" || x === "bar_dbl_repeat", D = F.abcelem.startEnding === "1", O = x === "bar_left_repeat" || x === "bar_dbl_repeat" || x === "bar_right_repeat";
            if (E) {
              k > 0 && (v[b].endX = F.x), C === -1 && (C = k);
              var z = 0;
              S = -1;
              for (var H = I; H < C; H++) {
                M = B[H].measureNumber, S !== M && this.tempoLocations[M] && (R = this.tempoLocations[M], n = e * this.getBeatLength() * R / 60, S = M);
                var $ = B[H].elem;
                L = this.addElementToEvents(v, $, q, B[H].top, B[H].height, B[H].line, B[H].measureNumber, n, y, w), y = L.isTiedState, w = L.nextIsBar, T += L.duration, z = q, q = Math.round(T * 1e3);
              }
              v["event" + z] && (v["event" + z].endX = B[C].elem.x), w = !0, C = -1;
            }
            D && (C = k), O && (I = k);
          }
        }
        P = Math.max(P, q);
      }
      return c = u(v), p(c), f(this.lines, c), c.push({ type: "end", milliseconds: P }), this.addUsefulCallbackInfo(c, R * e), c;
    }, this.addUsefulCallbackInfo = function(i, n) {
      for (var t = this.millisecondsPerMeasure(n), e = 0; e < i.length; e++) {
        var c = i[e];
        c.millisecondsPerMeasure = t;
      }
    };
    function d(i, n) {
      for (; n < i.length && i[n].left === null; )
        n++;
      return i[n];
    }
    function f(i, n) {
      if (!(n.length < 1)) {
        for (var t = 0; t < n.length - 1; t++) {
          var e = n[t], c = d(n, t + 1);
          if (e.left !== null) {
            var v = c && e.top === c.top ? c.left : i[e.line].staffGroup.w;
            e.endX !== void 0 ? v > e.left && (e.endX = Math.min(e.endX, v)) : e.endX = v;
          }
        }
        var h = n[n.length - 1];
        h.endX = i[h.line].staffGroup.w;
      }
    }
    this.getBpm = function(i) {
      var n;
      if (i || (i = this.metaText ? this.metaText.tempo : null), i) {
        n = i.bpm;
        var t = this.getBeatLength(), e = i.duration && i.duration.length > 0 ? i.duration[0] : t;
        n = n * e / t;
      }
      if (!n) {
        n = 180;
        var c = this.getMeterFraction();
        c && c.num !== 3 && c.num % 3 === 0 && (n = 120);
      }
      return n;
    }, this.setTiming = function(i, n) {
      if (n = n || 0, !this.engraver || !this.engraver.staffgroups)
        return console.log("setTiming cannot be called before the tune is drawn."), this.noteTimings = [], this.noteTimings;
      var t = this.metaText ? this.metaText.tempo : null, e = this.getBpm(t), c = 1;
      i ? t && (c = i / e) : i = e;
      var v = this.getBeatLength(), h = i / 60, y = this.getBarLength(), w = y / v * n / h;
      w && (w -= this.getPickupLength() / v / h);
      var A = v * h;
      return this.noteTimings = this.setupEvents(w, A, i, c), this.noteTimings.length > 0 ? (this.totalTime = this.noteTimings[this.noteTimings.length - 1].milliseconds / 1e3, this.totalBeats = this.totalTime * h) : (this.totalTime = void 0, this.totalBeats = void 0), this.noteTimings;
    }, this.setUpAudio = function(i) {
      i || (i = {});
      var n = g(this, i);
      return l(n, i, this.formatting.percmap, this.formatting.midi);
    }, this.deline = function(i) {
      return r(this.lines, i);
    }, this.findSelectableElement = function(i) {
      return this.engraver && this.engraver.selectables ? this.engraver.findSelectableElement(i) : null;
    }, this.getSelectableArray = function() {
      return this.engraver && this.engraver.selectables ? this.engraver.selectables : [];
    };
  };
  return gt = o, gt;
}
var bt, Ea;
function zs() {
  if (Ea) return bt;
  Ea = 1;
  var _ = Fr(), m = function(C) {
    var B = this, R = {}, S = "";
    C.reset(), this.setVisualTranspose = function(k) {
      k !== void 0 && (C.visualTranspose = k);
    }, this.cleanUp = function(k, M, F) {
      n(C), delete C.runningFonts, l(C), C.metaText.tempo && C.metaText.tempo.bpm && !C.metaText.tempo.duration && (C.metaText.tempo.duration = [C.getBeatLength()]), I(C);
      var L = !1, b, x, E;
      for (b = 0; b < C.lines.length; b++)
        if (C.lines[b].staff !== void 0) {
          var D = !1;
          for (x = 0; x < C.lines[b].staff.length; x++)
            if (C.lines[b].staff[x] === void 0)
              L = !0, C.lines[b].staff[x] = null;
            else
              for (E = 0; E < C.lines[b].staff[x].voices.length; E++)
                C.lines[b].staff[x].voices[E] === void 0 ? C.lines[b].staff[x].voices[E] = [] : t(C.lines[b].staff[x].voices[E]) && (D = !0);
          D || (C.lines[b] = null, L = !0);
        }
      if (L && (C.lines = C.lines.filter(function(te) {
        return !!te;
      }), C.lines.forEach(function(te) {
        te.staff && (te.staff = te.staff.filter(function(U) {
          return !!U;
        }));
      })), k)
        for (; p(C.lines, k); )
          ;
      if (M) {
        for (L = !1, b = 0; b < C.lines.length; b++)
          if (C.lines[b].staff !== void 0)
            for (x = 0; x < C.lines[b].staff.length; x++) {
              var O = !1;
              for (E = 0; E < C.lines[b].staff[x].voices.length; E++)
                e(C.lines[b].staff[x].voices[E]) && (O = !0);
              O || (L = !0, C.lines[b].staff[x] = null);
            }
        L && C.lines.forEach(function(te) {
          te.staff && (te.staff = te.staff.filter(function(U) {
            return !!U;
          }));
        });
      }
      for (a(C.lines), b = 0; b < C.lines.length; b++)
        if (C.lines[b].staff)
          for (x = 0; x < C.lines[b].staff.length; x++)
            delete C.lines[b].staff[x].workingClef;
      for (var z = !1; r(C); )
        z = !0;
      if (z)
        for (var H = 0, $ = T(C.lines, H); $ !== "not-found"; )
          $ = T(C.lines, H), $ ? H++ : q(C.lines, H);
      for (var b = 0; b < C.lines.length; b++) {
        var Q = C.lines[b].staff;
        if (Q)
          for (C.staffNum = 0; C.staffNum < Q.length; C.staffNum++)
            for (Q[C.staffNum].clef && _.fixClef(Q[C.staffNum].clef), C.voiceNum = 0; C.voiceNum < Q[C.staffNum].voices.length; C.voiceNum++) {
              var W = Q[C.staffNum].voices[C.voiceNum];
              s(W, C.staffNum, C.voiceNum, F);
              for (var ne = 0; ne < W.length; ne++)
                W[ne].el_type === "clef" && _.fixClef(W[ne]);
              if (W.length > 0 && W[W.length - 1].barNumber) {
                var J = d(C.lines, b);
                J && (J.staff[0].barNumber = W[W.length - 1].barNumber), delete W[W.length - 1].barNumber;
              }
            }
      }
      return delete C.staffNum, delete C.voiceNum, delete C.lineNum, delete C.potentialStartBeam, delete C.potentialEndBeam, delete C.vskipPending, F;
    }, this.addTieToLastNote = function(k) {
      var M = f(C);
      return M && M.pitches && M.pitches.length > 0 ? (M.pitches[0].startTie = {}, k && (M.pitches[0].startTie.style = "dotted"), !0) : !1;
    }, this.appendElement = function(k, M, F, L) {
      if (L.el_type = k, M !== null && (L.startChar = M), F !== null && (L.endChar = F), k === "note") {
        var b = i(L);
        b >= 0.25 || L.force_end_beam_last && C.potentialStartBeam !== void 0 ? y(C) : L.end_beam && C.potentialStartBeam !== void 0 ? L.rest === void 0 ? h(L, C) : y(C) : L.rest === void 0 && (C.potentialStartBeam === void 0 ? L.end_beam || (C.potentialStartBeam = L, delete C.potentialEndBeam) : C.potentialEndBeam = L);
      } else
        y(C);
      return delete L.end_beam, delete L.force_end_beam_last, L.rest && L.rest.type === "invisible" && delete L.decoration, C.lines.length <= C.lineNum || C.lines[C.lineNum].staff.length <= C.staffNum ? !1 : (v(B, C, L, R, S), !0);
    }, this.appendStartingElement = function(k, M, F, L) {
      n(C);
      var b;
      k === "key" && (b = L.impliedNaturals, delete L.impliedNaturals, delete L.explicitAccidentals);
      var x = Object.assign({}, L);
      if (C.lines[C.lineNum]) {
        var E = C.lines[C.lineNum].staff;
        if (E) {
          E.length <= C.staffNum && (E[C.staffNum] = {}, E[C.staffNum].clef = Object.assign({}, E[0].clef), E[C.staffNum].key = Object.assign({}, E[0].key), E[0].meter && (E[C.staffNum].meter = Object.assign({}, E[0].meter)), E[C.staffNum].workingClef = Object.assign({}, E[0].workingClef), E[C.staffNum].voices = [[]]), k === "clef" && (E[C.staffNum].workingClef = x);
          for (var D = E[C.staffNum].voices[C.voiceNum], O = 0; O < D.length; O++) {
            if (D[O].el_type === "note" || D[O].el_type === "bar") {
              x.el_type = k, x.startChar = M, x.endChar = F, b && (x.accidentals = b.concat(x.accidentals)), D.push(x);
              return;
            }
            if (D[O].el_type === k) {
              x.el_type = k, x.startChar = M, x.endChar = F, b && (x.accidentals = b.concat(x.accidentals)), D[O] = x;
              return;
            }
          }
          E[C.staffNum][k] = L;
        }
      }
    }, this.addSubtitle = function(k, M) {
      c(C, { subtitle: { text: k, startChar: M.startChar, endChar: M.endChar } });
    }, this.addSpacing = function(k) {
      C.vskipPending = k;
    }, this.addNewPage = function(k) {
      c(C, { newpage: k });
    }, this.addSeparator = function(k, M, F, L) {
      c(C, { separator: { spaceAbove: Math.round(k), spaceBelow: Math.round(M), lineLength: Math.round(F), startChar: L.startChar, endChar: L.endChar } });
    }, this.addText = function(k, M) {
      c(C, { text: { text: k, startChar: M.startChar, endChar: M.endChar } });
    }, this.addCentered = function(k) {
      c(C, { text: [{ text: k, center: !0 }] });
    }, this.changeVoiceScale = function(k) {
      B.appendElement("scale", null, null, { size: k });
    }, this.changeVoiceColor = function(k) {
      B.appendElement("color", null, null, { color: k });
    }, this.startNewLine = function(k) {
      n(C), k.currentVoiceName && (S = k.currentVoiceName, R[k.currentVoiceName] = k), C.lines[C.lineNum] === void 0 ? N(B, C, k) : C.lines[C.lineNum].staff === void 0 ? (C.lineNum++, this.startNewLine(k)) : C.lines[C.lineNum].staff[C.staffNum] === void 0 ? P(B, C, k) : C.lines[C.lineNum].staff[C.staffNum].voices[C.voiceNum] === void 0 ? A(B, C, k) : t(C.lines[C.lineNum].staff[C.staffNum].voices[C.voiceNum]) ? (C.lineNum++, this.startNewLine(k)) : k.part && B.appendElement("part", k.part.startChar, k.part.endChar, { title: k.part.title });
    }, this.setRunningFont = function(k, M) {
      C.runningFonts[k] = M;
    }, this.setBarNumberImmediate = function(k) {
      var M = this.getCurrentVoice();
      if (M && M.length > 0) {
        var F = M[M.length - 1];
        if (F.el_type === "bar")
          F.barNumber !== void 0 && (F.barNumber = k);
        else
          return k - 1;
      }
      return k;
    }, this.hasBeginMusic = function() {
      for (var k = 0; k < C.lines.length; k++)
        if (C.lines[k].staff)
          return !0;
      return !1;
    }, this.isFirstLine = function(k) {
      for (var M = k - 1; M >= 0; M--)
        if (C.lines[M].staff !== void 0) return !1;
      return !0;
    }, this.getCurrentVoice = function() {
      var k = u(C.lines, C.lineNum);
      if (!k)
        return null;
      var M = k.staff[C.staffNum];
      return M && M.voices[C.voiceNum] !== void 0 ? M.voices[C.voiceNum] : null;
    }, this.setCurrentVoice = function(k, M, F) {
      C.staffNum = k, C.voiceNum = M, S = F;
      for (var L = 0; L < C.lines.length; L++)
        if (C.lines[L].staff && (C.lines[L].staff[k] === void 0 || C.lines[L].staff[k].voices[M] === void 0 || !t(C.lines[L].staff[k].voices[M])))
          return C.lineNum = L, !!(!C.lines[L].staff[k] || C.lines[L].staff[k].voices[M]);
      return C.lineNum = L, !1;
    }, this.addMetaText = function(k, M, F) {
      C.metaText[k] === void 0 ? (C.metaText[k] = M, C.metaTextInfo[k] = F) : (typeof C.metaText[k] == "string" && typeof M == "string" ? C.metaText[k] += `
` + M : (C.metaText[k] === "string" && (C.metaText[k] = [{ text: C.metaText[k] }]), typeof M == "string" && (M = [{ text: M }]), C.metaText[k] = C.metaText[k].concat(M)), C.metaTextInfo[k].endChar = F.endChar);
    }, this.addMetaTextArray = function(k, M, F) {
      C.metaText[k] === void 0 ? (C.metaText[k] = [M], C.metaTextInfo[k] = F) : (C.metaText[k].push(M), C.metaTextInfo[k].endChar = F.endChar);
    }, this.addMetaTextObj = function(k, M, F) {
      C.metaText[k] = M, C.metaTextInfo[k] = F;
    };
  };
  function g(C) {
    if (!C || typeof C == "string") return !1;
    for (var B = 0; B < C.length; B++)
      if (typeof C[B] != "string")
        return !1;
    return !0;
  }
  function l(C) {
    g(C.metaText.notes) && (C.metaText.notes = C.metaText.notes.join(`
`)), g(C.metaText.history) && (C.metaText.history = C.metaText.history.join(`
`));
  }
  function r(C) {
    for (var B = !1, R = 0; R < C.lines.length; R++) {
      var S = C.lines[R];
      if (S.staff)
        for (var k = 0; k < S.staff.length; k++) {
          for (var M = S.staff[k], F = [], L = 0; L < M.voices.length; L++) {
            var b = M.voices[L];
            F.push({ hasOverlay: !1, voice: [], snip: [] });
            for (var x = 0, E = !1, D = -1, O = 0; O < b.length; O++) {
              var z = b[O];
              if (z.el_type === "overlay" && !E) {
                B = !0, E = !0, D = O, F[L].hasOverlay = !0;
                for (var H = 0; H < R; H++)
                  C.lines[H].staff && C.lines[H].staff.forEach((te) => {
                    M.voices.length >= te.voices.length && te.voices.forEach((U) => {
                      let re = [];
                      U.forEach((V) => {
                        V.el_type === "bar" ? re.push(V) : V.el_type === "note" && re.push({
                          el_type: "note",
                          duration: V.duration,
                          rest: { type: "invisible" },
                          startChar: V.startChar,
                          endChar: V.endChar
                        });
                      }), te.voices.push(re);
                    });
                  });
              } else z.el_type === "bar" ? (E ? (E = !1, F[L].snip.push({ start: D, len: O - D }), F[L].voice.push(z)) : (x > 0 && F[L].voice.push({ el_type: "note", duration: x, rest: { type: "invisible" }, startChar: z.startChar, endChar: z.endChar }), F[L].voice.push(z)), x = 0) : z.el_type === "note" ? E ? F[L].voice.push(z) : (!z.rest || z.rest.type !== "spacer") && (x += z.duration) : (z.el_type === "scale" || z.el_type === "stem" || z.el_type === "overlay" || z.el_type === "style" || z.el_type === "transpose" || z.el_type === "color") && F[L].voice.push(z);
            }
            F[L].hasOverlay && F[L].snip.length === 0 && F[L].snip.push({ start: D, len: b.length - D });
          }
          for (L = 0; L < F.length; L++) {
            var $ = F[L];
            if ($.hasOverlay) {
              $.voice.splice(0, 0, { el_type: "stem", direction: "down" }), M.voices.push($.voice);
              for (var Q = $.snip.length - 1; Q >= 0; Q--) {
                var W = $.snip[Q];
                M.voices[L].splice(W.start, W.len), M.voices[L].splice(W.start + 1, 0, { el_type: "stem", direction: "auto" });
                var ne = o(M.voices[L], W.start);
                M.voices[L].splice(ne, 0, { el_type: "stem", direction: "up" });
              }
              for (Q = 0; Q < M.voices[M.voices.length - 1].length; Q++) {
                M.voices[M.voices.length - 1][Q] = Object.assign({}, M.voices[M.voices.length - 1][Q]);
                var J = M.voices[M.voices.length - 1][Q];
                J.el_type === "bar" && J.startEnding && delete J.startEnding, J.el_type === "bar" && J.endEnding && delete J.endEnding;
              }
            }
          }
        }
    }
    return B;
  }
  function o(C, B) {
    for (var R = B - 1; R > 0 && C[R].el_type !== "bar"; R--)
      ;
    return R;
  }
  function a(C) {
    for (var B = !0, R = 0; R < C.length; R++) {
      var S = C[R];
      if (S.staff) {
        for (var k = 0; k < S.staff.length; k++) {
          var M = S.staff[k];
          if (M.title) {
            for (var F = !1, L = 0; L < M.title.length; L++)
              M.title[L] ? (M.title[L] = B ? M.title[L].name : M.title[L].subname, M.title[L] ? F = !0 : M.title[L] = "") : M.title[L] = "";
            F || delete M.title;
          }
        }
        B = !1;
      }
    }
  }
  function s(C, B, R, S) {
    S[B] || (S[B] = []), S[B][R] || (S[B][R] = []);
    for (var k, M = function(W, ne, J) {
      if (S[B][R][J] === void 0) {
        for (k = 0; k < S[B][R].length; k++)
          if (S[B][R][k] !== void 0) {
            J = k;
            break;
          }
        if (S[B][R][J] === void 0) {
          var te = J * 100 + 1;
          W.endSlur.forEach(function(V) {
            te === V && --te;
          }), S[B][R][J] = [te];
        }
      }
      for (var U, re = 0; re < ne; re++)
        U = S[B][R][J].pop(), W.endSlur.push(U);
      return S[B][R][J].length === 0 && delete S[B][R][J], U;
    }, F = function(W, ne, J, te) {
      W.startSlur = [], S[B][R][J] === void 0 && (S[B][R][J] = []);
      for (var U = J * 100 + 1, re = 0; re < ne; re++)
        te && (te.forEach(function(V) {
          U === V && ++U;
        }), te.forEach(function(V) {
          U === V && ++U;
        }), te.forEach(function(V) {
          U === V && ++U;
        })), S[B][R][J].forEach(function(V) {
          U === V && ++U;
        }), S[B][R][J].forEach(function(V) {
          U === V && ++U;
        }), S[B][R][J].push(U), W.startSlur.push({ label: U }), W.dottedSlur && (W.startSlur[W.startSlur.length - 1].style = "dotted", delete W.dottedSlur), U++;
    }, L = 0; L < C.length; L++) {
      var b = C[L];
      if (b.el_type === "note") {
        if (b.gracenotes)
          for (var x = 0; x < b.gracenotes.length; x++) {
            if (b.gracenotes[x].endSlur) {
              var E = b.gracenotes[x].endSlur;
              b.gracenotes[x].endSlur = [];
              for (var D = 0; D < E; D++)
                M(b.gracenotes[x], 1, 20);
            }
            b.gracenotes[x].startSlur && (k = b.gracenotes[x].startSlur, F(b.gracenotes[x], k, 20));
          }
        if (b.endSlur && (k = b.endSlur, b.endSlur = [], M(b, k, 0)), b.startSlur && (k = b.startSlur, F(b, k, 0)), b.pitches) {
          for (var O = [], z = 0; z < b.pitches.length; z++)
            if (b.pitches[z].endSlur) {
              var H = b.pitches[z].endSlur;
              b.pitches[z].endSlur = [];
              for (var $ = 0; $ < H; $++) {
                var Q = M(b.pitches[z], 1, z + 1);
                O.push(Q);
              }
            }
          for (z = 0; z < b.pitches.length; z++)
            b.pitches[z].startSlur && (k = b.pitches[z].startSlur, F(b.pitches[z], k, z + 1, O));
          b.gracenotes && b.pitches[0].endSlur && b.pitches[0].endSlur[0] === 100 && b.pitches[0].startSlur && (b.gracenotes[0].endSlur ? b.gracenotes[0].endSlur.push(b.pitches[0].startSlur[0].label) : b.gracenotes[0].endSlur = [b.pitches[0].startSlur[0].label], b.pitches[0].endSlur.length === 1 ? delete b.pitches[0].endSlur : b.pitches[0].endSlur[0] === 100 ? b.pitches[0].endSlur.shift() : b.pitches[0].endSlur[b.pitches[0].endSlur.length - 1] === 100 && b.pitches[0].endSlur.pop(), S[B][R][1].length === 1 ? delete S[B][R][1] : S[B][R][1].pop());
        }
      }
    }
  }
  function p(C, B) {
    for (var R = 0; R < C.length; R++)
      if (C[R].staff !== void 0)
        for (var S = 0; S < C[R].staff.length; S++)
          for (var k = [], M = 0; M < C[R].staff[S].voices.length; M++)
            for (var F = C[R].staff[S].voices[M], L = 0, b = 0; b < F.length; b++)
              if (F[b].el_type === "bar") {
                if (L++, L >= B && b < F.length - 1) {
                  var x = d(C, R);
                  if (!x) {
                    var E = JSON.parse(JSON.stringify(C[R]));
                    C.push(Object.assign({}, E)), x = C[C.length - 1];
                    for (var D = 0; D < x.staff.length; D++)
                      for (var O = 0; O < x.staff[D].voices.length; O++)
                        x.staff[D].voices[O] = [];
                  }
                  var z = b + 1, H = C[R].staff[S].voices[M].slice(z);
                  return C[R].staff[S].voices[M] = C[R].staff[S].voices[M].slice(0, z), x.staff[S].voices[M] = k.concat(H.concat(x.staff[S].voices[M])), !0;
                }
              } else F[b].duration || k.push(F[b]);
    return !1;
  }
  function u(C, B) {
    if (C.length <= B)
      return null;
    for (; B >= 0; ) {
      if (C[B].staff)
        return C[B];
      B--;
    }
    return null;
  }
  function d(C, B) {
    for (B++; C.length > B; ) {
      if (C[B].staff)
        return C[B];
      B++;
    }
    return null;
  }
  function f(C) {
    if (!C.lines[C.lineNum] || !C.lines[C.lineNum].staff || !C.lines[C.lineNum].staff[C.staffNum]) return null;
    var B = C.lines[C.lineNum].staff[C.staffNum].voices[C.voiceNum];
    if (!B) return null;
    for (var R = B.length - 1; R >= 0; R--) {
      var S = B[R];
      if (S.el_type === "note")
        return S;
    }
    return null;
  }
  function i(C) {
    return C.duration ? C.duration : 0;
  }
  function n(C) {
    C.potentialStartBeam && C.potentialEndBeam && (C.potentialStartBeam.startBeam = !0, C.potentialEndBeam.endBeam = !0), delete C.potentialStartBeam, delete C.potentialEndBeam;
  }
  function t(C) {
    for (var B = 0; B < C.length; B++)
      if (C[B].el_type === "note" || C[B].el_type === "bar")
        return !0;
    return !1;
  }
  function e(C) {
    for (var B = 0; B < C.length; B++)
      if (C[B].el_type === "note" && (C[B].rest === void 0 || C[B].chord !== void 0))
        return !0;
    return !1;
  }
  function c(C, B) {
    C.vskipPending && (B.vskip = C.vskipPending, delete C.vskipPending), C.lines.push(B);
  }
  function v(C, B, R, S, k) {
    var M = B.lines[B.lineNum].staff[B.staffNum];
    if (R.pitches !== void 0) {
      var F = M.workingClef.verticalPos;
      R.pitches.forEach(function(b) {
        b.verticalPos = b.pitch - F;
      });
    }
    if (R.gracenotes !== void 0) {
      var L = M.workingClef.verticalPos;
      R.gracenotes.forEach(function(b) {
        b.verticalPos = b.pitch - L;
      });
    }
    M.voices.length <= B.voiceNum && (S[k] || (S[k] = {}), A(C, B, S[k])), M.voices[B.voiceNum].push(R);
  }
  function h(C, B) {
    B.potentialStartBeam.startBeam = !0, C.endBeam = !0, delete B.potentialStartBeam, delete B.potentialEndBeam;
  }
  function y(C) {
    C.potentialStartBeam !== void 0 && C.potentialEndBeam !== void 0 && (C.potentialStartBeam.startBeam = !0, C.potentialEndBeam.endBeam = !0), delete C.potentialStartBeam, delete C.potentialEndBeam;
  }
  function w(C, B, R) {
    if (C.runningFonts[B]) {
      for (var S = !1, k = Object.keys(R), M = 0; M < k.length; M++)
        C.runningFonts[B][k[M]] !== R[k[M]] && (S = !0);
      S && (C.lines[C.lineNum].staff[C.staffNum][B] = R);
    }
    C.runningFonts[B] = R;
  }
  function A(C, B, R) {
    var S = B.lines[B.lineNum].staff[B.staffNum];
    if (S.voices[B.voiceNum] = [], S.title || (S.title = []), S.title[B.voiceNum] = { name: R.name, subname: R.subname }, R.style && C.appendElement("style", null, null, { head: R.style }), R.stem)
      C.appendElement("stem", null, null, { direction: R.stem });
    else if (B.voiceNum > 0) {
      if (S.voices[0] !== void 0) {
        for (var k = !1, M = 0; M < S.voices[0].length; M++)
          S.voices[0].el_type === "stem" && (k = !0);
        if (!k) {
          var F = { el_type: "stem", direction: "up" };
          S.voices[0].splice(0, 0, F);
        }
      }
      C.appendElement("stem", null, null, { direction: "down" });
    }
    R.scale && C.appendElement("scale", null, null, { size: R.scale }), R.color && C.appendElement("color", null, null, { color: R.color });
  }
  function P(C, B, R) {
    R.key && R.key.impliedNaturals && (R.key.accidentals = R.key.accidentals.concat(R.key.impliedNaturals), delete R.key.impliedNaturals), B.lines[B.lineNum].staff[B.staffNum] = { voices: [], clef: R.clef, key: R.key, workingClef: R.clef };
    var S = B.lines[B.lineNum].staff[B.staffNum];
    R.stafflines !== void 0 && (S.clef.stafflines = R.stafflines, S.workingClef.stafflines = R.stafflines), R.staffscale && (S.staffscale = R.staffscale), R.annotationfont && w(B, "annotationfont", R.annotationfont), R.gchordfont && w(B, "gchordfont", R.gchordfont), R.tripletfont && w(B, "tripletfont", R.tripletfont), R.vocalfont && w(B, "vocalfont", R.vocalfont), R.bracket && (S.bracket = R.bracket), R.brace && (S.brace = R.brace), R.connectBarLines && (S.connectBarLines = R.connectBarLines), R.barNumber && (S.barNumber = R.barNumber), A(C, B, R), R.part && C.appendElement("part", R.part.startChar, R.part.endChar, { title: R.part.title }), R.meter !== void 0 && (S.meter = R.meter), B.vskipPending && (B.lines[B.lineNum].vskip = B.vskipPending, delete B.vskipPending);
  }
  function N(C, B, R) {
    B.lines[B.lineNum] = { staff: [] }, P(C, B, R);
  }
  function T(C, B) {
    for (var R = !1, S = !1, k = 0; k < C.length; k++) {
      var M = C[k].staff;
      if (M)
        for (var F = 0; F < M.length; F++) {
          var L = M[F];
          if (B < L.voices.length) {
            S = !0;
            for (var b = L.voices[B], x = 0; x < b.length; x++) {
              var E = b[x];
              E.el_type === "note" && (!E.rest || E.chord) && (R = !0);
            }
          }
        }
    }
    return S ? R : "not-found";
  }
  function q(C, B) {
    for (var R = 0; R < C.length; R++) {
      var S = C[R].staff;
      if (S)
        for (var k = 0; k < S.length; k++) {
          var M = S[k];
          B < M.voices.length && M.voices.splice(B, 1);
        }
    }
  }
  function I(C) {
    for (var B = 1; B < C.lines.length; B++) {
      var R = C.lines[B];
      if (R.subtitle) {
        var S = C.lines[B - 1];
        if (S.staff)
          for (var k = 0; k < S.staff.length; k++)
            for (var M = 0; M < S.staff[k].voices.length; M++) {
              var F = S.staff[k].voices[M];
              if (F[F.length - 1].el_type === "key") {
                F.pop();
                for (var L = C.lines[B]; B < C.lines.length && !L.staff; )
                  B++, L = C.lines[B];
                if (L)
                  for (var b = 0; b < L.staff.length; b++) {
                    for (var x = L.staff[b].key.accidentals, E = [], D = 0; D < x.length; D++)
                      x[D].acc !== "natural" && E.push(x[D]);
                    L.staff[b].key.accidentals = E;
                  }
              }
            }
      }
    }
  }
  return bt = m, bt;
}
var mt, Aa;
function Or() {
  if (Aa) return mt;
  Aa = 1;
  var _ = _e(), m = Ir(), g = Ps(), l = qs(), r = Ds(), o = Ji(), a = Rs(), s = ts(), p = zs(), u = function() {
    var d = new s(), f = new p(d), i, n = "", t = "";
    this.getTune = function() {
      var S = {
        formatting: d.formatting,
        lines: d.lines,
        media: d.media,
        metaText: d.metaText,
        metaTextInfo: d.metaTextInfo,
        version: d.version,
        addElementToEvents: d.addElementToEvents,
        addUsefulCallbackInfo: d.addUsefulCallbackInfo,
        getTotalTime: d.getTotalTime,
        getTotalBeats: d.getTotalBeats,
        getBarLength: d.getBarLength,
        getBeatLength: d.getBeatLength,
        getBeatsPerMeasure: d.getBeatsPerMeasure,
        getBpm: d.getBpm,
        getMeter: d.getMeter,
        getMeterFraction: d.getMeterFraction,
        getPickupLength: d.getPickupLength,
        getKeySignature: d.getKeySignature,
        getElementFromChar: d.getElementFromChar,
        makeVoicesArray: d.makeVoicesArray,
        millisecondsPerMeasure: d.millisecondsPerMeasure,
        setupEvents: d.setupEvents,
        setTiming: d.setTiming,
        setUpAudio: d.setUpAudio,
        deline: d.deline,
        findSelectableElement: d.findSelectableElement,
        getSelectableArray: d.getSelectableArray
      };
      return d.lineBreaks && (S.lineBreaks = d.lineBreaks), d.visualTranspose && (S.visualTranspose = d.visualTranspose), d.chordGrid && (S.chordGrid = d.chordGrid), S;
    };
    function e(S, k, M) {
      S.positioning || (S.positioning = {}), S.positioning[k] = M;
    }
    function c(S, k, M) {
      S.fonts || (S.fonts = {}), S.fonts[k] = M;
    }
    var v = {
      reset: function() {
        for (var S in this)
          this.hasOwnProperty(S) && typeof this[S] != "function" && delete this[S];
        this.iChar = 0, this.key = { accidentals: [], root: "none", acc: "", mode: "" }, this.meter = null, this.origMeter = null, this.hasMainTitle = !1, this.default_length = 0.125, this.clef = { type: "treble", verticalPos: 0 }, this.octave = 0, this.next_note_duration = 0, this.start_new_line = !0, this.is_in_header = !0, this.partForNextLine = {}, this.tempoForNextLine = [], this.havent_set_length = !0, this.voices = {}, this.staves = [], this.macros = {}, this.currBarNumber = 1, this.barCounter = {}, this.ignoredDecorations = [], this.score_is_present = !1, this.inEnding = !1, this.inTie = [], this.inTieChord = {}, this.vocalPosition = "auto", this.dynamicPosition = "auto", this.chordPosition = "auto", this.ornamentPosition = "auto", this.volumePosition = "auto", this.openSlurs = [], this.freegchord = !1, this.endingHoldOver = {};
      },
      differentFont: function(S, k) {
        return this[S].decoration !== k[S].decoration || this[S].face !== k[S].face || this[S].size !== k[S].size || this[S].style !== k[S].style || this[S].weight !== k[S].weight;
      },
      addFormattingOptions: function(S, k, M) {
        M === "note" ? (this.vocalPosition !== "auto" && e(S, "vocalPosition", this.vocalPosition), this.dynamicPosition !== "auto" && e(S, "dynamicPosition", this.dynamicPosition), this.chordPosition !== "auto" && e(S, "chordPosition", this.chordPosition), this.ornamentPosition !== "auto" && e(S, "ornamentPosition", this.ornamentPosition), this.volumePosition !== "auto" && e(S, "volumePosition", this.volumePosition), this.differentFont("annotationfont", k) && c(S, "annotationfont", this.annotationfont), this.differentFont("gchordfont", k) && c(S, "gchordfont", this.gchordfont), this.differentFont("vocalfont", k) && c(S, "vocalfont", this.vocalfont), this.differentFont("tripletfont", k) && c(S, "tripletfont", this.tripletfont)) : M === "bar" && (this.dynamicPosition !== "auto" && e(S, "dynamicPosition", this.dynamicPosition), this.chordPosition !== "auto" && e(S, "chordPosition", this.chordPosition), this.ornamentPosition !== "auto" && e(S, "ornamentPosition", this.ornamentPosition), this.volumePosition !== "auto" && e(S, "volumePosition", this.volumePosition), this.differentFont("measurefont", k) && c(S, "measurefont", this.measurefont), this.differentFont("repeatfont", k) && c(S, "repeatfont", this.repeatfont));
      },
      duplicateStartEndingHoldOvers: function() {
        this.endingHoldOver = {
          inTie: [],
          inTieChord: {}
        };
        for (var S = 0; S < this.inTie.length; S++)
          if (this.endingHoldOver.inTie.push([]), this.inTie[S])
            for (var k = 0; k < this.inTie[S].length; k++)
              this.endingHoldOver.inTie[S].push(this.inTie[S][k]);
        for (var M in this.inTieChord)
          this.inTieChord.hasOwnProperty(M) && (this.endingHoldOver.inTieChord[M] = this.inTieChord[M]);
      },
      restoreStartEndingHoldOvers: function() {
        if (this.endingHoldOver.inTie) {
          this.inTie = [], this.inTieChord = {};
          for (var S = 0; S < this.endingHoldOver.inTie.length; S++) {
            this.inTie.push([]);
            for (var k = 0; k < this.endingHoldOver.inTie[S].length; k++)
              this.inTie[S].push(this.endingHoldOver.inTie[S][k]);
          }
          for (var M in this.endingHoldOver.inTieChord)
            this.endingHoldOver.inTieChord.hasOwnProperty(M) && (this.inTieChord[M] = this.endingHoldOver.inTieChord[M]);
        }
      }
    }, h = function(S) {
      v.warnings || (v.warnings = []), v.warnings.push(S);
    }, y = function(S) {
      v.warningObjects || (v.warningObjects = []), v.warningObjects.push(S);
    }, w = function(S) {
      var k = S.replace(/\x12/g, " ");
      return k = k.replace(/&/g, "&amp;"), k = k.replace(/</g, "&lt;"), k.replace(/>/g, "&gt;");
    }, A = function(S, k, M) {
      k || (k = " ");
      var F = k[M];
      (F === " " || !F) && (F = "SPACE");
      var L = w(k.substring(M - 64, M)) + '<span style="text-decoration:underline;font-size:1.3em;font-weight:bold;">' + F + "</span>" + w(k.substring(M + 1).substring(0, 64));
      h("Music Line:" + i.lineIndex + ":" + (M + 1) + ": " + S + ":  " + L), y({ message: S, line: k, startChar: v.iChar + M, column: M });
    }, P, N;
    this.getWarnings = function() {
      return v.warnings;
    }, this.getWarningObjects = function() {
      return v.warningObjects;
    };
    var T = function(S, k) {
      if (k.indexOf("") >= 0) {
        n += k;
        return;
      }
      if (k = n + k, n = "", !S) {
        A("Can't add words before the first line of music", S, 0);
        return;
      }
      k = _.strip(k), k[k.length - 1] !== "-" && (k = k + " ");
      for (var M = [], F = 0, L = !1, b = function(D) {
        var O = _.strip(k.substring(F, D));
        if (O = O.replace(/\\([-_*|~])/g, "$1"), F = D + 1, O.length > 0) {
          L && (O = O.replace(/~/g, " "));
          var z = k[D];
          return z !== "_" && z !== "-" && (z = " "), M.push({ syllable: i.translateString(O), divider: z }), L = !1, !0;
        }
        return !1;
      }, x = !1, E = 0; E < k.length; E++) {
        switch (k[E]) {
          case " ":
          case "":
            b(E);
            break;
          case "-":
            !x && !b(E) && M.length > 0 && (_.last(M).divider = "-", M.push({ skip: !0, to: "next" }));
            break;
          case "_":
            x || (b(E), M.push({ skip: !0, to: "slur" }));
            break;
          case "*":
            x || (b(E), M.push({ skip: !0, to: "next" }));
            break;
          case "|":
            x || (b(E), M.push({ skip: !0, to: "bar" }));
            break;
          case "~":
            x || (L = !0);
            break;
        }
        x = k[E] === "\\";
      }
      S.forEach(function(D) {
        if (M.length !== 0) {
          if (M[0].skip) {
            switch (M[0].to) {
              case "next":
                D.el_type === "note" && D.pitches !== null && M.shift();
                break;
              case "slur":
                D.el_type === "note" && D.pitches !== null && M.shift();
                break;
              case "bar":
                D.el_type === "bar" && M.shift();
                break;
            }
            D.el_type !== "bar" && (D.lyric === void 0 ? D.lyric = [{ syllable: "", divider: " " }] : D.lyric.push({ syllable: "", divider: " " }));
          } else if (D.el_type === "note" && D.rest === void 0) {
            var O = M.shift();
            O.syllable && (O.syllable = O.syllable.replace(/ +/g, " ")), D.lyric === void 0 ? D.lyric = [O] : D.lyric.push(O);
          }
        }
      });
    }, q = function(S, k) {
      if (k.indexOf("") >= 0) {
        t += k;
        return;
      }
      if (k = t + k, t = "", !S) {
        A("Can't add symbols before the first line of music", S, 0);
        return;
      }
      k = _.strip(k), k[k.length - 1] !== "-" && (k = k + " ");
      for (var M = [], F = 0, L = !1, b = function(E) {
        var D = _.strip(k.substring(F, E));
        if (F = E + 1, D.length > 0) {
          L && (D = D.replace(/~/g, " "));
          var O = k[E];
          return O !== "_" && O !== "-" && (O = " "), M.push({ syllable: i.translateString(D), divider: O }), L = !1, !0;
        }
        return !1;
      }, x = 0; x < k.length; x++)
        switch (k[x]) {
          case " ":
          case "":
            b(x);
            break;
          case "-":
            !b(x) && M.length > 0 && (_.last(M).divider = "-", M.push({ skip: !0, to: "next" }));
            break;
          case "_":
            b(x), M.push({ skip: !0, to: "slur" });
            break;
          case "*":
            b(x), M.push({ skip: !0, to: "next" });
            break;
          case "|":
            b(x), M.push({ skip: !0, to: "bar" });
            break;
          case "~":
            L = !0;
            break;
        }
      S.forEach(function(E) {
        if (M.length !== 0) {
          if (M[0].skip)
            switch (M[0].to) {
              case "next":
                E.el_type === "note" && E.pitches !== null && M.shift();
                break;
              case "slur":
                E.el_type === "note" && E.pitches !== null && M.shift();
                break;
              case "bar":
                E.el_type === "bar" && M.shift();
                break;
            }
          else if (E.el_type === "note" && E.rest === void 0) {
            var D = M.shift();
            E.lyric === void 0 ? E.lyric = [D] : E.lyric.push(D);
          }
        }
      });
    }, I = function(S) {
      if (_.startsWith(S, "%%")) {
        var k = m.addDirective(S.substring(2));
        k && A(k, S, 2);
        return;
      }
      var M = S.indexOf("%");
      if (M >= 0 && (S = S.substring(0, M)), S = S.replace(/\s+$/, ""), S.length !== 0) {
        if (n) {
          T(f.getCurrentVoice(), S.substring(2));
          return;
        }
        if (t) {
          q(f.getCurrentVoice(), S.substring(2));
          return;
        }
        if (S.length < 2 || S[1] !== ":" || N.lineContinuation) {
          N.parseMusic(S);
          return;
        }
        var F = P.parseHeader(S);
        F.regular && N.parseMusic(S), F.newline && N.startNewLine(), F.words && T(f.getCurrentVoice(), S.substring(2)), F.symbols && q(f.getCurrentVoice(), S.substring(2));
      }
    };
    function C(S, k) {
      S.push({
        el_type: "hint"
      });
      for (var M = 0; M < k.length; M++) {
        var F = k[M], L = Object.assign({}, F);
        if (S.push(L), F.el_type === "bar")
          return;
      }
    }
    function B(S, k) {
      for (var M = 0; M < S.length; M++) {
        var F = S[M], L = k[M];
        if (L)
          for (var b = 0; b < L.voices.length; b++) {
            var x = L.voices[b], E = F.voices[b];
            E && C(E, x);
          }
      }
    }
    function R() {
      for (var S = 0; S < d.lines.length; S++) {
        var k = d.lines[S].staff;
        if (k) {
          for (var M = S + 1; M < d.lines.length && d.lines[M].staff === void 0; )
            M++;
          if (M < d.lines.length) {
            var F = d.lines[M].staff;
            B(k, F);
          }
        }
      }
    }
    this.parse = function(S, k, M) {
      k || (k = {}), M || (M = 0), d.reset(), S = S.replace(/\r\n?/g, `
`) + `
`;
      var F = S.split(`
\\`);
      if (F.length > 1) {
        for (var L = 1; L < F.length; L++)
          for (; F[L].length > 0 && F[L][0] !== `
`; )
            F[L] = F[L].substr(1), F[L - 1] += " ";
        S = F.join("  ");
      }
      S = S.replace(/\\%/g, "​％"), S = S.replace(/\\([ \t]*)(%.*)*\n/g, function(H, $, Q) {
        var W = Q ? Array(Q.length + 1).join(" ") : "";
        return $ + "" + W + `
`;
      });
      var b = S.split(`
`);
      _.last(b).length === 0 && b.pop(), i = new r(b, v), P = new g(i, A, v, d, f), N = new l(i, A, v, d, f, P), k.print && (d.media = "print"), v.reset(), v.iChar = M, k.visualTranspose ? (v.globalTranspose = parseInt(k.visualTranspose), v.globalTranspose === 0 ? v.globalTranspose = void 0 : f.setVisualTranspose(k.visualTranspose)) : v.globalTranspose = void 0, k.lineBreaks && (v.lineBreaks = k.lineBreaks), P.reset(i, A, v, d);
      try {
        k.format && m.globalFormatting(k.format);
        for (var x = i.nextLine(); x; ) {
          if (k.header_only && v.is_in_header === !1 || k.stop_on_warning && v.warnings)
            throw "normal_abort";
          var E = v.is_in_header;
          I(x), E && !v.is_in_header && (f.setRunningFont("annotationfont", v.annotationfont), f.setRunningFont("gchordfont", v.gchordfont), f.setRunningFont("tripletfont", v.tripletfont), f.setRunningFont("vocalfont", v.vocalfont)), x = i.nextLine();
        }
        n && T(f.getCurrentVoice(), ""), t && q(f.getCurrentVoice(), ""), v.openSlurs = f.cleanUp(v.barsperstaff, v.staffnonote, v.openSlurs);
      } catch (H) {
        if (H !== "normal_abort")
          throw H;
      }
      var D = 792, O = 8.5 * 72;
      switch (v.papersize) {
        //case "letter": ph = 11*72; pl = 8.5*72; break;
        case "legal":
          D = 1008, O = 8.5 * 72;
          break;
        case "A4":
          D = 11.7 * 72, O = 8.3 * 72;
          break;
      }
      if (v.landscape) {
        var z = D;
        D = O, O = z;
      }
      if (d.formatting.pagewidth || (d.formatting.pagewidth = O), d.formatting.pageheight || (d.formatting.pageheight = D), k.hint_measures && R(), o.wrapLines(d, v.lineBreaks, v.barNumbers), k.chordGrid)
        try {
          d.chordGrid = a(d);
        } catch (H) {
          switch (H.message) {
            case "notCommonTime":
              A("Chord grid only works for 2/2 and 4/4 time.", 0, 0);
              break;
            case "noChords":
              A("No chords are found in the tune.", 0, 0);
              break;
            default:
              A(H.message, 0, 0);
          }
        }
    };
  };
  return mt = u, mt;
}
var yt, Ma;
function Gs() {
  if (Ma) return yt;
  Ma = 1;
  var _ = _e(), m = function(g) {
    var l = "", r = g.match(/(\s*)/);
    g = _.strip(g);
    for (var o = g.split(`
X:`), a = 1; a < o.length; a++)
      o[a] = "X:" + o[a];
    var s = r ? r[0].length : 0, p = [];
    if (o.forEach(function(i) {
      p.push({ abc: i, startPos: s }), s += i.length + 1;
    }), p.length > 1 && !_.startsWith(p[0].abc, "X:")) {
      var u = p.shift(), d = u.abc.split(`
`);
      d.forEach(function(i) {
        _.startsWith(i, "%%") && (l += i + `
`);
      });
    }
    var f = l;
    return p.forEach(function(i) {
      var n = i.abc.indexOf(`

`);
      n > 0 && (i.abc = i.abc.substring(0, n)), i.pure = i.abc, i.abc = l + i.abc, i.title = "";
      var t = i.pure.split("T:");
      t.length > 1 && (t = t[1].split(`
`), i.title = _.strip(t[0]));
      var e = i.pure.substring(2, i.pure.indexOf(`
`));
      i.id = _.strip(e);
    }), {
      header: f,
      tunes: p
    };
  };
  return yt = m, yt;
}
var wt, Ba;
function Ys() {
  if (Ba) return wt;
  Ba = 1;
  function _(m, g) {
    this.numLines = m, this.lineSpace = g, this.verticalSize = this.numLines * this.lineSpace;
    var l = 3;
    this.bar = {
      pitch: l,
      pitch2: g * m,
      height: 5
    };
  }
  return _.prototype.bypass = function(m) {
    var g = m.staffGroup.voices;
    return !!(g.length > 0 && g[0].isPercussion);
  }, _.prototype.setRelative = function(m, g, l) {
    switch (m.type) {
      case "bar":
        g.pitch = this.bar.pitch, g.pitch2 = this.bar.pitch2, g.height = this.height;
        break;
      case "symbol":
        var r = this.bar.pitch2 / 2;
        if (m.name == "dots.dot")
          return l ? (g.pitch = r, !1) : (g.pitch = r + this.lineSpace, !0);
        break;
    }
    return l;
  }, wt = _, wt;
}
var xt, Na;
function rs() {
  if (Na) return xt;
  Na = 1;
  var _ = function(g, l) {
    this.children = [], this.beams = [], this.otherchildren = [], this.w = 0, this.duplicate = !1, this.voicenumber = g, this.voicetotal = l, this.bottom = 7, this.top = 7, this.specialY = {
      tempoHeightAbove: 0,
      partHeightAbove: 0,
      volumeHeightAbove: 0,
      dynamicHeightAbove: 0,
      endingHeightAbove: 0,
      chordHeightAbove: 0,
      lyricHeightAbove: 0,
      lyricHeightBelow: 0,
      chordHeightBelow: 0,
      volumeHeightBelow: 0,
      dynamicHeightBelow: 0
    };
  };
  return _.prototype.addChild = function(m) {
    if (m.type === "bar") {
      for (var g = !0, l = 0; g && l < this.children.length; l++)
        this.children[l].type.indexOf("staff-extra") < 0 && this.children[l].type !== "tempo" && (g = !1);
      g || (this.beams.push("bar"), this.otherchildren.push("bar"));
    }
    this.children[this.children.length] = m, this.setRange(m);
  }, _.prototype.setLimit = function(m, g) {
    var l = g.specialY;
    l || (l = g), l[m] && (this.specialY[m] ? this.specialY[m] = Math.max(this.specialY[m], l[m]) : this.specialY[m] = l[m]);
  }, _.prototype.adjustRange = function(m) {
    m.bottom !== void 0 && (this.bottom = Math.min(this.bottom, m.bottom)), m.top !== void 0 && (this.top = Math.max(this.top, m.top));
  }, _.prototype.setRange = function(m) {
    this.adjustRange(m), this.setLimit("tempoHeightAbove", m), this.setLimit("partHeightAbove", m), this.setLimit("volumeHeightAbove", m), this.setLimit("dynamicHeightAbove", m), this.setLimit("endingHeightAbove", m), this.setLimit("chordHeightAbove", m), this.setLimit("lyricHeightAbove", m), this.setLimit("lyricHeightBelow", m), this.setLimit("chordHeightBelow", m), this.setLimit("volumeHeightBelow", m), this.setLimit("dynamicHeightBelow", m);
  }, _.prototype.addOther = function(m) {
    this.otherchildren.push(m), this.setRange(m);
  }, _.prototype.addBeam = function(m) {
    this.beams.push(m);
  }, _.prototype.setWidth = function(m) {
    this.w = m;
  }, xt = _, xt;
}
var Ct, Pa;
function Hr() {
  if (Pa) return Ct;
  Pa = 1;
  var _ = function(m, g, l, r) {
    if (m)
      for (var o = 0; o < m.length; o++) {
        var a = m[o], s = a.getAttribute("highlight");
        s || (s = "fill"), a.setAttribute(s, r);
        var p = a.getAttribute("class");
        p || (p = ""), p = p.replace(l, ""), p = p.replace(g, ""), g.length > 0 && (p.length > 0 && p[p.length - 1] !== " " && (p += " "), p += g), a.setAttribute("class", p);
      }
  };
  return Ct = _, Ct;
}
var kt, La;
function as() {
  if (La) return kt;
  La = 1;
  var _ = Hr(), m = function(g, l) {
    g === void 0 && (g = "abcjs-note_selected"), l === void 0 && (l = "#ff0000"), _(this.elemset, g, "", l);
  };
  return kt = m, kt;
}
var _t, qa;
function ns() {
  if (qa) return _t;
  qa = 1;
  var _ = Hr(), m = function(g, l) {
    g === void 0 && (g = "abcjs-note_selected"), l === void 0 && (l = "#000000"), _(this.elemset, "", g, l);
  };
  return _t = m, _t;
}
var Tt, Da;
function De() {
  if (Da) return Tt;
  Da = 1;
  var _ = as(), m = ns(), g = function(r, o, a, s, p, u) {
    u || (u = {}), this.tuneNumber = p, this.abcelem = r, this.duration = o, this.durationClass = u.durationClassOveride ? u.durationClassOveride : this.duration, this.minspacing = a || 0, this.x = 0, this.children = [], this.heads = [], this.extra = [], this.extraw = 0, this.w = 0, this.right = [], this.invisible = !1, this.bottom = void 0, this.top = void 0, this.type = s, r.extraClass && (this.extraClass = r.extraClass), this.fixed = { w: 0, t: void 0, b: void 0 }, this.specialY = {
      tempoHeightAbove: 0,
      partHeightAbove: 0,
      volumeHeightAbove: 0,
      dynamicHeightAbove: 0,
      endingHeightAbove: 0,
      chordHeightAbove: 0,
      lyricHeightAbove: 0,
      lyricHeightBelow: 0,
      chordHeightBelow: 0,
      volumeHeightBelow: 0,
      dynamicHeightBelow: 0
    };
  };
  return g.prototype.getFixedCoords = function() {
    return { x: this.x, w: this.fixed.w, t: this.fixed.t, b: this.fixed.b };
  }, g.prototype.addExtra = function(l) {
    this.fixed.w = Math.max(this.fixed.w, l.dx + l.w), this.fixed.t === void 0 ? this.fixed.t = l.top : this.fixed.t = Math.max(this.fixed.t, l.top), this.fixed.b === void 0 ? this.fixed.b = l.bottom : this.fixed.b = Math.min(this.fixed.b, l.bottom), l.dx < this.extraw && (this.extraw = l.dx), this.extra[this.extra.length] = l, this._addChild(l);
  }, g.prototype.addHead = function(l) {
    l.dx < this.extraw && (this.extraw = l.dx), this.heads[this.heads.length] = l, this.addRight(l);
  }, g.prototype.addRight = function(l) {
    this.fixed.w = Math.max(this.fixed.w, l.dx + l.w), l.top !== void 0 && (this.fixed.t === void 0 ? this.fixed.t = l.top : this.fixed.t = Math.max(this.fixed.t, l.top)), l.bottom !== void 0 && (this.fixed.b === void 0 ? this.fixed.b = l.bottom : this.fixed.b = Math.min(this.fixed.b, l.bottom)), l.dx + l.w > this.w && (this.w = l.dx + l.w), this.right[this.right.length] = l, this._addChild(l);
  }, g.prototype.addFixed = function(l) {
    this._addChild(l);
  }, g.prototype.addFixedX = function(l) {
    this._addChild(l);
  }, g.prototype.addCentered = function(l) {
    var r = l.w / 2;
    -r < this.extraw && (this.extraw = -r), this.extra[this.extra.length] = l, l.dx + r > this.w && (this.w = l.dx + r), this.right[this.right.length] = l, this._addChild(l);
  }, g.prototype.setLimit = function(l, r) {
    r[l] && (this.specialY[l] ? this.specialY[l] = Math.max(this.specialY[l], r[l]) : this.specialY[l] = r[l]);
  }, g.prototype._addChild = function(l) {
    var r = !0;
    this.abcelem.el_type == "clef" && l.type == "barNumber" && (r = !1), l.parent = this, this.children[this.children.length] = l, r && this.pushTop(l.top), this.pushBottom(l.bottom), this.setLimit("tempoHeightAbove", l), this.setLimit("partHeightAbove", l), this.setLimit("volumeHeightAbove", l), this.setLimit("dynamicHeightAbove", l), this.setLimit("endingHeightAbove", l), this.setLimit("chordHeightAbove", l), this.setLimit("lyricHeightAbove", l), this.setLimit("lyricHeightBelow", l), this.setLimit("chordHeightBelow", l), this.setLimit("volumeHeightBelow", l), this.setLimit("dynamicHeightBelow", l);
  }, g.prototype.pushTop = function(l) {
    l !== void 0 && (this.top === void 0 ? this.top = l : this.top = Math.max(l, this.top));
  }, g.prototype.pushBottom = function(l) {
    l !== void 0 && (this.bottom === void 0 ? this.bottom = l : this.bottom = Math.min(l, this.bottom));
  }, g.prototype.setX = function(l) {
    this.x = l;
    for (var r = 0; r < this.children.length; r++)
      this.children[r].setX(l);
  }, g.prototype.center = function(l, r) {
    var o = (r.x - l.x) / 2 + l.x;
    this.x = o - this.w / 2;
    for (var a = 0; a < this.children.length; a++)
      this.children[a].setX(this.x);
  }, g.prototype.setHint = function() {
    this.hint = !0;
  }, g.prototype.highlight = function(l, r) {
    _.bind(this)(l, r);
  }, g.prototype.unhighlight = function(l, r) {
    m.bind(this)(l, r);
  }, Tt = g, Tt;
}
var St, Ra;
function Te() {
  if (Ra) return St;
  Ra = 1;
  var _ = function(g, l, r, o, a) {
    switch (a = a || {}, this.x = 0, this.c = g, this.dx = l, this.w = r, this.pitch = o, this.scalex = a.scalex || 1, this.scaley = a.scaley || 1, this.type = a.type || "symbol", this.pitch2 = a.pitch2, this.linewidth = a.linewidth, this.klass = a.klass, this.chordPos = a.chordPos, this.anchor = a.anchor ? a.anchor : "middle", this.top = o, this.pitch2 !== void 0 && this.pitch2 > this.top && (this.top = this.pitch2), this.bottom = o, this.pitch2 !== void 0 && this.pitch2 < this.bottom && (this.bottom = this.pitch2), a.thickness && (this.top += a.thickness / 2, this.bottom -= a.thickness / 2), a.stemHeight && (a.stemHeight > 0 ? this.top += a.stemHeight : this.bottom += a.stemHeight), a.dim && (this.dim = a.dim), a.position && (this.position = a.position), a.voiceNumber !== void 0 && (this.voiceNumber = a.voiceNumber), this.height = a.height ? a.height : 4, a.top && (this.top = a.top), a.bottom && (this.bottom = a.bottom), a.name ? this.name = a.name : this.c ? this.name = this.c : this.name = this.type, a.realWidth ? this.realWidth = a.realWidth : this.realWidth = this.w, this.centerVertically = !1, this.type) {
      case "debug":
        this.chordHeightAbove = this.height;
        break;
      case "lyric":
        a.position && a.position === "below" ? this.lyricHeightBelow = this.height : this.lyricHeightAbove = this.height;
        break;
      case "chord":
        a.position && a.position === "below" ? this.chordHeightBelow = this.height : this.chordHeightAbove = this.height;
        break;
      case "text":
        this.pitch === void 0 ? a.position && a.position === "below" ? this.chordHeightBelow = this.height : this.chordHeightAbove = this.height : this.centerVertically = !0;
        break;
      case "part":
        this.partHeightAbove = this.height;
        break;
    }
  };
  return _.prototype.getChordDim = function() {
    if (this.type === "debug" || !this.chordHeightAbove && !this.chordHeightBelow)
      return null;
    var m = 0, g = this.type === "chord" ? this.realWidth / 2 : 0, l = this.x - g - m, r = l + this.realWidth + m;
    return { left: l, right: r };
  }, _.prototype.invertLane = function(m) {
    this.lane === void 0 && (this.lane = 0), this.lane = m - this.lane - 1;
  }, _.prototype.putChordInLane = function(m) {
    this.lane = m, this.chordHeightAbove ? this.chordHeightAbove = this.height * 1.25 * this.lane : this.chordHeightBelow = this.height * 1.25 * this.lane;
  }, _.prototype.getLane = function() {
    return this.lane === void 0 ? 0 : this.lane;
  }, _.prototype.setX = function(m) {
    this.x = m + this.dx;
  }, St = _, St;
}
var Et, Ia;
function Ws() {
  if (Ia) return Et;
  Ia = 1;
  var _ = De(), m = Te();
  function g(e) {
    return e != null && e.constructor === Object;
  }
  function l(e, c) {
    for (var v in c)
      c.hasOwnProperty(v) && (Array.isArray(c[v]) || g(c[v]) || (e[v] = c[v]));
  }
  function r(e) {
    var c = new _("", 0, 0, "", 0);
    return l(c, e), c.top = 0, c.bottom = -1, e.abcelem && (c.abcelem = {}, l(c.abcelem, e.abcelem), c.abcelem.el_type === "note" && (c.abcelem.el_type = "tabNumber")), e.cloned = c, c;
  }
  function o(e, c) {
    var v = r(e);
    if (c)
      for (var h = e.children, y = !0, w = 0; w < h.length; w++) {
        var A = h[w], P = new m("", 0, 0, 0, "");
        l(P, A), y = c.tablature.setRelative(A, P, y), v.children.push(P);
      }
    return v;
  }
  function a(e, c, v) {
    var h = "tab.tiny", y = 7.5;
    e.isTabBig && (h = "tab.big", y = 10);
    var w = {
      el_type: "tab",
      icon: h,
      Ypos: y
    };
    if (y += e.tabSymbolOffset, !e.hideTabSymbol) {
      var A = new _(w, 0, 0, "symbol", 0);
      A.x = c;
      var P = new m(h, 0, 0, 7.5, "tab");
      P.x = v, A.children.push(P), A.abcelem.el_type == "tab" && (P.pitch = y);
    }
    return A;
  }
  function s(e) {
    if (e.extra)
      for (var c = 0; c < e.extra.length; c++) {
        var v = e.extra[c];
        if (v.type == "lyric")
          return {
            bottom: v.bottom,
            height: v.height
          };
      }
    return null;
  }
  function p() {
    this.accidentals = null;
  }
  function u(e) {
    for (var c = 0, v = 0; v < e.length; v++)
      e[v].tabNameInfos || c++;
    return c;
  }
  function d(e, c, v, h, y) {
    var w = h.num;
    h.note.quarter != null && (w = w.toString(), w += h.note.quarter);
    var A = e.semantics.stringToPitch(h.str);
    v.notes.push({ num: w, str: h.str, pitch: h.note.emit() });
    var P = {
      type: "tabNumber"
    }, N = new m(
      w,
      0,
      0,
      A + 0.3,
      P
    );
    return N.x = c, N.isGrace = y, N.isAltered = h.note.isAltered, N;
  }
  function f(e, c) {
    var v = 0;
    if (e.extra) {
      for (var h = 0; h < e.extra.length; h++)
        if (e.extra[h].c.indexOf("noteheads") >= 0) {
          if (v === c)
            return e.extra[h].x + e.extra[h].w / 2;
          v++;
        }
    }
    return -1;
  }
  function i(e) {
    if (e.abcelem) {
      var c = e.abcelem;
      if (c.rest)
        return c.gracenotes;
    }
    return null;
  }
  function n(e, c, v) {
    var h = e.semantics.notesToNumber(c, v);
    if (h.error)
      return e.setError(h.error), h;
    if (h.graces && h.notes) {
      var y = h.notes.length - 1;
      h.notes[y].graces = h.graces;
    }
    return h;
  }
  function t(e, c, v, h, y) {
    for (var w = 0; w < h.length; w++) {
      var A = { el_type: "note", startChar: v.abcelem.startChar, endChar: v.abcelem.endChar, notes: [], grace: !0 }, P = f(v, w), N = h[w], T = d(e, P, A, N, !0);
      c.children.push(T), y.push(A);
    }
  }
  return p.prototype.build = function(e, c, v, h, y, w, A) {
    u(c);
    var P = c[y + h], N = c[A], T = null, q = null;
    P.children[0].abcelem.el_type != "clef" && w != "none" && P.children.splice(0, 0, w);
    for (var I = 0; I < P.children.length; I++) {
      var C = P.children[I], B = C.x, R = B;
      switch (C.isClef && (N.children.push(a(e, B, R)), C.abcelem.type.indexOf("-8") >= 0 && (e.semantics.clefTranspose = -12), C.abcelem.type.indexOf("+8") >= 0 && (e.semantics.clefTranspose = 12)), C.type) {
        case "staff-extra key-signature":
          this.accidentals = C.abcelem.accidentals, e.semantics.accidentals = this.accidentals;
          break;
        case "bar":
          e.semantics.measureAccidentals = {};
          var S = !1;
          I === P.children.length - 1 && (S = !0);
          var k = o(C, e);
          if (k.abcelem.barNumber) {
            delete k.abcelem.barNumber;
            for (var M = 0; M < k.children.length; M++)
              if (k.children[M].type === "barNumber") {
                k.children.splice(M, 1);
                break;
              }
          }
          k.abcelem.lastBar = S, N.children.push(k), v.push({
            el_type: C.abcelem.el_type,
            type: C.abcelem.type,
            endChar: C.abcelem.endChar,
            startChar: C.abcelem.startChar,
            abselem: k
          });
          break;
        case "rest":
          var F = i(C);
          if (F) {
            if (T = n(e, null, F), T.error) return;
            H = { el_type: "note", startChar: C.abcelem.startChar, endChar: C.abcelem.endChar, notes: [], grace: !0 }, t(e, L, C, T.graces, v);
          }
          break;
        case "note":
          var L = r(C);
          L.x = C.heads[0].x + C.heads[0].w / 2, L.lyricDim = s(C);
          var b = C.abcelem.pitches, x = C.abcelem.gracenotes;
          if (L.type = "tabNumber", T = n(e, b, x), T.error) return;
          if (T.graces) {
            var E = T.notes.length - 1;
            T.notes[E].graces = T.graces;
          }
          q = { el_type: "note", startChar: C.abcelem.startChar, endChar: C.abcelem.endChar, notes: [] };
          for (var D = 0; D < T.notes.length; D++) {
            var O = T.notes[D];
            if (O.graces)
              for (var z = 0; z < O.graces.length; z++) {
                var H = { el_type: "note", startChar: C.abcelem.startChar, endChar: C.abcelem.endChar, notes: [], grace: !0 }, $ = f(C, z), Q = O.graces[z], W = d(e, $, H, Q, !0);
                L.children.push(W), v.push(H);
              }
            var ne = d(e, L.x + C.heads[D].dx, q, O, !1);
            L.children.push(ne);
          }
          q.notes.length > 0 && (q.abselem = L, v.push(q), N.children.push(L));
          break;
      }
    }
  }, Et = p, Et;
}
var At, Fa;
function Us() {
  if (Fa) return At;
  Fa = 1;
  var _ = rs(), m = Ws(), g = Ce();
  function l() {
    return {
      tempoHeightAbove: 0,
      partHeightAbove: 0,
      volumeHeightAbove: 0,
      dynamicHeightAbove: 0,
      endingHeightAbove: 0,
      chordHeightAbove: 0,
      lyricHeightAbove: 0,
      lyricHeightBelow: 0,
      chordHeightBelow: 0,
      volumeHeightBelow: 0,
      dynamicHeightBelow: 0
    };
  }
  function r(e) {
    for (var c = 0, v = 0; v < e.children.length; v++) {
      var h = e.children[v];
      h.specialY && h.specialY.lyricHeightBelow > c && (c = h.specialY.lyricHeightBelow);
    }
    return c;
  }
  function o(e, c, v) {
    var h = e.semantics, y = c.controller.getTextSize, w = h.tabInfos(e), A = h.suppress(e), P = !0;
    if (A && (P = !1), P) {
      var N = y.calc(w, "tablabelfont", "text instrumentname");
      return v.tabNameInfos = {
        textSize: { height: N.height, width: N.width },
        name: w
      }, N.height;
    }
    return 0;
  }
  function a(e, c) {
    return c[e].isTabStaff ? e === c.length - 1 ? !0 : !c[e + 1].isTabStaff : !1;
  }
  function s(e) {
    for (var c = 0, v = 0; v < e.length; v++)
      e[v].isTabStaff || c++;
    return c;
  }
  function p(e, c) {
    for (var v = c; v >= 0; v--)
      if (!e[v].isTabStaff)
        return v;
    return -1;
  }
  function u(e) {
    for (var c = 0; c < e.length; c++)
      if (e[c].isTabStaff) {
        var v = p(e, c);
        e[c].hasStaff = e[v], e[v].hasTab || (e[v].hasTab = []), e[v].hasTab.push(e[c]);
      }
  }
  function d(e, c) {
    return s(e) === 1 && c.voices.length > 1;
  }
  function f(e, c) {
    for (var v = 0, h = 0, y = !0, w = 0; y; ) {
      if (!c[v])
        return -1;
      if (c[v].isTabStaff || (w = c[v].voices.length), c[v].isTabStaff) {
        if (h++, a(v, c) && h < w)
          return v + 1;
      } else if (h = 0, v >= e && (v + 1 == c.length || !c[v + 1].isTabStaff))
        return v + 1;
      if (v++, v > c.length) return -1;
    }
  }
  function i(e, c) {
    for (var v = c; v >= 0; v--)
      if (!e[v].isTabStaff)
        return e[v];
    return null;
  }
  function n(e, c) {
    var v = e[c], h = v.children[0].abcelem;
    return h.el_type === "clef" ? null : c == 0 ? "none" : e[c - 1].children[0];
  }
  function t(e, c, v, h) {
    var y = new m(), w = {
      clef: {
        type: "TAB"
      }
    }, A = e.linePitch * e.nbLines, P = v.staff;
    if (P) {
      var N = P[0];
      if (N && N.clef && N.clef.stafflines == 0) {
        e.setError("No tablatures when stafflines=0");
        return;
      }
      P.splice(
        P.length,
        0,
        w
      );
    }
    var T = v.staffGroup, q = T.voices, I = q[0], C = r(I), B = 3, R = h, S = T.staffs[R], k = A + B - S.bottom - C;
    S.isTabStaff && (k = S.top);
    var M = {
      bottom: -1,
      isTabStaff: !0,
      specialY: l(),
      lines: e.nbLines,
      linePitch: e.linePitch,
      dy: 0.15,
      top: k
    }, F = f(h, T.staffs);
    if (F !== -1) {
      M.parentIndex = F - 1, T.staffs.splice(F, 0, M), T.height += A + B;
      var L = i(T.staffs, F), b = 1;
      d(T.staffs, L) && (b = L.voices.length), w.voices = [];
      for (var x = 0; x < b; x++) {
        var E = new _(0, 0);
        x > 0 && (E.duplicate = !0);
        var D = o(e, c, E) / g.STEP;
        D = Math.max(D, 1), T.staffs[h].top += 1, T.height += D, E.staff = M;
        var O = q.length;
        q.splice(q.length, 0, E);
        var z = n(q, x + h);
        w.voices[x] = [], y.build(e, q, w.voices[x], x, h, z, O);
      }
      u(T.staffs);
    }
  }
  return At = t, At;
}
var Mt, Oa;
function is() {
  if (Oa) return Mt;
  Oa = 1;
  var _ = {
    __: -2,
    _: -1,
    "_/": -0.5,
    "=": 0,
    "": 0,
    "^/": 0.5,
    "^": 1,
    "^^": 2
  }, m = ["C", "-", "D", "-", "E", "F", "-", "G", "-", "A", "-", "B", "c", "-", "d", "-", "e", "f", "-", "g", "-", "a", "-", "b"];
  function g(r) {
    var o = r.match(/([_^\/]*)([ABCDEFGabcdefg])(,*)('*)/);
    if (o && o.length === 5) {
      var a = _[o[1]], s = m.indexOf(o[2]), p = o[4].length - o[3].length;
      return 48 + s + a + p * 12;
    }
    return 0;
  }
  function l(r) {
    r = parseInt(r, 10);
    var o = Math.floor(r / 12), a = r % 12, s = m[a];
    if (s === "-" && (s = "^" + m[a - 1]), o > 4)
      for (s = s.toLowerCase(), o -= 5; o > 0; )
        s += "'", o--;
    else
      for (; o < 4; )
        s += ",", o++;
    return s;
  }
  return Mt = { noteToMidi: g, midiToNote: l }, Mt;
}
var Bt, Ha;
function ss() {
  if (Ha) return Bt;
  Ha = 1;
  var { noteToMidi: _, midiToNote: m } = is();
  function g(r, o) {
    var a = _(r);
    o && (a += o);
    var s = m(a), p = !1, u = !1, d = !1, f = null, i = null, n = !1, t = 0;
    r.startsWith("_") ? (p = !0, t = -1, r[1] == "/" ? (p = !1, i = "v", t = 0) : r[1] == "_" && (n = !0, t -= 1)) : r.startsWith("^") ? (u = !0, t = 1, r[1] == "/" ? (u = !1, i = "^", t = 0) : r[1] == "^" && (n = !0, t += 1)) : r.startsWith("=") && (f = !0, t = 0), d = p || u || i != null, (d || f) && (i != null || n ? s = r.slice(2) : s = r.slice(1));
    var e = (s.match(/,/g) || []).length, c = (s.match(/'/g) || []).length;
    this.pitch = a, this.pitchAltered = 0, this.name = s, this.acc = t, this.isSharp = u, this.isKeySharp = !1, this.isDouble = n, this.isAltered = d, this.isFlat = p, this.isKeyFlat = !1, this.natural = f, this.quarter = i, this.isLower = this.name == this.name.toLowerCase(), this.name = this.name[0].toUpperCase(), this.hasComma = e, this.isQuoted = c;
  }
  function l(r) {
    var o = r.name, a = new g(o);
    return a.pitch = r.pitch, a.hasComma = r.hasComma, a.isLower = r.isLower, a.isQuoted = r.isQuoted, a.isSharp = r.isSharp, a.isKeySharp = r.isKeySharp, a.isFlat = r.isFlat, a.isKeyFlat = r.isKeyFlat, a;
  }
  return g.prototype.sameNoteAs = function(r) {
    return r.pitch === this.pitch;
  }, g.prototype.isLowerThan = function(r) {
    return r.pitch > this.pitch;
  }, g.prototype.checkKeyAccidentals = function(r, o) {
    if (!(this.isAltered || this.natural)) {
      if (o[this.name.toUpperCase()])
        switch (o[this.name.toUpperCase()]) {
          case "__":
            this.acc = -2, this.pitchAltered = -2;
            return;
          case "_":
            this.acc = -1, this.pitchAltered = -1;
            return;
          case "=":
            this.acc = 0, this.pitchAltered = 0;
            return;
          case "^":
            this.acc = 1, this.pitchAltered = 1;
            return;
          case "^^":
            this.acc = 2, this.pitchAltered = 2;
            return;
        }
      else if (r)
        for (var a = this.name, s = 0; s < r.length; s++) {
          var p = r[s];
          a == p.note.toUpperCase() && (p.acc == "flat" && (this.acc = -1, this.isKeyFlat = !0, this.pitchAltered = -1), p.acc == "sharp" && (this.acc = 1, this.isKeySharp = !0, this.pitchAltered = 1));
        }
    }
  }, g.prototype.getAccidentalEquiv = function() {
    var r = l(this);
    return r.isSharp || r.isKeySharp ? (r = r.nextNote(), r.isFlat = !0, r.isSharp = !1, r.isKeySharp = !1) : (r.isFlat || r.isKeyFlat) && (r = r.prevNote(), r.isSharp = !0, r.isFlat = !1, r.isKeyFlat = !1), r;
  }, g.prototype.nextNote = function() {
    var r = m(this.pitch + 1 + this.pitchAltered);
    return new g(r);
  }, g.prototype.prevNote = function() {
    var r = m(this.pitch - 1 + this.pitchAltered);
    return new g(r);
  }, g.prototype.emitNoAccidentals = function() {
    var r = this.name;
    this.isLower && (r = r.toLowerCase());
    for (var o = 0; o < this.isQuoted; o++)
      r += "'";
    for (var a = 0; a < this.hasComma; a++)
      r += ",";
    return r;
  }, g.prototype.emit = function() {
    var r = this.name;
    (this.isSharp || this.isKeySharp) && (r = "^" + r, this.isDouble && (r = "^" + r)), (this.isFlat || this.isKeyFlat) && (r = "_" + r, this.isDouble && (r = "_" + r)), this.quarter && (this.quarter == "^" ? r = "^/" + r : r = "_/" + r), this.natural && (r = "=" + r);
    for (var o = 1; o <= this.hasComma; o++)
      r += ",";
    if (this.isLower) {
      r = r.toLowerCase();
      for (var a = 1; a <= this.isQuoted; a++)
        r += "'";
    }
    return r;
  }, Bt = g, Bt;
}
var Nt, za;
function Xs() {
  if (za) return Nt;
  za = 1;
  var _ = ss(), m = ["A", "B", "C", "D", "E", "F", "G"];
  function g(l, r) {
    var o = new _(l), a = new _(r);
    if (a.isLowerThan(o)) {
      var s = o.emit(), p = a.emit();
      return {
        error: "Invalid string Instrument tuning : " + p + " string lower than " + s + " string"
      };
    }
    var u = [], d = m.indexOf(o.name), f = m.indexOf(a.name);
    if (d == -1 || f == -1)
      return u;
    for (var i = !1; !i; )
      u.push(o.emit()), o = o.nextNote(), o.sameNoteAs(a) && (i = !0);
    return u;
  }
  return Nt = g, Nt;
}
var Pt, Ga;
function js() {
  if (Ga) return Pt;
  Ga = 1;
  const { noteToMidi: _ } = is();
  var m = ss(), g = Xs();
  function l(i) {
    var n = null, t = i.tuning;
    if (i.capo > 0) {
      n = [];
      for (var e = 0; e < t.length; e++) {
        for (var c = new m(t[e]), v = 0; v < i.capo; v++)
          c = c.nextNote();
        n[e] = c.emit();
      }
    }
    return n;
  }
  function r(i) {
    var n = [], t = i.tuning;
    i.capo > 0 && (t = i.capoTuning);
    for (var e = t.length - 1, c = 0; c < t.length; c++) {
      var v = i.highestNote;
      c != t.length - 1 && (v = t[c + 1]);
      var h = g(t[c], v);
      if (h.error)
        return h;
      n[e--] = h;
    }
    return n;
  }
  function o(i) {
    var n = [];
    n[0] = [];
    for (var t = i.strings, e = 1; e < t.length; e++)
      n[e] = t[e - 1];
    return n;
  }
  function a(i, n) {
    for (var t = 0; t < n.length - 1; t++) {
      var e = n[t], c = n[t + 1];
      if (e.str == c.str) {
        if (e.str == i.strings.length - 1) {
          e.num = "?", c.num = "?";
          return;
        }
        c.num < e.num ? (c.str++, c = p(
          i,
          c.note,
          c.str,
          i.secondPos,
          i.strings[c.str].length
        )) : (e.str++, e = p(
          i,
          e.note,
          e.str,
          i.secondPos,
          i.strings[e.str].length
        )), n[t] = e, n[t + 1] = c;
      }
    }
    return null;
  }
  function s(i, n) {
    for (var t = [], e = 0; e < n.length; e++)
      if (!n[e].endTie) {
        var c = new m(n[e].name, i.clefTranspose);
        c.checkKeyAccidentals(i.accidentals, i.measureAccidentals);
        var v = u(i, c);
        t.push(v);
      }
    return a(i, t), t;
  }
  function p(i, n, t, e, c) {
    var v = i.strings;
    n.checkKeyAccidentals(i.accidentals, i.measureAccidentals), e && (v = e);
    var h = n.emitNoAccidentals(), y = v[t].indexOf(h), w = n.acc;
    if (y != -1) {
      if (e && (y += c), (n.isFlat || n.acc == -1) && y == 0) {
        var A = n.getAccidentalEquiv();
        t++, y = v[t].indexOf(A.emit()), w = 0;
      }
      return {
        num: y + w,
        str: t,
        note: n
      };
    }
    return null;
  }
  function u(i, n) {
    if (n.isAltered || n.natural) {
      var t;
      n.isFlat ? n.isDouble ? t = "__" : t = "_" : n.isSharp ? n.isDouble ? t = "^^" : t = "^" : n.natural && (t = "="), i.measureAccidentals[n.name.toUpperCase()] = t;
    }
    for (var e = i.stringPitches.length - 1; e >= 0; e--)
      if (n.pitch + n.pitchAltered >= i.stringPitches[e]) {
        var c = n.pitch + n.pitchAltered - i.stringPitches[e];
        return n.quarter === "^" ? c -= 0.5 : n.quarter === "v" && (c += 0.5), {
          num: Math.round(c),
          str: i.stringPitches.length - 1 - e,
          // reverse the strings because string 0 is on the bottom
          note: n
        };
      }
    return {
      num: "?",
      str: i.stringPitches.length - 1,
      note: n
    };
  }
  f.prototype.stringToPitch = function(i) {
    var n = 5.3, t = this.strings.length - 1;
    return n + (t - i) * this.linePitch;
  };
  function d(i, n) {
    var t = {
      num: "?",
      str: 0,
      note: n
    };
    i.push(t), i.error = n.emit() + ": unexpected note for instrument";
  }
  f.prototype.notesToNumber = function(i, n) {
    var t, e, c = null, v = null;
    if (i && (v = [], i.length > 1 ? (v = s(this, i), v.error && (c = v.error)) : i[0].endTie || (t = new m(i[0].name, this.clefTranspose), t.checkKeyAccidentals(this.accidentals, this.measureAccidentals), e = u(this, t), e ? v.push(e) : (d(v, t), c = v.error))), c) return v;
    var h = null;
    if (n) {
      h = [];
      for (var y = 0; y < n.length; y++)
        t = new m(n[y].name, this.clefTranspose), t.checkKeyAccidentals(this.accidentals, this.measureAccidentals), e = u(this, t), e ? h.push(e) : (d(h, t), c = v.error);
    }
    return {
      notes: v,
      graces: h,
      error: c
    };
  }, f.prototype.toString = function() {
    for (var i = [], n = 0; n < this.tuning.length; n++) {
      var t = this.tuning[n].replace(/,/g, "").replace(/'/g, "").toUpperCase();
      t[0] === "_" ? t = t[1] + "b " : t[0] === "^" && (t = t[1] + "# "), i.push(t);
    }
    return i.join("");
  }, f.prototype.tabInfos = function(i) {
    var n = i.params.label;
    if (n) {
      var t = n.indexOf("%T"), e = "";
      return t != -1 && (e = this.toString(), i.capo > 0 && (e += " capo:" + i.capo), n = n.replace("%T", e)), n;
    }
    return "";
  }, f.prototype.suppress = function(i) {
    var n = i.params.suppress;
    return !!n;
  };
  function f(i) {
    var n = i.tuning, t = i.capo, e = i.params.highestNote;
    this.linePitch = i.linePitch, this.highestNote = "a'", e && (this.highestNote = e), this.measureAccidentals = {}, this.capo = 0, t && (this.capo = parseInt(t, 10)), this.transpose = i.transpose ? i.transpose : 0, this.tuning = n, this.stringPitches = [];
    for (var c = 0; c < this.tuning.length; c++) {
      var v = _(this.tuning[c]) + this.capo;
      this.stringPitches.push(v);
    }
    if (this.capo > 0 && (this.capoTuning = l(this)), this.strings = r(this), this.strings.error) {
      i.setError(this.strings.error), i.inError = !0;
      return;
    }
    this.secondPos = o(this);
  }
  return Pt = f, Pt;
}
var Lt, Ya;
function $s() {
  if (Ya) return Lt;
  Ya = 1;
  var _ = Ys(), m = Us(), g = js();
  l.prototype.init = function(o, a, s, p) {
    this.tune = o, this.params = s, this.tuneNumber = a, this.inError = !1, this.abcTune = o, this.linePitch = 3, this.nbLines = p.defaultTuning.length, this.isTabBig = p.isTabBig, this.tabSymbolOffset = p.tabSymbolOffset, this.capo = s.capo, this.transpose = s.visualTranspose, this.hideTabSymbol = s.hideTabSymbol, this.tablature = new _(this.nbLines, this.linePitch);
    var u = s.tuning;
    u || (u = p.defaultTuning), this.tuning = u, this.semantics = new g(this);
  }, l.prototype.setError = function(o) {
    o && (this.error = o, this.inError = !0, this.tune.warnings ? this.tune.warnings.push(o) : this.tune.warnings = [o]);
  }, l.prototype.render = function(o, a, s) {
    this.inError || this.tablature.bypass(a) || m(this, o, a, s);
  };
  function l() {
  }
  var r = function() {
    return { name: "StringTab", tablature: l };
  };
  return Lt = r, Lt;
}
var qt, Wa;
function os() {
  if (Wa) return qt;
  Wa = 1;
  var _ = $s(), m = {
    violin: { name: "StringTab", defaultTuning: ["G,", "D", "A", "e"], isTabBig: !1, tabSymbolOffset: 0 },
    fiddle: { name: "StringTab", defaultTuning: ["G,", "D", "A", "e"], isTabBig: !1, tabSymbolOffset: 0 },
    mandolin: { name: "StringTab", defaultTuning: ["G,", "D", "A", "e"], isTabBig: !1, tabSymbolOffset: 0 },
    guitar: { name: "StringTab", defaultTuning: ["E,", "A,", "D", "G", "B", "e"], isTabBig: !0, tabSymbolOffset: 0 },
    fiveString: { name: "StringTab", defaultTuning: ["C,", "G,", "D", "A", "e"], isTabBig: !1, tabSymbolOffset: -0.95 }
  }, g = {
    inited: !1,
    plugins: {},
    /**
     * to be called once per plugin for registration 
     * @param {*} plugin 
     */
    register: function(l) {
      var r = l.name, o = l.tablature;
      this.plugins[r] = o;
    },
    setError: function(l, r) {
      l.warnings ? l.warning.push(r) : l.warnings = [r];
    },
    /**
     * handle params for current processed score
     * @param {*} tune current tune 
     * @param {*} tuneNumber number in tune list
     * @param {*} params params to be processed for tablature
     * @return prepared tablatures plugin instances for current tune
     */
    preparePlugins: function(l, r, o) {
      this.inited || (this.register(new _()), this.inited = !0);
      var a = null;
      if (o.tablature) {
        var s = o.tablature;
        a = [];
        for (var p = 0; p < s.length; p++) {
          var u = s[p], d = u.instrument;
          if (d == null)
            return this.setError(l, "tablature 'instrument' is missing"), a;
          var f = m[d], i = null;
          if (f && (i = this.plugins[f.name]), i) {
            o.visualTranspose != 0 && (u.visualTranspose = o.visualTranspose), u.abcSrc = o.tablature.abcSrc;
            var n = {
              classz: i,
              tuneNumber: r,
              params: u,
              instance: null,
              tabType: f
            };
            a.push(n);
          } else if (d === "")
            a.push(null);
          else
            return this.setError(l, "Undefined tablature plugin: " + d), a;
        }
      }
      return a;
    },
    /**
     * Call requested plugin
     * @param {*} renderer 
     * @param {*} abcTune 
     */
    layoutTablatures: function(r, o) {
      var a = o.tablatures, s = 0;
      if (a && a.length > 0)
        for (var p = a.length, u = 0; u < p; ++u)
          a[u] && a[u].params.firstStaffOnly && (a[u].params.suppress = !1);
      for (var d = 0; d < o.lines.length; d++) {
        var f = o.lines[d];
        if (f.staff && s++, s > 1 && a && a.length > 0)
          for (var p = a.length, u = 0; u < p; ++u)
            a[u].params.firstStaffOnly && (a[u].params.suppress = !0);
        var i = f.staff;
        if (i) {
          for (var n = i.length, t = 0; t < i.length; t++)
            if (a[t] && t < n) {
              var e = a[t];
              e.instance == null && (e.instance = new e.classz(), e.instance.init(
                o,
                e.tuneNumber,
                e.params,
                e.tabType
              )), e.instance.render(r, f, t);
            }
        }
      }
    }
  };
  return qt = g, qt;
}
var Dt, Ua;
function Ye() {
  if (Ua) return Dt;
  Ua = 1;
  var _ = Or(), m = Gs(), g = os(), l = {};
  return (function() {
    l.numberOfTunes = function(o) {
      var a = o.split(`
X:`), s = a.length;
      return s === 0 && (s = 1), s;
    };
    var r = l.TuneBook = function(o) {
      var a = m(o);
      this.header = a.header, this.tunes = a.tunes;
    };
    r.prototype.getTuneById = function(o) {
      for (var a = 0; a < this.tunes.length; a++)
        if (this.tunes[a].id === "" + o)
          return this.tunes[a];
      return null;
    }, r.prototype.getTuneByTitle = function(o) {
      for (var a = 0; a < this.tunes.length; a++)
        if (this.tunes[a].title === o)
          return this.tunes[a];
      return null;
    }, l.parseOnly = function(o, a) {
      for (var s = l.numberOfTunes(o), p = [], u = 0; u < s; u++)
        p.push(1);
      function d() {
      }
      return l.renderEngine(d, p, o, a);
    }, l.renderEngine = function(o, a, s, p) {
      var u = [], d = function(y) {
        return y && !y.propertyIsEnumerable("length") && typeof y == "object" && typeof y.length == "number";
      };
      if (!(a === void 0 || s === void 0)) {
        d(a) || (a = [a]), p === void 0 && (p = {});
        for (var f = p.startingTune ? parseInt(p.startingTune, 10) : 0, i = new r(s), n = new _(), t = 0; t < a.length; t++) {
          var e = a[t];
          if (e === "*" || typeof e == "string" && (e = document.getElementById(e)), e)
            if (f >= 0 && f < i.tunes.length) {
              n.parse(i.tunes[f].abc, p, i.tunes[f].startPos - i.header.length);
              var c = n.getTune();
              p.tablature && (c.tablatures = g.preparePlugins(c, f, p));
              var v = n.getWarnings();
              v && (c.warnings = v);
              var h = o(e, c, t, i.tunes[f].abc);
              u.push(h || c);
            } else
              e.innerHTML && (e.innerHTML = "");
          f++;
        }
        return u;
      }
    }, l.extractMeasures = function(o) {
      for (var a = [], s = new r(o), p = 0; p < s.tunes.length; p++) {
        for (var u = s.tunes[p], d = u.abc.split("K:"), f = d[1].split(`
`), i = d[0] + "K:" + f[0] + `
`, n = null, t = null, e = null, c = [], v = !1, h = l.parseOnly(u.abc)[0], y = h.getPickupLength() > 0, w = 0; w < h.lines.length; w++) {
          var A = h.lines[w];
          if (A.staff)
            for (var P = 0; P < 1; P++)
              for (var N = A.staff[P], T = 0; T < 1; T++)
                for (var q = N.voices[T], I = 0; I < q.length; I++) {
                  var C = q[I];
                  if (e === null && C.startChar >= 0 && (e = C.startChar, C.chord === void 0 ? t = n : t = null), C.chord && (n = C), C.el_type === "bar") {
                    if (v) {
                      var B = u.abc.substring(e, C.endChar), R = { abc: B };
                      n = t && t.chord && t.chord.length > 0 ? t.chord[0].name : null, n && (R.lastChord = n), C.startEnding && (R.startEnding = C.startEnding), C.endEnding && (R.endEnding = C.endEnding), c.push(R), e = null, v = !1;
                    }
                  } else C.el_type === "note" && (v = !0);
                }
        }
        a.push({
          header: i,
          measures: c,
          hasPickup: y
        });
      }
      return a;
    };
  })(), Dt = l, Dt;
}
var Rt, Xa;
function Vs() {
  if (Xa) return Rt;
  Xa = 1;
  var _ = Ki(), { relativeMajor: m, transposeKey: g, relativeMode: l, isLegalMode: r } = Vi(), o = $i(), a;
  return (function() {
    a = function(T, q, I) {
      if (q === "TEST")
        return { keyAccidentals: _, relativeMajor: m, transposeKey: g, relativeMode: l, transposeChordName: o };
      I = parseInt(I, 10);
      var C = [], B;
      for (B = 0; B < q.length; B++)
        C = C.concat(s(T, q[B], I));
      C = C.sort(function(k, M) {
        return M.start - k.start;
      });
      var R = T.split("");
      for (B = 0; B < C.length; B++) {
        var S = C[B];
        R.splice(S.start, S.end - S.start, S.note);
      }
      return R.join("");
    };
    function s(T, q, I) {
      var C = [], B = q.getKeySignature();
      if (B.root === "Hp" || B.root === "HP")
        return C;
      C = C.concat(p(T, I));
      for (var R = 0; R < q.lines.length; R++) {
        var S = q.lines[R].staff;
        if (S)
          for (var k = 0; k < S.length; k++) {
            var M = S[k];
            M.clef.type !== "perc" && (C = C.concat(u(T, M.voices, M.key, I)));
          }
      }
      return C;
    }
    function p(T, q) {
      for (var I = [], C = T.split("K:"), B = C[0].length, R = 1; R < C.length; R++) {
        var S = C[R], k = S.match(/^( *)([A-G])([#b]?)( ?)(\w*)/);
        if (k) {
          var M = B + 2 + k[1].length, F = r(k[5]) ? k[5] : "", L = k[2] + k[3] + k[4] + F, b = e({ root: k[2], acc: k[3], mode: F }, q), x = b.root + b.acc + k[4] + b.mode;
          I.push({ start: M, end: M + L.length, note: x });
        }
        B += S.length + 2;
      }
      return I;
    }
    function u(T, q, I, C) {
      for (var B = [], R = e(I, C), S = 0; S < q.length; S++)
        B = B.concat(i(T, q[S], I.root, d(I), R, C));
      return B;
    }
    function d(T) {
      for (var q = {}, I = 0; I < T.accidentals.length; I++) {
        var C = T.accidentals[I];
        C.acc === "flat" ? q[C.note.toUpperCase()] = "_" : C.acc === "sharp" && (q[C.note.toUpperCase()] = "^");
      }
      return q;
    }
    function f(T, q, I) {
      var C = n.indexOf(T.root) - n.indexOf(q);
      return q === "none" && (C = n.indexOf(T.root)), C === 0 ? I > 2 ? C += 7 : I === -12 && (C -= 7) : I > 0 && C < 0 ? C += 7 : I < 0 && C > 0 && (C -= 7), I > 12 ? C += 7 : I < -12 && (C -= 7), C;
    }
    function i(T, q, I, C, B, R) {
      for (var S = [], k = f(B, I, R), M = {}, F = {}, L = 0; L < q.length; L++) {
        var b = q[L];
        if (b.chord)
          for (var x = 0; x < b.chord.length; x++) {
            var E = b.chord[x];
            if (E.position === "default") {
              var D = B.accidentals.length && B.accidentals[0].acc === "flat", O = o(E.name, R, D, !0);
              O = O.replace(/♭/g, "b").replace(/♯/g, "#"), O !== E.name && S.push(P(T, b.startChar, b.endChar, O));
            }
          }
        if (b.el_type === "note" && b.pitches) {
          for (var z = w(T, b.startChar, b.endChar), H = 0; H < z.length; H++) {
            var $ = y(z[H].note, I, C, M);
            $.acc && (M[$.name.toUpperCase()] = $.acc);
            var Q = c($, B, k, F);
            Q.acc && (F[Q.upper] = Q.acc), S.push({ note: Q.acc + Q.name, start: z[H].index, end: z[H].index + z[H].note.length });
          }
          if (b.gracenotes)
            for (var W = 0; W < b.gracenotes.length; W++) {
              var ne = y(b.gracenotes[W].name, I, C, M);
              ne.acc && (M[ne.name.toUpperCase()] = ne.acc);
              var J = c(ne, B, k, M);
              J.acc && (F[J.upper] = J.acc), S.push(A(T, b.startChar, b.endChar, J.acc + J.name, W));
            }
        } else b.el_type === "bar" ? (M = {}, F = {}) : b.el_type === "keySignature" && (I = b.root, C = d(b), B = e(b, R), k = f(B, I, R));
      }
      return S;
    }
    var n = "CDEFGAB", t = [",,,,", ",,,", ",,", ",", "", "'", "''", "'''", "''''"];
    function e(T, q) {
      if (T.root === "none")
        return { root: g("C", q), mode: "", acc: "", accidentals: [] };
      var I = m(T.root + T.acc + T.mode), C = g(I, q), B = l(C, T.mode), R = _(C);
      return { root: B[0], mode: T.mode, acc: B.length > 1 ? B[1] : "", accidentals: R };
    }
    function c(T, q, I, C) {
      for (var B = T.pitch, R = n.indexOf(T.name), S = n.indexOf(q.root), k = (S + B) % 7, M = R + I, F = T.oct; M > 6; )
        F++, M -= 7;
      for (; M < 0; )
        F--, M += 7;
      for (var L = n[k], b = "", x = T.adj, E = "=", D = 0; D < q.accidentals.length; D++)
        if (q.accidentals[D].note.toLowerCase() === L.toLowerCase()) {
          x = x + (q.accidentals[D].acc === "flat" ? -1 : 1), E = q.accidentals[D].acc === "flat" ? "_" : "^";
          break;
        }
      var O;
      switch (x) {
        case -2:
          b = "__";
          break;
        case -1:
          b = "_";
          break;
        case 0:
          b = "=";
          break;
        case 1:
          b = "^";
          break;
        case 2:
          b = "^^";
          break;
        case -3:
          return O = {}, O.pitch = T.pitch - 1, O.oct = T.oct, O.name = n[n.indexOf(T.name) - 1], O.name || (O.name = "B", O.oct--), O.name === "B" || O.name === "E" ? O.adj = T.adj + 1 : O.adj = T.adj + 2, c(O, q, I + 1, C);
        case 3:
          return O = {}, O.pitch = T.pitch + 1, O.oct = T.oct, O.name = n[n.indexOf(T.name) + 1], O.name || (O.name = "C", O.oct++), O.name === "C" || O.name === "F" ? O.adj = T.adj - 1 : O.adj = T.adj - 2, c(O, q, I + 1, C);
      }
      switch ((C[L] === b || !C[L] && b === E) && !T.courtesy && (b = ""), F) {
        case 0:
          L = L + ",,,";
          break;
        case 1:
          L = L + ",,";
          break;
        case 2:
          L = L + ",";
          break;
        // case 3: it is already correct
        case 4:
          L = L.toLowerCase();
          break;
        case 5:
          L = L.toLowerCase() + "'";
          break;
        case 6:
          L = L.toLowerCase() + "''";
          break;
        case 7:
          L = L.toLowerCase() + "'''";
          break;
        case 8:
          L = L.toLowerCase() + "''''";
          break;
      }
      return F > 4 && (L = L.toLowerCase()), { acc: b, name: L, upper: L.toUpperCase() };
    }
    var v = /([_^=]*)([A-Ga-g])([,']*)/, h = /([_^=]*[A-Ga-g][,']*)?(\d*\/*\d*)?([\>\<\-\)]*)?/;
    function y(T, q, I, C) {
      var B = q === "none" ? 0 : n.indexOf(q), R = T.match(v), S = R[2].toUpperCase(), k = n.indexOf(S) - B;
      k < 0 && (k += 7);
      var M = t.indexOf(R[3]);
      S === R[2] && M--;
      var F = C[S] || I[S] || "=";
      return { acc: R[1], name: S, pitch: k, oct: M, adj: N(R[1], I[S], C[S]), courtesy: R[1] === F };
    }
    function w(T, q, I) {
      for (var C = T.substring(q, I), B, R = [], S = /("[^"]+")+/g; (B = S.exec(C)) !== null; )
        R.push({ start: S.lastIndex - B[0].length, end: S.lastIndex });
      for (var k = /(![^!]+!)+/g; (B = k.exec(C)) !== null; )
        R.push({ start: k.lastIndex - B[0].length, end: k.lastIndex });
      for (var M = [], F = /([_^=]*)([A-Ga-g])([,']*)/g; (B = F.exec(C)) !== null; ) {
        for (var L = !1, b = 0; b < R.length; b++)
          F.lastIndex >= R[b].start && F.lastIndex <= R[b].end && (L = !0);
        L || M.push({ note: B[0], index: q + F.lastIndex - B[0].length });
      }
      return M;
    }
    function A(T, q, I, C, B) {
      var R = T.substring(q, I), S = /\{/, k = /\}/, M = /([^\{]*)/, F = /(\/*)/, L = R.match(new RegExp(M.source + S.source + F.source + h.source + F.source + h.source + F.source + h.source + F.source + h.source + F.source + h.source + F.source + h.source + F.source + h.source + F.source + h.source + k.source));
      if (L) {
        for (var b = 1 + L[1].length, x = 0; x < B; x++)
          L[x * 3 + 2] && (b += L[x * 3 + 2].length), L[x * 3 + 3] && (b += L[x * 3 + 3].length), L[x * 3 + 4] && (b += L[x * 3 + 4].length), L[x * 3 + 5] && (b += L[x * 3 + 5].length);
        L[B * 3 + 2] && (b += L[x * 3 + 2].length), q += b;
        var E = L[B * 3 + 3] ? L[B * 3 + 3].length : 0;
        E += L[B * 3 + 4] ? L[B * 3 + 4].length : 0, E += L[B * 3 + 5] ? L[B * 3 + 5].length : 0, I = q + E;
      }
      return { start: q, end: I, note: C };
    }
    function P(T, q, I, C) {
      var B = T.substring(q, I).match(/([^"]+)?(".+")+/);
      return B[1] && (q += B[1].length), I = q + B[2].length, { start: q + 1, end: I - 1, note: C };
    }
    function N(T, q, I) {
      if (!T && I && (T = I), !T)
        return 0;
      switch (q) {
        case void 0:
          switch (T) {
            case "__":
              return -2;
            case "_":
              return -1;
            case "=":
              return 0;
            case "^":
              return 1;
            case "^^":
              return 2;
            default:
              return 0;
          }
        case "_":
          switch (T) {
            case "__":
              return -1;
            case "_":
              return 0;
            case "=":
              return 1;
            case "^":
              return 2;
            case "^^":
              return 3;
            default:
              return 0;
          }
        case "^":
          switch (T) {
            case "__":
              return -3;
            case "_":
              return -2;
            case "=":
              return -1;
            case "^":
              return 0;
            case "^^":
              return 1;
            default:
              return 0;
          }
      }
      return 0;
    }
  })(), Rt = a, Rt;
}
var It, ja;
function Ks() {
  if (ja) return It;
  ja = 1;
  var _ = function(l, r, o, a) {
    this.type = "BeamElem", this.isflat = !!o, this.isgrace = !!(r && r === "grace"), this.forceup = !!(this.isgrace || r && r === "up"), this.forcedown = !!(r && r === "down"), this.elems = [], this.total = 0, this.average = 6, this.allrests = !0, this.stemHeight = l, this.beams = [], a && a.duration ? (this.duration = a.duration, a.startTriplet && (this.duration *= a.tripletMultiplier), this.duration = Math.round(this.duration * 1e3) / 1e3) : this.duration = 0;
  };
  _.prototype.setHint = function() {
    this.hint = !0;
  }, _.prototype.runningDirection = function(g) {
    var l = g.averagepitch;
    l !== void 0 && (this.total = Math.round(this.total + l), this.count || (this.count = 0), this.count++);
  }, _.prototype.add = function(g) {
    var l = g.abcelem.averagepitch;
    l !== void 0 && (g.abcelem.rest || (this.allrests = !1), g.beam = this, this.elems.push(g), this.total = Math.round(this.total + l), (this.min === void 0 || g.abcelem.minpitch < this.min) && (this.min = g.abcelem.minpitch), (this.max === void 0 || g.abcelem.maxpitch > this.max) && (this.max = g.abcelem.maxpitch));
  }, _.prototype.addBeam = function(g) {
    this.beams.push(g);
  }, _.prototype.setStemDirection = function() {
    if (this.average = m(this.total, this.count), this.forceup)
      this.stemsUp = !0;
    else if (this.forcedown)
      this.stemsUp = !1;
    else {
      var g = 6;
      this.stemsUp = this.average < g;
    }
    delete this.count, this.total = 0;
  }, _.prototype.calcDir = function() {
    if (this.average = m(this.total, this.elems.length), this.forceup)
      this.stemsUp = !0;
    else if (this.forcedown)
      this.stemsUp = !1;
    else {
      var g = 6;
      this.stemsUp = this.average < g;
    }
    for (var l = this.stemsUp ? "up" : "down", r = 0; r < this.elems.length; r++)
      for (var o = 0; o < this.elems[r].heads.length; o++)
        this.elems[r].heads[o].stemDir = l;
  };
  function m(g, l) {
    return l ? g / l : 0;
  }
  return It = _, It;
}
var Ft, $a;
function Qs() {
  if ($a) return Ft;
  $a = 1;
  var _ = function(g, l) {
    this.startVoice = g, this.type = l;
  };
  return _.prototype.setBottomStaff = function(m) {
    this.endVoice = m, this.startVoice.header && !this.endVoice.header && (this.header = this.startVoice.header, delete this.startVoice.header);
  }, _.prototype.continuing = function(m) {
    this.lastContinuedVoice = m;
  }, _.prototype.getWidth = function() {
    return 10;
  }, _.prototype.isStartVoice = function(m) {
    return !!(this.startVoice && this.startVoice.staff && this.startVoice.staff.voices.length > 0 && this.startVoice.staff.voices[0] === m);
  }, Ft = _, Ft;
}
var Ot, Va;
function Ne() {
  if (Va) return Ot;
  Va = 1;
  var _ = Ce(), m = {
    0: { d: [["M", 4.83, -14.97], ["c", 0.33, -0.03, 1.11, 0, 1.47, 0.06], ["c", 1.68, 0.36, 2.97, 1.59, 3.78, 3.6], ["c", 1.2, 2.97, 0.81, 6.96, -0.9, 9.27], ["c", -0.78, 1.08, -1.71, 1.71, -2.91, 1.95], ["c", -0.45, 0.09, -1.32, 0.09, -1.77, 0], ["c", -0.81, -0.18, -1.47, -0.51, -2.07, -1.02], ["c", -2.34, -2.07, -3.15, -6.72, -1.74, -10.2], ["c", 0.87, -2.16, 2.28, -3.42, 4.14, -3.66], ["z"], ["m", 1.11, 0.87], ["c", -0.21, -0.06, -0.69, -0.09, -0.87, -0.06], ["c", -0.54, 0.12, -0.87, 0.42, -1.17, 0.99], ["c", -0.36, 0.66, -0.51, 1.56, -0.6, 3], ["c", -0.03, 0.75, -0.03, 4.59, 0, 5.31], ["c", 0.09, 1.5, 0.27, 2.4, 0.6, 3.06], ["c", 0.24, 0.48, 0.57, 0.78, 0.96, 0.9], ["c", 0.27, 0.09, 0.78, 0.09, 1.05, 0], ["c", 0.39, -0.12, 0.72, -0.42, 0.96, -0.9], ["c", 0.33, -0.66, 0.51, -1.56, 0.6, -3.06], ["c", 0.03, -0.72, 0.03, -4.56, 0, -5.31], ["c", -0.09, -1.47, -0.27, -2.37, -0.6, -3.03], ["c", -0.24, -0.48, -0.54, -0.78, -0.93, -0.9], ["z"]], w: 10.78, h: 14.959 },
    1: { d: [["M", 3.3, -15.06], ["c", 0.06, -0.06, 0.21, -0.03, 0.66, 0.15], ["c", 0.81, 0.39, 1.08, 0.39, 1.83, 0.03], ["c", 0.21, -0.09, 0.39, -0.15, 0.42, -0.15], ["c", 0.12, 0, 0.21, 0.09, 0.27, 0.21], ["c", 0.06, 0.12, 0.06, 0.33, 0.06, 5.94], ["c", 0, 3.93, 0, 5.85, 0.03, 6.03], ["c", 0.06, 0.36, 0.15, 0.69, 0.27, 0.96], ["c", 0.36, 0.75, 0.93, 1.17, 1.68, 1.26], ["c", 0.3, 0.03, 0.39, 0.09, 0.39, 0.3], ["c", 0, 0.15, -0.03, 0.18, -0.09, 0.24], ["c", -0.06, 0.06, -0.09, 0.06, -0.48, 0.06], ["c", -0.42, 0, -0.69, -0.03, -2.1, -0.24], ["c", -0.9, -0.15, -1.77, -0.15, -2.67, 0], ["c", -1.41, 0.21, -1.68, 0.24, -2.1, 0.24], ["c", -0.39, 0, -0.42, 0, -0.48, -0.06], ["c", -0.06, -0.06, -0.06, -0.09, -0.06, -0.24], ["c", 0, -0.21, 0.06, -0.27, 0.36, -0.3], ["c", 0.75, -0.09, 1.32, -0.51, 1.68, -1.26], ["c", 0.12, -0.27, 0.21, -0.6, 0.27, -0.96], ["c", 0.03, -0.18, 0.03, -1.59, 0.03, -4.29], ["c", 0, -3.87, 0, -4.05, -0.06, -4.14], ["c", -0.09, -0.15, -0.18, -0.24, -0.39, -0.24], ["c", -0.12, 0, -0.15, 0.03, -0.21, 0.06], ["c", -0.03, 0.06, -0.45, 0.99, -0.96, 2.13], ["c", -0.48, 1.14, -0.9, 2.1, -0.93, 2.16], ["c", -0.06, 0.15, -0.21, 0.24, -0.33, 0.24], ["c", -0.24, 0, -0.42, -0.18, -0.42, -0.39], ["c", 0, -0.06, 3.27, -7.62, 3.33, -7.74], ["z"]], w: 8.94, h: 15.058 },
    2: { d: [["M", 4.23, -14.97], ["c", 0.57, -0.06, 1.68, 0, 2.34, 0.18], ["c", 0.69, 0.18, 1.5, 0.54, 2.01, 0.9], ["c", 1.35, 0.96, 1.95, 2.25, 1.77, 3.81], ["c", -0.15, 1.35, -0.66, 2.34, -1.68, 3.15], ["c", -0.6, 0.48, -1.44, 0.93, -3.12, 1.65], ["c", -1.32, 0.57, -1.8, 0.81, -2.37, 1.14], ["c", -0.57, 0.33, -0.57, 0.33, -0.24, 0.27], ["c", 0.39, -0.09, 1.26, -0.09, 1.68, 0], ["c", 0.72, 0.15, 1.41, 0.45, 2.1, 0.9], ["c", 0.99, 0.63, 1.86, 0.87, 2.55, 0.75], ["c", 0.24, -0.06, 0.42, -0.15, 0.57, -0.3], ["c", 0.12, -0.09, 0.3, -0.42, 0.3, -0.51], ["c", 0, -0.09, 0.12, -0.21, 0.24, -0.24], ["c", 0.18, -0.03, 0.39, 0.12, 0.39, 0.3], ["c", 0, 0.12, -0.15, 0.57, -0.3, 0.87], ["c", -0.54, 1.02, -1.56, 1.74, -2.79, 2.01], ["c", -0.42, 0.09, -1.23, 0.09, -1.62, 0.03], ["c", -0.81, -0.18, -1.32, -0.45, -2.01, -1.11], ["c", -0.45, -0.45, -0.63, -0.57, -0.96, -0.69], ["c", -0.84, -0.27, -1.89, 0.12, -2.25, 0.9], ["c", -0.12, 0.21, -0.21, 0.54, -0.21, 0.72], ["c", 0, 0.12, -0.12, 0.21, -0.27, 0.24], ["c", -0.15, 0, -0.27, -0.03, -0.33, -0.15], ["c", -0.09, -0.21, 0.09, -1.08, 0.33, -1.71], ["c", 0.24, -0.66, 0.66, -1.26, 1.29, -1.89], ["c", 0.45, -0.45, 0.9, -0.81, 1.92, -1.56], ["c", 1.29, -0.93, 1.89, -1.44, 2.34, -1.98], ["c", 0.87, -1.05, 1.26, -2.19, 1.2, -3.63], ["c", -0.06, -1.29, -0.39, -2.31, -0.96, -2.91], ["c", -0.36, -0.33, -0.72, -0.51, -1.17, -0.54], ["c", -0.84, -0.03, -1.53, 0.42, -1.59, 1.05], ["c", -0.03, 0.33, 0.12, 0.6, 0.57, 1.14], ["c", 0.45, 0.54, 0.54, 0.87, 0.42, 1.41], ["c", -0.15, 0.63, -0.54, 1.11, -1.08, 1.38], ["c", -0.63, 0.33, -1.2, 0.33, -1.83, 0], ["c", -0.24, -0.12, -0.33, -0.18, -0.54, -0.39], ["c", -0.18, -0.18, -0.27, -0.3, -0.36, -0.51], ["c", -0.24, -0.45, -0.27, -0.84, -0.21, -1.38], ["c", 0.12, -0.75, 0.45, -1.41, 1.02, -1.98], ["c", 0.72, -0.72, 1.74, -1.17, 2.85, -1.32], ["z"]], w: 10.764, h: 14.97 },
    3: { d: [["M", 3.78, -14.97], ["c", 0.3, -0.03, 1.41, 0, 1.83, 0.06], ["c", 2.22, 0.3, 3.51, 1.32, 3.72, 2.91], ["c", 0.03, 0.33, 0.03, 1.26, -0.03, 1.65], ["c", -0.12, 0.84, -0.48, 1.47, -1.05, 1.77], ["c", -0.27, 0.15, -0.36, 0.24, -0.45, 0.39], ["c", -0.09, 0.21, -0.09, 0.36, 0, 0.57], ["c", 0.09, 0.15, 0.18, 0.24, 0.51, 0.39], ["c", 0.75, 0.42, 1.23, 1.14, 1.41, 2.13], ["c", 0.06, 0.42, 0.06, 1.35, 0, 1.71], ["c", -0.18, 0.81, -0.48, 1.38, -1.02, 1.95], ["c", -0.75, 0.72, -1.8, 1.2, -3.18, 1.38], ["c", -0.42, 0.06, -1.56, 0.06, -1.95, 0], ["c", -1.89, -0.33, -3.18, -1.29, -3.51, -2.64], ["c", -0.03, -0.12, -0.03, -0.33, -0.03, -0.6], ["c", 0, -0.36, 0, -0.42, 0.06, -0.63], ["c", 0.12, -0.3, 0.27, -0.51, 0.51, -0.75], ["c", 0.24, -0.24, 0.45, -0.39, 0.75, -0.51], ["c", 0.21, -0.06, 0.27, -0.06, 0.6, -0.06], ["c", 0.33, 0, 0.39, 0, 0.6, 0.06], ["c", 0.3, 0.12, 0.51, 0.27, 0.75, 0.51], ["c", 0.36, 0.33, 0.57, 0.75, 0.6, 1.2], ["c", 0, 0.21, 0, 0.27, -0.06, 0.42], ["c", -0.09, 0.18, -0.12, 0.24, -0.54, 0.54], ["c", -0.51, 0.36, -0.63, 0.54, -0.6, 0.87], ["c", 0.06, 0.54, 0.54, 0.9, 1.38, 0.99], ["c", 0.36, 0.06, 0.72, 0.03, 0.96, -0.06], ["c", 0.81, -0.27, 1.29, -1.23, 1.44, -2.79], ["c", 0.03, -0.45, 0.03, -1.95, -0.03, -2.37], ["c", -0.09, -0.75, -0.33, -1.23, -0.75, -1.44], ["c", -0.33, -0.18, -0.45, -0.18, -1.98, -0.18], ["c", -1.35, 0, -1.41, 0, -1.5, -0.06], ["c", -0.18, -0.12, -0.24, -0.39, -0.12, -0.6], ["c", 0.12, -0.15, 0.15, -0.15, 1.68, -0.15], ["c", 1.5, 0, 1.62, 0, 1.89, -0.15], ["c", 0.18, -0.09, 0.42, -0.36, 0.54, -0.57], ["c", 0.18, -0.42, 0.27, -0.9, 0.3, -1.95], ["c", 0.03, -1.2, -0.06, -1.8, -0.36, -2.37], ["c", -0.24, -0.48, -0.63, -0.81, -1.14, -0.96], ["c", -0.3, -0.06, -1.08, -0.06, -1.38, 0.03], ["c", -0.6, 0.15, -0.9, 0.42, -0.96, 0.84], ["c", -0.03, 0.3, 0.06, 0.45, 0.63, 0.84], ["c", 0.33, 0.24, 0.42, 0.39, 0.45, 0.63], ["c", 0.03, 0.72, -0.57, 1.5, -1.32, 1.65], ["c", -1.05, 0.27, -2.1, -0.57, -2.1, -1.65], ["c", 0, -0.45, 0.15, -0.96, 0.39, -1.38], ["c", 0.12, -0.21, 0.54, -0.63, 0.81, -0.81], ["c", 0.57, -0.42, 1.38, -0.69, 2.25, -0.81], ["z"]], w: 9.735, h: 14.967 },
    4: { d: [["M", 8.64, -14.94], ["c", 0.27, -0.09, 0.42, -0.12, 0.54, -0.03], ["c", 0.09, 0.06, 0.15, 0.21, 0.15, 0.3], ["c", -0.03, 0.06, -1.92, 2.31, -4.23, 5.04], ["c", -2.31, 2.73, -4.23, 4.98, -4.26, 5.01], ["c", -0.03, 0.06, 0.12, 0.06, 2.55, 0.06], ["l", 2.61, 0], ["l", 0, -2.37], ["c", 0, -2.19, 0.03, -2.37, 0.06, -2.46], ["c", 0.03, -0.06, 0.21, -0.18, 0.57, -0.42], ["c", 1.08, -0.72, 1.38, -1.08, 1.86, -2.16], ["c", 0.12, -0.3, 0.24, -0.54, 0.27, -0.57], ["c", 0.12, -0.12, 0.39, -0.06, 0.45, 0.12], ["c", 0.06, 0.09, 0.06, 0.57, 0.06, 3.96], ["l", 0, 3.9], ["l", 1.08, 0], ["c", 1.05, 0, 1.11, 0, 1.2, 0.06], ["c", 0.24, 0.15, 0.24, 0.54, 0, 0.69], ["c", -0.09, 0.06, -0.15, 0.06, -1.2, 0.06], ["l", -1.08, 0], ["l", 0, 0.33], ["c", 0, 0.57, 0.09, 1.11, 0.3, 1.53], ["c", 0.36, 0.75, 0.93, 1.17, 1.68, 1.26], ["c", 0.3, 0.03, 0.39, 0.09, 0.39, 0.3], ["c", 0, 0.15, -0.03, 0.18, -0.09, 0.24], ["c", -0.06, 0.06, -0.09, 0.06, -0.48, 0.06], ["c", -0.42, 0, -0.69, -0.03, -2.1, -0.24], ["c", -0.9, -0.15, -1.77, -0.15, -2.67, 0], ["c", -1.41, 0.21, -1.68, 0.24, -2.1, 0.24], ["c", -0.39, 0, -0.42, 0, -0.48, -0.06], ["c", -0.06, -0.06, -0.06, -0.09, -0.06, -0.24], ["c", 0, -0.21, 0.06, -0.27, 0.36, -0.3], ["c", 0.75, -0.09, 1.32, -0.51, 1.68, -1.26], ["c", 0.21, -0.42, 0.3, -0.96, 0.3, -1.53], ["l", 0, -0.33], ["l", -2.7, 0], ["c", -2.91, 0, -2.85, 0, -3.09, -0.15], ["c", -0.18, -0.12, -0.3, -0.39, -0.27, -0.54], ["c", 0.03, -0.06, 0.18, -0.24, 0.33, -0.45], ["c", 0.75, -0.9, 1.59, -2.07, 2.13, -3.03], ["c", 0.33, -0.54, 0.84, -1.62, 1.05, -2.16], ["c", 0.57, -1.41, 0.84, -2.64, 0.9, -4.05], ["c", 0.03, -0.63, 0.06, -0.72, 0.24, -0.81], ["l", 0.12, -0.06], ["l", 0.45, 0.12], ["c", 0.66, 0.18, 1.02, 0.24, 1.47, 0.27], ["c", 0.6, 0.03, 1.23, -0.09, 2.01, -0.33], ["z"]], w: 11.795, h: 14.994 },
    5: { d: [["M", 1.02, -14.94], ["c", 0.12, -0.09, 0.03, -0.09, 1.08, 0.06], ["c", 2.49, 0.36, 4.35, 0.36, 6.96, -0.06], ["c", 0.57, -0.09, 0.66, -0.06, 0.81, 0.06], ["c", 0.15, 0.18, 0.12, 0.24, -0.15, 0.51], ["c", -1.29, 1.26, -3.24, 2.04, -5.58, 2.31], ["c", -0.6, 0.09, -1.2, 0.12, -1.71, 0.12], ["c", -0.39, 0, -0.45, 0, -0.57, 0.06], ["c", -0.09, 0.06, -0.15, 0.12, -0.21, 0.21], ["l", -0.06, 0.12], ["l", 0, 1.65], ["l", 0, 1.65], ["l", 0.21, -0.21], ["c", 0.66, -0.57, 1.41, -0.96, 2.19, -1.14], ["c", 0.33, -0.06, 1.41, -0.06, 1.95, 0], ["c", 2.61, 0.36, 4.02, 1.74, 4.26, 4.14], ["c", 0.03, 0.45, 0.03, 1.08, -0.03, 1.44], ["c", -0.18, 1.02, -0.78, 2.01, -1.59, 2.7], ["c", -0.72, 0.57, -1.62, 1.02, -2.49, 1.2], ["c", -1.38, 0.27, -3.03, 0.06, -4.2, -0.54], ["c", -1.08, -0.54, -1.71, -1.32, -1.86, -2.28], ["c", -0.09, -0.69, 0.09, -1.29, 0.57, -1.74], ["c", 0.24, -0.24, 0.45, -0.39, 0.75, -0.51], ["c", 0.21, -0.06, 0.27, -0.06, 0.6, -0.06], ["c", 0.33, 0, 0.39, 0, 0.6, 0.06], ["c", 0.3, 0.12, 0.51, 0.27, 0.75, 0.51], ["c", 0.36, 0.33, 0.57, 0.75, 0.6, 1.2], ["c", 0, 0.21, 0, 0.27, -0.06, 0.42], ["c", -0.09, 0.18, -0.12, 0.24, -0.54, 0.54], ["c", -0.18, 0.12, -0.36, 0.3, -0.42, 0.33], ["c", -0.36, 0.42, -0.18, 0.99, 0.36, 1.26], ["c", 0.51, 0.27, 1.47, 0.36, 2.01, 0.27], ["c", 0.93, -0.21, 1.47, -1.17, 1.65, -2.91], ["c", 0.06, -0.45, 0.06, -1.89, 0, -2.31], ["c", -0.15, -1.2, -0.51, -2.1, -1.05, -2.55], ["c", -0.21, -0.18, -0.54, -0.36, -0.81, -0.39], ["c", -0.3, -0.06, -0.84, -0.03, -1.26, 0.06], ["c", -0.93, 0.18, -1.65, 0.6, -2.16, 1.2], ["c", -0.15, 0.21, -0.27, 0.3, -0.39, 0.3], ["c", -0.15, 0, -0.3, -0.09, -0.36, -0.18], ["c", -0.06, -0.09, -0.06, -0.15, -0.06, -3.66], ["c", 0, -3.39, 0, -3.57, 0.06, -3.66], ["c", 0.03, -0.06, 0.09, -0.15, 0.15, -0.18], ["z"]], w: 10.212, h: 14.997 },
    6: { d: [["M", 4.98, -14.97], ["c", 0.36, -0.03, 1.2, 0, 1.59, 0.06], ["c", 0.9, 0.15, 1.68, 0.51, 2.25, 1.05], ["c", 0.57, 0.51, 0.87, 1.23, 0.84, 1.98], ["c", -0.03, 0.51, -0.21, 0.9, -0.6, 1.26], ["c", -0.24, 0.24, -0.45, 0.39, -0.75, 0.51], ["c", -0.21, 0.06, -0.27, 0.06, -0.6, 0.06], ["c", -0.33, 0, -0.39, 0, -0.6, -0.06], ["c", -0.3, -0.12, -0.51, -0.27, -0.75, -0.51], ["c", -0.39, -0.36, -0.57, -0.78, -0.57, -1.26], ["c", 0, -0.27, 0, -0.3, 0.09, -0.42], ["c", 0.03, -0.09, 0.18, -0.21, 0.3, -0.3], ["c", 0.12, -0.09, 0.3, -0.21, 0.39, -0.27], ["c", 0.09, -0.06, 0.21, -0.18, 0.27, -0.24], ["c", 0.06, -0.12, 0.09, -0.15, 0.09, -0.33], ["c", 0, -0.18, -0.03, -0.24, -0.09, -0.36], ["c", -0.24, -0.39, -0.75, -0.6, -1.38, -0.57], ["c", -0.54, 0.03, -0.9, 0.18, -1.23, 0.48], ["c", -0.81, 0.72, -1.08, 2.16, -0.96, 5.37], ["l", 0, 0.63], ["l", 0.3, -0.12], ["c", 0.78, -0.27, 1.29, -0.33, 2.1, -0.27], ["c", 1.47, 0.12, 2.49, 0.54, 3.27, 1.29], ["c", 0.48, 0.51, 0.81, 1.11, 0.96, 1.89], ["c", 0.06, 0.27, 0.06, 0.42, 0.06, 0.93], ["c", 0, 0.54, 0, 0.69, -0.06, 0.96], ["c", -0.15, 0.78, -0.48, 1.38, -0.96, 1.89], ["c", -0.54, 0.51, -1.17, 0.87, -1.98, 1.08], ["c", -1.14, 0.3, -2.4, 0.33, -3.24, 0.03], ["c", -1.5, -0.48, -2.64, -1.89, -3.27, -4.02], ["c", -0.36, -1.23, -0.51, -2.82, -0.42, -4.08], ["c", 0.3, -3.66, 2.28, -6.3, 4.95, -6.66], ["z"], ["m", 0.66, 7.41], ["c", -0.27, -0.09, -0.81, -0.12, -1.08, -0.06], ["c", -0.72, 0.18, -1.08, 0.69, -1.23, 1.71], ["c", -0.06, 0.54, -0.06, 3, 0, 3.54], ["c", 0.18, 1.26, 0.72, 1.77, 1.8, 1.74], ["c", 0.39, -0.03, 0.63, -0.09, 0.9, -0.27], ["c", 0.66, -0.42, 0.9, -1.32, 0.9, -3.24], ["c", 0, -2.22, -0.36, -3.12, -1.29, -3.42], ["z"]], w: 9.956, h: 14.982 },
    7: { d: [["M", 0.21, -14.97], ["c", 0.21, -0.06, 0.45, 0, 0.54, 0.15], ["c", 0.06, 0.09, 0.06, 0.15, 0.06, 0.39], ["c", 0, 0.24, 0, 0.33, 0.06, 0.42], ["c", 0.06, 0.12, 0.21, 0.24, 0.27, 0.24], ["c", 0.03, 0, 0.12, -0.12, 0.24, -0.21], ["c", 0.96, -1.2, 2.58, -1.35, 3.99, -0.42], ["c", 0.15, 0.12, 0.42, 0.3, 0.54, 0.45], ["c", 0.48, 0.39, 0.81, 0.57, 1.29, 0.6], ["c", 0.69, 0.03, 1.5, -0.3, 2.13, -0.87], ["c", 0.09, -0.09, 0.27, -0.3, 0.39, -0.45], ["c", 0.12, -0.15, 0.24, -0.27, 0.3, -0.3], ["c", 0.18, -0.06, 0.39, 0.03, 0.51, 0.21], ["c", 0.06, 0.18, 0.06, 0.24, -0.27, 0.72], ["c", -0.18, 0.24, -0.54, 0.78, -0.78, 1.17], ["c", -2.37, 3.54, -3.54, 6.27, -3.87, 9], ["c", -0.03, 0.33, -0.03, 0.66, -0.03, 1.26], ["c", 0, 0.9, 0, 1.08, 0.15, 1.89], ["c", 0.06, 0.45, 0.06, 0.48, 0.03, 0.6], ["c", -0.06, 0.09, -0.21, 0.21, -0.3, 0.21], ["c", -0.03, 0, -0.27, -0.06, -0.54, -0.15], ["c", -0.84, -0.27, -1.11, -0.3, -1.65, -0.3], ["c", -0.57, 0, -0.84, 0.03, -1.56, 0.27], ["c", -0.6, 0.18, -0.69, 0.21, -0.81, 0.15], ["c", -0.12, -0.06, -0.21, -0.18, -0.21, -0.3], ["c", 0, -0.15, 0.6, -1.44, 1.2, -2.61], ["c", 1.14, -2.22, 2.73, -4.68, 5.1, -8.01], ["c", 0.21, -0.27, 0.36, -0.48, 0.33, -0.48], ["c", 0, 0, -0.12, 0.06, -0.27, 0.12], ["c", -0.54, 0.3, -0.99, 0.39, -1.56, 0.39], ["c", -0.75, 0.03, -1.2, -0.18, -1.83, -0.75], ["c", -0.99, -0.9, -1.83, -1.17, -2.31, -0.72], ["c", -0.18, 0.15, -0.36, 0.51, -0.45, 0.84], ["c", -0.06, 0.24, -0.06, 0.33, -0.09, 1.98], ["c", 0, 1.62, -0.03, 1.74, -0.06, 1.8], ["c", -0.15, 0.24, -0.54, 0.24, -0.69, 0], ["c", -0.06, -0.09, -0.06, -0.15, -0.06, -3.57], ["c", 0, -3.42, 0, -3.48, 0.06, -3.57], ["c", 0.03, -0.06, 0.09, -0.12, 0.15, -0.15], ["z"]], w: 10.561, h: 15.093 },
    8: { d: [["M", 4.98, -14.97], ["c", 0.33, -0.03, 1.02, -0.03, 1.32, 0], ["c", 1.32, 0.12, 2.49, 0.6, 3.21, 1.32], ["c", 0.39, 0.39, 0.66, 0.81, 0.78, 1.29], ["c", 0.09, 0.36, 0.09, 1.08, 0, 1.44], ["c", -0.21, 0.84, -0.66, 1.59, -1.59, 2.55], ["l", -0.3, 0.3], ["l", 0.27, 0.18], ["c", 1.47, 0.93, 2.31, 2.31, 2.25, 3.75], ["c", -0.03, 0.75, -0.24, 1.35, -0.63, 1.95], ["c", -0.45, 0.66, -1.02, 1.14, -1.83, 1.53], ["c", -1.8, 0.87, -4.2, 0.87, -6, 0.03], ["c", -1.62, -0.78, -2.52, -2.16, -2.46, -3.66], ["c", 0.06, -0.99, 0.54, -1.77, 1.8, -2.97], ["c", 0.54, -0.51, 0.54, -0.54, 0.48, -0.57], ["c", -0.39, -0.27, -0.96, -0.78, -1.2, -1.14], ["c", -0.75, -1.11, -0.87, -2.4, -0.3, -3.6], ["c", 0.69, -1.35, 2.25, -2.25, 4.2, -2.4], ["z"], ["m", 1.53, 0.69], ["c", -0.42, -0.09, -1.11, -0.12, -1.38, -0.06], ["c", -0.3, 0.06, -0.6, 0.18, -0.81, 0.3], ["c", -0.21, 0.12, -0.6, 0.51, -0.72, 0.72], ["c", -0.51, 0.87, -0.42, 1.89, 0.21, 2.52], ["c", 0.21, 0.21, 0.36, 0.3, 1.95, 1.23], ["c", 0.96, 0.54, 1.74, 0.99, 1.77, 1.02], ["c", 0.09, 0, 0.63, -0.6, 0.99, -1.11], ["c", 0.21, -0.36, 0.48, -0.87, 0.57, -1.23], ["c", 0.06, -0.24, 0.06, -0.36, 0.06, -0.72], ["c", 0, -0.45, -0.03, -0.66, -0.15, -0.99], ["c", -0.39, -0.81, -1.29, -1.44, -2.49, -1.68], ["z"], ["m", -1.44, 8.07], ["l", -1.89, -1.08], ["c", -0.03, 0, -0.18, 0.15, -0.39, 0.33], ["c", -1.2, 1.08, -1.65, 1.95, -1.59, 3], ["c", 0.09, 1.59, 1.35, 2.85, 3.21, 3.24], ["c", 0.33, 0.06, 0.45, 0.06, 0.93, 0.06], ["c", 0.63, 0, 0.81, -0.03, 1.29, -0.27], ["c", 0.9, -0.42, 1.47, -1.41, 1.41, -2.4], ["c", -0.06, -0.66, -0.39, -1.29, -0.9, -1.65], ["c", -0.12, -0.09, -1.05, -0.63, -2.07, -1.23], ["z"]], w: 10.926, h: 14.989 },
    9: { d: [["M", 4.23, -14.97], ["c", 0.42, -0.03, 1.29, 0, 1.62, 0.06], ["c", 0.51, 0.12, 0.93, 0.3, 1.38, 0.57], ["c", 1.53, 1.02, 2.52, 3.24, 2.73, 5.94], ["c", 0.18, 2.55, -0.48, 4.98, -1.83, 6.57], ["c", -1.05, 1.26, -2.4, 1.89, -3.93, 1.83], ["c", -1.23, -0.06, -2.31, -0.45, -3.03, -1.14], ["c", -0.57, -0.51, -0.87, -1.23, -0.84, -1.98], ["c", 0.03, -0.51, 0.21, -0.9, 0.6, -1.26], ["c", 0.24, -0.24, 0.45, -0.39, 0.75, -0.51], ["c", 0.21, -0.06, 0.27, -0.06, 0.6, -0.06], ["c", 0.33, 0, 0.39, 0, 0.6, 0.06], ["c", 0.3, 0.12, 0.51, 0.27, 0.75, 0.51], ["c", 0.39, 0.36, 0.57, 0.78, 0.57, 1.26], ["c", 0, 0.27, 0, 0.3, -0.09, 0.42], ["c", -0.03, 0.09, -0.18, 0.21, -0.3, 0.3], ["c", -0.12, 0.09, -0.3, 0.21, -0.39, 0.27], ["c", -0.09, 0.06, -0.21, 0.18, -0.27, 0.24], ["c", -0.06, 0.12, -0.06, 0.15, -0.06, 0.33], ["c", 0, 0.18, 0, 0.24, 0.06, 0.36], ["c", 0.24, 0.39, 0.75, 0.6, 1.38, 0.57], ["c", 0.54, -0.03, 0.9, -0.18, 1.23, -0.48], ["c", 0.81, -0.72, 1.08, -2.16, 0.96, -5.37], ["l", 0, -0.63], ["l", -0.3, 0.12], ["c", -0.78, 0.27, -1.29, 0.33, -2.1, 0.27], ["c", -1.47, -0.12, -2.49, -0.54, -3.27, -1.29], ["c", -0.48, -0.51, -0.81, -1.11, -0.96, -1.89], ["c", -0.06, -0.27, -0.06, -0.42, -0.06, -0.96], ["c", 0, -0.51, 0, -0.66, 0.06, -0.93], ["c", 0.15, -0.78, 0.48, -1.38, 0.96, -1.89], ["c", 0.15, -0.12, 0.33, -0.27, 0.42, -0.36], ["c", 0.69, -0.51, 1.62, -0.81, 2.76, -0.93], ["z"], ["m", 1.17, 0.66], ["c", -0.21, -0.06, -0.57, -0.06, -0.81, -0.03], ["c", -0.78, 0.12, -1.26, 0.69, -1.41, 1.74], ["c", -0.12, 0.63, -0.15, 1.95, -0.09, 2.79], ["c", 0.12, 1.71, 0.63, 2.4, 1.77, 2.46], ["c", 1.08, 0.03, 1.62, -0.48, 1.8, -1.74], ["c", 0.06, -0.54, 0.06, -3, 0, -3.54], ["c", -0.15, -1.05, -0.51, -1.53, -1.26, -1.68], ["z"]], w: 9.959, h: 14.986 },
    "rests.multimeasure": { d: [["M", 0, -4], ["l", 0, 16], ["l", 1, 0], ["l", 0, -5], ["l", 40, 0], ["l", 0, 5], ["l", 1, 0], ["l", 0, -16], ["l", -1, 0], ["l", 0, 5], ["l", -40, 0], ["l", 0, -5], ["z"]], w: 42, h: 18 },
    "rests.whole": { d: [["M", 0.06, 0.03], ["l", 0.09, -0.06], ["l", 5.46, 0], ["l", 5.49, 0], ["l", 0.09, 0.06], ["l", 0.06, 0.09], ["l", 0, 2.19], ["l", 0, 2.19], ["l", -0.06, 0.09], ["l", -0.09, 0.06], ["l", -5.49, 0], ["l", -5.46, 0], ["l", -0.09, -0.06], ["l", -0.06, -0.09], ["l", 0, -2.19], ["l", 0, -2.19], ["z"]], w: 11.25, h: 4.68 },
    "rests.half": { d: [["M", 0.06, -4.62], ["l", 0.09, -0.06], ["l", 5.46, 0], ["l", 5.49, 0], ["l", 0.09, 0.06], ["l", 0.06, 0.09], ["l", 0, 2.19], ["l", 0, 2.19], ["l", -0.06, 0.09], ["l", -0.09, 0.06], ["l", -5.49, 0], ["l", -5.46, 0], ["l", -0.09, -0.06], ["l", -0.06, -0.09], ["l", 0, -2.19], ["l", 0, -2.19], ["z"]], w: 11.25, h: 4.68 },
    "rests.quarter": { d: [["M", 1.89, -11.82], ["c", 0.12, -0.06, 0.24, -0.06, 0.36, -0.03], ["c", 0.09, 0.06, 4.74, 5.58, 4.86, 5.82], ["c", 0.21, 0.39, 0.15, 0.78, -0.15, 1.26], ["c", -0.24, 0.33, -0.72, 0.81, -1.62, 1.56], ["c", -0.45, 0.36, -0.87, 0.75, -0.96, 0.84], ["c", -0.93, 0.99, -1.14, 2.49, -0.6, 3.63], ["c", 0.18, 0.39, 0.27, 0.48, 1.32, 1.68], ["c", 1.92, 2.25, 1.83, 2.16, 1.83, 2.34], ["c", 0, 0.18, -0.18, 0.36, -0.36, 0.39], ["c", -0.15, 0, -0.27, -0.06, -0.48, -0.27], ["c", -0.75, -0.75, -2.46, -1.29, -3.39, -1.08], ["c", -0.45, 0.09, -0.69, 0.27, -0.9, 0.69], ["c", -0.12, 0.3, -0.21, 0.66, -0.24, 1.14], ["c", -0.03, 0.66, 0.09, 1.35, 0.3, 2.01], ["c", 0.15, 0.42, 0.24, 0.66, 0.45, 0.96], ["c", 0.18, 0.24, 0.18, 0.33, 0.03, 0.42], ["c", -0.12, 0.06, -0.18, 0.03, -0.45, -0.3], ["c", -1.08, -1.38, -2.07, -3.36, -2.4, -4.83], ["c", -0.27, -1.05, -0.15, -1.77, 0.27, -2.07], ["c", 0.21, -0.12, 0.42, -0.15, 0.87, -0.15], ["c", 0.87, 0.06, 2.1, 0.39, 3.3, 0.9], ["l", 0.39, 0.18], ["l", -1.65, -1.95], ["c", -2.52, -2.97, -2.61, -3.09, -2.7, -3.27], ["c", -0.09, -0.24, -0.12, -0.48, -0.03, -0.75], ["c", 0.15, -0.48, 0.57, -0.96, 1.83, -2.01], ["c", 0.45, -0.36, 0.84, -0.72, 0.93, -0.78], ["c", 0.69, -0.75, 1.02, -1.8, 0.9, -2.79], ["c", -0.06, -0.33, -0.21, -0.84, -0.39, -1.11], ["c", -0.09, -0.15, -0.45, -0.6, -0.81, -1.05], ["c", -0.36, -0.42, -0.69, -0.81, -0.72, -0.87], ["c", -0.09, -0.18, 0, -0.42, 0.21, -0.51], ["z"]], w: 7.888, h: 21.435 },
    "rests.8th": { d: [["M", 1.68, -6.12], ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.12, 0.27, 0.33, 0.45, 0.6, 0.48], ["c", 0.12, 0, 0.18, 0, 0.33, -0.09], ["c", 0.39, -0.18, 1.32, -1.29, 1.68, -1.98], ["c", 0.09, -0.21, 0.24, -0.3, 0.39, -0.3], ["c", 0.12, 0, 0.27, 0.09, 0.33, 0.18], ["c", 0.03, 0.06, -0.27, 1.11, -1.86, 6.42], ["c", -1.02, 3.48, -1.89, 6.39, -1.92, 6.42], ["c", 0, 0.03, -0.12, 0.12, -0.24, 0.15], ["c", -0.18, 0.09, -0.21, 0.09, -0.45, 0.09], ["c", -0.24, 0, -0.3, 0, -0.48, -0.06], ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ["c", -0.06, -0.03, 0.15, -0.57, 1.68, -4.92], ["c", 0.96, -2.67, 1.74, -4.89, 1.71, -4.89], ["l", -0.51, 0.15], ["c", -1.08, 0.36, -1.74, 0.48, -2.55, 0.48], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9], ["z"]], w: 7.534, h: 13.883 },
    "rests.16th": { d: [["M", 3.33, -6.12], ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.15, 0.39, 0.57, 0.57, 0.87, 0.42], ["c", 0.39, -0.18, 1.2, -1.23, 1.62, -2.07], ["c", 0.06, -0.15, 0.24, -0.24, 0.36, -0.24], ["c", 0.12, 0, 0.27, 0.09, 0.33, 0.18], ["c", 0.03, 0.06, -0.45, 1.86, -2.67, 10.17], ["c", -1.5, 5.55, -2.73, 10.14, -2.76, 10.17], ["c", -0.03, 0.03, -0.12, 0.12, -0.24, 0.15], ["c", -0.18, 0.09, -0.21, 0.09, -0.45, 0.09], ["c", -0.24, 0, -0.3, 0, -0.48, -0.06], ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ["c", -0.06, -0.03, 0.12, -0.57, 1.44, -4.92], ["c", 0.81, -2.67, 1.47, -4.86, 1.47, -4.89], ["c", -0.03, 0, -0.27, 0.06, -0.54, 0.15], ["c", -1.08, 0.36, -1.77, 0.48, -2.58, 0.48], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.72, -1.05, 2.22, -1.23, 3.06, -0.42], ["c", 0.3, 0.33, 0.42, 0.6, 0.6, 1.38], ["c", 0.09, 0.45, 0.21, 0.78, 0.33, 0.9], ["c", 0.09, 0.09, 0.27, 0.18, 0.45, 0.21], ["c", 0.12, 0, 0.18, 0, 0.33, -0.09], ["c", 0.33, -0.15, 1.02, -0.93, 1.41, -1.59], ["c", 0.12, -0.21, 0.18, -0.39, 0.39, -1.08], ["c", 0.66, -2.1, 1.17, -3.84, 1.17, -3.87], ["c", 0, 0, -0.21, 0.06, -0.42, 0.15], ["c", -0.51, 0.15, -1.2, 0.33, -1.68, 0.42], ["c", -0.33, 0.06, -0.51, 0.06, -0.96, 0.06], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9], ["z"]], w: 9.724, h: 21.383 },
    "rests.32nd": { d: [["M", 4.23, -13.62], ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.12, 0.27, 0.33, 0.45, 0.6, 0.48], ["c", 0.12, 0, 0.18, 0, 0.27, -0.06], ["c", 0.33, -0.21, 0.99, -1.11, 1.44, -1.98], ["c", 0.09, -0.24, 0.21, -0.33, 0.39, -0.33], ["c", 0.12, 0, 0.27, 0.09, 0.33, 0.18], ["c", 0.03, 0.06, -0.57, 2.67, -3.21, 13.89], ["c", -1.8, 7.62, -3.3, 13.89, -3.3, 13.92], ["c", -0.03, 0.06, -0.12, 0.12, -0.24, 0.18], ["c", -0.21, 0.09, -0.24, 0.09, -0.48, 0.09], ["c", -0.24, 0, -0.3, 0, -0.48, -0.06], ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ["c", -0.06, -0.03, 0.09, -0.57, 1.23, -4.92], ["c", 0.69, -2.67, 1.26, -4.86, 1.29, -4.89], ["c", 0, -0.03, -0.12, -0.03, -0.48, 0.12], ["c", -1.17, 0.39, -2.22, 0.57, -3, 0.54], ["c", -0.42, -0.03, -0.75, -0.12, -1.11, -0.3], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.72, -1.05, 2.22, -1.23, 3.06, -0.42], ["c", 0.3, 0.33, 0.42, 0.6, 0.6, 1.38], ["c", 0.09, 0.45, 0.21, 0.78, 0.33, 0.9], ["c", 0.12, 0.09, 0.3, 0.18, 0.48, 0.21], ["c", 0.12, 0, 0.18, 0, 0.3, -0.09], ["c", 0.42, -0.21, 1.29, -1.29, 1.56, -1.89], ["c", 0.03, -0.12, 1.23, -4.59, 1.23, -4.65], ["c", 0, -0.03, -0.18, 0.03, -0.39, 0.12], ["c", -0.63, 0.18, -1.2, 0.36, -1.74, 0.45], ["c", -0.39, 0.06, -0.54, 0.06, -1.02, 0.06], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.72, -1.05, 2.22, -1.23, 3.06, -0.42], ["c", 0.3, 0.33, 0.42, 0.6, 0.6, 1.38], ["c", 0.09, 0.45, 0.21, 0.78, 0.33, 0.9], ["c", 0.18, 0.18, 0.51, 0.27, 0.72, 0.15], ["c", 0.3, -0.12, 0.69, -0.57, 1.08, -1.17], ["c", 0.42, -0.6, 0.39, -0.51, 1.05, -3.03], ["c", 0.33, -1.26, 0.6, -2.31, 0.6, -2.34], ["c", 0, 0, -0.21, 0.03, -0.45, 0.12], ["c", -0.57, 0.18, -1.14, 0.33, -1.62, 0.42], ["c", -0.33, 0.06, -0.51, 0.06, -0.96, 0.06], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9], ["z"]], w: 11.373, h: 28.883 },
    "rests.64th": { d: [["M", 5.13, -13.62], ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.15, 0.63, 0.21, 0.81, 0.33, 0.96], ["c", 0.18, 0.21, 0.54, 0.3, 0.75, 0.18], ["c", 0.24, -0.12, 0.63, -0.66, 1.08, -1.56], ["c", 0.33, -0.66, 0.39, -0.72, 0.6, -0.72], ["c", 0.12, 0, 0.27, 0.09, 0.33, 0.18], ["c", 0.03, 0.06, -0.69, 3.66, -3.54, 17.64], ["c", -1.95, 9.66, -3.57, 17.61, -3.57, 17.64], ["c", -0.03, 0.06, -0.12, 0.12, -0.24, 0.18], ["c", -0.21, 0.09, -0.24, 0.09, -0.48, 0.09], ["c", -0.24, 0, -0.3, 0, -0.48, -0.06], ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ["c", -0.06, -0.03, 0.06, -0.57, 1.05, -4.95], ["c", 0.6, -2.7, 1.08, -4.89, 1.08, -4.92], ["c", 0, 0, -0.24, 0.06, -0.51, 0.15], ["c", -0.66, 0.24, -1.2, 0.36, -1.77, 0.48], ["c", -0.42, 0.06, -0.57, 0.06, -1.05, 0.06], ["c", -0.69, 0, -0.87, -0.03, -1.35, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.72, -1.05, 2.22, -1.23, 3.06, -0.42], ["c", 0.3, 0.33, 0.42, 0.6, 0.6, 1.38], ["c", 0.09, 0.45, 0.21, 0.78, 0.33, 0.9], ["c", 0.09, 0.09, 0.27, 0.18, 0.45, 0.21], ["c", 0.21, 0.03, 0.39, -0.09, 0.72, -0.42], ["c", 0.45, -0.45, 1.02, -1.26, 1.17, -1.65], ["c", 0.03, -0.09, 0.27, -1.14, 0.54, -2.34], ["c", 0.27, -1.2, 0.48, -2.19, 0.51, -2.22], ["c", 0, -0.03, -0.09, -0.03, -0.48, 0.12], ["c", -1.17, 0.39, -2.22, 0.57, -3, 0.54], ["c", -0.42, -0.03, -0.75, -0.12, -1.11, -0.3], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.15, 0.39, 0.57, 0.57, 0.9, 0.42], ["c", 0.36, -0.18, 1.2, -1.26, 1.47, -1.89], ["c", 0.03, -0.09, 0.3, -1.2, 0.57, -2.43], ["l", 0.51, -2.28], ["l", -0.54, 0.18], ["c", -1.11, 0.36, -1.8, 0.48, -2.61, 0.48], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.15, 0.63, 0.21, 0.81, 0.33, 0.96], ["c", 0.21, 0.21, 0.54, 0.3, 0.75, 0.18], ["c", 0.36, -0.18, 0.93, -0.93, 1.29, -1.68], ["c", 0.12, -0.24, 0.18, -0.48, 0.63, -2.55], ["l", 0.51, -2.31], ["c", 0, -0.03, -0.18, 0.03, -0.39, 0.12], ["c", -1.14, 0.36, -2.1, 0.54, -2.82, 0.51], ["c", -0.42, -0.03, -0.75, -0.12, -1.11, -0.3], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9], ["z"]], w: 12.453, h: 36.383 },
    "rests.128th": { d: [["M", 6.03, -21.12], ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.12, 0.27, 0.33, 0.45, 0.6, 0.48], ["c", 0.21, 0, 0.33, -0.06, 0.54, -0.36], ["c", 0.15, -0.21, 0.54, -0.93, 0.78, -1.47], ["c", 0.15, -0.33, 0.18, -0.39, 0.3, -0.48], ["c", 0.18, -0.09, 0.45, 0, 0.51, 0.15], ["c", 0.03, 0.09, -7.11, 42.75, -7.17, 42.84], ["c", -0.03, 0.03, -0.15, 0.09, -0.24, 0.15], ["c", -0.18, 0.06, -0.24, 0.06, -0.45, 0.06], ["c", -0.24, 0, -0.3, 0, -0.48, -0.06], ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ["c", -0.06, -0.03, 0.03, -0.57, 0.84, -4.98], ["c", 0.51, -2.7, 0.93, -4.92, 0.9, -4.92], ["c", 0, 0, -0.15, 0.06, -0.36, 0.12], ["c", -0.78, 0.27, -1.62, 0.48, -2.31, 0.57], ["c", -0.15, 0.03, -0.54, 0.03, -0.81, 0.03], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.12, 0.27, 0.33, 0.45, 0.63, 0.48], ["c", 0.12, 0, 0.18, 0, 0.3, -0.09], ["c", 0.42, -0.21, 1.14, -1.11, 1.5, -1.83], ["c", 0.12, -0.27, 0.12, -0.27, 0.54, -2.52], ["c", 0.24, -1.23, 0.42, -2.25, 0.39, -2.25], ["c", 0, 0, -0.24, 0.06, -0.51, 0.18], ["c", -1.26, 0.39, -2.25, 0.57, -3.06, 0.54], ["c", -0.42, -0.03, -0.75, -0.12, -1.11, -0.3], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.15, 0.63, 0.21, 0.81, 0.33, 0.96], ["c", 0.18, 0.21, 0.51, 0.3, 0.75, 0.18], ["c", 0.36, -0.15, 1.05, -0.99, 1.41, -1.77], ["l", 0.15, -0.3], ["l", 0.42, -2.25], ["c", 0.21, -1.26, 0.42, -2.28, 0.39, -2.28], ["l", -0.51, 0.15], ["c", -1.11, 0.39, -1.89, 0.51, -2.7, 0.51], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.15, 0.63, 0.21, 0.81, 0.33, 0.96], ["c", 0.18, 0.18, 0.48, 0.27, 0.72, 0.21], ["c", 0.33, -0.12, 1.14, -1.26, 1.41, -1.95], ["c", 0, -0.09, 0.21, -1.11, 0.45, -2.34], ["c", 0.21, -1.2, 0.39, -2.22, 0.39, -2.28], ["c", 0.03, -0.03, 0, -0.03, -0.45, 0.12], ["c", -0.57, 0.18, -1.2, 0.33, -1.71, 0.42], ["c", -0.3, 0.06, -0.51, 0.06, -0.93, 0.06], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.12, 0.27, 0.33, 0.45, 0.6, 0.48], ["c", 0.18, 0, 0.36, -0.09, 0.57, -0.33], ["c", 0.33, -0.36, 0.78, -1.14, 0.93, -1.56], ["c", 0.03, -0.12, 0.24, -1.2, 0.45, -2.4], ["c", 0.24, -1.2, 0.42, -2.22, 0.42, -2.28], ["c", 0.03, -0.03, 0, -0.03, -0.39, 0.09], ["c", -1.05, 0.36, -1.8, 0.48, -2.58, 0.48], ["c", -0.63, 0, -0.84, -0.03, -1.29, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9], ["z"]], w: 12.992, h: 43.883 },
    "accidentals.sharp": { d: [["M", 5.73, -11.19], ["c", 0.21, -0.12, 0.54, -0.03, 0.66, 0.24], ["c", 0.06, 0.12, 0.06, 0.21, 0.06, 2.31], ["c", 0, 1.23, 0, 2.22, 0.03, 2.22], ["c", 0, 0, 0.27, -0.12, 0.6, -0.24], ["c", 0.69, -0.27, 0.78, -0.3, 0.96, -0.15], ["c", 0.21, 0.15, 0.21, 0.18, 0.21, 1.38], ["c", 0, 1.02, 0, 1.11, -0.06, 1.2], ["c", -0.03, 0.06, -0.09, 0.12, -0.12, 0.15], ["c", -0.06, 0.03, -0.42, 0.21, -0.84, 0.36], ["l", -0.75, 0.33], ["l", -0.03, 2.43], ["c", 0, 1.32, 0, 2.43, 0.03, 2.43], ["c", 0, 0, 0.27, -0.12, 0.6, -0.24], ["c", 0.69, -0.27, 0.78, -0.3, 0.96, -0.15], ["c", 0.21, 0.15, 0.21, 0.18, 0.21, 1.38], ["c", 0, 1.02, 0, 1.11, -0.06, 1.2], ["c", -0.03, 0.06, -0.09, 0.12, -0.12, 0.15], ["c", -0.06, 0.03, -0.42, 0.21, -0.84, 0.36], ["l", -0.75, 0.33], ["l", -0.03, 2.52], ["c", 0, 2.28, -0.03, 2.55, -0.06, 2.64], ["c", -0.21, 0.36, -0.72, 0.36, -0.93, 0], ["c", -0.03, -0.09, -0.06, -0.33, -0.06, -2.43], ["l", 0, -2.31], ["l", -1.29, 0.51], ["l", -1.26, 0.51], ["l", 0, 2.43], ["c", 0, 2.58, 0, 2.52, -0.15, 2.67], ["c", -0.06, 0.09, -0.27, 0.18, -0.36, 0.18], ["c", -0.12, 0, -0.33, -0.09, -0.39, -0.18], ["c", -0.15, -0.15, -0.15, -0.09, -0.15, -2.43], ["c", 0, -1.23, 0, -2.22, -0.03, -2.22], ["c", 0, 0, -0.27, 0.12, -0.6, 0.24], ["c", -0.69, 0.27, -0.78, 0.3, -0.96, 0.15], ["c", -0.21, -0.15, -0.21, -0.18, -0.21, -1.38], ["c", 0, -1.02, 0, -1.11, 0.06, -1.2], ["c", 0.03, -0.06, 0.09, -0.12, 0.12, -0.15], ["c", 0.06, -0.03, 0.42, -0.21, 0.84, -0.36], ["l", 0.78, -0.33], ["l", 0, -2.43], ["c", 0, -1.32, 0, -2.43, -0.03, -2.43], ["c", 0, 0, -0.27, 0.12, -0.6, 0.24], ["c", -0.69, 0.27, -0.78, 0.3, -0.96, 0.15], ["c", -0.21, -0.15, -0.21, -0.18, -0.21, -1.38], ["c", 0, -1.02, 0, -1.11, 0.06, -1.2], ["c", 0.03, -0.06, 0.09, -0.12, 0.12, -0.15], ["c", 0.06, -0.03, 0.42, -0.21, 0.84, -0.36], ["l", 0.78, -0.33], ["l", 0, -2.52], ["c", 0, -2.28, 0.03, -2.55, 0.06, -2.64], ["c", 0.21, -0.36, 0.72, -0.36, 0.93, 0], ["c", 0.03, 0.09, 0.06, 0.33, 0.06, 2.43], ["l", 0.03, 2.31], ["l", 1.26, -0.51], ["l", 1.26, -0.51], ["l", 0, -2.43], ["c", 0, -2.28, 0, -2.43, 0.06, -2.55], ["c", 0.06, -0.12, 0.12, -0.18, 0.27, -0.24], ["z"], ["m", -0.33, 10.65], ["l", 0, -2.43], ["l", -1.29, 0.51], ["l", -1.26, 0.51], ["l", 0, 2.46], ["l", 0, 2.43], ["l", 0.09, -0.03], ["c", 0.06, -0.03, 0.63, -0.27, 1.29, -0.51], ["l", 1.17, -0.48], ["l", 0, -2.46], ["z"]], w: 8.25, h: 22.462 },
    "accidentals.halfsharp": { d: [["M", 2.43, -10.05], ["c", 0.21, -0.12, 0.54, -0.03, 0.66, 0.24], ["c", 0.06, 0.12, 0.06, 0.21, 0.06, 2.01], ["c", 0, 1.05, 0, 1.89, 0.03, 1.89], ["l", 0.72, -0.48], ["c", 0.69, -0.48, 0.69, -0.51, 0.87, -0.51], ["c", 0.15, 0, 0.18, 0.03, 0.27, 0.09], ["c", 0.21, 0.15, 0.21, 0.18, 0.21, 1.41], ["c", 0, 1.11, -0.03, 1.14, -0.09, 1.23], ["c", -0.03, 0.03, -0.48, 0.39, -1.02, 0.75], ["l", -0.99, 0.66], ["l", 0, 2.37], ["c", 0, 1.32, 0, 2.37, 0.03, 2.37], ["l", 0.72, -0.48], ["c", 0.69, -0.48, 0.69, -0.51, 0.87, -0.51], ["c", 0.15, 0, 0.18, 0.03, 0.27, 0.09], ["c", 0.21, 0.15, 0.21, 0.18, 0.21, 1.41], ["c", 0, 1.11, -0.03, 1.14, -0.09, 1.23], ["c", -0.03, 0.03, -0.48, 0.39, -1.02, 0.75], ["l", -0.99, 0.66], ["l", 0, 2.25], ["c", 0, 1.95, 0, 2.28, -0.06, 2.37], ["c", -0.06, 0.12, -0.12, 0.21, -0.24, 0.27], ["c", -0.27, 0.12, -0.54, 0.03, -0.69, -0.24], ["c", -0.06, -0.12, -0.06, -0.21, -0.06, -2.01], ["c", 0, -1.05, 0, -1.89, -0.03, -1.89], ["l", -0.72, 0.48], ["c", -0.69, 0.48, -0.69, 0.48, -0.87, 0.48], ["c", -0.15, 0, -0.18, 0, -0.27, -0.06], ["c", -0.21, -0.15, -0.21, -0.18, -0.21, -1.41], ["c", 0, -1.11, 0.03, -1.14, 0.09, -1.23], ["c", 0.03, -0.03, 0.48, -0.39, 1.02, -0.75], ["l", 0.99, -0.66], ["l", 0, -2.37], ["c", 0, -1.32, 0, -2.37, -0.03, -2.37], ["l", -0.72, 0.48], ["c", -0.69, 0.48, -0.69, 0.48, -0.87, 0.48], ["c", -0.15, 0, -0.18, 0, -0.27, -0.06], ["c", -0.21, -0.15, -0.21, -0.18, -0.21, -1.41], ["c", 0, -1.11, 0.03, -1.14, 0.09, -1.23], ["c", 0.03, -0.03, 0.48, -0.39, 1.02, -0.75], ["l", 0.99, -0.66], ["l", 0, -2.25], ["c", 0, -2.13, 0, -2.28, 0.06, -2.4], ["c", 0.06, -0.12, 0.12, -0.18, 0.27, -0.24], ["z"]], w: 5.25, h: 20.174 },
    "accidentals.nat": { d: [["M", 0.21, -11.4], ["c", 0.24, -0.06, 0.78, 0, 0.99, 0.15], ["c", 0.03, 0.03, 0.03, 0.48, 0, 2.61], ["c", -0.03, 1.44, -0.03, 2.61, -0.03, 2.61], ["c", 0, 0.03, 0.75, -0.09, 1.68, -0.24], ["c", 0.96, -0.18, 1.71, -0.27, 1.74, -0.27], ["c", 0.15, 0.03, 0.27, 0.15, 0.36, 0.3], ["l", 0.06, 0.12], ["l", 0.09, 8.67], ["c", 0.09, 6.96, 0.12, 8.67, 0.09, 8.67], ["c", -0.03, 0.03, -0.12, 0.06, -0.21, 0.09], ["c", -0.24, 0.09, -0.72, 0.09, -0.96, 0], ["c", -0.09, -0.03, -0.18, -0.06, -0.21, -0.09], ["c", -0.03, -0.03, -0.03, -0.48, 0, -2.61], ["c", 0.03, -1.44, 0.03, -2.61, 0.03, -2.61], ["c", 0, -0.03, -0.75, 0.09, -1.68, 0.24], ["c", -0.96, 0.18, -1.71, 0.27, -1.74, 0.27], ["c", -0.15, -0.03, -0.27, -0.15, -0.36, -0.3], ["l", -0.06, -0.15], ["l", -0.09, -7.53], ["c", -0.06, -4.14, -0.09, -8.04, -0.12, -8.67], ["l", 0, -1.11], ["l", 0.15, -0.06], ["c", 0.09, -0.03, 0.21, -0.06, 0.27, -0.09], ["z"], ["m", 3.75, 8.4], ["c", 0, -0.33, 0, -0.42, -0.03, -0.42], ["c", -0.12, 0, -2.79, 0.45, -2.79, 0.48], ["c", -0.03, 0, -0.09, 6.3, -0.09, 6.33], ["c", 0.03, 0, 2.79, -0.45, 2.82, -0.48], ["c", 0, 0, 0.09, -4.53, 0.09, -5.91], ["z"]], w: 5.4, h: 22.8 },
    "accidentals.flat": { d: [["M", -0.36, -14.07], ["c", 0.33, -0.06, 0.87, 0, 1.08, 0.15], ["c", 0.06, 0.03, 0.06, 0.36, -0.03, 5.25], ["c", -0.06, 2.85, -0.09, 5.19, -0.09, 5.19], ["c", 0, 0.03, 0.12, -0.03, 0.24, -0.12], ["c", 0.63, -0.42, 1.41, -0.66, 2.19, -0.72], ["c", 0.81, -0.03, 1.47, 0.21, 2.04, 0.78], ["c", 0.57, 0.54, 0.87, 1.26, 0.93, 2.04], ["c", 0.03, 0.57, -0.09, 1.08, -0.36, 1.62], ["c", -0.42, 0.81, -1.02, 1.38, -2.82, 2.61], ["c", -1.14, 0.78, -1.44, 1.02, -1.8, 1.44], ["c", -0.18, 0.18, -0.39, 0.39, -0.45, 0.42], ["c", -0.27, 0.18, -0.57, 0.15, -0.81, -0.06], ["c", -0.06, -0.09, -0.12, -0.18, -0.15, -0.27], ["c", -0.03, -0.06, -0.09, -3.27, -0.18, -8.34], ["c", -0.09, -4.53, -0.15, -8.58, -0.18, -9.03], ["l", 0, -0.78], ["l", 0.12, -0.06], ["c", 0.06, -0.03, 0.18, -0.09, 0.27, -0.12], ["z"], ["m", 3.18, 11.01], ["c", -0.21, -0.12, -0.54, -0.15, -0.81, -0.06], ["c", -0.54, 0.15, -0.99, 0.63, -1.17, 1.26], ["c", -0.06, 0.3, -0.12, 2.88, -0.06, 3.87], ["c", 0.03, 0.42, 0.03, 0.81, 0.06, 0.9], ["l", 0.03, 0.12], ["l", 0.45, -0.39], ["c", 0.63, -0.54, 1.26, -1.17, 1.56, -1.59], ["c", 0.3, -0.42, 0.6, -0.99, 0.72, -1.41], ["c", 0.18, -0.69, 0.09, -1.47, -0.18, -2.07], ["c", -0.15, -0.3, -0.33, -0.51, -0.6, -0.63], ["z"]], w: 6.75, h: 18.801 },
    "accidentals.halfflat": { d: [["M", 4.83, -14.07], ["c", 0.33, -0.06, 0.87, 0, 1.08, 0.15], ["c", 0.06, 0.03, 0.06, 0.6, -0.12, 9.06], ["c", -0.09, 5.55, -0.15, 9.06, -0.18, 9.12], ["c", -0.03, 0.09, -0.09, 0.18, -0.15, 0.27], ["c", -0.24, 0.21, -0.54, 0.24, -0.81, 0.06], ["c", -0.06, -0.03, -0.27, -0.24, -0.45, -0.42], ["c", -0.36, -0.42, -0.66, -0.66, -1.8, -1.44], ["c", -1.23, -0.84, -1.83, -1.32, -2.25, -1.77], ["c", -0.66, -0.78, -0.96, -1.56, -0.93, -2.46], ["c", 0.09, -1.41, 1.11, -2.58, 2.4, -2.79], ["c", 0.3, -0.06, 0.84, -0.03, 1.23, 0.06], ["c", 0.54, 0.12, 1.08, 0.33, 1.53, 0.63], ["c", 0.12, 0.09, 0.24, 0.15, 0.24, 0.12], ["c", 0, 0, -0.12, -8.37, -0.18, -9.75], ["l", 0, -0.66], ["l", 0.12, -0.06], ["c", 0.06, -0.03, 0.18, -0.09, 0.27, -0.12], ["z"], ["m", -1.65, 10.95], ["c", -0.6, -0.18, -1.08, 0.09, -1.38, 0.69], ["c", -0.27, 0.6, -0.36, 1.38, -0.18, 2.07], ["c", 0.12, 0.42, 0.42, 0.99, 0.72, 1.41], ["c", 0.3, 0.42, 0.93, 1.05, 1.56, 1.59], ["l", 0.48, 0.39], ["l", 0, -0.12], ["c", 0.03, -0.09, 0.03, -0.48, 0.06, -0.9], ["c", 0.03, -0.57, 0.03, -1.08, 0, -2.22], ["c", -0.03, -1.62, -0.03, -1.62, -0.24, -2.07], ["c", -0.21, -0.42, -0.6, -0.75, -1.02, -0.84], ["z"]], w: 6.728, h: 18.801 },
    "accidentals.dblflat": { d: [["M", -0.36, -14.07], ["c", 0.33, -0.06, 0.87, 0, 1.08, 0.15], ["c", 0.06, 0.03, 0.06, 0.36, -0.03, 5.25], ["c", -0.06, 2.85, -0.09, 5.19, -0.09, 5.19], ["c", 0, 0.03, 0.12, -0.03, 0.24, -0.12], ["c", 0.63, -0.42, 1.41, -0.66, 2.19, -0.72], ["c", 0.81, -0.03, 1.47, 0.21, 2.04, 0.78], ["c", 0.57, 0.54, 0.87, 1.26, 0.93, 2.04], ["c", 0.03, 0.57, -0.09, 1.08, -0.36, 1.62], ["c", -0.42, 0.81, -1.02, 1.38, -2.82, 2.61], ["c", -1.14, 0.78, -1.44, 1.02, -1.8, 1.44], ["c", -0.18, 0.18, -0.39, 0.39, -0.45, 0.42], ["c", -0.27, 0.18, -0.57, 0.15, -0.81, -0.06], ["c", -0.06, -0.09, -0.12, -0.18, -0.15, -0.27], ["c", -0.03, -0.06, -0.09, -3.27, -0.18, -8.34], ["c", -0.09, -4.53, -0.15, -8.58, -0.18, -9.03], ["l", 0, -0.78], ["l", 0.12, -0.06], ["c", 0.06, -0.03, 0.18, -0.09, 0.27, -0.12], ["z"], ["m", 3.18, 11.01], ["c", -0.21, -0.12, -0.54, -0.15, -0.81, -0.06], ["c", -0.54, 0.15, -0.99, 0.63, -1.17, 1.26], ["c", -0.06, 0.3, -0.12, 2.88, -0.06, 3.87], ["c", 0.03, 0.42, 0.03, 0.81, 0.06, 0.9], ["l", 0.03, 0.12], ["l", 0.45, -0.39], ["c", 0.63, -0.54, 1.26, -1.17, 1.56, -1.59], ["c", 0.3, -0.42, 0.6, -0.99, 0.72, -1.41], ["c", 0.18, -0.69, 0.09, -1.47, -0.18, -2.07], ["c", -0.15, -0.3, -0.33, -0.51, -0.6, -0.63], ["z"], ["m", 3, -11], ["c", 0.33, -0.06, 0.87, 0, 1.08, 0.15], ["c", 0.06, 0.03, 0.06, 0.36, -0.03, 5.25], ["c", -0.06, 2.85, -0.09, 5.19, -0.09, 5.19], ["c", 0, 0.03, 0.12, -0.03, 0.24, -0.12], ["c", 0.63, -0.42, 1.41, -0.66, 2.19, -0.72], ["c", 0.81, -0.03, 1.47, 0.21, 2.04, 0.78], ["c", 0.57, 0.54, 0.87, 1.26, 0.93, 2.04], ["c", 0.03, 0.57, -0.09, 1.08, -0.36, 1.62], ["c", -0.42, 0.81, -1.02, 1.38, -2.82, 2.61], ["c", -1.14, 0.78, -1.44, 1.02, -1.8, 1.44], ["c", -0.18, 0.18, -0.39, 0.39, -0.45, 0.42], ["c", -0.27, 0.18, -0.57, 0.15, -0.81, -0.06], ["c", -0.06, -0.09, -0.12, -0.18, -0.15, -0.27], ["c", -0.03, -0.06, -0.09, -3.27, -0.18, -8.34], ["c", -0.09, -4.53, -0.15, -8.58, -0.18, -9.03], ["l", 0, -0.78], ["l", 0.12, -0.06], ["c", 0.06, -0.03, 0.18, -0.09, 0.27, -0.12], ["z"], ["m", 3.18, 11.01], ["c", -0.21, -0.12, -0.54, -0.15, -0.81, -0.06], ["c", -0.54, 0.15, -0.99, 0.63, -1.17, 1.26], ["c", -0.06, 0.3, -0.12, 2.88, -0.06, 3.87], ["c", 0.03, 0.42, 0.03, 0.81, 0.06, 0.9], ["l", 0.03, 0.12], ["l", 0.45, -0.39], ["c", 0.63, -0.54, 1.26, -1.17, 1.56, -1.59], ["c", 0.3, -0.42, 0.6, -0.99, 0.72, -1.41], ["c", 0.18, -0.69, 0.09, -1.47, -0.18, -2.07], ["c", -0.15, -0.3, -0.33, -0.51, -0.6, -0.63], ["z"]], w: 12.1, h: 18.804 },
    "accidentals.dblsharp": { d: [["M", -0.18, -3.96], ["c", 0.06, -0.03, 0.12, -0.06, 0.15, -0.06], ["c", 0.09, 0, 2.76, 0.27, 2.79, 0.3], ["c", 0.12, 0.03, 0.15, 0.12, 0.15, 0.51], ["c", 0.06, 0.96, 0.24, 1.59, 0.57, 2.1], ["c", 0.06, 0.09, 0.15, 0.21, 0.18, 0.24], ["l", 0.09, 0.06], ["l", 0.09, -0.06], ["c", 0.03, -0.03, 0.12, -0.15, 0.18, -0.24], ["c", 0.33, -0.51, 0.51, -1.14, 0.57, -2.1], ["c", 0, -0.39, 0.03, -0.45, 0.12, -0.51], ["c", 0.03, 0, 0.66, -0.09, 1.44, -0.15], ["c", 1.47, -0.15, 1.5, -0.15, 1.56, -0.03], ["c", 0.03, 0.06, 0, 0.42, -0.09, 1.44], ["c", -0.09, 0.72, -0.15, 1.35, -0.15, 1.38], ["c", 0, 0.03, -0.03, 0.09, -0.06, 0.12], ["c", -0.06, 0.06, -0.12, 0.09, -0.51, 0.09], ["c", -1.08, 0.06, -1.8, 0.3, -2.28, 0.75], ["l", -0.12, 0.09], ["l", 0.09, 0.09], ["c", 0.12, 0.15, 0.39, 0.33, 0.63, 0.45], ["c", 0.42, 0.18, 0.96, 0.27, 1.68, 0.33], ["c", 0.39, 0, 0.45, 0.03, 0.51, 0.09], ["c", 0.03, 0.03, 0.06, 0.09, 0.06, 0.12], ["c", 0, 0.03, 0.06, 0.66, 0.15, 1.38], ["c", 0.09, 1.02, 0.12, 1.38, 0.09, 1.44], ["c", -0.06, 0.12, -0.09, 0.12, -1.56, -0.03], ["c", -0.78, -0.06, -1.41, -0.15, -1.44, -0.15], ["c", -0.09, -0.06, -0.12, -0.12, -0.12, -0.54], ["c", -0.06, -0.93, -0.24, -1.56, -0.57, -2.07], ["c", -0.06, -0.09, -0.15, -0.21, -0.18, -0.24], ["l", -0.09, -0.06], ["l", -0.09, 0.06], ["c", -0.03, 0.03, -0.12, 0.15, -0.18, 0.24], ["c", -0.33, 0.51, -0.51, 1.14, -0.57, 2.07], ["c", 0, 0.42, -0.03, 0.48, -0.12, 0.54], ["c", -0.03, 0, -0.66, 0.09, -1.44, 0.15], ["c", -1.47, 0.15, -1.5, 0.15, -1.56, 0.03], ["c", -0.03, -0.06, 0, -0.42, 0.09, -1.44], ["c", 0.09, -0.72, 0.15, -1.35, 0.15, -1.38], ["c", 0, -0.03, 0.03, -0.09, 0.06, -0.12], ["c", 0.06, -0.06, 0.12, -0.09, 0.51, -0.09], ["c", 0.72, -0.06, 1.26, -0.15, 1.68, -0.33], ["c", 0.24, -0.12, 0.51, -0.3, 0.63, -0.45], ["l", 0.09, -0.09], ["l", -0.12, -0.09], ["c", -0.48, -0.45, -1.2, -0.69, -2.28, -0.75], ["c", -0.39, 0, -0.45, -0.03, -0.51, -0.09], ["c", -0.03, -0.03, -0.06, -0.09, -0.06, -0.12], ["c", 0, -0.03, -0.06, -0.63, -0.12, -1.38], ["c", -0.09, -0.72, -0.15, -1.35, -0.15, -1.38], ["z"]], w: 7.95, h: 7.977 },
    "dots.dot": { d: [["M", 1.32, -1.68], ["c", 0.09, -0.03, 0.27, -0.06, 0.39, -0.06], ["c", 0.96, 0, 1.74, 0.78, 1.74, 1.71], ["c", 0, 0.96, -0.78, 1.74, -1.71, 1.74], ["c", -0.96, 0, -1.74, -0.78, -1.74, -1.71], ["c", 0, -0.78, 0.54, -1.5, 1.32, -1.68], ["z"]], w: 3.45, h: 3.45 },
    "noteheads.dbl": { d: [["M", -0.69, -4.02], ["c", 0.18, -0.09, 0.36, -0.09, 0.54, 0], ["c", 0.18, 0.09, 0.24, 0.15, 0.33, 0.3], ["c", 0.06, 0.15, 0.06, 0.18, 0.06, 1.41], ["l", 0, 1.23], ["l", 0.12, -0.18], ["c", 0.72, -1.26, 2.64, -2.31, 4.86, -2.64], ["c", 0.81, -0.15, 1.11, -0.15, 2.13, -0.15], ["c", 0.99, 0, 1.29, 0, 2.1, 0.15], ["c", 0.75, 0.12, 1.38, 0.27, 2.04, 0.54], ["c", 1.35, 0.51, 2.34, 1.26, 2.82, 2.1], ["l", 0.12, 0.18], ["l", 0, -1.23], ["c", 0, -1.2, 0, -1.26, 0.06, -1.38], ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ["c", 0.18, -0.09, 0.36, -0.09, 0.54, 0], ["c", 0.18, 0.09, 0.24, 0.15, 0.33, 0.3], ["l", 0.06, 0.15], ["l", 0, 3.54], ["l", 0, 3.54], ["l", -0.06, 0.15], ["c", -0.09, 0.18, -0.15, 0.24, -0.33, 0.33], ["c", -0.18, 0.09, -0.36, 0.09, -0.54, 0], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["c", -0.06, -0.12, -0.06, -0.18, -0.06, -1.38], ["l", 0, -1.23], ["l", -0.12, 0.18], ["c", -0.48, 0.84, -1.47, 1.59, -2.82, 2.1], ["c", -0.84, 0.33, -1.71, 0.54, -2.85, 0.66], ["c", -0.45, 0.06, -2.16, 0.06, -2.61, 0], ["c", -1.14, -0.12, -2.01, -0.33, -2.85, -0.66], ["c", -1.35, -0.51, -2.34, -1.26, -2.82, -2.1], ["l", -0.12, -0.18], ["l", 0, 1.23], ["c", 0, 1.23, 0, 1.26, -0.06, 1.38], ["c", -0.09, 0.18, -0.15, 0.24, -0.33, 0.33], ["c", -0.18, 0.09, -0.36, 0.09, -0.54, 0], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["l", -0.06, -0.15], ["l", 0, -3.54], ["c", 0, -3.48, 0, -3.54, 0.06, -3.66], ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ["z"], ["m", 7.71, 0.63], ["c", -0.36, -0.06, -0.9, -0.06, -1.14, 0], ["c", -0.3, 0.03, -0.66, 0.24, -0.87, 0.42], ["c", -0.6, 0.54, -0.9, 1.62, -0.75, 2.82], ["c", 0.12, 0.93, 0.51, 1.68, 1.11, 2.31], ["c", 0.75, 0.72, 1.83, 1.2, 2.85, 1.26], ["c", 1.05, 0.06, 1.83, -0.54, 2.1, -1.65], ["c", 0.21, -0.9, 0.12, -1.95, -0.24, -2.82], ["c", -0.36, -0.81, -1.08, -1.53, -1.95, -1.95], ["c", -0.3, -0.15, -0.78, -0.3, -1.11, -0.39], ["z"]], w: 16.83, h: 8.145 },
    "noteheads.whole": { d: [["M", 6.51, -4.05], ["c", 0.51, -0.03, 2.01, 0, 2.52, 0.03], ["c", 1.41, 0.18, 2.64, 0.51, 3.72, 1.08], ["c", 1.2, 0.63, 1.95, 1.41, 2.19, 2.31], ["c", 0.09, 0.33, 0.09, 0.9, 0, 1.23], ["c", -0.24, 0.9, -0.99, 1.68, -2.19, 2.31], ["c", -1.08, 0.57, -2.28, 0.9, -3.75, 1.08], ["c", -0.66, 0.06, -2.31, 0.06, -2.97, 0], ["c", -1.47, -0.18, -2.67, -0.51, -3.75, -1.08], ["c", -1.2, -0.63, -1.95, -1.41, -2.19, -2.31], ["c", -0.09, -0.33, -0.09, -0.9, 0, -1.23], ["c", 0.24, -0.9, 0.99, -1.68, 2.19, -2.31], ["c", 1.2, -0.63, 2.61, -0.99, 4.23, -1.11], ["z"], ["m", 0.57, 0.66], ["c", -0.87, -0.15, -1.53, 0, -2.04, 0.51], ["c", -0.15, 0.15, -0.24, 0.27, -0.33, 0.48], ["c", -0.24, 0.51, -0.36, 1.08, -0.33, 1.77], ["c", 0.03, 0.69, 0.18, 1.26, 0.42, 1.77], ["c", 0.6, 1.17, 1.74, 1.98, 3.18, 2.22], ["c", 1.11, 0.21, 1.95, -0.15, 2.34, -0.99], ["c", 0.24, -0.51, 0.36, -1.08, 0.33, -1.8], ["c", -0.06, -1.11, -0.45, -2.04, -1.17, -2.76], ["c", -0.63, -0.63, -1.47, -1.05, -2.4, -1.2], ["z"]], w: 14.985, h: 8.097 },
    "noteheads.half": { d: [["M", 7.44, -4.05], ["c", 0.06, -0.03, 0.27, -0.03, 0.48, -0.03], ["c", 1.05, 0, 1.71, 0.24, 2.1, 0.81], ["c", 0.42, 0.6, 0.45, 1.35, 0.18, 2.4], ["c", -0.42, 1.59, -1.14, 2.73, -2.16, 3.39], ["c", -1.41, 0.93, -3.18, 1.44, -5.4, 1.53], ["c", -1.17, 0.03, -1.89, -0.21, -2.28, -0.81], ["c", -0.42, -0.6, -0.45, -1.35, -0.18, -2.4], ["c", 0.42, -1.59, 1.14, -2.73, 2.16, -3.39], ["c", 0.63, -0.42, 1.23, -0.72, 1.98, -0.96], ["c", 0.9, -0.3, 1.65, -0.42, 3.12, -0.54], ["z"], ["m", 1.29, 0.87], ["c", -0.27, -0.09, -0.63, -0.12, -0.9, -0.03], ["c", -0.72, 0.24, -1.53, 0.69, -3.27, 1.8], ["c", -2.34, 1.5, -3.3, 2.25, -3.57, 2.79], ["c", -0.36, 0.72, -0.06, 1.5, 0.66, 1.77], ["c", 0.24, 0.12, 0.69, 0.09, 0.99, 0], ["c", 0.84, -0.3, 1.92, -0.93, 4.14, -2.37], ["c", 1.62, -1.08, 2.37, -1.71, 2.61, -2.19], ["c", 0.36, -0.72, 0.06, -1.5, -0.66, -1.77], ["z"]], w: 10.37, h: 8.132 },
    "noteheads.quarter": { d: [["M", 6.09, -4.05], ["c", 0.36, -0.03, 1.2, 0, 1.53, 0.06], ["c", 1.17, 0.24, 1.89, 0.84, 2.16, 1.83], ["c", 0.06, 0.18, 0.06, 0.3, 0.06, 0.66], ["c", 0, 0.45, 0, 0.63, -0.15, 1.08], ["c", -0.66, 2.04, -3.06, 3.93, -5.52, 4.38], ["c", -0.54, 0.09, -1.44, 0.09, -1.83, 0.03], ["c", -1.23, -0.27, -1.98, -0.87, -2.25, -1.86], ["c", -0.06, -0.18, -0.06, -0.3, -0.06, -0.66], ["c", 0, -0.45, 0, -0.63, 0.15, -1.08], ["c", 0.24, -0.78, 0.75, -1.53, 1.44, -2.22], ["c", 1.2, -1.2, 2.85, -2.01, 4.47, -2.22], ["z"]], w: 9.81, h: 8.094 },
    "noteheads.slash.nostem": { d: [["M", 9.3, -7.77], ["c", 0.06, -0.06, 0.18, -0.06, 1.71, -0.06], ["l", 1.65, 0], ["l", 0.09, 0.09], ["c", 0.06, 0.06, 0.06, 0.09, 0.06, 0.15], ["c", -0.03, 0.12, -9.21, 15.24, -9.3, 15.33], ["c", -0.06, 0.06, -0.18, 0.06, -1.71, 0.06], ["l", -1.65, 0], ["l", -0.09, -0.09], ["c", -0.06, -0.06, -0.06, -0.09, -0.06, -0.15], ["c", 0.03, -0.12, 9.21, -15.24, 9.3, -15.33], ["z"]], w: 12.81, h: 15.63 },
    "noteheads.indeterminate": { d: [["M", 0.78, -4.05], ["c", 0.12, -0.03, 0.24, -0.03, 0.36, 0.03], ["c", 0.03, 0.03, 0.93, 0.72, 1.95, 1.56], ["l", 1.86, 1.5], ["l", 1.86, -1.5], ["c", 1.02, -0.84, 1.92, -1.53, 1.95, -1.56], ["c", 0.21, -0.12, 0.33, -0.09, 0.75, 0.24], ["c", 0.3, 0.27, 0.36, 0.36, 0.36, 0.54], ["c", 0, 0.03, -0.03, 0.12, -0.06, 0.18], ["c", -0.03, 0.06, -0.9, 0.75, -1.89, 1.56], ["l", -1.8, 1.47], ["c", 0, 0.03, 0.81, 0.69, 1.8, 1.5], ["c", 0.99, 0.81, 1.86, 1.5, 1.89, 1.56], ["c", 0.03, 0.06, 0.06, 0.15, 0.06, 0.18], ["c", 0, 0.18, -0.06, 0.27, -0.36, 0.54], ["c", -0.42, 0.33, -0.54, 0.36, -0.75, 0.24], ["c", -0.03, -0.03, -0.93, -0.72, -1.95, -1.56], ["l", -1.86, -1.5], ["l", -1.86, 1.5], ["c", -1.02, 0.84, -1.92, 1.53, -1.95, 1.56], ["c", -0.21, 0.12, -0.33, 0.09, -0.75, -0.24], ["c", -0.3, -0.27, -0.36, -0.36, -0.36, -0.54], ["c", 0, -0.03, 0.03, -0.12, 0.06, -0.18], ["c", 0.03, -0.06, 0.9, -0.75, 1.89, -1.56], ["l", 1.8, -1.47], ["c", 0, -0.03, -0.81, -0.69, -1.8, -1.5], ["c", -0.99, -0.81, -1.86, -1.5, -1.89, -1.56], ["c", -0.06, -0.12, -0.09, -0.21, -0.03, -0.36], ["c", 0.03, -0.09, 0.57, -0.57, 0.72, -0.63], ["z"]], w: 9.843, h: 8.139 },
    "scripts.ufermata": { d: [["M", -0.75, -10.77], ["c", 0.12, 0, 0.45, -0.03, 0.69, -0.03], ["c", 2.91, -0.03, 5.55, 1.53, 7.41, 4.35], ["c", 1.17, 1.71, 1.95, 3.72, 2.43, 6.03], ["c", 0.12, 0.51, 0.12, 0.57, 0.03, 0.69], ["c", -0.12, 0.21, -0.48, 0.27, -0.69, 0.12], ["c", -0.12, -0.09, -0.18, -0.24, -0.27, -0.69], ["c", -0.78, -3.63, -3.42, -6.54, -6.78, -7.38], ["c", -0.78, -0.21, -1.2, -0.24, -2.07, -0.24], ["c", -0.63, 0, -0.84, 0, -1.2, 0.06], ["c", -1.83, 0.27, -3.42, 1.08, -4.8, 2.37], ["c", -1.41, 1.35, -2.4, 3.21, -2.85, 5.19], ["c", -0.09, 0.45, -0.15, 0.6, -0.27, 0.69], ["c", -0.21, 0.15, -0.57, 0.09, -0.69, -0.12], ["c", -0.09, -0.12, -0.09, -0.18, 0.03, -0.69], ["c", 0.33, -1.62, 0.78, -3, 1.47, -4.38], ["c", 1.77, -3.54, 4.44, -5.67, 7.56, -5.97], ["z"], ["m", 0.33, 7.47], ["c", 1.38, -0.3, 2.58, 0.9, 2.31, 2.25], ["c", -0.15, 0.72, -0.78, 1.35, -1.47, 1.5], ["c", -1.38, 0.27, -2.58, -0.93, -2.31, -2.31], ["c", 0.15, -0.69, 0.78, -1.29, 1.47, -1.44], ["z"]], w: 19.748, h: 11.289 },
    "scripts.dfermata": { d: [["M", -9.63, -0.42], ["c", 0.15, -0.09, 0.36, -0.06, 0.51, 0.03], ["c", 0.12, 0.09, 0.18, 0.24, 0.27, 0.66], ["c", 0.78, 3.66, 3.42, 6.57, 6.78, 7.41], ["c", 0.78, 0.21, 1.2, 0.24, 2.07, 0.24], ["c", 0.63, 0, 0.84, 0, 1.2, -0.06], ["c", 1.83, -0.27, 3.42, -1.08, 4.8, -2.37], ["c", 1.41, -1.35, 2.4, -3.21, 2.85, -5.22], ["c", 0.09, -0.42, 0.15, -0.57, 0.27, -0.66], ["c", 0.21, -0.15, 0.57, -0.09, 0.69, 0.12], ["c", 0.09, 0.12, 0.09, 0.18, -0.03, 0.69], ["c", -0.33, 1.62, -0.78, 3, -1.47, 4.38], ["c", -1.92, 3.84, -4.89, 6, -8.31, 6], ["c", -3.42, 0, -6.39, -2.16, -8.31, -6], ["c", -0.48, -0.96, -0.84, -1.92, -1.14, -2.97], ["c", -0.18, -0.69, -0.42, -1.74, -0.42, -1.92], ["c", 0, -0.12, 0.09, -0.27, 0.24, -0.33], ["z"], ["m", 9.21, 0], ["c", 1.2, -0.27, 2.34, 0.63, 2.34, 1.86], ["c", 0, 0.9, -0.66, 1.68, -1.5, 1.89], ["c", -1.38, 0.27, -2.58, -0.93, -2.31, -2.31], ["c", 0.15, -0.69, 0.78, -1.29, 1.47, -1.44], ["z"]], w: 19.744, h: 11.274 },
    "scripts.sforzato": { d: [["M", -6.45, -3.69], ["c", 0.06, -0.03, 0.15, -0.06, 0.18, -0.06], ["c", 0.06, 0, 2.85, 0.72, 6.24, 1.59], ["l", 6.33, 1.65], ["c", 0.33, 0.06, 0.45, 0.21, 0.45, 0.51], ["c", 0, 0.3, -0.12, 0.45, -0.45, 0.51], ["l", -6.33, 1.65], ["c", -3.39, 0.87, -6.18, 1.59, -6.21, 1.59], ["c", -0.21, 0, -0.48, -0.24, -0.51, -0.45], ["c", 0, -0.15, 0.06, -0.36, 0.18, -0.45], ["c", 0.09, -0.06, 0.87, -0.27, 3.84, -1.05], ["c", 2.04, -0.54, 3.84, -0.99, 4.02, -1.02], ["c", 0.15, -0.06, 1.14, -0.24, 2.22, -0.42], ["c", 1.05, -0.18, 1.92, -0.36, 1.92, -0.36], ["c", 0, 0, -0.87, -0.18, -1.92, -0.36], ["c", -1.08, -0.18, -2.07, -0.36, -2.22, -0.42], ["c", -0.18, -0.03, -1.98, -0.48, -4.02, -1.02], ["c", -2.97, -0.78, -3.75, -0.99, -3.84, -1.05], ["c", -0.12, -0.09, -0.18, -0.3, -0.18, -0.45], ["c", 0.03, -0.15, 0.15, -0.3, 0.3, -0.39], ["z"]], w: 13.5, h: 7.5 },
    "scripts.staccato": { d: [["M", -0.36, -1.47], ["c", 0.93, -0.21, 1.86, 0.51, 1.86, 1.47], ["c", 0, 0.93, -0.87, 1.65, -1.8, 1.47], ["c", -0.54, -0.12, -1.02, -0.57, -1.14, -1.08], ["c", -0.21, -0.81, 0.27, -1.65, 1.08, -1.86], ["z"]], w: 2.989, h: 3.004 },
    "scripts.tenuto": { d: [["M", -4.2, -0.48], ["l", 0.12, -0.06], ["l", 4.08, 0], ["l", 4.08, 0], ["l", 0.12, 0.06], ["c", 0.39, 0.21, 0.39, 0.75, 0, 0.96], ["l", -0.12, 0.06], ["l", -4.08, 0], ["l", -4.08, 0], ["l", -0.12, -0.06], ["c", -0.39, -0.21, -0.39, -0.75, 0, -0.96], ["z"]], w: 8.985, h: 1.08 },
    "scripts.umarcato": { d: [["M", -0.15, -8.19], ["c", 0.15, -0.12, 0.36, -0.03, 0.45, 0.15], ["c", 0.21, 0.42, 3.45, 7.65, 3.45, 7.71], ["c", 0, 0.12, -0.12, 0.27, -0.21, 0.3], ["c", -0.03, 0.03, -0.51, 0.03, -1.14, 0.03], ["c", -1.05, 0, -1.08, 0, -1.17, -0.06], ["c", -0.09, -0.06, -0.24, -0.36, -1.17, -2.4], ["c", -0.57, -1.29, -1.05, -2.34, -1.08, -2.34], ["c", 0, -0.03, -0.51, 1.02, -1.08, 2.34], ["c", -0.93, 2.07, -1.08, 2.34, -1.14, 2.4], ["c", -0.06, 0.03, -0.15, 0.06, -0.18, 0.06], ["c", -0.15, 0, -0.33, -0.18, -0.33, -0.33], ["c", 0, -0.06, 3.24, -7.32, 3.45, -7.71], ["c", 0.03, -0.06, 0.09, -0.15, 0.15, -0.15], ["z"]], w: 7.5, h: 8.245 },
    "scripts.dmarcato": { d: [["M", -3.57, 0.03], ["c", 0.03, 0, 0.57, -0.03, 1.17, -0.03], ["c", 1.05, 0, 1.08, 0, 1.17, 0.06], ["c", 0.09, 0.06, 0.24, 0.36, 1.17, 2.4], ["c", 0.57, 1.29, 1.05, 2.34, 1.08, 2.34], ["c", 0, 0.03, 0.51, -1.02, 1.08, -2.34], ["c", 0.93, -2.07, 1.08, -2.34, 1.14, -2.4], ["c", 0.06, -0.03, 0.15, -0.06, 0.18, -0.06], ["c", 0.15, 0, 0.33, 0.18, 0.33, 0.33], ["c", 0, 0.09, -3.45, 7.74, -3.54, 7.83], ["c", -0.12, 0.12, -0.3, 0.12, -0.42, 0], ["c", -0.09, -0.09, -3.54, -7.74, -3.54, -7.83], ["c", 0, -0.09, 0.12, -0.27, 0.18, -0.3], ["z"]], w: 7.5, h: 8.25 },
    "scripts.stopped": { d: [["M", -0.27, -4.08], ["c", 0.18, -0.09, 0.36, -0.09, 0.54, 0], ["c", 0.18, 0.09, 0.24, 0.15, 0.33, 0.3], ["l", 0.06, 0.15], ["l", 0, 1.5], ["l", 0, 1.47], ["l", 1.47, 0], ["l", 1.5, 0], ["l", 0.15, 0.06], ["c", 0.15, 0.09, 0.21, 0.15, 0.3, 0.33], ["c", 0.09, 0.18, 0.09, 0.36, 0, 0.54], ["c", -0.09, 0.18, -0.15, 0.24, -0.33, 0.33], ["c", -0.12, 0.06, -0.18, 0.06, -1.62, 0.06], ["l", -1.47, 0], ["l", 0, 1.47], ["l", 0, 1.47], ["l", -0.06, 0.15], ["c", -0.09, 0.18, -0.15, 0.24, -0.33, 0.33], ["c", -0.18, 0.09, -0.36, 0.09, -0.54, 0], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["l", -0.06, -0.15], ["l", 0, -1.47], ["l", 0, -1.47], ["l", -1.47, 0], ["c", -1.44, 0, -1.5, 0, -1.62, -0.06], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["c", -0.09, -0.18, -0.09, -0.36, 0, -0.54], ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ["l", 0.15, -0.06], ["l", 1.47, 0], ["l", 1.47, 0], ["l", 0, -1.47], ["c", 0, -1.44, 0, -1.5, 0.06, -1.62], ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ["z"]], w: 8.295, h: 8.295 },
    "scripts.upbow": { d: [["M", -4.65, -15.54], ["c", 0.12, -0.09, 0.36, -0.06, 0.48, 0.03], ["c", 0.03, 0.03, 0.09, 0.09, 0.12, 0.15], ["c", 0.03, 0.06, 0.66, 2.13, 1.41, 4.62], ["c", 1.35, 4.41, 1.38, 4.56, 2.01, 6.96], ["l", 0.63, 2.46], ["l", 0.63, -2.46], ["c", 0.63, -2.4, 0.66, -2.55, 2.01, -6.96], ["c", 0.75, -2.49, 1.38, -4.56, 1.41, -4.62], ["c", 0.06, -0.15, 0.18, -0.21, 0.36, -0.24], ["c", 0.15, 0, 0.3, 0.06, 0.39, 0.18], ["c", 0.15, 0.21, 0.24, -0.18, -2.1, 7.56], ["c", -1.2, 3.96, -2.22, 7.32, -2.25, 7.41], ["c", 0, 0.12, -0.06, 0.27, -0.09, 0.3], ["c", -0.12, 0.21, -0.6, 0.21, -0.72, 0], ["c", -0.03, -0.03, -0.09, -0.18, -0.09, -0.3], ["c", -0.03, -0.09, -1.05, -3.45, -2.25, -7.41], ["c", -2.34, -7.74, -2.25, -7.35, -2.1, -7.56], ["c", 0.03, -0.03, 0.09, -0.09, 0.15, -0.12], ["z"]], w: 9.73, h: 15.608 },
    "scripts.downbow": { d: [["M", -5.55, -9.93], ["l", 0.09, -0.06], ["l", 5.46, 0], ["l", 5.46, 0], ["l", 0.09, 0.06], ["l", 0.06, 0.09], ["l", 0, 4.77], ["c", 0, 5.28, 0, 4.89, -0.18, 5.01], ["c", -0.18, 0.12, -0.42, 0.06, -0.54, -0.12], ["c", -0.06, -0.09, -0.06, -0.18, -0.06, -2.97], ["l", 0, -2.85], ["l", -4.83, 0], ["l", -4.83, 0], ["l", 0, 2.85], ["c", 0, 2.79, 0, 2.88, -0.06, 2.97], ["c", -0.15, 0.24, -0.51, 0.24, -0.66, 0], ["c", -0.06, -0.09, -0.06, -0.21, -0.06, -4.89], ["l", 0, -4.77], ["z"]], w: 11.22, h: 9.992 },
    "scripts.turn": { d: [["M", -4.77, -3.9], ["c", 0.36, -0.06, 1.05, -0.06, 1.44, 0.03], ["c", 0.78, 0.15, 1.5, 0.51, 2.34, 1.14], ["c", 0.6, 0.45, 1.05, 0.87, 2.22, 2.01], ["c", 1.11, 1.08, 1.62, 1.5, 2.22, 1.86], ["c", 0.6, 0.36, 1.32, 0.57, 1.92, 0.57], ["c", 0.9, 0, 1.71, -0.57, 1.89, -1.35], ["c", 0.24, -0.93, -0.39, -1.89, -1.35, -2.1], ["l", -0.15, -0.06], ["l", -0.09, 0.15], ["c", -0.03, 0.09, -0.15, 0.24, -0.24, 0.33], ["c", -0.72, 0.72, -2.04, 0.54, -2.49, -0.36], ["c", -0.48, -0.93, 0.03, -1.86, 1.17, -2.19], ["c", 0.3, -0.09, 1.02, -0.09, 1.35, 0], ["c", 0.99, 0.27, 1.74, 0.87, 2.25, 1.83], ["c", 0.69, 1.41, 0.63, 3, -0.21, 4.26], ["c", -0.21, 0.3, -0.69, 0.81, -0.99, 1.02], ["c", -0.3, 0.21, -0.84, 0.45, -1.17, 0.54], ["c", -1.23, 0.36, -2.49, 0.15, -3.72, -0.6], ["c", -0.75, -0.48, -1.41, -1.02, -2.85, -2.46], ["c", -1.11, -1.08, -1.62, -1.5, -2.22, -1.86], ["c", -0.6, -0.36, -1.32, -0.57, -1.92, -0.57], ["c", -0.9, 0, -1.71, 0.57, -1.89, 1.35], ["c", -0.24, 0.93, 0.39, 1.89, 1.35, 2.1], ["l", 0.15, 0.06], ["l", 0.09, -0.15], ["c", 0.03, -0.09, 0.15, -0.24, 0.24, -0.33], ["c", 0.72, -0.72, 2.04, -0.54, 2.49, 0.36], ["c", 0.48, 0.93, -0.03, 1.86, -1.17, 2.19], ["c", -0.3, 0.09, -1.02, 0.09, -1.35, 0], ["c", -0.99, -0.27, -1.74, -0.87, -2.25, -1.83], ["c", -0.69, -1.41, -0.63, -3, 0.21, -4.26], ["c", 0.21, -0.3, 0.69, -0.81, 0.99, -1.02], ["c", 0.48, -0.33, 1.11, -0.57, 1.74, -0.66], ["z"]], w: 16.366, h: 7.893 },
    "scripts.trill": { d: [["M", -0.51, -16.02], ["c", 0.12, -0.09, 0.21, -0.18, 0.21, -0.18], ["l", -0.81, 4.02], ["l", -0.81, 4.02], ["c", 0.03, 0, 0.51, -0.27, 1.08, -0.6], ["c", 0.6, -0.3, 1.14, -0.63, 1.26, -0.66], ["c", 1.14, -0.54, 2.31, -0.6, 3.09, -0.18], ["c", 0.27, 0.15, 0.54, 0.36, 0.6, 0.51], ["l", 0.06, 0.12], ["l", 0.21, -0.21], ["c", 0.9, -0.81, 2.22, -0.99, 3.12, -0.42], ["c", 0.6, 0.42, 0.9, 1.14, 0.78, 2.07], ["c", -0.15, 1.29, -1.05, 2.31, -1.95, 2.25], ["c", -0.48, -0.03, -0.78, -0.3, -0.96, -0.81], ["c", -0.09, -0.27, -0.09, -0.9, -0.03, -1.2], ["c", 0.21, -0.75, 0.81, -1.23, 1.59, -1.32], ["l", 0.24, -0.03], ["l", -0.09, -0.12], ["c", -0.51, -0.66, -1.62, -0.63, -2.31, 0.03], ["c", -0.39, 0.42, -0.3, 0.09, -1.23, 4.77], ["l", -0.81, 4.14], ["c", -0.03, 0, -0.12, -0.03, -0.21, -0.09], ["c", -0.33, -0.15, -0.54, -0.18, -0.99, -0.18], ["c", -0.42, 0, -0.66, 0.03, -1.05, 0.18], ["c", -0.12, 0.06, -0.21, 0.09, -0.21, 0.09], ["c", 0, -0.03, 0.36, -1.86, 0.81, -4.11], ["c", 0.9, -4.47, 0.87, -4.26, 0.69, -4.53], ["c", -0.21, -0.36, -0.66, -0.51, -1.17, -0.36], ["c", -0.15, 0.06, -2.22, 1.14, -2.58, 1.38], ["c", -0.12, 0.09, -0.12, 0.09, -0.21, 0.6], ["l", -0.09, 0.51], ["l", 0.21, 0.24], ["c", 0.63, 0.75, 1.02, 1.47, 1.2, 2.19], ["c", 0.06, 0.27, 0.06, 0.36, 0.06, 0.81], ["c", 0, 0.42, 0, 0.54, -0.06, 0.78], ["c", -0.15, 0.54, -0.33, 0.93, -0.63, 1.35], ["c", -0.18, 0.24, -0.57, 0.63, -0.81, 0.78], ["c", -0.24, 0.15, -0.63, 0.36, -0.84, 0.42], ["c", -0.27, 0.06, -0.66, 0.06, -0.87, 0.03], ["c", -0.81, -0.18, -1.32, -1.05, -1.38, -2.46], ["c", -0.03, -0.6, 0.03, -0.99, 0.33, -2.46], ["c", 0.21, -1.08, 0.24, -1.32, 0.21, -1.29], ["c", -1.2, 0.48, -2.4, 0.75, -3.21, 0.72], ["c", -0.69, -0.06, -1.17, -0.3, -1.41, -0.72], ["c", -0.39, -0.75, -0.12, -1.8, 0.66, -2.46], ["c", 0.24, -0.18, 0.69, -0.42, 1.02, -0.51], ["c", 0.69, -0.18, 1.53, -0.15, 2.31, 0.09], ["c", 0.3, 0.09, 0.75, 0.3, 0.99, 0.45], ["c", 0.12, 0.09, 0.15, 0.09, 0.15, 0.03], ["c", 0.03, -0.03, 0.33, -1.59, 0.72, -3.45], ["c", 0.36, -1.86, 0.66, -3.42, 0.69, -3.45], ["c", 0, -0.03, 0.03, -0.03, 0.21, 0.03], ["c", 0.21, 0.06, 0.27, 0.06, 0.48, 0.06], ["c", 0.42, -0.03, 0.78, -0.18, 1.26, -0.48], ["c", 0.15, -0.12, 0.36, -0.27, 0.48, -0.39], ["z"], ["m", -5.73, 7.68], ["c", -0.27, -0.03, -0.96, -0.06, -1.2, -0.03], ["c", -0.81, 0.12, -1.35, 0.57, -1.5, 1.2], ["c", -0.18, 0.66, 0.12, 1.14, 0.75, 1.29], ["c", 0.66, 0.12, 1.92, -0.12, 3.18, -0.66], ["l", 0.33, -0.15], ["l", 0.09, -0.39], ["c", 0.06, -0.21, 0.09, -0.42, 0.09, -0.45], ["c", 0, -0.03, -0.45, -0.3, -0.75, -0.45], ["c", -0.27, -0.15, -0.66, -0.27, -0.99, -0.36], ["z"], ["m", 4.29, 3.63], ["c", -0.24, -0.39, -0.51, -0.75, -0.51, -0.69], ["c", -0.06, 0.12, -0.39, 1.92, -0.45, 2.28], ["c", -0.09, 0.54, -0.12, 1.14, -0.06, 1.38], ["c", 0.06, 0.42, 0.21, 0.6, 0.51, 0.57], ["c", 0.39, -0.06, 0.75, -0.48, 0.93, -1.14], ["c", 0.09, -0.33, 0.09, -1.05, 0, -1.38], ["c", -0.09, -0.39, -0.24, -0.69, -0.42, -1.02], ["z"]], w: 17.963, h: 16.49 },
    "scripts.segno": { d: [["M", -3.72, -11.22], ["c", 0.78, -0.09, 1.59, 0.03, 2.31, 0.42], ["c", 1.2, 0.6, 2.01, 1.71, 2.31, 3.09], ["c", 0.09, 0.42, 0.09, 1.2, 0.03, 1.5], ["c", -0.15, 0.45, -0.39, 0.81, -0.66, 0.93], ["c", -0.33, 0.18, -0.84, 0.21, -1.23, 0.15], ["c", -0.81, -0.18, -1.32, -0.93, -1.26, -1.89], ["c", 0.03, -0.36, 0.09, -0.57, 0.24, -0.9], ["c", 0.15, -0.33, 0.45, -0.6, 0.72, -0.75], ["c", 0.12, -0.06, 0.18, -0.09, 0.18, -0.12], ["c", 0, -0.03, -0.03, -0.15, -0.09, -0.24], ["c", -0.18, -0.45, -0.54, -0.87, -0.96, -1.08], ["c", -1.11, -0.57, -2.34, -0.18, -2.88, 0.9], ["c", -0.24, 0.51, -0.33, 1.11, -0.24, 1.83], ["c", 0.27, 1.92, 1.5, 3.54, 3.93, 5.13], ["c", 0.48, 0.33, 1.26, 0.78, 1.29, 0.78], ["c", 0.03, 0, 1.35, -2.19, 2.94, -4.89], ["l", 2.88, -4.89], ["l", 0.84, 0], ["l", 0.87, 0], ["l", -0.03, 0.06], ["c", -0.15, 0.21, -6.15, 10.41, -6.15, 10.44], ["c", 0, 0, 0.21, 0.15, 0.48, 0.27], ["c", 2.61, 1.47, 4.35, 3.03, 5.13, 4.65], ["c", 1.14, 2.34, 0.51, 5.07, -1.44, 6.39], ["c", -0.66, 0.42, -1.32, 0.63, -2.13, 0.69], ["c", -2.01, 0.09, -3.81, -1.41, -4.26, -3.54], ["c", -0.09, -0.42, -0.09, -1.2, -0.03, -1.5], ["c", 0.15, -0.45, 0.39, -0.81, 0.66, -0.93], ["c", 0.33, -0.18, 0.84, -0.21, 1.23, -0.15], ["c", 0.81, 0.18, 1.32, 0.93, 1.26, 1.89], ["c", -0.03, 0.36, -0.09, 0.57, -0.24, 0.9], ["c", -0.15, 0.33, -0.45, 0.6, -0.72, 0.75], ["c", -0.12, 0.06, -0.18, 0.09, -0.18, 0.12], ["c", 0, 0.03, 0.03, 0.15, 0.09, 0.24], ["c", 0.18, 0.45, 0.54, 0.87, 0.96, 1.08], ["c", 1.11, 0.57, 2.34, 0.18, 2.88, -0.9], ["c", 0.24, -0.51, 0.33, -1.11, 0.24, -1.83], ["c", -0.27, -1.92, -1.5, -3.54, -3.93, -5.13], ["c", -0.48, -0.33, -1.26, -0.78, -1.29, -0.78], ["c", -0.03, 0, -1.35, 2.19, -2.91, 4.89], ["l", -2.88, 4.89], ["l", -0.87, 0], ["l", -0.87, 0], ["l", 0.03, -0.06], ["c", 0.15, -0.21, 6.15, -10.41, 6.15, -10.44], ["c", 0, 0, -0.21, -0.15, -0.48, -0.3], ["c", -2.61, -1.44, -4.35, -3, -5.13, -4.62], ["c", -0.9, -1.89, -0.72, -4.02, 0.48, -5.52], ["c", 0.69, -0.84, 1.68, -1.41, 2.73, -1.53], ["z"], ["m", 8.76, 9.09], ["c", 0.03, -0.03, 0.15, -0.03, 0.27, -0.03], ["c", 0.33, 0.03, 0.57, 0.18, 0.72, 0.48], ["c", 0.09, 0.18, 0.09, 0.57, 0, 0.75], ["c", -0.09, 0.18, -0.21, 0.3, -0.36, 0.39], ["c", -0.15, 0.06, -0.21, 0.06, -0.39, 0.06], ["c", -0.21, 0, -0.27, 0, -0.39, -0.06], ["c", -0.3, -0.15, -0.48, -0.45, -0.48, -0.75], ["c", 0, -0.39, 0.24, -0.72, 0.63, -0.84], ["z"], ["m", -10.53, 2.61], ["c", 0.03, -0.03, 0.15, -0.03, 0.27, -0.03], ["c", 0.33, 0.03, 0.57, 0.18, 0.72, 0.48], ["c", 0.09, 0.18, 0.09, 0.57, 0, 0.75], ["c", -0.09, 0.18, -0.21, 0.3, -0.36, 0.39], ["c", -0.15, 0.06, -0.21, 0.06, -0.39, 0.06], ["c", -0.21, 0, -0.27, 0, -0.39, -0.06], ["c", -0.3, -0.15, -0.48, -0.45, -0.48, -0.75], ["c", 0, -0.39, 0.24, -0.72, 0.63, -0.84], ["z"]], w: 15, h: 22.504 },
    "scripts.coda": { d: [["M", -0.21, -10.47], ["c", 0.18, -0.12, 0.42, -0.06, 0.54, 0.12], ["c", 0.06, 0.09, 0.06, 0.18, 0.06, 1.5], ["l", 0, 1.38], ["l", 0.18, 0], ["c", 0.39, 0.06, 0.96, 0.24, 1.38, 0.48], ["c", 1.68, 0.93, 2.82, 3.24, 3.03, 6.12], ["c", 0.03, 0.24, 0.03, 0.45, 0.03, 0.45], ["c", 0, 0.03, 0.6, 0.03, 1.35, 0.03], ["c", 1.5, 0, 1.47, 0, 1.59, 0.18], ["c", 0.09, 0.12, 0.09, 0.3, 0, 0.42], ["c", -0.12, 0.18, -0.09, 0.18, -1.59, 0.18], ["c", -0.75, 0, -1.35, 0, -1.35, 0.03], ["c", 0, 0, 0, 0.21, -0.03, 0.42], ["c", -0.24, 3.15, -1.53, 5.58, -3.45, 6.36], ["c", -0.27, 0.12, -0.72, 0.24, -0.96, 0.27], ["l", -0.18, 0], ["l", 0, 1.38], ["c", 0, 1.32, 0, 1.41, -0.06, 1.5], ["c", -0.15, 0.24, -0.51, 0.24, -0.66, 0], ["c", -0.06, -0.09, -0.06, -0.18, -0.06, -1.5], ["l", 0, -1.38], ["l", -0.18, 0], ["c", -0.39, -0.06, -0.96, -0.24, -1.38, -0.48], ["c", -1.68, -0.93, -2.82, -3.24, -3.03, -6.15], ["c", -0.03, -0.21, -0.03, -0.42, -0.03, -0.42], ["c", 0, -0.03, -0.6, -0.03, -1.35, -0.03], ["c", -1.5, 0, -1.47, 0, -1.59, -0.18], ["c", -0.09, -0.12, -0.09, -0.3, 0, -0.42], ["c", 0.12, -0.18, 0.09, -0.18, 1.59, -0.18], ["c", 0.75, 0, 1.35, 0, 1.35, -0.03], ["c", 0, 0, 0, -0.21, 0.03, -0.45], ["c", 0.24, -3.12, 1.53, -5.55, 3.45, -6.33], ["c", 0.27, -0.12, 0.72, -0.24, 0.96, -0.27], ["l", 0.18, 0], ["l", 0, -1.38], ["c", 0, -1.53, 0, -1.5, 0.18, -1.62], ["z"], ["m", -0.18, 6.93], ["c", 0, -2.97, 0, -3.15, -0.06, -3.15], ["c", -0.09, 0, -0.51, 0.15, -0.66, 0.21], ["c", -0.87, 0.51, -1.38, 1.62, -1.56, 3.51], ["c", -0.06, 0.54, -0.12, 1.59, -0.12, 2.16], ["l", 0, 0.42], ["l", 1.2, 0], ["l", 1.2, 0], ["l", 0, -3.15], ["z"], ["m", 1.17, -3.06], ["c", -0.09, -0.03, -0.21, -0.06, -0.27, -0.09], ["l", -0.12, 0], ["l", 0, 3.15], ["l", 0, 3.15], ["l", 1.2, 0], ["l", 1.2, 0], ["l", 0, -0.81], ["c", -0.06, -2.4, -0.33, -3.69, -0.93, -4.59], ["c", -0.27, -0.39, -0.66, -0.69, -1.08, -0.81], ["z"], ["m", -1.17, 10.14], ["l", 0, -3.15], ["l", -1.2, 0], ["l", -1.2, 0], ["l", 0, 0.81], ["c", 0.03, 0.96, 0.06, 1.47, 0.15, 2.13], ["c", 0.24, 2.04, 0.96, 3.12, 2.13, 3.36], ["l", 0.12, 0], ["l", 0, -3.15], ["z"], ["m", 3.18, -2.34], ["l", 0, -0.81], ["l", -1.2, 0], ["l", -1.2, 0], ["l", 0, 3.15], ["l", 0, 3.15], ["l", 0.12, 0], ["c", 1.17, -0.24, 1.89, -1.32, 2.13, -3.36], ["c", 0.09, -0.66, 0.12, -1.17, 0.15, -2.13], ["z"]], w: 16.035, h: 21.062 },
    "scripts.comma": { d: [["M", 1.14, -4.62], ["c", 0.3, -0.12, 0.69, -0.03, 0.93, 0.15], ["c", 0.12, 0.12, 0.36, 0.45, 0.51, 0.78], ["c", 0.9, 1.77, 0.54, 4.05, -1.08, 6.75], ["c", -0.36, 0.63, -0.87, 1.38, -0.96, 1.44], ["c", -0.18, 0.12, -0.42, 0.06, -0.54, -0.12], ["c", -0.09, -0.18, -0.09, -0.3, 0.12, -0.6], ["c", 0.96, -1.44, 1.44, -2.97, 1.38, -4.35], ["c", -0.06, -0.93, -0.3, -1.68, -0.78, -2.46], ["c", -0.27, -0.39, -0.33, -0.63, -0.24, -0.96], ["c", 0.09, -0.27, 0.36, -0.54, 0.66, -0.63], ["z"]], w: 3.042, h: 9.237 },
    "scripts.roll": { d: [["M", 1.95, -6], ["c", 0.21, -0.09, 0.36, -0.09, 0.57, 0], ["c", 0.39, 0.15, 0.63, 0.39, 1.47, 1.35], ["c", 0.66, 0.75, 0.78, 0.87, 1.08, 1.05], ["c", 0.75, 0.45, 1.65, 0.42, 2.4, -0.06], ["c", 0.12, -0.09, 0.27, -0.27, 0.54, -0.6], ["c", 0.42, -0.54, 0.51, -0.63, 0.69, -0.63], ["c", 0.09, 0, 0.3, 0.12, 0.36, 0.21], ["c", 0.09, 0.12, 0.12, 0.3, 0.03, 0.42], ["c", -0.06, 0.12, -3.15, 3.9, -3.3, 4.08], ["c", -0.06, 0.06, -0.18, 0.12, -0.27, 0.18], ["c", -0.27, 0.12, -0.6, 0.06, -0.99, -0.27], ["c", -0.27, -0.21, -0.42, -0.39, -1.08, -1.14], ["c", -0.63, -0.72, -0.81, -0.9, -1.17, -1.08], ["c", -0.36, -0.18, -0.57, -0.21, -0.99, -0.21], ["c", -0.39, 0, -0.63, 0.03, -0.93, 0.18], ["c", -0.36, 0.15, -0.51, 0.27, -0.9, 0.81], ["c", -0.24, 0.27, -0.45, 0.51, -0.48, 0.54], ["c", -0.12, 0.09, -0.27, 0.06, -0.39, 0], ["c", -0.24, -0.15, -0.33, -0.39, -0.21, -0.6], ["c", 0.09, -0.12, 3.18, -3.87, 3.33, -4.02], ["c", 0.06, -0.06, 0.18, -0.15, 0.24, -0.21], ["z"]], w: 10.817, h: 6.125 },
    "scripts.prall": { d: [["M", -4.38, -3.69], ["c", 0.06, -0.03, 0.18, -0.06, 0.24, -0.06], ["c", 0.3, 0, 0.27, -0.03, 1.89, 1.95], ["l", 1.53, 1.83], ["c", 0.03, 0, 0.57, -0.84, 1.23, -1.83], ["c", 1.14, -1.68, 1.23, -1.83, 1.35, -1.89], ["c", 0.06, -0.03, 0.18, -0.06, 0.24, -0.06], ["c", 0.3, 0, 0.27, -0.03, 1.89, 1.95], ["l", 1.53, 1.83], ["l", 0.48, -0.69], ["c", 0.51, -0.78, 0.54, -0.84, 0.69, -0.9], ["c", 0.42, -0.18, 0.87, 0.15, 0.81, 0.6], ["c", -0.03, 0.12, -0.3, 0.51, -1.5, 2.37], ["c", -1.38, 2.07, -1.5, 2.22, -1.62, 2.28], ["c", -0.06, 0.03, -0.18, 0.06, -0.24, 0.06], ["c", -0.3, 0, -0.27, 0.03, -1.89, -1.95], ["l", -1.53, -1.83], ["c", -0.03, 0, -0.57, 0.84, -1.23, 1.83], ["c", -1.14, 1.68, -1.23, 1.83, -1.35, 1.89], ["c", -0.06, 0.03, -0.18, 0.06, -0.24, 0.06], ["c", -0.3, 0, -0.27, 0.03, -1.89, -1.95], ["l", -1.53, -1.83], ["l", -0.48, 0.69], ["c", -0.51, 0.78, -0.54, 0.84, -0.69, 0.9], ["c", -0.42, 0.18, -0.87, -0.15, -0.81, -0.6], ["c", 0.03, -0.12, 0.3, -0.51, 1.5, -2.37], ["c", 1.38, -2.07, 1.5, -2.22, 1.62, -2.28], ["z"]], w: 15.011, h: 7.5 },
    "scripts.arpeggio": { d: [["M", 1.5, 0], ["c", 1.5, 2, 1.5, 3, 1.5, 3], ["s", 0, 1, -2, 1.5], ["s", -0.5, 3, 1, 5.5], ["l", 1.5, 0], ["s", -1.75, -2, -1.9, -3.25], ["s", 2.15, -0.6, 2.95, -1.6], ["s", 0.45, -1, 0.5, -1.25], ["s", 0, -1, -2, -3.9], ["l", -1.5, 0], ["z"]], w: 5, h: 10 },
    "scripts.mordent": { d: [["M", -0.21, -4.95], ["c", 0.27, -0.15, 0.63, 0, 0.75, 0.27], ["c", 0.06, 0.12, 0.06, 0.24, 0.06, 1.44], ["l", 0, 1.29], ["l", 0.57, -0.84], ["c", 0.51, -0.75, 0.57, -0.84, 0.69, -0.9], ["c", 0.06, -0.03, 0.18, -0.06, 0.24, -0.06], ["c", 0.3, 0, 0.27, -0.03, 1.89, 1.95], ["l", 1.53, 1.83], ["l", 0.48, -0.69], ["c", 0.51, -0.78, 0.54, -0.84, 0.69, -0.9], ["c", 0.42, -0.18, 0.87, 0.15, 0.81, 0.6], ["c", -0.03, 0.12, -0.3, 0.51, -1.5, 2.37], ["c", -1.38, 2.07, -1.5, 2.22, -1.62, 2.28], ["c", -0.06, 0.03, -0.18, 0.06, -0.24, 0.06], ["c", -0.3, 0, -0.27, 0.03, -1.83, -1.89], ["c", -0.81, -0.99, -1.5, -1.8, -1.53, -1.86], ["c", -0.06, -0.03, -0.06, -0.03, -0.12, 0.03], ["c", -0.06, 0.06, -0.06, 0.15, -0.06, 2.28], ["c", 0, 1.95, 0, 2.25, -0.06, 2.34], ["c", -0.18, 0.45, -0.81, 0.48, -1.05, 0.03], ["c", -0.03, -0.06, -0.06, -0.24, -0.06, -1.41], ["l", 0, -1.35], ["l", -0.57, 0.84], ["c", -0.54, 0.78, -0.6, 0.87, -0.72, 0.93], ["c", -0.06, 0.03, -0.18, 0.06, -0.24, 0.06], ["c", -0.3, 0, -0.27, 0.03, -1.89, -1.95], ["l", -1.53, -1.83], ["l", -0.48, 0.69], ["c", -0.51, 0.78, -0.54, 0.84, -0.69, 0.9], ["c", -0.42, 0.18, -0.87, -0.15, -0.81, -0.6], ["c", 0.03, -0.12, 0.3, -0.51, 1.5, -2.37], ["c", 1.38, -2.07, 1.5, -2.22, 1.62, -2.28], ["c", 0.06, -0.03, 0.18, -0.06, 0.24, -0.06], ["c", 0.3, 0, 0.27, -0.03, 1.89, 1.95], ["l", 1.53, 1.83], ["c", 0.03, 0, 0.06, -0.06, 0.09, -0.09], ["c", 0.06, -0.12, 0.06, -0.15, 0.06, -2.28], ["c", 0, -1.92, 0, -2.22, 0.06, -2.31], ["c", 0.06, -0.15, 0.15, -0.24, 0.3, -0.3], ["z"]], w: 15.011, h: 10.012 },
    "flags.u8th": { d: [["M", -0.42, 3.75], ["l", 0, -3.75], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0, 0.18], ["c", 0, 0.3, 0.06, 0.84, 0.12, 1.23], ["c", 0.24, 1.53, 0.9, 3.12, 2.13, 5.16], ["l", 0.99, 1.59], ["c", 0.87, 1.44, 1.38, 2.34, 1.77, 3.09], ["c", 0.81, 1.68, 1.2, 3.06, 1.26, 4.53], ["c", 0.03, 1.53, -0.21, 3.27, -0.75, 5.01], ["c", -0.21, 0.69, -0.51, 1.5, -0.6, 1.59], ["c", -0.09, 0.12, -0.27, 0.21, -0.42, 0.21], ["c", -0.15, 0, -0.42, -0.12, -0.51, -0.21], ["c", -0.15, -0.18, -0.18, -0.42, -0.09, -0.66], ["c", 0.15, -0.33, 0.45, -1.2, 0.57, -1.62], ["c", 0.42, -1.38, 0.6, -2.58, 0.6, -3.9], ["c", 0, -0.66, 0, -0.81, -0.06, -1.11], ["c", -0.39, -2.07, -1.8, -4.26, -4.59, -7.14], ["l", -0.42, -0.45], ["l", -0.21, 0], ["l", -0.21, 0], ["l", 0, -3.75], ["z"]], w: 6.692, h: 22.59 },
    "flags.u16th": { d: [["M", -0.42, 7.5], ["l", 0, -7.5], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0, 0.39], ["c", 0.06, 1.08, 0.39, 2.19, 0.99, 3.39], ["c", 0.45, 0.9, 0.87, 1.59, 1.95, 3.12], ["c", 1.29, 1.86, 1.77, 2.64, 2.22, 3.57], ["c", 0.45, 0.93, 0.72, 1.8, 0.87, 2.64], ["c", 0.06, 0.51, 0.06, 1.5, 0, 1.92], ["c", -0.12, 0.6, -0.3, 1.2, -0.54, 1.71], ["l", -0.09, 0.24], ["l", 0.18, 0.45], ["c", 0.51, 1.2, 0.72, 2.22, 0.69, 3.42], ["c", -0.06, 1.53, -0.39, 3.03, -0.99, 4.53], ["c", -0.3, 0.75, -0.36, 0.81, -0.57, 0.9], ["c", -0.15, 0.09, -0.33, 0.06, -0.48, 0], ["c", -0.18, -0.09, -0.27, -0.18, -0.33, -0.33], ["c", -0.09, -0.18, -0.06, -0.3, 0.12, -0.75], ["c", 0.66, -1.41, 1.02, -2.88, 1.08, -4.32], ["c", 0, -0.6, -0.03, -1.05, -0.18, -1.59], ["c", -0.3, -1.2, -0.99, -2.4, -2.25, -3.87], ["c", -0.42, -0.48, -1.53, -1.62, -2.19, -2.22], ["l", -0.45, -0.42], ["l", -0.03, 1.11], ["l", 0, 1.11], ["l", -0.21, 0], ["l", -0.21, 0], ["l", 0, -7.5], ["z"], ["m", 1.65, 0.09], ["c", -0.3, -0.3, -0.69, -0.72, -0.9, -0.87], ["l", -0.33, -0.33], ["l", 0, 0.15], ["c", 0, 0.3, 0.06, 0.81, 0.15, 1.26], ["c", 0.27, 1.29, 0.87, 2.61, 2.04, 4.29], ["c", 0.15, 0.24, 0.6, 0.87, 0.96, 1.38], ["l", 1.08, 1.53], ["l", 0.42, 0.63], ["c", 0.03, 0, 0.12, -0.36, 0.21, -0.72], ["c", 0.06, -0.33, 0.06, -1.2, 0, -1.62], ["c", -0.33, -1.71, -1.44, -3.48, -3.63, -5.7], ["z"]], w: 6.693, h: 26.337 },
    "flags.u32nd": { d: [["M", -0.42, 11.25], ["l", 0, -11.25], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0, 0.36], ["c", 0.09, 1.68, 0.69, 3.27, 2.07, 5.46], ["l", 0.87, 1.35], ["c", 1.02, 1.62, 1.47, 2.37, 1.86, 3.18], ["c", 0.48, 1.02, 0.78, 1.92, 0.93, 2.88], ["c", 0.06, 0.48, 0.06, 1.5, 0, 1.89], ["c", -0.09, 0.42, -0.21, 0.87, -0.36, 1.26], ["l", -0.12, 0.3], ["l", 0.15, 0.39], ["c", 0.69, 1.56, 0.84, 2.88, 0.54, 4.38], ["c", -0.09, 0.45, -0.27, 1.08, -0.45, 1.47], ["l", -0.12, 0.24], ["l", 0.18, 0.36], ["c", 0.33, 0.72, 0.57, 1.56, 0.69, 2.34], ["c", 0.12, 1.02, -0.06, 2.52, -0.42, 3.84], ["c", -0.27, 0.93, -0.75, 2.13, -0.93, 2.31], ["c", -0.18, 0.15, -0.45, 0.18, -0.66, 0.09], ["c", -0.18, -0.09, -0.27, -0.18, -0.33, -0.33], ["c", -0.09, -0.18, -0.06, -0.3, 0.06, -0.6], ["c", 0.21, -0.36, 0.42, -0.9, 0.57, -1.38], ["c", 0.51, -1.41, 0.69, -3.06, 0.48, -4.08], ["c", -0.15, -0.81, -0.57, -1.68, -1.2, -2.55], ["c", -0.72, -0.99, -1.83, -2.13, -3.3, -3.33], ["l", -0.48, -0.42], ["l", -0.03, 1.53], ["l", 0, 1.56], ["l", -0.21, 0], ["l", -0.21, 0], ["l", 0, -11.25], ["z"], ["m", 1.26, -3.96], ["c", -0.27, -0.3, -0.54, -0.6, -0.66, -0.72], ["l", -0.18, -0.21], ["l", 0, 0.42], ["c", 0.06, 0.87, 0.24, 1.74, 0.66, 2.67], ["c", 0.36, 0.87, 0.96, 1.86, 1.92, 3.18], ["c", 0.21, 0.33, 0.63, 0.87, 0.87, 1.23], ["c", 0.27, 0.39, 0.6, 0.84, 0.75, 1.08], ["l", 0.27, 0.39], ["l", 0.03, -0.12], ["c", 0.12, -0.45, 0.15, -1.05, 0.09, -1.59], ["c", -0.27, -1.86, -1.38, -3.78, -3.75, -6.33], ["z"], ["m", -0.27, 6.09], ["c", -0.27, -0.21, -0.48, -0.42, -0.51, -0.45], ["c", -0.06, -0.03, -0.06, -0.03, -0.06, 0.21], ["c", 0, 0.9, 0.3, 2.04, 0.81, 3.09], ["c", 0.48, 1.02, 0.96, 1.77, 2.37, 3.63], ["c", 0.6, 0.78, 1.05, 1.44, 1.29, 1.77], ["c", 0.06, 0.12, 0.15, 0.21, 0.15, 0.18], ["c", 0.03, -0.03, 0.18, -0.57, 0.24, -0.87], ["c", 0.06, -0.45, 0.06, -1.32, -0.03, -1.74], ["c", -0.09, -0.48, -0.24, -0.9, -0.51, -1.44], ["c", -0.66, -1.35, -1.83, -2.7, -3.75, -4.38], ["z"]], w: 6.697, h: 32.145 },
    "flags.u64th": { d: [["M", -0.42, 15], ["l", 0, -15], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0, 0.36], ["c", 0.06, 1.2, 0.39, 2.37, 1.02, 3.66], ["c", 0.39, 0.81, 0.84, 1.56, 1.8, 3.09], ["c", 0.81, 1.26, 1.05, 1.68, 1.35, 2.22], ["c", 0.87, 1.5, 1.35, 2.79, 1.56, 4.08], ["c", 0.06, 0.54, 0.06, 1.56, -0.03, 2.04], ["c", -0.09, 0.48, -0.21, 0.99, -0.36, 1.35], ["l", -0.12, 0.27], ["l", 0.12, 0.27], ["c", 0.09, 0.15, 0.21, 0.45, 0.27, 0.66], ["c", 0.69, 1.89, 0.63, 3.66, -0.18, 5.46], ["l", -0.18, 0.39], ["l", 0.15, 0.33], ["c", 0.3, 0.66, 0.51, 1.44, 0.63, 2.1], ["c", 0.06, 0.48, 0.06, 1.35, 0, 1.71], ["c", -0.15, 0.57, -0.42, 1.2, -0.78, 1.68], ["l", -0.21, 0.27], ["l", 0.18, 0.33], ["c", 0.57, 1.05, 0.93, 2.13, 1.02, 3.18], ["c", 0.06, 0.72, 0, 1.83, -0.21, 2.79], ["c", -0.18, 1.02, -0.63, 2.34, -1.02, 3.09], ["c", -0.15, 0.33, -0.48, 0.45, -0.78, 0.3], ["c", -0.18, -0.09, -0.27, -0.18, -0.33, -0.33], ["c", -0.09, -0.18, -0.06, -0.3, 0.03, -0.54], ["c", 0.75, -1.5, 1.23, -3.45, 1.17, -4.89], ["c", -0.06, -1.02, -0.42, -2.01, -1.17, -3.15], ["c", -0.48, -0.72, -1.02, -1.35, -1.89, -2.22], ["c", -0.57, -0.57, -1.56, -1.5, -1.92, -1.77], ["l", -0.12, -0.09], ["l", 0, 1.68], ["l", 0, 1.68], ["l", -0.21, 0], ["l", -0.21, 0], ["l", 0, -15], ["z"], ["m", 0.93, -8.07], ["c", -0.27, -0.3, -0.48, -0.54, -0.51, -0.54], ["c", 0, 0, 0, 0.69, 0.03, 1.02], ["c", 0.15, 1.47, 0.75, 2.94, 2.04, 4.83], ["l", 1.08, 1.53], ["c", 0.39, 0.57, 0.84, 1.2, 0.99, 1.44], ["c", 0.15, 0.24, 0.3, 0.45, 0.3, 0.45], ["c", 0, 0, 0.03, -0.09, 0.06, -0.21], ["c", 0.36, -1.59, -0.15, -3.33, -1.47, -5.4], ["c", -0.63, -0.93, -1.35, -1.83, -2.52, -3.12], ["z"], ["m", 0.06, 6.72], ["c", -0.24, -0.21, -0.48, -0.42, -0.51, -0.45], ["l", -0.06, -0.06], ["l", 0, 0.33], ["c", 0, 1.2, 0.3, 2.34, 0.93, 3.6], ["c", 0.45, 0.9, 0.96, 1.68, 2.25, 3.51], ["c", 0.39, 0.54, 0.84, 1.17, 1.02, 1.44], ["c", 0.21, 0.33, 0.33, 0.51, 0.33, 0.48], ["c", 0.06, -0.09, 0.21, -0.63, 0.3, -0.99], ["c", 0.06, -0.33, 0.06, -0.45, 0.06, -0.96], ["c", 0, -0.6, -0.03, -0.84, -0.18, -1.35], ["c", -0.3, -1.08, -1.02, -2.28, -2.13, -3.57], ["c", -0.39, -0.45, -1.44, -1.47, -2.01, -1.98], ["z"], ["m", 0, 6.72], ["c", -0.24, -0.21, -0.48, -0.39, -0.51, -0.42], ["l", -0.06, -0.06], ["l", 0, 0.33], ["c", 0, 1.41, 0.45, 2.82, 1.38, 4.35], ["c", 0.42, 0.72, 0.72, 1.14, 1.86, 2.73], ["c", 0.36, 0.45, 0.75, 0.99, 0.87, 1.2], ["c", 0.15, 0.21, 0.3, 0.36, 0.3, 0.36], ["c", 0.06, 0, 0.3, -0.48, 0.39, -0.75], ["c", 0.09, -0.36, 0.12, -0.63, 0.12, -1.05], ["c", -0.06, -1.05, -0.45, -2.04, -1.2, -3.18], ["c", -0.57, -0.87, -1.11, -1.53, -2.07, -2.49], ["c", -0.36, -0.33, -0.84, -0.78, -1.08, -1.02], ["z"]], w: 6.682, h: 39.694 },
    "flags.d8th": { d: [["M", 5.67, -21.63], ["c", 0.24, -0.12, 0.54, -0.06, 0.69, 0.15], ["c", 0.06, 0.06, 0.21, 0.36, 0.39, 0.66], ["c", 0.84, 1.77, 1.26, 3.36, 1.32, 5.1], ["c", 0.03, 1.29, -0.21, 2.37, -0.81, 3.63], ["c", -0.6, 1.23, -1.26, 2.13, -3.21, 4.38], ["c", -1.35, 1.53, -1.86, 2.19, -2.4, 2.97], ["c", -0.63, 0.93, -1.11, 1.92, -1.38, 2.79], ["c", -0.15, 0.54, -0.27, 1.35, -0.27, 1.8], ["l", 0, 0.15], ["l", -0.21, 0], ["l", -0.21, 0], ["l", 0, -3.75], ["l", 0, -3.75], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0.48, -0.3], ["c", 1.83, -1.11, 3.12, -2.1, 4.17, -3.12], ["c", 0.78, -0.81, 1.32, -1.53, 1.71, -2.31], ["c", 0.45, -0.93, 0.6, -1.74, 0.51, -2.88], ["c", -0.12, -1.56, -0.63, -3.18, -1.47, -4.68], ["c", -0.12, -0.21, -0.15, -0.33, -0.06, -0.51], ["c", 0.06, -0.15, 0.15, -0.24, 0.33, -0.33], ["z"]], w: 8.492, h: 21.691 },
    "flags.ugrace": { d: [["M", 6.03, 6.93], ["c", 0.15, -0.09, 0.33, -0.06, 0.51, 0], ["c", 0.15, 0.09, 0.21, 0.15, 0.3, 0.33], ["c", 0.09, 0.18, 0.06, 0.39, -0.03, 0.54], ["c", -0.06, 0.15, -10.89, 8.88, -11.07, 8.97], ["c", -0.15, 0.09, -0.33, 0.06, -0.48, 0], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["c", -0.09, -0.18, -0.06, -0.39, 0.03, -0.54], ["c", 0.06, -0.15, 10.89, -8.88, 11.07, -8.97], ["z"]], w: 12.019, h: 9.954 },
    "flags.dgrace": { d: [["M", -6.06, -15.93], ["c", 0.18, -0.09, 0.33, -0.12, 0.48, -0.06], ["c", 0.18, 0.09, 14.01, 8.04, 14.1, 8.1], ["c", 0.12, 0.12, 0.18, 0.33, 0.18, 0.51], ["c", -0.03, 0.21, -0.15, 0.39, -0.36, 0.48], ["c", -0.18, 0.09, -0.33, 0.12, -0.48, 0.06], ["c", -0.18, -0.09, -14.01, -8.04, -14.1, -8.1], ["c", -0.12, -0.12, -0.18, -0.33, -0.18, -0.51], ["c", 0.03, -0.21, 0.15, -0.39, 0.36, -0.48], ["z"]], w: 15.12, h: 9.212 },
    "flags.d16th": { d: [["M", 6.84, -22.53], ["c", 0.27, -0.12, 0.57, -0.06, 0.72, 0.15], ["c", 0.15, 0.15, 0.33, 0.87, 0.45, 1.56], ["c", 0.06, 0.33, 0.06, 1.35, 0, 1.65], ["c", -0.06, 0.33, -0.15, 0.78, -0.27, 1.11], ["c", -0.12, 0.33, -0.45, 0.96, -0.66, 1.32], ["l", -0.18, 0.27], ["l", 0.09, 0.18], ["c", 0.48, 1.02, 0.72, 2.25, 0.69, 3.3], ["c", -0.06, 1.23, -0.42, 2.28, -1.26, 3.45], ["c", -0.57, 0.87, -0.99, 1.32, -3, 3.39], ["c", -1.56, 1.56, -2.22, 2.4, -2.76, 3.45], ["c", -0.42, 0.84, -0.66, 1.8, -0.66, 2.55], ["l", 0, 0.15], ["l", -0.21, 0], ["l", -0.21, 0], ["l", 0, -7.5], ["l", 0, -7.5], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0, 1.14], ["l", 0, 1.11], ["l", 0.27, -0.15], ["c", 1.11, -0.57, 1.77, -0.99, 2.52, -1.47], ["c", 2.37, -1.56, 3.69, -3.15, 4.05, -4.83], ["c", 0.03, -0.18, 0.03, -0.39, 0.03, -0.78], ["c", 0, -0.6, -0.03, -0.93, -0.24, -1.5], ["c", -0.06, -0.18, -0.12, -0.39, -0.15, -0.45], ["c", -0.03, -0.24, 0.12, -0.48, 0.36, -0.6], ["z"], ["m", -0.63, 7.5], ["c", -0.06, -0.18, -0.15, -0.36, -0.15, -0.36], ["c", -0.03, 0, -0.03, 0.03, -0.06, 0.06], ["c", -0.06, 0.12, -0.96, 1.02, -1.95, 1.98], ["c", -0.63, 0.57, -1.26, 1.17, -1.44, 1.35], ["c", -1.53, 1.62, -2.28, 2.85, -2.55, 4.32], ["c", -0.03, 0.18, -0.03, 0.54, -0.06, 0.99], ["l", 0, 0.69], ["l", 0.18, -0.09], ["c", 0.93, -0.54, 2.1, -1.29, 2.82, -1.83], ["c", 0.69, -0.51, 1.02, -0.81, 1.53, -1.29], ["c", 1.86, -1.89, 2.37, -3.66, 1.68, -5.82], ["z"]], w: 8.475, h: 22.591 },
    "flags.d32nd": { d: [["M", 6.84, -29.13], ["c", 0.27, -0.12, 0.57, -0.06, 0.72, 0.15], ["c", 0.12, 0.12, 0.27, 0.63, 0.36, 1.11], ["c", 0.33, 1.59, 0.06, 3.06, -0.81, 4.47], ["l", -0.18, 0.27], ["l", 0.09, 0.15], ["c", 0.12, 0.24, 0.33, 0.69, 0.45, 1.05], ["c", 0.63, 1.83, 0.45, 3.57, -0.57, 5.22], ["l", -0.18, 0.3], ["l", 0.15, 0.27], ["c", 0.42, 0.87, 0.6, 1.71, 0.57, 2.61], ["c", -0.06, 1.29, -0.48, 2.46, -1.35, 3.78], ["c", -0.54, 0.81, -0.93, 1.29, -2.46, 3], ["c", -0.51, 0.54, -1.05, 1.17, -1.26, 1.41], ["c", -1.56, 1.86, -2.25, 3.36, -2.37, 5.01], ["l", 0, 0.33], ["l", -0.21, 0], ["l", -0.21, 0], ["l", 0, -11.25], ["l", 0, -11.25], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0, 1.35], ["l", 0.03, 1.35], ["l", 0.78, -0.39], ["c", 1.38, -0.69, 2.34, -1.26, 3.24, -1.92], ["c", 1.38, -1.02, 2.28, -2.13, 2.64, -3.21], ["c", 0.15, -0.48, 0.18, -0.72, 0.18, -1.29], ["c", 0, -0.57, -0.06, -0.9, -0.24, -1.47], ["c", -0.06, -0.18, -0.12, -0.39, -0.15, -0.45], ["c", -0.03, -0.24, 0.12, -0.48, 0.36, -0.6], ["z"], ["m", -0.63, 7.2], ["c", -0.09, -0.18, -0.12, -0.21, -0.12, -0.15], ["c", -0.03, 0.09, -1.02, 1.08, -2.04, 2.04], ["c", -1.17, 1.08, -1.65, 1.56, -2.07, 2.04], ["c", -0.84, 0.96, -1.38, 1.86, -1.68, 2.76], ["c", -0.21, 0.57, -0.27, 0.99, -0.3, 1.65], ["l", 0, 0.54], ["l", 0.66, -0.33], ["c", 3.57, -1.86, 5.49, -3.69, 5.94, -5.7], ["c", 0.06, -0.39, 0.06, -1.2, -0.03, -1.65], ["c", -0.06, -0.39, -0.24, -0.9, -0.36, -1.2], ["z"], ["m", -0.06, 7.2], ["c", -0.06, -0.15, -0.12, -0.33, -0.15, -0.45], ["l", -0.06, -0.18], ["l", -0.18, 0.21], ["l", -1.83, 1.83], ["c", -0.87, 0.9, -1.77, 1.8, -1.95, 2.01], ["c", -1.08, 1.29, -1.62, 2.31, -1.89, 3.51], ["c", -0.06, 0.3, -0.06, 0.51, -0.09, 0.93], ["l", 0, 0.57], ["l", 0.09, -0.06], ["c", 0.75, -0.45, 1.89, -1.26, 2.52, -1.74], ["c", 0.81, -0.66, 1.74, -1.53, 2.22, -2.16], ["c", 1.26, -1.53, 1.68, -3.06, 1.32, -4.47], ["z"]], w: 8.385, h: 29.191 },
    "flags.d64th": { d: [["M", 7.08, -32.88], ["c", 0.3, -0.12, 0.66, -0.03, 0.78, 0.24], ["c", 0.18, 0.33, 0.27, 2.1, 0.15, 2.64], ["c", -0.09, 0.39, -0.21, 0.78, -0.39, 1.08], ["l", -0.15, 0.3], ["l", 0.09, 0.27], ["c", 0.03, 0.12, 0.09, 0.45, 0.12, 0.69], ["c", 0.27, 1.44, 0.18, 2.55, -0.3, 3.6], ["l", -0.12, 0.33], ["l", 0.06, 0.42], ["c", 0.27, 1.35, 0.33, 2.82, 0.21, 3.63], ["c", -0.12, 0.6, -0.3, 1.23, -0.57, 1.8], ["l", -0.15, 0.27], ["l", 0.03, 0.42], ["c", 0.06, 1.02, 0.06, 2.7, 0.03, 3.06], ["c", -0.15, 1.47, -0.66, 2.76, -1.74, 4.41], ["c", -0.45, 0.69, -0.75, 1.11, -1.74, 2.37], ["c", -1.05, 1.38, -1.5, 1.98, -1.95, 2.73], ["c", -0.93, 1.5, -1.38, 2.82, -1.44, 4.2], ["l", 0, 0.42], ["l", -0.21, 0], ["l", -0.21, 0], ["l", 0, -15], ["l", 0, -15], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0, 1.86], ["l", 0, 1.89], ["c", 0, 0, 0.21, -0.03, 0.45, -0.09], ["c", 2.22, -0.39, 4.08, -1.11, 5.19, -2.01], ["c", 0.63, -0.54, 1.02, -1.14, 1.2, -1.8], ["c", 0.06, -0.3, 0.06, -1.14, -0.03, -1.65], ["c", -0.03, -0.18, -0.06, -0.39, -0.09, -0.48], ["c", -0.03, -0.24, 0.12, -0.48, 0.36, -0.6], ["z"], ["m", -0.45, 6.15], ["c", -0.03, -0.18, -0.06, -0.42, -0.06, -0.54], ["l", -0.03, -0.18], ["l", -0.33, 0.3], ["c", -0.42, 0.36, -0.87, 0.72, -1.68, 1.29], ["c", -1.98, 1.38, -2.25, 1.59, -2.85, 2.16], ["c", -0.75, 0.69, -1.23, 1.44, -1.47, 2.19], ["c", -0.15, 0.45, -0.18, 0.63, -0.21, 1.35], ["l", 0, 0.66], ["l", 0.39, -0.18], ["c", 1.83, -0.9, 3.45, -1.95, 4.47, -2.91], ["c", 0.93, -0.9, 1.53, -1.83, 1.74, -2.82], ["c", 0.06, -0.33, 0.06, -0.87, 0.03, -1.32], ["z"], ["m", -0.27, 4.86], ["c", -0.03, -0.21, -0.06, -0.36, -0.06, -0.36], ["c", 0, -0.03, -0.12, 0.09, -0.24, 0.24], ["c", -0.39, 0.48, -0.99, 1.08, -2.16, 2.19], ["c", -1.47, 1.38, -1.92, 1.83, -2.46, 2.49], ["c", -0.66, 0.87, -1.08, 1.74, -1.29, 2.58], ["c", -0.09, 0.42, -0.15, 0.87, -0.15, 1.44], ["l", 0, 0.54], ["l", 0.48, -0.33], ["c", 1.5, -1.02, 2.58, -1.89, 3.51, -2.82], ["c", 1.47, -1.47, 2.25, -2.85, 2.4, -4.26], ["c", 0.03, -0.39, 0.03, -1.17, -0.03, -1.71], ["z"], ["m", -0.66, 7.68], ["c", 0.03, -0.15, 0.03, -0.6, 0.03, -0.99], ["l", 0, -0.72], ["l", -0.27, 0.33], ["l", -1.74, 1.98], ["c", -1.77, 1.92, -2.43, 2.76, -2.97, 3.9], ["c", -0.51, 1.02, -0.72, 1.77, -0.75, 2.91], ["c", 0, 0.63, 0, 0.63, 0.06, 0.6], ["c", 0.03, -0.03, 0.3, -0.27, 0.63, -0.54], ["c", 0.66, -0.6, 1.86, -1.8, 2.31, -2.31], ["c", 1.65, -1.89, 2.52, -3.54, 2.7, -5.16], ["z"]], w: 8.485, h: 32.932 },
    "clefs.C": { d: [["M", 0.06, -14.94], ["l", 0.09, -0.06], ["l", 1.92, 0], ["l", 1.92, 0], ["l", 0.09, 0.06], ["l", 0.06, 0.09], ["l", 0, 14.85], ["l", 0, 14.82], ["l", -0.06, 0.09], ["l", -0.09, 0.06], ["l", -1.92, 0], ["l", -1.92, 0], ["l", -0.09, -0.06], ["l", -0.06, -0.09], ["l", 0, -14.82], ["l", 0, -14.85], ["z"], ["m", 5.37, 0], ["c", 0.09, -0.06, 0.09, -0.06, 0.57, -0.06], ["c", 0.45, 0, 0.45, 0, 0.54, 0.06], ["l", 0.06, 0.09], ["l", 0, 7.14], ["l", 0, 7.11], ["l", 0.09, -0.06], ["c", 0.18, -0.18, 0.72, -0.84, 0.96, -1.2], ["c", 0.3, -0.45, 0.66, -1.17, 0.84, -1.65], ["c", 0.36, -0.9, 0.57, -1.83, 0.6, -2.79], ["c", 0.03, -0.48, 0.03, -0.54, 0.09, -0.63], ["c", 0.12, -0.18, 0.36, -0.21, 0.54, -0.12], ["c", 0.18, 0.09, 0.21, 0.15, 0.24, 0.66], ["c", 0.06, 0.87, 0.21, 1.56, 0.57, 2.22], ["c", 0.51, 1.02, 1.26, 1.68, 2.22, 1.92], ["c", 0.21, 0.06, 0.33, 0.06, 0.78, 0.06], ["c", 0.45, 0, 0.57, 0, 0.84, -0.06], ["c", 0.45, -0.12, 0.81, -0.33, 1.08, -0.6], ["c", 0.57, -0.57, 0.87, -1.41, 0.99, -2.88], ["c", 0.06, -0.54, 0.06, -3, 0, -3.57], ["c", -0.21, -2.58, -0.84, -3.87, -2.16, -4.5], ["c", -0.48, -0.21, -1.17, -0.36, -1.77, -0.36], ["c", -0.69, 0, -1.29, 0.27, -1.5, 0.72], ["c", -0.06, 0.15, -0.06, 0.21, -0.06, 0.42], ["c", 0, 0.24, 0, 0.3, 0.06, 0.45], ["c", 0.12, 0.24, 0.24, 0.39, 0.63, 0.66], ["c", 0.42, 0.3, 0.57, 0.48, 0.69, 0.72], ["c", 0.06, 0.15, 0.06, 0.21, 0.06, 0.48], ["c", 0, 0.39, -0.03, 0.63, -0.21, 0.96], ["c", -0.3, 0.6, -0.87, 1.08, -1.5, 1.26], ["c", -0.27, 0.06, -0.87, 0.06, -1.14, 0], ["c", -0.78, -0.24, -1.44, -0.87, -1.65, -1.68], ["c", -0.12, -0.42, -0.09, -1.17, 0.09, -1.71], ["c", 0.51, -1.65, 1.98, -2.82, 3.81, -3.09], ["c", 0.84, -0.09, 2.46, 0.03, 3.51, 0.27], ["c", 2.22, 0.57, 3.69, 1.8, 4.44, 3.75], ["c", 0.36, 0.93, 0.57, 2.13, 0.57, 3.36], ["c", 0, 1.44, -0.48, 2.73, -1.38, 3.81], ["c", -1.26, 1.5, -3.27, 2.43, -5.28, 2.43], ["c", -0.48, 0, -0.51, 0, -0.75, -0.09], ["c", -0.15, -0.03, -0.48, -0.21, -0.78, -0.36], ["c", -0.69, -0.36, -0.87, -0.42, -1.26, -0.42], ["c", -0.27, 0, -0.3, 0, -0.51, 0.09], ["c", -0.57, 0.3, -0.81, 0.9, -0.81, 2.1], ["c", 0, 1.23, 0.24, 1.83, 0.81, 2.13], ["c", 0.21, 0.09, 0.24, 0.09, 0.51, 0.09], ["c", 0.39, 0, 0.57, -0.06, 1.26, -0.42], ["c", 0.3, -0.15, 0.63, -0.33, 0.78, -0.36], ["c", 0.24, -0.09, 0.27, -0.09, 0.75, -0.09], ["c", 2.01, 0, 4.02, 0.93, 5.28, 2.4], ["c", 0.9, 1.11, 1.38, 2.4, 1.38, 3.84], ["c", 0, 1.5, -0.3, 2.88, -0.84, 3.96], ["c", -0.78, 1.59, -2.19, 2.64, -4.17, 3.15], ["c", -1.05, 0.24, -2.67, 0.36, -3.51, 0.27], ["c", -1.83, -0.27, -3.3, -1.44, -3.81, -3.09], ["c", -0.18, -0.54, -0.21, -1.29, -0.09, -1.74], ["c", 0.15, -0.6, 0.63, -1.2, 1.23, -1.47], ["c", 0.36, -0.18, 0.57, -0.21, 0.99, -0.21], ["c", 0.42, 0, 0.63, 0.03, 1.02, 0.21], ["c", 0.42, 0.21, 0.84, 0.63, 1.05, 1.05], ["c", 0.18, 0.36, 0.21, 0.6, 0.21, 0.96], ["c", 0, 0.3, 0, 0.36, -0.06, 0.51], ["c", -0.12, 0.24, -0.27, 0.42, -0.69, 0.72], ["c", -0.57, 0.42, -0.69, 0.63, -0.69, 1.08], ["c", 0, 0.24, 0, 0.3, 0.06, 0.45], ["c", 0.12, 0.21, 0.3, 0.39, 0.57, 0.54], ["c", 0.42, 0.18, 0.87, 0.21, 1.53, 0.15], ["c", 1.08, -0.15, 1.8, -0.57, 2.34, -1.32], ["c", 0.54, -0.75, 0.84, -1.83, 0.99, -3.51], ["c", 0.06, -0.57, 0.06, -3.03, 0, -3.57], ["c", -0.12, -1.47, -0.42, -2.31, -0.99, -2.88], ["c", -0.27, -0.27, -0.63, -0.48, -1.08, -0.6], ["c", -0.27, -0.06, -0.39, -0.06, -0.84, -0.06], ["c", -0.45, 0, -0.57, 0, -0.78, 0.06], ["c", -1.14, 0.27, -2.01, 1.17, -2.46, 2.49], ["c", -0.21, 0.57, -0.3, 0.99, -0.33, 1.65], ["c", -0.03, 0.51, -0.06, 0.57, -0.24, 0.66], ["c", -0.12, 0.06, -0.27, 0.06, -0.39, 0], ["c", -0.21, -0.09, -0.21, -0.15, -0.24, -0.75], ["c", -0.09, -1.92, -0.78, -3.72, -2.01, -5.19], ["c", -0.18, -0.21, -0.36, -0.42, -0.39, -0.45], ["l", -0.09, -0.06], ["l", 0, 7.11], ["l", 0, 7.14], ["l", -0.06, 0.09], ["c", -0.09, 0.06, -0.09, 0.06, -0.54, 0.06], ["c", -0.48, 0, -0.48, 0, -0.57, -0.06], ["l", -0.06, -0.09], ["l", 0, -14.82], ["l", 0, -14.85], ["z"]], w: 20.31, h: 29.97 },
    "clefs.F": { d: [["M", 6.3, -7.8], ["c", 0.36, -0.03, 1.65, 0, 2.13, 0.03], ["c", 3.6, 0.42, 6.03, 2.1, 6.93, 4.86], ["c", 0.27, 0.84, 0.36, 1.5, 0.36, 2.58], ["c", 0, 0.9, -0.03, 1.35, -0.18, 2.16], ["c", -0.78, 3.78, -3.54, 7.08, -8.37, 9.96], ["c", -1.74, 1.05, -3.87, 2.13, -6.18, 3.12], ["c", -0.39, 0.18, -0.75, 0.33, -0.81, 0.36], ["c", -0.06, 0.03, -0.15, 0.06, -0.18, 0.06], ["c", -0.15, 0, -0.33, -0.18, -0.33, -0.33], ["c", 0, -0.15, 0.06, -0.21, 0.51, -0.48], ["c", 3, -1.77, 5.13, -3.21, 6.84, -4.74], ["c", 0.51, -0.45, 1.59, -1.5, 1.95, -1.95], ["c", 1.89, -2.19, 2.88, -4.32, 3.15, -6.78], ["c", 0.06, -0.42, 0.06, -1.77, 0, -2.19], ["c", -0.24, -2.01, -0.93, -3.63, -2.04, -4.71], ["c", -0.63, -0.63, -1.29, -1.02, -2.07, -1.2], ["c", -1.62, -0.39, -3.36, 0.15, -4.56, 1.44], ["c", -0.54, 0.6, -1.05, 1.47, -1.32, 2.22], ["l", -0.09, 0.21], ["l", 0.24, -0.12], ["c", 0.39, -0.21, 0.63, -0.24, 1.11, -0.24], ["c", 0.3, 0, 0.45, 0, 0.66, 0.06], ["c", 1.92, 0.48, 2.85, 2.55, 1.95, 4.38], ["c", -0.45, 0.99, -1.41, 1.62, -2.46, 1.71], ["c", -1.47, 0.09, -2.91, -0.87, -3.39, -2.25], ["c", -0.18, -0.57, -0.21, -1.32, -0.03, -2.28], ["c", 0.39, -2.25, 1.83, -4.2, 3.81, -5.19], ["c", 0.69, -0.36, 1.59, -0.6, 2.37, -0.69], ["z"], ["m", 11.58, 2.52], ["c", 0.84, -0.21, 1.71, 0.3, 1.89, 1.14], ["c", 0.3, 1.17, -0.72, 2.19, -1.89, 1.89], ["c", -0.99, -0.21, -1.5, -1.32, -1.02, -2.25], ["c", 0.18, -0.39, 0.6, -0.69, 1.02, -0.78], ["z"], ["m", 0, 7.5], ["c", 0.84, -0.21, 1.71, 0.3, 1.89, 1.14], ["c", 0.21, 0.87, -0.3, 1.71, -1.14, 1.89], ["c", -0.87, 0.21, -1.71, -0.3, -1.89, -1.14], ["c", -0.21, -0.84, 0.3, -1.71, 1.14, -1.89], ["z"]], w: 20.153, h: 23.142 },
    "clefs.G": { d: [["M", 9.69, -37.41], ["c", 0.09, -0.09, 0.24, -0.06, 0.36, 0], ["c", 0.12, 0.09, 0.57, 0.6, 0.96, 1.11], ["c", 1.77, 2.34, 3.21, 5.85, 3.57, 8.73], ["c", 0.21, 1.56, 0.03, 3.27, -0.45, 4.86], ["c", -0.69, 2.31, -1.92, 4.47, -4.23, 7.44], ["c", -0.3, 0.39, -0.57, 0.72, -0.6, 0.75], ["c", -0.03, 0.06, 0, 0.15, 0.18, 0.78], ["c", 0.54, 1.68, 1.38, 4.44, 1.68, 5.49], ["l", 0.09, 0.42], ["l", 0.39, 0], ["c", 1.47, 0.09, 2.76, 0.51, 3.96, 1.29], ["c", 1.83, 1.23, 3.06, 3.21, 3.39, 5.52], ["c", 0.09, 0.45, 0.12, 1.29, 0.06, 1.74], ["c", -0.09, 1.02, -0.33, 1.83, -0.75, 2.73], ["c", -0.84, 1.71, -2.28, 3.06, -4.02, 3.72], ["l", -0.33, 0.12], ["l", 0.03, 1.26], ["c", 0, 1.74, -0.06, 3.63, -0.21, 4.62], ["c", -0.45, 3.06, -2.19, 5.49, -4.47, 6.21], ["c", -0.57, 0.18, -0.9, 0.21, -1.59, 0.21], ["c", -0.69, 0, -1.02, -0.03, -1.65, -0.21], ["c", -1.14, -0.27, -2.13, -0.84, -2.94, -1.65], ["c", -0.99, -0.99, -1.56, -2.16, -1.71, -3.54], ["c", -0.09, -0.81, 0.06, -1.53, 0.45, -2.13], ["c", 0.63, -0.99, 1.83, -1.56, 3, -1.53], ["c", 1.5, 0.09, 2.64, 1.32, 2.73, 2.94], ["c", 0.06, 1.47, -0.93, 2.7, -2.37, 2.97], ["c", -0.45, 0.06, -0.84, 0.03, -1.29, -0.09], ["l", -0.21, -0.09], ["l", 0.09, 0.12], ["c", 0.39, 0.54, 0.78, 0.93, 1.32, 1.26], ["c", 1.35, 0.87, 3.06, 1.02, 4.35, 0.36], ["c", 1.44, -0.72, 2.52, -2.28, 2.97, -4.35], ["c", 0.15, -0.66, 0.24, -1.5, 0.3, -3.03], ["c", 0.03, -0.84, 0.03, -2.94, 0, -3], ["c", -0.03, 0, -0.18, 0, -0.36, 0.03], ["c", -0.66, 0.12, -0.99, 0.12, -1.83, 0.12], ["c", -1.05, 0, -1.71, -0.06, -2.61, -0.3], ["c", -4.02, -0.99, -7.11, -4.35, -7.8, -8.46], ["c", -0.12, -0.66, -0.12, -0.99, -0.12, -1.83], ["c", 0, -0.84, 0, -1.14, 0.15, -1.92], ["c", 0.36, -2.28, 1.41, -4.62, 3.3, -7.29], ["l", 2.79, -3.6], ["c", 0.54, -0.66, 0.96, -1.2, 0.96, -1.23], ["c", 0, -0.03, -0.09, -0.33, -0.18, -0.69], ["c", -0.96, -3.21, -1.41, -5.28, -1.59, -7.68], ["c", -0.12, -1.38, -0.15, -3.09, -0.06, -3.96], ["c", 0.33, -2.67, 1.38, -5.07, 3.12, -7.08], ["c", 0.36, -0.42, 0.99, -1.05, 1.17, -1.14], ["z"], ["m", 2.01, 4.71], ["c", -0.15, -0.3, -0.3, -0.54, -0.3, -0.54], ["c", -0.03, 0, -0.18, 0.09, -0.3, 0.21], ["c", -2.4, 1.74, -3.87, 4.2, -4.26, 7.11], ["c", -0.06, 0.54, -0.06, 1.41, -0.03, 1.89], ["c", 0.09, 1.29, 0.48, 3.12, 1.08, 5.22], ["c", 0.15, 0.42, 0.24, 0.78, 0.24, 0.81], ["c", 0, 0.03, 0.84, -1.11, 1.23, -1.68], ["c", 1.89, -2.73, 2.88, -5.07, 3.15, -7.53], ["c", 0.09, -0.57, 0.12, -1.74, 0.06, -2.37], ["c", -0.09, -1.23, -0.27, -1.92, -0.87, -3.12], ["z"], ["m", -2.94, 20.7], ["c", -0.21, -0.72, -0.39, -1.32, -0.42, -1.32], ["c", 0, 0, -1.2, 1.47, -1.86, 2.37], ["c", -2.79, 3.63, -4.02, 6.3, -4.35, 9.3], ["c", -0.03, 0.21, -0.03, 0.69, -0.03, 1.08], ["c", 0, 0.69, 0, 0.75, 0.06, 1.11], ["c", 0.12, 0.54, 0.27, 0.99, 0.51, 1.47], ["c", 0.69, 1.38, 1.83, 2.55, 3.42, 3.42], ["c", 0.96, 0.54, 2.07, 0.9, 3.21, 1.08], ["c", 0.78, 0.12, 2.04, 0.12, 2.94, -0.03], ["c", 0.51, -0.06, 0.45, -0.03, 0.42, -0.3], ["c", -0.24, -3.33, -0.72, -6.33, -1.62, -10.08], ["c", -0.09, -0.39, -0.18, -0.75, -0.18, -0.78], ["c", -0.03, -0.03, -0.42, 0, -0.81, 0.09], ["c", -0.9, 0.18, -1.65, 0.57, -2.22, 1.14], ["c", -0.72, 0.72, -1.08, 1.65, -1.05, 2.64], ["c", 0.06, 0.96, 0.48, 1.83, 1.23, 2.58], ["c", 0.36, 0.36, 0.72, 0.63, 1.17, 0.9], ["c", 0.33, 0.18, 0.36, 0.21, 0.42, 0.33], ["c", 0.18, 0.42, -0.18, 0.9, -0.6, 0.87], ["c", -0.18, -0.03, -0.84, -0.36, -1.26, -0.63], ["c", -0.78, -0.51, -1.38, -1.11, -1.86, -1.83], ["c", -1.77, -2.7, -0.99, -6.42, 1.71, -8.19], ["c", 0.3, -0.21, 0.81, -0.48, 1.17, -0.63], ["c", 0.3, -0.09, 1.02, -0.3, 1.14, -0.3], ["c", 0.06, 0, 0.09, 0, 0.09, -0.03], ["c", 0.03, -0.03, -0.51, -1.92, -1.23, -4.26], ["z"], ["m", 3.78, 7.41], ["c", -0.18, -0.03, -0.36, -0.06, -0.39, -0.06], ["c", -0.03, 0, 0, 0.21, 0.18, 1.02], ["c", 0.75, 3.18, 1.26, 6.3, 1.5, 9.09], ["c", 0.06, 0.72, 0, 0.69, 0.51, 0.42], ["c", 0.78, -0.36, 1.44, -0.96, 1.98, -1.77], ["c", 1.08, -1.62, 1.2, -3.69, 0.3, -5.55], ["c", -0.81, -1.62, -2.31, -2.79, -4.08, -3.15], ["z"]], w: 19.051, h: 57.057 },
    "clefs.perc": { d: [["M", 5.07, -7.44], ["l", 0.09, -0.06], ["l", 1.53, 0], ["l", 1.53, 0], ["l", 0.09, 0.06], ["l", 0.06, 0.09], ["l", 0, 7.35], ["l", 0, 7.32], ["l", -0.06, 0.09], ["l", -0.09, 0.06], ["l", -1.53, 0], ["l", -1.53, 0], ["l", -0.09, -0.06], ["l", -0.06, -0.09], ["l", 0, -7.32], ["l", 0, -7.35], ["z"], ["m", 6.63, 0], ["l", 0.09, -0.06], ["l", 1.53, 0], ["l", 1.53, 0], ["l", 0.09, 0.06], ["l", 0.06, 0.09], ["l", 0, 7.35], ["l", 0, 7.32], ["l", -0.06, 0.09], ["l", -0.09, 0.06], ["l", -1.53, 0], ["l", -1.53, 0], ["l", -0.09, -0.06], ["l", -0.06, -0.09], ["l", 0, -7.32], ["l", 0, -7.35], ["z"]], w: 21, h: 14.97 },
    "tab.big": { d: [["M", 20.16, -21.66], ["c", 0.24, -0.09, 0.66, 0.09, 0.78, 0.36], ["c", 0.09, 0.21, 0.09, 0.24, -0.18, 0.54], ["c", -0.78, 0.81, -1.86, 1.44, -2.94, 1.71], ["c", -0.87, 0.24, -1.71, 0.24, -2.55, 0.03], ["l", -0.06, -0.03], ["l", -0.18, 0.99], ["c", -0.33, 1.98, -0.75, 4.26, -0.96, 5.04], ["c", -0.42, 1.65, -1.26, 3.18, -2.28, 4.14], ["c", -0.57, 0.57, -1.17, 0.9, -1.86, 1.08], ["c", -0.18, 0.06, -0.33, 0.06, -0.66, 0.06], ["c", -0.54, 0, -0.78, -0.03, -1.23, -0.27], ["c", -0.39, -0.18, -0.66, -0.39, -1.38, -0.99], ["c", -0.3, -0.24, -0.66, -0.51, -0.75, -0.57], ["c", -0.21, -0.15, -0.27, -0.24, -0.24, -0.45], ["c", 0.06, -0.27, 0.36, -0.6, 0.6, -0.66], ["c", 0.18, -0.03, 0.33, 0.06, 0.9, 0.57], ["c", 0.48, 0.42, 0.72, 0.57, 0.93, 0.69], ["c", 0.66, 0.33, 1.38, 0.21, 1.95, -0.36], ["c", 0.63, -0.6, 1.05, -1.62, 1.23, -3], ["c", 0.03, -0.18, 0.09, -0.66, 0.09, -1.11], ["c", 0.09, -1.56, 0.33, -3.81, 0.57, -5.49], ["c", 0.06, -0.33, 0.09, -0.63, 0.09, -0.63], ["c", -0.03, -0.03, -0.81, -0.12, -1.02, -0.12], ["c", -0.57, 0, -1.32, 0.12, -1.8, 0.33], ["c", -0.87, 0.3, -1.35, 0.78, -1.5, 1.41], ["c", -0.18, 0.63, 0.09, 1.26, 0.66, 1.65], ["c", 0.12, 0.06, 0.15, 0.12, 0.18, 0.24], ["c", 0.09, 0.27, 0.06, 0.57, -0.09, 0.75], ["c", -0.03, 0.06, -0.12, 0.09, -0.27, 0.15], ["c", -0.72, 0.21, -1.44, 0.15, -2.1, -0.18], ["c", -0.54, -0.27, -0.96, -0.66, -1.2, -1.14], ["c", -0.39, -0.75, -0.33, -1.74, 0.15, -2.52], ["c", 0.27, -0.42, 0.84, -0.93, 1.41, -1.23], ["c", 1.17, -0.57, 2.88, -0.9, 4.8, -0.9], ["c", 0.69, 0, 0.78, 0, 1.08, 0.06], ["c", 0.45, 0.09, 1.11, 0.3, 2.07, 0.6], ["c", 1.47, 0.48, 1.83, 0.57, 2.55, 0.54], ["c", 1.02, -0.06, 2.04, -0.45, 2.94, -1.11], ["c", 0.12, -0.09, 0.24, -0.18, 0.27, -0.18], ["z"], ["m", -5.88, 13.05], ["c", 0.21, -0.03, 0.81, 0, 1.08, 0.06], ["c", 0.48, 0.12, 0.9, 0.42, 0.99, 0.69], ["c", 0.03, 0.09, 0.03, 0.15, 0, 0.27], ["c", 0, 0.09, -0.03, 0.57, -0.06, 1.08], ["c", -0.09, 2.19, -0.24, 5.76, -0.39, 8.28], ["c", -0.06, 1.53, -0.06, 1.77, 0.03, 2.01], ["c", 0.09, 0.18, 0.15, 0.24, 0.3, 0.3], ["c", 0.24, 0.12, 0.54, 0.06, 1.23, -0.27], ["c", 0.57, -0.27, 0.66, -0.3, 0.75, -0.24], ["c", 0.09, 0.06, 0.18, 0.3, 0.18, 0.45], ["c", 0, 0.33, -0.15, 0.51, -0.45, 0.63], ["c", -0.12, 0.03, -0.39, 0.15, -0.6, 0.27], ["c", -1.17, 0.6, -1.38, 0.69, -1.8, 0.72], ["c", -0.45, 0.03, -0.78, -0.09, -1.08, -0.39], ["c", -0.39, -0.42, -0.66, -1.2, -1.02, -3.12], ["c", -0.24, -1.23, -0.36, -2.07, -0.54, -3.75], ["l", 0, -0.18], ["l", -0.36, 0.45], ["c", -0.6, 0.75, -1.32, 1.59, -1.95, 2.25], ["c", -0.15, 0.18, -0.27, 0.3, -0.27, 0.33], ["c", 0, 0, 0.06, 0.09, 0.15, 0.18], ["c", 0.24, 0.33, 0.6, 0.57, 1.05, 0.69], ["c", 0.18, 0.06, 0.3, 0.06, 0.69, 0.06], ["l", 0.48, 0.03], ["l", 0.06, 0.12], ["c", 0.15, 0.27, 0.03, 0.72, -0.21, 0.9], ["c", -0.18, 0.12, -0.93, 0.27, -1.41, 0.27], ["c", -0.84, 0, -1.59, -0.3, -1.98, -0.84], ["l", -0.12, -0.15], ["l", -0.45, 0.42], ["c", -0.99, 0.87, -1.53, 1.32, -2.16, 1.74], ["c", -0.78, 0.51, -1.5, 0.84, -2.1, 0.93], ["c", -0.69, 0.12, -1.2, 0.03, -1.95, -0.42], ["c", -0.21, -0.12, -0.51, -0.27, -0.66, -0.36], ["c", -0.24, -0.12, -0.3, -0.18, -0.33, -0.24], ["c", -0.12, -0.27, 0.15, -0.78, 0.45, -0.93], ["c", 0.24, -0.12, 0.33, -0.09, 0.9, 0.18], ["c", 0.6, 0.3, 0.84, 0.39, 1.2, 0.36], ["c", 0.87, -0.09, 1.77, -0.69, 3.24, -2.31], ["c", 2.67, -2.85, 4.59, -5.94, 5.7, -9.15], ["c", 0.15, -0.45, 0.24, -0.63, 0.42, -0.81], ["c", 0.21, -0.24, 0.6, -0.45, 0.99, -0.51], ["z"], ["m", -3.99, 16.05], ["c", 0.18, 0, 0.69, -0.03, 1.17, 0], ["c", 3.27, 0.03, 5.37, 0.75, 6, 2.07], ["c", 0.45, 0.99, 0.12, 2.4, -0.81, 3.42], ["c", -0.24, 0.27, -0.57, 0.57, -0.84, 0.75], ["c", -0.09, 0.06, -0.18, 0.09, -0.18, 0.12], ["c", 0, 0, 0.18, 0.03, 0.42, 0.09], ["c", 1.23, 0.3, 2.01, 0.81, 2.37, 1.59], ["c", 0.27, 0.54, 0.3, 1.32, 0.09, 2.1], ["c", -0.12, 0.36, -0.45, 1.05, -0.69, 1.35], ["c", -0.87, 1.17, -2.1, 1.92, -3.54, 2.25], ["c", -0.36, 0.06, -0.48, 0.06, -0.96, 0.06], ["c", -0.45, 0, -0.66, 0, -0.84, -0.03], ["c", -0.84, -0.18, -1.47, -0.51, -2.07, -1.11], ["c", -0.33, -0.33, -0.45, -0.51, -0.45, -0.63], ["c", 0, -0.06, 0.03, -0.15, 0.06, -0.24], ["c", 0.18, -0.33, 0.69, -0.6, 0.93, -0.48], ["c", 0.03, 0.03, 0.15, 0.12, 0.27, 0.24], ["c", 0.39, 0.42, 0.99, 0.57, 1.62, 0.45], ["c", 1.05, -0.21, 1.98, -1.02, 2.31, -2.01], ["c", 0.48, -1.53, -0.48, -2.55, -2.58, -2.67], ["c", -0.21, 0, -0.36, -0.03, -0.42, -0.06], ["c", -0.15, -0.09, -0.21, -0.51, -0.06, -0.78], ["c", 0.12, -0.27, 0.24, -0.33, 0.6, -0.36], ["c", 0.57, -0.06, 1.11, -0.42, 1.5, -0.99], ["c", 0.48, -0.72, 0.54, -1.59, 0.18, -2.31], ["c", -0.12, -0.21, -0.45, -0.54, -0.69, -0.69], ["c", -0.33, -0.21, -0.93, -0.45, -1.35, -0.51], ["l", -0.12, -0.03], ["l", -0.06, 0.48], ["c", -0.54, 2.94, -1.14, 6.24, -1.29, 6.75], ["c", -0.33, 1.35, -0.93, 2.61, -1.65, 3.6], ["c", -0.3, 0.36, -0.81, 0.9, -1.14, 1.14], ["c", -0.3, 0.24, -0.84, 0.48, -1.14, 0.57], ["c", -0.33, 0.09, -0.96, 0.09, -1.26, 0.03], ["c", -0.45, -0.12, -0.87, -0.39, -1.53, -0.96], ["c", -0.24, -0.15, -0.51, -0.39, -0.63, -0.48], ["c", -0.3, -0.21, -0.33, -0.33, -0.21, -0.63], ["c", 0.12, -0.18, 0.27, -0.36, 0.42, -0.45], ["c", 0.27, -0.12, 0.36, -0.09, 0.87, 0.33], ["c", 0.78, 0.6, 1.08, 0.75, 1.65, 0.72], ["c", 0.45, -0.03, 0.81, -0.21, 1.17, -0.54], ["c", 0.87, -0.9, 1.38, -2.85, 1.38, -5.37], ["c", 0, -0.6, 0.03, -1.11, 0.12, -2.04], ["c", 0.06, -0.69, 0.24, -2.01, 0.33, -2.58], ["c", 0.06, -0.24, 0.06, -0.42, 0.06, -0.42], ["c", 0, 0, -0.12, 0.03, -0.21, 0.09], ["c", -1.44, 0.57, -2.16, 1.65, -1.74, 2.55], ["c", 0.09, 0.15, 0.18, 0.24, 0.27, 0.33], ["c", 0.24, 0.21, 0.3, 0.27, 0.33, 0.39], ["c", 0.06, 0.24, 0, 0.63, -0.15, 0.78], ["c", -0.09, 0.12, -0.54, 0.21, -0.96, 0.24], ["c", -1.02, 0.03, -2.01, -0.48, -2.43, -1.32], ["c", -0.21, -0.45, -0.27, -0.9, -0.15, -1.44], ["c", 0.06, -0.27, 0.21, -0.66, 0.39, -0.93], ["c", 0.87, -1.29, 3, -2.22, 5.64, -2.43], ["z"]], w: 19.643, h: 43.325 },
    "tab.tiny": { d: [["M", 16.02, -17.25], ["c", 0.12, -0.09, 0.15, -0.09, 0.27, -0.09], ["c", 0.21, 0.03, 0.51, 0.3, 0.51, 0.45], ["c", 0, 0.06, -0.12, 0.18, -0.3, 0.36], ["c", -1.11, 1.08, -2.55, 1.59, -3.84, 1.41], ["c", -0.15, -0.03, -0.33, -0.06, -0.39, -0.09], ["c", -0.06, -0.03, -0.09, -0.03, -0.12, -0.03], ["c", 0, 0, -0.06, 0.42, -0.15, 0.93], ["c", -0.33, 2.01, -0.66, 3.69, -0.84, 4.26], ["c", -0.42, 1.41, -1.23, 2.67, -2.16, 3.33], ["c", -0.27, 0.18, -0.75, 0.42, -0.99, 0.48], ["c", -0.3, 0.09, -0.72, 0.09, -1.02, 0.06], ["c", -0.45, -0.09, -0.84, -0.33, -1.53, -0.9], ["c", -0.21, -0.18, -0.51, -0.39, -0.63, -0.48], ["c", -0.27, -0.21, -0.3, -0.24, -0.3, -0.36], ["c", 0, -0.12, 0.09, -0.36, 0.18, -0.45], ["c", 0.09, -0.09, 0.27, -0.18, 0.36, -0.18], ["c", 0.12, 0, 0.3, 0.12, 0.66, 0.45], ["c", 0.57, 0.51, 0.87, 0.69, 1.23, 0.72], ["c", 0.93, 0.06, 1.68, -0.78, 1.98, -2.37], ["c", 0.09, -0.39, 0.15, -0.75, 0.18, -1.53], ["c", 0.06, -0.99, 0.24, -2.79, 0.42, -4.05], ["c", 0.03, -0.3, 0.06, -0.57, 0.06, -0.6], ["c", 0, -0.06, -0.03, -0.09, -0.15, -0.12], ["c", -0.9, -0.18, -2.13, 0.06, -2.76, 0.57], ["c", -0.36, 0.3, -0.51, 0.6, -0.51, 1.02], ["c", 0, 0.45, 0.15, 0.75, 0.48, 0.99], ["c", 0.06, 0.06, 0.15, 0.18, 0.18, 0.24], ["c", 0.12, 0.24, 0.03, 0.63, -0.15, 0.69], ["c", -0.24, 0.12, -0.6, 0.15, -0.9, 0.15], ["c", -0.36, -0.03, -0.57, -0.09, -0.87, -0.24], ["c", -0.78, -0.36, -1.23, -1.11, -1.2, -1.92], ["c", 0.12, -1.53, 1.74, -2.49, 4.62, -2.7], ["c", 1.2, -0.09, 1.47, -0.03, 3.33, 0.57], ["c", 0.9, 0.3, 1.14, 0.36, 1.56, 0.39], ["c", 0.45, 0, 0.93, -0.06, 1.38, -0.21], ["c", 0.51, -0.18, 0.81, -0.33, 1.41, -0.75], ["z"], ["m", -4.68, 10.38], ["c", 0.39, -0.06, 0.84, 0, 1.2, 0.15], ["c", 0.24, 0.12, 0.36, 0.21, 0.45, 0.36], ["l", 0.09, 0.09], ["l", -0.06, 1.41], ["c", -0.09, 2.19, -0.18, 3.96, -0.27, 5.49], ["c", -0.03, 0.78, -0.06, 1.59, -0.06, 1.86], ["c", 0, 0.42, 0, 0.48, 0.06, 0.57], ["c", 0.06, 0.18, 0.18, 0.24, 0.36, 0.27], ["c", 0.18, 0, 0.39, -0.06, 0.84, -0.27], ["c", 0.45, -0.21, 0.54, -0.24, 0.63, -0.18], ["c", 0.12, 0.12, 0.15, 0.54, 0.03, 0.69], ["c", -0.03, 0.03, -0.15, 0.12, -0.27, 0.18], ["c", -0.15, 0.03, -0.3, 0.12, -0.36, 0.15], ["c", -0.87, 0.45, -1.02, 0.51, -1.26, 0.57], ["c", -0.33, 0.09, -0.6, 0.06, -0.84, -0.06], ["c", -0.42, -0.18, -0.63, -0.6, -0.87, -1.44], ["c", -0.3, -1.23, -0.57, -2.97, -0.66, -4.08], ["c", 0, -0.18, -0.03, -0.3, -0.03, -0.33], ["l", -0.06, 0.06], ["c", -0.18, 0.27, -1.11, 1.38, -1.68, 2.01], ["l", -0.33, 0.33], ["l", 0.06, 0.09], ["c", 0.06, 0.15, 0.27, 0.33, 0.48, 0.42], ["c", 0.27, 0.18, 0.51, 0.24, 0.96, 0.27], ["l", 0.39, 0], ["l", 0.03, 0.12], ["c", 0.12, 0.21, 0.03, 0.57, -0.15, 0.69], ["c", -0.03, 0.03, -0.21, 0.09, -0.36, 0.15], ["c", -0.27, 0.06, -0.39, 0.06, -0.75, 0.06], ["c", -0.48, 0, -0.75, -0.03, -1.08, -0.21], ["c", -0.21, -0.12, -0.51, -0.36, -0.57, -0.48], ["l", -0.03, -0.09], ["l", -0.39, 0.36], ["c", -1.47, 1.35, -2.49, 1.98, -3.42, 2.13], ["c", -0.54, 0.09, -0.96, -0.03, -1.62, -0.39], ["c", -0.21, -0.15, -0.45, -0.27, -0.54, -0.3], ["c", -0.18, -0.09, -0.21, -0.21, -0.12, -0.45], ["c", 0.06, -0.27, 0.33, -0.48, 0.54, -0.48], ["c", 0.03, 0, 0.27, 0.09, 0.48, 0.21], ["c", 0.48, 0.24, 0.69, 0.27, 0.99, 0.27], ["c", 0.6, -0.06, 1.17, -0.42, 2.1, -1.35], ["c", 2.22, -2.22, 4.02, -4.98, 4.95, -7.59], ["c", 0.21, -0.57, 0.3, -0.78, 0.48, -0.93], ["c", 0.15, -0.15, 0.42, -0.27, 0.66, -0.33], ["z"], ["m", -3.06, 12.84], ["c", 0.27, -0.03, 1.68, 0, 2.01, 0.03], ["c", 1.92, 0.18, 3.15, 0.69, 3.63, 1.5], ["c", 0.18, 0.33, 0.24, 0.51, 0.21, 0.93], ["c", 0, 0.45, -0.06, 0.72, -0.24, 1.11], ["c", -0.24, 0.51, -0.69, 1.02, -1.17, 1.35], ["c", -0.21, 0.15, -0.21, 0.15, -0.12, 0.18], ["c", 0.72, 0.15, 1.11, 0.3, 1.5, 0.57], ["c", 0.39, 0.24, 0.63, 0.57, 0.75, 0.96], ["c", 0.09, 0.3, 0.09, 0.96, 0, 1.29], ["c", -0.15, 0.57, -0.39, 1.05, -0.78, 1.5], ["c", -0.66, 0.75, -1.62, 1.32, -2.61, 1.53], ["c", -0.27, 0.06, -0.42, 0.06, -0.84, 0.06], ["c", -0.48, 0, -0.57, 0, -0.81, -0.06], ["c", -0.6, -0.18, -1.05, -0.42, -1.47, -0.81], ["c", -0.36, -0.39, -0.42, -0.51, -0.3, -0.75], ["c", 0.12, -0.21, 0.39, -0.39, 0.6, -0.39], ["c", 0.09, 0, 0.15, 0.03, 0.33, 0.18], ["c", 0.12, 0.12, 0.27, 0.24, 0.36, 0.27], ["c", 0.96, 0.48, 2.46, -0.33, 2.82, -1.5], ["c", 0.24, -0.81, -0.03, -1.44, -0.69, -1.77], ["c", -0.39, -0.21, -1.02, -0.33, -1.53, -0.33], ["c", -0.18, 0, -0.21, 0, -0.27, -0.09], ["c", -0.06, -0.09, -0.06, -0.3, -0.03, -0.48], ["c", 0.06, -0.18, 0.18, -0.36, 0.33, -0.36], ["c", 0.39, -0.06, 0.51, -0.09, 0.72, -0.18], ["c", 0.69, -0.36, 1.11, -1.23, 0.99, -2.01], ["c", -0.09, -0.51, -0.42, -0.9, -0.93, -1.17], ["c", -0.24, -0.12, -0.6, -0.27, -0.87, -0.3], ["c", -0.09, -0.03, -0.09, -0.03, -0.12, 0.12], ["c", 0, 0.09, -0.21, 1.11, -0.42, 2.25], ["c", -0.66, 3.75, -0.72, 3.99, -1.26, 5.07], ["c", -0.9, 1.89, -2.25, 2.85, -3.48, 2.61], ["c", -0.39, -0.09, -0.69, -0.27, -1.38, -0.84], ["c", -0.63, -0.51, -0.63, -0.48, -0.63, -0.6], ["c", 0, -0.18, 0.18, -0.48, 0.39, -0.57], ["c", 0.21, -0.12, 0.3, -0.09, 0.81, 0.33], ["c", 0.15, 0.15, 0.39, 0.3, 0.54, 0.36], ["c", 0.18, 0.12, 0.27, 0.12, 0.48, 0.15], ["c", 0.99, 0.06, 1.71, -0.78, 2.04, -2.46], ["c", 0.12, -0.66, 0.18, -1.14, 0.21, -2.22], ["c", 0.03, -1.23, 0.12, -2.25, 0.36, -3.63], ["c", 0.03, -0.24, 0.06, -0.45, 0.06, -0.48], ["c", -0.06, -0.03, -0.66, 0.27, -0.9, 0.42], ["c", -0.06, 0.06, -0.21, 0.18, -0.33, 0.3], ["c", -0.57, 0.57, -0.6, 1.35, -0.06, 1.74], ["c", 0.18, 0.12, 0.24, 0.24, 0.21, 0.51], ["c", -0.03, 0.3, -0.15, 0.42, -0.57, 0.48], ["c", -1.11, 0.24, -2.22, -0.42, -2.43, -1.38], ["c", -0.09, -0.45, 0.03, -1.02, 0.3, -1.47], ["c", 0.18, -0.24, 0.6, -0.63, 0.9, -0.84], ["c", 0.9, -0.6, 2.28, -1.02, 3.69, -1.11], ["z"]], w: 15.709, h: 34.656 },
    "timesig.common": { d: [["M", 6.66, -7.83], ["c", 0.72, -0.06, 1.41, -0.03, 1.98, 0.09], ["c", 1.2, 0.27, 2.34, 0.96, 3.09, 1.92], ["c", 0.63, 0.81, 1.08, 1.86, 1.14, 2.73], ["c", 0.06, 1.02, -0.51, 1.92, -1.44, 2.22], ["c", -0.24, 0.09, -0.3, 0.09, -0.63, 0.09], ["c", -0.33, 0, -0.42, 0, -0.63, -0.06], ["c", -0.66, -0.24, -1.14, -0.63, -1.41, -1.2], ["c", -0.15, -0.3, -0.21, -0.51, -0.24, -0.9], ["c", -0.06, -1.08, 0.57, -2.04, 1.56, -2.37], ["c", 0.18, -0.06, 0.27, -0.06, 0.63, -0.06], ["l", 0.45, 0], ["c", 0.06, 0.03, 0.09, 0.03, 0.09, 0], ["c", 0, 0, -0.09, -0.12, -0.24, -0.27], ["c", -1.02, -1.11, -2.55, -1.68, -4.08, -1.5], ["c", -1.29, 0.15, -2.04, 0.69, -2.4, 1.74], ["c", -0.36, 0.93, -0.42, 1.89, -0.42, 5.37], ["c", 0, 2.97, 0.06, 3.96, 0.24, 4.77], ["c", 0.24, 1.08, 0.63, 1.68, 1.41, 2.07], ["c", 0.81, 0.39, 2.16, 0.45, 3.18, 0.09], ["c", 1.29, -0.45, 2.37, -1.53, 3.03, -2.97], ["c", 0.15, -0.33, 0.33, -0.87, 0.39, -1.17], ["c", 0.09, -0.24, 0.15, -0.36, 0.3, -0.39], ["c", 0.21, -0.03, 0.42, 0.15, 0.39, 0.36], ["c", -0.06, 0.39, -0.42, 1.38, -0.69, 1.89], ["c", -0.96, 1.8, -2.49, 2.94, -4.23, 3.18], ["c", -0.99, 0.12, -2.58, -0.06, -3.63, -0.45], ["c", -0.96, -0.36, -1.71, -0.84, -2.4, -1.5], ["c", -1.11, -1.11, -1.8, -2.61, -2.04, -4.56], ["c", -0.06, -0.6, -0.06, -2.01, 0, -2.61], ["c", 0.24, -1.95, 0.9, -3.45, 2.01, -4.56], ["c", 0.69, -0.66, 1.44, -1.11, 2.37, -1.47], ["c", 0.63, -0.24, 1.47, -0.42, 2.22, -0.48], ["z"]], w: 13.038, h: 15.689 },
    "timesig.cut": { d: [["M", 6.24, -10.44], ["c", 0.09, -0.06, 0.09, -0.06, 0.48, -0.06], ["c", 0.36, 0, 0.36, 0, 0.45, 0.06], ["l", 0.06, 0.09], ["l", 0, 1.23], ["l", 0, 1.26], ["l", 0.27, 0], ["c", 1.26, 0, 2.49, 0.45, 3.48, 1.29], ["c", 1.05, 0.87, 1.8, 2.28, 1.89, 3.48], ["c", 0.06, 1.02, -0.51, 1.92, -1.44, 2.22], ["c", -0.24, 0.09, -0.3, 0.09, -0.63, 0.09], ["c", -0.33, 0, -0.42, 0, -0.63, -0.06], ["c", -0.66, -0.24, -1.14, -0.63, -1.41, -1.2], ["c", -0.15, -0.3, -0.21, -0.51, -0.24, -0.9], ["c", -0.06, -1.08, 0.57, -2.04, 1.56, -2.37], ["c", 0.18, -0.06, 0.27, -0.06, 0.63, -0.06], ["l", 0.45, 0], ["c", 0.06, 0.03, 0.09, 0.03, 0.09, 0], ["c", 0, -0.03, -0.45, -0.51, -0.66, -0.69], ["c", -0.87, -0.69, -1.83, -1.05, -2.94, -1.11], ["l", -0.42, 0], ["l", 0, 7.17], ["l", 0, 7.14], ["l", 0.42, 0], ["c", 0.69, -0.03, 1.23, -0.18, 1.86, -0.51], ["c", 1.05, -0.51, 1.89, -1.47, 2.46, -2.7], ["c", 0.15, -0.33, 0.33, -0.87, 0.39, -1.17], ["c", 0.09, -0.24, 0.15, -0.36, 0.3, -0.39], ["c", 0.21, -0.03, 0.42, 0.15, 0.39, 0.36], ["c", -0.03, 0.24, -0.21, 0.78, -0.39, 1.2], ["c", -0.96, 2.37, -2.94, 3.9, -5.13, 3.9], ["l", -0.3, 0], ["l", 0, 1.26], ["l", 0, 1.23], ["l", -0.06, 0.09], ["c", -0.09, 0.06, -0.09, 0.06, -0.45, 0.06], ["c", -0.39, 0, -0.39, 0, -0.48, -0.06], ["l", -0.06, -0.09], ["l", 0, -1.29], ["l", 0, -1.29], ["l", -0.21, -0.03], ["c", -1.23, -0.21, -2.31, -0.63, -3.21, -1.29], ["c", -0.15, -0.09, -0.45, -0.36, -0.66, -0.57], ["c", -1.11, -1.11, -1.8, -2.61, -2.04, -4.56], ["c", -0.06, -0.6, -0.06, -2.01, 0, -2.61], ["c", 0.24, -1.95, 0.93, -3.45, 2.04, -4.59], ["c", 0.42, -0.39, 0.78, -0.66, 1.26, -0.93], ["c", 0.75, -0.45, 1.65, -0.75, 2.61, -0.9], ["l", 0.21, -0.03], ["l", 0, -1.29], ["l", 0, -1.29], ["z"], ["m", -0.06, 10.44], ["c", 0, -5.58, 0, -6.99, -0.03, -6.99], ["c", -0.15, 0, -0.63, 0.27, -0.87, 0.45], ["c", -0.45, 0.36, -0.75, 0.93, -0.93, 1.77], ["c", -0.18, 0.81, -0.24, 1.8, -0.24, 4.74], ["c", 0, 2.97, 0.06, 3.96, 0.24, 4.77], ["c", 0.24, 1.08, 0.66, 1.68, 1.41, 2.07], ["c", 0.12, 0.06, 0.3, 0.12, 0.33, 0.15], ["l", 0.09, 0], ["l", 0, -6.96], ["z"]], w: 13.038, h: 20.97 },
    "timesig.imperfectum": { d: [["M", 13, -5], ["a", 8, 8, 0, 1, 0, 0, 10]], w: 13.038, h: 20.97 },
    "timesig.imperfectum2": { d: [["M", 13, -5], ["a", 8, 8, 0, 1, 0, 0, 10]], w: 13.038, h: 20.97 },
    "timesig.perfectum": { d: [["M", 13, -5], ["a", 8, 8, 0, 1, 0, 0, 10]], w: 13.038, h: 20.97 },
    "timesig.perfectum2": { d: [["M", 13, -5], ["a", 8, 8, 0, 1, 0, 0, 10]], w: 13.038, h: 20.97 },
    f: { d: [["M", 9.93, -14.28], ["c", 1.53, -0.18, 2.88, 0.45, 3.12, 1.5], ["c", 0.12, 0.51, 0, 1.32, -0.27, 1.86], ["c", -0.15, 0.3, -0.42, 0.57, -0.63, 0.69], ["c", -0.69, 0.36, -1.56, 0.03, -1.83, -0.69], ["c", -0.09, -0.24, -0.09, -0.69, 0, -0.87], ["c", 0.06, -0.12, 0.21, -0.24, 0.45, -0.42], ["c", 0.42, -0.24, 0.57, -0.45, 0.6, -0.72], ["c", 0.03, -0.33, -0.09, -0.39, -0.63, -0.42], ["c", -0.3, 0, -0.45, 0, -0.6, 0.03], ["c", -0.81, 0.21, -1.35, 0.93, -1.74, 2.46], ["c", -0.06, 0.27, -0.48, 2.25, -0.48, 2.31], ["c", 0, 0.03, 0.39, 0.03, 0.9, 0.03], ["c", 0.72, 0, 0.9, 0, 0.99, 0.06], ["c", 0.42, 0.15, 0.45, 0.72, 0.03, 0.9], ["c", -0.12, 0.06, -0.24, 0.06, -1.17, 0.06], ["l", -1.05, 0], ["l", -0.78, 2.55], ["c", -0.45, 1.41, -0.87, 2.79, -0.96, 3.06], ["c", -0.87, 2.37, -2.37, 4.74, -3.78, 5.91], ["c", -1.05, 0.9, -2.04, 1.23, -3.09, 1.08], ["c", -1.11, -0.18, -1.89, -0.78, -2.04, -1.59], ["c", -0.12, -0.66, 0.15, -1.71, 0.54, -2.19], ["c", 0.69, -0.75, 1.86, -0.54, 2.22, 0.39], ["c", 0.06, 0.15, 0.09, 0.27, 0.09, 0.48], ["c", 0, 0.24, -0.03, 0.27, -0.12, 0.42], ["c", -0.03, 0.09, -0.15, 0.18, -0.27, 0.27], ["c", -0.09, 0.06, -0.27, 0.21, -0.36, 0.27], ["c", -0.24, 0.18, -0.36, 0.36, -0.39, 0.6], ["c", -0.03, 0.33, 0.09, 0.39, 0.63, 0.42], ["c", 0.42, 0, 0.63, -0.03, 0.9, -0.15], ["c", 0.6, -0.3, 0.96, -0.96, 1.38, -2.64], ["c", 0.09, -0.42, 0.63, -2.55, 1.17, -4.77], ["l", 1.02, -4.08], ["c", 0, -0.03, -0.36, -0.03, -0.81, -0.03], ["c", -0.72, 0, -0.81, 0, -0.93, -0.06], ["c", -0.42, -0.18, -0.39, -0.75, 0.03, -0.9], ["c", 0.09, -0.06, 0.27, -0.06, 1.05, -0.06], ["l", 0.96, 0], ["l", 0, -0.09], ["c", 0.06, -0.18, 0.3, -0.72, 0.51, -1.17], ["c", 1.2, -2.46, 3.3, -4.23, 5.34, -4.5], ["z"]], w: 16.155, h: 19.445 },
    m: { d: [["M", 2.79, -8.91], ["c", 0.09, 0, 0.3, -0.03, 0.45, -0.03], ["c", 0.24, 0.03, 0.3, 0.03, 0.45, 0.12], ["c", 0.36, 0.15, 0.63, 0.54, 0.75, 1.02], ["l", 0.03, 0.21], ["l", 0.33, -0.3], ["c", 0.69, -0.69, 1.38, -1.02, 2.07, -1.02], ["c", 0.27, 0, 0.33, 0, 0.48, 0.06], ["c", 0.21, 0.09, 0.48, 0.36, 0.63, 0.6], ["c", 0.03, 0.09, 0.12, 0.27, 0.18, 0.42], ["c", 0.03, 0.15, 0.09, 0.27, 0.12, 0.27], ["c", 0, 0, 0.09, -0.09, 0.18, -0.21], ["c", 0.33, -0.39, 0.87, -0.81, 1.29, -0.99], ["c", 0.78, -0.33, 1.47, -0.21, 2.01, 0.33], ["c", 0.3, 0.33, 0.48, 0.69, 0.6, 1.14], ["c", 0.09, 0.42, 0.06, 0.54, -0.54, 3.06], ["c", -0.33, 1.29, -0.57, 2.4, -0.57, 2.43], ["c", 0, 0.12, 0.09, 0.21, 0.21, 0.21], ["c", 0.24, 0, 0.75, -0.3, 1.2, -0.72], ["c", 0.45, -0.39, 0.6, -0.45, 0.78, -0.27], ["c", 0.18, 0.18, 0.09, 0.36, -0.45, 0.87], ["c", -1.05, 0.96, -1.83, 1.47, -2.58, 1.71], ["c", -0.93, 0.33, -1.53, 0.21, -1.8, -0.33], ["c", -0.06, -0.15, -0.06, -0.21, -0.06, -0.45], ["c", 0, -0.24, 0.03, -0.48, 0.6, -2.82], ["c", 0.42, -1.71, 0.6, -2.64, 0.63, -2.79], ["c", 0.03, -0.57, -0.3, -0.75, -0.84, -0.48], ["c", -0.24, 0.12, -0.54, 0.39, -0.66, 0.63], ["c", -0.03, 0.09, -0.42, 1.38, -0.9, 3], ["c", -0.9, 3.15, -0.84, 3, -1.14, 3.15], ["l", -0.15, 0.09], ["l", -0.78, 0], ["c", -0.6, 0, -0.78, 0, -0.84, -0.06], ["c", -0.09, -0.03, -0.18, -0.18, -0.18, -0.27], ["c", 0, -0.03, 0.36, -1.38, 0.84, -2.97], ["c", 0.57, -2.04, 0.81, -2.97, 0.84, -3.12], ["c", 0.03, -0.54, -0.3, -0.72, -0.84, -0.45], ["c", -0.24, 0.12, -0.57, 0.42, -0.66, 0.63], ["c", -0.06, 0.09, -0.51, 1.44, -1.05, 2.97], ["c", -0.51, 1.56, -0.99, 2.85, -0.99, 2.91], ["c", -0.06, 0.12, -0.21, 0.24, -0.36, 0.3], ["c", -0.12, 0.06, -0.21, 0.06, -0.9, 0.06], ["c", -0.6, 0, -0.78, 0, -0.84, -0.06], ["c", -0.09, -0.03, -0.18, -0.18, -0.18, -0.27], ["c", 0, -0.03, 0.45, -1.38, 0.99, -2.97], ["c", 1.05, -3.18, 1.05, -3.18, 0.93, -3.45], ["c", -0.12, -0.27, -0.39, -0.3, -0.72, -0.15], ["c", -0.54, 0.27, -1.14, 1.17, -1.56, 2.4], ["c", -0.06, 0.15, -0.15, 0.3, -0.18, 0.36], ["c", -0.21, 0.21, -0.57, 0.27, -0.72, 0.09], ["c", -0.09, -0.09, -0.06, -0.21, 0.06, -0.63], ["c", 0.48, -1.26, 1.26, -2.46, 2.01, -3.21], ["c", 0.57, -0.54, 1.2, -0.87, 1.83, -1.02], ["z"]], w: 14.687, h: 9.126 },
    p: { d: [["M", 1.92, -8.7], ["c", 0.27, -0.09, 0.81, -0.06, 1.11, 0.03], ["c", 0.54, 0.18, 0.93, 0.51, 1.17, 0.99], ["c", 0.09, 0.15, 0.15, 0.33, 0.18, 0.36], ["l", 0, 0.12], ["l", 0.3, -0.27], ["c", 0.66, -0.6, 1.35, -1.02, 2.13, -1.2], ["c", 0.21, -0.06, 0.33, -0.06, 0.78, -0.06], ["c", 0.45, 0, 0.51, 0, 0.84, 0.09], ["c", 1.29, 0.33, 2.07, 1.32, 2.25, 2.79], ["c", 0.09, 0.81, -0.09, 2.01, -0.45, 2.79], ["c", -0.54, 1.26, -1.86, 2.55, -3.18, 3.03], ["c", -0.45, 0.18, -0.81, 0.24, -1.29, 0.24], ["c", -0.69, -0.03, -1.35, -0.18, -1.86, -0.45], ["c", -0.3, -0.15, -0.51, -0.18, -0.69, -0.09], ["c", -0.09, 0.03, -0.18, 0.09, -0.18, 0.12], ["c", -0.09, 0.12, -1.05, 2.94, -1.05, 3.06], ["c", 0, 0.24, 0.18, 0.48, 0.51, 0.63], ["c", 0.18, 0.06, 0.54, 0.15, 0.75, 0.15], ["c", 0.21, 0, 0.36, 0.06, 0.42, 0.18], ["c", 0.12, 0.18, 0.06, 0.42, -0.12, 0.54], ["c", -0.09, 0.03, -0.15, 0.03, -0.78, 0], ["c", -1.98, -0.15, -3.81, -0.15, -5.79, 0], ["c", -0.63, 0.03, -0.69, 0.03, -0.78, 0], ["c", -0.24, -0.15, -0.24, -0.57, 0.03, -0.66], ["c", 0.06, -0.03, 0.48, -0.09, 0.99, -0.12], ["c", 0.87, -0.06, 1.11, -0.09, 1.35, -0.21], ["c", 0.18, -0.06, 0.33, -0.18, 0.39, -0.3], ["c", 0.06, -0.12, 3.24, -9.42, 3.27, -9.6], ["c", 0.06, -0.33, 0.03, -0.57, -0.15, -0.69], ["c", -0.09, -0.06, -0.12, -0.06, -0.3, -0.06], ["c", -0.69, 0.06, -1.53, 1.02, -2.28, 2.61], ["c", -0.09, 0.21, -0.21, 0.45, -0.27, 0.51], ["c", -0.09, 0.12, -0.33, 0.24, -0.48, 0.24], ["c", -0.18, 0, -0.36, -0.15, -0.36, -0.3], ["c", 0, -0.24, 0.78, -1.83, 1.26, -2.55], ["c", 0.72, -1.11, 1.47, -1.74, 2.28, -1.92], ["z"], ["m", 5.37, 1.47], ["c", -0.27, -0.12, -0.75, -0.03, -1.14, 0.21], ["c", -0.75, 0.48, -1.47, 1.68, -1.89, 3.15], ["c", -0.45, 1.47, -0.42, 2.34, 0, 2.7], ["c", 0.45, 0.39, 1.26, 0.21, 1.83, -0.36], ["c", 0.51, -0.51, 0.99, -1.68, 1.38, -3.27], ["c", 0.3, -1.17, 0.33, -1.74, 0.15, -2.13], ["c", -0.09, -0.15, -0.15, -0.21, -0.33, -0.3], ["z"]], w: 14.689, h: 13.127 },
    r: { d: [["M", 6.33, -9.12], ["c", 0.27, -0.03, 0.93, 0, 1.2, 0.06], ["c", 0.84, 0.21, 1.23, 0.81, 1.02, 1.53], ["c", -0.24, 0.75, -0.9, 1.17, -1.56, 0.96], ["c", -0.33, -0.09, -0.51, -0.3, -0.66, -0.75], ["c", -0.03, -0.12, -0.09, -0.24, -0.12, -0.3], ["c", -0.09, -0.15, -0.3, -0.24, -0.48, -0.24], ["c", -0.57, 0, -1.38, 0.54, -1.65, 1.08], ["c", -0.06, 0.15, -0.33, 1.17, -0.9, 3.27], ["c", -0.57, 2.31, -0.81, 3.12, -0.87, 3.21], ["c", -0.03, 0.06, -0.12, 0.15, -0.18, 0.21], ["l", -0.12, 0.06], ["l", -0.81, 0.03], ["c", -0.69, 0, -0.81, 0, -0.9, -0.03], ["c", -0.09, -0.06, -0.18, -0.21, -0.18, -0.3], ["c", 0, -0.06, 0.39, -1.62, 0.9, -3.51], ["c", 0.84, -3.24, 0.87, -3.45, 0.87, -3.72], ["c", 0, -0.21, 0, -0.27, -0.03, -0.36], ["c", -0.12, -0.15, -0.21, -0.24, -0.42, -0.24], ["c", -0.24, 0, -0.45, 0.15, -0.78, 0.42], ["c", -0.33, 0.36, -0.45, 0.54, -0.72, 1.14], ["c", -0.03, 0.12, -0.21, 0.24, -0.36, 0.27], ["c", -0.12, 0, -0.15, 0, -0.24, -0.06], ["c", -0.18, -0.12, -0.18, -0.21, -0.06, -0.54], ["c", 0.21, -0.57, 0.42, -0.93, 0.78, -1.32], ["c", 0.54, -0.51, 1.2, -0.81, 1.95, -0.87], ["c", 0.81, -0.03, 1.53, 0.3, 1.92, 0.87], ["l", 0.12, 0.18], ["l", 0.09, -0.09], ["c", 0.57, -0.45, 1.41, -0.84, 2.19, -0.96], ["z"]], w: 9.41, h: 9.132 },
    s: { d: [["M", 4.47, -8.73], ["c", 0.09, 0, 0.36, -0.03, 0.57, -0.03], ["c", 0.75, 0.03, 1.29, 0.24, 1.71, 0.63], ["c", 0.51, 0.54, 0.66, 1.26, 0.36, 1.83], ["c", -0.24, 0.42, -0.63, 0.57, -1.11, 0.42], ["c", -0.33, -0.09, -0.6, -0.36, -0.6, -0.57], ["c", 0, -0.03, 0.06, -0.21, 0.15, -0.39], ["c", 0.12, -0.21, 0.15, -0.33, 0.18, -0.48], ["c", 0, -0.24, -0.06, -0.48, -0.15, -0.6], ["c", -0.15, -0.21, -0.42, -0.24, -0.75, -0.15], ["c", -0.27, 0.06, -0.48, 0.18, -0.69, 0.36], ["c", -0.39, 0.39, -0.51, 0.96, -0.33, 1.38], ["c", 0.09, 0.21, 0.42, 0.51, 0.78, 0.72], ["c", 1.11, 0.69, 1.59, 1.11, 1.89, 1.68], ["c", 0.21, 0.39, 0.24, 0.78, 0.15, 1.29], ["c", -0.18, 1.2, -1.17, 2.16, -2.52, 2.52], ["c", -1.02, 0.24, -1.95, 0.12, -2.7, -0.42], ["c", -0.72, -0.51, -0.99, -1.47, -0.6, -2.19], ["c", 0.24, -0.48, 0.72, -0.63, 1.17, -0.42], ["c", 0.33, 0.18, 0.54, 0.45, 0.57, 0.81], ["c", 0, 0.21, -0.03, 0.3, -0.33, 0.51], ["c", -0.33, 0.24, -0.39, 0.42, -0.27, 0.69], ["c", 0.06, 0.15, 0.21, 0.27, 0.45, 0.33], ["c", 0.3, 0.09, 0.87, 0.09, 1.2, 0], ["c", 0.75, -0.21, 1.23, -0.72, 1.29, -1.35], ["c", 0.03, -0.42, -0.15, -0.81, -0.54, -1.2], ["c", -0.24, -0.24, -0.48, -0.42, -1.41, -1.02], ["c", -0.69, -0.42, -1.05, -0.93, -1.05, -1.47], ["c", 0, -0.39, 0.12, -0.87, 0.3, -1.23], ["c", 0.27, -0.57, 0.78, -1.05, 1.38, -1.35], ["c", 0.24, -0.12, 0.63, -0.27, 0.9, -0.3], ["z"]], w: 6.632, h: 8.758 },
    z: { d: [["M", 2.64, -7.95], ["c", 0.36, -0.09, 0.81, -0.03, 1.71, 0.27], ["c", 0.78, 0.21, 0.96, 0.27, 1.74, 0.3], ["c", 0.87, 0.06, 1.02, 0.03, 1.38, -0.21], ["c", 0.21, -0.15, 0.33, -0.15, 0.48, -0.06], ["c", 0.15, 0.09, 0.21, 0.3, 0.15, 0.45], ["c", -0.03, 0.06, -1.26, 1.26, -2.76, 2.67], ["l", -2.73, 2.55], ["l", 0.54, 0.03], ["c", 0.54, 0.03, 0.72, 0.03, 2.01, 0.15], ["c", 0.36, 0.03, 0.9, 0.06, 1.2, 0.09], ["c", 0.66, 0, 0.81, -0.03, 1.02, -0.24], ["c", 0.3, -0.3, 0.39, -0.72, 0.27, -1.23], ["c", -0.06, -0.27, -0.06, -0.27, -0.03, -0.39], ["c", 0.15, -0.3, 0.54, -0.27, 0.69, 0.03], ["c", 0.15, 0.33, 0.27, 1.02, 0.27, 1.5], ["c", 0, 1.47, -1.11, 2.7, -2.52, 2.79], ["c", -0.57, 0.03, -1.02, -0.09, -2.01, -0.51], ["c", -1.02, -0.42, -1.23, -0.48, -2.13, -0.54], ["c", -0.81, -0.06, -0.96, -0.03, -1.26, 0.18], ["c", -0.12, 0.06, -0.24, 0.12, -0.27, 0.12], ["c", -0.27, 0, -0.45, -0.3, -0.36, -0.51], ["c", 0.03, -0.06, 1.32, -1.32, 2.91, -2.79], ["l", 2.88, -2.73], ["c", -0.03, 0, -0.21, 0.03, -0.42, 0.06], ["c", -0.21, 0.03, -0.78, 0.09, -1.23, 0.12], ["c", -1.11, 0.12, -1.23, 0.15, -1.95, 0.27], ["c", -0.72, 0.15, -1.17, 0.18, -1.29, 0.09], ["c", -0.27, -0.18, -0.21, -0.75, 0.12, -1.26], ["c", 0.39, -0.6, 0.93, -1.02, 1.59, -1.2], ["z"]], w: 8.573, h: 8.743 },
    "+": { d: [["M", 3.48, -9.3], ["c", 0.18, -0.09, 0.36, -0.09, 0.54, 0], ["c", 0.18, 0.09, 0.24, 0.15, 0.33, 0.3], ["l", 0.06, 0.15], ["l", 0, 1.29], ["l", 0, 1.29], ["l", 1.29, 0], ["c", 1.23, 0, 1.29, 0, 1.41, 0.06], ["c", 0.06, 0.03, 0.15, 0.09, 0.18, 0.12], ["c", 0.12, 0.09, 0.21, 0.33, 0.21, 0.48], ["c", 0, 0.15, -0.09, 0.39, -0.21, 0.48], ["c", -0.03, 0.03, -0.12, 0.09, -0.18, 0.12], ["c", -0.12, 0.06, -0.18, 0.06, -1.41, 0.06], ["l", -1.29, 0], ["l", 0, 1.29], ["c", 0, 1.23, 0, 1.29, -0.06, 1.41], ["c", -0.09, 0.18, -0.15, 0.24, -0.3, 0.33], ["c", -0.21, 0.09, -0.39, 0.09, -0.57, 0], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["c", -0.06, -0.12, -0.06, -0.18, -0.06, -1.41], ["l", 0, -1.29], ["l", -1.29, 0], ["c", -1.23, 0, -1.29, 0, -1.41, -0.06], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["c", -0.09, -0.18, -0.09, -0.36, 0, -0.54], ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ["l", 0.15, -0.06], ["l", 1.26, 0], ["l", 1.29, 0], ["l", 0, -1.29], ["c", 0, -1.23, 0, -1.29, 0.06, -1.41], ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ["z"]], w: 7.507, h: 7.515 },
    ",": { d: [["M", 1.85, -3.36], ["c", 0.57, -0.15, 1.17, 0.03, 1.59, 0.45], ["c", 0.45, 0.45, 0.6, 0.96, 0.51, 1.89], ["c", -0.09, 1.23, -0.42, 2.46, -0.99, 3.93], ["c", -0.3, 0.72, -0.72, 1.62, -0.78, 1.68], ["c", -0.18, 0.21, -0.51, 0.18, -0.66, -0.06], ["c", -0.03, -0.06, -0.06, -0.15, -0.06, -0.18], ["c", 0, -0.06, 0.12, -0.33, 0.24, -0.63], ["c", 0.84, -1.8, 1.02, -2.61, 0.69, -3.24], ["c", -0.12, -0.24, -0.27, -0.36, -0.75, -0.6], ["c", -0.36, -0.15, -0.42, -0.21, -0.6, -0.39], ["c", -0.69, -0.69, -0.69, -1.71, 0, -2.4], ["c", 0.21, -0.21, 0.51, -0.39, 0.81, -0.45], ["z"]], w: 3.452, h: 8.143 },
    "-": { d: [["M", 0.18, -5.34], ["c", 0.09, -0.06, 0.15, -0.06, 2.31, -0.06], ["c", 2.46, 0, 2.37, 0, 2.46, 0.21], ["c", 0.12, 0.21, 0.03, 0.42, -0.15, 0.54], ["c", -0.09, 0.06, -0.15, 0.06, -2.28, 0.06], ["c", -2.16, 0, -2.22, 0, -2.31, -0.06], ["c", -0.27, -0.15, -0.27, -0.54, -0.03, -0.69], ["z"]], w: 5.001, h: 0.81 },
    ".": { d: [["M", 1.32, -3.36], ["c", 1.05, -0.27, 2.1, 0.57, 2.1, 1.65], ["c", 0, 1.08, -1.05, 1.92, -2.1, 1.65], ["c", -0.9, -0.21, -1.5, -1.14, -1.26, -2.04], ["c", 0.12, -0.63, 0.63, -1.11, 1.26, -1.26], ["z"]], w: 3.413, h: 3.402 },
    "scripts.wedge": { d: [["M", -3.66, -7.44], ["c", 0.06, -0.09, 0, -0.09, 0.81, 0.03], ["c", 1.86, 0.3, 3.84, 0.3, 5.73, 0], ["c", 0.78, -0.12, 0.72, -0.12, 0.78, -0.03], ["c", 0.15, 0.15, 0.12, 0.24, -0.24, 0.6], ["c", -0.93, 0.93, -1.98, 2.76, -2.67, 4.62], ["c", -0.3, 0.78, -0.51, 1.71, -0.51, 2.13], ["c", 0, 0.15, 0, 0.18, -0.06, 0.27], ["c", -0.12, 0.09, -0.24, 0.09, -0.36, 0], ["c", -0.06, -0.09, -0.06, -0.12, -0.06, -0.27], ["c", 0, -0.42, -0.21, -1.35, -0.51, -2.13], ["c", -0.69, -1.86, -1.74, -3.69, -2.67, -4.62], ["c", -0.36, -0.36, -0.39, -0.45, -0.24, -0.6], ["z"]], w: 7.49, h: 7.752 },
    "scripts.thumb": { d: [["M", -0.54, -3.69], ["c", 0.15, -0.03, 0.36, -0.06, 0.51, -0.06], ["c", 1.44, 0, 2.58, 1.11, 2.94, 2.85], ["c", 0.09, 0.48, 0.09, 1.32, 0, 1.8], ["c", -0.27, 1.41, -1.08, 2.43, -2.16, 2.73], ["l", -0.18, 0.06], ["l", 0, 0.12], ["c", 0.03, 0.06, 0.06, 0.45, 0.09, 0.87], ["c", 0.03, 0.57, 0.03, 0.78, 0, 0.84], ["c", -0.09, 0.27, -0.39, 0.48, -0.66, 0.48], ["c", -0.27, 0, -0.57, -0.21, -0.66, -0.48], ["c", -0.03, -0.06, -0.03, -0.27, 0, -0.84], ["c", 0.03, -0.42, 0.06, -0.81, 0.09, -0.87], ["l", 0, -0.12], ["l", -0.18, -0.06], ["c", -1.08, -0.3, -1.89, -1.32, -2.16, -2.73], ["c", -0.09, -0.48, -0.09, -1.32, 0, -1.8], ["c", 0.15, -0.84, 0.51, -1.53, 1.02, -2.04], ["c", 0.39, -0.39, 0.84, -0.63, 1.35, -0.75], ["z"], ["m", 1.05, 0.9], ["c", -0.15, -0.09, -0.21, -0.09, -0.45, -0.12], ["c", -0.15, 0, -0.3, 0.03, -0.39, 0.03], ["c", -0.57, 0.18, -0.9, 0.72, -1.08, 1.74], ["c", -0.06, 0.48, -0.06, 1.8, 0, 2.28], ["c", 0.15, 0.9, 0.42, 1.44, 0.9, 1.65], ["c", 0.18, 0.09, 0.21, 0.09, 0.51, 0.09], ["c", 0.3, 0, 0.33, 0, 0.51, -0.09], ["c", 0.48, -0.21, 0.75, -0.75, 0.9, -1.65], ["c", 0.03, -0.27, 0.03, -0.54, 0.03, -1.14], ["c", 0, -0.6, 0, -0.87, -0.03, -1.14], ["c", -0.15, -0.9, -0.45, -1.44, -0.9, -1.65], ["z"]], w: 5.955, h: 9.75 },
    "scripts.open": { d: [["M", -0.54, -3.69], ["c", 0.15, -0.03, 0.36, -0.06, 0.51, -0.06], ["c", 1.44, 0, 2.58, 1.11, 2.94, 2.85], ["c", 0.09, 0.48, 0.09, 1.32, 0, 1.8], ["c", -0.33, 1.74, -1.47, 2.85, -2.91, 2.85], ["c", -1.44, 0, -2.58, -1.11, -2.91, -2.85], ["c", -0.09, -0.48, -0.09, -1.32, 0, -1.8], ["c", 0.15, -0.84, 0.51, -1.53, 1.02, -2.04], ["c", 0.39, -0.39, 0.84, -0.63, 1.35, -0.75], ["z"], ["m", 1.11, 0.9], ["c", -0.21, -0.09, -0.27, -0.09, -0.51, -0.12], ["c", -0.3, 0, -0.42, 0.03, -0.66, 0.15], ["c", -0.24, 0.12, -0.51, 0.39, -0.66, 0.63], ["c", -0.54, 0.93, -0.63, 2.64, -0.21, 3.81], ["c", 0.21, 0.54, 0.51, 0.9, 0.93, 1.11], ["c", 0.21, 0.09, 0.24, 0.09, 0.54, 0.09], ["c", 0.3, 0, 0.33, 0, 0.54, -0.09], ["c", 0.42, -0.21, 0.72, -0.57, 0.93, -1.11], ["c", 0.36, -0.99, 0.36, -2.37, 0, -3.36], ["c", -0.21, -0.54, -0.51, -0.9, -0.9, -1.11], ["z"]], w: 5.955, h: 7.5 },
    "scripts.longphrase": { d: [["M", 1.47, -15.09], ["c", 0.36, -0.09, 0.66, -0.18, 0.69, -0.18], ["c", 0.06, 0, 0.06, 0.54, 0.06, 11.25], ["l", 0, 11.25], ["l", -0.63, 0.15], ["c", -0.66, 0.18, -1.44, 0.39, -1.5, 0.39], ["c", -0.03, 0, -0.03, -3.39, -0.03, -11.25], ["l", 0, -11.25], ["l", 0.36, -0.09], ["c", 0.21, -0.06, 0.66, -0.18, 1.05, -0.27], ["z"]], w: 2.16, h: 23.04 },
    "scripts.mediumphrase": { d: [["M", 1.47, -7.59], ["c", 0.36, -0.09, 0.66, -0.18, 0.69, -0.18], ["c", 0.06, 0, 0.06, 0.39, 0.06, 7.5], ["l", 0, 7.5], ["l", -0.63, 0.15], ["c", -0.66, 0.18, -1.44, 0.39, -1.5, 0.39], ["c", -0.03, 0, -0.03, -2.28, -0.03, -7.5], ["l", 0, -7.5], ["l", 0.36, -0.09], ["c", 0.21, -0.06, 0.66, -0.18, 1.05, -0.27], ["z"]], w: 2.16, h: 15.54 },
    "scripts.shortphrase": { d: [["M", 1.47, -7.59], ["c", 0.36, -0.09, 0.66, -0.18, 0.69, -0.18], ["c", 0.06, 0, 0.06, 0.21, 0.06, 3.75], ["l", 0, 3.75], ["l", -0.42, 0.09], ["c", -0.57, 0.18, -1.65, 0.45, -1.71, 0.45], ["c", -0.03, 0, -0.03, -0.72, -0.03, -3.75], ["l", 0, -3.75], ["l", 0.36, -0.09], ["c", 0.21, -0.06, 0.66, -0.18, 1.05, -0.27], ["z"]], w: 2.16, h: 8.04 },
    "scripts.snap": { d: [["M", 4.5, -3.39], ["c", 0.36, -0.03, 0.96, -0.03, 1.35, 0], ["c", 1.56, 0.15, 3.15, 0.9, 4.2, 2.01], ["c", 0.24, 0.27, 0.33, 0.42, 0.33, 0.6], ["c", 0, 0.27, 0.03, 0.24, -2.46, 2.22], ["c", -1.29, 1.02, -2.4, 1.86, -2.49, 1.92], ["c", -0.18, 0.09, -0.3, 0.09, -0.48, 0], ["c", -0.09, -0.06, -1.2, -0.9, -2.49, -1.92], ["c", -2.49, -1.98, -2.46, -1.95, -2.46, -2.22], ["c", 0, -0.18, 0.09, -0.33, 0.33, -0.6], ["c", 1.05, -1.08, 2.64, -1.86, 4.17, -2.01], ["z"], ["m", 1.29, 1.17], ["c", -1.47, -0.15, -2.97, 0.3, -4.14, 1.2], ["l", -0.18, 0.15], ["l", 0.06, 0.09], ["c", 0.15, 0.12, 3.63, 2.85, 3.66, 2.85], ["c", 0.03, 0, 3.51, -2.73, 3.66, -2.85], ["l", 0.06, -0.09], ["l", -0.18, -0.15], ["c", -0.84, -0.66, -1.89, -1.08, -2.94, -1.2], ["z"]], w: 10.38, h: 6.84 }
  };
  m["noteheads.slash.whole"] = { d: [["M", 5, -5], ["l", 1, 1], ["l", -5, 5], ["l", -1, -1], ["z"], ["m", 4, 6], ["l", -5, -5], ["l", 2, -2], ["l", 5, 5], ["z"], ["m", 0, -2], ["l", 1, 1], ["l", -5, 5], ["l", -1, -1], ["z"], ["m", -4, 6], ["l", -5, -5], ["l", 2, -2], ["l", 5, 5], ["z"]], w: 10.81, h: 15.63 }, m["noteheads.slash.quarter"] = { d: [["M", 9, -6], ["l", 0, 4], ["l", -9, 9], ["l", 0, -4], ["z"]], w: 9, h: 9 }, m["noteheads.harmonic.quarter"] = { d: [["M", 3.63, -4.02], ["c", 0.09, -0.06, 0.18, -0.09, 0.24, -0.03], ["c", 0.03, 0.03, 0.87, 0.93, 1.83, 2.01], ["c", 1.5, 1.65, 1.8, 1.98, 1.8, 2.04], ["c", 0, 0.06, -0.3, 0.39, -1.8, 2.04], ["c", -0.96, 1.08, -1.8, 1.98, -1.83, 2.01], ["c", -0.06, 0.06, -0.15, 0.03, -0.24, -0.03], ["c", -0.12, -0.09, -3.54, -3.84, -3.6, -3.93], ["c", -0.03, -0.03, -0.03, -0.09, -0.03, -0.15], ["c", 0.03, -0.06, 3.45, -3.84, 3.63, -3.96], ["z"]], w: 7.5, h: 8.165 }, m["noteheads.triangle.quarter"] = { d: [["M", 0, 4], ["l", 9, 0], ["l", -4.5, -9], ["z"]], w: 9, h: 9 };
  var g = function(o) {
    for (var a = [], s = 0, p = o.length; s < p; s++) {
      a[s] = [];
      for (var u = 0, d = o[s].length; u < d; u++)
        a[s][u] = o[s][u];
    }
    return a;
  }, l = function(o, a, s) {
    for (var p = 0, u = o.length; p < u; p++) {
      var d = o[p], f, i;
      for (f = 1, i = d.length; f < i; f++)
        d[f] *= f % 2 ? a : s;
    }
  }, r = {
    printSymbol: function(o, a, s, p, u) {
      if (!m[s]) return null;
      var d = g(m[s].d);
      d[0][1] += o, d[0][2] += a;
      for (var f = "", i = 0; i < d.length; i++)
        f += d[i].join(" ");
      return u.path = f, p.path(u);
    },
    getPathForSymbol: function(o, a, s, p, u) {
      if (p = p || 1, u = u || 1, !m[s]) return null;
      var d = g(m[s].d);
      return (p !== 1 || u !== 1) && l(d, p, u), d[0][1] += o, d[0][2] += a, d;
    },
    getSymbolWidth: function(o) {
      return m[o] ? m[o].w : 0;
    },
    symbolHeightInPitches: function(o) {
      var a = m[o] ? m[o].h : 0;
      return a / _.STEP;
    },
    getSymbolAlign: function(o) {
      return o.substring(0, 7) === "scripts" && o !== "scripts.roll" ? "center" : "left";
    },
    getYCorr: function(o) {
      switch (o) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case "+":
          return -2;
        case "timesig.common":
        case "timesig.cut":
          return 0;
        case "flags.d32nd":
          return -1;
        case "flags.d64th":
          return -2;
        case "flags.u32nd":
          return 1;
        case "flags.u64th":
          return 3;
        case "rests.whole":
          return 1;
        case "rests.half":
          return -1;
        case "rests.8th":
          return -1;
        case "rests.quarter":
          return -1;
        case "rests.16th":
          return -1;
        case "rests.32nd":
          return -1;
        case "rests.64th":
          return -1;
        case "f":
        case "m":
        case "p":
        case "s":
        case "z":
          return -4;
        case "scripts.trill":
        case "scripts.upbow":
        case "scripts.downbow":
          return -2;
        case "scripts.ufermata":
        case "scripts.wedge":
        case "scripts.roll":
        case "scripts.shortphrase":
        case "scripts.longphrase":
          return -1;
        case "scripts.dfermata":
          return 1;
        default:
          return 0;
      }
    },
    setSymbol: function(o, a) {
      m[o] = a;
    }
  };
  return Ot = r, Ot;
}
var Ht, Ka;
function Js() {
  if (Ka) return Ht;
  Ka = 1;
  var _ = De(), m = Ne(), g = Te(), l = function(o, a) {
    var s, p = 0;
    o.el_type = "clef";
    var u = new _(o, 0, 10, "staff-extra clef", a);
    switch (u.isClef = !0, o.type) {
      case "treble":
        s = "clefs.G";
        break;
      case "tenor":
        s = "clefs.C";
        break;
      case "alto":
        s = "clefs.C";
        break;
      case "bass":
        s = "clefs.F";
        break;
      case "treble+8":
        s = "clefs.G", p = 1;
        break;
      case "tenor+8":
        s = "clefs.C", p = 1;
        break;
      case "bass+8":
        s = "clefs.F", p = 1;
        break;
      case "alto+8":
        s = "clefs.C", p = 1;
        break;
      case "treble-8":
        s = "clefs.G", p = -1;
        break;
      case "tenor-8":
        s = "clefs.C", p = -1;
        break;
      case "bass-8":
        s = "clefs.F", p = -1;
        break;
      case "alto-8":
        s = "clefs.C", p = -1;
        break;
      case "none":
        return null;
      case "perc":
        s = "clefs.perc";
        break;
      default:
        u.addFixed(new g("clef=" + o.type, 0, 0, void 0, { type: "debug" }));
    }
    var d = 5;
    if (s) {
      var f = m.symbolHeightInPitches(s), i = r(s);
      if (u.addRight(new g(s, d, m.getSymbolWidth(s), o.clefPos, { top: f + o.clefPos + i, bottom: o.clefPos + i })), p !== 0) {
        var n = 0.6666666666666666, t = (m.getSymbolWidth(s) - m.getSymbolWidth("8") * n) / 2, e = p > 0 ? u.top + 3 : u.bottom - 1, c = p > 0 ? u.top + 3 : u.bottom - 3, v = c - 2;
        o.type === "bass-8" && (e = 3, t = 0), u.addRight(new g("8", d + t, m.getSymbolWidth("8") * n, e, {
          scalex: n,
          scaley: n,
          top: c,
          bottom: v
        }));
      }
    }
    return u;
  };
  function r(o) {
    switch (o) {
      case "clefs.G":
        return -5;
      case "clefs.C":
        return -4;
      case "clefs.F":
        return -4;
      case "clefs.perc":
        return -2;
      default:
        return 0;
    }
  }
  return Ht = l, Ht;
}
var zt, Qa;
function Zs() {
  if (Qa) return zt;
  Qa = 1;
  var _ = De(), m = Ne(), g = Te(), l = function(r, o) {
    if (r.el_type = "keySignature", !r.accidentals || r.accidentals.length === 0)
      return null;
    var a = new _(r, 0, 10, "staff-extra key-signature", o);
    a.isKeySig = !0;
    var s = 0;
    return r.accidentals.forEach(function(p) {
      var u, d = 0;
      switch (p.acc) {
        case "sharp":
          u = "accidentals.sharp", d = -3;
          break;
        case "natural":
          u = "accidentals.nat";
          break;
        case "flat":
          u = "accidentals.flat", d = -1.2;
          break;
        case "quartersharp":
          u = "accidentals.halfsharp", d = -2.5;
          break;
        case "quarterflat":
          u = "accidentals.halfflat", d = -1.2;
          break;
        default:
          u = "accidentals.flat";
      }
      a.addRight(new g(u, s, m.getSymbolWidth(u), p.verticalPos, { thickness: m.symbolHeightInPitches(u), top: p.verticalPos + m.symbolHeightInPitches(u) + d, bottom: p.verticalPos + d })), s += m.getSymbolWidth(u) + 2;
    }, this), a;
  };
  return zt = l, zt;
}
var Gt, Ja;
function eo() {
  if (Ja) return Gt;
  Ja = 1;
  var _ = Ne(), m = Te(), g = function(l, r, o, a) {
    a || (a = {});
    var s = a.dir !== void 0 ? a.dir : null, p = a.headx !== void 0 ? a.headx : 0, u = a.extrax !== void 0 ? a.extrax : 0, d = a.flag !== void 0 ? a.flag : null, f = a.dot !== void 0 ? a.dot : 0, i = a.dotshiftx !== void 0 ? a.dotshiftx : 0, n = a.scale !== void 0 ? a.scale : 1, t = a.accidentalSlot !== void 0 ? a.accidentalSlot : [], e = a.shouldExtendStem !== void 0 ? a.shouldExtendStem : !1, c = a.printAccidentals !== void 0 ? a.printAccidentals : !0, v = a.chordPos, h = o.verticalPos, y, w = 0, A = 0, P = 0;
    if (r === void 0)
      l.addFixed(new m("pitch is undefined", 0, 0, 0, { type: "debug" }));
    else if (r === "")
      y = new m(null, 0, 0, h, { chordPos: v });
    else {
      var N = p;
      if (o.printer_shift) {
        var T = o.printer_shift === "same" ? 1 : 0;
        N = s === "down" ? -_.getSymbolWidth(r) * n + T : _.getSymbolWidth(r) * n - T;
      }
      var q = { scalex: n, scaley: n, thickness: _.symbolHeightInPitches(r) * n, name: o.name, chordPos: v };
      if (y = new m(r, N, _.getSymbolWidth(r) * n, h, q), y.stemDir = s, d) {
        var I = h + (s === "down" ? -7 : 7) * n;
        e && (s === "down" && I > 6 && (I = 6), s === "up" && I < 6 && (I = 6));
        var C = s === "down" ? p : p + y.w - 0.6;
        l.addRight(new m(d, C, _.getSymbolWidth(d) * n, I, { scalex: n, scaley: n, chordPos: v }));
      }
      for (A = y.w + i - 2 + 5 * f; f > 0; f--) {
        var B = 1 - Math.abs(h) % 2;
        l.addRight(new m("dots.dot", y.w + i - 2 + 5 * f, _.getSymbolWidth("dots.dot"), h + B, { chordPos: v }));
      }
    }
    if (y && (y.highestVert = o.highestVert), c && o.accidental) {
      var R;
      switch (o.accidental) {
        case "quartersharp":
          R = "accidentals.halfsharp";
          break;
        case "dblsharp":
          R = "accidentals.dblsharp";
          break;
        case "sharp":
          R = "accidentals.sharp";
          break;
        case "quarterflat":
          R = "accidentals.halfflat";
          break;
        case "flat":
          R = "accidentals.flat";
          break;
        case "dblflat":
          R = "accidentals.dblflat";
          break;
        case "natural":
          R = "accidentals.nat";
      }
      for (var S = !1, k = u, M = 0; M < t.length; M++)
        if (h - t[M][0] >= 6) {
          t[M][0] = h, k = t[M][1], S = !0;
          break;
        }
      S === !1 && (k -= _.getSymbolWidth(R) * n + 2, t.push([h, k]), w = _.getSymbolWidth(R) * n + 2);
      var F = _.symbolHeightInPitches(R);
      l.addExtra(new m(R, k, _.getSymbolWidth(R), h, { scalex: n, scaley: n, top: h + F / 2, bottom: h - F / 2, chordPos: v })), P = _.getSymbolWidth(R) / 2;
    }
    return { notehead: y, accidentalshiftx: w, dotshiftx: A, extraLeft: P };
  };
  return Gt = g, Gt;
}
var Yt, Za;
function to() {
  if (Za) return Yt;
  Za = 1;
  var _ = De(), m = Ne(), g = Te(), l = function(r, o) {
    r.el_type = "timeSignature";
    var a = new _(r, 0, 10, "staff-extra time-signature", o);
    if (r.type === "specified")
      for (var s = 0, p = 0; p < r.value.length; p++)
        if (p !== 0 && (a.addRight(new g("+", s + 1, m.getSymbolWidth("+"), 6, { thickness: m.symbolHeightInPitches("+") })), s += m.getSymbolWidth("+") + 2), r.value[p].den) {
          for (var u = 0, d = 0; d < r.value[p].num.length; d++)
            u += m.getSymbolWidth(r.value[p].num[d]);
          var f = 0;
          for (d = 0; d < r.value[p].num.length; d++)
            f += m.getSymbolWidth(r.value[p].den[d]);
          var i = Math.max(u, f);
          a.addRight(new g(r.value[p].num, s + (i - u) / 2, u, 8, { thickness: m.symbolHeightInPitches(r.value[p].num[0]) })), a.addRight(new g(r.value[p].den, s + (i - f) / 2, f, 4, { thickness: m.symbolHeightInPitches(r.value[p].den[0]) })), s += i;
        } else {
          for (var n = 0, t = 0; t < r.value[p].num.length; t++)
            n += m.getSymbolWidth(r.value[p].num[t]);
          a.addRight(new g(r.value[p].num, s, n, 6, { thickness: m.symbolHeightInPitches(r.value[p].num[0]) })), s += n;
        }
    else r.type === "common_time" ? a.addRight(new g("timesig.common", 0, m.getSymbolWidth("timesig.common"), 6, { thickness: m.symbolHeightInPitches("timesig.common") })) : r.type === "cut_time" ? a.addRight(new g("timesig.cut", 0, m.getSymbolWidth("timesig.cut"), 6, { thickness: m.symbolHeightInPitches("timesig.cut") })) : r.type === "tempus_imperfectum" ? a.addRight(new g("timesig.imperfectum", 0, m.getSymbolWidth("timesig.imperfectum"), 6, { thickness: m.symbolHeightInPitches("timesig.imperfectum") })) : r.type === "tempus_imperfectum_prolatio" ? a.addRight(new g("timesig.imperfectum2", 0, m.getSymbolWidth("timesig.imperfectum2"), 6, { thickness: m.symbolHeightInPitches("timesig.imperfectum2") })) : r.type === "tempus_perfectum" ? a.addRight(new g("timesig.perfectum", 0, m.getSymbolWidth("timesig.perfectum"), 6, { thickness: m.symbolHeightInPitches("timesig.perfectum") })) : r.type === "tempus_perfectum_prolatio" ? a.addRight(new g("timesig.perfectum2", 0, m.getSymbolWidth("timesig.perfectum2"), 6, { thickness: m.symbolHeightInPitches("timesig.perfectum2") })) : console.log("time signature:", r);
    return a;
  };
  return Yt = l, Yt;
}
var Wt, en;
function ro() {
  if (en) return Wt;
  en = 1;
  var _ = function(g, l, r) {
    this.type = "DynamicDecoration", this.anchor = g, this.dec = l, r === "below" ? this.volumeHeightBelow = 6 : this.volumeHeightAbove = 6, this.pitch = void 0;
  };
  return Wt = _, Wt;
}
var Ut, tn;
function ao() {
  if (tn) return Ut;
  tn = 1;
  var _ = function(g, l, r, o) {
    this.type = "CrescendoElem", this.anchor1 = g, this.anchor2 = l, this.dir = r, o === "above" ? this.dynamicHeightAbove = 6 : this.dynamicHeightBelow = 6, this.pitch = void 0;
  };
  return Ut = _, Ut;
}
var Xt, rn;
function no() {
  if (rn) return Xt;
  rn = 1;
  var _ = function(g, l) {
    this.type = "GlissandoElem", this.anchor1 = g, this.anchor2 = l;
  };
  return Xt = _, Xt;
}
var jt, an;
function cs() {
  if (an) return jt;
  an = 1;
  var _ = function(g) {
    this.type = "TieElem", this.anchor1 = g.anchor1, this.anchor2 = g.anchor2, g.isGrace && (this.isGrace = !0), g.fixedY && (this.fixedY = !0), g.stemDir && (this.stemDir = g.stemDir), g.voiceNumber !== void 0 && (this.voiceNumber = g.voiceNumber), g.style !== void 0 && (this.dotted = !0), this.internalNotes = [];
  };
  return _.prototype.addInternalNote = function(m) {
    this.internalNotes.push(m);
  }, _.prototype.setEndAnchor = function(m) {
    this.anchor2 = m, this.anchor1 ? (this.top = Math.max(this.anchor1.pitch, this.anchor2.pitch) + 4, this.bottom = Math.min(this.anchor1.pitch, this.anchor2.pitch) - 4) : (this.top = this.anchor2.pitch + 4, this.bottom = this.anchor2.pitch - 4);
  }, _.prototype.setStartX = function(m) {
    this.startLimitX = m;
  }, _.prototype.setEndX = function(m) {
    this.endLimitX = m;
  }, _.prototype.setHint = function() {
    this.hint = !0;
  }, _.prototype.calcTieDirection = function() {
    if (this.isGrace)
      this.above = !1;
    else if (this.voiceNumber === 0)
      this.above = !0;
    else if (this.voiceNumber > 0)
      this.above = !1;
    else {
      var m;
      this.anchor1 ? m = this.anchor1.pitch : this.anchor2 ? m = this.anchor2.pitch : m = 14, this.anchor1 && this.anchor1.stemDir === "down" && this.anchor2 && this.anchor2.stemDir === "down" ? this.above = !0 : this.anchor1 && this.anchor1.stemDir === "up" && this.anchor2 && this.anchor2.stemDir === "up" ? this.above = !1 : this.anchor1 && this.anchor2 ? this.above = m >= 6 : this.anchor1 ? this.above = this.anchor1.stemDir === "down" : this.anchor2 ? this.above = this.anchor2.stemDir === "down" : this.above = m >= 6;
    }
  }, _.prototype.calcSlurDirection = function() {
    if (this.isGrace)
      this.above = !1;
    else if (this.voiceNumber === 0)
      this.above = !0;
    else if (this.voiceNumber > 0)
      this.above = !1;
    else {
      var m = !1;
      this.anchor1 && this.anchor1.stemDir === "down" && (m = !0), this.anchor2 && this.anchor2.stemDir === "down" && (m = !0);
      for (var g = 0; g < this.internalNotes.length; g++) {
        var l = this.internalNotes[g];
        l.stemDir === "down" && (m = !0);
      }
      this.above = m;
    }
  }, _.prototype.calcX = function(m, g) {
    this.anchor1 ? (this.startX = this.anchor1.x, this.anchor1.scalex < 1 && (this.startX -= 3)) : this.startLimitX ? this.startX = this.startLimitX.x + this.startLimitX.w : this.anchor2 ? this.startX = this.anchor2.x - 20 : this.startX = m, !this.anchor1 && this.dotted && (this.startX -= 3), this.anchor2 ? this.endX = this.anchor2.x : this.endLimitX ? this.endX = this.endLimitX.x : this.endX = g;
  }, _.prototype.calcTieY = function() {
    this.anchor1 ? this.startY = this.anchor1.pitch : this.anchor2 ? this.startY = this.anchor2.pitch : this.startY = this.above ? 14 : 0, this.anchor2 ? this.endY = this.anchor2.pitch : this.anchor1 ? this.endY = this.anchor1.pitch : this.endY = this.above ? 14 : 0;
  }, _.prototype.calcSlurY = function() {
    if (this.anchor1 && this.anchor2) {
      this.above && this.anchor1.stemDir === "up" && !this.fixedY ? (this.startY = (this.anchor1.highestVert + this.anchor1.pitch) / 2, this.startX += this.anchor1.w / 2) : this.startY = this.anchor1.pitch;
      var m = this.anchor2.parent.beam && this.anchor2.parent.beam.stemsUp && this.anchor2.parent.beam.elems[0] !== this.anchor2.parent, g = (this.anchor2.highestVert + this.anchor2.pitch) / 2;
      if (this.above && this.anchor2.stemDir === "up" && !this.fixedY && !m && g < this.startY ? (this.endY = g, this.endX += Math.round(this.anchor2.w / 2)) : this.endY = this.above && m ? this.anchor2.highestVert : this.anchor2.pitch, this.anchor1.scalex === 1) {
        var l = !!this.anchor1.parent.beam, r = !!this.anchor2.parent.beam;
        if (l) {
          var o = this.anchor1.parent === this.anchor1.parent.beam.elems[this.anchor1.parent.beam.elems.length - 1];
          o || (this.above ? this.startY = this.anchor1.parent.fixed.t : this.startY = this.anchor1.parent.fixed.b);
        }
        if (r) {
          var a = this.anchor2.parent === this.anchor2.parent.beam.elems[0];
          a || (this.above ? this.endY = this.anchor2.parent.fixed.t : this.endY = this.anchor2.parent.fixed.b);
        }
      }
    } else this.anchor1 ? this.startY = this.endY = this.anchor1.pitch : this.anchor2 ? this.startY = this.endY = this.anchor2.pitch : (this.startY = this.above ? 14 : 0, this.endY = this.above ? 14 : 0);
  }, _.prototype.avoidCollisionAbove = function() {
    if (this.above) {
      for (var m = -50, g = 0; g < this.internalNotes.length; g++)
        this.internalNotes[g].highestVert > m && (m = this.internalNotes[g].highestVert);
      m > this.startY && m > this.endY && (this.startY = this.endY = m - 1);
    }
  }, _.prototype.getYBounds = function() {
    var m = 10, g = 1e3;
    this.isTie ? (this.calcTieDirection(), this.calcX(m, g), this.calcTieY()) : (this.calcSlurDirection(), this.calcX(m, g), this.calcSlurY());
    var l, r;
    return this.above ? (r = Math.min(this.startY, this.endY), l = r + 3) : (l = Math.min(this.startY, this.endY), r = l - 3), [l, r];
  }, jt = _, jt;
}
var $t, nn;
function io() {
  if (nn) return $t;
  nn = 1;
  var _ = ro(), m = ao(), g = no(), l = Ne(), r = Te(), o = cs(), a = function() {
    this.startDiminuendoX = void 0, this.startCrescendoX = void 0, this.minTop = 12, this.minBottom = 0;
  }, s = function(t, e, c, v, h, y, w, A, P) {
    for (var N, T = 0; T < e.length; T++) {
      if (e[T] === "staccato" || e[T] === "tenuto" || e[T] === "accent" && !P) {
        var q = "scripts." + e[T];
        if (e[T] === "accent" && (q = "scripts.sforzato"), N === void 0 ? N = w === "down" ? c + 2 : A - 2 : N = w === "down" ? N + 2 : N - 2, e[T] === "accent")
          w === "up" ? N-- : N++;
        else
          switch (N) {
            case 2:
            case 4:
            case 6:
            case 8:
            case 10:
              w === "up" ? N-- : N++;
              break;
          }
        c > 9 && N++;
        var I = v / 2;
        l.getSymbolAlign(q) !== "center" && (I -= l.getSymbolWidth(q) / 2), h.addFixedX(new r(q, I, l.getSymbolWidth(q), N));
      }
      if (e[T] === "slide" && h.heads[0]) {
        var C = h.heads[0].pitch;
        C -= 2;
        var B = new r("", -y - 15, 0, C - 1), R = new r("", -y - 5, 0, C + 1);
        h.addFixedX(B), h.addFixedX(R), t.addOther(new o({ anchor1: B, anchor2: R, fixedY: !0 }));
      }
    }
    return N === void 0 && (N = c), { above: N, below: h.bottom };
  }, p = function(t, e, c, v) {
    for (var h = 0; h < e.length; h++)
      switch (e[h]) {
        case "p":
        case "mp":
        case "pp":
        case "ppp":
        case "pppp":
        case "f":
        case "ff":
        case "fff":
        case "ffff":
        case "sfz":
        case "mf":
          var y = new _(c, e[h], v);
          t.addOther(y);
      }
  }, u = function(t, e, c, v, h) {
    function y() {
      if (v.heads.length === 0)
        return 10;
      for (var N = v.heads[0].pitch, T = 1; T < v.heads.length; T++)
        N = Math.max(N, v.heads[T].pitch);
      return N;
    }
    function w() {
      if (v.heads.length === 0)
        return 2;
      for (var N = v.heads[0].pitch, T = 1; T < v.heads.length; T++)
        N = Math.min(N, v.heads[T].pitch);
      return N;
    }
    function A(N, T) {
      var q = h === "down" ? w() + 1 : y() + 9;
      h !== "down" && T === 1 && q--;
      var I = c / 2;
      I += h === "down" ? -5 : 3;
      for (var C = 0; C < T; C++)
        q -= 1, v.addFixedX(new r(N, I, l.getSymbolWidth(N), q));
    }
    for (var P = 0; P < t.length; P++)
      switch (t[P]) {
        case "/":
          A("flags.ugrace", 1);
          break;
        case "//":
          A("flags.ugrace", 2);
          break;
        case "///":
          A("flags.ugrace", 3);
          break;
        case "////":
          A("flags.ugrace", 4);
          break;
      }
  }, d = function(t, e, c, v, h, y, w, A) {
    function P(R, S) {
      R === "above" ? v.above += S : v.below -= S;
    }
    function N(R) {
      var S;
      return R === "above" ? (S = v.above, S < y && (S = y)) : (S = v.below, S > w && (S = w)), S;
    }
    function T(R, S, k) {
      var M = N(S), F = 2, L = 5;
      c.addFixedX(new r(R, e / 2, 0, M + F, { type: "decoration", klass: "ornament", thickness: 3, anchor: k })), P(S, L);
    }
    function q(R, S) {
      var k = e / 2;
      l.getSymbolAlign(R) !== "center" && (k -= l.getSymbolWidth(R) / 2);
      var M = l.symbolHeightInPitches(R) + 1, F = N(S);
      F = S === "above" ? F + M / 2 : F - M / 2, c.addFixedX(new r(R, k, l.getSymbolWidth(R), F, { klass: "ornament", thickness: l.symbolHeightInPitches(R), position: S })), P(S, M);
    }
    for (var I = {
      "+": "scripts.stopped",
      open: "scripts.open",
      snap: "scripts.snap",
      wedge: "scripts.wedge",
      thumb: "scripts.thumb",
      shortphrase: "scripts.shortphrase",
      mediumphrase: "scripts.mediumphrase",
      longphrase: "scripts.longphrase",
      trill: "scripts.trill",
      trillh: "scripts.trill",
      roll: "scripts.roll",
      irishroll: "scripts.roll",
      marcato: "scripts.umarcato",
      dmarcato: "scripts.dmarcato",
      umarcato: "scripts.umarcato",
      turn: "scripts.turn",
      uppermordent: "scripts.prall",
      pralltriller: "scripts.prall",
      mordent: "scripts.mordent",
      lowermordent: "scripts.mordent",
      downbow: "scripts.downbow",
      upbow: "scripts.upbow",
      fermata: "scripts.ufermata",
      invertedfermata: "scripts.dfermata",
      breath: ",",
      coda: "scripts.coda",
      segno: "scripts.segno"
    }, C = !1, B = 0; B < t.length; B++)
      switch (t[B]) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "D.C.":
        case "D.S.":
          T(t[B], h, "middle"), C = !0;
          break;
        case "D.C.alcoda":
          T("D.C. al coda", h, "end"), C = !0;
          break;
        case "D.C.alfine":
          T("D.C. al fine", h, "end"), C = !0;
          break;
        case "D.S.alcoda":
          T("D.S. al coda", h, "end"), C = !0;
          break;
        case "D.S.alfine":
          T("D.S. al fine", h, "end"), C = !0;
          break;
        case "fine":
          T("FINE", h, "middle"), C = !0;
          break;
        case "+":
        case "open":
        case "snap":
        case "wedge":
        case "thumb":
        case "shortphrase":
        case "mediumphrase":
        case "longphrase":
        case "trill":
        case "trillh":
        case "roll":
        case "irishroll":
        case "marcato":
        case "dmarcato":
        case "turn":
        case "uppermordent":
        case "pralltriller":
        case "mordent":
        case "lowermordent":
        case "downbow":
        case "upbow":
        case "fermata":
        case "breath":
        case "umarcato":
        case "coda":
        case "segno":
          q(I[t[B]], h), C = !0;
          break;
        case "invertedfermata":
          q(I[t[B]], "below"), C = !0;
          break;
        case "mark":
          c.klass = "mark";
          break;
        case "accent":
          A && (q("scripts.sforzato", h), C = !0);
          break;
      }
    return C;
  };
  function f(t, e, c) {
    for (var v = 0; v < t.length; v++)
      switch (t[v]) {
        case "arpeggio":
          for (var h = e.abcelem.minpitch - 1; h <= e.abcelem.maxpitch; h += 2)
            e.addExtra(
              new r(
                "scripts.arpeggio",
                -l.getSymbolWidth("scripts.arpeggio") * 2 - c,
                0,
                h + 2,
                { klass: "ornament", thickness: l.symbolHeightInPitches("scripts.arpeggio") }
              )
            );
          break;
      }
  }
  a.prototype.endLine = function(t) {
    this.startDiminuendoX && (t.addOther(new m(this.startDiminuendoX, n(t.children), ">", this.dynamicPositioning)), this.startDiminuendoX = void 0), this.startCrescendoX && (t.addOther(new m(this.startCrescendoX, n(t.children), "<", this.dynamicPositioning)), this.startCrescendoX = void 0);
  }, a.prototype.dynamicDecoration = function(t, e, c, v) {
    for (var h, y, w, A = 0; A < e.length; A++)
      switch (e[A]) {
        case "diminuendo(":
          this.startDiminuendoX = c, this.dynamicPositioning = v, h = void 0;
          break;
        case "diminuendo)":
          this.startDiminuendoX || (this.startDiminuendoX = i(t.children)), h = { start: this.startDiminuendoX, stop: c }, this.startDiminuendoX = void 0;
          break;
        case "crescendo(":
          this.startCrescendoX = c, this.dynamicPositioning = v, y = void 0;
          break;
        case "crescendo)":
          this.startCrescendoX || (this.startCrescendoX = i(t.children)), y = { start: this.startCrescendoX, stop: c }, this.startCrescendoX = void 0;
          break;
        case "~(":
        case "glissando(":
          this.startGlissandoX = c, w = void 0;
          break;
        case "~)":
        case "glissando)":
          w = { start: this.startGlissandoX, stop: c }, this.startGlissandoX = void 0;
          break;
      }
    h && t.addOther(new m(h.start, h.stop, ">", v)), y && t.addOther(new m(y.start, y.stop, "<", v)), w && t.addOther(new g(w.start, w.stop));
  };
  function i(t) {
    for (var e = 0; e < t.length; e++)
      if (t[e].abcelem.pitches)
        return t[e];
    return null;
  }
  function n(t) {
    return t[t.length - 1];
  }
  return a.prototype.createDecoration = function(t, e, c, v, h, y, w, A, P, N, T) {
    P || (P = { ornamentPosition: "above", volumePosition: N ? "above" : "below", dynamicPosition: N ? "above" : "below" }), p(t, e, h, P.volumePosition), this.dynamicDecoration(t, e, h, P.dynamicPosition), u(e, c, v, h, w);
    var q = s(t, e, c, v, h, y, w, A, T);
    q.above = Math.max(q.above, this.minTop), q.below = Math.min(q.below, A), d(e, v, h, q, P.ornamentPosition, this.minTop, A, T), f(e, h, y);
  }, $t = a, $t;
}
var Vt, sn;
function so() {
  if (sn) return Vt;
  sn = 1;
  var _ = function(g, l, r) {
    this.type = "EndingElem", this.text = g, this.anchor1 = l, this.anchor2 = r, this.endingHeightAbove = 5, this.pitch = void 0;
  };
  return Vt = _, Vt;
}
var Kt, on;
function oo() {
  if (on) return Kt;
  on = 1;
  var _ = function(m) {
    for (var g = 0, l = 0; l < m.voices.length; l++) {
      var r = m.voices[l].staff;
      m.voices[l].duplicate || (g += r.top, g += -r.bottom);
    }
    return g;
  };
  return Kt = _, Kt;
}
var Qt, cn;
function co() {
  if (cn) return Qt;
  cn = 1;
  var _ = oo(), m = function(g) {
    this.getTextSize = g, this.voices = [], this.staffs = [], this.brace = void 0, this.bracket = void 0;
  };
  return m.prototype.setLimit = function(g, l) {
    l.specialY[g] && (l.staff.specialY[g] ? l.staff.specialY[g] = Math.max(l.staff.specialY[g], l.specialY[g]) : l.staff.specialY[g] = l.specialY[g]);
  }, m.prototype.addVoice = function(g, l, r) {
    var o = this.voices.length;
    this.voices[o] = g, this.staffs[l] ? this.staffs[l].voices.push(o) : this.staffs[this.staffs.length] = {
      top: 10,
      bottom: 2,
      lines: r,
      voices: [o],
      specialY: {
        tempoHeightAbove: 0,
        partHeightAbove: 0,
        volumeHeightAbove: 0,
        dynamicHeightAbove: 0,
        endingHeightAbove: 0,
        chordHeightAbove: 0,
        lyricHeightAbove: 0,
        lyricHeightBelow: 0,
        chordHeightBelow: 0,
        volumeHeightBelow: 0,
        dynamicHeightBelow: 0
      }
    }, g.staff = this.staffs[l];
  }, m.prototype.setHeight = function() {
    this.height = _(this);
  }, m.prototype.setWidth = function(g) {
    this.w = g;
    for (var l = 0; l < this.voices.length; l++)
      this.voices[l].setWidth(g);
  }, m.prototype.setStaffLimits = function(g) {
    g.staff.top = Math.max(g.staff.top, g.top), g.staff.bottom = Math.min(g.staff.bottom, g.bottom), this.setLimit("tempoHeightAbove", g), this.setLimit("partHeightAbove", g), this.setLimit("volumeHeightAbove", g), this.setLimit("dynamicHeightAbove", g), this.setLimit("endingHeightAbove", g), this.setLimit("chordHeightAbove", g), this.setLimit("lyricHeightAbove", g), this.setLimit("lyricHeightBelow", g), this.setLimit("chordHeightBelow", g), this.setLimit("volumeHeightBelow", g), this.setLimit("dynamicHeightBelow", g);
  }, Qt = m, Qt;
}
var Jt, ln;
function lo() {
  if (ln) return Jt;
  ln = 1;
  var _ = De(), m = Te(), g = function(r, o, a) {
    this.type = "TempoElement", this.tempo = r, this.tempo.type = "tempo", this.tuneNumber = o, this.totalHeightInPitches = 6, this.tempoHeightAbove = this.totalHeightInPitches, this.pitch = void 0, this.tempo.duration && !this.tempo.suppressBpm && (this.note = this.createNote(a, r, o));
  };
  return g.prototype.setX = function(l) {
    this.x = l;
  }, g.prototype.createNote = function(l, r, o) {
    var a = 0.75, s = r.duration[0], p = new _(r, s, 1, "tempo", o), u, d, f;
    s <= 1 / 32 ? (f = "noteheads.quarter", d = "flags.u32nd", u = 0) : s <= 1 / 16 ? (f = "noteheads.quarter", d = "flags.u16th", u = 0) : s <= 3 / 32 ? (f = "noteheads.quarter", d = "flags.u16nd", u = 1) : s <= 1 / 8 ? (f = "noteheads.quarter", d = "flags.u8th", u = 0) : s <= 3 / 16 ? (f = "noteheads.quarter", d = "flags.u8th", u = 1) : s <= 1 / 4 ? (f = "noteheads.quarter", u = 0) : s <= 3 / 8 ? (f = "noteheads.quarter", u = 1) : s <= 1 / 2 ? (f = "noteheads.half", u = 0) : s <= 3 / 4 ? (f = "noteheads.half", u = 1) : s <= 1 ? (f = "noteheads.whole", u = 0) : s <= 1.5 ? (f = "noteheads.whole", u = 1) : s <= 2 ? (f = "noteheads.dbl", u = 0) : (f = "noteheads.dbl", u = 1);
    var i = l(
      p,
      f,
      { verticalPos: 0 },
      // This is just temporary: we'll offset the vertical positioning when we get the actual vertical spot.
      { dir: "up", flag: d, dot: u, scale: a }
    ), n = i.notehead;
    p.addHead(n);
    var t;
    if (f !== "noteheads.whole" && f !== "noteheads.dbl") {
      var e = 0.3333333333333333 * a, c = 5 * a, v = n.dx + n.w, h = -0.6;
      t = new m(null, v, 0, e, { type: "stem", pitch2: c, linewidth: h }), p.addRight(t);
    }
    return p;
  }, Jt = g, Jt;
}
var Zt, fn;
function fo() {
  if (fn) return Zt;
  fn = 1;
  var _ = function(g, l, r) {
    this.type = "TripletElem", this.anchor1 = l, this.number = g, this.durationClass = ("d" + Math.round(l.parent.durationClass * 1e3) / 1e3).replace(/\./, "-"), this.middleElems = [], this.flatBeams = r.flatBeams;
  };
  return _.prototype.isClosed = function() {
    return !!this.anchor2;
  }, _.prototype.middleNote = function(m) {
    this.middleElems.push(m);
  }, _.prototype.setCloseAnchor = function(m) {
    this.anchor2 = m, (!this.anchor1.parent.beam || this.anchor1.stemDir === "up") && (this.endingHeightAbove = 4);
  }, Zt = _, Zt;
}
var e0, hn;
function ho() {
  if (hn) return e0;
  hn = 1;
  function _(g) {
    switch (g) {
      case "B#":
        return "H#";
      case "B♯":
        return "H♯";
      case "B":
        return "H";
      case "Bb":
        return "B";
      case "B♭":
        return "B";
    }
    return g;
  }
  function m(g, l, r) {
    var o = g.split(`
`);
    for (let a = 0; a < o.length; a++) {
      let p = o[a].match(/^([ABCDEFG][♯♭]?)?([^\/]+)?(\/([ABCDEFG][#b♯♭]?))?/);
      if (!p)
        continue;
      let u = p[1] || "", d = p[2] || "", f = p[4] || "";
      r && (u = _(u), f = _(f));
      const i = l ? "" : "", n = f ? "/" + f : "";
      o[a] = [u, d, n].join(i);
    }
    return o.join(`
`);
  }
  return e0 = m, e0;
}
var t0, un;
function uo() {
  if (un) return t0;
  un = 1;
  var _ = Te(), m = Ce();
  const g = ho();
  var l = function(o, a, s, p, u, d, f, i) {
    for (var n = 0; n < s.chord.length; n++) {
      var t = s.chord[n].position, e = s.chord[n].rel_position, c = t === "left" || t === "right" || t === "below" || t === "above" || !!e, v, h;
      c ? (v = "annotationfont", h = "abcjs-annotation") : (v = "gchordfont", h = "abcjs-chord");
      var y = o.attr(v, h), w = s.chord[n].name, A;
      if (typeof w == "string")
        A = r(w, t, e, c, v, h, y, o, a, s, p, u, d, f, i), p = A.roomTaken, u = A.roomTakenRight;
      else
        for (var P = 0; P < w.length; P++)
          A = r(w[P].text, t, e, c, v, h, y, o, a, s, p, u, d, f, i), p = A.roomTaken, u = A.roomTakenRight;
    }
    return { roomTaken: p, roomTakenRight: u };
  };
  function r(o, a, s, p, u, d, f, i, n, t, e, c, v, h, y) {
    for (var w = o.split(`
`), A = w.length - 1; A >= 0; A--) {
      var P = w[A], N = 0, T;
      p || (P = g(P, h, y));
      var q = i.calc(P, u, d), I = q.width, C = q.height / m.STEP;
      switch (a) {
        case "left":
          e += I + 7, N = -e, T = t.averagepitch, n.addExtra(new _(P, N, I + 4, T, {
            type: "text",
            height: C,
            dim: f,
            position: "left"
          }));
          break;
        case "right":
          c += 4, N = c, T = t.averagepitch, n.addRight(new _(P, N, I + 4, T, {
            type: "text",
            height: C,
            dim: f,
            position: "right"
          }));
          break;
        case "below":
          n.addRight(new _(P, 0, 0, void 0, {
            type: "text",
            position: "below",
            height: C,
            dim: f,
            realWidth: I
          }));
          break;
        case "above":
          n.addRight(new _(P, 0, 0, void 0, {
            type: "text",
            position: "above",
            height: C,
            dim: f,
            realWidth: I
          }));
          break;
        default:
          if (s) {
            var B = s.y + 3 * m.STEP;
            n.addRight(new _(P, N + s.x, 0, t.minpitch + B / m.STEP, {
              position: "relative",
              type: "text",
              height: C,
              dim: f
            }));
          } else {
            var R = "above";
            t.positioning && t.positioning.chordPosition && (R = t.positioning.chordPosition), R !== "hidden" && n.addCentered(new _(P, v / 2, I, void 0, {
              type: "chord",
              position: R,
              height: C,
              dim: f,
              realWidth: I
            }));
          }
      }
    }
    return { roomTaken: e, roomTakenRight: c };
  }
  return t0 = l, t0;
}
var r0, dn;
function po() {
  if (dn) return r0;
  dn = 1;
  var _ = De(), m = Ks(), g = Qs(), l = Js(), r = Zs(), o = eo(), a = to(), s = io(), p = so(), u = Ne(), d = Te(), f = Ce(), i = co(), n = lo(), t = cs(), e = fo(), c = rs(), v = uo(), h = es(), y = _e(), w = function(S) {
    var k = 0;
    return S.duration && (k = S.duration), k;
  }, A = !1, P = {
    rest: { 0: "rests.whole", 1: "rests.half", 2: "rests.quarter", 3: "rests.8th", 4: "rests.16th", 5: "rests.32nd", 6: "rests.64th", 7: "rests.128th", multi: "rests.multimeasure" },
    note: { "-1": "noteheads.dbl", 0: "noteheads.whole", 1: "noteheads.half", 2: "noteheads.quarter", 3: "noteheads.quarter", 4: "noteheads.quarter", 5: "noteheads.quarter", 6: "noteheads.quarter", 7: "noteheads.quarter", nostem: "noteheads.quarter" },
    rhythm: { "-1": "noteheads.slash.whole", 0: "noteheads.slash.whole", 1: "noteheads.slash.whole", 2: "noteheads.slash.quarter", 3: "noteheads.slash.quarter", 4: "noteheads.slash.quarter", 5: "noteheads.slash.quarter", 6: "noteheads.slash.quarter", 7: "noteheads.slash.quarter", nostem: "noteheads.slash.nostem" },
    x: { "-1": "noteheads.indeterminate", 0: "noteheads.indeterminate", 1: "noteheads.indeterminate", 2: "noteheads.indeterminate", 3: "noteheads.indeterminate", 4: "noteheads.indeterminate", 5: "noteheads.indeterminate", 6: "noteheads.indeterminate", 7: "noteheads.indeterminate", nostem: "noteheads.indeterminate" },
    harmonic: { "-1": "noteheads.harmonic.quarter", 0: "noteheads.harmonic.quarter", 1: "noteheads.harmonic.quarter", 2: "noteheads.harmonic.quarter", 3: "noteheads.harmonic.quarter", 4: "noteheads.harmonic.quarter", 5: "noteheads.harmonic.quarter", 6: "noteheads.harmonic.quarter", 7: "noteheads.harmonic.quarter", nostem: "noteheads.harmonic.quarter" },
    triangle: { "-1": "noteheads.triangle.quarter", 0: "noteheads.triangle.quarter", 1: "noteheads.triangle.quarter", 2: "noteheads.triangle.quarter", 3: "noteheads.triangle.quarter", 4: "noteheads.triangle.quarter", 5: "noteheads.triangle.quarter", 6: "noteheads.triangle.quarter", 7: "noteheads.triangle.quarter", nostem: "noteheads.triangle.quarter" },
    uflags: { 3: "flags.u8th", 4: "flags.u16th", 5: "flags.u32nd", 6: "flags.u64th" },
    dflags: { 3: "flags.d8th", 4: "flags.d16th", 5: "flags.d32nd", 6: "flags.d64th" }
  }, N = function(S, k, M) {
    this.decoration = new s(), this.getTextSize = S, this.tuneNumber = k, this.isBagpipes = M.bagpipes, this.flatBeams = M.flatbeams, this.graceSlurs = M.graceSlurs, this.percmap = M.percmap, this.initialClef = M.initialClef, this.jazzchords = !!M.jazzchords, this.accentAbove = !!M.accentAbove, this.germanAlphabet = !!M.germanAlphabet, this.reset();
  };
  N.prototype.reset = function() {
    this.slurs = {}, this.ties = [], this.voiceScale = 1, this.voiceColor = void 0, this.slursbyvoice = {}, this.tiesbyvoice = {}, this.endingsbyvoice = {}, this.scaleByVoice = {}, this.colorByVoice = {}, this.tripletmultiplier = 1, this.abcline = void 0, this.accidentalSlot = void 0, this.accidentalshiftx = void 0, this.dotshiftx = void 0, this.hasVocals = !1, this.minY = void 0, this.partstartelem = void 0, this.startlimitelem = void 0, this.stemdir = void 0;
  }, N.prototype.setStemHeight = function(S) {
    this.stemHeight = Math.round(S * 10 / f.STEP) / 10;
  }, N.prototype.getCurrentVoiceId = function(S, k) {
    return "s" + S + "v" + k;
  }, N.prototype.pushCrossLineElems = function(S, k) {
    this.slursbyvoice[this.getCurrentVoiceId(S, k)] = this.slurs, this.tiesbyvoice[this.getCurrentVoiceId(S, k)] = this.ties, this.endingsbyvoice[this.getCurrentVoiceId(S, k)] = this.partstartelem, this.scaleByVoice[this.getCurrentVoiceId(S, k)] = this.voiceScale, this.voiceColor && (this.colorByVoice[this.getCurrentVoiceId(S, k)] = this.voiceColor);
  }, N.prototype.popCrossLineElems = function(S, k) {
    this.slurs = this.slursbyvoice[this.getCurrentVoiceId(S, k)] || {}, this.ties = this.tiesbyvoice[this.getCurrentVoiceId(S, k)] || [], this.partstartelem = this.endingsbyvoice[this.getCurrentVoiceId(S, k)], this.voiceScale = this.scaleByVoice[this.getCurrentVoiceId(S, k)], this.voiceScale === void 0 && (this.voiceScale = 1), this.voiceColor = this.colorByVoice[this.getCurrentVoiceId(S, k)];
  }, N.prototype.containsLyrics = function(S) {
    for (var k = 0; k < S.length; k++)
      for (var M = 0; M < S[k].voices.length; M++)
        for (var F = 0; F < S[k].voices[M].length; F++) {
          var L = S[k].voices[M][F];
          if (L.lyric) {
            (!L.positioning || L.positioning.vocalPosition === "below") && (this.hasVocals = !0);
            return;
          }
        }
  }, N.prototype.createABCLine = function(S, k, M) {
    this.minY = 2, this.containsLyrics(S);
    var F = new i(this.getTextSize);
    this.tempoSet = !1;
    for (var L = 0; L < S.length; L++)
      A && this.restoreState(), A = !1, this.createABCStaff(F, S[L], k, L, M);
    return F;
  }, N.prototype.createABCStaff = function(S, k, M, F, L) {
    S.getTextSize.updateFonts(k);
    for (var b = 0; b < k.voices.length; b++) {
      var x = new c(b, k.voices.length);
      b === 0 ? (x.barfrom = k.connectBarLines === "start" || k.connectBarLines === "continue", x.barto = k.connectBarLines === "continue" || k.connectBarLines === "end") : x.duplicate = !0, k.title && k.title[b] && (x.header = k.title[b].replace(/\\n/g, `
`), x.headerPosition = 6 + S.getTextSize.baselineToCenter(x.header, "voicefont", "staff-extra voice-name", b, k.voices.length) / f.STEP), k.clef && k.clef.type === "perc" && (x.isPercussion = !0);
      var E = (!this.initialClef || L === 0) && l(k.clef, this.tuneNumber);
      E && (b === 0 && k.barNumber && this.addMeasureNumber(k.barNumber, E), x.addChild(E), this.startlimitelem = E);
      var D = r(k.key, this.tuneNumber);
      if (D && (x.addChild(D), this.startlimitelem = D), k.meter) {
        k.meter.type === "specified" ? this.measureLength = k.meter.value[0].num / k.meter.value[0].den : this.measureLength = 1;
        var O = a(k.meter, this.tuneNumber);
        x.addChild(O), this.startlimitelem = O;
      }
      x.duplicate && (x.children = []);
      var z = k.clef.stafflines || k.clef.stafflines === 0 ? k.clef.stafflines : 5;
      S.addVoice(x, F, z);
      var H = z === 1;
      this.createABCVoice(k.voices[b], M, F, b, H, x), S.setStaffLimits(x), b === 0 && (k.brace === "start" || !S.brace && k.brace ? (S.brace || (S.brace = []), S.brace.push(new g(x, "brace"))) : k.brace === "end" && S.brace ? S.brace[S.brace.length - 1].setBottomStaff(x) : k.brace === "continue" && S.brace && S.brace[S.brace.length - 1].continuing(x), k.bracket === "start" || !S.bracket && k.bracket ? (S.bracket || (S.bracket = []), S.bracket.push(new g(x, "bracket"))) : k.bracket === "end" && S.bracket ? S.bracket[S.bracket.length - 1].setBottomStaff(x) : k.bracket === "continue" && S.bracket && S.bracket[S.bracket.length - 1].continuing(x));
    }
  };
  function T(S, k) {
    var M = S[k];
    if (M.el_type !== "note" || !M.startBeam || M.endBeam)
      return { count: 1, elem: M };
    for (var F = []; k < S.length && S[k].el_type === "note" && (F.push(S[k]), !S[k].endBeam); )
      k++;
    return { count: F.length, elem: F };
  }
  N.prototype.createABCVoice = function(S, k, M, F, L, b) {
    this.popCrossLineElems(M, F), this.stemdir = this.isBagpipes ? "down" : null, this.abcline = S, this.partstartelem && (this.partstartelem = new p("", null, null), b.addOther(this.partstartelem));
    var x = b.voicetotal < 2 ? -1 : b.voicenumber;
    for (var E in this.slurs)
      this.slurs.hasOwnProperty(E) && (this.slurs[E] = new t({ force: this.slurs[E].force, voiceNumber: x, stemDir: this.slurs[E].stemDir, style: this.slurs[E].dotted }), A && this.slurs[E].setHint(), b.addOther(this.slurs[E]));
    for (var D = 0; D < this.ties.length; D++)
      this.ties[D] = new t({ force: this.ties[D].force, stemDir: this.ties[D].stemDir, voiceNumber: x, style: this.ties[D].dotted }), A && this.ties[D].setHint(), b.addOther(this.ties[D]);
    for (var O = 0; O < this.abcline.length; O++)
      q(this.abcline[O]), this.minY = Math.min(this.abcline[O].minpitch, this.minY);
    for (var z = M === 0, H = 0; H < this.abcline.length; ) {
      var $ = T(this.abcline, H), Q = this.createABCElement(z, L, b, $.elem);
      if (Q)
        for (D = 0; D < Q.length; D++) {
          if (!this.tempoSet && k && !k.suppress) {
            this.tempoSet = !0;
            var W = new _(k, 0, 0, "tempo", this.tuneNumber, {});
            W.addFixedX(new n(k, this.tuneNumber, o)), b.addChild(W);
          }
          b.addChild(Q[D]);
        }
      H += $.count;
    }
    this.decoration.endLine(b), this.pushCrossLineElems(M, F);
  }, N.prototype.saveState = function() {
    this.tiesSave = y.cloneArray(this.ties), this.slursSave = y.cloneHashOfHash(this.slurs), this.slursbyvoiceSave = y.cloneHashOfHash(this.slursbyvoice), this.tiesbyvoiceSave = y.cloneHashOfArrayOfHash(this.tiesbyvoice);
  }, N.prototype.restoreState = function() {
    this.ties = y.cloneArray(this.tiesSave), this.slurs = y.cloneHashOfHash(this.slursSave), this.slursbyvoice = y.cloneHashOfHash(this.slursbyvoiceSave), this.tiesbyvoice = y.cloneHashOfArrayOfHash(this.tiesbyvoiceSave);
  }, N.prototype.createABCElement = function(S, k, M, F) {
    var L = [];
    switch (F.el_type) {
      case void 0:
        L = this.createBeam(k, M, F);
        break;
      case "note":
        L[0] = this.createNote(F, !1, k, M), this.triplet && this.triplet.isClosed() && (M.addOther(this.triplet), this.triplet = null, this.tripletmultiplier = 1);
        break;
      case "bar":
        L[0] = this.createBarLine(M, F, S), M.duplicate && L.length > 0 && (L[0].invisible = !0);
        break;
      case "meter":
        L[0] = a(F, this.tuneNumber), this.startlimitelem = L[0], M.duplicate && L.length > 0 && (L[0].invisible = !0);
        break;
      case "clef":
        if (L[0] = l(F, this.tuneNumber), !L[0]) return null;
        M.duplicate && L.length > 0 && (L[0].invisible = !0);
        break;
      case "key":
        var b = r(F, this.tuneNumber);
        b && (L[0] = b, this.startlimitelem = L[0]), M.duplicate && L.length > 0 && (L[0].invisible = !0);
        break;
      case "stem":
        this.stemdir = F.direction === "auto" ? void 0 : F.direction;
        break;
      case "part":
        var x = new _(F, 0, 0, "part", this.tuneNumber), E = this.getTextSize.calc(F.title, "partsfont", "part");
        x.addFixedX(new d(F.title, 0, 0, void 0, { type: "part", height: E.height / f.STEP })), L[0] = x;
        break;
      case "tempo":
        var D = new _(F, 0, 0, "tempo", this.tuneNumber);
        F.suppress || D.addFixedX(new n(F, this.tuneNumber, o)), L[0] = D;
        break;
      case "style":
        F.head === "normal" ? delete this.style : this.style = F.head;
        break;
      case "hint":
        A = !0, this.saveState();
        break;
      case "midi":
        break;
      case "scale":
        this.voiceScale = F.size;
        break;
      case "color":
        this.voiceColor = F.color, M.color = this.voiceColor;
        break;
      default:
        var O = new _(F, 0, 0, "unsupported", this.tuneNumber);
        O.addFixed(new d("element type " + F.el_type, 0, 0, void 0, { type: "debug" })), L[0] = O;
    }
    return L;
  };
  function q(S) {
    if (S.pitches) {
      I(S);
      for (var k = 0, M = 0; M < S.pitches.length; M++)
        k += S.pitches[M].verticalPos;
      S.averagepitch = k / S.pitches.length, S.minpitch = S.pitches[0].verticalPos, S.maxpitch = S.pitches[S.pitches.length - 1].verticalPos;
    }
  }
  N.prototype.createBeam = function(S, k, M) {
    var F = [], L = new m(this.stemHeight * this.voiceScale, this.stemdir, this.flatBeams, M[0]);
    A && L.setHint();
    for (var b = 0; b < M.length; b++)
      L.runningDirection(M[b]);
    L.setStemDirection();
    var x = this.stemdir;
    for (this.stemdir = L.stemsUp ? "up" : "down", b = 0; b < M.length; b++) {
      var E = M[b], D = this.createNote(E, !0, S, k);
      F.push(D), L.add(D), this.triplet && this.triplet.isClosed() && (k.addOther(this.triplet), this.triplet = null, this.tripletmultiplier = 1);
    }
    return L.calcDir(), k.addBeam(L), this.stemdir = x, F;
  };
  var I = function(S) {
    var k;
    do {
      k = !0;
      for (var M = 0; M < S.pitches.length - 1; M++)
        if (S.pitches[M].pitch > S.pitches[M + 1].pitch) {
          k = !1;
          var F = S.pitches[M];
          S.pitches[M] = S.pitches[M + 1], S.pitches[M + 1] = F;
        }
    } while (!k);
  }, C = function(S, k, M, F, L, b, x, E, D) {
    for (var O = M; O > 11; O--)
      O % 2 === 0 && !F && S.addFixed(new d(null, E, (L + 4) * D, O, { type: "ledger" }));
    for (O = k; O < 1; O++)
      O % 2 === 0 && !F && S.addFixed(new d(null, E, (L + 4) * D, O, { type: "ledger" }));
    for (O = 0; O < b.length; O++) {
      var z = L;
      x === "down" && (z = -z), S.addFixed(new d(null, z + E, (L + 4) * D, b[O], { type: "ledger" }));
    }
  };
  N.prototype.addGraceNotes = function(S, k, M, F, L, b, x) {
    var E = 0.6, D = 3.5 / 5;
    L = Math.round(L * D);
    var O = null, z;
    S.gracenotes.length > 1 && (O = new m(L, "grace", b), A && O.setHint(), O.mainNote = M);
    var H, $ = [];
    for (H = S.gracenotes.length - 1; H >= 0; H--)
      x += 10, $[H] = x, S.gracenotes[H].accidental && (x += 7);
    for (H = 0; H < S.gracenotes.length; H++) {
      var Q = S.gracenotes[H].verticalPos;
      z = O ? null : P.uflags[b ? 5 : 3];
      var W = [], ne = o(
        M,
        "noteheads.quarter",
        S.gracenotes[H],
        { dir: "up", headx: -$[H], extrax: -$[H], flag: z, scale: E * this.voiceScale, accidentalSlot: W }
      );
      ne.notehead.highestVert = ne.notehead.pitch + L;
      var J = ne.notehead;
      if (this.addSlursAndTies(M, S.gracenotes[H], J, k, "up", !0), M.addExtra(J), S.gracenotes[H].acciaccatura) {
        var te = S.gracenotes[H].verticalPos + 7 * E, U = O ? 5 : 6;
        M.addRight(new d("flags.ugrace", -$[H] + U, 0, te, { scalex: E, scaley: E }));
      }
      if (O) {
        var re = S.gracenotes[H].duration / 2;
        b && (re /= 2);
        var V = {
          heads: [J],
          abcelem: { averagepitch: Q, minpitch: Q, maxpitch: Q, duration: re }
        };
        O.add(V);
      } else {
        var oe = Q + 0.3333333333333333 * E, ce = Q + 7 * E, ue = J.dx + J.w, fe = -0.6;
        M.addExtra(new d(null, ue, 0, oe, { type: "stem", pitch2: ce, linewidth: fe }));
      }
      C(M, Q, Q, !1, u.getSymbolWidth("noteheads.quarter"), [], !0, J.dx - 1, 0.6);
      var be = S.rest && (S.rest.type === "spacer" || S.rest.type === "invisible");
      H === 0 && !b && this.graceSlurs && !be && k.addOther(new t({ anchor1: J, anchor2: F, isGrace: !0 }));
    }
    return O && (O.calcDir(), k.addBeam(O)), x;
  };
  function B(S, k, M, F, L, b, x, E, D) {
    var O, z = 7, H, $, Q;
    switch (L && (b === "down" && (z = 3), b === "up" && (z = 11)), x && (M < 0.5 || M < 1 ? z = 7 : z = 5), k.rest.type) {
      case "whole":
        O = P.rest[0], k.averagepitch = z, k.minpitch = z, k.maxpitch = z, F = 0;
        break;
      case "rest":
        k.style === "rhythm" ? O = P.rhythm[-E] : O = P.rest[-E], k.averagepitch = z, k.minpitch = z, k.maxpitch = z;
        break;
      case "invisible":
      case "invisible-multimeasure":
      case "spacer":
        O = "", k.averagepitch = z, k.minpitch = z, k.maxpitch = z;
        break;
      case "multimeasure":
        O = P.rest.multi, k.averagepitch = z, k.minpitch = z, k.maxpitch = z, F = 0;
        var W = u.getSymbolWidth(O);
        S.addHead(new d(O, W, W * 2, 7));
        var ne = new d("" + k.rest.text, W, W, 16, { type: "multimeasure-text" });
        S.addExtra(ne);
    }
    if (k.rest.type.indexOf("multimeasure") < 0 && k.rest.type !== "invisible") {
      var J = o(
        S,
        O,
        { verticalPos: z },
        { dot: F, scale: D }
      );
      H = J.notehead, H && (S.addHead(H), $ = J.accidentalshiftx, Q = J.dotshiftx);
    }
    return { noteHead: H, roomTaken: $, roomTakenRight: Q };
  }
  function R(S, k) {
    for (var M = 0; M < S.length; M++)
      if (JSON.stringify(S[M]) === JSON.stringify(k))
        return;
    S.push(k);
  }
  return N.prototype.addNoteToAbcElement = function(S, k, M, F, L, b, x, E, D) {
    var O = 0, z, H = 0, $ = 0, Q, W, ne = [], J = [], te = 0, U = k.averagepitch >= 6 ? "down" : "up";
    F && (U = F), L = k.style ? k.style : L, (!L || L === "normal") && (L = "note");
    var re;
    b ? re = P[L].nostem : re = P[L][-x], re || console.log("noteSymbol:", L, x, b);
    var V;
    for (V = U === "down" ? k.pitches.length - 2 : 1; U === "down" ? V >= 0 : V < k.pitches.length; V = U === "down" ? V - 1 : V + 1) {
      var oe = k.pitches[U === "down" ? V + 1 : V - 1], ce = k.pitches[V], ue = U === "down" ? oe.pitch - ce.pitch : ce.pitch - oe.pitch;
      ue <= 1 && !oe.printer_shift && (ce.printer_shift = ue ? "different" : "same", (ce.verticalPos > 11 || ce.verticalPos < 1) && ne.push(ce.verticalPos - ce.verticalPos % 2), U === "down" ? H = u.getSymbolWidth(re) + 2 : O = u.getSymbolWidth(re) + 2);
    }
    var fe = k.pitches.length;
    for (V = 0; V < k.pitches.length; V++) {
      if (!E) {
        var be;
        U === "down" && V !== 0 || U === "up" && V !== fe - 1 ? be = null : be = P[U === "down" ? "dflags" : "uflags"][-x];
      }
      var ge;
      if (k.pitches[V].style)
        ge = P[k.pitches[V].style][-x];
      else if (D.isPercussion && this.percmap) {
        ge = re;
        var ye = this.percmap[h(k.pitches[V])];
        ye && ye.noteHead && P[ye.noteHead] && (ge = P[ye.noteHead][-x]);
      } else
        ge = re;
      k.pitches[V].highestVert = k.pitches[V].verticalPos;
      var Y = (F === "up" || U === "up") && V === 0, j = (F === "down" || U === "down") && V === fe - 1;
      if (Y || j) {
        if ((k.startSlur || fe === 1) && (k.pitches[V].highestVert = k.pitches[fe - 1].verticalPos, w(k) < 1 && (F === "up" || U === "up") && (k.pitches[V].highestVert += 6)), k.startSlur)
          for (k.pitches[V].startSlur || (k.pitches[V].startSlur = []), W = 0; W < k.startSlur.length; W++)
            R(k.pitches[V].startSlur, k.startSlur[W]);
        if (k.endSlur)
          for (k.pitches[V].highestVert = k.pitches[fe - 1].verticalPos, w(k) < 1 && (F === "up" || U === "up") && (k.pitches[V].highestVert += 6), k.pitches[V].endSlur || (k.pitches[V].endSlur = []), W = 0; W < k.endSlur.length; W++)
            R(k.pitches[V].endSlur, k.endSlur[W]);
      }
      var G = !E && x <= -1, X = fe > 1 ? V + 1 : null, K = o(
        S,
        ge,
        k.pitches[V],
        { dir: U, extrax: -H, flag: be, dot: M, dotshiftx: O, scale: this.voiceScale, accidentalSlot: J, shouldExtendStem: !F, printAccidentals: !D.isPercussion, chordPos: X }
      );
      te = Math.max(u.getSymbolWidth(ge), te), S.extraw -= K.extraLeft, z = K.notehead, z && (this.addSlursAndTies(S, k.pitches[V], z, D, G ? U : null, !1), k.gracenotes && k.gracenotes.length > 0 && (z.bottom = z.bottom - 1), S.addHead(z)), H += K.accidentalshiftx, $ = Math.max($, K.dotshiftx);
    }
    if (G) {
      var Z = Math.round(70 * this.voiceScale) / 10, ae = U === "down" ? k.minpitch - Z : k.minpitch + 1 / 3;
      ae > 6 && !F && (ae = 6);
      var le = U === "down" ? k.maxpitch - 1 / 3 : k.maxpitch + Z;
      le < 6 && !F && (le = 6);
      var ee = U === "down" || S.heads.length === 0 ? 0 : S.heads[0].w, se = U === "down" ? 1 : -1;
      z && z.c === "noteheads.slash.quarter" && (U === "down" ? le -= 1 : ae += 1), z && z.c === "noteheads.triangle.quarter" && (U === "down" ? le -= 0.7 : ae -= 1.2), S.addRight(new d(null, ee, 0, ae, { type: "stem", pitch2: le, linewidth: se, bottom: ae - 1 })), Q = Math.min(ae, le);
    }
    return { noteHead: z, roomTaken: H, roomTakenRight: $, min: Q, additionalLedgers: ne, dir: U, symbolWidth: te };
  }, N.prototype.addLyric = function(S, k, M) {
    var F = "";
    k.lyric.forEach(function(x) {
      var E = x.divider === " " ? "" : x.divider;
      F += x.syllable + E + `
`;
    });
    var L = this.getTextSize.calc(F, "vocalfont", "lyric"), b = k.positioning ? k.positioning.vocalPosition : "below";
    S.addCentered(new d(F, 0, L.width, void 0, { type: "lyric", position: b, height: L.height / f.STEP, dim: this.getTextSize.attr("vocalfont", "lyric"), voiceNumber: M }));
  }, N.prototype.createNote = function(S, k, M, F) {
    var L = null, b = 0, x = 0, E = 0, D = [], O, z = w(S), H = !1;
    z === 0 && (H = !0, z = 0.25, k = !0);
    for (var $ = Math.floor(Math.log(z) / Math.log(2)), Q = 0, W = Math.pow(2, $), ne = W / 2; W < z; Q++, W += ne, ne /= 2) ;
    S.startTriplet && (this.tripletmultiplier = S.tripletMultiplier);
    var J = z * this.tripletmultiplier;
    S.rest && S.rest.type === "multimeasure" && (J = 1), S.rest && S.rest.type === "invisible-multimeasure" && (J = this.measureLength * S.rest.text);
    var te = S.rest ? "rest" : "note", U = new _(S, J, 1, te, this.tuneNumber, { durationClassOveride: S.duration * this.tripletmultiplier });
    if (A && U.setHint(), S.rest) {
      this.measureLength === z && S.rest.type !== "invisible" && S.rest.type !== "spacer" && S.rest.type.indexOf("multimeasure") < 0 && (S.rest.type = "whole");
      var re = B(U, S, z, Q, F.voicetotal > 1, this.stemdir, M, $, this.voiceScale);
      L = re.noteHead, b = re.roomTaken, x = re.roomTakenRight;
    } else {
      var V = this.addNoteToAbcElement(U, S, Q, this.stemdir, this.style, H, $, k, F);
      V.min !== void 0 && (this.minY = Math.min(V.min, this.minY)), L = V.noteHead, b = V.roomTaken, x = V.roomTakenRight, D = V.additionalLedgers, O = V.dir, E = V.symbolWidth;
    }
    if (S.lyric !== void 0 && this.addLyric(U, S, F.voicenumber), S.gracenotes !== void 0 && (b += this.addGraceNotes(S, F, U, L, this.stemHeight * this.voiceScale, this.isBagpipes, b)), S.decoration) {
      var oe = k && O !== "up" ? Math.min(-3, U.bottom - 6) : U.bottom;
      this.decoration.createDecoration(F, S.decoration, U.top, L ? L.w : 0, U, b, O, oe, S.positioning, this.hasVocals, this.accentAbove);
    }
    if (S.barNumber && U.addFixed(new d(S.barNumber, -10, 0, 0, { type: "barNumber" })), C(U, S.minpitch, S.maxpitch, S.rest, E, D, O, -2, 1), S.chord !== void 0) {
      var ce = v(this.getTextSize, U, S, b, x, E, this.jazzchords, this.germanAlphabet);
      b = ce.roomTaken, x = ce.roomTakenRight;
    }
    return S.startTriplet && (this.triplet = new e(S.startTriplet, L, { flatBeams: this.flatBeams })), S.endTriplet && this.triplet && this.triplet.setCloseAnchor(L), this.triplet && !S.startTriplet && !S.endTriplet && !(S.rest && S.rest.type === "spacer") && this.triplet.middleNote(L), U;
  }, N.prototype.addSlursAndTies = function(S, k, M, F, L, b) {
    if (k.endTie && this.ties.length > 0) {
      for (var x = !1, E = 0; E < this.ties.length; E++)
        if (this.ties[E].anchor1 && this.ties[E].anchor1.pitch === M.pitch) {
          this.ties[E].setEndAnchor(M), F.setRange(this.ties[E]), this.ties.splice(E, 1), x = !0;
          break;
        }
      x || (this.ties[0].setEndAnchor(M), F.setRange(this.ties[0]), this.ties.splice(0, 1));
    }
    var D = F.voicetotal < 2 ? -1 : F.voicenumber;
    if (k.startTie) {
      var O = new t({ anchor1: M, force: this.stemdir === "down" || this.stemdir === "up", stemDir: this.stemdir, isGrace: b, voiceNumber: D, style: k.startTie.style });
      A && O.setHint(), this.ties[this.ties.length] = O, F.addOther(O), S.startTie = !0;
    }
    var z, H;
    if (k.endSlur)
      for (var $ = 0; $ < k.endSlur.length; $++)
        H = k.endSlur[$], this.slurs[H] ? (z = this.slurs[H], z.setEndAnchor(M), F.setRange(z), delete this.slurs[H]) : (z = new t({ anchor2: M, stemDir: this.stemdir, voiceNumber: D }), A && z.setHint(), F.addOther(z)), this.startlimitelem && z.setStartX(this.startlimitelem);
    else if (!b)
      for (var Q in this.slurs)
        this.slurs.hasOwnProperty(Q) && this.slurs[Q].addInternalNote(M);
    if (k.startSlur)
      for ($ = 0; $ < k.startSlur.length; $++)
        H = k.startSlur[$].label, z = new t({ anchor1: M, stemDir: this.stemdir, voiceNumber: D, style: k.startSlur[$].style }), A && z.setHint(), this.slurs[H] = z, F.addOther(z);
  }, N.prototype.addMeasureNumber = function(S, k) {
    var M = this.getTextSize.calc(S, "measurefont", "bar-number"), F = 0;
    k.isClef && (F += M.width / 2);
    var L = M.width > 10 && k.abcelem.type === "treble" ? 13.5 : 11;
    k.addFixed(new d(S, F, M.width, L + M.height / f.STEP, { type: "barNumber", dim: this.getTextSize.attr("measurefont", "bar-number") }));
  }, N.prototype.createBarLine = function(S, k, M) {
    var F = new _(k, 0, 10, "bar", this.tuneNumber), L = null, b = 0;
    k.barNumber && this.addMeasureNumber(k.barNumber, F);
    var x = k.type === "bar_right_repeat" || k.type === "bar_dbl_repeat", E = k.type !== "bar_left_repeat" && k.type !== "bar_thick_thin" && k.type !== "bar_invisible", D = k.type === "bar_right_repeat" || k.type === "bar_dbl_repeat" || k.type === "bar_left_repeat" || k.type === "bar_thin_thick" || k.type === "bar_thick_thin", O = k.type === "bar_left_repeat" || k.type === "bar_thick_thin" || k.type === "bar_thin_thin" || k.type === "bar_dbl_repeat", z = k.type === "bar_left_repeat" || k.type === "bar_dbl_repeat";
    if (x || z) {
      for (var H in this.slurs)
        this.slurs.hasOwnProperty(H) && this.slurs[H].setEndX(F);
      this.startlimitelem = F;
    }
    if (x && (F.addRight(new d("dots.dot", b, 1, 7)), F.addRight(new d("dots.dot", b, 1, 5)), b += 6), E && (L = new d(null, b, 1, 2, { type: "bar", pitch2: 10, linewidth: 0.6 }), F.addRight(L)), k.type === "bar_invisible" && (L = new d(null, b, 1, 2, { type: "none", pitch2: 10, linewidth: 0.6 }), F.addRight(L)), k.decoration && this.decoration.createDecoration(S, k.decoration, 12, D ? 3 : 1, F, 0, "down", 2, k.positioning, this.hasVocals, this.accentAbove), D && (b += 4, L = new d(null, b, 4, 2, { type: "bar", pitch2: 10, linewidth: 4 }), F.addRight(L), b += 5), this.partstartelem && k.endEnding && (this.partstartelem.anchor2 = L, this.partstartelem = null), O && (b += 3, L = new d(null, b, 1, 2, { type: "bar", pitch2: 10, linewidth: 0.6 }), F.addRight(L)), z && (b += 3, F.addRight(new d("dots.dot", b, 1, 7)), F.addRight(new d("dots.dot", b, 1, 5))), k.startEnding && M && S.voicenumber === 0) {
      var $ = this.getTextSize.calc(k.startEnding, "repeatfont", "").width;
      F.minspacing += $ + 10, this.partstartelem = new p(k.startEnding, L, null), S.addOther(this.partstartelem);
    }
    return F.extraw -= 5, k.chord !== void 0 && v(this.getTextSize, F, k, 0, 0, 0, !1, this.germanAlphabet), F;
  }, r0 = N, r0;
}
var a0, pn;
function vo() {
  if (pn) return a0;
  pn = 1;
  var _ = "http://www.w3.org/2000/svg";
  function m(a) {
    this.svg = o(), this.currentGroup = [], a.appendChild(this.svg);
  }
  m.prototype.clear = function() {
    if (this.svg) {
      var a = this.svg.parentNode;
      this.svg = o(), this.currentGroup = [], a && (a.innerHTML = "", a.appendChild(this.svg));
    }
  }, m.prototype.setTitle = function(a) {
    var s = document.createElement("title"), p = document.createTextNode(a);
    s.appendChild(p), this.svg.insertBefore(s, this.svg.firstChild);
  }, m.prototype.setResponsiveWidth = function(a, s) {
    if (this.svg.setAttribute("viewBox", "0 0 " + a + " " + s), this.svg.setAttribute("preserveAspectRatio", "xMinYMin meet"), this.svg.removeAttribute("height"), this.svg.removeAttribute("width"), this.svg.style.display = "inline-block", this.svg.style.position = "absolute", this.svg.style.top = "0", this.svg.style.left = "0", this.svg.parentNode) {
      var p = this.svg.parentNode.getAttribute("class");
      p ? p.indexOf("abcjs-container") < 0 && this.svg.parentNode.setAttribute("class", p + " abcjs-container") : this.svg.parentNode.setAttribute("class", "abcjs-container"), this.svg.parentNode.style.display = "inline-block", this.svg.parentNode.style.position = "relative", this.svg.parentNode.style.width = "100%";
      var u = s / a * 100;
      this.svg.parentNode.style["padding-bottom"] = u + "%", this.svg.parentNode.style["vertical-align"] = "middle", this.svg.parentNode.style.overflow = "hidden";
    }
  }, m.prototype.setSize = function(a, s) {
    this.svg.setAttribute("width", a), this.svg.setAttribute("height", s);
  }, m.prototype.setAttribute = function(a, s) {
    this.svg.setAttribute(a, s);
  }, m.prototype.setScale = function(a) {
    a !== 1 ? (this.svg.style.transform = "scale(" + a + "," + a + ")", this.svg.style["-ms-transform"] = "scale(" + a + "," + a + ")", this.svg.style["-webkit-transform"] = "scale(" + a + "," + a + ")", this.svg.style["transform-origin"] = "0 0", this.svg.style["-ms-transform-origin-x"] = "0", this.svg.style["-ms-transform-origin-y"] = "0", this.svg.style["-webkit-transform-origin-x"] = "0", this.svg.style["-webkit-transform-origin-y"] = "0") : (this.svg.style.transform = "", this.svg.style["-ms-transform"] = "", this.svg.style["-webkit-transform"] = "");
  }, m.prototype.insertStyles = function(a) {
    var s = document.createElementNS(_, "style");
    s.textContent = a, this.svg.insertBefore(s, this.svg.firstChild);
  }, m.prototype.setParentStyles = function(a) {
    for (var s in a)
      a.hasOwnProperty(s) && this.svg.parentNode && (this.svg.parentNode.style[s] = a[s]);
    if (this.dummySvg) {
      var p = document.querySelector("body");
      p.removeChild(this.dummySvg), this.dummySvg = null;
    }
  };
  function g(a, s, p) {
    var u = p - a;
    return "M " + a + " " + s + " l " + u + " 0 l 0 1  l " + -u + " 0  z ";
  }
  function l(a, s, p) {
    var u = p - s;
    return "M " + a + " " + s + " l 0 " + u + " l 1 0  l 0 " + -u + "  z ";
  }
  m.prototype.rect = function(a) {
    var s = [], p = a.x, u = a.y, d = a.x + a.width, f = a.y + a.height;
    return s.push(g(p, u, d)), s.push(g(p, f, d)), s.push(l(d, u, f)), s.push(l(p, f, u)), this.path({ path: s.join(" "), stroke: "none", "data-name": a["data-name"] });
  }, m.prototype.dottedLine = function(a) {
    var s = document.createElementNS(_, "line");
    s.setAttribute("x1", a.x1), s.setAttribute("x2", a.x2), s.setAttribute("y1", a.y1), s.setAttribute("y2", a.y2), s.setAttribute("stroke", a.stroke), s.setAttribute("stroke-dasharray", "5,5"), this.svg.insertBefore(s, this.svg.firstChild);
  }, m.prototype.rectBeneath = function(a) {
    var s = document.createElementNS(_, "rect");
    s.setAttribute("x", a.x), s.setAttribute("width", a.width), s.setAttribute("y", a.y), s.setAttribute("height", a.height), a.stroke && s.setAttribute("stroke", a.stroke), a["stroke-opacity"] && s.setAttribute("stroke-opacity", a["stroke-opacity"]), a.fill && s.setAttribute("fill", a.fill), a["fill-opacity"] && s.setAttribute("fill-opacity", a["fill-opacity"]), this.svg.insertBefore(s, this.svg.firstChild);
  }, m.prototype.text = function(a, s, p, u) {
    var d = document.createElementNS(_, "text");
    d.setAttribute("stroke", "none");
    for (var f in s)
      s.hasOwnProperty(f) && d.setAttribute(f, s[f]);
    for (var i = s["data-name"] == "free-text", n = ("" + a).split(`
`), t = 0; t < n.length; t++)
      if (!(i && n[t] == "")) {
        var e = document.createElementNS(_, "tspan");
        if (u)
          for (var c in u)
            u.hasOwnProperty(c) && e.setAttribute(c, u[c]);
        if (e.setAttribute("x", s.x ? s.x : 0), t !== 0 && e.setAttribute("dy", "1.2em"), n[t].indexOf("") !== -1) {
          var v = n[t].split("");
          if (e.textContent = v[0], v[1]) {
            var h = document.createElementNS(_, "tspan");
            h.setAttribute("dy", "-0.3em"), h.setAttribute("style", "font-size:0.7em"), h.textContent = v[1], e.appendChild(h);
          }
          if (v[2]) {
            var y = v[1] ? "0.4em" : "0.1em", w = document.createElementNS(_, "tspan");
            w.setAttribute("dy", y), w.setAttribute("style", "font-size:0.7em"), w.textContent = v[2], e.appendChild(w);
          }
        } else
          i && n[t].trim() == "" ? e.innerHTML = "&nbsp;" : e.textContent = n[t];
        d.appendChild(e);
      }
    return p ? p.appendChild(d) : this.append(d), d;
  }, m.prototype.richTextLine = function(a, s, p, u, d, f) {
    var i = document.createElementNS(_, "text");
    i.setAttribute("stroke", "none"), i.setAttribute("class", u), i.setAttribute("x", s), i.setAttribute("y", p), i.setAttribute("text-anchor", d), i.setAttribute("dominant-baseline", "middle");
    for (var n = 0; n < a.length; n++) {
      for (var t = a[n], e = document.createElementNS(_, "tspan"), c = Object.keys(t.attrs), v = 0; v < c.length; v++) {
        var h = t.attrs[c[v]];
        h !== "" && e.setAttribute(c[v], h);
      }
      e.textContent = t.content, i.appendChild(e);
    }
    return f ? f.appendChild(i) : this.append(i), i;
  }, m.prototype.guessWidth = function(a, s) {
    var p = this.createDummySvg(), u = this.text(a, s, p), d;
    try {
      d = u.getBBox(), isNaN(d.height) || !d.height ? d = { width: s["font-size"] / 2, height: s["font-size"] + 2 } : d = { width: d.width, height: d.height };
    } catch {
      d = { width: s["font-size"] / 2, height: s["font-size"] + 2 };
    }
    return p.removeChild(u), d;
  }, m.prototype.createDummySvg = function() {
    if (!this.dummySvg) {
      this.dummySvg = o();
      var a = [
        "display: block !important;",
        "height: 1px;",
        "width: 1px;",
        "position: absolute;"
      ];
      this.dummySvg.setAttribute("style", a.join(""));
      var s = document.querySelector("body");
      s.appendChild(this.dummySvg);
    }
    return this.dummySvg;
  };
  var r = {};
  m.prototype.getTextSize = function(a, s, p) {
    if (typeof a == "number" && (a = "" + a), !a || a.match(/^\s+$/))
      return { width: 0, height: 0 };
    var u;
    if (a.length < 20 && (u = a + JSON.stringify(s), r[u]))
      return r[u];
    var d = !p;
    p || (p = this.text(a, s));
    var f;
    try {
      f = p.getBBox(), isNaN(f.height) || !f.height ? f = this.guessWidth(a, s) : f = { width: f.width, height: f.height };
    } catch {
      f = this.guessWidth(a, s);
    }
    return d && (this.currentGroup.length > 0 ? this.currentGroup[0].removeChild(p) : this.svg.removeChild(p)), u && (r[u] = f), f;
  }, m.prototype.openGroup = function(a) {
    a = a || {};
    var s = document.createElementNS(_, "g");
    return a.klass && s.setAttribute("class", a.klass), a.fill && s.setAttribute("fill", a.fill), a.stroke && s.setAttribute("stroke", a.stroke), a["data-name"] && s.setAttribute("data-name", a["data-name"]), a.prepend ? this.prepend(s) : this.append(s), this.currentGroup.unshift(s), s;
  }, m.prototype.closeGroup = function() {
    var a = this.currentGroup.shift();
    return a && a.children.length === 0 ? (a.parentElement.removeChild(a), null) : a;
  }, m.prototype.path = function(a) {
    var s = document.createElementNS(_, "path");
    for (var p in a)
      a.hasOwnProperty(p) && (p === "path" ? s.setAttributeNS(null, "d", a.path) : p === "klass" ? s.setAttributeNS(null, "class", a[p]) : a[p] !== void 0 && s.setAttributeNS(null, p, a[p]));
    return this.append(s), s;
  }, m.prototype.pathToBack = function(a) {
    var s = document.createElementNS(_, "path");
    for (var p in a)
      a.hasOwnProperty(p) && (p === "path" ? s.setAttributeNS(null, "d", a.path) : p === "klass" ? s.setAttributeNS(null, "class", a[p]) : s.setAttributeNS(null, p, a[p]));
    return this.prepend(s), s;
  }, m.prototype.lineToBack = function(a) {
    for (var s = document.createElementNS(_, "line"), p = Object.keys(a), u = 0; u < p.length; u++)
      s.setAttribute(p[u], a[p[u]]);
    return this.prepend(s), s;
  }, m.prototype.append = function(a) {
    this.currentGroup.length > 0 ? this.currentGroup[0].appendChild(a) : this.svg.appendChild(a);
  }, m.prototype.prepend = function(a) {
    this.currentGroup.length > 0 ? this.currentGroup[0].appendChild(a) : this.svg.insertBefore(a, this.svg.firstChild);
  }, m.prototype.setAttributeOnElement = function(a, s) {
    for (var p in s)
      s.hasOwnProperty(p) && a.setAttributeNS(null, p, s[p]);
  }, m.prototype.moveElementToChild = function(a, s) {
    a.appendChild(s);
  };
  function o() {
    var a = document.createElementNS(_, "svg");
    return a.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink"), a.setAttribute("role", "img"), a.setAttribute("fill", "currentColor"), a.setAttribute("stroke", "currentColor"), a;
  }
  return a0 = m, a0;
}
var n0, vn;
function go() {
  if (vn) return n0;
  vn = 1;
  var _ = Ce(), m = vo(), g = function(l) {
    this.paper = new m(l), this.controller = null, this.space = 3 * _.SPACE, this.padding = {}, this.reset(), this.firefox = navigator.userAgent.indexOf("Firefox/") >= 0;
  };
  return g.prototype.reset = function() {
    this.paper.clear(), this.y = 0, this.abctune = null, this.path = null, this.isPrint = !1, this.lineThickness = 0, this.initVerticalSpace();
  }, g.prototype.newTune = function(l) {
    this.abctune = l, this.setVerticalSpace(l.formatting), this.isPrint = l.media === "print", this.setPadding(l);
  }, g.prototype.setLineThickness = function(l) {
    this.lineThickness = l;
  }, g.prototype.setPaddingOverride = function(l) {
    this.paddingOverride = {
      top: l.paddingtop,
      bottom: l.paddingbottom,
      right: l.paddingright,
      left: l.paddingleft
    };
  }, g.prototype.setPadding = function(l) {
    function r(o, a, s, p, u) {
      l.formatting[s] !== void 0 ? o.padding[a] = l.formatting[s] : o.paddingOverride[a] !== void 0 ? o.padding[a] = o.paddingOverride[a] : o.isPrint ? o.padding[a] = p : o.padding[a] = u;
    }
    r(this, "top", "topmargin", 38, 15), r(this, "bottom", "botmargin", 38, 15), r(this, "left", "leftmargin", 68, 15), r(this, "right", "rightmargin", 68, 15);
  }, g.prototype.adjustNonScaledItems = function(l) {
    this.padding.top /= l, this.padding.bottom /= l, this.padding.left /= l, this.padding.right /= l, this.abctune.formatting.headerfont.size /= l, this.abctune.formatting.footerfont.size /= l;
  }, g.prototype.initVerticalSpace = function() {
    this.spacing = {
      composer: 7.56,
      // Set the vertical space above the composer.
      graceBefore: 8.67,
      // Define the space before, inside and after the grace notes.
      graceInside: 10.67,
      graceAfter: 16,
      info: 0,
      // Set the vertical space above the infoline.
      lineSkipFactor: 1.1,
      // Set the factor for spacing between lines of text. (multiply this by the font size)
      music: 7.56,
      // Set the vertical space above the first staff.
      paragraphSkipFactor: 0.4,
      // Set the factor for spacing between text paragraphs. (multiply this by the font size)
      parts: 11.33,
      // Set the vertical space above a new part.
      slurHeight: 1,
      // Set the slur height factor.
      staffSeparation: 61.33,
      // Do not put a staff system closer than <unit> from the previous system.
      staffTopMargin: 0,
      stemHeight: 26.67 + 10,
      // Set the stem height.
      subtitle: 3.78,
      // Set the vertical space above the subtitle.
      systemStaffSeparation: 48,
      // Do not place the staves closer than <unit> inside a system. * This values applies to all staves when in the tune header. Otherwise, it applies to the next staff
      text: 18.9,
      // Set the vertical space above the history.
      title: 7.56,
      // Set the vertical space above the title.
      top: 30.24,
      //Set the vertical space above the tunes and on the top of the continuation pages.
      vocal: 0,
      // Set the vertical space above the lyrics under the staves.
      words: 0
      // Set the vertical space above the lyrics at the end of the tune.
    };
  }, g.prototype.setVerticalSpace = function(l) {
    l.staffsep !== void 0 && (this.spacing.staffSeparation = l.staffsep * 4 / 3), l.composerspace !== void 0 && (this.spacing.composer = l.composerspace * 4 / 3), l.partsspace !== void 0 && (this.spacing.parts = l.partsspace * 4 / 3), l.textspace !== void 0 && (this.spacing.text = l.textspace * 4 / 3), l.musicspace !== void 0 && (this.spacing.music = l.musicspace * 4 / 3), l.titlespace !== void 0 && (this.spacing.title = l.titlespace * 4 / 3), l.sysstaffsep !== void 0 && (this.spacing.systemStaffSeparation = l.sysstaffsep * 4 / 3), l.stafftopmargin !== void 0 && (this.spacing.staffTopMargin = l.stafftopmargin * 4 / 3), l.subtitlespace !== void 0 && (this.spacing.subtitle = l.subtitlespace * 4 / 3), l.topspace !== void 0 && (this.spacing.top = l.topspace * 4 / 3), l.vocalspace !== void 0 && (this.spacing.vocal = l.vocalspace * 4 / 3), l.wordsspace !== void 0 && (this.spacing.words = l.wordsspace * 4 / 3);
  }, g.prototype.calcY = function(l) {
    return this.y - l * _.STEP;
  }, g.prototype.yToPitch = function(l) {
    return l / _.STEP;
  }, g.prototype.moveY = function(l, r) {
    r === void 0 && (r = 1), this.y += l * r;
  }, g.prototype.absolutemoveY = function(l) {
    this.y = l;
  }, n0 = g, n0;
}
var i0, gn;
function bo() {
  if (gn) return i0;
  gn = 1;
  function _(m, g, l, r, o, a) {
    var s = m.text;
    this.rows = [];
    var p;
    g && this.rows.push({ move: g });
    var u = l.calc("textfont", "defined-text");
    if (s === "")
      this.rows.push({ move: u.attr["font-size"] * 2 });
    else if (typeof s == "string") {
      let c = function(v) {
        return v.replace(/^[ \t]*\n/gm, `X
`);
      };
      this.rows.push({ move: u.attr["font-size"] / 2 }), this.rows.push({ left: r, text: s, font: "textfont", klass: "defined-text", anchor: "start", startChar: m.startChar, endChar: m.endChar, absElemType: "freeText", name: "free-text" });
      var d = c(s);
      p = a.calc(d, "textfont", "defined-text"), this.rows.push({ move: p.height });
    } else if (s) {
      for (var f = 0, i = r, n = "textfont", t = 0; t < s.length; t++)
        s[t].font ? n = s[t].font : n = "textfont", this.rows.push({ left: i, text: s[t].text, font: n, klass: "defined-text", anchor: "start", startChar: m.startChar, endChar: m.endChar, absElemType: "freeText", name: "free-text" }), p = a.calc(s[t].text, l.calc(n, "defined-text").font, "defined-text"), i += p.width + p.height / 2, f = Math.max(f, p.height);
      this.rows.push({ move: f });
    } else if (m.length === 1) {
      var e = o / 2;
      this.rows.push({ left: e, text: m[0].text, font: "textfont", klass: "defined-text", anchor: "middle", startChar: m.startChar, endChar: m.endChar, absElemType: "freeText", name: "free-text" }), p = a.calc(m[0].text, "textfont", "defined-text"), this.rows.push({ move: p.height });
    }
  }
  return i0 = _, i0;
}
var s0, bn;
function mo() {
  if (bn) return s0;
  bn = 1;
  function _(m, g, l) {
    this.rows = [], m && this.rows.push({ move: m }), this.rows.push({ separator: g, absElemType: "separator" }), l && this.rows.push({ move: l });
  }
  return s0 = _, s0;
}
var o0, mn;
function yo() {
  if (mn) return o0;
  mn = 1;
  function _(m, g, l, r, o, a) {
    this.rows = [], m && this.rows.push({ move: m });
    var s = g.titleleft ? "start" : "middle", p = g.titleleft ? o : r;
    this.rows.push({ left: p, text: l.text, font: "subtitlefont", klass: "text subtitle", anchor: s, startChar: l.startChar, endChar: l.endChar, absElemType: "subtitle", name: "subtitle" });
    var u = a.calc(l.text, "subtitlefont", "text subtitle");
    this.rows.push({ move: u.height });
  }
  return o0 = _, o0;
}
var c0, yn;
function zr() {
  if (yn) return c0;
  yn = 1;
  function _(m, g, l) {
    if (g.text) {
      g.marginLeft || (g.marginLeft = 0), g.klass || (g.klass = ""), g.anchor || (g.anchor = "start"), g.info || (g.info = { startChar: -2, endChar: -2 }), g.marginTop && m.push({ move: g.marginTop });
      var r = { left: g.marginLeft, text: g.text, font: g.font, anchor: g.anchor, startChar: g.info.startChar, endChar: g.info.endChar, "dominant-baseline": g["dominant-baseline"] };
      g.absElemType && (r.absElemType = g.absElemType), !g.inGroup && g.klass && (r.klass = g.klass), g.name && (r.name = g.name), m.push(r);
      var o = l.calc("A", g.font, g.klass), a = g.text.split(`
`).length;
      if (g.text[g.text.length - 1] === `
` && a--, !g.noMove) {
        var s = o.height * 1.1 * a;
        m.push({ move: Math.round(s) }), g.marginBottom && m.push({ move: g.marginBottom });
      }
    }
  }
  return c0 = _, c0;
}
var l0, wn;
function ls() {
  if (wn) return l0;
  wn = 1;
  const _ = zr();
  function m(g, l, r, o, a, s, p, u) {
    var d = u.calc("i", r, o);
    if (l === "")
      g.push({ move: d.height });
    else {
      if (typeof l == "string") {
        _(g, { marginLeft: s, text: l, font: r, klass: o, marginTop: p.marginTop, anchor: p.anchor, absElemType: p.absElemType, info: p.info, name: a }, u);
        return;
      }
      p.marginTop && g.push({ move: p.marginTop });
      var f = 0, i = {
        left: s,
        anchor: p.anchor,
        phrases: []
      };
      o && (i.klass = o), g.push(i);
      for (var n = 0; n < l.length; n++) {
        var t = l[n], e = t.font ? t.font : u.attr(r, o).font, c = {
          content: t.text
        };
        e && (c.attrs = {
          "font-family": u.getFamily(e.face),
          "font-size": e.size,
          "font-weight": e.weight,
          "font-style": e.style,
          "font-decoration": e.decoration
        }), i.phrases.push(c);
        var v = u.calc(t.text, e, o);
        f = Math.max(f, v.height), t.text[t.text.length - 1] === " " && d.width;
      }
      g.push({ move: f });
    }
  }
  return l0 = m, l0;
}
var f0, xn;
function wo() {
  if (xn) return f0;
  xn = 1;
  const _ = zr(), m = ls();
  function g(l, r, o, a, s, p, u, d, f, i) {
    if (this.rows = [], l.header && p) {
      var n = i.calc("X", "headerfont", "abcjs-header abcjs-meta-top").height;
      _(this.rows, { marginLeft: u, text: l.header.left, font: "headerfont", klass: "header meta-top", marginTop: -n, info: r.header, name: "header" }, i), _(this.rows, { marginLeft: u + s / 2, text: l.header.center, font: "headerfont", klass: "header meta-top", marginTop: -n, anchor: "middle", info: r.header, name: "header" }, i), _(this.rows, { marginLeft: u + s, text: l.header.right, font: "headerfont", klass: "header meta-top", marginTop: -n, anchor: "end", info: r.header, name: "header" }, i);
    }
    p && this.rows.push({ move: d.top });
    var t = o.titleleft ? "start" : "middle", e = o.titleleft ? u : u + s / 2;
    if (l.title) {
      var c = f ? "abcjs-title" : "";
      m(this.rows, l.title, "titlefont", c, "title", e, { marginTop: d.title, anchor: t, absElemType: "title", info: r.title }, i);
    }
    if (a.length)
      for (var v = 0; v < a.length && a[v].subtitle; ) {
        var c = f ? "abcjs-text abcjs-subtitle" : "";
        m(this.rows, a[v].subtitle.text, "subtitlefont", c, "subtitle", e, { marginTop: d.subtitle, anchor: t, absElemType: "subtitle", info: a[v].subtitle }, i), v++;
      }
    if (l.rhythm || l.origin || l.composer) {
      if (this.rows.push({ move: d.composer }), l.rhythm && l.rhythm.length > 0) {
        var h = !!(l.composer || l.origin), c = f ? "abcjs-rhythm" : "";
        _(this.rows, { marginLeft: u, text: l.rhythm, font: "infofont", klass: c, absElemType: "rhythm", noMove: h, info: r.rhythm, name: "rhythm" }, i);
      }
      l.composer && l.composer, l.origin && l.origin;
      var y = l.composer ? l.composer : "";
      if (l.origin && (typeof y == "string" && typeof l.origin == "string" ? y += " (" + l.origin + ")" : typeof y == "string" && typeof l.origin != "string" ? (y = [{ text: y }], y.push({ text: " (" }), y = y.concat(l.origin), y.push({ text: ")" })) : (y.push({ text: " (" }), y = y.concat(l.origin), y.push({ text: ")" }))), y) {
        var c = f ? "abcjs-composer" : "";
        m(this.rows, y, "composerfont", c, "composer", u + s, { anchor: "end", absElemType: "composer", info: r.composer, ingroup: !0 }, i);
      }
    }
    if (l.author && l.author.length > 0) {
      var c = f ? "abcjs-author" : "";
      m(this.rows, l.author, "composerfont", c, "author", u + s, { anchor: "end", absElemType: "author", info: r.author }, i);
    }
    if (l.partOrder && l.partOrder.length > 0) {
      var c = f ? "abcjs-part-order" : "";
      m(this.rows, l.partOrder, "partsfont", c, "part-order", u, { absElemType: "partOrder", info: r.partOrder, anchor: "start" }, i);
    }
  }
  return f0 = g, f0;
}
var h0, Cn;
function xo() {
  if (Cn) return h0;
  Cn = 1;
  const _ = zr(), m = ls();
  function g(o, a, s, p, u, d, f) {
    this.rows = [], o.unalignedWords && o.unalignedWords.length > 0 && this.unalignedWords(o.unalignedWords, p, u, d, f), this.extraText(o, p, u, d, f), o.footer && s && this.footer(o.footer, a, p, f);
  }
  g.prototype.unalignedWords = function(o, a, s, p, u) {
    var d = p ? "abcjs-unaligned-words" : "", f = "wordsfont", i = u.calc("i", f, d);
    this.rows.push({ move: s.words }), r(this.rows, "", o, a, f, "unalignedWords", "unalignedWords", d, "unalignedWords", s, p, u), this.rows.push({ move: i.height });
  };
  function l(o, a, s, p, u, d, f) {
    s && (a && (typeof s == "string" ? s = a + s : s = [{ text: a }].concat(s)), u = d ? "abcjs-extra-text " + u : "", m(o, s, "historyfont", u, "description", p, { absElemType: "extraText", anchor: "start" }, f));
  }
  function r(o, a, s, p, u, d, f, i, n, t, e, c) {
    if (s) {
      i = e ? "abcjs-extra-text " + i : "";
      var v = c.calc("A", u, i);
      if (typeof s == "string")
        a && (s = a + `
` + s), _(o, { marginLeft: p, text: s, font: u, absElemType: "extraText", name: n, "dominant-baseline": "middle", klass: i }, c);
      else {
        o.push({ startGroup: f, klass: i, name: n }), o.push({ move: t.info }), a && (_(o, { marginLeft: p, text: a, font: u, absElemType: "extraText", name: n, "dominant-baseline": "middle" }, c), o.push({ move: v.height * 3 / 4 }));
        for (var h = 0; h < s.length; h++)
          m(o, s[h], u, "", n, p, { anchor: "start" }, c), h < s.length - 1 && typeof s[h] == "string" && typeof s[h + 1] != "string" && o.push({ move: v.height * 3 / 4 });
        o.push({ endGroup: f, absElemType: d, startChar: -1, endChar: -1, name: n }), o.push({ move: v.height });
      }
    }
  }
  return g.prototype.extraText = function(o, a, s, p, u) {
    l(this.rows, "Book: ", o.book, a, "abcjs-book", p, u), l(this.rows, "Source: ", o.source, a, "abcjs-source", p, u), l(this.rows, "Discography: ", o.discography, a, "abcjs-discography", p, u), r(this.rows, "Notes:", o.notes, a, "historyfont", "extraText", "notes", "abcjs-notes", "description", s, p, u), l(this.rows, "Transcription: ", o.transcription, a, "abcjs-transcription", p, u), r(this.rows, "History:", o.history, a, "historyfont", "extraText", "history", "abcjs-history", "description", s, p, u), l(this.rows, "Copyright: ", o["abc-copyright"], a, "abcjs-copyright", p, u), l(this.rows, "Creator: ", o["abc-creator"], a, "abcjs-creator", p, u), l(this.rows, "Edited By: ", o["abc-edited-by"], a, "abcjs-edited-by", p, u);
  }, g.prototype.footer = function(o, a, s, p) {
    var u = "header meta-bottom", d = "footerfont";
    this.rows.push({ startGroup: "footer", klass: u }), _(this.rows, { marginLeft: s, text: o.left, font: d, klass: u, name: "footer" }, p), _(this.rows, { marginLeft: s + a / 2, text: o.center, font: d, klass: u, anchor: "middle", name: "footer" }, p), _(this.rows, { marginLeft: s + a, text: o.right, font: d, klass: u, anchor: "end", name: "footer" }, p);
  }, h0 = g, h0;
}
var u0, kn;
function fs() {
  if (kn) return u0;
  kn = 1;
  function _(g, l, r, o) {
    if (g.indexOf(l) === 0) {
      var a = g.replace(l, ""), s = parseInt(a, 10);
      "" + s === a && (r[o] = s);
    }
  }
  function m(g, l) {
    var r = [];
    if (g.absEl.elemset) {
      for (var o = {}, a = 0; a < g.absEl.elemset.length; a++) {
        var s = g.absEl.elemset[a];
        if (s)
          for (var p = s.getAttribute("class").split(" "), u = 0; u < p.length; u++)
            o[p[u]] = !0;
      }
      for (var d = 0; d < Object.keys(o).length; d++)
        r.push(Object.keys(o)[d]);
    }
    for (var f = {}, i = 0; i < r.length; i++)
      _(r[i], "abcjs-v", f, "voice"), _(r[i], "abcjs-l", f, "line"), _(r[i], "abcjs-m", f, "measure");
    g.staffPos && (f.staffPos = g.staffPos);
    for (var n = l.target; n && n.dataset && !n.dataset.name && n.tagName.toLowerCase() !== "svg"; )
      n = n.parentNode;
    for (var t = l.target; t && t.dataset && !t.dataset.index && t.tagName.toLowerCase() !== "svg"; )
      t = t.parentNode;
    return t && t.dataset && (f.name = t.dataset.name, f.clickedName = n.dataset.name, f.parentClasses = t.classList), n && n.classList && (f.clickedClasses = n.classList), f.selectableElement = g.svgEl, { classes: r, analysis: f };
  }
  return u0 = m, u0;
}
var d0, _n;
function Co() {
  if (_n) return d0;
  _n = 1;
  var _ = Ce(), m = fs();
  function g(T, q) {
    if (T.rangeHighlight = y, T.dragging)
      for (var I = 0; I < T.selectables.length; I++) {
        var C = T.selectables[I];
        C.svgEl.getAttribute("selectable") === "true" && (C.svgEl.setAttribute("tabindex", 0), C.svgEl.setAttribute("data-index", I), C.svgEl.addEventListener("keydown", o.bind(T)), C.svgEl.addEventListener("keyup", a.bind(T)), C.svgEl.addEventListener("focus", r.bind(T)));
      }
    for (var B = 0; B < q.length; B++)
      q[B].addEventListener("touchstart", n.bind(T), { passive: !0 }), q[B].addEventListener("touchmove", t.bind(T), { passive: !0 }), q[B].addEventListener("touchend", e.bind(T), { passive: !0 }), q[B].addEventListener("mousedown", n.bind(T)), q[B].addEventListener("mousemove", t.bind(T)), q[B].addEventListener("mouseup", e.bind(T));
  }
  function l(T) {
    var q = 1, I = 1, C = T.target.closest("svg"), B = 0;
    C && C.viewBox && C.viewBox.baseVal && (C.viewBox.baseVal.width !== 0 && (q = C.viewBox.baseVal.width / C.clientWidth), C.viewBox.baseVal.height !== 0 && (I = C.viewBox.baseVal.height / C.clientHeight), B = C.viewBox.baseVal.y);
    var R = T.target && T.target.tagName === "svg", S, k;
    return R ? (S = T.offsetX, k = T.offsetY) : (S = T.layerX, k = T.layerY), S = S * q, k = k * I, [S, k + B];
  }
  function r(T) {
    this.dragMechanism === "keyboard" && this.dragYStep !== 0 && this.dragTarget && v.bind(this)(this.dragTarget, this.dragYStep, this.selectables.length, this.dragIndex, T), this.dragYStep = 0;
  }
  function o(T) {
    switch (T.keyCode) {
      case 38:
      case 40:
        T.preventDefault();
    }
  }
  function a(T) {
    var q = !1, I = T.target.dataset.index;
    switch (T.keyCode) {
      case 13:
      case 32:
        q = !0, this.dragTarget = this.selectables[I], this.dragIndex = I, this.dragMechanism = "keyboard", e.bind(this)(T);
        break;
      case 38:
        q = !0, this.dragTarget = this.selectables[I], this.dragIndex = I, this.dragTarget && this.dragTarget.isDraggable && (this.dragging && this.dragTarget.isDraggable && this.dragTarget.absEl.highlight(void 0, this.dragColor), this.dragYStep--, this.dragTarget.svgEl.setAttribute("transform", "translate(0," + this.dragYStep * _.STEP + ")"));
        break;
      case 40:
        q = !0, this.dragTarget = this.selectables[I], this.dragIndex = I, this.dragMechanism = "keyboard", this.dragTarget && this.dragTarget.isDraggable && (this.dragging && this.dragTarget.isDraggable && this.dragTarget.absEl.highlight(void 0, this.dragColor), this.dragYStep++, this.dragTarget.svgEl.setAttribute("transform", "translate(0," + this.dragYStep * _.STEP + ")"));
        break;
      case 9:
        this.dragYStep !== 0 && e.bind(this)(T);
        break;
    }
    q && T.preventDefault();
  }
  function s(T, q) {
    if (!q)
      return -1;
    var I = q.dataset;
    if (!I)
      return -1;
    for (var C = I.index, B = 0; B < T.length; B++) {
      var R = T[B].svgEl.dataset;
      if (R && C === R.index)
        return B;
    }
    return -1;
  }
  function p(T, q, I) {
    for (var C = 9999999, B = -1, R = 0; R < T.selectables.length && C > 0; R++) {
      var S = T.selectables[R];
      if (T.getDim(S), S.dim.left < q && S.dim.right > q && S.dim.top < I && S.dim.bottom > I)
        B = R, C = 0;
      else if (S.dim.top < I && S.dim.bottom > I) {
        var k = Math.min(Math.abs(S.dim.left - q), Math.abs(S.dim.right - q));
        k < C && (C = k, B = R);
      } else if (S.dim.left < q && S.dim.right > q) {
        var M = Math.min(Math.abs(S.dim.top - I), Math.abs(S.dim.bottom - I));
        M < C && (C = M, B = R);
      } else {
        var F = Math.abs(q - S.dim.left) > Math.abs(q - S.dim.right) ? Math.abs(q - S.dim.right) : Math.abs(q - S.dim.left), L = Math.abs(I - S.dim.top) > Math.abs(I - S.dim.bottom) ? Math.abs(I - S.dim.bottom) : Math.abs(I - S.dim.top), b = Math.sqrt(F * F + L * L);
        b < C && (C = b, B = R);
      }
    }
    return B >= 0 && C <= 12 ? B : -1;
  }
  function u(T, q, I) {
    if (T.x <= q.offsetX && T.x + T.width >= q.offsetX && T.y <= q.offsetY && T.y + T.height >= q.offsetY)
      return [q.offsetX, q.offsetY];
    var C = Math.abs(q.layerY / I - q.offsetY);
    return C < 3 ? [q.offsetX, q.offsetY] : [q.layerX, q.layerY];
  }
  function d(T) {
    if (!T)
      return null;
    if (T.tagName === "svg")
      return T;
    if (!T.getAttribute)
      return null;
    for (var q = T.getAttribute("selectable"); !q; )
      T.parentElement ? (T = T.parentElement, T.tagName === "svg" ? q = !0 : q = T.getAttribute("selectable")) : q = !0;
    return T;
  }
  function f(T, q) {
    var I, C, B, R = s(T.selectables, d(q.target));
    return R >= 0 ? (B = u(T.selectables[R].svgEl.getBBox(), q, T.scale), I = B[0], C = B[1]) : (B = l(q), I = B[0], C = B[1], R = p(T, I, C)), { x: I, y: C, clickedOn: R };
  }
  function i(T) {
    if (!(!T || !T.target || !T.touches || T.touches.length < 1)) {
      var q = T.target.getBoundingClientRect(), I = T.touches[0].pageX - q.left, C = T.touches[0].pageY - q.top;
      T.touches[0].offsetX = I, T.touches[0].offsetY = C, T.touches[0].layerX = T.touches[0].pageX, T.touches[0].layerY = T.touches[0].pageY;
    }
  }
  function n(T) {
    var q = T;
    T.type === "touchstart" && (i(T), T.touches.length > 0 && (q = T.touches[0]));
    var I = f(this, q);
    I.clickedOn >= 0 && (T.type === "touchstart" || T.button === 0) && this.selectables[I.clickedOn] && (this.dragTarget = this.selectables[I.clickedOn], this.dragIndex = I.clickedOn, this.dragMechanism = "mouse", this.dragMouseStart = { x: I.x, y: I.y }, this.dragging && this.dragTarget.isDraggable && (P(this.renderer.paper, "abcjs-dragging-in-progress"), this.dragTarget.absEl.highlight(void 0, this.dragColor)));
  }
  function t(T) {
    var q = T;
    if (T.type === "touchmove" && (i(T), T.touches.length > 0 && (q = T.touches[0])), this.lastTouchMove = T, !(!this.dragTarget || !this.dragging || !this.dragTarget.isDraggable || this.dragMechanism !== "mouse" || !this.dragMouseStart)) {
      var I = f(this, q), C = Math.round((I.y - this.dragMouseStart.y) / _.STEP);
      C !== this.dragYStep && (this.dragYStep = C, this.dragTarget.svgEl.setAttribute("transform", "translate(0," + C * _.STEP + ")"));
    }
  }
  function e(T) {
    var q = T;
    T.type === "touchend" && this.lastTouchMove && (i(this.lastTouchMove), this.lastTouchMove && this.lastTouchMove.touches && this.lastTouchMove.touches.length > 0 && (q = this.lastTouchMove.touches[0])), this.dragTarget && (h.bind(this)(), this.dragTarget.absEl && this.dragTarget.absEl.highlight && (this.selected = [this.dragTarget.absEl], this.dragTarget.absEl.highlight(void 0, this.selectionColor)), v.bind(this)(this.dragTarget, this.dragYStep, this.selectables.length, this.dragIndex, q), this.dragTarget.svgEl && this.dragTarget.svgEl.focus && (this.dragTarget.svgEl.focus(), this.dragTarget = null, this.dragIndex = -1), N(this.renderer.svg, "abcjs-dragging-in-progress"));
  }
  function c(T) {
    T >= 0 && T < this.selectables.length && (this.dragTarget = this.selectables[T], this.dragIndex = T, this.dragMechanism = "keyboard", e.bind(this)({ target: this.dragTarget.svgEl }));
  }
  function v(T, q, I, C, B) {
    for (var R = m(T, B), S = R.classes, k = R.analysis, M = 0; M < this.listeners.length; M++)
      this.listeners[M](T.absEl.abcelem, T.absEl.tuneNumber, S.join(" "), k, { step: q, max: I, index: C, setSelection: c.bind(this) }, B);
  }
  function h() {
    for (var T = 0; T < this.selected.length; T++)
      this.selected[T].unhighlight(void 0, this.renderer.foregroundColor);
    this.selected = [];
  }
  function y(T, q) {
    h.bind(this)();
    for (var I = 0; I < this.staffgroups.length; I++)
      for (var C = this.staffgroups[I].voices, B = 0; B < C.length; B++)
        for (var R = C[B].children, S = 0; S < R.length; S++) {
          var k = R[S].abcelem.startChar, M = R[S].abcelem.endChar;
          (q > k && T < M || q === T && q === M) && (this.selected[this.selected.length] = R[S], R[S].highlight(void 0, this.selectionColor));
        }
  }
  function w(T) {
    var q = T.getAttribute("class");
    q || (q = "");
    for (var I = q.split(" "), C = {}, B = 0; B < I.length; B++)
      C[I[B]] = !0;
    return C;
  }
  function A(T, q) {
    var I = [];
    for (var C in q)
      q.hasOwnProperty(C) && I.push(C);
    T.setAttribute("class", I.join(" "));
  }
  function P(T, q) {
    if (T) {
      var I = w(T.svg);
      I[q] = !0, A(T.svg, I);
    }
  }
  function N(T, q) {
    if (T) {
      var I = w(T.svg);
      delete I[q], A(T.svg, I);
    }
  }
  return d0 = g, d0;
}
var p0, Tn;
function Gr() {
  if (Tn) return p0;
  Tn = 1;
  function _(m, g, l, r, o) {
    return g + (r - g) / (l - m) * (o - m);
  }
  return p0 = _, p0;
}
var v0, Sn;
function ko() {
  if (Sn) return v0;
  Sn = 1;
  var _ = Te(), m = Ce(), g = Gr(), l = function(t) {
    if (!(t.elems.length === 0 || t.allrests)) {
      var e = s(t.stemsUp, t.isgrace), c = t.elems[0], v = t.elems[t.elems.length - 1], h = 0, y = t.stemsUp ? c.abcelem.maxpitch : c.abcelem.minpitch;
      h = o(c, t.stemsUp, y, h), h = o(v, t.stemsUp, y, h), h = Math.max(t.stemHeight, h + 3);
      var w = u(t.average, t.elems.length, h, t.stemsUp, c.abcelem.averagepitch, v.abcelem.averagepitch, t.isflat, t.min, t.max, t.isgrace), A = p(t.stemsUp, c, v);
      t.addBeam({ startX: A[0], endX: A[1], startY: w[0], endY: w[1], dy: e });
      for (var P = n(t.elems, t.stemsUp, t.beams[0], t.isgrace, e), N = 0; N < P.length; N++)
        t.addBeam(P[N]);
      d(t.elems, t.stemsUp, t.beams[0], e, t.mainNote);
    }
  }, r = function(t) {
    return t === void 0 ? 0 : Math.floor(Math.log(t) / Math.log(2));
  };
  function o(t, e, c, v) {
    if (!t.children)
      return v;
    for (var h = 0; h < t.children.length; h++) {
      var y = t.children[h];
      e && y.top !== void 0 && y.c === "flags.ugrace" ? v = Math.max(v, y.top - c) : !e && y.bottom !== void 0 && y.c === "flags.ugrace" && (v = Math.max(v, c - y.bottom + 7));
    }
    return v;
  }
  function a(t, e, c, v) {
    if (v)
      return 0;
    var h = t - e, y = c / 2;
    return h > y && (h = y), h < -y && (h = -y), h;
  }
  function s(t, e) {
    var c = t ? m.STEP : -m.STEP;
    return e && (c = c * 0.4), c;
  }
  function p(t, e, c) {
    var v = e.heads[t ? 0 : e.heads.length - 1], h = c.heads[t ? 0 : c.heads.length - 1], y = v.x;
    t && (y += v.w - 0.6);
    var w = h.x;
    return w += t ? h.w : 0.6, [y, w];
  }
  function u(t, e, c, v, h, y, w, A, P, N) {
    var T = c - 2, q = c - 2, I = Math.round(v ? Math.max(t + T, P + q) : Math.min(t - T, A - q)), C = a(h, y, e, w), B = I + Math.floor(C / 2), R = I + Math.floor(-C / 2);
    return N || (v && I < 6 || !v && I > 6) && (B = 6, R = 6), [B, R];
  }
  function d(t, e, c, v, h) {
    for (var y = 0; y < t.length; y++) {
      var w = t[y];
      if (!w.abcelem.rest) {
        var A = !w.addExtra, P = A ? h : w, N = w.heads[e ? 0 : w.heads.length - 1], T = 1 / 5, q = N.pitch + (e ? T : -T), I = e ? N.w : 0;
        A || (I += N.dx);
        var C = N.x + I, B = g(c.startX, c.startY, c.endX, c.endY, C), R = e ? -0.6 : 0.6;
        e || (B -= v / 2 / m.STEP), A && (I += w.heads[0].dx), N.c === "noteheads.slash.quarter" && (e ? q += 1 : q -= 1);
        var S = new _(null, I, 0, q, {
          type: "stem",
          pitch2: B,
          linewidth: R
        });
        S.setX(P.x), P.addRight(S);
      }
    }
  }
  function f(t, e) {
    for (var c = e + 1; c < t.length; c++)
      if (!t[c].abcelem.rest)
        return c;
    return -1;
  }
  function i(t, e) {
    for (var c = e - 1; c >= 0; c--)
      if (!t[c].abcelem.rest)
        return c;
    return -1;
  }
  function n(t, e, c, v, h) {
    for (var y = [], w = [], A = 0; A < t.length; A++) {
      var P = t[A];
      if (!P.abcelem.rest) {
        var N = P.heads[e ? 0 : P.heads.length - 1], T = N.x + (e ? N.w : 0), q = g(c.startX, c.startY, c.endX, c.endY, T), I = e ? -1.5 : 1.5;
        v && (I = I * 2 / 3);
        var C = P.abcelem.duration;
        C === 0 && (C = 0.25);
        for (var B = r(C); B < -3; B++) {
          var R = -4 - B;
          if (w[R] ? w[R].single = !1 : w[R] = {
            x: T + (e ? -0.6 : 0),
            y: q + I * (R + 1),
            durlog: B,
            single: !0
          }, A > 0 && P.abcelem.beambr && P.abcelem.beambr <= R + 1) {
            w[R].split || (w[R].split = [w[R].x]);
            var S = p(e, t[A - 1], P);
            w[R].split[w[R].split.length - 1] >= S[0] && (S[0] += P.w), w[R].split.push(S[0]), w[R].split.push(S[1]);
          }
        }
        for (var k = w.length - 1; k >= 0; k--) {
          var M = f(t, A), F = M === -1 || M < t.length && r(t[M].abcelem.duration) > -k - 4;
          if (F) {
            var L = T, b = q + I * (k + 1);
            if (w[k].single) {
              var x = i(t, A), E = x === -1, D = M === -1;
              if (E)
                L = T + 5;
              else if (D)
                L = T - 5;
              else {
                var O = t[x].abcelem.duration, z = t[M].abcelem.duration;
                O === z ? L = A % 2 === 0 ? T + 5 : T - 5 : L = O < z ? T + 5 : T - 5;
              }
              b = g(c.startX, c.startY, c.endX, c.endY, L) + I * (k + 1);
            }
            var H = { startX: w[k].x, endX: L, startY: w[k].y, endY: b, dy: h };
            if (w[k].split !== void 0) {
              var $ = w[k].split;
              H.endX <= $[$.length - 1] && ($[$.length - 1] -= P.w), $.push(H.endX), H.split = w[k].split;
            }
            y.push(H), w = w.slice(0, k);
          }
        }
      }
    }
    return y;
  }
  return v0 = l, v0;
}
var g0, En;
function _o() {
  if (En) return g0;
  En = 1;
  var _ = Gr();
  function m(a) {
    if (a.anchor1 && a.anchor2) {
      a.hasBeam = !!a.anchor1.parent.beam && a.anchor1.parent.beam === a.anchor2.parent.beam;
      var s = a.anchor1.parent.beam;
      if (a.hasBeam && (s.elems[0] !== a.anchor1.parent || s.elems[s.elems.length - 1] !== a.anchor2.parent) && (a.hasBeam = !1), a.hasBeam) {
        var p = g(s) ? a.anchor1.x + a.anchor1.w : a.anchor1.x;
        a.yTextPos = r(p, a.anchor2.x, s), a.yTextPos += g(s) ? 3 : -2, a.xTextPos = o(p, a.anchor2.x), a.top = a.yTextPos + 1, a.bottom = a.yTextPos - 2, g(s) && (a.endingHeightAbove = 4);
      } else {
        var u = l(a);
        if (a.up = u, a.startNote = u ? Math.max(a.anchor1.parent.top, 9) + 4 : Math.min(a.anchor1.parent.bottom, 0) - 2, a.endNote = u ? Math.max(a.anchor2.parent.top, 9) + 4 : Math.min(a.anchor2.parent.bottom, 0) - 2, a.anchor1.parent.type === "rest" && a.anchor2.parent.type !== "rest" ? a.startNote = a.endNote : a.anchor2.parent.type === "rest" && a.anchor1.parent.type !== "rest" && (a.endNote = a.startNote), u) {
          for (var d = 0, f = 0; f < a.middleElems.length; f++)
            d = Math.max(d, a.middleElems[f].top);
          d += 4, (d > a.startNote || d > a.endNote) && (a.startNote = d + 3, a.endNote = d + 3);
        } else {
          for (var i = 0, f = 0; f < a.middleElems.length; f++)
            i = Math.min(i, a.middleElems[f].bottom - a.middleElems[f].height);
          i -= 3, i < a.startNote && i < a.endNote && (a.startNote = Math.min(i, a.startNote) - 2, a.endNote = Math.min(i, a.endNote) - 2);
        }
        a.flatBeams && (u ? (a.startNote = Math.max(a.startNote, a.endNote), a.endNote = Math.max(a.startNote, a.endNote)) : (a.startNote = Math.min(a.startNote, a.endNote), a.endNote = Math.min(a.startNote, a.endNote))), a.yTextPos = a.startNote + (a.endNote - a.startNote) / 2, a.xTextPos = a.anchor1.x + (a.anchor2.x + a.anchor2.w - a.anchor1.x) / 2, a.top = a.yTextPos + 1, a.bottom = a.yTextPos - 2;
      }
    }
    delete a.middleElems, delete a.flatBeams;
  }
  function g(a) {
    return a.stemsUp;
  }
  function l(a) {
    var s = 0, p = 0;
    if (a.anchor1 && (a.anchor1.stemDir === "up" && s++, a.anchor1.stemDir === "down" && p++), a.anchor2 && (a.anchor2.stemDir === "up" && s++, a.anchor2.stemDir === "down" && p++), a.middleElems)
      for (var u = 0; u < a.middleElems.length; u++) {
        var d = a.middleElems[u];
        d.stemDir === "up" && s++, d.stemDir === "down" && p++;
      }
    return s >= p;
  }
  function r(a, s, p) {
    if (p.beams.length === 0)
      return 0;
    p = p.beams[0];
    var u = a + (s - a) / 2;
    return _(p.startX, p.startY, p.endX, p.endY, u);
  }
  function o(a, s) {
    return a + (s - a) / 2;
  }
  return g0 = m, g0;
}
var b0, An;
function To() {
  if (An) return b0;
  An = 1;
  var _ = ko(), m = Gr(), g = _o(), l = function(d) {
    for (var f = 0; f < d.beams.length; f++)
      if (d.beams[f].type === "BeamElem") {
        _(d.beams[f]), r(d.beams[f]);
        for (var i = 0; i < d.beams[f].elems.length; i++)
          d.adjustRange(d.beams[f].elems[i]);
      }
    for (d.staff.specialY.chordLines = a(d.children), f = 0; f < d.otherchildren.length; f++) {
      var n = d.otherchildren[f];
      n.type === "TripletElem" && (g(n), d.adjustRange(n));
    }
    d.staff.top = Math.max(d.staff.top, d.top), d.staff.bottom = Math.min(d.staff.bottom, d.bottom);
  };
  function r(d) {
    for (var f = 1.5, i = 0; i < d.elems.length; i++) {
      var n = d.elems[i];
      if (n.top)
        for (var t = u(n, d), e = 0; e < n.children.length; e++) {
          var c = n.children[e];
          if (c.klass === "ornament" && c.position !== "below" && c.bottom - f < t) {
            var v = t - c.bottom + f;
            c.bottom += v, c.top += v, c.pitch += v, t = n.top = c.top;
          }
        }
    }
  }
  function o(d, f) {
    var i = f.getChordDim();
    if (i) {
      for (var n = 0; n < d.length; n++) {
        var t = d[n] < i.left;
        if (t) {
          n > 0 && f.putChordInLane(n), d[n] = i.right;
          return;
        }
      }
      d.push(i.right), f.putChordInLane(d.length - 1);
    }
  }
  function a(d) {
    var f = [0], i = [0], n, t, e;
    for (n = 0; n < d.length; n++) {
      for (t = 0; t < d[n].children.length; t++)
        e = d[n].children[t], e.chordHeightAbove && o(f, e);
      for (t = d[n].children.length - 1; t >= 0; t--)
        e = d[n].children[t], e.chordHeightBelow && o(i, e);
    }
    return (f.length > 1 || i.length > 1) && p(d, f.length, i.length), { above: f.length, below: i.length };
  }
  function s(d) {
    for (var f = 0, i = 0; i < d.children.length; i++) {
      var n = d.children[i];
      n.chordHeightBelow && f++;
    }
    return f;
  }
  function p(d, f, i) {
    for (var n = 0; n < d.length; n++) {
      s(d[n]);
      for (var t = 0; t < d[n].children.length; t++) {
        var e = d[n].children[t];
        e.chordHeightAbove && e.invertLane(f);
      }
    }
  }
  function u(d, f) {
    return f = f.beams[0], m(f.startX, f.startY, f.endX, f.endY, d.x);
  }
  return b0 = l, b0;
}
var m0, Mn;
function So() {
  if (Mn) return m0;
  Mn = 1;
  var _ = Ce(), m = function(f, i) {
    for (var n, t = 0; t < i.staffs.length; t++) {
      var e = i.staffs[t], c = {
        tempoHeightAbove: 0,
        partHeightAbove: 0,
        volumeHeightAbove: 0,
        dynamicHeightAbove: 0,
        endingHeightAbove: 0,
        chordHeightAbove: 0,
        lyricHeightAbove: 0,
        lyricHeightBelow: 0,
        chordHeightBelow: 0,
        volumeHeightBelow: 0,
        dynamicHeightBelow: 0
      };
      if (f.showDebug && f.showDebug.indexOf("box") >= 0 && (e.originalTop = e.top, e.originalBottom = e.bottom), l(e, c, "lyricHeightAbove"), l(e, c, "chordHeightAbove", e.specialY.chordLines.above), e.specialY.endingHeightAbove && (e.specialY.chordHeightAbove ? e.top += 2 : e.top += e.specialY.endingHeightAbove + g, c.endingHeightAbove = e.top), e.specialY.dynamicHeightAbove && e.specialY.volumeHeightAbove ? (e.top += Math.max(e.specialY.dynamicHeightAbove, e.specialY.volumeHeightAbove) + g, c.dynamicHeightAbove = e.top, c.volumeHeightAbove = e.top) : (l(e, c, "dynamicHeightAbove"), l(e, c, "volumeHeightAbove")), l(e, c, "partHeightAbove"), l(e, c, "tempoHeightAbove"), e.specialY.lyricHeightBelow && (e.specialY.lyricHeightBelow += f.spacing.vocal / _.STEP, c.lyricHeightBelow = e.bottom, e.bottom -= e.specialY.lyricHeightBelow + g), e.specialY.chordHeightBelow) {
        c.chordHeightBelow = e.bottom;
        var v = e.specialY.chordHeightBelow;
        e.specialY.chordLines.below && (v *= e.specialY.chordLines.below), e.bottom -= v + g;
      }
      e.specialY.volumeHeightBelow && e.specialY.dynamicHeightBelow ? (c.volumeHeightBelow = e.bottom, c.dynamicHeightBelow = e.bottom, e.bottom -= Math.max(e.specialY.volumeHeightBelow, e.specialY.dynamicHeightBelow) + g) : e.specialY.volumeHeightBelow ? (c.volumeHeightBelow = e.bottom, e.bottom -= e.specialY.volumeHeightBelow + g) : e.specialY.dynamicHeightBelow && (c.dynamicHeightBelow = e.bottom, e.bottom -= e.specialY.dynamicHeightBelow + g), f.showDebug && f.showDebug.indexOf("box") >= 0 && (e.positionY = c);
      for (var h = 0; h < e.voices.length; h++) {
        var y = i.voices[e.voices[h]], w = r(c, y, f.spacing);
        e.bottom -= w;
      }
      if (n !== void 0) {
        var A = e.top - 10, P = n + A, N = f.spacing.systemStaffSeparation / _.STEP, T = N - P;
        T > 0 && (e.top += T);
      }
      e.top += f.spacing.staffTopMargin / _.STEP, n = 2 - e.bottom;
    }
  }, g = 1;
  function l(f, i, n, t) {
    if (f.specialY[n]) {
      var e = f.specialY[n];
      t && (e *= t), f.top += e + g, i[n] = f.top;
    }
  }
  function r(f, i, n) {
    var t, e, c = 0;
    for (t = 0; t < i.children.length; t++) {
      e = i.children[t];
      var v = o(f, e, n);
      v < e.bottom && (c = e.bottom - v, e.bottom = v, i.bottom = v);
    }
    for (t = 0; t < i.otherchildren.length; t++)
      switch (e = i.otherchildren[t], e.type) {
        case "CrescendoElem":
          a(f, e);
          break;
        case "DynamicDecoration":
          s(f, e);
          break;
        case "EndingElem":
          p(f, e);
          break;
        case "TieElem":
          var h = e.getYBounds();
          i.staff.top = Math.max(i.staff.top, h[0]), i.staff.top = Math.max(i.staff.top, h[1]), i.staff.bottom = Math.min(i.staff.bottom, h[0]), i.staff.bottom = Math.min(i.staff.bottom, h[1]);
          break;
      }
    return c;
  }
  function o(f, i, n) {
    for (var t = i.bottom, e = 0; e < i.children.length; e++) {
      var c = i.children[e];
      for (var v in i.specialY)
        i.specialY.hasOwnProperty(v) && c[v] && (c.pitch = f[v], v === "lyricHeightBelow" && c.type === "lyric" && c.voiceNumber && (c.pitch -= c.voiceNumber * c[v], t = Math.min(i.bottom, c.pitch)), c.top === void 0 && (c.type === "TempoElement" ? u(f, c) : d(f, c, n), i.pushTop(c.top), i.pushBottom(c.bottom)));
    }
    return t;
  }
  function a(f, i) {
    i.dynamicHeightAbove ? i.pitch = f.dynamicHeightAbove : i.pitch = f.dynamicHeightBelow;
  }
  function s(f, i) {
    i.volumeHeightAbove ? i.pitch = f.volumeHeightAbove : i.pitch = f.volumeHeightBelow;
  }
  function p(f, i) {
    i.pitch = f.endingHeightAbove - 2;
  }
  function u(f, i) {
    if (i.pitch = f.tempoHeightAbove, i.top = f.tempoHeightAbove, i.bottom = f.tempoHeightAbove, i.note) {
      var n = i.pitch - i.totalHeightInPitches + 1;
      i.note.top = n, i.note.bottom = n;
      for (var t = 0; t < i.note.children.length; t++) {
        var e = i.note.children[t];
        e.top += n, e.bottom += n, e.pitch += n, e.pitch2 !== void 0 && (e.pitch2 += n);
      }
    }
  }
  function d(f, i, n) {
    switch (i.type) {
      case "part":
        i.top = f.partHeightAbove + i.height, i.bottom = f.partHeightAbove;
        break;
      case "text":
      case "chord":
        i.chordHeightAbove ? (i.top = f.chordHeightAbove, i.bottom = f.chordHeightAbove) : (i.top = f.chordHeightBelow, i.bottom = f.chordHeightBelow);
        break;
      case "lyric":
        i.lyricHeightAbove ? (i.top = f.lyricHeightAbove, i.bottom = f.lyricHeightAbove) : (i.top = f.lyricHeightBelow + n.vocal / _.STEP, i.bottom = f.lyricHeightBelow + n.vocal / _.STEP, i.pitch -= n.vocal / _.STEP);
        break;
      case "debug":
        i.top = f.chordHeightAbove, i.bottom = f.chordHeightAbove;
        break;
    }
    (i.pitch === void 0 || i.top === void 0) && console.error("RelativeElement position not set.", i.type, i.pitch, i.top, f);
  }
  return m0 = m, m0;
}
var y0, Bn;
function Eo() {
  if (Bn) return y0;
  Bn = 1;
  var _ = function() {
  };
  _.beginLayout = function(l, r) {
    r.i = 0, r.durationindex = 0, r.startx = l, r.minx = l, r.nextx = l, r.spacingduration = 0;
  }, _.layoutEnded = function(l) {
    return l.i >= l.children.length;
  }, _.getNextX = function(l) {
    return Math.max(l.minx, l.nextx);
  }, _.getSpacingUnits = function(l) {
    return Math.sqrt(l.spacingduration * 8);
  }, _.layoutOneItem = function(l, r, o, a, s) {
    var p = o.children[o.i];
    if (!p) return 0;
    var u = l - o.minx, d = o.durationindex + p.duration > 0 ? a : 0;
    if (p.abcelem.el_type === "note" && !p.abcelem.rest && o.voicenumber !== 0 && s) {
      var f = s.children[s.i], i = f && (p.abcelem.maxpitch <= f.abcelem.maxpitch + 1 && p.abcelem.maxpitch >= f.abcelem.minpitch - 1 || p.abcelem.minpitch <= f.abcelem.maxpitch + 1 && p.abcelem.minpitch >= f.abcelem.minpitch - 1);
      if (i && p.abcelem.minpitch === f.abcelem.minpitch && p.abcelem.maxpitch === f.abcelem.maxpitch && f.heads && f.heads.length > 0 && p.heads && p.heads.length > 0 && f.heads[0].c === p.heads[0].c && (i = !1), i) {
        var n = f.heads && f.heads.length > 0 ? f.heads[0].realWidth : f.fixed.w;
        p.adjustedWidth || (p.adjustedWidth = n + p.w), p.w = p.adjustedWidth;
        for (var t = 0; t < p.children.length; t++) {
          var e = p.children[t];
          e.name.indexOf("accidental") < 0 && (e.adjustedWidth || (e.adjustedWidth = e.dx + n), e.dx = e.adjustedWidth);
        }
      }
    }
    var c = m(p, d);
    return u < c && (o.i === 0 || p.type !== "bar" || o.children[o.i - 1].type !== "part" && o.children[o.i - 1].type !== "tempo") && (l += c - u), p.setX(l), o.spacingduration = p.duration, o.minx = l + g(p), o.i !== o.children.length - 1 && (o.minx += p.minspacing), this.updateNextX(l, r, o), l;
  }, _.shiftRight = function(l, r) {
    var o = r.children[r.i];
    o && (o.setX(o.x + l), r.minx += l, r.nextx += l);
  }, _.updateNextX = function(l, r, o) {
    o.nextx = l + r * this.getSpacingUnits(o);
  }, _.updateIndices = function(l) {
    this.layoutEnded(l) || (l.durationindex += l.children[l.i].duration, l.children[l.i].type === "bar" && (l.durationindex = Math.round(l.durationindex * 64) / 64), l.i++);
  };
  function m(l, r) {
    var o = 0;
    return (l.type === "note" || l.type === "bar") && (o = r), -l.extraw + o;
  }
  function g(l) {
    return l.w;
  }
  return y0 = _, y0;
}
var w0, Nn;
function Ao() {
  if (Nn) return w0;
  Nn = 1;
  var _ = Eo();
  function m(a) {
    for (var s = 0, p = 0; p < a.length; p++) {
      var u = a[p];
      if (u.children.length > 0) {
        var d = u.children.length - 1, f = u.children[d];
        if (f.abcelem.el_type === "bar") {
          var i = f.children[0].x;
          i > s ? s = i : f.children[0].x = s;
        }
      }
    }
  }
  var g = function(a, s, p, u, d) {
    var f = 1e-7, i = 0, n = 1e3, t = d;
    u.startx = t;
    var e, c = 0;
    for (p && console.log("init layout", a), e = 0; e < u.voices.length; e++)
      _.beginLayout(t, u.voices[e]);
    for (var v = 0; !l(u.voices); ) {
      for (c = null, e = 0; e < u.voices.length; e++)
        !_.layoutEnded(u.voices[e]) && (!c || r(u.voices[e]) < c) && (c = r(u.voices[e]));
      var h = [], y = [];
      for (e = 0; e < u.voices.length; e++) {
        var w = r(u.voices[e]);
        w - c > f ? y.push(u.voices[e]) : h.push(u.voices[e]);
      }
      v = 0;
      var A = 0;
      for (e = 0; e < h.length; e++)
        _.getNextX(h[e]) > t && (t = _.getNextX(h[e]), v = _.getSpacingUnits(h[e]), A = h[e].spacingduration);
      i += v, n = Math.min(n, v), p && console.log("currentduration: ", c, i, n);
      var P = void 0;
      for (e = 0; e < h.length; e++) {
        var N = h[e];
        N.voicenumber === 0 && (P = e);
        var T = P !== void 0 && h[P].voicenumber !== N.voicenumber ? h[P] : void 0;
        o(N, T) || (T = void 0);
        var q = _.layoutOneItem(t, a, N, s, T), I = q - t;
        if (I > 0) {
          t = q;
          for (var C = 0; C < e; C++)
            _.shiftRight(I, h[C]);
        }
      }
      for (e = 0; e < y.length; e++)
        y[e].spacingduration -= A, _.updateNextX(t, a, y[e]);
      for (e = 0; e < h.length; e++) {
        var B = h[e];
        _.updateIndices(B);
      }
    }
    for (e = 0; e < u.voices.length; e++)
      _.getNextX(u.voices[e]) > t && (t = _.getNextX(u.voices[e]), v = _.getSpacingUnits(u.voices[e]));
    return m(u.voices), i += v, u.setWidth(t), { spacingUnits: i, minSpace: n };
  };
  function l(a) {
    for (var s = 0; s < a.length; s++)
      if (!_.layoutEnded(a[s])) return !1;
    return !0;
  }
  function r(a) {
    return a.durationindex - (a.children[a.i] && a.children[a.i].duration > 0 ? 0 : 5e-7);
  }
  function o(a, s) {
    return !a || !a.staff || !a.staff.voices || a.staff.voices.length === 0 || !s || !s.staff || !s.staff.voices || s.staff.voices.length === 0 ? !1 : a.staff.voices[0] === s.staff.voices[0];
  }
  return w0 = g, w0;
}
var x0, Pn;
function hs() {
  if (Pn) return x0;
  Pn = 1;
  function _(r, o, a, s, p) {
    var u = r.padding.left, d = 0, f, i;
    for (f = 0; f < a.length; f++)
      a[f].header && (i = o.calc(a[f].header, "voicefont", ""), d = Math.max(d, i.width));
    if (d = m(d, s, o), d = m(d, p, o), d) {
      var n = o.calc("A", "voicefont", "");
      d += n.width;
    }
    u += d;
    var t = 0;
    return t = g(s, u, t), t = g(p, u, t), u + t;
  }
  function m(r, o, a) {
    if (o) {
      for (var s = 0; s < o.length; s++)
        if (o[s].header) {
          var p = a.calc(o[s].header, "voicefont", "");
          r = Math.max(r, p.width);
        }
    }
    return r;
  }
  function g(r, o, a) {
    if (r)
      for (var s = 0; s < r.length; s++)
        l(o, r[s]), a = Math.max(a, r[s].getWidth());
    return a;
  }
  function l(r, o) {
    o.x = r;
  }
  return x0 = _, x0;
}
var C0, Ln;
function Mo() {
  if (Ln) return C0;
  Ln = 1;
  var _ = hs();
  function m(l, r, o) {
    var a = _(l, r.getTextSize, r.voices, r.brace, r.bracket), s = g(r, o.minPadding), p = s.totalDuration, u = s.minSpacing, d = u * p;
    o.minWidth && (d = Math.max(d, o.minWidth));
    var f = o.minPadding ? o.minPadding / 2 : 2;
    r.startx = a, r.w = d + a;
    for (var i = 0; i < r.voices.length; i++) {
      var n = r.voices[i];
      n.startx = a, n.w = d + a;
      for (var t = a, e = !1, c = 0, v = 0; v < n.children.length; v++) {
        var h = n.children[v];
        e || (h.duration !== 0 ? (e = !0, c = (d + a - t) / p, r.gridStart = t) : (h.x = t, t += h.w + h.minspacing)), e && (o.align === "center" ? h.x = t + h.duration * c / 2 - h.w / 2 : h.duration === 0 ? h.x = t + 1 - h.w : h.x = t + f - h.extraw, t += h.duration * c);
        for (var y = 0; y < h.children.length; y++) {
          var w = h.children[y], A = w.dx ? w.dx : 0;
          w.x = h.x + A;
        }
      }
      r.gridEnd = t;
    }
    return d;
  }
  function g(l, r) {
    for (var o = 0, a = 0, s = 0; s < l.voices.length; s++) {
      for (var p = 0, u = l.voices[s], d = 0; d < u.children.length; d++) {
        var f = u.children[d];
        if (p += f.duration, f.duration) {
          var i = (f.w + r) / f.duration;
          o = Math.max(o, i);
        }
      }
      a = Math.max(a, p);
    }
    return { totalDuration: a, minSpacing: o };
  }
  return C0 = m, C0;
}
var k0, qn;
function Bo() {
  if (qn) return k0;
  qn = 1;
  function _(m) {
    for (var g = [], l = 0; l < m.length; l++) {
      var r = m[l], o = r.staffGroup, a = [];
      if (o && o && o.staffs)
        for (var s = 0; s < o.staffs.length; s++) {
          for (var p = o.staffs[s], u = {}, d = 0; d < p.voices.length; d++)
            for (var f = o.voices[p.voices[d]], i = 0, n = 0; n < f.children.length; n++) {
              var t = "T" + Math.round(i * 1e3);
              u[t] || (u[t] = []), f.children[n].abcelem.el_type === "note" && (u[t].push(f.children[n]), i += f.children[n].duration);
            }
          a.push(u);
        }
      g.push(a);
    }
    return g;
  }
  return k0 = _, k0;
}
var _0, Dn;
function No() {
  if (Dn) return _0;
  Dn = 1;
  var _ = To(), m = So(), g = Ao(), l = hs(), r = Mo(), o = Bo(), a = function(n, t, e, c, v, h) {
    var y, w, A = e;
    for (y = 0; y < t.lines.length; y++)
      if (w = t.lines[y], w.staff) {
        var P;
        h !== void 0 ? P = r(n, w.staffGroup, h) : P = s(n, A, c, w.staffGroup, t.formatting, y === t.lines.length - 1, !1), Math.round(P) > Math.round(A) && (A = P, v && (y = -1));
      }
    for (y = 0; y < t.lines.length; y++)
      if (w = t.lines[y], w.staffGroup && w.staffGroup.voices) {
        for (var N = 0; N < w.staffGroup.voices.length; N++)
          _(w.staffGroup.voices[N]);
        m(n, w.staffGroup);
      }
    var T = o(t.lines);
    for (y = 0; y < t.lines.length; y++)
      w = t.lines[y], w.staffGroup && d(T[y]);
    for (y = 0; y < t.lines.length; y++)
      w = t.lines[y], w.staffGroup && w.staffGroup.setHeight();
    return A;
  }, s = function(n, t, e, c, v, h, y) {
    for (var w = l(n, c.getTextSize, c.voices, c.brace, c.bracket), A = e, P = 0; P < 8; P++) {
      var N = g(A, n.minPadding, y, c, w);
      if (A = p(h, v.stretchlast, t + n.padding.left, c.w, A, N.spacingUnits, N.minSpace, n.padding.left + n.padding.right), A === null) break;
    }
    return u(c.voices), c.w - w;
  };
  function p(n, t, e, c, v, h, y, w) {
    if (n)
      if (t === void 0) {
        if (c / e < 0.66) return null;
      } else {
        var A = 1 - (c + w) / e, P = A < t;
        if (!P) return null;
      }
    if (Math.abs(e - c) < 2) return null;
    var N = h * v, T = c - N;
    return h > 0 ? (v = (e - T) / h, v * y > 50 && (v = 50 / y), v) : null;
  }
  function u(n) {
    for (var t = 0; t < n.length; t++)
      for (var e = n[t], c = 1; c < e.children.length - 1; c++) {
        var v = e.children[c];
        if (v.abcelem.rest && (v.abcelem.rest.type === "whole" || v.abcelem.rest.type === "multimeasure")) {
          var h = e.children[c - 1], y = e.children[c + 1];
          v.center(h, y);
        }
      }
  }
  function d(n) {
    for (var t = 0; t < n.length; t++)
      for (var e = n[t], c = Object.keys(e), v = 0; v < c.length; v++) {
        var h = e[c[v]], y = h.length - 1;
        if (h.length > 1) {
          var w = h[0].abcelem.rest && h[0].abcelem.rest.type === "rest", A = h[y].abcelem.rest && h[y].abcelem.rest.type === "rest";
          if (w && !h[y].abcelem.rest) {
            var P = h[0].children.find(function(C) {
              return C.name.includes("rest");
            }), N = f(h[y]);
            if (P) {
              var T = P.bottom - N;
              T -= 2, T < 0 && h[0].children.length > 0 && (h[0].bottom -= T, h[0].top -= T, h[0].children[0].bottom -= T, h[0].children[0].top -= T, h[0].children[0].pitch -= T);
            }
          } else if (A && !h[0].abcelem.rest) {
            var q = h[y].children.find(function(C) {
              return C.name.includes("rest");
            });
            if (q) {
              var I = q.top - i(h[0]);
              I += 2, I > 0 && h[y].children.length > 0 && (h[y].bottom -= I, h[y].top -= I, h[y].children[0].bottom -= I, h[y].children[0].top -= I, h[y].children[0].pitch -= I);
            }
          }
        }
      }
  }
  function f(n) {
    if (n.children) {
      for (var t = -90, e = 0; e < n.children.length; e++) {
        var c = n.children[e];
        c.type !== "chord" && (t = Math.max(t, c.top));
      }
      if (t > -90)
        return t;
    }
    return n.top;
  }
  function i(n) {
    if (n.children) {
      for (var t = 90, e = 0; e < n.children.length; e++) {
        var c = n.children[e];
        c.type !== "lyric" && (t = Math.min(t, c.bottom));
      }
      if (t < 90)
        return t;
    }
    return n.bottom;
  }
  return _0 = a, _0;
}
var T0, Rn;
function Po() {
  if (Rn) return T0;
  Rn = 1;
  var _ = function(g) {
    this.shouldAddClasses = g.shouldAddClasses, this.reset();
  };
  return _.prototype.reset = function() {
    this.lineNumber = null, this.voiceNumber = null, this.measureNumber = null, this.measureTotalPerLine = [], this.noteNumber = null;
  }, _.prototype.incrLine = function() {
    this.lineNumber === null ? this.lineNumber = 0 : this.lineNumber++, this.voiceNumber = null, this.measureNumber = null, this.noteNumber = null;
  }, _.prototype.incrVoice = function() {
    this.voiceNumber === null ? this.voiceNumber = 0 : this.voiceNumber++, this.measureNumber = null, this.noteNumber = null;
  }, _.prototype.isInMeasure = function() {
    return this.measureNumber !== null;
  }, _.prototype.newMeasure = function() {
    this.measureNumber && (this.measureTotalPerLine[this.lineNumber] = this.measureNumber), this.measureNumber = null, this.noteNumber = null;
  }, _.prototype.startMeasure = function() {
    this.measureNumber = 0, this.noteNumber = 0;
  }, _.prototype.incrMeasure = function() {
    this.measureNumber++, this.noteNumber = 0;
  }, _.prototype.incrNote = function() {
    this.noteNumber++;
  }, _.prototype.measureTotal = function() {
    for (var m = 0, g = 0; g < this.lineNumber; g++)
      m += this.measureTotalPerLine[g] ? this.measureTotalPerLine[g] : 0;
    return this.measureNumber && (m += this.measureNumber), m;
  }, _.prototype.getCurrent = function(m) {
    return {
      line: this.lineNumber,
      measure: this.measureNumber,
      measureTotal: this.measureTotal(),
      voice: this.voiceNumber,
      note: this.noteNumber
    };
  }, _.prototype.generate = function(m) {
    if (!this.shouldAddClasses)
      return "";
    var g = [];
    if (m && m.length > 0 && g.push(m), m === "abcjs-tab-number")
      return g.join(" ");
    if (m === "text instrument-name")
      return "abcjs-text abcjs-instrument-name";
    if (this.lineNumber !== null && g.push("l" + this.lineNumber), this.measureNumber !== null && g.push("m" + this.measureNumber), this.measureNumber !== null && g.push("mm" + this.measureTotal()), this.voiceNumber !== null && g.push("v" + this.voiceNumber), m && (m.indexOf("note") >= 0 || m.indexOf("rest") >= 0 || m.indexOf("lyric") >= 0) && this.noteNumber !== null && g.push("n" + this.noteNumber), g.length > 0) {
      g = g.join(" "), g = g.split(" ");
      for (var l = 0; l < g.length; l++)
        g[l].indexOf("abcjs-") !== 0 && g[l].length > 0 && (g[l] = "abcjs-" + g[l]);
    }
    return g.join(" ");
  }, T0 = _, T0;
}
var S0, In;
function Lo() {
  if (In) return S0;
  In = 1;
  var _ = function(g, l) {
    this.formatting = g, this.classes = l;
  };
  return _.prototype.updateFonts = function(m) {
    m.gchordfont && (this.formatting.gchordfont = m.gchordfont), m.tripletfont && (this.formatting.tripletfont = m.tripletfont), m.annotationfont && (this.formatting.annotationfont = m.annotationfont), m.vocalfont && (this.formatting.vocalfont = m.vocalfont);
  }, _.prototype.getFamily = function(m) {
    return m[0] === '"' && m[m.length - 1] === '"' ? m.substring(1, m.length - 1) : m;
  }, _.prototype.calc = function(m, g) {
    var l;
    typeof m == "string" ? (l = this.formatting[m], l ? l = { face: l.face, size: Math.round(l.size * 4 / 3), decoration: l.decoration, style: l.style, weight: l.weight, box: l.box } : l = { face: "Arial", size: Math.round(48 / 3), decoration: "underline", style: "normal", weight: "normal" }) : l = { face: m.face, size: Math.round(m.size * 4 / 3), decoration: m.decoration, style: m.style, weight: m.weight, box: m.box };
    var r = this.formatting.fontboxpadding ? this.formatting.fontboxpadding : 0.1;
    l.padding = l.size * r;
    var o = {
      "font-size": l.size,
      "font-style": l.style,
      "font-family": this.getFamily(l.face),
      "font-weight": l.weight,
      "text-decoration": l.decoration,
      class: this.classes.generate(g)
    };
    return { font: l, attr: o };
  }, S0 = _, S0;
}
var E0, Fn;
function qo() {
  if (Fn) return E0;
  Fn = 1;
  var _ = function(g, l) {
    this.getFontAndAttr = g, this.svg = l;
  };
  return _.prototype.updateFonts = function(m) {
    this.getFontAndAttr.updateFonts(m);
  }, _.prototype.attr = function(m, g) {
    return this.getFontAndAttr.calc(m, g);
  }, _.prototype.getFamily = function(m) {
    return m[0] === '"' && m[m.length - 1] === '"' ? m.substring(1, m.length - 1) : m;
  }, _.prototype.calc = function(m, g, l, r) {
    var o;
    typeof g == "string" ? o = this.attr(g, l) : o = {
      font: {
        face: g.face,
        size: g.size,
        decoration: g.decoration,
        style: g.style,
        weight: g.weight
      },
      attr: {
        "font-size": g.size,
        "font-style": g.style,
        "font-family": this.getFamily(g.face),
        "font-weight": g.weight,
        "text-decoration": g.decoration,
        class: this.getFontAndAttr.classes.generate(l)
      }
    };
    var a = this.svg.getTextSize(m, o.attr, r);
    return o.font.box ? { height: a.height + o.font.padding * 4, width: a.width + o.font.padding * 4 } : a;
  }, _.prototype.baselineToCenter = function(m, g, l, r, o) {
    var a = this.calc(m, g, l).height, s = this.attr(g, l).font.size;
    return a * 0.5 + (o - r - 2) * s;
  }, E0 = _, E0;
}
var A0, On;
function qe() {
  if (On) return A0;
  On = 1;
  var _ = function() {
    for (var m = 0, g, l = arguments[m++], r = [], o, a, s, p; l; ) {
      if (o = /^[^\x25]+/.exec(l)) r.push(o[0]);
      else if (o = /^\x25{2}/.exec(l)) r.push("%");
      else if (o = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(l)) {
        if ((g = arguments[o[1] || m++]) == null || g == null) throw "Too few arguments.";
        if (/[^s]/.test(o[7]) && typeof g != "number")
          throw "Expecting number but found " + typeof g;
        switch (o[7]) {
          case "b":
            g = g.toString(2);
            break;
          case "c":
            g = String.fromCharCode(g);
            break;
          case "d":
            g = parseInt(g);
            break;
          case "e":
            g = o[6] ? g.toExponential(o[6]) : g.toExponential();
            break;
          case "f":
            g = o[6] ? parseFloat(g).toFixed(o[6]) : parseFloat(g);
            break;
          case "o":
            g = g.toString(8);
            break;
          case "s":
            g = (g = String(g)) && o[6] ? g.substring(0, o[6]) : g;
            break;
          case "u":
            g = Math.abs(g);
            break;
          case "x":
            g = g.toString(16);
            break;
          case "X":
            g = g.toString(16).toUpperCase();
            break;
        }
        g = /[def]/.test(o[7]) && o[2] && g > 0 ? "+" + g : g, s = o[3] ? o[3] == "0" ? "0" : o[3][1] : " ", p = o[5] - String(g).length, a = o[5] ? str_repeat(s, p) : "", r.push(o[4] ? g + a : a + g);
      } else throw "Huh ?!";
      l = l.substring(o[0].length);
    }
    return r.join("");
  };
  return A0 = _, A0;
}
var M0, Hn;
function Se() {
  if (Hn) return M0;
  Hn = 1;
  function _(m) {
    return parseFloat(m.toFixed(2));
  }
  return M0 = _, M0;
}
var B0, zn;
function Pe() {
  if (zn) return B0;
  zn = 1;
  var _ = Se();
  function m(g, l, r) {
    var o = l.y;
    if (l.phrases) {
      var u = g.paper.richTextLine(l.phrases, l.x, l.y, l.klass, l.anchor);
      return u;
    }
    if (l.lane) {
      var a = l.dim.font.size * 0.25;
      o += (l.dim.font.size + a) * l.lane;
    }
    var s;
    l.dim ? (s = l.dim, s.attr.class = l.klass) : s = g.controller.getFontAndAttr.calc(l.type, l.klass), l.anchor && (s.attr["text-anchor"] = l.anchor), l["dominant-baseline"] && (s.attr["dominant-baseline"] = l["dominant-baseline"]), s.attr.x = l.x, s.attr.y = o, l.centerVertically || (s.attr.y += s.font.size), l.type === "debugfont" && (console.log("Debug msg: " + l.text), s.attr.stroke = "#ff0000"), l.cursor && (s.attr.cursor = l.cursor);
    var p;
    l.name === "free-text" ? p = l.text.replace(/^[ \t]*\n/gm, ` 
`) : p = l.text.replace(/\n\n/g, `
 
`), p = p.replace(/^\n/, ` 
`), s.font.box && (r || g.paper.openGroup({ klass: s.attr.class, fill: g.foregroundColor, "data-name": l.name }), s.attr["text-anchor"] === "end" ? s.attr.x -= s.font.padding : s.attr["text-anchor"] === "start" && (s.attr.x += s.font.padding), s.attr.y += s.font.padding, delete s.attr.class), l.noClass && delete s.attr.class, s.attr.x = _(s.attr.x), s.attr.y = _(s.attr.y), l.name && (s.attr["data-name"] = l.name);
    var u = g.paper.text(p, s.attr);
    if (s.font.box) {
      var d = u.getBBox(), f = 0;
      s.attr["text-anchor"] === "middle" ? f = d.width / 2 + s.font.padding : s.attr["text-anchor"] === "end" && (f = d.width + s.font.padding * 2);
      var i = 0;
      l.centerVertically && (i = d.height - s.font.padding), g.paper.rect({ "data-name": "box", x: Math.round(l.x - f), y: Math.round(o - i), width: Math.round(d.width + s.font.padding * 2), height: Math.round(d.height + s.font.padding * 2) }), r || (u = g.paper.closeGroup());
    }
    return u;
  }
  return B0 = m, B0;
}
var N0, Gn;
function Do() {
  if (Gn) return N0;
  Gn = 1;
  var _ = qe(), m = Ce(), g = Pe();
  function l(p, u, d) {
    var f = u.startVoice.staff.absoluteY - m.STEP * 10;
    return u.endVoice && u.endVoice.staff ? u.endY = u.endVoice.staff.absoluteY - m.STEP * 2 : u.lastContinuedVoice && u.lastContinuedVoice.staff ? u.endY = u.lastContinuedVoice.staff.absoluteY - m.STEP * 2 : u.endY = u.startVoice.staff.absoluteY - m.STEP * 2, s(p, u.x, f, u.endY, u.type, u.header, d);
  }
  function r(p, u, d, f, i) {
    u += m.STEP;
    var n = m.STEP * 0.75, t = m.STEP * 0.75, e = f - d, c = _(
      "M %f %f l %f %f l %f %f l %f %f z",
      u,
      d - t,
      // top left line
      0,
      e + t * 2,
      // bottom left line
      n,
      0,
      // bottom right line
      0,
      -(e + t * 2)
      // top right line
    ), v = m.STEP * 2, h = m.STEP;
    return c += _(
      "M %f %f q %f %f %f %f q %f %f %f %f z",
      u + n,
      d - t,
      // top left arm
      v * 0.6,
      h * 0.2,
      v,
      -h,
      // right point
      -v * 0.1,
      h * 0.3,
      -v,
      h + m.STEP
      // left bottom
    ), c += _(
      "M %f %f q %f %f %f %f q %f %f %f %f z",
      u + n,
      d + t + e,
      // bottom left arm
      v * 0.6,
      -h * 0.2,
      v,
      h,
      // right point
      -v * 0.1,
      -h * 0.3,
      -v,
      -h - m.STEP
      // left bottom
    ), p.paper.path({ path: c, stroke: p.foregroundColor, fill: p.foregroundColor, class: p.controller.classes.generate(i), "data-name": i });
  }
  function o(p, u, d, f, i) {
    var n = f - d, t = a(
      u,
      d,
      [7.5, -8, 21, 0, 18.5, -10.5, 7.5],
      [0, n / 5.5, n / 3.14, n / 2, n / 2.93, n / 4.88, 0]
    );
    return t += a(
      u,
      d,
      [0, 17.5, -7.5, 6.6, -5, 20, 0],
      [n / 2, n / 1.46, n / 1.22, n, n / 1.19, n / 1.42, n / 2]
    ), p.paper.path({ path: t, stroke: p.foregroundColor, fill: p.foregroundColor, class: p.controller.classes.generate(i), "data-name": i });
  }
  function a(p, u, d, f) {
    return _(
      "M %f %f C %f %f %f %f %f %f C %f %f %f %f %f %f z",
      p + d[0],
      u + f[0],
      p + d[1],
      u + f[1],
      p + d[2],
      u + f[2],
      p + d[3],
      u + f[3],
      p + d[4],
      u + f[4],
      p + d[5],
      u + f[5],
      p + d[6],
      u + f[6]
    );
  }
  var s = function(p, u, d, f, i, n, t) {
    var e;
    if (n) {
      p.paper.openGroup({ klass: p.controller.classes.generate("staff-extra voice-name"), "data-name": i });
      var c = d + (f - d) / 2;
      c = c - p.controller.getTextSize.baselineToCenter(n, "voicefont", "staff-extra voice-name", 0, 1), g(p, {
        x: p.padding.left,
        y: c,
        text: n,
        type: "voicefont",
        klass: "staff-extra voice-name",
        anchor: "start",
        centerVertically: !0
      });
    }
    return i === "brace" ? e = o(p, u, d, f, i) : i === "bracket" && (e = r(p, u, d, f, i)), n && (e = p.paper.closeGroup()), t.wrapSvgEl({ el_type: i, startChar: -1, endChar: -1 }, e), e;
  };
  return N0 = l, N0;
}
var P0, Yn;
function ze() {
  if (Yn) return P0;
  Yn = 1;
  function _(m, g, l) {
    var r = m.paper.path(g);
    return r;
  }
  return P0 = _, P0;
}
var L0, Wn;
function Ro() {
  if (Wn) return L0;
  Wn = 1;
  var _ = qe(), m = ze(), g = Se();
  function l(e, c, v) {
    (!c.anchor1 || !c.anchor2 || !c.anchor1.heads || !c.anchor2.heads || c.anchor1.heads.length === 0 || c.anchor2.heads.length === 0) && window.console.error("Glissando Element not set.");
    var h = 4, y = e.calcY(c.anchor1.heads[0].pitch), w = e.calcY(c.anchor2.heads[0].pitch), A = c.anchor1.x + c.anchor1.w / 2, P = c.anchor2.x + c.anchor2.w / 2, N = r(A, y, P, w), T = c.anchor1.w / 2 + h, q = c.anchor2.w / 2 + h, I = o(A, y, P, w), C = a(y, I, T);
    a(w, I, -q);
    var B = s(N - T - q), R = t(e, A + T, C, B, I);
    return v.wrapSvgEl({ el_type: "glissando", startChar: -1, endChar: -1 }, R), [R];
  }
  function r(e, c, v, h) {
    var y = v - e, w = h - c;
    return Math.sqrt(y * y + w * w);
  }
  function o(e, c, v, h) {
    return (h - c) / (v - e);
  }
  function a(e, c, v) {
    return g(e + v * c);
  }
  function s(e) {
    var c = 5;
    return Math.max(2, Math.floor((e - c * 2) / 6));
  }
  var p = [[3.5, -4.8]], u = [[1.5, -1], [0.3, -0.3], [-3.5, 3.8]], d = [[-1.5, 2]], f = [[3, 4], [3, -4]], i = [[-3, 4], [-3, -4]];
  function n(e, c) {
    for (var v = "", h = 0; h < e.length; h++)
      v += "l" + e[h][0] + " " + a(e[h][1], c, e[h][0]);
    return v;
  }
  var t = function(e, c, v, h, y) {
    var w = _("M %f %f", c, v);
    w += n(p, y);
    var A;
    for (A = 0; A < h; A++)
      w += n(f, y);
    for (w += n(u, y), A = 0; A < h; A++)
      w += n(i, y);
    return w += n(d, y) + "z", m(e, { path: w, highlight: "stroke", stroke: e.foregroundColor, class: e.controller.classes.generate("decoration"), "data-name": "glissando" });
  };
  return L0 = l, L0;
}
var q0, Un;
function Io() {
  if (Un) return q0;
  Un = 1;
  var _ = qe(), m = ze(), g = Se();
  function l(o, a, s) {
    a.pitch === void 0 && window.console.error("Crescendo Element y-coordinate not set.");
    var p = o.calcY(a.pitch) + 4, u = 8, d = a.anchor1 ? a.anchor1.x : 0, f = a.anchor2 ? a.anchor2.x : 800, i;
    return a.dir === "<" ? i = r(o, p + u / 2, p, p + u / 2, p + u, d, f) : i = r(o, p, p + u / 2, p + u, p + u / 2, d, f), s.wrapSvgEl({ el_type: "dynamicDecoration", startChar: -1, endChar: -1 }, i), [i];
  }
  var r = function(o, a, s, p, u, d, f) {
    a = g(a), s = g(s), p = g(p), u = g(u), d = g(d), f = g(f);
    var i = _(
      "M %f %f L %f %f M %f %f L %f %f",
      d,
      a,
      f,
      s,
      d,
      p,
      f,
      u
    );
    return m(o, { path: i, highlight: "stroke", stroke: o.foregroundColor, class: o.controller.classes.generate("dynamics decoration"), "data-name": "dynamics" });
  };
  return q0 = l, q0;
}
var D0, Xn;
function Yr() {
  if (Xn) return D0;
  Xn = 1;
  var _ = Se();
  function m() {
    this.ingroup = !1;
  }
  m.prototype.beginGroup = function(l, r) {
    this.paper = l, this.controller = r, this.path = [], this.lastM = [0, 0], this.ingroup = !0, this.paper.openGroup();
  }, m.prototype.isInGroup = function() {
    return this.ingroup;
  }, m.prototype.addPath = function(l) {
    if (l = l || [], l.length !== 0) {
      l[0][0] = "m", l[0][1] = _(l[0][1] - this.lastM[0]), l[0][2] = _(l[0][2] - this.lastM[1]), this.lastM[0] += l[0][1], this.lastM[1] += l[0][2], this.path.push(l[0]);
      for (var r = 1, o = l.length; r < o; r++)
        l[r][0] === "m" && (this.lastM[0] += l[r][1], this.lastM[1] += l[r][2]), this.path.push(l[r]);
    }
  }, m.prototype.endGroup = function(l, r, o) {
    this.ingroup = !1;
    for (var a = "", s = 0; s < this.path.length; s++)
      a += this.path[s].join(" ");
    this.path = [];
    var p = this.paper.closeGroup();
    if (p) {
      var u = this.controller.classes.generate(l);
      u && (o && (u += " " + o), p.setAttribute("class", u)), p.setAttribute("fill", this.controller.renderer.foregroundColor), p.setAttribute("stroke", "none"), p.setAttribute("data-name", r);
    }
    return p;
  };
  var g = new m();
  return D0 = g, D0;
}
var R0, jn;
function Wr() {
  if (jn) return R0;
  jn = 1;
  var _ = Pe(), m = Ne(), g = Yr();
  function l(o, a, s, p, u) {
    var d, f;
    if (!p) return null;
    if (p.length > 1 && p.indexOf(".") < 0) {
      var i = g.isInGroup() ? "" : u.klass;
      o.paper.openGroup({ "data-name": u.name, klass: i });
      for (var n = 0, t = 0; t < p.length; t++) {
        var e = p[t];
        f = m.getYCorr(e), d = m.printSymbol(a + n, o.calcY(s + f), e, o.paper, { stroke: u.stroke, fill: u.fill }), d ? t < p.length - 1 && (n += r(e, p[t + 1], m.getSymbolWidth(e))) : _(o, { x: a, y: o.y, text: "no symbol:" + p, type: "debugfont", klass: "debug-msg", anchor: "start" }, !1);
      }
      var c = o.paper.closeGroup();
      return c;
    } else
      return f = m.getYCorr(p), g.isInGroup() ? d = m.printSymbol(a, o.calcY(s + f), p, o.paper, { "data-name": u.name }) : d = m.printSymbol(a, o.calcY(s + f), p, o.paper, { klass: u.klass, stroke: u.stroke, fill: u.fill, "data-name": u.name }), d || (_(o, { x: a, y: o.y, text: "no symbol:" + p, type: "debugfont", klass: "debug-msg", anchor: "start" }, !1), null);
  }
  function r(o, a, s) {
    var p = s;
    return o === "f" && a === "f" && (p = p * 2 / 3), o === "p" && a === "p" && (p = p * 5 / 6), o === "f" && a === "z" && (p = p * 5 / 8), p;
  }
  return R0 = l, R0;
}
var I0, $n;
function Fo() {
  if ($n) return I0;
  $n = 1;
  var _ = Wr();
  function m(g, l, r) {
    l.pitch === void 0 && window.console.error("Dynamic Element y-coordinate not set.");
    var o = 1, a = 1, s = _(g, l.anchor.x, l.pitch, l.dec, {
      scalex: o,
      scaley: a,
      klass: g.controller.classes.generate("decoration dynamics"),
      fill: g.foregroundColor,
      stroke: "none",
      name: "dynamics"
    });
    return r.wrapSvgEl({ el_type: "dynamicDecoration", startChar: -1, endChar: -1, decoration: l.dec }, s), [s];
  }
  return I0 = m, I0;
}
var F0, Vn;
function Oo() {
  if (Vn) return F0;
  Vn = 1;
  var _ = qe(), m = Pe(), g = ze(), l = Se();
  function r(s, p, u) {
    s.paper.openGroup({ klass: s.controller.classes.generate("triplet " + p.durationClass), "data-name": "triplet" }), p.hasBeam || a(s, p.anchor1.x, p.startNote, p.anchor2.x + p.anchor2.w, p.endNote, p.up), m(s, { x: p.xTextPos, y: s.calcY(p.yTextPos - 1), text: "" + p.number, type: "tripletfont", anchor: "middle", centerVertically: !0, noClass: !0, name: "" + p.number }, !0);
    var d = s.paper.closeGroup();
    return u.wrapSvgEl({ el_type: "triplet", startChar: -1, endChar: -1 }, d), d;
  }
  function o(s, p, u, d) {
    return _("M %f %f L %f %f", l(s), l(p), l(u), l(d));
  }
  function a(s, p, u, d, f, i) {
    u = s.calcY(u), f = s.calcY(f);
    var n = i ? 5 : -5, t = "";
    t += o(p, u, p, u + n), t += o(d, f, d, f + n);
    var e = p + (d - p) / 2, c = 8, v = (f - u) / (d - p), h = e - c, y = u + (h - p) * v;
    t += o(p, u, h, y);
    var w = e + c, A = u + (w - p) * v;
    t += o(w, A, d, f), g(s, { path: t, stroke: s.foregroundColor, "data-name": "triplet-bracket" });
  }
  return F0 = r, F0;
}
var O0, Kn;
function Ho() {
  if (Kn) return O0;
  Kn = 1;
  var _ = qe(), m = Pe(), g = ze(), l = Se();
  function r(o, a, s, p, u) {
    a.pitch === void 0 && window.console.error("Ending Element y-coordinate not set.");
    var d = l(o.calcY(a.pitch)), f = 20, i = "";
    a.anchor1 && (s = l(a.anchor1.x + a.anchor1.w), i += _(
      "M %f %f L %f %f ",
      s,
      d,
      s,
      l(d + f)
    )), a.anchor2 && (p = l(a.anchor2.x), i += _(
      "M %f %f L %f %f ",
      p,
      d,
      p,
      l(d + f)
    )), i += _(
      "M %f %f L %f %f ",
      s,
      d,
      p,
      d
    ), o.paper.openGroup({
      klass: o.controller.classes.generate("ending"),
      // MAE 17 May 2025 - Ending numbers not being drawn in correct color
      fill: o.foregroundColor,
      "data-name": "ending"
    }), g(o, {
      path: i,
      stroke: o.foregroundColor,
      fill: o.foregroundColor,
      "data-name": "line"
    }), a.anchor1 && m(o, {
      x: l(s + 5),
      y: l(o.calcY(a.pitch - 0.5)),
      text: a.text,
      type: "repeatfont",
      klass: "ending",
      anchor: "start",
      noClass: !0,
      name: a.text
    });
    var n = o.paper.closeGroup();
    return u.wrapSvgEl({ el_type: "ending", startChar: -1, endChar: -1 }, n), [n];
  }
  return O0 = r, O0;
}
var H0, Qn;
function zo() {
  if (Qn) return H0;
  Qn = 1;
  var _ = qe(), m = Se();
  function g(o, a, s, p, u) {
    l(a, s, p);
    var d = "";
    a.anchor1 ? d += "abcjs-start-m" + a.anchor1.parent.counters.measure + "-n" + a.anchor1.parent.counters.note : d += "abcjs-start-edge", a.anchor2 ? d += " abcjs-end-m" + a.anchor2.parent.counters.measure + "-n" + a.anchor2.parent.counters.note : d += " abcjs-end-edge", a.hint && (d = "abcjs-hint");
    var f = a.fixedY ? 1.5 : 0, i = r(o, a.startX, a.endX, a.startY + f, a.endY + f, a.above, d, a.isTie, a.dotted), n = -1;
    a.anchor1 && !a.isTie && (n = a.anchor1.parent.abcelem.startChar - 1);
    var t = -1;
    return a.anchor2 && !a.isTie && (t = a.anchor2.parent.abcelem.endChar + 1), u.wrapSvgEl({ el_type: "slur", startChar: n, endChar: t }, i), [i];
  }
  var l = function(o, a, s) {
    !o.anchor1 || !o.anchor2 || o.anchor1.pitch === o.anchor2.pitch && o.internalNotes.length === 0 ? o.isTie = !0 : o.isTie = !1, o.isTie ? (o.calcTieDirection(), o.calcX(a, s), o.calcTieY()) : (o.calcSlurDirection(), o.calcX(a, s), o.calcSlurY()), o.avoidCollisionAbove();
  }, r = function(o, a, s, p, u, d, f, i, n) {
    var t = i ? 1.2 : 1.5;
    a = m(a + 6), s = m(s + 4), p = p + (d ? t : -t), u = u + (d ? t : -t);
    var e = m(o.calcY(p)), c = m(o.calcY(u)), v = s - a, h = c - e, y = Math.sqrt(v * v + h * h), w = v / y, A = h / y, P = y / 3.5, N = i ? 10 : 25, T = (d ? -1 : 1) * Math.min(N, Math.max(4, P)), q = m(a + P * w - T * A), I = m(e + P * A + T * w), C = m(s - P * w - T * A), B = m(c - P * A + T * w), R = 2;
    f ? f += " slur" : f = "slur", f += i ? " tie" : " legato";
    var S;
    if (n) {
      f += " dotted";
      var k = _(
        "M %f %f C %f %f %f %f %f %f",
        a,
        e,
        q,
        I,
        C,
        B,
        s,
        c
      );
      S = o.paper.path({ path: k, stroke: o.foregroundColor, fill: "none", "stroke-dasharray": "5 5", class: o.controller.classes.generate(f), "data-name": i ? "tie" : "slur" });
    } else {
      var M = _(
        "M %f %f C %f %f %f %f %f %f C %f %f %f %f %f %f z",
        a,
        e,
        q,
        I,
        C,
        B,
        s,
        c,
        m(C - R * A),
        m(B + R * w),
        m(q - R * A),
        m(I + R * w),
        a,
        e
      );
      S = o.paper.path({ path: M, stroke: "none", fill: o.foregroundColor, class: o.controller.classes.generate(f), "data-name": i ? "tie" : "slur" });
    }
    return S;
  };
  return H0 = g, H0;
}
var z0, Jn;
function Go() {
  if (Jn) return z0;
  Jn = 1;
  var _ = ze(), m = Se();
  function g(a, s) {
    if (s.beams.length !== 0) {
      for (var p = "", u = 0; u < s.beams.length; u++) {
        var d = s.beams[u];
        if (d.split) {
          for (var f = r(a, d.startX, d.startY, d.endX, d.endY), i = [], n = 0; n < d.split.length; n += 2)
            i.push([d.split[n], d.split[n + 1]]);
          for (n = 0; n < i.length; n++) {
            var t = o(d.startX, d.startY, f, i[n][0]), e = o(d.startX, d.startY, f, i[n][1]);
            p += l(a, i[n][0], t, i[n][1], e, d.dy);
          }
        } else
          p += l(a, d.startX, d.startY, d.endX, d.endY, d.dy);
      }
      var c = ("abcjs-d" + s.duration).replace(/\./g, "-"), v = a.controller.classes.generate("beam-elem " + c), h = _(a, {
        path: p,
        stroke: "none",
        fill: a.foregroundColor,
        class: v
      });
      return [h];
    }
  }
  function l(a, s, p, u, d, f) {
    p = m(a.calcY(p)), d = m(a.calcY(d)), s = m(s), u = m(u);
    var i = m(p + f), n = m(d + f);
    return "M" + s + " " + p + " L" + u + " " + d + "L" + u + " " + n + " L" + s + " " + i + "z";
  }
  function r(a, s, p, u, d) {
    return (d - p) / (u - s);
  }
  function o(a, s, p, u) {
    var d = u - a;
    return s + d * p;
  }
  return z0 = g, z0;
}
var G0, Zn;
function Ur() {
  if (Zn) return G0;
  Zn = 1;
  var _ = Yr(), m = Se();
  function g(l, r, o, a, s, p, u) {
    if (o < 0 || a < s) {
      var d = m(s);
      s = m(a), a = d;
    } else
      a = m(a), s = m(s);
    r = m(r);
    var f = m(r + o);
    if (l.firefox) {
      r += o / 2;
      var n = {
        x1: r,
        x2: r,
        y1: a,
        y2: s,
        stroke: l.foregroundColor,
        "stroke-width": Math.abs(o)
      };
      return p && (n.class = p), u && (n["data-name"] = u), l.paper.lineToBack(n);
    }
    for (var i = [["M", r, a], ["L", r, s], ["L", f, s], ["L", f, a], ["z"]], n = { path: "" }, t = 0; t < i.length; t++)
      n.path += i[t].join(" ");
    return p && (n.class = p), u && (n["data-name"] = u), _.isInGroup() || (n.stroke = "none", n.fill = l.foregroundColor), l.paper.pathToBack(n);
  }
  return G0 = g, G0;
}
var Y0, ei;
function Yo() {
  if (ei) return Y0;
  ei = 1;
  var _ = qe(), m = Se();
  function g(l, r, o, a, s, p, u) {
    var d = l.foregroundColor;
    r = m(r), o = m(o);
    var f = m(a - u), i = m(a + u);
    if (l.firefox) {
      a += u / 2;
      var n = {
        x1: r,
        x2: o,
        y1: a,
        y2: a,
        stroke: l.foregroundColor,
        "stroke-width": Math.abs(u * 2)
      };
      return s && (n.class = s), p && (n["data-name"] = p), l.paper.lineToBack(n);
    }
    var t = _(
      "M %f %f L %f %f L %f %f L %f %f z",
      r,
      f,
      o,
      f,
      o,
      i,
      r,
      i
    ), e = { path: t, stroke: "none", fill: d };
    p && (e["data-name"] = p), s && (e.class = s);
    var c = l.paper.pathToBack(e);
    return c;
  }
  return Y0 = g, Y0;
}
var W0, ti;
function us() {
  if (ti) return W0;
  ti = 1;
  var _ = Yo();
  function m(g, l, r, o, a, s, p) {
    var u = g.calcY(o);
    return _(g, l, r, u, a, s, p);
  }
  return W0 = m, W0;
}
var U0, ri;
function ds() {
  if (ri) return U0;
  ri = 1;
  var _ = Pe(), m = Ur(), g = us(), l = Wr();
  function r(a, s, p) {
    s.pitch === void 0 && window.console.error(s.type + " Relative Element y-coordinate not set.");
    var u = a.calcY(s.pitch);
    switch (s.type) {
      case "symbol":
        if (s.c === null) return null;
        var d = "symbol";
        s.klass && (d += " " + s.klass), s.graphelem = l(a, s.x, s.pitch, s.c, {
          scalex: s.scalex,
          scaley: s.scaley,
          klass: a.controller.classes.generate(d),
          //				fill:"none",
          //				stroke: renderer.foregroundColor,
          name: s.name
        });
        break;
      case "debug":
        s.graphelem = _(a, { x: s.x, y: a.calcY(15), text: "" + s.c, type: "debugfont", klass: a.controller.classes.generate("debug-msg"), anchor: "start", centerVertically: !1, dim: s.dim }, !1);
        break;
      case "tabNumber":
        var f = "middle", i = "tabnumberfont", n = "abcjs-tab-number";
        s.isGrace && (i = "tabgracefont", u += 2.5, n = "tab-grace"), s.graphelem = _(a, { x: s.x, y: u, text: "" + s.c, type: i, klass: a.controller.classes.generate(n), anchor: f, centerVertically: !1, dim: s.dim, cursor: "default" }, !1);
        break;
      case "barNumber":
        s.graphelem = _(a, { x: s.x, y: u, text: "" + s.c, type: "measurefont", klass: a.controller.classes.generate("bar-number"), anchor: "middle", dim: s.dim, name: "bar-number" }, !0);
        break;
      case "lyric":
        s.graphelem = _(a, { x: s.x, y: u, text: s.c, type: "vocalfont", klass: a.controller.classes.generate("lyric"), anchor: "middle", dim: s.dim, name: "lyric" }, !1);
        break;
      case "chord":
        s.graphelem = _(a, { x: s.x, y: u, text: s.c, type: "gchordfont", klass: a.controller.classes.generate("chord"), anchor: "middle", dim: s.dim, lane: s.getLane(), name: "chord" }, !1);
        break;
      case "decoration":
        s.graphelem = _(a, { x: s.x, y: u + 6, text: s.c, type: "annotationfont", klass: a.controller.classes.generate("annotation"), anchor: s.anchor, centerVertically: !0, dim: s.dim }, !1);
        break;
      case "text":
        s.graphelem = _(a, { x: s.x, y: u, text: s.c, type: "annotationfont", klass: a.controller.classes.generate("annotation"), anchor: "start", centerVertically: s.centerVertically, dim: s.dim, lane: s.getLane(), name: "annotation" }, !1);
        break;
      case "multimeasure-text":
        s.graphelem = _(a, { x: s.x + s.w / 2, y: u, text: s.c, type: "tempofont", klass: a.controller.classes.generate("rest"), anchor: "middle", centerVertically: !1, dim: s.dim }, !1);
        break;
      case "part":
        s.graphelem = _(a, { x: s.x, y: u, text: s.c, type: "partsfont", klass: a.controller.classes.generate("part"), anchor: "start", dim: s.dim, name: s.c }, !0);
        break;
      case "bar":
        s.graphelem = m(a, s.x, s.linewidth + a.lineThickness, u, p || a.calcY(s.pitch2), null, "bar");
        break;
      // bartop can't be 0
      case "stem":
        var t = s.linewidth > 0 ? s.linewidth + a.lineThickness : s.linewidth - a.lineThickness;
        s.graphelem = m(a, s.x, t, u, a.calcY(s.pitch2), "abcjs-stem", "stem");
        break;
      case "ledger":
        s.graphelem = g(a, s.x, s.x + s.w, s.pitch, "abcjs-ledger", "ledger", 0.35 + a.lineThickness);
        break;
    }
    return s.scalex !== 1 && s.graphelem && o(a.paper, s.graphelem, s.scalex, s.scaley, s.x, u), s.graphelem;
  }
  function o(a, s, p, u, d, f) {
    a.setAttributeOnElement(s, {
      transform: "translate(" + d + " " + f + ") scale(" + p + "," + u + ") translate(-" + d + " -" + f + ")"
    });
  }
  return U0 = r, U0;
}
var X0, ai;
function Wo() {
  if (ai) return X0;
  ai = 1;
  var _ = ds(), m = Pe();
  function g(l, r) {
    var o = r.x;
    r.pitch === void 0 && window.console.error("Tempo Element y-coordinate not set."), r.tempo.el_type = "tempo";
    var a = l.calcY(r.pitch) + 2, s, p;
    if (r.tempo.preString) {
      s = m(l, { x: o, y: a, text: r.tempo.preString, type: "tempofont", klass: "abcjs-tempo", anchor: "start", noClass: !0, name: "pre" }, !0), p = l.controller.getTextSize.calc(r.tempo.preString, "tempofont", "tempo", s);
      var u = p.width, d = u / r.tempo.preString.length;
      o += u + d;
    }
    if (r.note) {
      r.note.setX(o);
      for (var f = 0; f < r.note.children.length; f++)
        _(l, r.note.children[f], o);
      o += r.note.w + 5;
      var i = "= " + r.tempo.bpm;
      s = m(l, { x: o, y: a, text: i, type: "tempofont", klass: "abcjs-tempo", anchor: "start", noClass: !0, name: "beats" }), p = l.controller.getTextSize.calc(i, "tempofont", "tempo", s);
      var n = p.width, t = n / i.length;
      o += n + t;
    }
    r.tempo.postString && m(l, { x: o, y: a, text: r.tempo.postString, type: "tempofont", klass: "abcjs-tempo", anchor: "start", noClass: !0, name: "post" }, !0);
  }
  return X0 = g, X0;
}
var j0, ni;
function Uo() {
  if (ni) return j0;
  ni = 1;
  var _ = Wo(), m = ds(), g = Ce(), l = Hr(), r = Yr();
  function o(a, s, p, u, d) {
    if (!s.invisible) {
      var f = s.children.length > 0 && s.children[0].type === "TempoElement";
      s.elemset = [], r.beginGroup(a.paper, a.controller);
      for (var i = 0; i < s.children.length; i++) {
        var n = s.children[i];
        switch (n.type) {
          case "TempoElement":
            _(a, n);
            break;
          default:
            var t = m(a, n, p);
            if (n.type === "symbol" && n.c && n.c.indexOf("notehead") >= 0 && t.setAttribute("class", "abcjs-notehead"), t && n.chordPos && n.name.indexOf("flags.") !== 0) {
              var e = t.getAttribute("class");
              e ? e = e + " abcjs-chord-pos-" + n.chordPos : e = "abcjs-chord-pos-" + n.chordPos, t.setAttribute("class", e);
            }
        }
      }
      var e = s.type;
      if ((s.type === "note" || s.type === "rest") && (s.counters = a.controller.classes.getCurrent(), e += " d" + Math.round(s.durationClass * 1e3) / 1e3, e = e.replace(/\./g, "-"), s.abcelem.pitches))
        for (var c = 0; c < s.abcelem.pitches.length; c++)
          e += " p" + s.abcelem.pitches[c].pitch;
      var v = r.endGroup(e, s.type, s.extraClass);
      if (v) {
        if (s.cloned && (s.cloned.overrideClasses = v.className.baseVal), s.overrideClasses) {
          var h = v.classList && v.classList.length > 0 ? v.classList[0] + " " : "";
          v.setAttribute("class", h + s.overrideClasses);
        }
        if (f)
          s.startChar = s.abcelem.startChar, s.endChar = s.abcelem.endChar, u.add(s, v, !1, d);
        else {
          s.elemset.push(v);
          var y = !1;
          (s.type === "note" || s.type === "tabNumber") && (y = !0), u.add(s, v, y, d);
        }
      } else s.elemset.length > 0 && u.add(s, s.elemset[0], s.type === "note", d);
      if (s.klass && l(s.elemset, "mark", "", "#00ff00"), s.hint && l(s.elemset, "abcjs-hint", "", null), s.abcelem.abselem = s, s.heads && s.heads.length > 0) {
        s.notePositions = [];
        for (var w = 0; w < s.heads.length; w++)
          s.notePositions.push({
            x: s.heads[w].x + s.heads[w].w / 2,
            y: d.zero - s.heads[w].pitch * g.STEP
          });
      }
    }
  }
  return j0 = o, j0;
}
var $0, ii;
function Xo() {
  if (ii) return $0;
  ii = 1;
  var _ = Ro(), m = Io(), g = Fo(), l = Oo(), r = Ho(), o = zo(), a = Go(), s = Pe(), p = Uo();
  function u(f, i, n, t, e) {
    var c = i.w - 1;
    f.staffbottom = i.staff.bottom;
    var v = f.foregroundColor;
    if (i.color && (f.foregroundColor = i.color), i.header) {
      var h = s(f, { x: f.padding.left, y: f.calcY(i.headerPosition), text: i.header, type: "voicefont", klass: "staff-extra voice-name", anchor: "start", centerVertically: !0, name: "voice-name" }, !0);
      t.wrapSvgEl({ el_type: "voiceName", startChar: -1, endChar: -1, text: i.header }, h);
    }
    var y, w, A = !1;
    for (y = 0; y < i.children.length; y++) {
      w = i.children[y], (w.type === "note" || w.type === "rest") && (A = !0);
      var P = !1;
      w.type !== "staff-extra" && !f.controller.classes.isInMeasure() && (f.controller.classes.startMeasure(), P = !0), i.staff.isTabStaff && (w.invisible = !1, w.type == "bar" && w.abcelem.lastBar && (n = i.topLine)), p(f, w, i.barto || y === i.children.length - 1 ? n : 0, t, e), (w.type === "note" || d(w)) && f.controller.classes.incrNote(), w.type === "bar" && !P && A && f.controller.classes.incrMeasure();
    }
    for (f.controller.classes.startMeasure(), y = 0; y < i.beams.length; y++) {
      var N = i.beams[y];
      N === "bar" ? f.controller.classes.incrMeasure() : a(f, N, t);
    }
    for (f.controller.classes.startMeasure(), y = 0; y < i.otherchildren.length; y++)
      if (w = i.otherchildren[y], w === "bar")
        f.controller.classes.incrMeasure();
      else
        switch (w.type) {
          case "GlissandoElem":
            w.elemset = _(f, w, t);
            break;
          case "CrescendoElem":
            w.elemset = m(f, w, t);
            break;
          case "DynamicDecoration":
            w.elemset = g(f, w, t);
            break;
          case "TripletElem":
            l(f, w, t);
            break;
          case "EndingElem":
            w.elemset = r(f, w, i.startx + 10, c, t);
            break;
          case "TieElem":
            w.elemset = o(f, w, i.startx + 10, c, t);
            break;
          default:
            console.log(w), p(f, w, i.startx + 10, c, t, e);
        }
    f.foregroundColor = v;
  }
  function d(f) {
    return f.type !== "rest" ? !1 : !!(f.abcelem && f.abcelem.rest && f.abcelem.rest.type !== "spacer");
  }
  return $0 = u, $0;
}
var V0, si;
function jo() {
  if (si) return V0;
  si = 1;
  var _ = us();
  function m(g, l, r, o, a, s) {
    var p = "abcjs-top-line", u = 2;
    a && (u = a), g.paper.openGroup({ prepend: !0, klass: g.controller.classes.generate("abcjs-staff") });
    var d = 0, f = 0;
    if (o === 1)
      _(g, l, r, 6, p, null, s + g.lineThickness), d = g.calcY(10), f = g.calcY(2);
    else
      for (var i = o - 1; i >= 0; i--) {
        var n = (i + 1) * u;
        f = g.calcY(n), d === 0 && (d = f), _(g, l, r, n, p, null, s + g.lineThickness), p = void 0;
      }
    return g.paper.closeGroup(), [d, f];
  }
  return V0 = m, V0;
}
var K0, oi;
function $o() {
  if (oi) return K0;
  oi = 1;
  function _(m, g, l) {
    var r = m.paper.rectBeneath(g);
    return l && m.paper.text(l, { x: 0, y: g.y + 7, "text-anchor": "start", "font-size": "14px", fill: "rgba(0,0,255,.4)", stroke: "rgba(0,0,255,.4)" }), r;
  }
  return K0 = _, K0;
}
var Q0, ci;
function Vo() {
  if (ci) return Q0;
  ci = 1;
  function _(m, g) {
    var l = "rgba(0,0,0,255)", r = "rgba(0,0,0,0)", o = Math.round(m.y), a = m.controller.width, s = (a - g) / 2, p = s + g, u = "M " + s + " " + o + " L " + p + " " + o + " L " + p + " " + (o + 1) + " L " + s + " " + (o + 1) + " L " + s + " " + o + " z";
    m.paper.pathToBack({ path: u, stroke: r, fill: l, class: m.controller.classes.generate("defined-text") });
  }
  return Q0 = _, Q0;
}
var J0, li;
function ps() {
  if (li) return J0;
  li = 1;
  var _ = Vo(), m = Pe();
  function g(l, r, o) {
    for (var a = 0; a < r.rows.length; a++) {
      var s = r.rows[a];
      if (s.absmove)
        l.absolutemoveY(s.absmove);
      else if (s.move)
        l.moveY(s.move);
      else if (s.text || s.phrases) {
        var p = s.left ? s.left : 0, u = m(l, {
          x: p,
          y: l.y,
          text: s.text,
          phrases: s.phrases,
          "dominant-baseline": s["dominant-baseline"],
          type: s.font,
          klass: s.klass,
          name: s.name,
          anchor: s.anchor
        });
        s.absElemType && o.wrapSvgEl({
          el_type: s.absElemType,
          name: s.name,
          startChar: s.startChar,
          endChar: s.endChar,
          text: s.text
        }, u);
      } else if (s.separator)
        _(l, s.separator);
      else if (s.startGroup)
        l.paper.openGroup({ klass: s.klass, "data-name": s.name });
      else if (s.endGroup) {
        var d = l.paper.closeGroup();
        s.absElemType && o.wrapSvgEl({
          el_type: s.absElemType,
          name: s.name,
          startChar: s.startChar,
          endChar: s.endChar,
          text: ""
        }, d);
      }
    }
  }
  return J0 = g, J0;
}
var Z0, fi;
function Ko() {
  if (fi) return Z0;
  fi = 1;
  var _ = Ce(), m = Do(), g = Xo(), l = jo(), r = $o(), o = Ur(), a = ps();
  function s(d, f, i, n) {
    for (var t, e = d.y, c = 0; c < f.staffs.length; c++) {
      var v = f.staffs[c];
      d.moveY(_.STEP, v.top), v.absoluteY = d.y, d.showDebug && (d.showDebug.indexOf("box") >= 0 && v.voices && u(d, f.voices, v.voices), d.showDebug.indexOf("grid") >= 0 && (d.paper.dottedLine({ x1: d.padding.left, x2: d.padding.left + d.controller.width, y1: e, y2: e, stroke: "#0000ff" }), r(
        d,
        {
          x: d.padding.left,
          y: d.calcY(v.originalTop),
          width: d.controller.width,
          height: d.calcY(v.originalBottom) - d.calcY(v.originalTop),
          fill: d.foregroundColor,
          stroke: d.foregroundColor,
          "fill-opacity": 0.1,
          "stroke-opacity": 0.1
        }
      ), t = 0, S(v, "chordHeightAbove"), S(v, "chordHeightBelow"), S(v, "dynamicHeightAbove"), S(v, "dynamicHeightBelow"), S(v, "endingHeightAbove"), S(v, "lyricHeightAbove"), S(v, "lyricHeightBelow"), S(v, "partHeightAbove"), S(v, "tempoHeightAbove"), S(v, "volumeHeightAbove"), S(v, "volumeHeightBelow"))), d.moveY(_.STEP, -v.bottom), d.showDebug && d.showDebug.indexOf("grid") >= 0 && d.paper.dottedLine({
        x1: d.padding.left,
        x2: d.padding.left + d.controller.width,
        y1: d.y,
        y2: d.y,
        stroke: "#0000aa"
      });
    }
    for (var h, y, w = 2, A = 0, P = 0; P < f.voices.length; P++) {
      var N = f.voices[P].staff, T = f.voices[P].tabNameInfos;
      if (d.y = N.absoluteY, d.controller.classes.incrVoice(), !f.voices[P].duplicate) {
        if (h || (h = d.calcY(10)), y = d.calcY(w), N.lines !== 0) {
          N.linePitch && (w = N.linePitch), d.controller.classes.newMeasure();
          var q = l(d, f.startx, f.w, N.lines, N.linePitch, 0.35);
          y = q[1], N.bottomLine = y, N.topLine = q[0], N.hasTab && (A = N.topLine), N.hasStaff && (A = N.hasStaff.topLine, f.voices[P].barto = !0, f.voices[P].topLine = h);
        }
        p(d, N.absoluteY, f.brace, P, i), p(d, N.absoluteY, f.bracket, P, i);
      }
      g(d, f.voices[P], A, i, {
        top: e,
        zero: d.y,
        height: f.height * _.STEP
      });
      var I = 0;
      if (T) {
        var C = { rows: [] };
        C.rows.push({ absmove: y + 2 });
        var B = 8;
        C.rows.push({ left: f.startx + B, text: T.name, font: "tablabelfont", klass: "text instrument-name", anchor: "start" }), C.rows.push({ move: T.textSize.height }), a(d, C), I = T.textSize.height;
      }
      d.controller.classes.newMeasure(), f.voices[P].duplicate || (A = d.calcY(2 + I));
    }
    d.controller.classes.newMeasure();
    var R = f.staffs.length;
    R > 1 && (h = f.staffs[0].topLine, y = f.staffs[R - 1].bottomLine, o(d, f.startx, 0.6, h, y, null)), d.y = e;
    function S(k, M) {
      var F = [
        "rgb(207,27,36)",
        "rgb(168,214,80)",
        "rgb(110,161,224)",
        "rgb(191,119,218)",
        "rgb(195,30,151)",
        "rgb(31,170,177)",
        "rgb(220,166,142)"
      ];
      if (k.positionY && k.positionY[M]) {
        var L = k.specialY[M] * _.STEP;
        M === "chordHeightAbove" && k.specialY.chordLines && k.specialY.chordLines.above && (L *= k.specialY.chordLines.above), M === "chordHeightBelow" && k.specialY.chordLines && k.specialY.chordLines.below && (L *= k.specialY.chordLines.below), r(
          d,
          {
            x: d.padding.left,
            y: d.calcY(k.positionY[M]),
            width: d.controller.width,
            height: L,
            fill: F[t],
            stroke: F[t],
            "fill-opacity": 0.4,
            "stroke-opacity": 0.4
          },
          M.substr(0, 4)
        ), t += 1, t > 6 && (t = 0);
      }
    }
  }
  function p(d, f, i, n, t) {
    if (i)
      for (var e = 0; e < i.length; e++)
        i[e].isStartVoice(n) && (i[e].startY = f - _.STEP * 10, i[e].elemset = m(d, i[e], t));
  }
  function u(d, f, i) {
    for (var n = 0; n < i.length; n++)
      for (var t = f[i[n]].children, e = 0; e < t.length; e++) {
        var c = t[e], v = c.getFixedCoords();
        if (!(c.invisible || v.t === void 0 || v.b === void 0)) {
          var h = (v.t - v.b) * _.STEP;
          r(
            d,
            {
              x: v.x,
              y: d.calcY(v.t),
              width: v.w,
              height: h,
              fill: "#88e888",
              "fill-opacity": 0.4,
              stroke: "#4aa93d",
              "stroke-opacity": 0.8
            }
          );
          for (var y = 0; y < c.children.length; y++) {
            var w = c.children[y], A = w.getChordDim();
            if (A) {
              var P = d.calcY(w.pitch);
              P += w.dim.font.size * w.getLane(), r(
                d,
                {
                  x: A.left,
                  y: P,
                  width: A.right - A.left,
                  height: w.dim.font.size,
                  fill: "none",
                  stroke: "#4aa93d",
                  "stroke-opacity": 0.8
                }
              );
            }
          }
        }
      }
  }
  return Z0 = s, Z0;
}
var er, hi;
function Qo() {
  if (hi) return er;
  hi = 1;
  function _(m, g, l, r) {
    var o = (g + m.padding.left + m.padding.right) * l, a = (m.y + m.padding.bottom) * l;
    if (m.isPrint && (a = Math.max(a, 1056)), m.ariaLabel !== "") {
      var s = "Sheet Music";
      m.abctune && m.abctune.metaText && m.abctune.metaText.title && (s += ' for "' + m.abctune.metaText.title + '"'), m.paper.setTitle(s);
      var p = m.ariaLabel ? m.ariaLabel : s;
      m.paper.setAttribute("aria-label", p);
    }
    var u = [
      "-webkit-touch-callout: none;",
      "-webkit-user-select: none;",
      "-khtml-user-select: none;",
      "-moz-user-select: none;",
      "-ms-user-select: none;",
      "user-select: none;"
    ];
    m.paper.insertStyles(".abcjs-dragging-in-progress text, .abcjs-dragging-in-progress tspan {" + u.join(" ") + "}");
    var d = { overflow: "hidden" };
    r === "resize" ? m.paper.setResponsiveWidth(o, a) : (d.width = "", d.height = a + "px", l < 1 ? (d.width = o + "px", m.paper.setSize(o / l, a / l)) : m.paper.setSize(o, a)), m.paper.setScale(l), m.paper.setParentStyles(d);
  }
  return er = _, er;
}
var tr, ui;
function Jo() {
  if (ui) return tr;
  ui = 1;
  var _ = as(), m = ns();
  function g(l, r, o) {
    this.elements = [], this.paper = l, this.tuneNumber = o, this.selectTypes = r;
  }
  return g.prototype.getElements = function() {
    return this.elements;
  }, g.prototype.add = function(l, r, o, a) {
    if (this.canSelect(l)) {
      var s;
      this.selectTypes === void 0 ? s = { selectable: !1, "data-index": this.elements.length } : s = { selectable: !0, tabindex: 0, "data-index": this.elements.length }, this.paper.setAttributeOnElement(r, s);
      var p = { absEl: l, svgEl: r, isDraggable: o };
      a !== void 0 && (p.staffPos = a), this.elements.push(p);
    }
  }, g.prototype.canSelect = function(l) {
    return this.selectTypes === !1 || !l || !l.abcelem ? !1 : this.selectTypes === !0 ? !0 : this.selectTypes === void 0 ? l.abcelem.el_type === "note" || l.abcelem.el_type === "tabNumber" : this.selectTypes.indexOf(l.abcelem.el_type) >= 0;
  }, g.prototype.wrapSvgEl = function(l, r) {
    var o = {
      tuneNumber: this.tuneNumber,
      abcelem: l,
      elemset: [r],
      highlight: _,
      unhighlight: m
    };
    this.add(o, r, !1);
  }, tr = g, tr;
}
var rr, di;
function Zo() {
  if (di) return rr;
  di = 1;
  const _ = Wr(), m = Ur();
  function g(h, y, w, A, P) {
    const N = P.gchordfont;
    P.partsfont;
    const T = P.annotationfont, q = P.repeatfont, I = P.textfont, C = P.subtitlefont, B = 50, R = 10, S = 14, k = 10, M = 20, F = 16;
    h.paper.openGroup({ klass: "abcjs-chord-grid" }), y.forEach((L) => {
      switch (L.type) {
        case "text":
          v(h, L.text, w, h.y, 16, I, null, null, !1), h.moveY(F);
          break;
        case "subtitle":
          v(h, L.subtitle, w, h.y + k, 20, C, null, "abcjs-subtitle", !1), h.moveY(M);
          break;
        case "part":
          if (L.lines.length > 0) {
            v(h, L.name, w, h.y + k, 20, C, L.name, "abcjs-part", !1), h.moveY(M);
            const b = L.lines[0].length, x = A / b;
            L.lines.forEach((E, D) => {
              let O = !1, z = !1;
              E.forEach(($) => {
                $.ending && (O = !0), $.annotations && $.annotations.length > 0 && (z = !0);
              });
              const H = z ? S : O ? R : 0;
              E.forEach(($, Q) => {
                if (!$.noBorder) {
                  h.paper.rect({ x: w + Q * x, y: h.y, width: x, height: H + B }), h.paper.rect({ x: w + Q * x + 1, y: h.y + 1, width: x - 2, height: H + B - 2 });
                  let ne = 0, J = 0;
                  const te = h.y, U = w + x * Q;
                  $.hasStartRepeat && (r(h, U, te, te + B + H, !0, H), ne = 12), $.hasEndRepeat && (r(h, U + x, te, te + B + H, !1, H), J = 12);
                  let re = 0;
                  $.ending && (re = v(h, $.ending, w + Q * x + 4, te + 10, 12, q, null, null, !1).getBBox().width + 4), s(h, te, w + ne, x, D, Q, $.chord, N, ne + J, B, H), $.annotations && $.annotations.length > 0 && a(h, te, w + Q * x + re, $.annotations, T), H && h.paper.rectBeneath({ x: w + Q * x, y: h.y, width: x, height: H, fill: "#e8e8e8", stroke: "none" });
                }
              }), h.moveY(H + B);
            }), h.moveY(M);
          }
          break;
      }
    }), h.paper.closeGroup();
  }
  function l(h, y, w, A) {
    var P = y - 10, N = y + 10, T = w + 10, q = w - 10, I = y - 10, C = -h.yToPitch(A) + 2, B = y + 6.5, R = -h.yToPitch(A) - 2.3;
    h.paper.lineToBack({ x1: P, x2: N, y1: T, y2: q, "stroke-width": "3px", "stroke-linecap": "round" }), _(h, I, C, "dots.dot", {
      scalex: 1,
      scaley: 1,
      klass: "",
      name: "dot"
    }), _(h, B, R, "dots.dot", {
      scalex: 1,
      scaley: 1,
      klass: "",
      name: "dot"
    });
  }
  function r(h, y, w, A, P, N) {
    const T = P ? y + 2 : y - 4, q = P ? y + 9 : y - 11;
    h.paper.openGroup({ klass: "abcjs-repeat" }), m(h, T, 3 + h.lineThickness, w, A, null, "bar"), _(h, q, -h.yToPitch(N) - 4, "dots.dot", {
      scalex: 1,
      scaley: 1,
      klass: "",
      name: "dot"
    }), _(h, q, -h.yToPitch(N) - 8, "dots.dot", {
      scalex: 1,
      scaley: 1,
      klass: "",
      name: "dot"
    }), h.paper.closeGroup();
  }
  const o = {
    segno: "scripts.segno",
    coda: "scripts.coda",
    fermata: "scripts.ufermata"
  };
  function a(h, y, w, A, P) {
    w += 3;
    let N;
    for (let T = 0; T < A.length; T++)
      switch (A[T]) {
        case "segno":
        case "coda":
        case "fermata":
          {
            w += 12, N = _(h, w, -3, o[A[T]], {
              scalex: 1,
              scaley: 1,
              //klass: renderer.controller.classes.generate(klass),
              name: o[A[T]]
            });
            const q = N.getBBox();
            w += q.width;
          }
          break;
        default:
          v(h, A[T], w, y + 12, 12, P, null, null, !1);
      }
  }
  function s(h, y, w, A, P, N, T, q, I, C, B) {
    const R = w + A * N;
    !T[1] && !T[2] && !T[3] ? n(h, R, y + B, A - I, C, T[0], q, B) : !T[1] && !T[3] ? t(h, R, y, A - I, C, T[0], T[2], q, B) : e(h, R, y, A - I, C, T, q, B);
  }
  function p(h, y, w, A, P, N, T) {
    const q = v(h, P, y, w, A, N, null, "abcjs-chord", !0);
    let I = q.getBBox(), C = A;
    for (; I.width > T && C >= 14; )
      C -= 2, q.setAttribute("font-size", C), I = q.getBBox();
  }
  const u = 34, d = 26, f = 20, i = -3;
  function n(h, y, w, A, P, N, T, q) {
    N === "%" ? l(h, y + A / 2, w + P / 2, q + P / 2) : p(h, y + A / 2, w + P / 2 + i, u, N, T, A);
  }
  function t(h, y, w, A, P, N, T, q, I) {
    h.paper.lineToBack({ x1: y, x2: y + A, y1: w + P + I, y2: w + 2 }), p(h, y + A / 4, w + P / 4 + 5 + I + i, d, N, q, A / 2), p(h, y + 3 * A / 4, w + 3 * P / 4 + I + i, d, T, q, A / 2);
  }
  function e(h, y, w, A, P, N, T, q) {
    h.paper.lineToBack({ x1: y + 3, x2: y + A - 3, y1: w + P / 2 + q, y2: w + P / 2 + q }), h.paper.lineToBack({ x1: y + A / 2, x2: y + A / 2, y1: w + 3 + q, y2: w + P - 3 + q }), N[0] && p(h, y + A / 4, w + P / 4 + 2 + q + i, f, c(N[0]), T, A / 2), N[1] && p(h, y + 3 * A / 4, w + P / 4 + 2 + q + i, f, c(N[1]), T, A / 2), N[2] && p(h, y + A / 4, w + 3 * P / 4 + q + i, f, c(N[2]), T, A / 2), N[3] && p(h, y + 3 * A / 4, w + 3 * P / 4 + q + i, f, c(N[3]), T, A / 2);
  }
  function c(h) {
    return h === "No Chord" ? "N.C." : h;
  }
  function v(h, y, w, A, P, N, T, q, I) {
    const C = {
      x: w,
      y: A,
      stroke: "none",
      "font-size": P,
      "font-style": N.style,
      "font-family": N.face,
      "font-weight": N.weight,
      "text-decoration": N.decoration
    };
    return T && (C["data-name"] = T), q && (C.class = q), C["text-anchor"] = I ? "middle" : "start", h.paper.text(y, C, null, { "alignment-baseline": "middle" });
  }
  return rr = g, rr;
}
var ar, pi;
function ec() {
  if (pi) return ar;
  pi = 1;
  var _ = Ko(), m = Qo(), g = ps(), l = Ce(), r = Jo(), o = Zo();
  function a(u, d, f, i, n, t, e, c, v, h, y) {
    var w = new r(u.paper, c, v), A = {};
    d.shouldAddClasses && (A.klass = "abcjs-meta-top"), u.paper.openGroup(A), u.moveY(u.padding.top), g(u, f.topText, w), u.paper.closeGroup(), u.moveY(u.spacing.music);
    let P = !1;
    y && f.chordGrid && (o(u, f.chordGrid, u.padding.left, i, f.formatting), y === "noMusic" && (P = !0));
    var N = [], T = 0;
    if (!P)
      for (var q = 0; q < f.lines.length; q++) {
        d.incrLine();
        var I = f.lines[q];
        if (I.staff) {
          if (T++, f.formatting.maxStaves && T > f.formatting.maxStaves)
            break;
          d.shouldAddClasses && (A.klass = "abcjs-staff-wrapper abcjs-l" + d.lineNumber), u.paper.openGroup(A), I.vskip && u.moveY(I.vskip), N.length >= 1 ? p(u, u.spacing.staffSeparation, N[N.length - 1], I.staffGroup) : q > 0 && u.moveY(u.spacing.staffSeparation);
          var C = s(u, I.staffGroup, w, q);
          C.line = h + q, N.push(C), u.paper.closeGroup();
        } else I.nonMusic && (d.shouldAddClasses && (A.klass = "abcjs-non-music"), u.paper.openGroup(A), g(u, I.nonMusic, w), u.paper.closeGroup());
      }
    return d.reset(), P || f.bottomText && f.bottomText.rows && f.bottomText.rows.length > 0 && (d.shouldAddClasses && (A.klass = "abcjs-meta-bottom"), u.paper.openGroup(A), u.moveY(24), g(u, f.bottomText, w), u.paper.closeGroup()), m(u, n, e, t), { staffgroups: N, selectables: w.getElements() };
  }
  function s(u, d, f, i) {
    _(u, d, f, i);
    var n = d.height * l.STEP;
    return u.moveY(n), d;
  }
  function p(u, d, f, i) {
    var n = f.staffs[f.staffs.length - 1], t = -(n.bottom - 2), e = i.staffs[0].top - 10, c = e + t, v = c * l.STEP;
    v < d && u.moveY(d - v);
  }
  return ar = a, ar;
}
var nr, vi;
function tc() {
  if (vi) return nr;
  vi = 1;
  var _ = fs();
  function m(g) {
    for (var l = g; l && l.attributes && l.tagName.toLowerCase() !== "svg" && !l.attributes.selectable; )
      l = l.parentNode;
    if (l && l.attributes && l.attributes.selectable) {
      var r = l.attributes["data-index"].nodeValue;
      if (r && (r = parseInt(r, 10), r >= 0 && r < this.selectables.length)) {
        var o = this.selectables[r], a = _(o, g);
        return a.index = r, a.element = o, a;
      }
    }
    return null;
  }
  return nr = m, nr;
}
var ir, gi;
function Xr() {
  if (gi) return ir;
  gi = 1;
  var _ = Ce(), m = po(), g = go(), l = bo(), r = mo(), o = yo(), a = wo(), s = xo(), p = Co(), u = No(), d = Po(), f = Lo(), i = qo(), n = ec(), t = os(), e = tc(), c = function(y, w) {
    w = w || {}, this.findSelectableElement = e, this.oneSvgPerLine = w.oneSvgPerLine, this.selectionColor = w.selectionColor, this.dragColor = w.dragColor ? w.dragColor : w.selectionColor, this.dragging = !!w.dragging, this.selectTypes = w.selectTypes, this.responsive = w.responsive, this.space = 3 * _.SPACE, this.initialClef = w.initialClef, this.timeBasedLayout = w.timeBasedLayout, this.expandToWidest = !!w.expandToWidest, this.scale = w.scale ? parseFloat(w.scale) : 0, this.classes = new d({ shouldAddClasses: w.add_classes }), this.scale > 0.1 || (this.scale = void 0), w.staffwidth ? (this.staffwidthScreen = w.staffwidth, this.staffwidthPrint = w.staffwidth) : (this.staffwidthScreen = 740, this.staffwidthPrint = 680), this.listeners = [], w.clickListener && this.addSelectListener(w.clickListener), this.renderer = new g(y), this.renderer.setPaddingOverride(w), w.showDebug && (this.renderer.showDebug = w.showDebug), w.jazzchords && (this.jazzchords = w.jazzchords), w.accentAbove && (this.accentAbove = w.accentAbove), w.germanAlphabet && (this.germanAlphabet = w.germanAlphabet), w.lineThickness && (this.lineThickness = w.lineThickness), w.chordGrid && (this.chordGrid = w.chordGrid), this.renderer.controller = this, this.renderer.foregroundColor = w.foregroundColor ? w.foregroundColor : "currentColor", w.ariaLabel !== void 0 && (this.renderer.ariaLabel = w.ariaLabel), this.renderer.minPadding = w.minPadding ? w.minPadding : 0, this.reset();
  };
  c.prototype.reset = function() {
    this.selected = [], this.staffgroups = [], this.engraver && this.engraver.reset(), this.engraver = null, this.renderer.reset(), this.dragTarget = null, this.dragIndex = -1, this.dragMouseStart = { x: -1, y: -1 }, this.dragYStep = 0, this.lineThickness && this.renderer.setLineThickness(this.lineThickness);
  }, c.prototype.engraveABC = function(y, w, A) {
    y[0] === void 0 && (y = [y]), this.reset();
    for (var P = 0; P < y.length; P++)
      w === void 0 && (w = P), this.getFontAndAttr = new f(y[P].formatting, this.classes), this.getTextSize = new i(this.getFontAndAttr, this.renderer.paper), this.engraveTune(y[P], w, A);
  }, c.prototype.adjustNonScaledItems = function(y) {
    this.width /= y, this.renderer.adjustNonScaledItems(y);
  }, c.prototype.getMeasureWidths = function(y) {
    this.reset(), this.getFontAndAttr = new f(y.formatting, this.classes), this.getTextSize = new i(this.getFontAndAttr, this.renderer.paper);
    var w = this.jazzchords;
    this.setupTune(y, 0), this.constructTuneElements(y), u(this.renderer, y, 0, this.space, this.timeBasedLayout);
    for (var A = [], P, N = !0, T = 0; T < y.lines.length; T++) {
      var q = y.lines[T];
      if (q.staff) {
        if (N && (P = {
          left: 0,
          measureWidths: [],
          //height: this.renderer.padding.top + this.renderer.spacing.music + this.renderer.padding.bottom + 24, // the 24 is the empirical value added to the bottom of all tunes.
          total: 0
        }, A.push(P), N = !1), q.staffGroup.voices.length > 0)
          for (var I = q.staffGroup.voices[0], C = !1, B = 0, R = 0; R < I.children.length; R++) {
            var S = I.children[R];
            !C && !S.isClef && !S.isKeySig && (C = !0, P.left = S.x, B = S.x), S.type === "bar" && (P.measureWidths.push(S.x - B), P.total += S.x - B, B = S.x);
          }
      } else
        N = !0;
    }
    return this.jazzchords = w, A;
  }, c.prototype.setupTune = function(y, w) {
    this.classes.reset(), y.formatting.jazzchords !== void 0 && (this.jazzchords = y.formatting.jazzchords), y.formatting.accentAbove !== void 0 && (this.accentAbove = y.formatting.accentAbove), this.renderer.newTune(y), this.engraver = new m(this.getTextSize, w, {
      bagpipes: y.formatting.bagpipes,
      flatbeams: y.formatting.flatbeams,
      graceSlurs: y.formatting.graceSlurs !== !1,
      // undefined is the default, which is true
      percmap: y.formatting.percmap,
      initialClef: this.initialClef,
      jazzchords: this.jazzchords,
      timeBasedLayout: this.timeBasedLayout,
      accentAbove: this.accentAbove,
      germanAlphabet: this.germanAlphabet
    }), this.engraver.setStemHeight(this.renderer.spacing.stemHeight), this.engraver.measureLength = y.getMeterFraction().num / y.getMeterFraction().den, y.formatting.staffwidth ? this.width = y.formatting.staffwidth * 1.33 : this.width = this.renderer.isPrint ? this.staffwidthPrint : this.staffwidthScreen;
    var A = y.formatting.scale ? y.formatting.scale : this.scale;
    return this.responsive === "resize" && (A = void 0), A === void 0 && (A = this.renderer.isPrint ? 0.75 : 1), this.adjustNonScaledItems(A), A;
  }, c.prototype.constructTuneElements = function(y) {
    y.topText = new a(y.metaText, y.metaTextInfo, y.formatting, y.lines, this.width, this.renderer.isPrint, this.renderer.padding.left, this.renderer.spacing, this.classes.shouldAddClasses, this.getTextSize);
    var w, A, P = !1, N = !1;
    for (w = 0; w < y.lines.length; w++)
      if (A = y.lines[w], A.staff)
        N = !0, A.staffGroup = this.engraver.createABCLine(A.staff, P ? null : y.metaText.tempo, w), P = !0;
      else if (A.subtitle) {
        if (N) {
          var T = this.width / 2 + this.renderer.padding.left;
          A.nonMusic = new o(this.renderer.spacing.subtitle, y.formatting, A.subtitle, T, this.renderer.padding.left, this.getTextSize);
        }
      } else A.text !== void 0 ? (N = !0, A.nonMusic = new l(A.text, A.vskip, this.getFontAndAttr, this.renderer.padding.left, this.width, this.getTextSize)) : A.separator !== void 0 && A.separator.lineLength && (N = !0, A.nonMusic = new r(A.separator.spaceAbove, A.separator.lineLength, A.separator.spaceBelow));
    y.bottomText = new s(y.metaText, this.width, this.renderer.isPrint, this.renderer.padding.left, this.renderer.spacing, this.classes.shouldAddClasses, this.getTextSize);
  }, c.prototype.engraveTune = function(y, w, A) {
    var P = this.jazzchords, N = this.setupTune(y, w);
    this.constructTuneElements(y);
    var T = u(this.renderer, y, this.width, this.space, this.expandToWidest, this.timeBasedLayout);
    if (this.expandToWidest && T > this.width + 1 && (y.topText = new a(y.metaText, y.metaTextInfo, y.formatting, y.lines, T, this.renderer.isPrint, this.renderer.padding.left, this.renderer.spacing, this.classes.shouldAddClasses, this.getTextSize), y.lines && y.lines.length > 0))
      for (var q = y.lines.length, I = 0; I < q; ++I) {
        var C = y.lines[I];
        if (C.nonMusic && C.nonMusic.rows && C.nonMusic.rows.length > 0)
          for (var B = C.nonMusic.rows.length, R = 0; R < B; ++R) {
            var S = C.nonMusic.rows[R];
            S.left && (C.subtitle ? S.left = T / 2 + this.renderer.padding.left : C.text && C.text.length > 0 && C.text[0].center && (S.left = T / 2 + this.renderer.padding.left));
          }
      }
    y.tablatures && t.layoutTablatures(this.renderer, y);
    var k = n(this.renderer, this.classes, y, this.width, T, this.responsive, N, this.selectTypes, w, A, this.chordGrid);
    if (this.staffgroups = k.staffgroups, this.selectables = k.selectables, this.oneSvgPerLine) {
      var M = this.renderer.paper.svg.parentNode;
      this.svgs = v(this.renderer, M, y.metaText.title, this.responsive, N);
    } else
      this.svgs = [this.renderer.paper.svg];
    p(this, this.svgs), this.jazzchords = P;
  };
  function v(y, w, A, P, N) {
    A || (A = "Untitled");
    var T = w.querySelector("svg");
    P === "resize" && (w.style.paddingBottom = "");
    for (var q = T.querySelector("style"), I = P === "resize" ? T.viewBox.baseVal.width : T.getAttribute("width"), C = w.querySelectorAll("svg > g"), B = 0, R = [], S = 0; S < C.length; S++) {
      var k = C[S], M = k.getBBox(), F = M.y - B, L = M.height + F, b = document.createElement("div"), x = "overflow: hidden;";
      P !== "resize" && (x += "height:" + L * N + "px;"), b.setAttribute("style", x);
      var E = h(T), D = 'Sheet Music for "' + A + '" section ' + (S + 1);
      E.setAttribute("aria-label", D), P !== "resize" && E.setAttribute("height", L), P === "resize" && (E.style.position = "");
      var O = y.firefox ? L + 1 : L;
      E.setAttribute("viewBox", "0 " + B + " " + I + " " + O), E.appendChild(q.cloneNode(!0));
      var z = document.createElement("title");
      z.innerText = D, E.appendChild(z), E.appendChild(k), b.appendChild(E), R.push(E), w.appendChild(b), B = M.y + M.height;
    }
    return w.removeChild(T), R;
  }
  function h(y) {
    for (var w = "http://www.w3.org/2000/svg", A = document.createElementNS(w, "svg"), P = 0; P < y.attributes.length; P++) {
      var N = y.attributes[P];
      N.name !== "height" && N.name != "aria-label" && A.setAttribute(N.name, N.value);
    }
    return A;
  }
  return c.prototype.getDim = function(y) {
    if (!y.dim) {
      var w = y.svgEl.getBBox();
      y.dim = { left: Math.round(w.x), top: Math.round(w.y), right: Math.round(w.x + w.width), bottom: Math.round(w.y + w.height) };
    }
    return y.dim;
  }, c.prototype.addSelectListener = function(y) {
    this.listeners[this.listeners.length] = y;
  }, ir = c, ir;
}
var sr, bi;
function vs() {
  if (bi) return sr;
  bi = 1;
  var _ = Ye();
  ts();
  var m = Xr(), g = Or(), l = Ji(), r = {};
  function o() {
    var u = window.innerWidth;
    for (var d in r)
      if (r.hasOwnProperty(d)) {
        var f = r[d], i = f.offsetLeft;
        u -= i * 2, f.style.width = u + "px";
      }
  }
  try {
    window.addEventListener("resize", o), window.addEventListener("orientationChange", o);
  } catch {
  }
  function a(u, d, f, i, n) {
    f.viewportHorizontal ? (u.innerHTML = '<div class="abcjs-inner"></div>', f.scrollHorizontal ? (u.style.overflowX = "auto", u.style.overflowY = "hidden") : u.style.overflow = "hidden", r[u.id] = u, u = u.children[0]) : f.viewportVertical ? (u.innerHTML = '<div class="abcjs-inner scroll-amount"></div>', u.style.overflowX = "hidden", u.style.overflowY = "auto", u = u.children[0]) : u.innerHTML = "";
    var t = new m(u, f);
    if (t.engraveABC(d, i, n), d.engraver = t, f.viewportVertical || f.viewportHorizontal) {
      var e = u.parentNode;
      e.style.width = u.style.width;
    }
  }
  var s = function(u, d, f, i, n) {
    var t = {}, e;
    if (f) {
      for (e in f)
        f.hasOwnProperty(e) && (t[e] = f[e]);
      t.warnings_id && t.tablature && (t.tablature.warning_id = t.warnings_id);
    }
    if (i)
      for (e in i)
        i.hasOwnProperty(e) && (e === "listener" ? i[e].highlight && (t.clickListener = i[e].highlight) : t[e] = i[e]);
    if (n)
      for (e in n)
        n.hasOwnProperty(e) && (t[e] = n[e]);
    function c(v, h, y, w) {
      var A = !1;
      return v === "*" && (A = !0, v = document.createElement("div"), v.setAttribute("style", "visibility: hidden;"), document.body.appendChild(v)), !A && t.wrap && t.staffwidth ? (h = p(v, h, y, w, t), h) : (t.afterParsing && t.afterParsing(h, y, w), a(v, h, t, y, 0), A && v.parentNode.removeChild(v), null);
    }
    return _.renderEngine(c, u, d, t);
  };
  function p(u, d, f, i, n) {
    var t = new m(u, n), e = t.getMeasureWidths(d), c = l.calcLineWraps(d, e, n);
    if (c.reParse) {
      var v = new g();
      v.parse(i, c.revisedParams), d = v.getTune();
      var h = v.getWarnings();
      h && (d.warnings = h);
    }
    return n.afterParsing && n.afterParsing(d, f, i), a(u, d, c.revisedParams, f, 0), d.explanation = c.explanation, d;
  }
  return sr = s, sr;
}
var or, mi;
function rc() {
  if (mi) return or;
  mi = 1;
  var _ = Ye(), m = Xr(), g = function(l, r) {
    function o(a, s, p, u) {
      a = document.createElement("div"), a.setAttribute("style", "visibility: hidden;"), document.body.appendChild(a);
      var d = new m(a, r), f = d.getMeasureWidths(s);
      return a.parentNode.removeChild(a), { sections: f };
    }
    return _.renderEngine(o, "*", l, r);
  };
  return or = g, or;
}
var cr, yi;
function jr() {
  if (yi) return cr;
  yi = 1;
  var _ = {};
  return cr = _, cr;
}
var lr, wi;
function ac() {
  if (wi) return lr;
  wi = 1;
  var _ = jr(), m = function(g, l, r, o) {
    _[l] || (_[l] = {});
    var a = _[l];
    return a[r] || (a[r] = new Promise(function(s, p) {
      var u = new XMLHttpRequest();
      let d = g + l + "-mp3/" + r + ".mp3";
      u.open("GET", d, !0), u.responseType = "arraybuffer", u.onload = function() {
        if (u.status !== 200) {
          p(Error("Can't load sound at " + d + " status=" + u.status));
          return;
        }
        var f = function(n) {
          s({ instrument: l, name: r, status: "loaded", audioBuffer: n });
        }, i = o.decodeAudioData(u.response, f, function() {
          p(Error("Can't decode sound at " + d));
        });
        i && typeof i.catch == "function" && i.catch(p);
      }, u.onerror = function() {
        p(Error("Can't load sound at " + d));
      }, u.send();
    }).catch((s) => {
      throw console.error("Didn't load note", l, r, ":", s.message), s;
    })), a[r];
  };
  return lr = m, lr;
}
var fr, xi;
function $r() {
  if (xi) return fr;
  xi = 1;
  var _ = [
    "acoustic_grand_piano",
    "bright_acoustic_piano",
    "electric_grand_piano",
    "honkytonk_piano",
    "electric_piano_1",
    "electric_piano_2",
    "harpsichord",
    "clavinet",
    "celesta",
    "glockenspiel",
    "music_box",
    "vibraphone",
    "marimba",
    "xylophone",
    "tubular_bells",
    "dulcimer",
    "drawbar_organ",
    "percussive_organ",
    "rock_organ",
    "church_organ",
    "reed_organ",
    "accordion",
    "harmonica",
    "tango_accordion",
    "acoustic_guitar_nylon",
    "acoustic_guitar_steel",
    "electric_guitar_jazz",
    "electric_guitar_clean",
    "electric_guitar_muted",
    "overdriven_guitar",
    "distortion_guitar",
    "guitar_harmonics",
    "acoustic_bass",
    "electric_bass_finger",
    "electric_bass_pick",
    "fretless_bass",
    "slap_bass_1",
    "slap_bass_2",
    "synth_bass_1",
    "synth_bass_2",
    "violin",
    "viola",
    "cello",
    "contrabass",
    "tremolo_strings",
    "pizzicato_strings",
    "orchestral_harp",
    "timpani",
    "string_ensemble_1",
    "string_ensemble_2",
    "synth_strings_1",
    "synth_strings_2",
    "choir_aahs",
    "voice_oohs",
    "synth_choir",
    "orchestra_hit",
    "trumpet",
    "trombone",
    "tuba",
    "muted_trumpet",
    "french_horn",
    "brass_section",
    "synth_brass_1",
    "synth_brass_2",
    "soprano_sax",
    "alto_sax",
    "tenor_sax",
    "baritone_sax",
    "oboe",
    "english_horn",
    "bassoon",
    "clarinet",
    "piccolo",
    "flute",
    "recorder",
    "pan_flute",
    "blown_bottle",
    "shakuhachi",
    "whistle",
    "ocarina",
    "lead_1_square",
    "lead_2_sawtooth",
    "lead_3_calliope",
    "lead_4_chiff",
    "lead_5_charang",
    "lead_6_voice",
    "lead_7_fifths",
    "lead_8_bass_lead",
    "pad_1_new_age",
    "pad_2_warm",
    "pad_3_polysynth",
    "pad_4_choir",
    "pad_5_bowed",
    "pad_6_metallic",
    "pad_7_halo",
    "pad_8_sweep",
    "fx_1_rain",
    "fx_2_soundtrack",
    "fx_3_crystal",
    "fx_4_atmosphere",
    "fx_5_brightness",
    "fx_6_goblins",
    "fx_7_echoes",
    "fx_8_scifi",
    "sitar",
    "banjo",
    "shamisen",
    "koto",
    "kalimba",
    "bagpipe",
    "fiddle",
    "shanai",
    "tinkle_bell",
    "agogo",
    "steel_drums",
    "woodblock",
    "taiko_drum",
    "melodic_tom",
    "synth_drum",
    "reverse_cymbal",
    "guitar_fret_noise",
    "breath_noise",
    "seashore",
    "bird_tweet",
    "telephone_ring",
    "helicopter",
    "applause",
    "gunshot",
    "percussion"
  ];
  return fr = _, fr;
}
var hr, Ci;
function nc() {
  if (Ci) return hr;
  Ci = 1;
  var _ = $r(), m = function(g) {
    for (var l = [], r = 0; r < g.tracks.length; r++)
      l.push([]);
    var o = _[0];
    return g.tracks.forEach(function(a, s) {
      a.forEach(function(p) {
        switch (p.cmd) {
          case "note":
            var u = p.instrument !== void 0 ? _[p.instrument] : o;
            if (p.duration > 0) {
              var d = p.gap ? p.gap : 0, f = p.duration;
              d = Math.min(d, f * 2 / 3);
              var i = {
                pitch: p.pitch,
                instrument: u,
                start: Math.round(p.start * 1e6) / 1e6,
                end: Math.round((p.start + f - d) * 1e6) / 1e6,
                volume: p.volume
              };
              p.startChar && (i.startChar = p.startChar), p.endChar && (i.endChar = p.endChar), p.style && (i.style = p.style), p.cents && (i.cents = p.cents), l[s].push(i);
            }
            break;
          case "program":
            o = _[p.instrument];
            break;
          case "text":
            break;
          default:
            console.log("Unhandled midi event", p);
        }
      });
    }), l;
  };
  return hr = m, hr;
}
var ur, ki;
function We() {
  if (ki) return ur;
  ki = 1;
  function _(m) {
    if (m)
      window.abcjsAudioContext = m;
    else if (!window.abcjsAudioContext) {
      var g = window.AudioContext || window.webkitAudioContext;
      if (g)
        window.abcjsAudioContext = new g();
      else
        return !1;
    }
    return window.abcjsAudioContext.state !== "suspended";
  }
  return ur = _, ur;
}
var dr, _i;
function Re() {
  if (_i) return dr;
  _i = 1;
  var _ = We();
  function m() {
    return window.abcjsAudioContext || _(), window.abcjsAudioContext;
  }
  return dr = m, dr;
}
var pr, Ti;
function Ue() {
  if (Ti) return pr;
  Ti = 1;
  var _ = Re();
  function m() {
    if (!window.Promise || !window.AudioContext && !window.webkitAudioContext && !navigator.mozAudioContext && !navigator.msAudioContext)
      return !1;
    var g = _();
    if (g)
      return g.resume !== void 0;
  }
  return pr = m, pr;
}
var vr, Si;
function Vr() {
  if (Si) return vr;
  Si = 1;
  var _ = {
    21: "A0",
    22: "Bb0",
    23: "B0",
    24: "C1",
    25: "Db1",
    26: "D1",
    27: "Eb1",
    28: "E1",
    29: "F1",
    30: "Gb1",
    31: "G1",
    32: "Ab1",
    33: "A1",
    34: "Bb1",
    35: "B1",
    36: "C2",
    37: "Db2",
    38: "D2",
    39: "Eb2",
    40: "E2",
    41: "F2",
    42: "Gb2",
    43: "G2",
    44: "Ab2",
    45: "A2",
    46: "Bb2",
    47: "B2",
    48: "C3",
    49: "Db3",
    50: "D3",
    51: "Eb3",
    52: "E3",
    53: "F3",
    54: "Gb3",
    55: "G3",
    56: "Ab3",
    57: "A3",
    58: "Bb3",
    59: "B3",
    60: "C4",
    61: "Db4",
    62: "D4",
    63: "Eb4",
    64: "E4",
    65: "F4",
    66: "Gb4",
    67: "G4",
    68: "Ab4",
    69: "A4",
    70: "Bb4",
    71: "B4",
    72: "C5",
    73: "Db5",
    74: "D5",
    75: "Eb5",
    76: "E5",
    77: "F5",
    78: "Gb5",
    79: "G5",
    80: "Ab5",
    81: "A5",
    82: "Bb5",
    83: "B5",
    84: "C6",
    85: "Db6",
    86: "D6",
    87: "Eb6",
    88: "E6",
    89: "F6",
    90: "Gb6",
    91: "G6",
    92: "Ab6",
    93: "A6",
    94: "Bb6",
    95: "B6",
    96: "C7",
    97: "Db7",
    98: "D7",
    99: "Eb7",
    100: "E7",
    101: "F7",
    102: "Gb7",
    103: "G7",
    104: "Ab7",
    105: "A7",
    106: "Bb7",
    107: "B7",
    108: "C8",
    109: "Db8",
    110: "D8",
    111: "Eb8",
    112: "E8",
    113: "F8",
    114: "Gb8",
    115: "G8",
    116: "Ab8",
    117: "A8",
    118: "Bb8",
    119: "B8",
    120: "C9",
    121: "Db9"
  };
  return vr = _, vr;
}
var gr, Ei;
function ic() {
  if (Ei) return gr;
  Ei = 1;
  var _ = function(g) {
    return window.URL.createObjectURL(m(g.audioBuffers));
  };
  function m(g) {
    var l = g[0], r = l.numberOfChannels, o = l.length * r * 2 + 44, a = new ArrayBuffer(o), s = new DataView(a), p = [], u, d, f = 0, i = 0;
    for (t(1179011410), t(o - 8), t(1163280727), t(544501094), t(16), n(1), n(r), t(l.sampleRate), t(l.sampleRate * 2 * r), n(r * 2), n(16), t(1635017060), t(o - i - 4), u = 0; u < r; u++)
      p.push(l.getChannelData(u));
    for (; i < o; ) {
      for (u = 0; u < p.length; u++)
        d = Math.max(-1, Math.min(1, p[u][f])), d = (0.5 + d < 0 ? d * 32768 : d * 32767) | 0, s.setInt16(i, d, !0), i += 2;
      f++;
    }
    return new Blob([a], { type: "audio/wav" });
    function n(e) {
      s.setUint16(i, e, !0), i += 2;
    }
    function t(e) {
      s.setUint32(i, e, !0), i += 4;
    }
  }
  return gr = _, gr;
}
var br, Ai;
function gs() {
  if (Ai) return br;
  Ai = 1;
  function _(m) {
    return Math.pow(2, m / 1200);
  }
  return br = _, br;
}
var mr, Mi;
function sc() {
  if (Mi) return mr;
  Mi = 1;
  var _ = jr(), m = Vr(), g = gs();
  function l(o, a, s, p, u, d, f, i, n) {
    var t = window.OfflineAudioContext || window.webkitOfflineAudioContext, e = s.len * s.tempoMultiplier;
    d && (e += d / 1e3), e -= i, e < 0 && (e = 5e-3);
    var c = new t(2, Math.floor((e + f) * a), a), v = m[s.pitch];
    if (!_[s.instrument])
      return n && n("placeNote skipped (instrument empty): " + s.instrument + ":" + v), Promise.resolve();
    var h = _[s.instrument][v];
    return h ? h.then(function(y) {
      var w = c.createBufferSource();
      w.buffer = y.audioBuffer;
      var A = s.volume / 96 * u;
      w.gainNode = c.createGain(), s.pan && c.createStereoPanner && (w.panNode = c.createStereoPanner(), w.panNode.pan.setValueAtTime(s.pan, 0)), w.gainNode.gain.value = A, w.gainNode.gain.linearRampToValueAtTime(w.gainNode.gain.value, e), w.gainNode.gain.linearRampToValueAtTime(0, e + f), s.cents && (w.playbackRate.value = g(s.cents)), w.panNode ? (w.panNode.connect(c.destination), w.gainNode.connect(w.panNode)) : w.gainNode.connect(c.destination), w.connect(w.gainNode), w.start(0), w.noteOff ? w.noteOff(e + f) : w.stop(e + f);
      var P;
      return c.oncomplete = function(N) {
        if (N.renderedBuffer && N.renderedBuffer.getChannelData)
          for (var T = 0; T < p.length; T++) {
            var q = p[T] * s.tempoMultiplier;
            d && (q -= d / 1e3), q < 0 && (q = 0), q = Math.floor(q * a), r(o, N.renderedBuffer, q);
          }
        n && n("placeNote: " + s.instrument + ":" + v), P();
      }, c.startRendering(), new Promise(function(N) {
        P = N;
      });
    }).catch(function(y) {
      return n && n("placeNote catch: " + y.message), Promise.reject(y);
    }) : (n && n("placeNote skipped: " + s.instrument + ":" + v), Promise.resolve());
  }
  var r = function(o, a, s) {
    for (var p = 0; p < 2; p++)
      for (var u = a.getChannelData(p), d = o.getChannelData(p), f = 0; f < u.length; f++)
        d[f + s] += u[f];
  };
  return mr = l, mr;
}
var yr, Bi;
function Kr() {
  if (Bi) return yr;
  Bi = 1;
  var _ = ac(), m = nc(), g = We(), l = Re(), r = Ue(), o = Vr(), a = $r(), s = ic(), p = sc(), u = jr(), d = "MIDI is not supported in this browser.", f = "https://paulrosen.github.io/midi-js-soundfonts/abcjs/", i = "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/", n = "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/";
  function t() {
    var e = this;
    e.audioBufferPossible = void 0, e.directSource = [], e.startTimeSec = void 0, e.pausedTimeSec = void 0, e.audioBuffers = [], e.duration = void 0, e.isRunning = !1, e.options = {}, e.pickupLength = 0, e.init = function(h) {
      h || (h = {}), h.options && (e.options = h.options), g(h.audioContext);
      var y = l().currentTime;
      if (e.debugCallback = h.debugCallback, e.debugCallback && e.debugCallback("init called"), e.audioBufferPossible = e._deviceCapable(), !e.audioBufferPossible)
        return Promise.reject({ status: "NotSupported", message: d });
      var w = h.options ? h.options : {};
      e.soundFontUrl = w.soundFontUrl ? w.soundFontUrl : i, e.soundFontUrl[e.soundFontUrl.length - 1] !== "/" && (e.soundFontUrl += "/"), w.soundFontVolumeMultiplier || w.soundFontVolumeMultiplier === 0 ? e.soundFontVolumeMultiplier = w.soundFontVolumeMultiplier : e.soundFontUrl === i || e.soundFontUrl === n ? e.soundFontVolumeMultiplier = 3 : e.soundFontUrl === f ? e.soundFontVolumeMultiplier = 0.4 : e.soundFontVolumeMultiplier = 1, w.programOffsets ? e.programOffsets = w.programOffsets : e.soundFontUrl === f ? e.programOffsets = {
        bright_acoustic_piano: 20,
        honkytonk_piano: 20,
        electric_piano_1: 30,
        electric_piano_2: 30,
        harpsichord: 40,
        clavinet: 20,
        celesta: 20,
        glockenspiel: 40,
        vibraphone: 30,
        marimba: 35,
        xylophone: 30,
        tubular_bells: 35,
        dulcimer: 30,
        drawbar_organ: 20,
        percussive_organ: 25,
        rock_organ: 20,
        church_organ: 40,
        reed_organ: 40,
        accordion: 40,
        harmonica: 40,
        acoustic_guitar_nylon: 20,
        acoustic_guitar_steel: 30,
        electric_guitar_jazz: 25,
        electric_guitar_clean: 15,
        electric_guitar_muted: 35,
        overdriven_guitar: 25,
        distortion_guitar: 20,
        guitar_harmonics: 30,
        electric_bass_finger: 15,
        electric_bass_pick: 30,
        fretless_bass: 40,
        violin: 105,
        viola: 50,
        cello: 40,
        contrabass: 60,
        trumpet: 10,
        trombone: 90,
        alto_sax: 20,
        tenor_sax: 20,
        clarinet: 20,
        flute: 50,
        banjo: 50,
        woodblock: 20
      } : e.programOffsets = {};
      var A = w.fadeLength !== void 0 ? parseInt(w.fadeLength, 10) : NaN;
      if (e.fadeLength = isNaN(A) ? 200 : A, A = w.noteEnd !== void 0 ? parseInt(w.noteEnd, 10) : NaN, e.noteEnd = isNaN(A) ? 0 : A, e.pan = w.pan, e.meterSize = 1, h.visualObj) {
        e.flattened = h.visualObj.setUpAudio(w);
        var P = h.visualObj.getMeterFraction();
        P.den && (e.meterSize = P.num / P.den), e.pickupLength = h.visualObj.getPickupLength();
      } else if (h.sequence)
        e.flattened = h.sequence;
      else
        return Promise.reject(new Error("Must pass in either a visualObj or a sequence"));
      e.millisecondsPerMeasure = h.millisecondsPerMeasure ? h.millisecondsPerMeasure : h.visualObj ? h.visualObj.millisecondsPerMeasure(e.flattened.tempo) : 1e3, e.beatsPerMeasure = h.visualObj ? h.visualObj.getBeatsPerMeasure() : 4, e.sequenceCallback = w.sequenceCallback, e.callbackContext = w.callbackContext, e.onEnded = w.onEnded, e.meterFraction = h.visualObj ? h.visualObj.getMeterFraction() : { den: 1 };
      var N = {}, T = [], q = [], I = a[0];
      e.flattened.tracks.forEach(function(k) {
        k.forEach(function(M) {
          if (M.cmd === "program" && a[M.instrument] && (I = a[M.instrument]), M.pitch !== void 0) {
            var F = M.pitch, L = o[F], b = M.instrument !== void 0 ? a[M.instrument] : I;
            if (L)
              if (N[b] || (N[b] = {}), !u[b] || !u[b][L])
                N[b][L] = !0;
              else {
                var x = b + ":" + L;
                T.indexOf(x) < 0 && T.push(x);
              }
            else {
              var E = b + ":" + L;
              console.log("Can't find note: ", F, E), q.indexOf(E) < 0 && q.push(E);
            }
          }
        });
      }), e.debugCallback && e.debugCallback("note gathering time = " + Math.floor((l().currentTime - y) * 1e3) + "ms"), y = l().currentTime;
      var C = [];
      Object.keys(N).forEach(function(k) {
        Object.keys(N[k]).forEach(function(M) {
          C.push({ instrument: k, note: M });
        });
      }), e.debugCallback && e.debugCallback("notes " + JSON.stringify(C));
      for (var B = [], R = 256, S = 0; S < C.length; S += R)
        B.push(C.slice(S, S + R));
      return new Promise(function(k, M) {
        var F = {
          cached: T,
          error: q,
          loaded: []
        }, L = 0, b = function() {
          e.debugCallback && e.debugCallback("loadBatch idx=" + L + " len=" + B.length), L < B.length ? e._loadBatch(B[L], e.soundFontUrl, y).then(function(x) {
            e.debugCallback && e.debugCallback("loadBatch then"), y = l().currentTime, x && (x.error && (F.error = F.error.concat(x.error)), x.loaded && (F.loaded = F.loaded.concat(x.loaded))), L++, b();
          }, M) : (e.debugCallback && e.debugCallback("resolve init"), k(F));
        };
        b();
      });
    }, e._loadBatch = (function(h, y, w, A) {
      var P = [];
      return h.forEach(function(N) {
        e.debugCallback && e.debugCallback("getNote " + N.instrument + ":" + N.note), P.push(_(y, N.instrument, N.note, l()));
      }), Promise.all(P).then(function(N) {
        e.debugCallback && e.debugCallback("mp3 load time = " + Math.floor((l().currentTime - w) * 1e3) + "ms");
        for (var T = [], q = [], I = [], C = [], B = 0; B < N.length; B++) {
          var R = N[B], S = R.instrument + ":" + R.name;
          R.status === "loaded" ? T.push(S) : R.status === "pending" ? I.push(S) : R.status === "cached" ? q.push(S) : C.push(S + " " + R.message);
        }
        if (I.length > 0) {
          if (e.debugCallback && e.debugCallback("pending " + JSON.stringify(I)), A ? A = A * 2 : A = 50, A < 9e4)
            return new Promise(function(F, L) {
              setTimeout(function() {
                var b = [];
                for (B = 0; B < I.length; B++)
                  S = I[B].split(":"), b.push({ instrument: S[0], note: S[1] });
                e.debugCallback && e.debugCallback("retry " + JSON.stringify(b)), e._loadBatch(b, y, w, A).then(function(x) {
                  F(x);
                }).catch(function(x) {
                  L(x);
                });
              }, A);
            });
          for (var k = [], M = 0; M < h.length; M++)
            k.push(h[M].instrument + "/" + h[M].note);
          return e.debugCallback && e.debugCallback("loadBatch timeout"), Promise.reject(new Error("timeout attempting to load: " + k.join(", ")));
        } else
          return e.debugCallback && e.debugCallback("loadBatch resolve"), Promise.resolve({ loaded: T, cached: q, error: C });
      }).catch(function(N) {
        e.debugCallback && e.debugCallback("loadBatch catch " + N.message);
      });
    }), e.prime = function() {
      var h = e.fadeLength / 1e3;
      return e.isRunning = !1, e.audioBufferPossible ? (e.debugCallback && e.debugCallback("prime called"), new Promise(function(y, w) {
        try {
          let L = function(b) {
            var x = b && b.audioBuffers && b.audioBuffers.length > 0 ? b.audioBuffers[0].duration : 0;
            return { status: l().state, duration: x };
          };
          var A = l().currentTime, P = e.millisecondsPerMeasure / 1e3 / e.meterSize;
          if (e.duration = e.flattened.totalDuration * P, e.duration <= 0)
            return e.audioBuffers = [], y({ status: "empty", seconds: 0 });
          e.duration += h;
          var N = Math.floor(l().sampleRate * e.duration);
          e.stop();
          var T = m(e.flattened);
          if (e.options.swing) {
            var q = e.options.drumIntro ? 0 : e.pickupLength;
            v(T, e.options.swing, e.meterFraction, q);
          }
          e.sequenceCallback && e.sequenceCallback(T, e.callbackContext);
          var I = c(T.length, e.pan), C = {};
          T.forEach(function(b, x) {
            var E = I && I.length > x ? I[x] : 0;
            b.forEach(function(D) {
              var O = D.instrument + ":" + D.pitch + ":" + D.volume + ":" + Math.round((D.end - D.start) * 1e3) / 1e3 + ":" + E + ":" + P + ":" + (D.cents ? D.cents : 0);
              e.debugCallback && e.debugCallback("noteMapTrack " + O), C[O] || (C[O] = []), C[O].push(D.start);
            });
          });
          for (var B = [], R = l().createBuffer(2, N, l().sampleRate), S = 0; S < Object.keys(C).length; S++) {
            var k = Object.keys(C)[S], M = k.split(":"), F = M[6] !== void 0 ? parseFloat(M[6]) : 0;
            M = { instrument: M[0], pitch: parseInt(M[1], 10), volume: parseInt(M[2], 10), len: parseFloat(M[3]), pan: parseFloat(M[4]), tempoMultiplier: parseFloat(M[5]), cents: F }, B.push(p(R, l().sampleRate, M, C[k], e.soundFontVolumeMultiplier, e.programOffsets[M.instrument], h, e.noteEnd / 1e3, e.debugCallback));
          }
          e.audioBuffers = [R], e.debugCallback && (e.debugCallback("sampleRate = " + l().sampleRate), e.debugCallback("totalSamples = " + N), e.debugCallback("creationTime = " + Math.floor((l().currentTime - A) * 1e3) + "ms")), Promise.all(B).then(function() {
            l().state === "suspended" ? l().resume().then(function() {
              y(L(e));
            }) : l().state === "interrupted" ? l().suspend().then(function() {
              l().resume().then(function() {
                y(L(e));
              });
            }) : y(L(e));
          }).catch(function(b) {
            w(b);
          });
        } catch (L) {
          w(L);
        }
      })) : Promise.reject(new Error(d));
    };
    function c(h, y) {
      if (y == null)
        return null;
      var w = [];
      if (y.length) {
        for (var A = 0; A < h; A++)
          if (A < y.length) {
            var P = parseFloat(y[A]);
            P < -1 ? P = -1 : P > 1 && (P = 1), w.push(P);
          } else
            w.push(0);
        return w;
      } else {
        var N = parseFloat(y);
        if (N * (h - 1) > 2)
          return null;
        for (var T = h % 2 === 0, q = T ? 0 - N / 2 : 0, I = q + N, C = 0; C < h; C++)
          T = C % 2 === 0, T ? (w.push(q), q -= N) : (w.push(I), I += N);
        return w;
      }
    }
    e.start = function() {
      if (!e.audioBufferPossible)
        throw new Error(d);
      e.debugCallback && e.debugCallback("start called");
      var h = e.pausedTimeSec ? e.pausedTimeSec : 0;
      e._kickOffSound(h), e.startTimeSec = l().currentTime - h, e.pausedTimeSec = void 0, e.debugCallback && e.debugCallback("MIDI STARTED", e.startTimeSec);
    }, e.pause = function() {
      if (!e.audioBufferPossible)
        throw new Error(d);
      return e.debugCallback && e.debugCallback("pause called"), e.pausedTimeSec = e.stop(), e.pausedTimeSec;
    }, e.resume = function() {
      e.start();
    }, e.seek = function(h, y) {
      var w;
      switch (y) {
        case "seconds":
          w = h;
          break;
        case "beats":
          w = h * e.millisecondsPerMeasure / e.beatsPerMeasure / 1e3;
          break;
        default:
          w = (e.duration - e.fadeLength / 1e3) * h;
          break;
      }
      if (!e.audioBufferPossible)
        throw new Error(d);
      e.debugCallback && e.debugCallback("seek called sec=" + w), e.isRunning ? (e.stop(), e._kickOffSound(w)) : e.pausedTimeSec = w, e.pausedTimeSec = w;
    }, e.stop = function() {
      e.isRunning = !1, e.pausedTimeSec = void 0, e.directSource.forEach(function(y) {
        try {
          y.stop();
        } catch (w) {
          console.log("direct source didn't stop:", w);
        }
      }), e.directSource = [];
      var h = l().currentTime - e.startTimeSec;
      return h;
    }, e.finished = function() {
      e.startTimeSec = void 0, e.pausedTimeSec = void 0, e.isRunning = !1;
    }, e.download = function() {
      return s(e);
    }, e.getAudioBuffer = function() {
      return e.audioBuffers[0];
    }, e.getIsRunning = function() {
      return e.isRunning;
    }, e._deviceCapable = function() {
      return r() ? !0 : (console.warn(d), e.debugCallback && e.debugCallback(d), !1);
    }, e._kickOffSound = function(h) {
      e.isRunning = !0, e.directSource = [], e.audioBuffers.forEach(function(y, w) {
        e.directSource[w] = l().createBufferSource(), e.directSource[w].buffer = y, e.directSource[w].connect(l().destination);
      }), e.directSource.forEach(function(y) {
        y.start(0, h);
      }), e.onEnded && (e.directSource[0].onended = function() {
        e.onEnded(e.callbackContext);
      });
    };
    function v(h, y, w, A) {
      if (!(w.den !== 4 && w.den !== 8) && (y = parseFloat(y), !(isNaN(y) || y <= 50))) {
        y > 75 && (y = 75), y = y / 50 - 1;
        var P = 0, N = 0.25;
        w.den === 8 && (N = N / 2);
        for (var T = N / 2, q = T * y, I = 0; I < h.length; I++)
          for (var C = h[I], B = 0; B < C.length; B++) {
            var R = C[B];
            if (
              // is halfbeat
              (R.start - A) % T === 0 && (R.start - A) % N !== 0 && // the previous note is on the beat or before OR there is no previous note 
              (B === 0 || C[B - 1].start <= C[B].start - T) && // the next note is on the beat or after OR there is no next note
              (B === C.length - 1 || C[B + 1].start >= C[B].start + T)
            ) {
              var S = R.start;
              R.start += q, R.volume *= 1 + P, B > 0 && C[B - 1].end === S && (C[B - 1].end = R.start, C[B - 1].volume *= 1 - P);
            }
          }
      }
    }
  }
  return yr = t, yr;
}
var wr, Ni;
function bs() {
  if (Ni) return wr;
  Ni = 1;
  var _ = function() {
    var m = this;
    m.tracks = [], m.totalDuration = 0, m.currentInstrument = [], m.starts = [], m.addTrack = function() {
      return m.tracks.push([]), m.currentInstrument.push(0), m.starts.push(0), m.tracks.length - 1;
    }, m.setInstrument = function(g, l) {
      m.tracks[g].push({
        channel: 0,
        cmd: "program",
        instrument: l
      }), m.currentInstrument[g] = l;
    }, m.appendNote = function(g, l, r, o, a) {
      var s = {
        cmd: "note",
        duration: r,
        gap: 0,
        instrument: m.currentInstrument[g],
        pitch: l,
        start: m.starts[g],
        volume: o
      };
      a && (s.cents = a), m.tracks[g].push(s), m.starts[g] += r, m.totalDuration = Math.max(m.totalDuration, m.starts[g]);
    };
  };
  return wr = _, wr;
}
var xr, Pi;
function oc() {
  if (Pi) return xr;
  Pi = 1;
  var _ = `
<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" preserveAspectRatio="xMidYMid meet">
	<g transform="translate(0,700) scale(0.1,-0.1)" >
	<path d="M3111 6981 c-20 -37 -90 -55 -364 -96 -120 -18 -190 -33 -244 -55
	-42 -17 -124 -42 -182 -56 -78 -18 -119 -34 -157 -60 -28 -19 -86 -46 -128
	-60 -43 -13 -107 -42 -144 -64 -37 -23 -84 -46 -106 -52 -21 -7 -56 -29 -79
	-50 -22 -22 -61 -50 -86 -63 -26 -13 -67 -40 -91 -60 -24 -20 -65 -47 -90 -60
	-25 -13 -53 -31 -61 -41 -8 -9 -32 -30 -54 -46 -75 -54 -486 -460 -512 -507
	-15 -25 -48 -69 -75 -98 -26 -28 -48 -57 -48 -63 0 -6 -18 -29 -39 -53 -21
	-23 -56 -71 -77 -107 -20 -36 -50 -80 -65 -97 -16 -18 -33 -52 -40 -75 -12
	-47 -47 -115 -84 -166 -13 -18 -30 -56 -38 -83 -8 -27 -34 -80 -56 -118 -33
	-53 -46 -91 -62 -167 -12 -63 -34 -127 -59 -179 -42 -84 -60 -166 -60 -270 0
	-90 26 -122 125 -154 54 -17 96 -19 430 -20 305 -1 381 2 430 14 82 22 140 51
	153 78 6 12 22 47 37 77 14 30 38 77 54 103 15 27 34 73 40 103 7 30 28 78 48
	107 19 28 44 74 55 101 10 28 34 67 53 87 18 20 49 61 68 90 19 30 44 63 57
	74 13 11 36 40 52 65 59 94 232 270 306 313 20 11 57 37 82 58 25 20 70 52
	100 72 30 19 66 47 79 61 13 14 49 35 80 46 30 12 80 37 111 56 31 19 95 45
	143 58 48 12 110 37 139 55 63 40 127 55 323 76 83 9 208 28 279 41 156 29
	165 29 330 4 453 -71 514 -84 606 -130 31 -16 83 -36 116 -45 32 -9 84 -34
	115 -56 31 -21 82 -48 113 -60 32 -11 72 -33 89 -48 18 -16 59 -45 92 -65 33
	-21 74 -51 90 -66 17 -15 49 -40 73 -54 52 -32 65 -61 50 -113 -8 -31 -61 -90
	-277 -308 -300 -303 -361 -382 -369 -481 -2 -29 0 -66 6 -81 13 -40 88 -138
	115 -151 12 -6 54 -26 92 -44 l70 -33 945 -2 c520 -1 975 2 1012 7 64 8 191
	50 231 76 11 7 33 34 50 60 22 34 42 51 65 58 l32 9 0 1101 0 1102 -32 9 c-21
	7 -44 26 -64 55 -60 84 -77 97 -140 110 -44 9 -76 10 -127 2 -59 -9 -77 -17
	-134 -62 -37 -28 -172 -155 -301 -281 -129 -127 -249 -237 -267 -245 -25 -10
	-41 -11 -71 -2 -58 15 -112 45 -124 69 -6 11 -35 35 -64 54 -28 18 -58 41 -66
	50 -8 9 -41 35 -75 58 -33 22 -77 56 -99 75 -21 18 -64 46 -95 61 -31 14 -73
	39 -93 55 -20 15 -70 40 -110 55 -40 15 -97 44 -127 64 -29 21 -78 44 -107 53
	-30 8 -77 31 -105 51 -42 28 -73 39 -173 60 -68 14 -154 39 -196 58 -95 43
	-131 51 -343 76 -209 24 -242 32 -279 70 l-30 29 -328 0 c-312 0 -330 -1 -339
	-19z"></path>
	<path d="M254 2875 c-89 -16 -107 -26 -145 -78 -32 -44 -62 -66 -91 -67 -17 0
	-18 -61 -18 -1140 l0 -1140 24 0 c16 0 41 -17 72 -50 40 -42 61 -55 117 -72
	l69 -21 82 23 c44 12 96 30 114 39 18 9 148 132 290 272 141 141 267 261 279
	268 51 26 86 14 176 -61 32 -26 62 -48 66 -48 5 0 36 -25 70 -55 34 -30 74
	-61 89 -69 15 -8 37 -28 50 -45 12 -17 50 -45 84 -62 34 -17 78 -44 98 -60 19
	-16 61 -37 93 -48 32 -11 81 -37 107 -56 27 -20 76 -45 109 -56 33 -12 75 -31
	93 -44 62 -45 93 -58 191 -82 54 -12 130 -37 168 -54 68 -29 180 -58 226 -59
	62 0 183 -64 183 -96 0 -12 88 -14 639 -14 l639 0 12 30 c18 44 76 66 233 89
	89 14 160 30 200 47 34 15 106 42 159 60 54 18 112 44 130 57 47 35 85 52 146
	67 29 7 76 28 105 48 29 20 77 48 107 63 30 15 66 39 80 54 14 15 50 40 81 56
	31 15 78 46 104 69 26 22 61 46 79 54 17 7 43 26 56 42 14 16 41 41 60 56 64
	48 380 362 408 405 15 23 40 51 55 63 15 12 36 38 46 58 11 21 37 57 58 82 22
	25 49 62 62 83 13 20 38 56 57 78 19 23 50 74 69 113 19 39 46 86 59 104 14
	18 34 62 46 98 12 36 32 77 45 92 31 38 60 97 80 167 9 33 26 76 37 95 29 50
	47 103 68 206 10 52 32 117 51 155 29 56 33 74 34 140 0 94 -10 108 -101 138
	-61 20 -83 21 -463 21 -226 0 -421 -4 -451 -10 -63 -12 -86 -30 -110 -85 -10
	-22 -33 -63 -52 -92 -21 -31 -42 -80 -53 -123 -11 -44 -32 -93 -56 -128 -20
	-32 -47 -83 -59 -115 -12 -32 -37 -77 -56 -100 -19 -23 -50 -65 -69 -94 -19
	-29 -44 -57 -54 -63 -11 -5 -29 -27 -42 -47 -52 -85 -234 -277 -300 -315 -25
	-15 -53 -38 -62 -51 -9 -14 -42 -39 -74 -57 -32 -18 -75 -48 -95 -66 -21 -18
	-59 -44 -85 -58 -26 -13 -72 -40 -100 -59 -35 -24 -78 -41 -128 -52 -47 -11
	-99 -31 -139 -56 -69 -42 -94 -49 -391 -110 -245 -51 -425 -66 -595 -50 -168
	16 -230 27 -330 61 -47 16 -123 35 -170 44 -98 17 -123 25 -172 58 -20 14 -71
	37 -114 53 -44 15 -95 40 -115 56 -20 16 -70 42 -110 59 -40 16 -88 45 -108
	63 -20 19 -55 46 -78 61 -24 14 -49 35 -55 47 -7 11 -34 33 -60 49 -50 31 -65
	61 -53 102 4 13 130 147 281 298 236 238 277 283 299 335 15 32 35 71 46 86
	12 18 19 44 19 76 0 42 -8 63 -53 138 -92 151 11 139 -1207 141 -798 2 -1030
	0 -1086 -11z"></path>
	</g>
</svg>
`;
  return xr = _, xr;
}
var Cr, Li;
function cc() {
  if (Li) return Cr;
  Li = 1;
  var _ = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" class="abcjs-play-svg">
    <g>
    <polygon points="4 0 23 12.5 4 25"/>
    </g>
</svg>
`;
  return Cr = _, Cr;
}
var kr, qi;
function lc() {
  if (qi) return kr;
  qi = 1;
  var _ = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" class="abcjs-pause-svg">
  <g>
    <rect width="8.23" height="25"/>
    <rect width="8.23" height="25" x="17"/>
  </g>
</svg>
`;
  return kr = _, kr;
}
var _r, Di;
function fc() {
  if (Di) return _r;
  Di = 1;
  var _ = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="abcjs-loading-svg">
    <circle cx="50" cy="50" fill="none" stroke-width="20" r="35" stroke-dasharray="160 55"></circle>
</svg>
`;
  return _r = _, _r;
}
var Tr, Ri;
function hc() {
  if (Ri) return Tr;
  Ri = 1;
  var _ = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
  <g>
    <polygon points="5 12.5 24 0 24 25"/>
    <rect width="3" height="25" x="0" y="0"/>
  </g>
</svg>
`;
  return Tr = _, Tr;
}
var Sr, Ii;
function ms() {
  if (Ii) return Sr;
  Ii = 1;
  var _ = Ue(), m = We(), g = Re(), l = oc(), r = cc(), o = lc(), a = fc(), s = hc();
  function p(n, t) {
    var e = this;
    if (typeof n == "string") {
      var c = n;
      if (n = document.querySelector(c), !n)
        throw new Error('Cannot find element "' + c + '" in the DOM.');
    } else if (!(n instanceof HTMLElement))
      throw new Error("The first parameter must be a valid element or selector in the DOM.");
    if (e.parent = n, e.options = {}, t && (e.options = Object.assign({}, t)), e.options.ac && m(e.options.ac), u(e.parent, e.options), i(e), e.disable = function(h) {
      var y = e.parent.querySelector(".abcjs-inline-audio");
      h ? y.classList.add("abcjs-disabled") : y.classList.remove("abcjs-disabled");
    }, e.setWarp = function(h, y) {
      var w = e.parent.querySelector(".abcjs-midi-tempo");
      w.value = Math.round(y), e.setTempo(h);
    }, e.setTempo = function(h) {
      var y = e.parent.querySelector(".abcjs-midi-current-tempo");
      y && (y.innerHTML = Math.round(h));
    }, e.resetAll = function() {
      for (var h = e.parent.querySelectorAll(".abcjs-pushed"), y = 0; y < h.length; y++) {
        var w = h[y];
        w.classList.remove("abcjs-pushed");
      }
    }, e.pushPlay = function(h) {
      var y = e.parent.querySelector(".abcjs-midi-start");
      y && (h ? y.classList.add("abcjs-pushed") : y.classList.remove("abcjs-pushed"));
    }, e.pushLoop = function(h) {
      var y = e.parent.querySelector(".abcjs-midi-loop");
      y && (h ? y.classList.add("abcjs-pushed") : y.classList.remove("abcjs-pushed"));
    }, e.setProgress = function(h, y) {
      var w = e.parent.querySelector(".abcjs-midi-progress-background"), A = e.parent.querySelector(".abcjs-midi-progress-indicator");
      if (!(!w || !A)) {
        var P = w.clientWidth, N = P * h;
        A.style.left = N + "px";
        var T = e.parent.querySelector(".abcjs-midi-clock");
        if (T) {
          var q = y * h / 1e3, I = Math.floor(q / 60), C = Math.floor(q % 60), B = C < 10 ? "0" + C : C;
          T.innerHTML = I + ":" + B;
        }
      }
    }, e.options.afterResume) {
      var v = !1;
      e.options.ac ? v = e.options.ac.state !== "suspended" : g() && (v = g().state !== "suspended"), v && e.options.afterResume();
    }
  }
  function u(n, t) {
    var e = !!t.loopHandler, c = !!t.restartHandler, v = !!t.playHandler || !!t.playPromiseHandler, h = !!t.progressHandler, y = !!t.warpHandler, w = t.hasClock !== !1, A = `<div class="abcjs-inline-audio">
`;
    if (e) {
      var P = t.repeatTitle ? t.repeatTitle : "Click to toggle play once/repeat.", N = t.repeatAria ? t.repeatAria : P;
      A += '<button type="button" class="abcjs-midi-loop abcjs-btn" title="' + P + '" aria-label="' + N + '">' + l + `</button>
`;
    }
    if (c) {
      var T = t.restartTitle ? t.restartTitle : "Click to go to beginning.", q = t.restartAria ? t.restartAria : T;
      A += '<button type="button" class="abcjs-midi-reset abcjs-btn" title="' + T + '" aria-label="' + q + '">' + s + `</button>
`;
    }
    if (v) {
      var I = t.playTitle ? t.playTitle : "Click to play/pause.", C = t.playAria ? t.playAria : I;
      A += '<button type="button" class="abcjs-midi-start abcjs-btn" title="' + I + '" aria-label="' + C + '">' + r + o + a + `</button>
`;
    }
    if (h) {
      var B = t.randomTitle ? t.randomTitle : "Click to change the playback position.", R = t.randomAria ? t.randomAria : B;
      A += '<button type="button" class="abcjs-midi-progress-background" title="' + B + '" aria-label="' + R + `"><span class="abcjs-midi-progress-indicator"></span></button>
`;
    }
    if (w && (A += `<span class="abcjs-midi-clock"></span>
`), y) {
      var S = t.warpTitle ? t.warpTitle : "Change the playback speed.", k = t.warpAria ? t.warpAria : S, M = t.bpm ? t.bpm : "BPM";
      A += '<span class="abcjs-tempo-wrapper"><label><input class="abcjs-midi-tempo" type="number" min="1" max="300" value="100" title="' + S + '" aria-label="' + k + '">%</label><span>&nbsp;(<span class="abcjs-midi-current-tempo"></span> ' + M + `)</span></span>
`;
    }
    A += '<div class="abcjs-css-warning" style="font-size: 12px;color:red;border: 1px solid red;text-align: center;width: 300px;margin-top: 4px;font-weight: bold;border-radius: 4px;">CSS required: load abcjs-audio.css</div>', A += `</div>
`, n.innerHTML = A;
  }
  function d(n, t, e, c, v) {
    var h = !0;
    if (g() ? h = g().state === "suspended" : m(), !_())
      throw { status: "NotSupported", message: "This browser does not support audio." };
    (h || v) && e && e.classList.add("abcjs-loading"), h ? g().resume().then(function() {
      c ? c().then(function(y) {
        f(n, t, e, v);
      }) : f(n, t, e, v);
    }) : f(n, t, e, v);
  }
  function f(n, t, e, c) {
    c ? n(t).then(function() {
      e && e.classList.remove("abcjs-loading");
    }) : (n(t), e && e.classList.remove("abcjs-loading"));
  }
  function i(n) {
    var t = !!n.options.loopHandler, e = !!n.options.restartHandler, c = !!n.options.playHandler || !!n.options.playPromiseHandler, v = !!n.options.progressHandler, h = !!n.options.warpHandler, y = n.parent.querySelector(".abcjs-midi-start");
    t && n.parent.querySelector(".abcjs-midi-loop").addEventListener("click", function(w) {
      d(n.options.loopHandler, w, y, n.options.afterResume);
    }), e && n.parent.querySelector(".abcjs-midi-reset").addEventListener("click", function(w) {
      d(n.options.restartHandler, w, y, n.options.afterResume);
    }), c && y.addEventListener("click", function(w) {
      d(
        n.options.playPromiseHandler || n.options.playHandler,
        w,
        y,
        n.options.afterResume,
        !!n.options.playPromiseHandler
      );
    }), v && n.parent.querySelector(".abcjs-midi-progress-background").addEventListener("click", function(w) {
      d(n.options.progressHandler, w, y, n.options.afterResume);
    }), h && n.parent.querySelector(".abcjs-midi-tempo").addEventListener("change", function(w) {
      d(n.options.warpHandler, w, y, n.options.afterResume);
    });
  }
  return Sr = p, Sr;
}
var Er, Fi;
function uc() {
  if (Fi) return Er;
  Fi = 1;
  var _ = bs(), m = Kr(), g = Re();
  function l(o, a, s, p, u) {
    for (var d = new _(), f = 0; f < o.length; f++) {
      var i = o[f], n = d.addTrack();
      if (d.setInstrument(n, i.instrument), f === 0 && a)
        for (var t = 0; t < a.length; t++) {
          var e = a[t];
          d.appendNote(n, e.pitch, 1 / 64, e.volume, e.cents);
        }
      d.appendNote(n, i.pitch, i.duration, i.volume, i.cents);
    }
    var c = g();
    return c.state === "suspended" ? c.resume().then(function() {
      return r(d, s, p, u);
    }) : r(d, s, p, u);
  }
  function r(o, a, s, p) {
    var u = new m();
    return u.init({
      sequence: o,
      millisecondsPerMeasure: a,
      options: { soundFontUrl: s },
      debugCallback: p
    }).then(function() {
      return u.prime();
    }).then(function() {
      return u.start(), Promise.resolve();
    });
  }
  return Er = l, Er;
}
var Ar, Oi;
function ys() {
  if (Oi) return Ar;
  Oi = 1;
  var _ = ms(), m = Kr(), g = Rr(), l = Re();
  function r() {
    var o = this;
    o.warp = 100, o.cursorControl = null, o.visualObj = null, o.timer = null, o.midiBuffer = null, o.options = null, o.currentTempo = null, o.control = null, o.isLooping = !1, o.isStarted = !1, o.isLoaded = !1, o.isLoading = !1, o.load = function(s, p, u) {
      u || (u = {}), u.displayPlay === void 0 && (u.displayPlay = !0), u.displayProgress === void 0 && (u.displayProgress = !0), o.control = new _(s, {
        loopHandler: u.displayLoop ? o.toggleLoop : void 0,
        restartHandler: u.displayRestart ? o.restart : void 0,
        playPromiseHandler: u.displayPlay ? o.play : void 0,
        progressHandler: u.displayProgress ? o.randomAccess : void 0,
        warpHandler: u.displayWarp ? o.onWarp : void 0,
        afterResume: o.init
      }), o.cursorControl = p, o.disable(!0);
    }, o.disable = function(s) {
      o.control && o.control.disable(s);
    }, o.setTune = function(s, p, u) {
      return o.visualObj = s, o.disable(!1), o.options = u || {}, o.control && (o.pause(), o.setProgress(0, 1), o.control.resetAll(), o.restart(), o.isStarted = !1), o.isLooping = !1, p ? o.go() : Promise.resolve({ status: "no-audio-context" });
    }, o.go = function() {
      o.isLoading = !0;
      var s = o.visualObj.millisecondsPerMeasure() * 100 / o.warp;
      o.currentTempo = Math.round(o.visualObj.getBeatsPerMeasure() / s * 6e4), o.control && o.control.setTempo(o.currentTempo), o.percent = 0;
      var p;
      return o.midiBuffer || (o.midiBuffer = new m()), l().resume().then(function(u) {
        return o.midiBuffer.init({
          visualObj: o.visualObj,
          options: o.options,
          millisecondsPerMeasure: s
        });
      }).then(function(u) {
        return p = u, o.midiBuffer.prime();
      }).then(function() {
        var u = 16;
        return o.cursorControl && o.cursorControl.beatSubdivisions !== void 0 && parseInt(o.cursorControl.beatSubdivisions, 10) >= 1 && parseInt(o.cursorControl.beatSubdivisions, 10) <= 64 && (u = parseInt(o.cursorControl.beatSubdivisions, 10)), o.timer = new g(o.visualObj, {
          beatCallback: o.beatCallback,
          eventCallback: o.eventCallback,
          lineEndCallback: o.lineEndCallback,
          qpm: o.currentTempo,
          extraMeasuresAtBeginning: o.cursorControl ? o.cursorControl.extraMeasuresAtBeginning : void 0,
          lineEndAnticipation: o.cursorControl ? o.cursorControl.lineEndAnticipation : 0,
          beatSubdivisions: u
        }), o.cursorControl && o.cursorControl.onReady && typeof o.cursorControl.onReady == "function" && o.cursorControl.onReady(o), o.isLoaded = !0, o.isLoading = !1, Promise.resolve({ status: "created", notesStatus: p });
      });
    }, o.destroy = function() {
      o.timer && (o.timer.reset(), o.timer.stop(), o.timer = null), o.midiBuffer && (o.midiBuffer.stop(), o.midiBuffer = null), o.setProgress(0, 1), o.control && o.control.resetAll();
    }, o.play = function() {
      return o.runWhenReady(o._play, void 0);
    };
    function a(s) {
      return new Promise(function(p) {
        setTimeout(p, s);
      });
    }
    o.runWhenReady = function(s, p) {
      return o.visualObj ? o.isLoading ? a(500).then(function() {
        return o.isLoading ? o.runWhenReady(s, p) : s(p);
      }) : o.isLoaded ? s(p) : o.go().then(function() {
        return s(p);
      }) : Promise.resolve({ status: "loading" });
    }, o._play = function() {
      return l().resume().then(function() {
        return o.isStarted = !o.isStarted, o.isStarted ? (o.cursorControl && o.cursorControl.onStart && typeof o.cursorControl.onStart == "function" && o.cursorControl.onStart(), o.midiBuffer.start(), o.timer.start(o.percent), o.control && o.control.pushPlay(!0)) : o.pause(), Promise.resolve({ status: "ok" });
      });
    }, o.pause = function() {
      o.timer && (o.timer.pause(), o.midiBuffer.pause(), o.control && o.control.pushPlay(!1));
    }, o.toggleLoop = function() {
      o.isLooping = !o.isLooping, o.control && o.control.pushLoop(o.isLooping);
    }, o.restart = function() {
      o.timer && (o.timer.setProgress(0), o.midiBuffer.seek(0));
    }, o.randomAccess = function(s) {
      return o.runWhenReady(o._randomAccess, s);
    }, o._randomAccess = function(s) {
      var p = s.target.classList.contains("abcjs-midi-progress-indicator") ? s.target.parentNode : s.target, u = (s.x - p.getBoundingClientRect().left) / p.offsetWidth;
      return u < 0 && (u = 0), u > 1 && (u = 1), o.seek(u), Promise.resolve({ status: "ok" });
    }, o.seek = function(s, p) {
      o.timer && o.midiBuffer && (o.timer.setProgress(s, p), o.midiBuffer.seek(s, p));
    }, o.setWarp = function(s) {
      if (parseInt(s, 10) > 0) {
        o.warp = parseInt(s, 10);
        var p = o.isStarted, u = o.percent;
        return o.destroy(), o.isStarted = !1, o.go().then(function() {
          return o.setProgress(u, o.midiBuffer.duration * 1e3), o.control && o.control.setWarp(o.currentTempo, o.warp), p ? o.play().then(function() {
            return o.seek(u), Promise.resolve();
          }) : (o.seek(u), Promise.resolve());
        });
      }
      return Promise.resolve();
    }, o.onWarp = function(s) {
      var p = s.target.value;
      return o.setWarp(p);
    }, o.setProgress = function(s, p) {
      o.percent = s, o.control && o.control.setProgress(s, p);
    }, o.finished = function() {
      if (o.timer.reset(), o.isLooping)
        return o.timer.start(0), o.midiBuffer.finished(), o.midiBuffer.start(), "continue";
      o.timer.stop(), o.isStarted && (o.control && o.control.pushPlay(!1), o.isStarted = !1, o.midiBuffer.finished(), o.cursorControl && o.cursorControl.onFinished && typeof o.cursorControl.onFinished == "function" && o.cursorControl.onFinished(), o.setProgress(0, 1));
    }, o.beatCallback = function(s, p, u, d) {
      var f = s / p;
      o.setProgress(f, u), o.cursorControl && o.cursorControl.onBeat && typeof o.cursorControl.onBeat == "function" && o.cursorControl.onBeat(s, p, u, d);
    }, o.eventCallback = function(s) {
      if (s)
        o.cursorControl && o.cursorControl.onEvent && typeof o.cursorControl.onEvent == "function" && o.cursorControl.onEvent(s);
      else
        return o.finished();
    }, o.lineEndCallback = function(s, p) {
      o.cursorControl && o.cursorControl.onLineEnd && typeof o.cursorControl.onLineEnd == "function" && o.cursorControl.onLineEnd(s, p);
    }, o.getUrl = function() {
      return o.midiBuffer.download();
    }, o.download = function(s) {
      var p = o.getUrl(), u = document.createElement("a");
      document.body.appendChild(u), u.setAttribute("style", "display: none;"), u.href = p, u.download = s || "output.wav", u.click(), window.URL.revokeObjectURL(p), document.body.removeChild(u);
    };
  }
  return Ar = r, Ar;
}
var Mr, Hi;
function ws() {
  if (Hi) return Mr;
  Hi = 1;
  var _ = gs(), m;
  return (function() {
    function g(i, n) {
      for (var t in n)
        n.hasOwnProperty(t) && i.setAttribute(t, n[t]);
      return i;
    }
    function l() {
      this.trackstrings = "", this.trackcount = 0, this.noteOnAndChannel = "%90", this.noteOffAndChannel = "%80";
    }
    l.prototype.setTempo = function(i) {
      this.trackcount === 0 && (this.startTrack(), this.track += "%00%FF%51%03" + u(Math.round(6e7 / i), 6), this.endTrack());
    }, l.prototype.setGlobalInfo = function(i, n, t, e) {
      if (this.trackcount === 0) {
        this.startTrack();
        var c = Math.round(6e7 / i);
        this.track += "%00%FF%51%03" + u(c, 6), t && (this.track += a(t)), e && (this.track += s(e)), n && (this.track += o(n, "%01")), this.endTrack();
      }
    }, l.prototype.startTrack = function() {
      this.noteWarped = {}, this.track = "", this.trackName = "", this.trackInstrument = "", this.silencelength = 0, this.trackcount++, this.instrument && this.setInstrument(this.instrument);
    }, l.prototype.endTrack = function() {
      this.track = this.trackName + this.trackInstrument + this.track;
      var i = u(this.track.length / 3 + 4, 8);
      this.track = "MTrk" + i + // track header
      this.track + "%00%FF%2F%00", this.trackstrings += this.track;
    }, l.prototype.setText = function(i, n) {
      i === "name" && (this.trackName = o(n, "%03"));
    }, l.prototype.setInstrument = function(i) {
      this.trackInstrument = "%00%C0" + u(i, 2), this.instrument = i;
    }, l.prototype.setChannel = function(i, n) {
      this.channel = i;
      var t = "%00%B" + this.channel.toString(16);
      this.track += t + "%79%00", this.track += t + "%40%00", this.track += t + "%5B%30", n || (n = 0), n = Math.round((n + 1) * 64), this.track += t + "%0A" + u(n, 2), this.track += t + "%07%64", this.noteOnAndChannel = "%9" + this.channel.toString(16), this.noteOffAndChannel = "%8" + this.channel.toString(16);
    };
    var r = 4096;
    l.prototype.startNote = function(i, n, t) {
      if (this.track += f(this.silencelength), this.silencelength = 0, t) {
        this.track += "%e" + this.channel.toString(16);
        var e = Math.round(_(t) * r);
        this.track += d(8192 + e), this.track += f(0), this.noteWarped[i] = !0;
      }
      this.track += this.noteOnAndChannel, this.track += "%" + i.toString(16) + u(n, 2);
    }, l.prototype.endNote = function(i) {
      this.track += f(this.silencelength), this.silencelength = 0, this.noteWarped[i] && (this.track += "%e" + this.channel.toString(16), this.track += d(8192), this.track += f(0), this.noteWarped[i] = !1), this.track += this.noteOffAndChannel, this.track += "%" + i.toString(16) + "%00";
    }, l.prototype.addRest = function(i) {
      this.silencelength += i, this.silencelength < 0 && (this.silencelength = 0);
    }, l.prototype.getData = function() {
      return "data:audio/midi,MThd%00%00%00%06%00%01" + u(this.trackcount, 4) + "%01%e0" + // header
      this.trackstrings;
    }, l.prototype.embed = function(i, n) {
      var t = this.getData(), e = g(document.createElement("a"), {
        href: t
      });
      if (e.innerHTML = "download midi", i.insertBefore(e, i.firstChild), !n) {
        var c = g(document.createElement("embed"), {
          src: t,
          type: "video/quicktime",
          controller: "true",
          autoplay: "false",
          loop: "false",
          enablejavascript: "true",
          style: "display:block; height: 20px;"
        });
        i.insertBefore(c, i.firstChild);
      }
    };
    function o(i, n) {
      for (var t = "", e = 0; e < i.length; e++)
        t += u(i.charCodeAt(e), 2);
      return "%00%FF" + n + u(t.length / 3, 2) + t;
    }
    function a(i) {
      if (!i || !i.accidentals)
        return "";
      for (var n = "%00%FF%59%02", t = 0, e = 256, c = 0; c < i.accidentals.length; c++)
        i.accidentals[c].acc === "sharp" ? t++ : i.accidentals[c].acc === "flat" && e--;
      var v = u(e !== 256 ? e : t, 2), h = i.mode === "m" ? "%01" : "%00";
      return n + v + h;
    }
    function s(i) {
      var n = "%00%FF%58%04" + u(i.num, 2), t = { 1: 0, 2: 1, 4: 2, 8: 3, 16: 4, 32: 5 }, e = t[i.den];
      if (!e)
        return "";
      n += u(e, 2);
      var c;
      switch (i.num + "/" + i.den) {
        case "2/4":
        case "3/4":
        case "4/4":
        case "5/4":
          c = 24;
          break;
        case "6/4":
          c = 72;
          break;
        case "2/2":
        case "3/2":
        case "4/2":
          c = 48;
          break;
        case "3/8":
        case "6/8":
        case "9/8":
        case "12/8":
          c = 36;
          break;
      }
      return c ? (n += u(c, 2), n + "%08") : "";
    }
    function p(i) {
      for (var n = "", t = 0; t < i.length; t += 2)
        n += "%", n += i.substr(t, 2);
      return n;
    }
    function u(i, n) {
      var t = i.toString(16);
      for (t = t.split(".")[0]; t.length < n; )
        t = "0" + t;
      return t.length > n && (t = t.substring(0, n)), p(t);
    }
    function d(i) {
      i = Math.round(i);
      var n = i % 128, t = i - n;
      return u(t * 2 + n, 4);
    }
    function f(i) {
      var n = 0, t = [];
      for (i = Math.round(i); i !== 0; )
        t.push(i & 127), i = i >> 7;
      for (var e = t.length - 1; e >= 0; e--) {
        n = n << 8;
        var c = t[e];
        e !== 0 && (c = c | 128), n = n | c;
      }
      var v = n.toString(16).length;
      return v += v % 2, u(n, v);
    }
    m = function() {
      return new l();
    };
  })(), Mr = m, Mr;
}
var Br, zi;
function dc() {
  if (zi) return Br;
  zi = 1;
  var _ = ws(), m;
  return (function() {
    var g = 1920;
    m = function(o, a) {
      a === void 0 && (a = {});
      var s = o.setUpAudio(a), p = _(), u = o.metaText ? o.metaText.title : void 0;
      u && u.length > 128 && (u = u.substring(0, 124) + "...");
      var d = o.getKeySignature(), f = o.getMeterFraction(), i = s.tempo, n = i / 60;
      if (f.den === 8 && f.num !== 5 && f.num !== 7) {
        var t = o.millisecondsPerMeasure();
        i = 6e4 / (t / f.num) / 2, n = i / 60;
      }
      p.setGlobalInfo(i, u, d, f);
      for (var e = 0; e < s.tracks.length; e++) {
        p.startTrack();
        for (var c = {}, v = 0; v < s.tracks[e].length; v++) {
          var h = s.tracks[e][v];
          switch (h.cmd) {
            case "text":
              p.setText(h.type, h.text);
              break;
            case "program":
              var y = 0;
              a.pan && a.pan.length > e && (y = a.pan[e]), h.instrument === 128 ? (p.setChannel(9, y), p.setInstrument(0)) : (p.setChannel(h.channel, y), p.setInstrument(h.instrument));
              break;
            case "note":
              var w = h.gap * n, A = h.start, P = A + h.duration - w;
              c[A] || (c[A] = []), c[A].push({ pitch: h.pitch, volume: h.volume, cents: h.cents }), c[P] || (c[P] = []), c[P].push({ pitch: h.pitch, volume: 0 });
              break;
            default:
              console.log("MIDI create Unknown: " + h.cmd);
          }
        }
        l(p, c, g), p.endTrack();
      }
      return p.getData();
    };
    function l(r, o, a) {
      for (var s = Object.keys(o), p = 0; p < s.length; p++)
        s[p] = parseFloat(s[p]);
      s.sort(function(e, c) {
        return e - c;
      });
      for (var u = 0, d = 0; d < s.length; d++) {
        var f = o[s[d]];
        if (s[d] > u) {
          var i = (s[d] - u) * a;
          r.addRest(i), u = s[d];
        }
        for (var n = 0; n < f.length; n++) {
          var t = f[n];
          t.volume ? r.startNote(t.pitch, t.volume, t.cents) : r.endNote(t.pitch);
        }
      }
    }
  })(), Br = m, Br;
}
var Nr, Gi;
function pc() {
  if (Gi) return Nr;
  Gi = 1;
  var _ = Ye(), m = dc(), g = function(o, a) {
    var s = {};
    if (a)
      for (var p in a)
        a.hasOwnProperty(p) && (s[p] = a[p]);
    s.generateInline = !1;
    function u(d, f, i) {
      var n = m(f, s);
      switch (s.midiOutputType) {
        case "encoded":
          return n;
        case "binary":
          var t = n.replace("data:audio/midi,", "");
          t = t.replace(/MThd/g, "%4d%54%68%64"), t = t.replace(/MTrk/g, "%4d%54%72%6b");
          for (var e = new ArrayBuffer(t.length / 3), c = new Uint8Array(e), v = 0; v < t.length / 3; v++) {
            var h = v * 3 + 1, y = parseInt(t.substring(h, h + 2), 16);
            c[v] = y;
          }
          return c;
        default:
          return r(f, s, n, i);
      }
    }
    return typeof o == "string" ? _.renderEngine(u, "*", o, s) : u(null, o, 0);
  };
  function l(o) {
    var a = {};
    return o && a.toString.call(o) === "[object Function]";
  }
  var r = function(o, a, s, p) {
    var u = ["abcjs-download-midi", "abcjs-midi-" + p];
    a.downloadClass && u.push(a.downloadClass);
    var d = '<div class="' + u.join(" ") + '">';
    a.preTextDownload && (d += a.preTextDownload);
    var f = o.metaText && o.metaText.title ? o.metaText.title : "Untitled", i;
    a.downloadLabel && l(a.downloadLabel) ? i = a.downloadLabel(o, p) : a.downloadLabel ? i = a.downloadLabel.replace(/%T/, f) : i = 'Download MIDI for "' + f + '"', f = f.toLowerCase().replace(/'/g, "").replace(/\W/g, "_").replace(/__/g, "_");
    var n = a.fileName ? a.fileName : f + ".midi";
    return d += '<a download="' + n + '" href="' + s + '">' + i + "</a>", a.postTextDownload && (d += a.postTextDownload), d + "</div>";
  };
  return Nr = g, Nr;
}
var Pr, Yi;
function xs() {
  if (Yi) return Pr;
  Yi = 1;
  try {
    if (typeof window.CustomEvent != "function") {
      var _ = function(g, l) {
        l = l || { bubbles: !1, cancelable: !1, detail: void 0 };
        var r = document.createEvent("CustomEvent");
        return r.initCustomEvent(g, l.bubbles, l.cancelable, l.detail), r;
      };
      _.prototype = window.Event.prototype, window.CustomEvent = _;
    }
  } catch {
  }
  var m = function(g) {
    this.isEditArea = !0, typeof g == "string" ? (this.textarea = document.getElementById(g), this.textarea || (this.textarea = document.querySelector(g))) : this.textarea = g, this.initialText = this.textarea.value, this.isDragging = !1;
  };
  return m.prototype.addSelectionListener = function(g) {
    this.textarea.onmousemove = function(l) {
      this.isDragging && g.fireSelectionChanged();
    };
  }, m.prototype.addChangeListener = function(g) {
    this.changelistener = g, this.textarea.onkeyup = function() {
      g.fireChanged();
    }, this.textarea.onmousedown = function() {
      this.isDragging = !0, g.fireSelectionChanged();
    }, this.textarea.onmouseup = function() {
      this.isDragging = !1, g.fireChanged();
    }, this.textarea.onchange = function() {
      g.fireChanged();
    };
  }, m.prototype.getSelection = function() {
    return { start: this.textarea.selectionStart, end: this.textarea.selectionEnd };
  }, m.prototype.setSelection = function(g, l) {
    if (this.textarea.setSelectionRange)
      this.textarea.setSelectionRange(g, l);
    else if (this.textarea.createTextRange) {
      var r = this.textarea.createTextRange();
      r.collapse(!0), r.moveEnd("character", l), r.moveStart("character", g), r.select();
    }
    this.textarea.focus();
  }, m.prototype.getString = function() {
    return this.textarea.value;
  }, m.prototype.setString = function(g) {
    this.textarea.value = g, this.initialText = this.getString(), this.changelistener && this.changelistener.fireChanged();
  }, m.prototype.getElem = function() {
    return this.textarea;
  }, Pr = m, Pr;
}
var Lr, Wi;
function vc() {
  if (Wi) return Lr;
  Wi = 1;
  var _ = _e(), m = ys(), g = Ue(), l = vs(), r = xs();
  function o(s) {
    var p = {}, u;
    if (s.abcjsParams)
      for (u in s.abcjsParams)
        s.abcjsParams.hasOwnProperty(u) && (p[u] = s.abcjsParams[u]);
    if (s.midi_options)
      for (u in s.midi_options)
        s.midi_options.hasOwnProperty(u) && (p[u] = s.midi_options[u]);
    if (s.parser_options)
      for (u in s.parser_options)
        s.parser_options.hasOwnProperty(u) && (p[u] = s.parser_options[u]);
    if (s.render_options)
      for (u in s.render_options)
        s.render_options.hasOwnProperty(u) && (p[u] = s.render_options[u]);
    return p.tablature && s.warnings_id && (p.tablature.warnings_id = s.warnings_id), p;
  }
  var a = function(s, p) {
    this.abcjsParams = o(p), p.indicate_changed && (this.indicate_changed = !0), typeof s == "string" ? this.editarea = new r(s) : s.isEditArea ? this.editarea = s : this.editarea = new r(s), this.editarea.addSelectionListener(this), this.editarea.addChangeListener(this), p.canvas_id ? this.div = p.canvas_id : p.paper_id ? this.div = p.paper_id : (this.div = document.createElement("DIV"), this.editarea.getElem().parentNode.insertBefore(this.div, this.editarea.getElem())), typeof this.div == "string" && (this.div = document.getElementById(this.div)), p.selectionChangeCallback && (this.selectionChangeCallback = p.selectionChangeCallback), this.clientClickListener = this.abcjsParams.clickListener, this.abcjsParams.clickListener = this.highlight.bind(this), p.synth && g() && (this.synth = {
      el: p.synth.el,
      cursorControl: p.synth.cursorControl,
      options: p.synth.options
    }), p.generate_midi && (this.generate_midi = p.generate_midi, this.abcjsParams.generateDownload && (typeof p.midi_download_id == "string" ? this.downloadMidi = document.getElementById(p.midi_download_id) : p.midi_download_id && (this.downloadMidi = p.midi_download_id)), this.abcjsParams.generateInline !== !1 && (typeof p.midi_id == "string" ? this.inlineMidi = document.getElementById(p.midi_id) : p.midi_id && (this.inlineMidi = p.midi_id))), p.warnings_id ? typeof p.warnings_id == "string" ? this.warningsdiv = document.getElementById(p.warnings_id) : this.warningsdiv = p.warnings_id : p.generate_warnings && (this.warningsdiv = document.createElement("div"), this.div.parentNode.insertBefore(this.warningsdiv, this.div)), this.onchangeCallback = p.onchange, this.redrawCallback = p.redrawCallback, this.currentAbc = "", this.tunes = [], this.bReentry = !1, this.parseABC(), this.modelChanged(), this.addClassName = function(u, d) {
      var f = function(i, n) {
        var t = i.className;
        return t.length > 0 && (t === n || new RegExp("(^|\\s)" + n + "(\\s|$)").test(t));
      };
      return f(u, d) || (u.className += (u.className ? " " : "") + d), u;
    }, this.removeClassName = function(u, d) {
      return u.className = _.strip(u.className.replace(
        new RegExp("(^|\\s+)" + d + "(\\s+|$)"),
        " "
      )), u;
    }, this.setReadOnly = function(u) {
      var d = "abc_textarea_readonly", f = this.editarea.getElem();
      u ? (f.setAttribute("readonly", "yes"), this.addClassName(f, d)) : (f.removeAttribute("readonly"), this.removeClassName(f, d));
    };
  };
  return a.prototype.redrawMidi = function() {
    if (this.generate_midi && !this.midiPause) {
      var s = new window.CustomEvent("generateMidi", {
        detail: {
          tunes: this.tunes,
          abcjsParams: this.abcjsParams,
          downloadMidiEl: this.downloadMidi,
          inlineMidiEl: this.inlineMidi,
          engravingEl: this.div
        }
      });
      window.dispatchEvent(s);
    }
    if (this.synth) {
      var p = this.synth.synthControl;
      this.synth.synthControl || (this.synth.synthControl = new m(), this.synth.synthControl.load(this.synth.el, this.synth.cursorControl, this.synth.options)), this.synth.synthControl.setTune(this.tunes[0], p, this.synth.options);
    }
  }, a.prototype.modelChanged = function() {
    if (!this.bReentry) {
      this.bReentry = !0;
      try {
        this.timerId = null, this.redrawCallback && this.redrawCallback(!0), this.synth && this.synth.synthControl && this.synth.synthControl.disable(!0), this.tunes = l(this.div, this.currentAbc, this.abcjsParams), this.tunes.length > 0 && (this.warnings = this.tunes[0].warnings), this.redrawMidi(), this.redrawCallback && this.redrawCallback(!1);
      } catch (s) {
        console.error("ABCJS error: ", s), this.warnings || (this.warnings = []), this.warnings.push(s.message);
      }
      this.warningsdiv && (this.warningsdiv.innerHTML = this.warnings ? this.warnings.join("<br />") : "No errors"), this.updateSelection(), this.bReentry = !1;
    }
  }, a.prototype.paramChanged = function(s) {
    if (s)
      for (var p in s)
        s.hasOwnProperty(p) && (this.abcjsParams[p] = s[p]);
    this.currentAbc = "", this.fireChanged();
  }, a.prototype.getTunes = function() {
    return this.tunes;
  }, a.prototype.synthParamChanged = function(s) {
    if (this.synth) {
      if (this.synth.options = {}, s)
        for (var p in s)
          s.hasOwnProperty(p) && (this.synth.options[p] = s[p]);
      this.currentAbc = "", this.fireChanged();
    }
  }, a.prototype.parseABC = function() {
    var s = this.editarea.getString();
    return s === this.currentAbc ? (this.updateSelection(), !1) : (this.currentAbc = s, !0);
  }, a.prototype.updateSelection = function() {
    var s = this.editarea.getSelection();
    try {
      this.tunes.length > 0 && this.tunes[0].engraver && this.tunes[0].engraver.rangeHighlight(s.start, s.end);
    } catch {
    }
    this.selectionChangeCallback && this.selectionChangeCallback(s.start, s.end);
  }, a.prototype.fireSelectionChanged = function() {
    this.updateSelection();
  }, a.prototype.setDirtyStyle = function(s) {
    if (this.indicate_changed !== void 0) {
      var p = function(i, n) {
        var t = function(e, c) {
          var v = e.className;
          return v.length > 0 && (v === c || new RegExp("(^|\\s)" + c + "(\\s|$)").test(v));
        };
        return t(i, n) || (i.className += (i.className ? " " : "") + n), i;
      }, u = function(i, n) {
        return i.className = _.strip(i.className.replace(
          new RegExp("(^|\\s+)" + n + "(\\s+|$)"),
          " "
        )), i;
      }, d = "abc_textarea_dirty", f = this.editarea.getElem();
      s ? p(f, d) : u(f, d);
    }
  }, a.prototype.fireChanged = function() {
    if (!this.bIsPaused && this.parseABC()) {
      var s = this;
      this.timerId && clearTimeout(this.timerId), this.timerId = setTimeout(function() {
        s.modelChanged();
      }, 300);
      var p = this.isDirty();
      this.wasDirty !== p && (this.wasDirty = p, this.setDirtyStyle(p)), this.onchangeCallback && this.onchangeCallback(this);
    }
  }, a.prototype.setNotDirty = function() {
    this.editarea.initialText = this.editarea.getString(), this.wasDirty = !1, this.setDirtyStyle(!1);
  }, a.prototype.isDirty = function() {
    return this.indicate_changed === void 0 ? !1 : this.editarea.initialText !== this.editarea.getString();
  }, a.prototype.highlight = function(s, p, u, d, f, i) {
    this.editarea.setSelection(s.startChar, s.endChar), this.selectionChangeCallback && this.selectionChangeCallback(s.startChar, s.endChar), this.clientClickListener && this.clientClickListener(s, p, u, d, f, i);
  }, a.prototype.pause = function(s) {
    this.bIsPaused = s, s || this.fireChanged();
  }, a.prototype.millisecondsPerMeasure = function() {
    return !this.synth || !this.synth.synthControl || !this.synth.synthControl.visualObj ? 0 : this.synth.synthControl.visualObj.millisecondsPerMeasure();
  }, a.prototype.pauseMidi = function(s) {
    this.midiPause = s, s || this.redrawMidi();
  }, Lr = a, Lr;
}
var qr, Ui;
function gc() {
  if (Ui) return qr;
  Ui = 1;
  var _ = Ms(), m = Bs(), g = Ye(), l = Zi(), r = Vs(), o = {};
  o.signature = "abcjs-basic v" + _, Object.keys(m).forEach(function(y) {
    o[y] = m[y];
  }), Object.keys(g).forEach(function(y) {
    o[y] = g[y];
  }), o.renderAbc = vs(), o.tuneMetrics = rc(), o.TimingCallbacks = Rr();
  var a = Ne();
  o.setGlyph = a.setSymbol, o.strTranspose = r;
  var s = Kr(), p = $r(), u = Vr(), d = bs(), f = ms(), i = We(), n = Re(), t = Ue(), e = uc(), c = ys(), v = pc(), h = ws();
  return o.synth = {
    CreateSynth: s,
    instrumentIndexToName: p,
    pitchToNoteName: u,
    SynthController: c,
    SynthSequence: d,
    CreateSynthControl: f,
    registerAudioContext: i,
    activeAudioContext: n,
    supportsAudio: t,
    playEvent: e,
    getMidiFile: v,
    sequence: l,
    midiRenderer: h
  }, o.Editor = vc(), o.EditArea = xs(), o.test = {
    Parse: Or(),
    EngraverController: Xr()
  }, qr = o, qr;
}
var bc = gc();
const mc = /* @__PURE__ */ As(bc);
async function yc(_) {
  const m = new Uint8Array(new ArrayBuffer(_.length));
  m.set(_);
  const g = new Blob([m]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(g).arrayBuffer());
}
const Xi = new TextEncoder();
function ji(_) {
  if (/^[\x20-\x7e]*$/.test(_)) return `(${_.replace(/[\\()]/g, (g) => `\\${g}`)})`;
  let m = "FEFF";
  for (let g = 0; g < _.length; g++) m += _.charCodeAt(g).toString(16).padStart(4, "0").toUpperCase();
  return `<${m}>`;
}
const Ge = (_) => (Math.round(_ * 100) / 100).toString();
function wc(_, m = {}) {
  const g = [];
  let l = 0;
  const r = [], o = (e) => {
    const c = typeof e == "string" ? Xi.encode(e) : e;
    g.push(c), l += c.length;
  }, a = (e, c, v) => {
    r[e] = l, v ? (o(`${e} 0 obj
${c}
stream
`), o(v), o(`
endstream
endobj
`)) : o(`${e} 0 obj
${c}
endobj
`);
  }, s = 4, p = (e) => s + e * 3;
  o(`%PDF-1.4
`), o(new Uint8Array([37, 226, 227, 207, 211, 10])), a(1, "<< /Type /Catalog /Pages 2 0 R >>"), a(2, `<< /Type /Pages /Kids [${_.map((e, c) => `${p(c)} 0 R`).join(" ")}] /Count ${_.length} >>`);
  const u = [m.title ? `/Title ${ji(m.title)}` : "", `/Producer ${ji(m.producer ?? "Plenio")}`].filter(Boolean);
  a(3, `<< ${u.join(" ")} >>`), _.forEach((e, c) => {
    const v = p(c), h = Xi.encode(`q
${Ge(e.width)} 0 0 ${Ge(e.height)} 0 0 cm
/Im0 Do
Q
`);
    a(
      v,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${Ge(e.width)} ${Ge(e.height)}] /Resources << /XObject << /Im0 ${v + 2} 0 R >> >> /Contents ${v + 1} 0 R >>`
    ), a(v + 1, `<< /Length ${h.length} >>`, h);
    const { width: y, height: w, deflated: A } = e.image;
    a(
      v + 2,
      `<< /Type /XObject /Subtype /Image /Width ${y} /Height ${w} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${A.length} >>`,
      A
    );
  });
  const d = s + _.length * 3, f = l;
  let i = `xref
0 ${d}
0000000000 65535 f 
`;
  for (let e = 1; e < d; e++) i += `${String(r[e]).padStart(10, "0")} 00000 n 
`;
  o(i), o(`trailer
<< /Size ${d} /Root 1 0 R /Info 3 0 R >>
startxref
${f}
%%EOF
`);
  const n = new Uint8Array(l);
  let t = 0;
  for (const e of g)
    n.set(e, t), t += e.length;
  return n;
}
const Qr = { a4: [210, 297], letter: [215.9, 279.4] }, He = 15, Oe = 96 / 25.4, Dr = 300, xc = 18;
function Cs(_, m) {
  const g = m.replace(/[\r\n%]+/g, " ").replace(/\s+/g, " ").trim();
  return /^T:.*$/m.test(_) ? _.replace(/^T:.*$/m, `T:${g}`) : _.replace(/^(X:.*)$/m, `$1
T:${g}`);
}
function Xe(_) {
  const [m, g] = Qr[_];
  return { width: (m - 2 * He) * Oe, height: (g - 2 * He) * Oe - xc };
}
function Jr(_, m) {
  const g = [];
  let l = [], r = 0;
  for (const o of _)
    l.length && r + o.height > m && (g.push(l), l = [], r = 0), l.push(o), r += o.height;
  return l.length && g.push(l), g;
}
function Cc(_, m) {
  return `${Array.from((_ ?? "").trim(), (l) => /[\p{L}\p{N} \-_()]/u.test(l) ? l : "_").join("").slice(0, 80).trim() || "score"}.${m}`;
}
function kc(_, m, g) {
  const l = Xe(g), r = document.createElement("div");
  r.style.cssText = `position:fixed;left:-30000px;top:0;width:${Math.ceil(l.width)}px;visibility:hidden;background:#fff;color:#000`, document.body.appendChild(r);
  try {
    mc.renderAbc(r, Cs(_, m), {
      oneSvgPerLine: !0,
      staffwidth: Math.floor(l.width) - 8,
      scale: 1,
      foregroundColor: "#000000",
      paddingleft: 0,
      paddingright: 0,
      paddingtop: 4,
      paddingbottom: 6,
      wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 }
    });
  } catch (a) {
    throw r.remove(), a;
  }
  return { lines: [...r.querySelectorAll("svg")].map((a) => {
    const s = a.getBoundingClientRect(), p = Number.parseFloat(a.getAttribute("width") ?? "") || s.width, u = Number.parseFloat(a.getAttribute("height") ?? "") || s.height;
    return { svg: a, width: p, height: u };
  }), dispose: () => r.remove() };
}
const ks = "http://www.w3.org/2000/svg";
function Zr(_) {
  const m = _.svg.cloneNode(!0);
  return m.setAttribute("xmlns", ks), m.setAttribute("width", String(_.width)), m.setAttribute("height", String(_.height)), new XMLSerializer().serializeToString(m);
}
function _c(_, m = 24) {
  const g = Math.ceil(Math.max(0, ..._.map((a) => a.width)) + 2 * m), l = Math.ceil(_.reduce((a, s) => a + s.height, 0) + 2 * m);
  let r = m;
  const o = _.map((a) => {
    const s = Zr(a).replace(/^<svg\b/, `<svg x="${m}" y="${r.toFixed(2)}"`);
    return r += a.height, s;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="${ks}" width="${g}" height="${l}" viewBox="0 0 ${g} ${l}"><rect width="100%" height="100%" fill="#ffffff"/>${o.join("")}</svg>
`;
}
async function _s(_) {
  const m = URL.createObjectURL(new Blob([Zr(_)], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const g = new Image();
    return g.src = m, await g.decode(), g;
  } finally {
    URL.revokeObjectURL(m);
  }
}
function Ts(_, m) {
  const g = document.createElement("canvas");
  g.width = _, g.height = m;
  const l = g.getContext("2d");
  if (!l) throw new Error("This browser cannot draw pictures (no canvas).");
  return l.fillStyle = "#ffffff", l.fillRect(0, 0, _, m), { canvas: g, ctx: l };
}
async function Tc(_, m = 2, g = 24) {
  const l = Math.max(0, ..._.map((d) => d.width)) + 2 * g, r = _.reduce((d, f) => d + f.height, 0) + 2 * g, o = Math.max(0.5, Math.min(m, 32e3 / r, 32e3 / l)), { canvas: a, ctx: s } = Ts(Math.ceil(l * o), Math.ceil(r * o));
  s.scale(o, o);
  let p = g;
  for (const d of _)
    s.drawImage(await _s(d), g, p, d.width, d.height), p += d.height;
  const u = await new Promise((d) => a.toBlob(d, "image/png"));
  if (!u) throw new Error("The picture could not be made.");
  return new Uint8Array(await u.arrayBuffer());
}
async function Sc(_, m, g) {
  const [l, r] = Qr[m], o = Xe(m), a = Jr(_, o.height), s = Dr / 96, p = Math.round(l / 25.4 * Dr), u = Math.round(r / 25.4 * Dr), d = He * Oe, f = [];
  for (const [i, n] of a.entries()) {
    const { ctx: t } = Ts(p, u);
    t.scale(s, s);
    let e = d;
    for (const h of n)
      t.drawImage(await _s(h), d, e, h.width, h.height), e += h.height;
    a.length > 1 && (t.fillStyle = "#555555", t.font = "11px serif", t.textAlign = "center", t.fillText(`${i + 1} / ${a.length}`, l * Oe / 2, r * Oe - d / 2));
    const c = t.getImageData(0, 0, p, u).data, v = new Uint8Array(p * u);
    for (let h = 0, y = 0; y < v.length; h += 4, y++) v[y] = Math.round(0.299 * c[h] + 0.587 * c[h + 1] + 0.114 * c[h + 2]);
    f.push({ width: l / 25.4 * 72, height: r / 25.4 * 72, image: { width: p, height: u, deflated: await yc(v) } });
  }
  return wc(f, { title: g.trim() || "Score", producer: "Plenio Music Production System" });
}
function Ec(_, m, g) {
  const l = Xe(m), r = Jr(_, l.height), o = document.createElement("iframe");
  o.setAttribute("aria-hidden", "true"), o.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden", document.body.appendChild(o);
  const a = o.contentDocument, s = o.contentWindow;
  if (!a || !s)
    throw o.remove(), new Error("The browser did not allow printing from the editor.");
  const p = m === "a4" ? "A4" : "letter", u = (i) => i.replace(/[&<>"]/g, (n) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[n]), d = r.map(
    (i, n) => `<section class="page">${i.map(Zr).join("")}${r.length > 1 ? `<footer>${n + 1} / ${r.length}</footer>` : ""}</section>`
  ).join("");
  a.open(), a.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${u(g.trim() || "Score")}</title><style>@page{size:${p} portrait;margin:${He}mm}html,body{margin:0;background:#fff}.page{break-after:page;position:relative;height:${(Qr[m][1] - 2 * He).toFixed(1)}mm}.page:last-child{break-after:auto}svg{display:block}footer{position:absolute;bottom:0;left:0;right:0;text-align:center;font:9pt serif;color:#555}</style></head><body>${d}</body></html>`
  ), a.close();
  const f = () => setTimeout(() => o.remove(), 1e3);
  s.addEventListener("afterprint", f, { once: !0 }), setTimeout(() => o.isConnected && o.remove(), 6e4), s.focus(), s.print();
}
const Ac = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  exportName: Cc,
  notationPdf: Sc,
  notationPng: Tc,
  paginate: Jr,
  printNotation: Ec,
  renderLines: kc,
  stackedSvg: _c,
  textBlock: Xe,
  withTitle: Cs
}, Symbol.toStringTag, { value: "Module" }));
export {
  mc as a,
  Tc as b,
  Ac as c,
  Cc as e,
  Sc as n,
  Ec as p,
  kc as r,
  _c as s
};
