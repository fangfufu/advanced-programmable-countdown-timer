/* Set whether we want to do some video */
var VIDEO_ENABLED = true;
/* Are we video */
var VIDEO = false;

/* The list of video */
var VIDEO_LIST = [
"LsOZ45E6jBg", /* RBC Super League Jersey: Men's Enduro */
"wZNJeqseqUg", /* RBC Super League Triathlon Jersey: Men's Final */
"aHR0H0XU7sM", /* Super League Triathlon Mallorca: Men's Sprint Enduro */
"qpH7LYt37pQ", /* Men's Jersey Triple Mix Jersey 2018 FULL */
"Sg9BgP1D704", /* RBC Super League Triathlon Jersey: Women's Final*/
"Nu1bh7g2mUA", /* Super League Triathlon Mallorca: Women's Sprint Enduro */
"lGbrvMQBgzM", /* Super League Championship Finale - Women's Enduro Full Race */
"b5kHoPWa-Go", /* Women's Jersey Triple Mix Jersey 2018 FULL */
]

/*
 * The interval before video
 * (3+7)/2 = 5 mins
 */
// var VIDEO_INTERVAL_MIN = 3*60;
// var VIDEO_INTERVAL_MAX = 7*60;
var VIDEO_INTERVAL_MIN = 10;
var VIDEO_INTERVAL_MAX = 10;
var VIDEO_INTERVAL_MULTIPLIER = VIDEO_INTERVAL_MAX -
                                    VIDEO_INTERVAL_MIN;
var VIDEO_INTERVAL = -100;

/*
 * The remaining run time of video
 * (15+45)/2 = 30 sec
 */
// var VIDEO_TIME_MIN = 15;
// var VIDEO_TIME_MAX = 45;
var VIDEO_TIME_MIN = 7200;
var VIDEO_TIME_MAX = 7200;
var VIDEO_TIME_MULTIPLIER = VIDEO_TIME_MAX - VIDEO_TIME_MIN;

/* Triggers the callback function to update the countdown */
var COUNTDOWN_CLOCK;

/* Check if we have already parsed the countdown set */
var STARTED = false;

/* The parsed countdown set */
var SET_ARRAY;

/* The current segment - which segment are we on?  */
var SEG_NUM = 0;

/* The remaining time for this segment */
var SEG_REM_TIME = 0;

/* Whether the timer is highlighted */
var HIGHLIGHT = false;

/* The time after which the timer is highlighted */
var HIGHLIGHT_START = 5;

/* The total remaining time for this countdown session */
var TOTAL_TIME = 0;

/* All the option element for the progress listing */
var OPTION_ARRAY = [];

/* -------------- Shortcut function -------------- */
function set_bg_color(id, color) {
    document.getElementById(id).style.backgroundColor = color;
}

function set_disabled(id, s) {
    document.getElementById(id).disabled = s;
}

function set_font_color(id, color) {
    document.getElementById(id).style.color = color;
}

function set_checkbox(id, b) {
    document.getElementById(id).checked = b;
}

function write_str(id, str) {
    document.getElementById(id).textContent = str;
}

function write_html(id, str) {
    document.getElementById(id).innerHTML = str;
}

function set_element_display(id, s) {
    if (s) {
        document.getElementById(id).style.display = "flex";
    } else {
        document.getElementById(id).style.display = "none";
    }
}

function set_audio_display() {
    set_element_display('audio-control',
                        document.getElementById('audio-checkbox').checked);
}

/* --------------- Display related functions -------------- */
function set_display_border(s) {
    if (s) {
        document.getElementById("display").style.border = "thin solid #000000";
    } else {
        document.getElementById("display").style.border = "";
    }
}

function set_highlight(s) {
    if (s) {
        set_bg_color("seg-time", "yellow");
        HIGHLIGHT = true;
    } else {
        set_bg_color("seg-time", "initial");
        HIGHLIGHT = false;
    }
}

function update_display(time, text) {
    write_str("seg-text", text);
    if (time < HIGHLIGHT_START) {
        if (!HIGHLIGHT) {
            set_highlight(true);
        } else {
            set_highlight(false);
        }
    } else {
        set_highlight(false);
    }
    var time_str = sec_to_time_str(time);
    write_str("seg-time", time_str);
    document.title = time_str;
}

function clear_display() {
    write_str("seg-text", "");
    write_str("seg-time", "");
    set_display_border(false);
}

/*------------------- Audio functions -----------------*/
function set_audio() {
    audio_elm = document.getElementById("audio-element");
    audio_src = document.getElementById("audio-source");
    audio_src.src = document.getElementById("audio-selector").value;
    audio_elm.load();
//     play_audio();
}

function play_audio() {
    audio_elm = document.getElementById("audio-element");
    audio_elm.play();
    setTimeout(stop_audio, 1500);
}

function stop_audio() {
    audio_elm = document.getElementById("audio-element");
    audio_elm.pause();
    audio_elm.load();
}

