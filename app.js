// Éléments du DOM
const videoInput = document.getElementById('videoInput');
const mainVideo = document.getElementById('mainVideo');
const toggleWebcamBtn = document.getElementById('toggleWebcamBtn');
const webcamVideo = document.getElementById('webcamVideo');
const videoWrapper = document.getElementById('videoWrapper');

let webcamStream = null;
let isDragging = false;
let startX, startY, initialLeft, initialTop;

// Chargement de la vidéo locale
videoInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const videoURL = URL.createObjectURL(file);
    mainVideo.src = videoURL;
  }
});

// Activation / Désactivation de la webcam
toggleWebcamBtn.addEventListener('click', async () => {
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
    webcamStream = null;
    webcamVideo.style.display = 'none';
    toggleWebcamBtn.textContent = '📷 Activer la webcam';
  } else {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      webcamVideo.srcObject = webcamStream;
      webcamVideo.style.display = 'block';
      toggleWebcamBtn.textContent = '🚫 Désactiver la webcam';
    } catch (err) {
      alert("Impossible d'accéder à la webcam : " + err.message);
    }
  }
});

// --- LOGIQUE DRAG & DROP (Souris + Toucher) ---

const startDrag = (e) => {
  isDragging = true;
  const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

  startX = clientX;
  startY = clientY;
  initialLeft = webcamVideo.offsetLeft;
  initialTop = webcamVideo.offsetTop;
};

const doDrag = (e) => {
  if (!isDragging) return;
  e.preventDefault();

  const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
  const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

  const deltaX = clientX - startX;
  const deltaY = clientY - startY;

  let newLeft = initialLeft + deltaX;
  let newTop = initialTop + deltaY;

  // Limites pour ne pas faire sortir la webcam du cadre de la vidéo
  const maxLeft = videoWrapper.clientWidth - webcamVideo.clientWidth;
  const maxTop = videoWrapper.clientHeight - webcamVideo.clientHeight;

  newLeft = Math.max(0, Math.min(newLeft, maxLeft));
  newTop = Math.max(0, Math.min(newTop, maxTop));

  webcamVideo.style.left = `${newLeft}px`;
  webcamVideo.style.top = `${newTop}px`;
};

const stopDrag = () => {
  isDragging = false;
};

// Événements Souris
webcamVideo.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', doDrag);
window.addEventListener('mouseup', stopDrag);

// Événements Touch (Mobile)
webcamVideo.addEventListener('touchstart', startDrag);
window.addEventListener('touchmove', doDrag, { passive: false });
window.addEventListener('touchend', stopDrag);