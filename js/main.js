MyApp = {};
MyApp.spreadsheetData = [];
MyApp.years = [];
MyApp.headerData = [
  { title: "Issue" },
  { title: "Season/Month" },
  { title: "Year" },
];

String.prototype.trunc = function (n) {
  return this.substr(0, n - 1) + (this.length > n ? "&hellip;" : "");
};

$(function () {
  var url =
    "https://sheets.googleapis.com/v4/spreadsheets/13bx652Db6aedLm5XTp9iDKGaDRYeqYdeXZdHNYXLsE8/values/Individual_Research?key=AIzaSyA3dk7j-VOX78HlLFqsOEHNL5rDljrMtIA";
  $.getJSON(url, {}, function (data) {
    for (let i = 1; i < data["values"].length; i++) {
      const currRow = data["values"][i];

      var year = currRow[1];
      var date = currRow[2];
      MyApp.years.push(year);

      MyApp.spreadsheetData.push([GenerateTitleColumn(year, date)]);
    }

    MyApp.years = [...new Set(MyApp.years)].sort((a, b) => a < b);

    createDataTable();
    addFilters();
    abstractPopup();
  });
});

function GenerateTitleColumn(link, title) {
  return "<a href='" + link + "'>" + title + "</a>";
}

function abstractPopup() {
  $("#spreadsheet").popover({
    selector: ".abstract-popover",
    trigger: "hover",
  });
}

function addFilters() {
  var $filter = $("#filter_elements");

  $.each(MyApp.years, function (key, val) {
    $filter.append(
      '<li><label><input type="checkbox" name="' +
        val +
        '"> ' +
        val +
        "</label></li>"
    );
  });

  $filter.on("change", function (e) {
    e.preventDefault();
    var selected = this.name;

    var filterRegex = "";
    var filters = [];

    $("input:checkbox", this).each(function (key, val) {
      if (val.checked) {
        if (filterRegex.length !== 0) {
          filterRegex += "|";
        }

        filterRegex += "(^" + val.name + "$)"; //Use the hat and dollar to require an exact match
      }
    });

    MyApp.oTable.column(2).search(filterRegex, true).draw();
    displayCurrentFilters();
  });

  $("#clearfilters").click(function (e) {
    e.preventDefault();

    $(":checkbox", $filter).each(function () {
      this.checked = false;
    });

    $filter.change();
  });
}

function displayCurrentFilters() {
  var $filterAlert = $("#filters");

  var filters = "";

  $(":checked", "#filter_elements").each(function () {
    if (filters.length !== 0) {
      filters += " + ";
    }
    filters += "<strong>" + this.name + "</strong>";
  });

  if (filters.length !== 0) {
    var alert = $(
      "<div class='alert alert-info'><strong>Filters</strong><p>You are filtering on " +
        filters +
        "</p></div>"
    );

    $filterAlert.html(alert);
    $filterAlert[0].scrollIntoView(true);
  } else {
    $filterAlert.html(null);
  }
}

function createDataTable() {
  MyApp.oTable = $("#spreadsheet").DataTable({
    iDisplayLength: 20,
    lengthChange: false,
    data: MyApp.spreadsheetData,
    columns: MyApp.headerData,
    columnDefs: [{ orderData: [0], targets: 2 }],
    order: [[0, "desc"]],
  });
}
