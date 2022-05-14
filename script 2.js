
var num1, num2, ris;
var timer;
var timeLog = JSON.parse(localStorage.getItem("timeLog") || "{}");
var size = 10;
var keybDisabled = true;
var hintTimer, hintTimer2;
var hadHint = false;
var speak = true;
var isLuca = true

function resetTab() {
    localStorage.removeItem('timeLog');
    timeLog = {};
    updateTab();
    return false;
}

function color(d) {
    if (!d.time) {
        return "white";
    }
    if (d.time < 3000) {
        return "green";
    }
    if (d.time < 5000) {
        return "yellow";
    }
    if (d.time >= 5000) {
        return "red";
    }
}

function toggleTriang() {
    var disabled = localStorage.getItem("disabledT");
    disabled = disabled ? JSON.parse(disabled) : [];
    disabled[0] = !(disabled[0] || false);
    localStorage.setItem("disabledT", JSON.stringify(disabled));
    updateTab();
}

function toggleNumX(num) {
    var disabled = localStorage.getItem("disabledX");
    disabled = disabled ? JSON.parse(disabled) : [];
    disabled[num] = !(disabled[num] || false);
    localStorage.setItem("disabledX", JSON.stringify(disabled));
    updateTab();
}

function toggleNumY(num) {
    var disabled = localStorage.getItem("disabledY");
    disabled = disabled ? JSON.parse(disabled) : [];
    disabled[num] = !(disabled[num] || false);
    localStorage.setItem("disabledY", JSON.stringify(disabled));
    updateTab();
}

function alpha(i, j) {
    var disabledX = localStorage.getItem("disabledX");
    var disabledY = localStorage.getItem("disabledY");
    var disabledT = localStorage.getItem("disabledT");
    disabledX = disabledX ? JSON.parse(disabledX) : [];
    disabledY = disabledY ? JSON.parse(disabledY) : [];
    disabledT = disabledT ? JSON.parse(disabledT) : [];
    if (disabledY[i] || disabledX[j] || false) return "0.2";
    if (disabledT[0] && j > 0 && i > 0 && j > i) return "0.2";
    return "1.0";
}

function show(state) {
    if (state == 1) {
        var pin = prompt("Inserisci il PIN", "");
        if (pin == "1234") {
            document.getElementById("bGioca").style.display = "inline";
            document.getElementById("gioca").style.display = "none";
            document.getElementById("bRisultati").style.display = "none";
            document.getElementById("risultati").style.display = "inline";
            updateTab();
        }
    } else {
        document.getElementById("bGioca").style.display = "none";
        document.getElementById("gioca").style.display = "inline";
        document.getElementById("bRisultati").style.display = "inline";
        document.getElementById("risultati").style.display = "none";
        nextOperazione();
        document.getElementById("smile").innerHTML = "";
    }
}

function updateTab() {
    var tab = "<table><tr><th></th>"
    for (var j = 1; j <= size; j++) {
        tab += "<th onclick='toggleNumX(" + j + ")' style='opacity:" + alpha(0, j) + "'>" + j + "</th>"
    }
    tab += "</tr>"
    for (var i = 1; i <= size; i++) {
        tab += "<tr><th onclick='toggleNumY(" + i + ")' style='opacity:" + alpha(i, 0) + "'>" + i + "</th>"
        for (var j = 1; j <= size; j++) {
            var d = timeLog[i] ? timeLog[i][j] || { count: 0, right: 0, time: 0, seq: 0 } : { count: 0, right: 0, time: 0, seq: 0 };
            tab += "<td style='opacity:" + alpha(i, j) + "; background-color: " + color(d) + "' title='" + d.right + "/" + d.count + " (" + d.time + " ms) [" + d.seq.toString(2).replace(/0/g, '_').replace(/1/g, '*') + "]'>" + i * j + "</td>"
        }
        tab += "</tr>"
    }
    tab += "</table>"
    document.getElementById("risTable").innerHTML = tab;
}

