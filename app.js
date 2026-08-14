// Éléments du DOM
const videoInput = document.getElementById('videoInput');
const mainVideo = document.getElementById('mainVideo');
const toggleWebcamBtn = document.getElementById('toggleWebcamBtn');
const webcamVideo = document.getElementById('webcamVideo');
const webcamPositionSelect = document.getElementById('webcamPosition');

let webcamStream = null;

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
    // Désactiver la webcam
    webcamStream.getTracks().forEach(track => track.stop());
    webcamStream = null;
    webcamVideo.style.display = 'none';
    toggleWebcamBtn.textContent = '📷 Activer la webcam';
  } else {
    // Activer la webcam
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

// Changement de position de la webcam
webcamPositionSelect.addEventListener('change', (e) => {
  const position = e.target.value;
  webcamVideo.className = `webcam-overlay ${position}`;
});

// Position par défaut
webcamVideo.classList.add('bottom-right');