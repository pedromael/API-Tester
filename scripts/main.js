function sendRequest() {
    const url = document.getElementById("url").value;
    const method = document.getElementById("method").value;
    const accessToken = document.getElementById("accessToken").value;

    // Determina qual método de entrada foi selecionado
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

    // Define cabeçalhos
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
            responseBody = await response.json(); // Tenta converter a resposta em JSON
        } catch {
            responseBody = await response.text(); // Caso não seja JSON, pega como texto
        }

        const requestData = {
            url,
            method,
            accessToken,
            body: requestBody,
            status: response.status,
            response: responseBody
        };

        saveToHistory(requestData); // Salva a requisição no histórico

        if (!response.ok) {
            throw requestData; // Lança o erro para ser tratado no catch
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
}

// Coleta os dados dos pares key-value e constrói o objeto JSON
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

// Salva requisições (sucesso ou erro) no histórico
function saveToHistory(requestData) {
    let history = JSON.parse(localStorage.getItem("requestHistory")) || [];
    history.unshift(requestData);
    localStorage.setItem("requestHistory", JSON.stringify(history.slice(0, 10))); // Mantém os últimos 10
    loadHistory();
}

// Carrega o histórico no frontend
function loadHistory() {
    let history = JSON.parse(localStorage.getItem("requestHistory")) || [];
    let historyList = document.getElementById("historyList");
    historyList.innerHTML = "";
    history.forEach((item, index) => {
        let li = document.createElement("li");
        li.className = `list-group-item ${item.status >= 400 ? 'list-group-item-danger' : 'list-group-item-success'}`;
        li.textContent = `[${item.status}] ${item.method} - ${item.url}`;
        li.onclick = () => loadRequestFromHistory(item);
        historyList.appendChild(li);
    });
}

// Carrega uma requisição do histórico para os campos do formulário
function loadRequestFromHistory(item) {
    document.getElementById("url").value = item.url;
    document.getElementById("method").value = item.method;
    document.getElementById("response").value = item.response || "";
    document.getElementById("accessToken").value = item.accessToken || "";
    if (item.body) {
        document.getElementById("body").value = JSON.stringify(item.body, null, 2);
    }
}

// Limpa o histórico de requisições
function clearHistory() {
    localStorage.removeItem("requestHistory");
    loadHistory();
}

// Carregar histórico ao iniciar a página
window.onload = loadHistory;