/*-------------------- Utility functions --------------------*/
function sec_to_time_str(time) {
    var min = Math.floor(time / 60);
    var sec = time % 60;
    var min_str = min.toString();
    var sec_str = sec.toString();
    if (min < 10) {
        min_str = "0" + min_str;
    }
    if (sec < 10) {
        sec_str = "0" + sec_str;
    }
    var time_str = min_str + ":" + sec_str;
    return time_str;
}

/* Tokenise the input text */
function parse_input() {
    var input_area = document.getElementById("input-area");
    var str = input_area.value.trim();
    /* Split the input string to lines */
    var arr = str.split(/\r|\r\n|\n/);
    /* Reset total time */
    TOTAL_TIME = 0;
    /* Split each line into fields */
    for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].split(";");
        /* Split the first field into times */
        let time_arr = arr[i][0].split(":");
        /* Explicitly convert string into int */
        time_arr[0] = parseInt(time_arr[0]);
        time_arr[1] = parseInt(time_arr[1]);
        /* Check if the conversion had been valid */
        if (isNaN(time_arr[0]) || isNaN(time_arr[1])) {
            write_html("status-box", "<p>Error at:</p>" +
                 "<p>Line " + (i + 1) + "</p>");
            set_font_color("status-box", "red");
            set_disabled("start-button", true);
            SET_ARRAY = [];
            OPTION_ARRAY = [];
            return;
        } else {
            /* Calculate the segment run-time in seconds */
            arr[i][0] = (time_arr[0] * 60 + time_arr[1]);
            /* Add to the total time */
            TOTAL_TIME += arr[i][0];
        }
    }
    SET_ARRAY = arr;

    /* Calculate the total time, if the array is not empty*/
    if (arr.length > 0) {
        write_html("status-box", "<p>Total time:</p> <p>" +
            sec_to_time_str(TOTAL_TIME) + "</p>");
        set_font_color("status-box", "initial");
    }

    set_disabled("start-button", false);
    array_to_select();
}

/* I am not doing any manual garbage collection here, good luck, browser */
function array_to_select() {
    var select_elm = document.getElementById("progress-listing");
    select_elm.innerHTML = "";
    var arr = SET_ARRAY;
    var opts = [];
    if (arr.length < 1) {
        alert("array_to_select(): SET_ARRAY.length < 1.");
        return;
    }

    /* create the option nodes */
    for (let i = 0; i < SET_ARRAY.length; i++) {
        let textNode = document.createTextNode(
                        sec_to_time_str(arr[i][0]) + " - " + arr[i][1]);
        opts[i] = document.createElement("option");
        opts[i].appendChild(textNode);
        select_elm.appendChild(opts[i]);
    }
    OPTION_ARRAY = opts;
}

/* Select the right option element */
function set_option_select(n) {
    var arr = OPTION_ARRAY;
    for (let i = 0; i < OPTION_ARRAY.length; i++) {
        OPTION_ARRAY[i].removeAttribute("selected");
    }
    OPTION_ARRAY[n].setAttribute("selected", true);
    OPTION_ARRAY[n].scrollIntoView();
}

/* --------------- Timer callback functions --------------- */
function countdown_callback() {
    if (!STARTED) {
        alert("countdown_callback(): STARTED == false.");
        return;
    }

    update_display(SEG_REM_TIME, SET_ARRAY[SEG_NUM][1]);
    /* Video related code */
    if (VIDEO_ENABLED) {
        /* Initialise video interval to random */
        if (VIDEO_INTERVAL == -100) {
            VIDEO_INTERVAL = VIDEO_INTERVAL_MIN +
                Math.round(Math.random() * VIDEO_INTERVAL_MULTIPLIER);
        }
        if (VIDEO_INTERVAL < 0) {
            video_mode(true);
        } else {
            if (!VIDEO) {
                VIDEO_INTERVAL--;
            }
        }

        if (VIDEO) {
            VIDEO_TIME--;
            if (VIDEO_TIME < 0) {
                video_mode(false);
            }
        }
    }

    /* If we have reached the end of this segment */
    if (SEG_REM_TIME < 1) {
        /* Play a sound, if the audio checkbox is checked */
        if(document.getElementById("audio-checkbox").checked) {
            play_audio();
        }
        SEG_NUM++;
        video_mode(false);
        /* If this segment is longer than the array length */
        if (SEG_NUM >= SET_ARRAY.length) {
            /* if we the loop checkbox is not checked */
            if(!document.getElementById("loop-checkbox").checked) {
                reset_button();
                set_display_border(true)
                update_display(0, "That's it, well done! 😊");
                set_bg_color("seg-text", "yellow");
                /* Reset the timer's state */
                parse_input();
                set_element_display("input-area", false);
                set_element_display("input-label", false);
                set_element_display("finish-image", true);
                set_disabled("pause-button", true);
                set_disabled("start-button", true);
                return;
            }
            SEG_NUM = 0;
        } else {
            set_option_select(SEG_NUM);
        }
        SEG_REM_TIME = SET_ARRAY[SEG_NUM][0];
    }
    write_html("status-box", "<p>Remaining:</p> <p>" +
            sec_to_time_str(TOTAL_TIME) + "</p>");
    write_html("remaining-time", "Remaining: " + sec_to_time_str(TOTAL_TIME));

    set_font_color("status-box", "initial");
    TOTAL_TIME--;
    SEG_REM_TIME--;
    progress_button_check();
    COUNTDOWN_CLOCK = setTimeout(countdown_callback, 1000);
}

