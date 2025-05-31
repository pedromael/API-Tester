let autoInterval = null; 

function sendRequest(idx) {
    console.log("Enviando requisição para o índice:", idx);
    const url = document.getElementById("url-"+idx).value;
    const method = document.getElementById("method-"+idx).value;
    const accessToken = document.getElementById("accessToken-"+idx).value;

    const bodyMethod = document.querySelector(`input[name="bodyMethod-${idx}"]:checked`).value
    let requestBody = {};

    if (bodyMethod === 'json') {
        try {
            requestBody = JSON.parse(document.getElementById("body-"+idx).value);
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
            idx,
            url,
            method,
            accessToken,
            body: requestBody,
            status: response.status,
            response: responseBody
        };

        saveToHistory(requestData, idx);
        extractAndSetAccessToken(responseBody, idx);

        if (!response.ok) {
            throw requestData;
        }
        return responseBody;
    })
    .then(data => {
        document.getElementById("response-"+idx).textContent = JSON.stringify(data, null, 4);
    })
    .catch(error => {
        console.error("Erro ao fazer a requisição:", error);
        document.getElementById("response-"+idx).textContent = 
            `Erro HTTP: ${error.status || "Desconhecido"}\nMensagem: ${typeof error.response === 'object' ? JSON.stringify(error.response, null, 4) : error.response}`;
    });

    play(idx);
}

function play(idx) {
    const autoEnabled = document.getElementById("autoToggle-"+idx).checked;
    const intervalo = parseInt(document.getElementById("intervalo-"+idx).value, 10) * 1000;
    const dataTermino = new Date(document.getElementById("data-auto-termino-"+idx).value).getTime();
    
    if (autoEnabled && intervalo > 0 && dataTermino > Date.now()) {
        if (autoInterval) clearInterval(autoInterval); // Evita múltiplos loops simultâneos
        
        autoInterval = setInterval(() => {
            if (Date.now() >= dataTermino) {
                clearInterval(autoInterval);
                alert("Automação encerrada.");
                return;
            }
            sendRequest(idx);
        }, intervalo);
    } else {
        if (autoInterval) clearInterval(autoInterval); // Para a automação caso desativada
    }
}

function extractAndSetAccessToken(responseBody, idx) {
    if (typeof responseBody === 'object') {
        const tokenKeys = ['access_token', 'accesstoken', 'token', 'authToken', 'accessToken'];
        for (let key of tokenKeys) {
            if (responseBody[key]) {
                document.getElementById("accessToken-"+idx).value = responseBody[key];
                break;
            }
        }
    }
}

function getKeyValueRequestBody(idx) {
  const rows = document.querySelectorAll("#keyValuePairs-"+idx+" .row");
  let bodyObj = {};

  rows.forEach(row => {
    const keyInput = row.querySelector("input[placeholder='Key']");
    const valueInput = row.querySelector("input[placeholder='Value']");

    if (keyInput && keyInput.value.trim() !== "") {
      bodyObj[keyInput.value.trim()] = valueInput ? valueInput.value.trim() : "";
    }
  });

  return bodyObj;
}

function saveToHistory(requestData, idx) {
    let history = JSON.parse(localStorage.getItem("requestHistory-"+idx)) || [];
    history.unshift(requestData);
    localStorage.setItem("requestHistory-"+idx, JSON.stringify(history.slice(0, 25))); // salve as ultimas 25 requisicoes
    loadHistory(idx);
}

function loadHistory(idx) {
    let history = JSON.parse(localStorage.getItem("requestHistory-"+idx)) || [];
    let historyList = document.getElementById("historyList-"+idx);
    historyList.innerHTML = "";

    history.forEach((item) => {
        let li = document.createElement("li");
        li.className = "pb-1 historyList-"+idx;
        li.innerHTML = `<span class="${item.status >= 400 ? 'dangerRequest' : 'sucessRequest'}">[${item.status}]</span> ${item.method} - ${item.url}`;
        li.onclick = () => loadRequestFromHistory(item, idx);
        historyList.appendChild(li);
    });
}


function loadRequestFromHistory(item, idx) {
    document.getElementById("url-"+idx).value = item.url;
    document.getElementById("method-"+idx).value = item.method;
    document.getElementById("response-"+idx).value = item.response || "";
    document.getElementById("accessToken-"+idx).value = item.accessToken || "";
    if (item.body) {
        document.getElementById("body-"+idx).value = JSON.stringify(item.body, null, 2);
    }
}

function clearHistory(idx) {
    localStorage.removeItem("requestHistory-"+idx);
    loadHistory(idx);
}

function importar() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);

                // Verifica se é um array de histórico
                if (Array.isArray(json)) {
                    localStorage.setItem("requestHistory", JSON.stringify(json.slice(0, 25)));
                    loadHistory();
                    alert("Histórico importado com sucesso!");
                } else if (typeof json === "object") {
                    // Trata como requisição individual
                    loadRequestFromHistory(json);
                    alert("Requisição carregada com sucesso!");
                } else {
                    alert("Formato de arquivo inválido.");
                }
            } catch (err) {
                alert("Erro ao importar: JSON inválido.");
                console.error(err);
            }
        };

        reader.readAsText(file);
    };

    input.click();
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

