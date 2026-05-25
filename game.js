const sceneImage = document.querySelector("#sceneImage");
const hotspotLayer = document.querySelector("#hotspotLayer");
const questionText = document.querySelector("#questionText");
const categoryText = document.querySelector("#categoryText");
const feedback = document.querySelector("#feedback");
const scoreText = document.querySelector("#score");
const totalText = document.querySelector("#total");
const speakBtn = document.querySelector("#speakBtn");
const nextBtn = document.querySelector("#nextBtn");

const items = {
  bird: { name: "鸟鸟", category: "小动物", image: "animals", box: [4.8, 31.5, 16.2, 22.5] },
  duck: { name: "鸭子", category: "小动物", image: "animals", box: [26.1, 19.2, 15.0, 34.8] },
  chicken: { name: "小鸡", category: "小动物", image: "animals", box: [49.2, 22.8, 15.0, 34.6] },
  dog: { name: "狗狗", category: "小动物", image: "animals", box: [70.1, 22.0, 22.4, 34.8] },
  cat: { name: "小猫", category: "小动物", image: "animals", box: [3.0, 51.7, 19.0, 39.2] },
  rabbit: { name: "兔子", category: "小动物", image: "animals", box: [27.8, 54.6, 13.3, 36.2] },
  cow: { name: "奶牛", category: "小动物", image: "animals", box: [44.7, 52.2, 26.0, 39.4] },
  sheep: { name: "小羊", category: "小动物", image: "animals", box: [73.8, 56.0, 22.6, 36.5] },

  excavator: { name: "挖掘机", category: "工程车", image: "construction", box: [1.7, 9.0, 32.4, 45.8] },
  bulldozer: { name: "推土机", category: "工程车", image: "construction", box: [36.4, 19.5, 25.8, 34.5] },
  crane: { name: "吊车", category: "工程车", image: "construction", box: [67.6, 1.2, 30.9, 53.0] },
  dumpTruck: { name: "翻斗车", category: "工程车", image: "construction", box: [10.8, 55.5, 32.8, 36.3] },
  mixer: { name: "搅拌车", category: "工程车", image: "construction", box: [55.8, 53.2, 35.8, 37.8] },

  fireTruck: { name: "消防车", category: "汽车", image: "vehicles", box: [5.2, 20.5, 35.0, 32.0] },
  bus: { name: "公交车", category: "汽车", image: "vehicles", box: [62.6, 19.0, 32.0, 32.0] },
  policeCar: { name: "警车", category: "汽车", image: "vehicles", box: [33.2, 42.8, 33.2, 28.4] },
  ambulance: { name: "救护车", category: "汽车", image: "vehicles", box: [5.0, 58.2, 32.8, 34.8] },
  taxi: { name: "出租车", category: "汽车", image: "vehicles", box: [55.0, 60.0, 37.0, 32.4] },

  apple: { name: "苹果", category: "水果", image: "fruits", box: [6.2, 20.5, 20.0, 33.5] },
  banana: { name: "香蕉", category: "水果", image: "fruits", box: [28.0, 19.0, 24.5, 31.5] },
  strawberry: { name: "草莓", category: "水果", image: "fruits", box: [53.1, 24.0, 14.0, 23.0] },
  watermelon: { name: "西瓜", category: "水果", image: "fruits", box: [68.5, 20.8, 27.0, 36.0] },
  orange: { name: "橙子", category: "水果", image: "fruits", box: [24.0, 52.0, 17.0, 31.5] },
  grapes: { name: "葡萄", category: "水果", image: "fruits", box: [43.8, 55.2, 27.2, 28.8] },
};

const scenes = [
  "bird",
  "duck",
  "chicken",
  "dog",
  "cat",
  "rabbit",
  "cow",
  "sheep",
  "excavator",
  "bulldozer",
  "crane",
  "dumpTruck",
  "mixer",
  "fireTruck",
  "bus",
  "policeCar",
  "ambulance",
  "taxi",
  "apple",
  "banana",
  "strawberry",
  "watermelon",
  "orange",
  "grapes",
  "dog",
];

const imageFiles = {
  animals: "./assets/scene-animals.png",
  construction: "./assets/scene-construction.png",
  vehicles: "./assets/scene-vehicles.png",
  fruits: "./assets/scene-fruits.png",
};

let canAnswer = true;
let audioContext;
let questionOrder = [];
let orderCursor = 0;

totalText.textContent = `/ ${scenes.length}`;

function currentTargetId() {
  return scenes[questionOrder[orderCursor]];
}

function currentTarget() {
  return items[currentTargetId()];
}

function setFeedback(text, mode = "") {
  feedback.textContent = text;
  feedback.className = `feedback ${mode}`.trim();
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    setFeedback(text);
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.86;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return undefined;
  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playTone({ frequency, start = 0, duration = 0.18, type = "sine", volume = 0.16, endFrequency }) {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startAt = context.currentTime + start;
  const endAt = startAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, endAt);
  }

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.02);
}

function playNoise({ start = 0, duration = 0.18, volume = 0.18, frequency = 700 }) {
  const context = getAudioContext();
  if (!context) return;

  const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const startAt = context.currentTime + start;

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(frequency, startAt);
  filter.Q.setValueAtTime(5, startAt);
  gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(startAt);
}

