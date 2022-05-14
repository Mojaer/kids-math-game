const recordAudio = () =>
    new Promise(async resolve => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.addEventListener("dataavailable", event => {
            audioChunks.push(event.data);
        });

        const start = () => mediaRecorder.start();

        const stop = () =>
            new Promise(resolve => {
                mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks);
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);
                    const play = () => audio.play();
                    resolve({ audioBlob, audioUrl, play });
                });

                mediaRecorder.stop();
            });

        resolve({ start, stop });
    });

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

let recorder;
let state = "wait";
//recorder.start();
//await sleep(3000);
//const audio = await recorder.stop();
//audio.play();

$("#talk").on("mousedown touchstart", async function () {
    state = "recording";
    $("#talk").addClass("talk-pressed");
    recorder = await recordAudio();
    recorder.start();
});

$("#talk").on("mouseup mouseout touchend", async function () {
    $("#talk").removeClass("talk-pressed");
    if (state == "recording") {
        const audio = await recorder.stop();
        audio.play();
        state = "wait";
        //Esporta l'audio in Base64
        var reader = new FileReader();
        reader.readAsDataURL(audio.audioBlob);
        reader.onloadend = function () {
            var base64data = reader.result;
            console.log(base64data);
        }
    }
});

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}


//part two


var synth = window.speechSynthesis;

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var numbers = ['rosso', 'verde', 'blu'];
var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + numbers.join(' | ') + ' ;'

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();

speechRecognitionList.addFromString(grammar, 1);

recognition.grammars = speechRecognitionList;
recognition.continuous = false;
recognition.lang = 'it-IT';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

function say(phrase, rec) {
  var utterThis = new SpeechSynthesisUtterance(phrase);
  var voices = synth.getVoices();
  //utterThis.voice = voices[11];
  utterThis.pitch = 1; // 0.5 - 2
  utterThis.rate = 1;   // 0 - 2 
  synth.speak(utterThis);
  //if (rec) setTimeout("recognition.start();", 2000)
}

recognition.onresult = function (event) {
  var number = event.results[0][0].transcript;
  /*if (number=="48") {
      say("Bravo!!! 6 per 8 fa " + number, false)
    } else {
      say(insulto() + "!!! 6 per 8 fa 48!!!", false)
    }
  console.log('Confidence: ' + event.results[0][0].confidence);*/
  if (parseInt(number) > 0) {
    addDigit(parseInt(number))
  } else {
    //say(insulto() + " Non ho capito bene")
  }
}

recognition.onspeechend = function () {
  //recognition.stop();
}

recognition.onnomatch = function (event) {
  //say("Non ho capito")
}

recognition.onerror = function (event) {
  say("Mi spiace, si è verificato un errore")
  console.log(event)
}

function insulto() {
  var insulti = ['Capra', 'Asino', 'Testa vuota', 'Testa di rapanello', 'Zucca vuota', 'Pallone sgonfio', 'Cocomero', 'Citrullo', 'Testa dura', 'Cavolfiore', 'Cetrilo', 'Prugna secca', 'Lattuga', 'Ciambella bucata', 'Scarpone', 'Ciabatta', 'Cappero secco', 'Rottame', 'Cinghialone', 'Ehi capitan mutanda', 'Stai sparando a caso?']
  return insulti[Math.floor(Math.random() * insulti.length)]
}

function complimenti() {
  var complimenti = ['Dai!', 'Esatto!', 'Giusto!', 'Grande!', 'Uao!', 'Esagerato!', 'Super!', 'Campione!', 'Ma come fai!?!', 'Troppo forte!', 'Troppo bravo', 'Sei troppo!', 'Mitico', 'Bravissimo!', 'Mito!', 'Sei un mito', 'Genio', 'Geniale!', 'Mago', 'Mago delle tabelline', 'Molto bene!', 'Sono fiero di te!', 'Top', 'Top del top', 'Sei il re!', 'Sei il re delle tabelline!', 'Chi sei, una calcolatrice!', 'Sei un computer!', 'Chi ti suggerisce?', 'Incredibile', 'Impossibile', 'Superman']
  return complimenti[Math.floor(Math.random() * complimenti.length)]
}