async function criarNovoWorkspace(novo) {
    let workspaces = JSON.parse(localStorage.getItem('apiTesterWorkspaces')) || [];

    // Determina índice do novo workspace
    const idx = novo ? novo.idx : (workspaces.length > 0 ? workspaces[workspaces.length - 1].idx + 1 : 1);

    // Cria o elemento do slide
    const slide = document.createElement('div');
    slide.classList.add('carousel-item');
    if (workspaces.length === 0 && !novo) slide.classList.add('active');
    slide.dataset.index = idx;
    slide.innerHTML = `<div class="workspace-content p-3">Carregando...</div>`; // placeholder

    // Adiciona ao carousel
    const carouselInner = document.querySelector('#workspaceCarousel .carousel-inner');
    carouselInner.appendChild(slide);

    // adiciona o workspace à lista de indicadores do carrossel com seu idx
    const carouselIndicators = document.querySelector('.carousel-indicators'); 
    const indicator = document.createElement('button');
    indicator.type = 'button';
    indicator.innerText = novo ? novo.name : `Workspace ${idx}`;
    indicator.setAttribute('data-bs-target', '#workspaceCarousel');
    indicator.setAttribute('data-bs-slide-to', idx - 1); // slide-to começa em 0
    indicator.setAttribute('aria-label', `Slide ${idx}`);
    if (workspaces.length === 0 && !novo) {
        indicator.classList.add('active');
        indicator.setAttribute('aria-current', 'true');
    }
    carouselIndicators.appendChild(indicator);

    // Salva workspace na lista e no localStorage
    if (!novo) {
        workspaces.push({
            name: `Workspace ${idx}`,
            idx: idx
        });
        localStorage.setItem('apiTesterWorkspaces', JSON.stringify(workspaces));
    }

    // Carrega conteúdo de workspace.html
    try {
        const response = await fetch('workspace.html');
        const html = await response.text();

        // Ajusta os IDs e funções internas conforme o idx
        const htmlAtualizado = html
            .replace(/-0/g, `-${idx}`)
            .replace(/id="apiForm-0"/g, `id="apiForm-${idx}"`)
            .replace(/copyApiResponse\(0\)/g, `copyApiResponse(${idx})`)
            .replace(/response-0/g, `response-${idx}`)
            .replace(/clearResponse\(0\)/g, `clearResponse(${idx})`)
            .replace(/historyList-0/g, `historyList-${idx}`)
            .replace(/clearHistory\(0\)/g, `clearHistory(${idx})`)
            .replace(/autoToggle-0/g, `autoToggle-${idx}`)
            .replace(/intervalo-0/g, `intervalo-${idx}`)
            .replace(/data-auto-termino-0/g, `data-auto-termino-${idx}`)
            .replace(/keyValuePairs-0/g, `keyValuePairs-${idx}`)
            .replace(/add-field-btn" data-index="0"/g, `add-field-btn" data-index="${idx}"`)
            .replace(/jsonTextBody-0/g, `jsonTextBody-${idx}`)
            .replace(/keyValueBody-0/g, `keyValueBody-${idx}`)
            .replace(/body-0/g, `body-${idx}`)
            .replace(/method-0/g, `method-${idx}`)
            .replace(/url-0/g, `url-${idx}`)
            .replace(/accessToken-0/g, `accessToken-${idx}`)
            .replace(/sendRequest\(0\)/g, `sendRequest(${idx})`)
            .replace(/deleteWorkspace\(0\)/g, `deleteWorkspace(${idx})`);

        slide.innerHTML = `<div class="workspace-content p-3">${htmlAtualizado}</div>`;

        // Carrega histórico (opcional)
        loadHistory(idx);
    } catch (err) {
        slide.innerHTML = `<div class="text-danger p-3">Erro ao carregar workspace.html</div>`;
        console.error('Erro ao carregar workspace:', err);
    }

    // Ativa o novo item do carousel
    const carousel = bootstrap.Carousel.getOrCreateInstance('#workspaceCarousel');
    carousel.to(workspaces.length - 1); // Ou carousel.to(idx - 1), dependendo da lógica
}

function deleteAllWorkspaces() {
    const workspaces = JSON.parse(localStorage.getItem('apiTesterWorkspaces')) || [];
    workspaces.forEach(workspace => {
        const carouselInner = document.querySelector('#workspaceCarousel .carousel-inner');
        const itemToRemove = carouselInner.querySelector(`.carousel-item[data-index="${workspace.idx}"]`);
        if (itemToRemove) {
            carouselInner.removeChild(itemToRemove);
        }
    });

    localStorage.removeItem('apiTesterWorkspaces');
    document.querySelector('.carousel-indicators').innerHTML = '';
    loadHistory(0);
}

function deleteWorkspace(idx) {
    const workspaces = JSON.parse(localStorage.getItem('apiTesterWorkspaces')) || [];
    const updatedWorkspaces = workspaces.filter(workspace => workspace.idx !== idx);
    localStorage.setItem('apiTesterWorkspaces', JSON.stringify(updatedWorkspaces));

    // Remove o workspace do DOM
    const carouselInner = document.querySelector('#workspaceCarousel .carousel-inner');
    const itemToRemove = carouselInner.querySelector(`.carousel-item[data-index="${idx}"]`);
    if (itemToRemove) {
        carouselInner.removeChild(itemToRemove);
    }

    // Remove o indicador do carroceu
    const carouselIndicators = document.querySelector('.carousel-indicators');
    const indicatorToRemove = carouselIndicators.querySelector(`button[data-bs-slide-to="${idx}"]`);
    if (indicatorToRemove) {
        carouselIndicators.removeChild(indicatorToRemove);
    }

    loadHistory(0);
}

function loadWorkspace() {
    const workspaces = JSON.parse(localStorage.getItem("apiTesterWorkspaces")) || [];
    workspaces.forEach((workspace) => {
        criarNovoWorkspace(workspace);
    });
}

window.onload = () => {
    loadHistory(0);
    loadWorkspace();
}
