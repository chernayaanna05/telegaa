const tg = window.Telegram.WebApp;
tg.expand();

const btn = document.getElementById("btn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const photoPreview = document.getElementById("photoPreview");
const confirmButtons = document.getElementById("confirmButtons");
const confirmBtn = document.getElementById("confirmBtn");
const retryBtn = document.getElementById("retryBtn");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjkG7-rBxyG1EZNdr2s92VStuJb-pCdz4UqzT34hVHQ8DR0kvaysOdNrL4XnDisOA8/exec"; // URL Google Apps Script

let currentPhoto = null;

btn.onclick = function() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
    .then(stream => {
      video.srcObject = stream;
      video.play();

      function tryDraw() {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext("2d").drawImage(video, 0, 0);
          stream.getTracks().forEach(track => track.stop());

          currentPhoto = canvas.toDataURL("image/png");
          photoPreview.src = currentPhoto;
          photoPreview.style.display = "block";
          confirmButtons.style.display = "block";
          video.style.display = "none";
          btn.style.display = "none";
        } else {
          requestAnimationFrame(tryDraw);
        }
      }

      requestAnimationFrame(tryDraw);
    })
    .catch(err => {
      alert("Ошибка камеры: " + (err.name || err.message));
      console.error(err);
    });
};

retryBtn.onclick = function() {
  photoPreview.style.display = "none";
  confirmButtons.style.display = "none";
  video.style.display = "block";
  btn.style.display = "block";
  btn.click(); // заново запускаем камеру
};

confirmBtn.onclick = function() {
  send(currentPhoto);
};

function send(photo) {
  const user = tg.initDataUnsafe.user;
  if (!user) {
    alert("Откройте приложение из Telegram");
    return;
  }

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      first_name: user.first_name,
      last_name: user.last_name || "",
      photo: photo
    }),
    headers: { "Content-Type": "application/json" }
  })
  .then(r => r.text())
  .then(t => alert("Вы успешно отметились!"))
  .catch(err => {
    alert("Ошибка отправки данных");
    console.error(err);
  });
}