function nextOperazione() {
    var operazioneShort = " x "
    var operazioneLong = " per "
    if (!isLuca) {
        var operazioneShort = " + "
        var operazioneLong = " più "
    }

    document.getElementById("game").classList.remove("right");
    document.getElementById("game").classList.remove("wrong");
    hadHint = false;
    var i = 0;

    do {
        i++;
        num1 = Math.floor(Math.random() * size) + 1;
    } while (alpha(num1, 0) != "1.0" && i < 100)
    i = 0;
    do {
        i++;
        num2 = Math.floor(Math.random() * size) + 1;
    } while (alpha(num1, num2) != "1.0" && i < 100)
    ris = 0;
    blocco = document.getElementById("operazione");
    blocco.innerHTML = num1 + operazioneShort + num2;
    document.getElementById("risultato").innerHTML = "?";
    document.getElementById("hint").innerHTML = "";
    var risultato = (1000000 + num1 * num2).toString().substr(5, 2);
    if (!isLuca) risultato = (1000000 + num1 + num2).toString().substr(5, 2);
    //hintTimer = setTimeout('document.getElementById("hint").innerHTML="' + risultato.substr(0,1) + '?"', 10000);
    //hintTimer2 = setTimeout('document.getElementById("hint").innerHTML="' + risultato + '"', 20000);
    timer = (new Date()).getTime();
    keybDisabled = false;
    if (speak) {
        if (Math.random() > .5) {
            say(num1 + operazioneLong + num2, true)
        } else {
            say(num2 + operazioneLong + num1, true)
        }
    }
}

function logTime(isRight) {
    clearTimeout(hintTimer);
    clearTimeout(hintTimer2);
    time = (new Date()).getTime() - timer;
    if (!timeLog[num1]) timeLog[num1] = [];
    if (!timeLog[num1][num2]) {
        timeLog[num1][num2] = {
            time: time,
            count: 1,
            right: isRight ? 1 : 0,
            seq: isRight ? 1 : 0
        }
    } else {
        timeLog[num1][num2].time = time;
        timeLog[num1][num2].count++;
        timeLog[num1][num2].right += isRight ? 1 : 0;
        timeLog[num1][num2].seq = ((timeLog[num1][num2].seq & (2 ** 30 - 1)) << 1) + (isRight ? 1 : 0);
    }
    localStorage.setItem("timeLog", JSON.stringify(timeLog))
    return time;
}

function addDigit(newDigit) {
    var calc = num1 * num2
    if (!isLuca) calc = num1 + num2
    if (keybDisabled) return;
    if (newDigit == "C") {
        ris = 0;
        parziale = "?";
    } else if (newDigit == "H") {
        var risultato = (1000000 + calc).toString().substr(5, 2);
        document.getElementById("hint").innerHTML = Math.random() <= 0.5 ? risultato.substr(0, 1) + '?' : '?' + risultato.substr(1, 1);
        ris = 0;
        parziale = "?";
        hadHint = true;
    } else {
        parziale = document.getElementById("risultato").innerHTML;
        if (parziale == "?") {
            parziale = "";
            ris = 0;
        }
        ris = ris * 10 + newDigit;
        parziale = ris;
    }
    document.getElementById("risultato").innerHTML = parziale;
    if (ris == (calc)) {
        //Giusto
        say(complimenti(), false)
        time = logTime(true);
        keybDisabled = true;
        setTimeout(nextOperazione, 3000);
        if (!hadHint) document.getElementById("smile").innerHTML += "<img src='piena.png'>";
        document.getElementById("game").classList.add("right");
    } else if (ris.toString().length >= (calc).toString().length) {
        //Sbagliato
        say(insulto() + "!!! " + num1 + " per " + num2 + " fa " + calc + "!!!", false)
        time = logTime(false);
        keybDisabled = true;
        setTimeout(nextOperazione, 8000);
        //document.getElementById("smile").innerHTML += "<img src='vuota.png'>";
        document.getElementById("game").classList.add("wrong");
    }
}

nextOperazione()

function changeOwner() {
    isLuca = !isLuca
    if (isLuca) {
        document.getElementById("titolo").innerHTML = "LE TABELLINE";
    } else {
        document.getElementById("titolo").innerHTML = "LE SOMME";
    }
    nextOperazione()
}

