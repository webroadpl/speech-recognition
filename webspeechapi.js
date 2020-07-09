let messages = {
    "start": 'Click start and begin speaking',
    "speak_now": 'Speak now',
    "process": 'Speech processing',
    "process_end": 'Speech processing completed',
    "upgrade": 'Web Speech API is not supported',
}

let ignore_onend;
let start_timestamp;
let recognition;
let final_transcript = '';
let recognizing = false;
let last_message = ''
let current_iteration = 1;
let final_textarea = document.getElementById('final');
let log_area = document.getElementById('console');
let start_button = document.getElementById('start');

function logAction(message) {
    if(messages[message] !== last_message)
    {
        let old = log_area.value;
        let new_log = old + current_iteration + ". " + messages[message]+"\n";
        last_message = messages[message]
        log_area.value = new_log;

        current_iteration++;
    }
}

function startOrStop(){
    if (recognizing) {
        recognition.stop();
        log_area.value = '';
        current_iteration = 1
        enableStartButton();
        return;
    }
    final_transcript = '';
    recognition.lang = document.getElementById('lang').value;
    enableStopButton()
    recognition.start();
    ignore_onend = false;
    start_timestamp = event.timeStamp;
}

function enableStartButton(){
    start_button.textContent = 'Start';
    start_button.classList.add("btn-secondary");
    start_button.classList.remove("btn-danger");
}

function enableStopButton(){
    start_button.textContent = 'Stop';
    start_button.classList.remove("btn-secondary");
    start_button.classList.add("btn-danger");
}

if (!('webkitSpeechRecognition' in window)) {
    logAction('upgrade');
} else {
    logAction('start');
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        recognizing = true;
        logAction('speak_now');
    };

    recognition.onend = function() {
        recognizing = false;
        if (ignore_onend) {
            return;
        }

        if (!final_transcript) {
            return;
        }

        if (window.getSelection) {
            window.getSelection().removeAllRanges();
            let range = document.createRange();
            range.selectNode(document.getElementById('final'));
            window.getSelection().addRange(range);
        }
    };

    recognition.onresult = function(event) {
        let interim_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        if(final_transcript === '')
        {
            final_textarea.value = interim_transcript;
            logAction('process');
        }
        else {
            final_textarea.value = final_transcript;
            logAction('process_end');
            enableStartButton();
        }
    };
}

start_button.addEventListener("click", startOrStop);
