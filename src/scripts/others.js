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
// Ao clicar em “Add Field”, adiciona uma nova linha de key-value
document.getElementById("addField").addEventListener("click", () => {
  const keyValuePairs = document.getElementById("keyValuePairs");

  // Cria a div.row com espaçamento (g-2) e alinhamento
  const row = document.createElement("div");
  row.className = "row g-2 align-items-center mb-2";
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

// Delegação para remover uma linha inteira de key-value
document.getElementById("keyValuePairs").addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-field")) {
    const keyValuePairs = document.getElementById("keyValuePairs");
    const allRows = keyValuePairs.querySelectorAll(".row");

    if (allRows.length > 1) {
      // Remove a <div class="row"> pai do botão clicado
      e.target.closest(".row").remove();
    } else {
      // Se for o único, apenas limpa os inputs
      const inputs = allRows[0].querySelectorAll("input");
      inputs.forEach(input => input.value = "");
    }
  }
});


function clearResponse() {
    document.getElementById("response").textContent = "";
}