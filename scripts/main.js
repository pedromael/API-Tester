function sendRequest() {
    const url = document.getElementById("url").value;
    const method = document.getElementById("method").value;
    
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
    
    fetch(url, {
    method: method,
    headers: {
        "Content-Type": "application/json"
    },
    body: method !== "GET" ? JSON.stringify(requestBody) : null
    })
    .then(response => response.json())
    .then(data => {
    document.getElementById("response").textContent = JSON.stringify(data, null, 4);
    })
    .catch(error => {
    document.getElementById("response").textContent = "Erro: " + error;
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