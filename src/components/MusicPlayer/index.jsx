import React, { useEffect, useRef } from 'react';
import './MusicPlayer.css';

function initPlayer(container) {
  const svgcontainer = container.querySelector('.svgcontainer');
  const audioFileInput = container.querySelector('.audiofile');
  const audioPlayer = container.querySelector('.player');
  audioPlayer.loop = true;
  const progressBar = container.querySelector('.processbar');
  const processEl = container.querySelector('.process');
  const startTimeEl = container.querySelector('.start');
  const endTimeEl = container.querySelector('.end');
  const playBtn = container.querySelector('.play');
  const pauseBtn = container.querySelector('.pause');
  const audioName = container.querySelector('.name');
  const rightContent = container.querySelector('.rightcontent');
  const volSlider = container.querySelector('.vol-slider');
  const muteBtn = container.querySelector('.mute-btn');

  const LINE_HEIGHT = 20;
  const LYRICS_OFFSET = container.clientHeight / 3.5;

  let lastLyric = -1;
  let bgImg = new Image();
  bgImg.src = '/music-player/default.svg';

  container.classList.add('no-files');

  let playing = false;
  let isDragging = false;
  let lyricsElement = container.querySelector('.lyrics');
  let imageLoaded = false;
  let audioLoaded = false;
  let lrcLoaded = false;
  let animationId = null;
  let lyrics = [];
  let volume = 1.0;
  let muted = false;

  audioPlayer.volume = volume;
  volSlider.value = 100;

  // ── File selection ────────────────────────────────────────────────────────────

  svgcontainer.addEventListener('click', () => audioFileInput.click());

  audioPlayer.addEventListener('loadedmetadata', () => {
    endTimeEl.textContent = `-${formatTime(audioPlayer.duration)}`;
    if (audioLoaded) playBtn.click();
    else alert('请选择音频文件');
  });

  audioFileInput.addEventListener('change', async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    requestAnimationFrame(() => container.classList.remove('no-files'));

    for (const file of files) {
      const fileURL = URL.createObjectURL(file);

      if (file.type.startsWith('image/')) {
        bgImg.src = fileURL;
        imageLoaded = true;
      } else if (file.type.startsWith('audio/')) {
        audioPlayer.src = fileURL;
        audioLoaded = true;
        let filename = file.name.replace(/\.[^/.]+$/, '');
        audioName.textContent = filename.length > 30 ? filename.substring(0, 30) + '…' : filename;

        window.jsmediatags.read(file, {
          onSuccess(tag) {
            const tags = tag.tags;
            if (tags.picture && !imageLoaded) {
              const { data, format } = tags.picture;
              let b64 = '';
              for (let i = 0; i < data.length; i++) b64 += String.fromCharCode(data[i]);
              bgImg.src = `data:${format};base64,${window.btoa(b64)}`;
              imageLoaded = true;
            }
            if (tags.lyrics?.lyrics) processLrcText(tags.lyrics.lyrics);
          },
          onError(err) { console.log(err.type, err.info); },
        });
      } else if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.lrc')) {
        const reader = new FileReader();
        reader.onload = (e) => processLrcText(decodeBuffer(e.target.result));
        reader.readAsArrayBuffer(file);
      }
    }
  });

  // ── Lyrics ────────────────────────────────────────────────────────────────────

  function processLrcText(text) {
    enableLyric();
    const parsed = parseLrc(text);
    lyrics = parsed.lyrics;
    lyricsElement = container.querySelector('.lyrics');
    lyricsElement.innerHTML = '';
    for (const l of lyrics) lyricsElement.appendChild(l.ele);
    requestAnimationFrame(() => {
      UpdateLyricsLayout(0, lyrics, 0);
      for (const l of lyrics) l.ele.style.transition = 'all 0.7s cubic-bezier(.19,.11,0,1)';
    });
    lrcLoaded = true;
  }

  function disableLyric() { rightContent.style.display = 'none'; }
  function enableLyric() { rightContent.style.display = ''; }

  audioPlayer.addEventListener('timeupdate', () => {
    if (!audioPlayer.duration) return;
    processEl.style.width = `${(audioPlayer.currentTime / audioPlayer.duration) * 100}%`;
    startTimeEl.textContent = formatTime(audioPlayer.currentTime);
    endTimeEl.textContent = `-${formatTime(audioPlayer.duration - audioPlayer.currentTime)}`;

    const cTime = audioPlayer.currentTime;
    let lList = [];
    for (const l of lyrics) { if (cTime >= l.time) lList.push(l); }
    if (!lList.length) return;
    if (lastLyric !== lList.length - 1) {
      UpdateLyricsLayout(lList.length - 1, lyrics, 1);
      lastLyric = lList.length - 1;
    }
  });

  // ── Controls ──────────────────────────────────────────────────────────────────

  progressBar.addEventListener('mousedown', (e) => {
    if (Number.isNaN(audioPlayer.duration)) return;
    isDragging = true;
    updateProgress(e);
  });

  const onMouseMove = (e) => { if (isDragging) updateProgress(e); };
  const onMouseUp = () => { isDragging = false; };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  playBtn.addEventListener('click', () => {
    if (Number.isNaN(audioPlayer.duration)) return;
    audioPlayer.play().then(() => {
      playing = true;
      pauseBtn.style.display = 'block';
      playBtn.style.display = 'none';
    }).catch(() => {
      // Autoplay policy blocked play — user can click manually, do nothing
    });
  });

  pauseBtn.addEventListener('click', () => {
    playing = false;
    audioPlayer.pause();
    pauseBtn.style.display = 'none';
    playBtn.style.display = 'block';
  });

  // ── Volume ────────────────────────────────────────────────────────────────────

  volSlider.addEventListener('input', () => {
    volume = volSlider.value / 100;
    muted = volume === 0;
    audioPlayer.volume = volume;
    muteBtn.dataset.muted = muted ? '1' : '0';
  });

  muteBtn.addEventListener('click', () => {
    muted = !muted;
    audioPlayer.volume = muted ? 0 : volume;
    volSlider.value = muted ? 0 : volume * 100;
    muteBtn.dataset.muted = muted ? '1' : '0';
  });

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function updateProgress(e) {
    const rect = progressBar.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    processEl.style.width = `${pct}%`;
    audioPlayer.currentTime = (pct / 100) * audioPlayer.duration;
    if (!playing) playBtn.click();
  }

  function formatTime(t) {
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function decodeBuffer(buffer) {
    for (const enc of ['utf-8', 'gbk', 'big5', 'shift_jis']) {
      try { return new TextDecoder(enc, { fatal: true }).decode(new Uint8Array(buffer)); }
      catch (e) { continue; }
    }
    return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(buffer));
  }

  function parseLrc(text) {
    const lrcArray = [];
    text.trim().split('\n').forEach(line => {
      const m = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/);
      if (!m) return;
      const t = parseInt(m[1]) * 60 + parseInt(m[2]) + (m[3] ? parseInt(m[3]) / 1000 : 0);
      const txt = line.replace(m[0], '').trim();
      if (!txt) return;
      const div = document.createElement('div');
      div.className = 'item';
      const p = document.createElement('p');
      p.textContent = txt;
      div.appendChild(p);
      lrcArray.push({ time: t, text: txt, ele: div });
    });
    return { lyrics: lrcArray };
  }

  function GetLyricsLayout(now, to, data) {
    let res = 0;
    if (to > now) {
      for (let i = now; i < to; i++) res += data[i].ele.offsetHeight + LINE_HEIGHT;
    } else {
      for (let i = now; i > to; i--) res -= data[i - 1].ele.offsetHeight + LINE_HEIGHT;
    }
    return res + LYRICS_OFFSET;
  }

  function UpdateLyricsLayout(index, data, init = 1) {
    for (let i = 0; i < data.length; i++) {
      data[i].ele.style.color = i === index && init ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.2)';
      data[i].ele.style.filter = `blur(${Math.abs(i - index)}px)`;
      const pos = GetLyricsLayout(index, i, data);
      const n = Math.min((i - index) + 1, 10);
      setTimeout(() => { data[i].ele.style.transform = `translateY(${pos}px)`; }, (n * 70 - n * 10) * init);
    }
  }

  // ── Background canvas ─────────────────────────────────────────────────────────

  const fluidCanvas = container.querySelector('canvas.canvas');
  const fCtx = fluidCanvas.getContext('2d');
  let slices = [];

  const resizeCanvas = () => {
    fluidCanvas.width = container.clientWidth;
    fluidCanvas.height = container.clientHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function getDominantColors(imageData) {
    const pixels = imageData.data;
    const { width, height } = imageData;
    const hw = Math.floor(width / 2), hh = Math.floor(height / 2);
    const regions = [
      { x1: 0, y1: 0, x2: hw, y2: hh }, { x1: hw, y1: 0, x2: width, y2: hh },
      { x1: 0, y1: hh, x2: hw, y2: height }, { x1: hw, y1: hh, x2: width, y2: height },
    ];
    const colors = [];
    regions.forEach(r => {
      let R = 0, G = 0, B = 0, n = 0;
      for (let y = r.y1; y < r.y2; y += 5)
        for (let x = r.x1; x < r.x2; x += 5) {
          const i = (y * width + x) * 4;
          R += pixels[i]; G += pixels[i+1]; B += pixels[i+2]; n++;
        }
      if (n) colors.push([Math.round(R/n), Math.round(G/n), Math.round(B/n)]);
    });
    return colors.map(([r,g,b]) => `rgba(${r},${g},${b},0.8)`);
  }

  class Slice {
    constructor(img, index) {
      this.img = img; this.index = index;
      this.angle = Math.random() * Math.PI * 2;
      this.velocity = (Math.random() - 0.5) * 0.005;
    }
    update() { this.angle += this.velocity; }
    draw() {
      const { width, height } = fluidCanvas;
      const cx = (this.index % 2 === 0) ? width * 0.25 : width * 0.75;
      const cy = (this.index < 2) ? height * 0.25 : height * 0.75;
      fCtx.save();
      fCtx.translate(cx, cy);
      fCtx.rotate(this.angle);
      fCtx.scale(1.2, 1.2);
      const sw = this.img.width / 2, sh = this.img.height / 2;
      const sx = (this.index % 2) * sw, sy = Math.floor(this.index / 2) * sh;
      const ds = Math.max(width, height) * 0.6;
      fCtx.globalAlpha = 0.7;
      fCtx.drawImage(this.img, sx, sy, sw, sh, -ds/2, -ds/2, ds, ds);
      fCtx.restore();
    }
  }

  bgImg.onload = () => {
    svgcontainer.style.background = `url(${bgImg.src})`;
    svgcontainer.style.backgroundSize = 'cover';
    svgcontainer.style.backgroundPosition = 'center';

    const tmp = document.createElement('canvas');
    const tc = tmp.getContext('2d');
    tmp.width = 100; tmp.height = 100 * (bgImg.height / bgImg.width);
    tc.drawImage(bgImg, 0, 0, tmp.width, tmp.height);
    const colors = getDominantColors(tc.getImageData(0, 0, tmp.width, tmp.height));
    colors.forEach((c, i) => container.style.setProperty(`--color${i+1}`, c));

    resizeCanvas();
    slices = [0, 1, 2, 3].map(i => new Slice(bgImg, i));
    if (animationId) cancelAnimationFrame(animationId);
    (function animate() {
      fCtx.clearRect(0, 0, fluidCanvas.width, fluidCanvas.height);
      fCtx.globalCompositeOperation = 'screen';
      slices.forEach(s => { s.update(); s.draw(); });
      animationId = requestAnimationFrame(animate);
    })();
  };

  return () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('resize', resizeCanvas);
    if (animationId) cancelAnimationFrame(animationId);
    if (audioPlayer.src) audioPlayer.pause();
  };
}