function playItemSound(id) {
  const sounds = {
    bird: () => {
      playTone({ frequency: 1450, duration: 0.09, volume: 0.12 });
      playTone({ frequency: 1900, start: 0.11, duration: 0.1, volume: 0.12 });
      playTone({ frequency: 1650, start: 0.24, duration: 0.08, volume: 0.1 });
    },
    duck: () => {
      playTone({ frequency: 260, duration: 0.18, type: "sawtooth", volume: 0.12, endFrequency: 170 });
      playTone({ frequency: 230, start: 0.2, duration: 0.16, type: "sawtooth", volume: 0.1, endFrequency: 150 });
    },
    chicken: () => {
      playTone({ frequency: 720, duration: 0.08, type: "square", volume: 0.1 });
      playTone({ frequency: 540, start: 0.09, duration: 0.07, type: "square", volume: 0.09 });
      playTone({ frequency: 830, start: 0.18, duration: 0.08, type: "square", volume: 0.1 });
    },
    dog: () => {
      playTone({ frequency: 180, duration: 0.13, type: "square", volume: 0.16, endFrequency: 95 });
      playNoise({ duration: 0.12, volume: 0.1, frequency: 420 });
      playTone({ frequency: 210, start: 0.18, duration: 0.12, type: "square", volume: 0.14, endFrequency: 110 });
    },
    cat: () => {
      playTone({ frequency: 520, duration: 0.42, type: "triangle", volume: 0.12, endFrequency: 820 });
      playTone({ frequency: 760, start: 0.16, duration: 0.24, type: "sine", volume: 0.06, endFrequency: 520 });
    },
    rabbit: () => {
      playTone({ frequency: 620, duration: 0.08, type: "triangle", volume: 0.08 });
      playTone({ frequency: 880, start: 0.12, duration: 0.08, type: "triangle", volume: 0.08 });
    },
    cow: () => {
      playTone({ frequency: 130, duration: 0.55, type: "sawtooth", volume: 0.13, endFrequency: 105 });
      playTone({ frequency: 165, start: 0.08, duration: 0.45, type: "sine", volume: 0.07, endFrequency: 125 });
    },
    sheep: () => {
      playTone({ frequency: 390, duration: 0.26, type: "sawtooth", volume: 0.1, endFrequency: 300 });
      playTone({ frequency: 470, start: 0.18, duration: 0.22, type: "sawtooth", volume: 0.09, endFrequency: 340 });
    },
  };

  if (sounds[id]) {
    sounds[id]();
    return;
  }

  playTone({ frequency: 520, duration: 0.08, type: "triangle", volume: 0.07 });
}

function question() {
  return `旺仔，${currentTarget().name}在哪里？`;
}

function visibleItemsForImage(imageKey) {
  return Object.entries(items).filter(([, item]) => item.image === imageKey);
}

function shuffle(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildQuestionOrder(previousTargetId) {
  const indices = scenes.map((_, index) => index);
  questionOrder = shuffle(indices);
  if (previousTargetId && scenes[questionOrder[0]] === previousTargetId && questionOrder.length > 1) {
    [questionOrder[0], questionOrder[1]] = [questionOrder[1], questionOrder[0]];
  }
  orderCursor = 0;
}

function createHotspot(id, item) {
  const [left, top, width, height] = item.box;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "hotspot";
  button.dataset.item = id;
  button.setAttribute("aria-label", item.name);
  button.style.left = `${left}%`;
  button.style.top = `${top}%`;
  button.style.width = `${width}%`;
  button.style.height = `${height}%`;
  button.addEventListener("click", () => handleGuess(button));
  return button;
}

function renderScene() {
  const target = currentTarget();
  sceneImage.src = imageFiles[target.image];
  sceneImage.alt = `${target.category}手绘找一找场景`;
  scoreText.textContent = orderCursor + 1;
  categoryText.textContent = `${target.category}场景`;
  questionText.textContent = `${target.name}在哪里？`;
  hotspotLayer.replaceChildren();
  visibleItemsForImage(target.image).forEach(([id, item]) => {
    hotspotLayer.appendChild(createHotspot(id, item));
  });
  canAnswer = true;
  setFeedback("听问题，点一点图片里的答案。");
}

function askQuestion() {
  speak(question());
}

function nextScene() {
  const previousTargetId = currentTargetId();
  orderCursor += 1;
  if (orderCursor >= questionOrder.length) {
    buildQuestionOrder(previousTargetId);
  }
  renderScene();
  askQuestion();
}

function handleGuess(button) {
  if (!canAnswer) return;
  const clickedId = button.dataset.item;
  button.classList.remove("is-correct", "is-wrong", "is-tapped");
  void button.offsetWidth;
  button.classList.add("is-tapped");
  window.setTimeout(() => button.classList.remove("is-tapped"), 520);
  playItemSound(clickedId);

  if (clickedId === currentTargetId()) {
    canAnswer = false;
    button.classList.add("is-correct");
    setFeedback("旺仔真棒！", "success");
    window.setTimeout(() => speak("旺仔真棒！"), 420);
    window.setTimeout(nextScene, 1500);
    return;
  }

  button.classList.add("is-wrong");
  setFeedback("再找找，它还在图片里呢。", "try-again");
  window.setTimeout(() => speak("再找找，它还在图片里呢。"), 360);
}

speakBtn.addEventListener("click", askQuestion);
nextBtn.addEventListener("click", nextScene);

window.addEventListener("load", () => {
  buildQuestionOrder();
  renderScene();
  window.setTimeout(askQuestion, 350);
});
