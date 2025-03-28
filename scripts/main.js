let autoInterval = null; 

function sendRequest() {
    const url = document.getElementById("url").value;
    const method = document.getElementById("method").value;
    const accessToken = document.getElementById("accessToken").value;

    const bodyMethod = document.querySelector('input[name="bodyMethod"]:checked').value;
    let requestBody = {};

    if (bodyMethod === 'json') {
        try {
            requestBody = JSON.parse(document.getElementById("body").value);
        } catch (e) {
            alert("JSON inválido. Por favor, verifique sua entrada.");
            return;
        }
    } else if (bodyMethod === 'keyValue') {
        requestBody = getKeyValueRequestBody();
    }

    console.log("Enviando requisição:", { url, method, body: requestBody });

    const headers = {};
    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }
    if (method !== "GET") {
        headers["Content-Type"] = "application/json";
    }

    fetch(url, {
        method,
        headers,
        body: method !== "GET" ? JSON.stringify(requestBody) : null
    })
    .then(async response => {
        let responseBody;
        try {
            responseBody = await response.json();
        } catch {
            responseBody = await response.text();
        }

        const requestData = {
            url,
            method,
            accessToken,
            body: requestBody,
            status: response.status,
            response: responseBody
        };

        saveToHistory(requestData);
        extractAndSetAccessToken(responseBody);

        if (!response.ok) {
            throw requestData;
        }
        return responseBody;
    })
    .then(data => {
        document.getElementById("response").textContent = JSON.stringify(data, null, 4);
    })
    .catch(error => {
        console.error("Erro ao fazer a requisição:", error);
        document.getElementById("response").textContent = 
            `Erro HTTP: ${error.status || "Desconhecido"}\nMensagem: ${typeof error.response === 'object' ? JSON.stringify(error.response, null, 4) : error.response}`;
    });

    play();
}

function play() {
    const autoEnabled = document.getElementById("autoToggle").checked;
    const intervalo = parseInt(document.getElementById("intervalo").value, 10) * 1000;
    const dataTermino = new Date(document.getElementById("data-auto-termino").value).getTime();
    
    if (autoEnabled && intervalo > 0 && dataTermino > Date.now()) {
        if (autoInterval) clearInterval(autoInterval); // Evita múltiplos loops simultâneos
        
        autoInterval = setInterval(() => {
            if (Date.now() >= dataTermino) {
                clearInterval(autoInterval);
                alert("Automação encerrada.");
                return;
            }
            sendRequest();
        }, intervalo);
    } else {
        if (autoInterval) clearInterval(autoInterval); // Para a automação caso desativada
    }
}

function extractAndSetAccessToken(responseBody) {
    if (typeof responseBody === 'object') {
        const tokenKeys = ['access_token', 'accesstoken', 'token', 'authToken', 'accessToken'];
        for (let key of tokenKeys) {
            if (responseBody[key]) {
                document.getElementById("accessToken").value = responseBody[key];
                break;
            }
        }
    }
}

function getKeyValueRequestBody() {
    const pairs = document.querySelectorAll("#keyValuePairs .form-row");
    let bodyObj = {};
    pairs.forEach(row => {
        const keyInput = row.querySelector("input[placeholder='Key']");
        const valueInput = row.querySelector("input[placeholder='Value']");
        if (keyInput && keyInput.value.trim() !== "") {
            bodyObj[keyInput.value.trim()] = valueInput ? valueInput.value.trim() : "";
        }
    });
    return bodyObj;
}

function saveToHistory(requestData) {
    let history = JSON.parse(localStorage.getItem("requestHistory")) || [];
    history.unshift(requestData);
    localStorage.setItem("requestHistory", JSON.stringify(history.slice(0, 25))); // salve as ultimas 25 requisicoes
    loadHistory();
}

function loadHistory() {
    let history = JSON.parse(localStorage.getItem("requestHistory")) || [];
    let historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    history.forEach((item) => {
        let li = document.createElement("li");
        li.className = "pb-1 historyList";
        li.innerHTML = `<span class="${item.status >= 400 ? 'dangerRequest' : 'sucessRequest'}">[${item.status}]</span> ${item.method} - ${item.url}`;
        li.onclick = () => loadRequestFromHistory(item);
        historyList.appendChild(li);
    });
}


function loadRequestFromHistory(item) {
    document.getElementById("url").value = item.url;
    document.getElementById("method").value = item.method;
    document.getElementById("response").value = item.response || "";
    document.getElementById("accessToken").value = item.accessToken || "";
    if (item.body) {
        document.getElementById("body").value = JSON.stringify(item.body, null, 2);
    }
}

function clearHistory() {
    localStorage.removeItem("requestHistory");
    loadHistory();
}

window.onload = loadHistory;

function importar(){

}

function exportar() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = 1000;

    const modal = document.createElement("div");
    modal.style.backgroundColor = "#fff";
    modal.style.padding = "20px";
    modal.style.borderRadius = "8px";
    modal.style.textAlign = "center";
    modal.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
    modal.innerHTML = `<h3>Escolha o que deseja exportar:</h3>`;

    const btnHistorico = document.createElement("button");
    btnHistorico.textContent = "Histórico";
    btnHistorico.style.margin = "10px";
    btnHistorico.onclick = function() {
        exportarHistorico();
        document.body.removeChild(overlay);
    };

    const btnRespostaAPI = document.createElement("button");
    btnRespostaAPI.textContent = "Resposta API";
    btnRespostaAPI.style.margin = "10px";
    btnRespostaAPI.onclick = function() {
        exportarRespostaAPI();
        document.body.removeChild(overlay);
    };

    modal.appendChild(btnHistorico);
    modal.appendChild(btnRespostaAPI);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function exportarHistorico() {
    const history = JSON.parse(localStorage.getItem("requestHistory")) || [];
    salvarArquivo(history, "requestHistory.json");
}

function exportarRespostaAPI() {
    const requisicaoCorrente = {
        url: document.getElementById("url").value,
        method: document.getElementById("method").value,
        response: document.getElementById("response").value,
        accessToken: document.getElementById("accessToken").value
    };
    salvarArquivo(requisicaoCorrente, "requisicaoAtual.json");
}

function salvarArquivo(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}