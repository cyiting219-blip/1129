let spritesheet;
let frames = [];

let frameWidth;
let frameHeight;
let numFrames = 8; // 先預設為8，會在 setup 裡以 spritesheet 寬度計算

let currentFrame = 0;
// 第二個角色的 spritesheet
let spritesheet2;
let frames2 = [];
let frameWidth2;
let frameHeight2;
let numFrames2 = 7; // all2.png 有 7 張圖
let currentFrame2 = 0;
// 音樂與振幅分析
let song;
let amp;
let isPlaying = false;
let playButton;

function preload() {
  // 正確的 spritesheet 路徑（工作區內的位置）
  // 在你的專案中，all.png 位於 "動畫圖片/20251125/1/run/all.png"
  spritesheet = loadImage('動畫圖片/20251125/1/run/all.png',
    () => {},
    (err) => { console.error('Failed to load spritesheet:', err); }
  );
  // 載入第二個精靈檔 all2.png
  spritesheet2 = loadImage('動畫圖片/20251125/2/all2.png',
    () => {},
    (err) => { console.error('Failed to load spritesheet2:', err); }
  );
  // 載入背景音樂：請把檔案命名為 `背景音樂.mp3` 放在專案根目錄，或修改路徑
  song = loadSound('背景音樂.mp3',
    () => { console.log('背景音樂載入完成'); },
    (err) => { console.warn('背景音樂載入失敗，請確認檔案路徑與名稱:', err); }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 若圖片載入失敗，停止並顯示錯誤訊息
  if (!spritesheet || !spritesheet.width) {
    background(220);
    fill(0);
    textSize(14);
    text('Spritesheet 載入失敗，請確認路徑是否正確', 10, 30);
    noLoop();
    return;
  }

  // 以 spritesheet 的實際寬度計算每格寬度
  frameHeight = spritesheet.height;
  frameWidth = spritesheet.width / numFrames;

  // 從精靈圖檔中擷取每一格畫面
  for (let i = 0; i < numFrames; i++) {
    let x = i * frameWidth;
    let frame = spritesheet.get(x, 0, frameWidth, frameHeight);
    frames.push(frame);
  }

  // 處理第二個精靈檔（如果載入成功）
  if (spritesheet2 && spritesheet2.width) {
    frameHeight2 = spritesheet2.height;
    frameWidth2 = spritesheet2.width / numFrames2;
    for (let i = 0; i < numFrames2; i++) {
      let x2 = i * frameWidth2;
      let f = spritesheet2.get(x2, 0, frameWidth2, frameHeight2);
      frames2.push(f);
    }
  } else {
    console.warn('spritesheet2 未正確載入，第二個角色將不會顯示');
  }

  // 設定動畫播放速度 (每秒10格)
  frameRate(10);

  // 建立播放按鈕（用於滿足瀏覽器的使用者手勢政策）
  playButton = createButton('開始播放音樂並啟動動畫');
  playButton.position(20, 20);
  playButton.mousePressed(startAudio);
}

function draw() {
  background(255); // 純白背景

  if (frames.length === 0) return;

  // 計算角色1 置中位置
  const x1 = width / 2 - frameWidth / 2;
  const y1 = height / 2 - frameHeight / 2;

  // 顯示角色1 的目前畫格
  image(frames[currentFrame], x1, y1);

  // 更新角色1 畫格
  currentFrame = (currentFrame + 1) % numFrames;

  // 顯示角色2（如果有 frames2），放在角色1 右側一點
  if (frames2.length > 0) {
    const gap = 20; // 角色間距
    const x2 = x1 + frameWidth + gap;
    // 垂直置中對齊角色1
    const y2 = height / 2 - frameHeight2 / 2;
    image(frames2[currentFrame2], x2, y2);
    currentFrame2 = (currentFrame2 + 1) % numFrames2;
  }

  // 若音樂正在播放且有振幅分析器，依音量調整動畫速度
  if (isPlaying && amp) {
    const level = amp.getLevel(); // 取得瞬時音量，通常在 0 ~ 0.3 範圍
    // 把音量對應到動畫更新速度（frameRate），避免太小或太大
    const minFPS = 4;
    const maxFPS = 24;
    // level 的值通常很小，依經驗把 0.3 當作較大音量
    const target = map(level, 0, 0.3, minFPS, maxFPS, true);
    frameRate(target);
  }
}

function startAudio() {
  // userStartAudio 用於在某些瀏覽器需透過手勢啟動 audio context
  userStartAudio().then(() => {
    if (song && !song.isPlaying()) {
      song.loop();
    }
    amp = new p5.Amplitude();
    amp.setInput(song);
    isPlaying = true;
    if (playButton) playButton.hide();
  }).catch((err) => {
    console.warn('無法啟動 AudioContext:', err);
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
