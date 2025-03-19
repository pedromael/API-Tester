function sendRequest() {
    const url = document.getElementById("url").value;
    const method = document.getElementById("method").value;
    const accessToken = document.getElementById("accessToken").value;
    
    // Determina qual método de entrada foi selecionado
    const bodyMethod = $('input[name="bodyMethod"]:checked').val();
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

    // Define cabeçalhos apenas se necessário
    const headers = {};
    if(accessToken){
        headers["Authorization"] = `Bearer ${accessToken}`;
    }
    if (method !== "GET" && bodyMethod === "json") {
        headers["Content-Type"] = "application/json";
    }else{
        headers["Content-Type"] = "application/json";
    }

    fetch(url, {
        method,
        headers,
        body: method !== "GET" ? JSON.stringify(requestBody) : null
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json().catch(() => response.text()); // Evita erro se a resposta não for JSON
    })
    .then(data => {
        document.getElementById("response").textContent = JSON.stringify(data, null, 4);
    })
    .catch(error => {
        console.error("Erro ao fazer a requisição:", error);
        document.getElementById("response").textContent = "Erro ao fazer a requisição: " + error.message;
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

