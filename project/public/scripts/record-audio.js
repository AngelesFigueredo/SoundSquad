let finalAudio
let mediaRecorder
const chunks = [];

const startRecording = () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block'
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      mediaRecorder.addEventListener('dataavailable', e => {
        chunks.push(e.data);
      });
    });
};

const stopRecording = () => {
  mediaRecorder.stop();
  mediaRecorder.addEventListener('stop', () => {
    finalAudio = new Blob(chunks, { type: 'audio/webm' });

    const reader = new FileReader();
    reader.readAsDataURL(finalAudio);
    reader.onloadend = () => {
      const base64String = reader.result.replace('data:audio/webm;base64,', '');
      const audioDataInput = document.getElementById('audio-data');
      audioDataInput.value = base64String;
      const audioForm = document.getElementById('audio-form');
      audioForm.submit();
    };
  });
};
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);