export default function MusicPlayer() {
  const containerRef = useRef(null);

  useEffect(() => {
    let cleanup = null;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js';
    script.onload = () => {
      if (containerRef.current) cleanup = initPlayer(containerRef.current);
    };
    document.head.appendChild(script);
    return () => {
      if (cleanup) cleanup();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div ref={containerRef} className="music-player-container">
      <div className="leftcontent">
        <div className="svgcontainer" title="点击选择音频文件" />
        <div className="time">
          <p className="start">0:00</p>
          <p className="name">点击封面选择音频和 lrc 文件</p>
          <p className="end">-0:00</p>
        </div>
        <div className="processbar">
          <div className="process"></div>
        </div>
        <div className="conbox">
          <div className="controls">
            <div className="play">
              <svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg" style={{filter:'brightness(1.2)'}}>
                <path d="M10.345 23.287c.415 0 .763-.15 1.22-.407l12.742-7.404c.838-.481 1.178-.855 1.178-1.46 0-.599-.34-.972-1.178-1.462L11.565 5.158c-.457-.265-.805-.407-1.22-.407-.789 0-1.345.606-1.345 1.57V21.71c0 .971.556 1.577 1.345 1.577z" fillRule="nonzero" fill="#c1c1c1"/>
              </svg>
            </div>
            <div className="pause">
              <svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg" style={{filter:'brightness(1.2)'}}>
                <path d="M13.293 22.772c.955 0 1.436-.481 1.436-1.436V6.677c0-.98-.481-1.427-1.436-1.427h-2.457c-.954 0-1.436.473-1.436 1.427v14.66c-.008.954.473 1.435 1.436 1.435h2.457zm7.87 0c.954 0 1.427-.481 1.427-1.436V6.677c0-.98-.473-1.427-1.428-1.427h-2.465c-.955 0-1.428.473-1.428 1.427v14.66c0 .954.473 1.435 1.428 1.435h2.465z" fillRule="nonzero" fill="#c1c1c1"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="vol-row">
          <button className="mute-btn" data-muted="0" title="静音">
            <svg className="icon-vol" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            <svg className="icon-mute" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
          </button>
          <input type="range" className="vol-slider" min="0" max="100" step="1" />
        </div>
      </div>
      <div className="rightcontent">
        <div className="lyricscontainer">
          <div className="lyrics"></div>
        </div>
      </div>
      <canvas className="canvas"></canvas>
      <input type="file" accept="audio/* text/* image/* .lrc" className="audiofile" multiple />
      <audio className="player"></audio>
    </div>
  );
}
