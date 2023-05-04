let finalAudio;
let mediaRecorder ;
const chunks = [];

const startRecording = () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    mediaRecorder.addEventListener('dataavailable', e => {
    chunks.push(e.data);
    });
   });
  };
      // stop recording and save audio
      const stopRecording = () => {
        mediaRecorder.stop();
        mediaRecorder.addEventListener('stop', () => {
          finalAudio = new Blob(chunks, { type: 'audio/webm' });
          const audioPlayer = document.getElementById('audio-player');
          audioPlayer.src = URL.createObjectURL(finalAudio);
          console.log(URL.createObjectURL(finalAudio))
        });
      };

      // add event listeners to buttons
      const startBtn = document.getElementById('start-btn');
      const stopBtn = document.getElementById('stop-btn');
      startBtn.addEventListener('click', startRecording);
      stopBtn.addEventListener('click', stopRecording);