function wall_clock_callback() {
    var t = new Date();
    write_str("current-time", "Current Time: " +
                t.toLocaleTimeString("en-GB"));
    setTimeout(wall_clock_callback, 500);
}

/* ----------------- Button functions ------------------ */
function start_button() {
    /* Parse the input text box, if we haven"t. */
    if (!STARTED) {
        parse_input();
        STARTED = true;
        SEG_NUM = 0;
        SEG_REM_TIME = SET_ARRAY[0][0];
        set_option_select(0);
        set_display_border(true);
        set_bg_color("seg-text", "initial");
    }
    set_disabled("pause-button", false);
    set_disabled("start-button", true);
    set_font_color("seg-text", "initial");
    countdown_callback();
    document.removeEventListener('keyup', parse_input);
    set_element_display("progress-control-label", true);
    set_element_display("progress-control-container", true);
    set_element_display("input-area", false);
    set_element_display("input-label", false);
}

function pause_button() {
    clearTimeout(COUNTDOWN_CLOCK);
    set_disabled("pause-button", true);
    set_disabled("start-button", false);
    set_font_color("seg-text", "red");
    write_str("seg-text", "Paused");
}

function reset_button() {
    clearTimeout(COUNTDOWN_CLOCK);
    STARTED = false;
    clear_display();
    document.addEventListener('keyup', parse_input);
    set_disabled("pause-button", true);
    set_disabled("start-button", false);
    set_element_display("input-area", true);
    set_element_display("input-label", true);
    set_element_display("finish-image", false);
    set_element_display("progress-control-label", false);
    set_element_display("progress-control-container", false);
    parse_input();
    document.title = "Countdown Timer"
}

function progress_button_check() {
    set_disabled("prev-button", false);
    set_disabled("next-button", false);
    if (SEG_NUM < 1) {
        set_disabled("prev-button", true);
    }
    if (SEG_NUM >= SET_ARRAY.length - 1) {
        set_disabled("next-button", true);
    }
}

function progress_button(p) {
    SEG_NUM = SEG_NUM + p;
    SEG_REM_TIME = SET_ARRAY[SEG_NUM][0];
    TOTAL_TIME = 0;
    for (let i = SEG_NUM; i < SET_ARRAY.length; i++) {
        TOTAL_TIME += SET_ARRAY[i][0];
    }
    set_option_select(SEG_NUM);
    progress_button_check();
}

/* ----------------- Video functions ----------------- */
function video_mode(b) {
    if (!VIDEO_ENABLED) {
        b = false;
    }
    VIDEO = b;
    if (b) {
        set_element_display("progress-control-label", false);
        set_element_display("progress-control-panel", false);
        set_element_display("control-container", false);
        set_element_display("youtube-video-iframe", true);
        set_element_display("youtube-video-status", true);
        set_element_display("footer", false);
    } else {
        set_element_display("progress-control-label", true);
        set_element_display("progress-control-panel", true);
        set_element_display("control-container", true);
        set_element_display("youtube-video-iframe", false);
        set_element_display("youtube-video-status", false);
        set_element_display("footer", true);
    }
    /* Set the new video interval */
    VIDEO_INTERVAL = VIDEO_INTERVAL_MIN +
    Math.round(Math.random() * VIDEO_INTERVAL_MULTIPLIER);
    /* Set the amount of time to troll */
    VIDEO_TIME = VIDEO_TIME_MIN +
    Math.round(Math.random() * VIDEO_TIME_MULTIPLIER);
}

function disable_video_mode() {
    VIDEO_ENABLED = !document.getElementById(
        'youtube-status-checkbox').checked;
    video_mode(VIDEO_ENABLED);
}

function close_question_display() {
    document.getElementById("question").style.display = "none";
    VIDEO_ENABLED = document.getElementById("youtube_choice").checked;
}

function load_random_video() {
    var v_id = Math.floor(Math.random() * VIDEO_LIST.length);
    document.getElementById("youtube-video-iframe").src =
    "https://www.youtube.com/embed/" +
    VIDEO_LIST[v_id] +
    "?&autoplay=1&mute=1&loop=1&cc_load_policy=1&playlist=" +
    VIDEO_LIST[v_id]
}

/* ----------------- Startup functions ------------------ */
function startup() {
    wall_clock_callback();
    set_audio_display();
    set_audio();
    document.addEventListener('keyup', parse_input);
    set_disabled("pause-button", true);
    parse_input();
    set_element_display("finish-image", false);
    set_element_display("progress-control-label", false);
    set_element_display("progress-control-container", false);
    set_element_display("youtube-video-status", false);
    set_element_display("youtube-video-iframe", false);
    load_random_video();
    /* Open up the question display */
//     document.getElementById("question").style.display = "block";
}
