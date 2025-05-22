$(document).ready(function () {
  // Alterna entre JSON e Key-Value dinamicamente
  $(document).on("change", "input[type=radio][name^='bodyMethod-']", function () {
    const index = $(this).attr("name").split("-")[1];
    const value = $(this).val();

    if (value === "json") {
      $(`#jsonTextBody-${index}`).show();
      $(`#keyValueBody-${index}`).hide();
    } else {
      $(`#jsonTextBody-${index}`).hide();
      $(`#keyValueBody-${index}`).show();
    }
  });

  // Adiciona campo de key-value
  $(document).on("click", ".add-field-btn", function () {
    const index = $(this).data("index");
    const container = $(`#keyValuePairs-${index}`);

    const row = $(`
      <div class="row g-2 align-items-center mb-2">
        <div class="col">
          <input type="text" class="form-control" placeholder="Key">
        </div>
        <div class="col">
          <input type="text" class="form-control" placeholder="Value">
        </div>
        <div class="col-auto">
          <button class="btn btn-danger remove-field" type="button">&times;</button>
        </div>
      </div>
    `);

    container.append(row);
  });

  // Remove campo de key-value
  $(document).on("click", ".remove-field", function () {
    const row = $(this).closest(".row");
    const container = row.parent();
    const allRows = container.find(".row");

    if (allRows.length > 1) {
      row.remove();
    } else {
      allRows.find("input").val("");
    }
  });
});