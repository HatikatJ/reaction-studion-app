const videoInput = document.getElementById('videoInput');
const mainVideo = document.getElementById('mainVideo');
const webcamVideo = document.getElementById('webcamVideo');
const toggleWebcamBtn = document.getElementById('toggleWebcamBtn');
const recordBtn = document.getElementById('recordBtn');
const canvas = document.getElementById('studioCanvas');
const ctx = canvas.getContext('2d');

let webcamStream = null;
let currentLayout = 'pip';
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

// Taille fixe du canvas
canvas.width = 1280;
canvas.height = 720;

// Chargement de la vidéo
videoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    mainVideo.src = URL.createObjectURL(file);
    mainVideo.play();
    updateRecordButtonState();
  }
});

// Activer / Désactiver webcam
toggleWebcamBtn.addEventListener('click', async () => {
  if (webcamStream) {
    webcamStream.getTracks().forEach(t => t.stop());
    webcamStream = null;
    toggleWebcamBtn.textContent = '📷 Activer webcam';
  } else {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      webcamVideo.srcObject = webcamStream;
      toggleWebcamBtn.textContent = '🚫 Désactiver webcam';
    } catch (err) {
      alert("Erreur webcam : " + err.message);
    }
  }
  updateRecordButtonState();
});

// Changement de layout
document.querySelectorAll('.btn-layout').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.btn-layout').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentLayout = e.target.dataset.layout;
  });
});

function updateRecordButtonState() {
  recordBtn.disabled = !(mainVideo.src || webcamStream);
}

// boucle de rendu du Canvas (60 FPS)
function drawFrame() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;

  switch (currentLayout) {
    case 'pip': // Vidéo plein écran + webcam incrustée
      if (mainVideo.readyState >= 2) ctx.drawImage(mainVideo, 0, 0, w, h);
      if (webcamStream && webcamVideo.readyState >= 2) {
        ctx.drawImage(webcamVideo, w - 320 - 20, h - 240 - 20, 320, 240);
      }
      break;

    case 'cam-full': // Webcam seule
      if (webcamStream && webcamVideo.readyState >= 2) ctx.drawImage(webcamVideo, 0, 0, w, h);
      break;

    case 'video-full': // Vidéo seule
      if (mainVideo.readyState >= 2) ctx.drawImage(mainVideo, 0, 0, w, h);
      break;

    case 'split-h': // Côte à côte
      if (mainVideo.readyState >= 2) ctx.drawImage(mainVideo, 0, 0, w / 2, h);
      if (webcamStream && webcamVideo.readyState >= 2) ctx.drawImage(webcamVideo, w / 2, 0, w / 2, h);
      break;

    case 'split-v': // Haut / Bas
      if (mainVideo.readyState >= 2) ctx.drawImage(mainVideo, 0, 0, w, h / 2);
      if (webcamStream && webcamVideo.readyState >= 2) ctx.drawImage(webcamVideo, 0, h / 2, w, h / 2);
      break;
  }

  requestAnimationFrame(drawFrame);
}

drawFrame();

// --- LOGIQUE D'ENREGISTREMENT ---

recordBtn.addEventListener('click', () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

function startRecording() {
  recordedChunks = [];
  const canvasStream = canvas.captureStream(30);

  // Mixer le son de la vidéo et du micro si disponibles
  const audioTracks = [];
  if (webcamStream && webcamStream.getAudioTracks().length > 0) {
    audioTracks.push(...webcamStream.getAudioTracks());
  }

  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioTracks
  ]);

  mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = downloadVideo;

  mediaRecorder.start();
  isRecording = true;
  recordBtn.textContent = '⏹ Arrêter et télécharger';
  recordBtn.classList.add('recording');
}

function stopRecording() {
  mediaRecorder.stop();
  isRecording = false;
  recordBtn.textContent = '🔴 Démarrer l\'enregistrement';
  recordBtn.classList.remove('recording');
}

function downloadVideo() {
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reaction-${Date.now()}.webm`;
  a.click();
}