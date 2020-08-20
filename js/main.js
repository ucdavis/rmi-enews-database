MyApp = {};
MyApp.spreadsheetData = [];
MyApp.headerData = [
    { title: "Issue", type: "num", orderable: true }, { title: "Season/Month" }, { title: "Year" }
];

String.prototype.trunc = function (n) {
    return this.substr(0, n - 1) + (this.length > n ? '&hellip;' : '');
};

$(function () {
    var url = "https://spreadsheets.google.com/feeds/list/13bx652Db6aedLm5XTp9iDKGaDRYeqYdeXZdHNYXLsE8/1/public/values?alt=json-in-script&callback=?";
    $.getJSON(url, {}, function (data) {
        console.log(data)
        $.each(data.feed.entry, function (key, val) {
            var year = val.gsx$year.$t;
            var date = val.gsx$seasonmonth.$t;

            MyApp.spreadsheetData.push(
                [
                    GenerateTitleColumn(val), date, year
                ]);
        });

        createDataTable();
        addFilters();
        abstractPopup();
    });
})

function GenerateTitleColumn(entry) { //entry value from spreadsheet
    var title = entry.gsx$issue.$t;
    var link = entry.gsx$linksto.$t;

    return "<a href='" + link + "'>" + title + "</a>";
}

function abstractPopup() {
    $("#spreadsheet").popover({
        selector: '.abstract-popover',
        trigger: 'hover'
    });
}

function addFilters(){
    var $filter = $("#filter_elements");
    
    $.each(MyApp.keywords, function (key, val) {
        $filter.append('<li><label><input type="checkbox" name="' + val + '"> ' + val + '</label></li>');
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

        console.log(filterRegex);
        MyApp.oTable.fnFilter(filterRegex, 4, true, false);
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
            filters += " + "
        }
        filters += "<strong>" + this.name + "</strong>";
    });

    if (filters.length !== 0) {
        var alert = $("<div class='alert alert-info'><strong>Filters</strong><p>You are filtering on " + filters + "</p></div>")

        $filterAlert.html(alert);
        $filterAlert[0].scrollIntoView(true);
    } else {
        $filterAlert.html(null);
    }
}

function createDataTable() {
    MyApp.oTable = $("#spreadsheet").DataTable({
        "iDisplayLength": 20,
        lengthChange: false,
        data: MyApp.spreadsheetData,
        columns: MyApp.headerData
    });
}
