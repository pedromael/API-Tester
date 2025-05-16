// Alterna entre os métodos de entrada do Request Body
$('input[name="bodyMethod"]').on('change', function() {
    if ($(this).val() === 'json') {
    $('#jsonTextBody').show();
    $('#keyValueBody').hide();
    } else {
    $('#jsonTextBody').hide();
    $('#keyValueBody').show();
    }
});

// Adiciona uma nova linha de key-value
document.getElementById("addField").addEventListener("click", function() {
    const keyValuePairs = document.getElementById("keyValuePairs");
    const row = document.createElement("div");
    row.classList.add("form-row", "align-items-center", "mb-2");
    row.innerHTML = `
    <div class="col">
        <input type="text" class="form-control" placeholder="Key">
    </div>
    <div class="col">
        <input type="text" class="form-control" placeholder="Value">
    </div>
    <div class="col-auto">
        <button class="btn btn-danger remove-field" type="button">&times;</button>
    </div>
    `;
    keyValuePairs.appendChild(row);
});

// Remove uma linha de key-value
document.getElementById("keyValuePairs").addEventListener("click", function(e) {
    if (e.target && e.target.matches("button.remove-field")) {
    const rows = document.querySelectorAll("#keyValuePairs .form-row");
    if (rows.length > 1) {
        e.target.closest(".form-row").remove();
    } else {
        const keyInput = e.target.closest(".form-row").querySelector("input[placeholder='Key']");
        const valueInput = e.target.closest(".form-row").querySelector("input[placeholder='Value']");
        keyInput.value = "";
        valueInput.value = "";
    }
    }
});

function clearResponse() {
    document.getElementById("response").textContent = "";
}