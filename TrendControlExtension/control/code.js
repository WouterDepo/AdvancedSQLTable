// ============================================
// TREND CONFIGURATION TABLE
// VERSION: 8.3.0 - DARK MODE + SHOW ALL TAGS
// ============================================

var trendTable = null;
var availableVariables = [];
var trendData = [];
var tabulatorLoadRetries = 0;
var maxRetries = 10;

// Autocomplete state
var autocompleteSelectedIndex = -1;
var autocompleteFilteredResults = [];

// ✅ Color palette
var trendColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FF8000', '#8000FF',
    '#FF0080', '#00FF80', '#FF4040', '#40FF40',
    '#4040FF', '#FFFF40', '#FF40FF', '#40FFFF',
    '#FFA040', '#A040FF', '#FF4080', '#40FFA0'
];

var saveTimeout = null;

// ✅ Custom properties storage
var customProperties = {
    AvailableVariablesString: '',
    SavedConfiguration: '',
    CSVFilename: 'TrendConfig',
    DarkMode: false
};

console.log("=============================================");
console.log("  TREND CONFIG TABLE v8.3.0");
console.log("  - Dark Mode Support");
console.log("  - Show All Tags on Focus");
console.log("  - JSON Filename = CSV Filename");
console.log("=============================================");

// ═══════════════════════════════════════════════════════
// 🌙 DARK MODE TOGGLE
// ═══════════════════════════════════════════════════════
function setDarkMode(enabled) {
    console.log('>>> Setting Dark Mode:', enabled);
    
    if (enabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    customProperties.DarkMode = enabled;
}

// ═══════════════════════════════════════════════════════
// 🎨 GET NEXT AVAILABLE COLOR
// ═══════════════════════════════════════════════════════
function getNextAvailableColor() {
    if (!trendTable) {
        return trendColors[0];
    }
    
    var usedColors = trendTable.getData().map(function(row) {
        return row.color;
    });
    
    for (var i = 0; i < trendColors.length; i++) {
        if (usedColors.indexOf(trendColors[i]) === -1) {
            return trendColors[i];
        }
    }
    
    return trendColors[0];
}

// ═══════════════════════════════════════════════════════
// 📄 GET FILENAME (SAME FOR CSV AND JSON)
// ═══════════════════════════════════════════════════════
function getBaseFilename() {
    var filename = 'TrendConfig';
    
    try {
        if (customProperties && customProperties.CSVFilename) {
            filename = customProperties.CSVFilename;
        } else if (typeof Screen !== 'undefined' && Screen.Name) {
            filename = Screen.Name;
        } else {
            var timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            filename = 'TrendConfig_' + timestamp;
        }
    } catch (e) {
        console.log('>>> Could not get filename, using default');
    }
    
    // Sanitize
    filename = filename.replace(/[<>:"/\\|?*]/g, '_');
    
    return filename;
}

// ============================================
// HANDLE PROPERTY CHANGES FROM WINCC
// ============================================
function hideLoadingSpinner() {
    var overlay = document.getElementById('loading-overlay');
    if (overlay) {
        console.log(">>> Hiding loading spinner...");
        overlay.classList.add('hidden');
    }
}

function setProperty(data) {
    console.log(">>> setProperty called");
    console.log(">>> Key:", data.key);
    console.log(">>> Value:", data.value);
    
    customProperties[data.key] = data.value;
    
    if (data.key === "AvailableVariablesString") {
        if (!data.value || data.value.trim() === "" || data.value === "[]") {
            console.warn(">>> WARNING: AvailableVariablesString is empty");
            availableVariables = [];
        } else {
            try {
                availableVariables = JSON.parse(data.value);
                console.log(">>> SUCCESS! Parsed", availableVariables.length, "variables");
            } catch (error) {
                console.error(">>> ERROR parsing AvailableVariablesString:", error);
                availableVariables = [];
            }
        }
        updateStats();
    }
    
    if (data.key === "SavedConfiguration") {
        if (!data.value || data.value.trim() === "" || data.value === "[]") {
            console.log(">>> No saved configuration");
            trendData = [];
        } else {
            try {
                var parsedData = JSON.parse(data.value);
                trendData = parsedData.map(function(item) {
                    return {
                        tagName: item.tagName,
                        visible: item.visible !== undefined ? item.visible : true,
                        color: item.color || getNextAvailableColor(),
                        yAxis: item.yAxis || "Y1"
                    };
                });
                console.log(">>> Loaded", trendData.length, "trends from file");
            } catch (error) {
                console.error(">>> ERROR parsing SavedConfiguration:", error);
                trendData = [];
            }
        }
        
        if (trendTable) {
            trendTable.setData(trendData);
        } else {
            createTrendTable();
        }
        updateStats();
    }
    
    if (data.key === "CSVFilename") {
        console.log('>>> CSVFilename set to:', data.value);
    }
    
    // ✅ DARK MODE PROPERTY
    if (data.key === "DarkMode") {
        var isDark = data.value === true || data.value === "true" || data.value === 1;
        setDarkMode(isDark);
    }
}

// ============================================
// Y-AXIS FORMATTER
// ============================================
function yAxisFormatter(cell) {
    var value = cell.getValue() || "Y1";
    var className = value.toLowerCase();
    return '<span class="yaxis-badge ' + className + '">' + value + '</span>';
}

// ============================================
// CREATE TREND TABLE
// ============================================
function createTrendTable() {
    console.log(">>> Creating Trend Configuration Table");
    
    if (typeof Tabulator === 'undefined') {
        console.error("!!! Tabulator not loaded, retrying...");
        if (tabulatorLoadRetries < maxRetries) {
            tabulatorLoadRetries++;
            setTimeout(createTrendTable, 500);
        }
        return;
    }
    
    var container = document.getElementById("trend-table");
    if (!container) {
        console.error("!!! Container #trend-table not found!");
        return;
    }
    
    try {
        trendTable = new Tabulator(container, {
            data: trendData,
            layout: "fitColumns",
            height: "100%",
            selectable: true,
            selectableCheck: function(row) {
                return true;
            },
            placeholder: "Nessun trend configurato. Usa il campo di ricerca sopra per aggiungere variabili.",
            
            columns: [
                {
                    formatter: "rowSelection",
                    titleFormatter: "rowSelection",
                    hozAlign: "center",
                    headerSort: false,
                    width: 40,
                    cellClick: function(e, cell) {
                        cell.getRow().toggleSelect();
                        e.stopPropagation();
                    }
                },
                {
                    title: "Tag",
                    field: "tagName",
                    widthGrow: 3,
                    headerFilter: "input"
                },
                {
                    title: "Vis",
                    field: "visible",
                    width: 70,
                    hozAlign: "center",
                    headerFilter: "select",
                    headerFilterParams: {
                        values: {
                            "": "Tutti",
                            "true": "Visibili",
                            "false": "Nascosti"
                        }
                    },
                    headerFilterFunc: function(headerValue, rowValue) {
                        if (headerValue === "") return true;
                        return String(rowValue) === headerValue;
                    },
                    formatter: function(cell) {
                        var value = cell.getValue();
                        return `
                            <label class="toggle-switch">
                                <input type="checkbox" ${value ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        `;
                    },
                    cellClick: function(e, cell) {
                        if (e.target.type === 'checkbox') {
                            var isChecked = e.target.checked;
                            var rowData = cell.getRow().getData();
                            cell.getRow().update({ visible: isChecked });
                            
                            trendData = trendTable.getData();
                            
                            fireVisibilityChanged(rowData, isChecked);
                            fireConfigurationChanged();
                            updateStats();
                        }
                        e.stopPropagation();
                    }
                },
                {
                    title: "Y-Axis",
                    field: "yAxis",
                    width: 100,
                    hozAlign: "center",
                    editor: "select",
                    editorParams: {
                        values: {
                            "Y1": "Y1",
                            "Y2": "Y2",
                            "Y3": "Y3"
                        }
                    },
                    formatter: yAxisFormatter,
                    headerFilter: "select",
                    headerFilterParams: {
                        values: {
                            "": "Tutti",
                            "Y1": "Y1",
                            "Y2": "Y2",
                            "Y3": "Y3"
                        }
                    },
                    cellEdited: function(cell) {
                        console.log(">>> Y-Axis changed to:", cell.getValue());
                        trendData = trendTable.getData();
                        fireConfigurationChanged();
                    }
                },
                {
                    title: "Colore",
                    field: "color",
                    width: 100,
                    hozAlign: "center",
                    formatter: function(cell) {
                        var color = cell.getValue();
                        return `
                            <div class="color-picker-cell">
                                <div class="color-preview" style="background-color: ${color}"></div>
                                <span class="color-value">${color}</span>
                            </div>
                        `;
                    },
                    cellClick: function(e, cell) {
                        if (e.target.classList.contains('color-preview')) {
                            openColorPicker(cell);
                        }
                        e.stopPropagation();
                    }
                }
            ]
        });
        
        console.log(">>> Trend Table created successfully!");
        setTimeout(hideLoadingSpinner, 300);
        
    } catch (error) {
        console.error("!!! ERROR creating Trend Table:", error);
    }
}

// ============================================
// AUTOCOMPLETE SETUP
// ============================================
function setupAutocomplete() {
    var input = document.getElementById('autocomplete-input');
    var dropdown = document.getElementById('autocomplete-dropdown');
    var clearBtn = document.getElementById('autocomplete-clear');
    
    if (!input || !dropdown) {
        console.error("!!! Autocomplete elements not found!");
        return;
    }
    
    console.log(">>> Setting up autocomplete...");
    
    // ✅ SHOW ALL TAGS ON FOCUS
    input.addEventListener('focus', function(e) {
        if (this.value.trim().length === 0) {
            console.log('>>> Focus detected, showing all available tags');
            showAllAvailableTags();
        }
    });
    
    input.addEventListener('input', function(e) {
        var searchValue = this.value.trim();
        
        if (searchValue.length === 0) {
            // ✅ SHOW ALL WHEN EMPTY
            showAllAvailableTags();
            clearBtn.classList.remove('visible');
            return;
        }
        
        clearBtn.classList.add('visible');
        filterAndShowResults(searchValue);
    });
    
    input.addEventListener('keydown', function(e) {
        if (!dropdown.classList.contains('visible')) {
            return;
        }
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                navigateAutocomplete(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                navigateAutocomplete(-1);
                break;
            case 'Enter':
                e.preventDefault();
                selectCurrentAutocomplete();
                break;
            case 'Escape':
                e.preventDefault();
                hideAutocomplete();
                input.blur();
                break;
        }
    });
    
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            input.value = '';
            input.focus();
            showAllAvailableTags(); // ✅ Show all after clear
            clearBtn.classList.remove('visible');
        });
    }
    
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            hideAutocomplete();
        }
    });
    
    console.log(">>> Autocomplete setup complete!");
}

// ═══════════════════════════════════════════════════════
// ✅ SHOW ALL AVAILABLE TAGS (NEW FUNCTION)
// ═══════════════════════════════════════════════════════
function showAllAvailableTags() {
    if (availableVariables.length === 0) {
        console.warn(">>> No variables available");
        showNoVariablesMessage();
        return;
    }
    
    // Filter out already added tags
    autocompleteFilteredResults = availableVariables.filter(function(variable) {
        var alreadyAdded = trendData.some(function(trend) {
            return trend.tagName === variable.tagName;
        });
        return !alreadyAdded;
    });
    
    // Sort alphabetically
    autocompleteFilteredResults.sort(function(a, b) {
        return a.tagName.localeCompare(b.tagName);
    });
    
    console.log('>>> Showing all available tags:', autocompleteFilteredResults.length);
    
    renderAutocompleteResults();
    
    if (autocompleteFilteredResults.length > 0) {
        showAutocomplete();
        autocompleteSelectedIndex = 0;
        highlightAutocompleteItem(0);
    } else {
        showNoResults();
    }
}

// ============================================
// FILTER AND SHOW AUTOCOMPLETE RESULTS
// ============================================
function filterAndShowResults(searchValue) {
    if (availableVariables.length === 0) {
        console.warn(">>> ⚠️ availableVariables is EMPTY!");
        showNoVariablesMessage();
        return;
    }
    
    var searchLower = searchValue.toLowerCase();
    
    autocompleteFilteredResults = availableVariables.filter(function(variable) {
        var alreadyAdded = trendData.some(function(trend) {
            return trend.tagName === variable.tagName;
        });
        
        if (alreadyAdded) {
            return false;
        }
        
        var matches = variable.tagName.toLowerCase().indexOf(searchLower) !== -1;
        return matches;
    });
    
    autocompleteFilteredResults.sort(function(a, b) {
        var aTag = a.tagName.toLowerCase();
        var bTag = b.tagName.toLowerCase();
        
        if (aTag === searchLower) return -1;
        if (bTag === searchLower) return 1;
        
        var aStarts = aTag.indexOf(searchLower) === 0;
        var bStarts = bTag.indexOf(searchLower) === 0;
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return aTag.localeCompare(bTag);
    });
    
    if (autocompleteFilteredResults.length > 50) {
        autocompleteFilteredResults = autocompleteFilteredResults.slice(0, 50);
    }
    
    renderAutocompleteResults();
    
    if (autocompleteFilteredResults.length > 0) {
        showAutocomplete();
        autocompleteSelectedIndex = 0;
        highlightAutocompleteItem(0);
    } else {
        showNoResults();
    }
}

// ============================================
// RENDER AUTOCOMPLETE RESULTS
// ============================================
function renderAutocompleteResults() {
    var listContainer = document.getElementById('autocomplete-list');
    var countContainer = document.getElementById('autocomplete-count');
    
    if (!listContainer) {
        console.error("!!! autocomplete-list not found!");
        return;
    }
    
    if (countContainer) {
        var count = autocompleteFilteredResults.length;
        var total = availableVariables.length - trendData.length;
        countContainer.textContent = count + ' risultati trovati su ' + total + ' variabili disponibili';
    }
    
    listContainer.innerHTML = '';
    
    autocompleteFilteredResults.forEach(function(variable, index) {
        var item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.dataset.index = index;
        
        var tagSpan = document.createElement('div');
        tagSpan.className = 'autocomplete-item-tag';
        tagSpan.textContent = variable.tagName;
        
        item.appendChild(tagSpan);
        
        item.addEventListener('click', function() {
            selectAutocompleteItem(index);
        });
        
        item.addEventListener('mouseenter', function() {
            autocompleteSelectedIndex = index;
            highlightAutocompleteItem(index);
        });
        
        listContainer.appendChild(item);
    });
}

// ============================================
// SHOW NO RESULTS
// ============================================
function showNoResults() {
    var listContainer = document.getElementById('autocomplete-list');
    var countContainer = document.getElementById('autocomplete-count');
    
    if (countContainer) {
        countContainer.textContent = 'Nessun risultato trovato';
    }
    
    if (listContainer) {
        listContainer.innerHTML = '<div class="autocomplete-no-results">❌ Nessuna variabile trovata con questo nome.<br>Verifica che il tag esista nell\'elenco delle variabili disponibili.</div>';
    }
    
    showAutocomplete();
}

function showNoVariablesMessage() {
    var listContainer = document.getElementById('autocomplete-list');
    var countContainer = document.getElementById('autocomplete-count');
    
    if (countContainer) {
        countContainer.textContent = '⚠️ Nessuna variabile disponibile';
    }
    
    if (listContainer) {
        listContainer.innerHTML = '<div class="autocomplete-no-results" style="color: #dc3545;">⚠️ <strong>Nessuna variabile disponibile!</strong><br><br>La proprietà <code>AvailableVariablesString</code> è vuota.<br><br>Verifica che il controllo riceva la lista delle variabili da WinCC.</div>';
    }
    
    showAutocomplete();
}

// ============================================
// NAVIGATE / HIGHLIGHT / SCROLL
// ============================================
function navigateAutocomplete(direction) {
    if (autocompleteFilteredResults.length === 0) return;
    
    autocompleteSelectedIndex += direction;
    
    if (autocompleteSelectedIndex < 0) {
        autocompleteSelectedIndex = autocompleteFilteredResults.length - 1;
    } else if (autocompleteSelectedIndex >= autocompleteFilteredResults.length) {
        autocompleteSelectedIndex = 0;
    }
    
    highlightAutocompleteItem(autocompleteSelectedIndex);
    scrollToAutocompleteItem(autocompleteSelectedIndex);
}

function highlightAutocompleteItem(index) {
    var items = document.querySelectorAll('.autocomplete-item');
    
    items.forEach(function(item, i) {
        if (i === index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function scrollToAutocompleteItem(index) {
    var dropdown = document.getElementById('autocomplete-dropdown');
    var items = document.querySelectorAll('.autocomplete-item');
    
    if (items[index] && dropdown) {
        var item = items[index];
        var itemTop = item.offsetTop;
        var itemBottom = itemTop + item.offsetHeight;
        var dropdownTop = dropdown.scrollTop;
        var dropdownBottom = dropdownTop + dropdown.clientHeight;
        
        if (itemTop < dropdownTop) {
            dropdown.scrollTop = itemTop;
        } else if (itemBottom > dropdownBottom) {
            dropdown.scrollTop = itemBottom - dropdown.clientHeight;
        }
    }
}

function selectCurrentAutocomplete() {
    if (autocompleteSelectedIndex >= 0 && autocompleteSelectedIndex < autocompleteFilteredResults.length) {
        selectAutocompleteItem(autocompleteSelectedIndex);
    }
}

function selectAutocompleteItem(index) {
    var variable = autocompleteFilteredResults[index];
    
    if (!variable) {
        console.error("!!! Invalid autocomplete index:", index);
        return;
    }
    
    addVariableToTrend(variable);
    
    var input = document.getElementById('autocomplete-input');
    if (input) {
        input.value = '';
        input.focus();
    }
    
    var clearBtn = document.getElementById('autocomplete-clear');
    if (clearBtn) {
        clearBtn.classList.remove('visible');
    }
    
    hideAutocomplete();
}

function showAutocomplete() {
    var dropdown = document.getElementById('autocomplete-dropdown');
    if (dropdown) {
        dropdown.classList.add('visible');
    }
}

function hideAutocomplete() {
    var dropdown = document.getElementById('autocomplete-dropdown');
    if (dropdown) {
        dropdown.classList.remove('visible');
    }
    autocompleteSelectedIndex = -1;
    autocompleteFilteredResults = [];
}

// ============================================
// ADD VARIABLE TO TREND
// ============================================
function addVariableToTrend(varData) {
    if (!trendTable) {
        console.error("!!! Trend table not initialized!");
        return;
    }
    
    var exists = trendData.some(function(trend) {
        return trend.tagName === varData.tagName;
    });
    
    if (exists) {
        alert("⚠️ La variabile '" + varData.tagName + "' è già presente nei trend!");
        return;
    }
    
    var newTrend = {
        tagName: varData.tagName,
        visible: true,
        color: getNextAvailableColor(),
        yAxis: "Y1"
    };
    
    console.log(">>> Adding trend:", newTrend.tagName, "| Y-Axis:", newTrend.yAxis, "| Color:", newTrend.color);
    
    trendTable.addRow(newTrend);
    trendData = trendTable.getData();
    
    fireVariableAdded(newTrend);
    fireConfigurationChanged();
    updateStats();
}

// ============================================
// REMOVE SELECTED TRENDS
// ============================================
function removeSelectedTrends() {
    if (!trendTable) return;
    
    var selectedRows = trendTable.getSelectedRows();
    
    if (selectedRows.length === 0) {
        alert("⚠️ Seleziona almeno un trend da rimuovere!");
        return;
    }
    
    if (!confirm("❓ Rimuovere " + selectedRows.length + " trend selezionati?")) {
        return;
    }
    
    selectedRows.forEach(function(row) {
        var rowData = row.getData();
        fireVariableRemoved(rowData);
        row.delete();
    });
    
    trendData = trendTable.getData();
    
    fireConfigurationChanged();
    updateStats();
}

// ============================================
// CLEAR ALL TRENDS
// ============================================
function clearAllTrends() {
    if (!trendTable) return;
    
    if (trendData.length === 0) {
        alert("⚠️ Nessun trend da cancellare!");
        return;
    }
    
    if (!confirm("❓ Cancellare tutti i " + trendData.length + " trend configurati?")) {
        return;
    }
    
    trendData = [];
    trendTable.setData(trendData);
    fireConfigurationChanged();
    updateStats();
}

// ============================================
// OPEN COLOR PICKER
// ============================================
function openColorPicker(cell) {
    var currentColor = cell.getValue();
    
    var colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = currentColor;
    colorInput.style.position = 'absolute';
    colorInput.style.left = '-9999px';
    
    document.body.appendChild(colorInput);
    
    colorInput.addEventListener('change', function() {
        var newColor = this.value.toUpperCase();
        cell.getRow().update({ color: newColor });
        
        trendData = trendTable.getData();
        fireConfigurationChanged();
        
        document.body.removeChild(colorInput);
    });
    
    colorInput.addEventListener('blur', function() {
        setTimeout(function() {
            if (document.body.contains(colorInput)) {
                document.body.removeChild(colorInput);
            }
        }, 100);
    });
    
    colorInput.click();
}

// ============================================
// CSV EXPORT
// ============================================
function exportCSV() {
    if (!trendTable) {
        alert("⚠️ Tabella non inizializzata!");
        return;
    }
    
    var filename = getBaseFilename() + '.csv';
    
    console.log('>>> Exporting to CSV:', filename);
    
    trendTable.download("csv", filename, {
        delimiter: ";"
    });
}

// ============================================
// CSV IMPORT
// ============================================
function importCSV() {
    var fileInput = document.getElementById('csv-file-input');
    if (fileInput) {
        fileInput.click();
    }
}

function handleCSVImport(event) {
    var file = event.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    
    reader.onload = function(e) {
        var csv = e.target.result;
        
        try {
            var lines = csv.split('\n');
            var importedData = [];
            
            for (var i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                
                var values = lines[i].split(';');
                
                var row = {
                    tagName: values[0] || "",
                    visible: values[1] === "true" || values[1] === "1",
                    color: values[2] || getNextAvailableColor(),
                    yAxis: values[3] || "Y1"
                };
                
                importedData.push(row);
            }
            
            if (confirm("❓ Importare " + importedData.length + " trend?\n\nQuesta operazione sostituirà i dati esistenti.")) {
                trendData = importedData;
                trendTable.setData(trendData);
                fireConfigurationChanged();
                updateStats();
            }
            
        } catch (error) {
            console.error(">>> ❌ Error parsing CSV:", error);
            alert("❌ Errore durante l'importazione del CSV:\n" + error.message);
        }
        
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// ============================================
// UPDATE STATS
// ============================================
function updateStats() {
    var availableCount = availableVariables.length;
    var trendCount = trendData.length;
    var visibleCount = trendData.filter(function(t) { return t.visible === true; }).length;
    
    var el1 = document.getElementById('available-count');
    var el2 = document.getElementById('trend-count');
    var el3 = document.getElementById('visible-count');
    
    if (el1) el1.textContent = availableCount;
    if (el2) el2.textContent = trendCount;
    if (el3) el3.textContent = visibleCount;
}

// ============================================
// FIRE EVENTS
// ============================================
function fireVisibilityChanged(rowData, isVisible) {
    var eventData = {
        tagName: rowData.tagName,
        visible: isVisible
    };
    
    var jsonString = JSON.stringify(eventData);
    
    if (typeof WebCC !== 'undefined' && WebCC.Events && WebCC.Events.fire) {
        try {
            WebCC.Events.fire("VisibilityChanged", jsonString);
        } catch (error) {
            console.error(">>> ❌ Error firing VisibilityChanged:", error);
        }
    }
}

function fireConfigurationChanged() {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    
    saveTimeout = setTimeout(function() {
        if (!trendTable) {
            console.warn(">>> Cannot fire ConfigurationChanged: table not initialized");
            return;
        }
        
        var allData = trendTable.getData();
        var jsonString = JSON.stringify(allData);
        
        console.log(">>> ═══════════════════════════════════════");
        console.log(">>> 🔥 Firing ConfigurationChanged");
        console.log(">>> Total items:", allData.length);
        
        if (typeof WebCC !== 'undefined' && WebCC.Events && WebCC.Events.fire) {
            try {
                WebCC.Events.fire("ConfigurationChanged", jsonString);
                console.log(">>> ✅ ConfigurationChanged fired successfully!");
            } catch (error) {
                console.error(">>> ❌ Error firing ConfigurationChanged:", error);
            }
        } else {
            console.warn(">>> ⚠️ WebCC.Events.fire not available (Design Mode?)");
        }
        
        console.log(">>> ═══════════════════════════════════════");
        
    }, 300);
}

function fireVariableAdded(varData) {
    var jsonString = JSON.stringify(varData);
    
    if (typeof WebCC !== 'undefined' && WebCC.Events && WebCC.Events.fire) {
        try {
            WebCC.Events.fire("VariableAdded", jsonString);
        } catch (error) {
            console.error(">>> ❌ Error firing VariableAdded:", error);
        }
    }
}

function fireVariableRemoved(varData) {
    var jsonString = JSON.stringify(varData);
    
    if (typeof WebCC !== 'undefined' && WebCC.Events && WebCC.Events.fire) {
        try {
            WebCC.Events.fire("VariableRemoved", jsonString);
        } catch (error) {
            console.error(">>> ❌ Error firing VariableRemoved:", error);
        }
    }
}

// ============================================
// WINCC INTEGRATION
// ============================================
function initializeWebCC() {
    console.log("=============================================");
    console.log(">>> 🚀 initializeWebCC() called");
    console.log("=============================================");
    
    if (typeof WebCC === 'undefined') {
        console.warn("!!! ⚠️ WebCC is UNDEFINED - Assuming Design Mode");
        loadTestData();
        return;
    }
    
    try {
        WebCC.start(
            function(result) {
                console.log(">>> ✅ WebCC.start callback executed");
                
                if (result) {
                    console.log(">>> ✅ Connection SUCCESS!");
                    
                    if (WebCC.isDesignMode) {
                        console.log(">>> 🎨 DESIGN MODE");
                        loadTestData();
                    } else {
                        console.log(">>> ▶️ RUNTIME MODE");
                        
                        var availVarsString = WebCC.Properties.AvailableVariablesString;
                        if (availVarsString && availVarsString.trim() !== "" && availVarsString !== "[]") {
                            setProperty({
                                key: "AvailableVariablesString",
                                value: availVarsString
                            });
                        } else {
                            console.warn(">>> ⚠️ AvailableVariablesString is empty!");
                        }
                        
                        var savedConfig = WebCC.Properties.SavedConfiguration;
                        if (savedConfig && savedConfig.trim() !== "" && savedConfig !== "[]") {
                            setProperty({
                                key: "SavedConfiguration",
                                value: savedConfig
                            });
                        } else {
                            trendData = [];
                            createTrendTable();
                        }
                        
                        var csvFilename = WebCC.Properties.CSVFilename;
                        if (csvFilename) {
                            setProperty({
                                key: "CSVFilename",
                                value: csvFilename
                            });
                        }
                        
                        // ✅ LOAD DARK MODE SETTING
                        var darkMode = WebCC.Properties.DarkMode;
                        setProperty({
                            key: "DarkMode",
                            value: darkMode
                        });
                        
                        WebCC.onPropertyChanged.subscribe(setProperty);
                    }
                } else {
                    console.error(">>> ❌ Connection FAILED!");
                    loadTestData();
                }
            },
            {
                properties: {
                    AvailableVariablesString: "[]",
                    SavedConfiguration: "[]",
                    CSVFilename: "TrendConfig",
                    DarkMode: false
                },
                events: ["ConfigurationChanged", "VariableAdded", "VariableRemoved", "VisibilityChanged"]
            },
            10000
        );
        
    } catch (error) {
        console.error("!!! ❌ FATAL ERROR in WebCC.start():", error);
        loadTestData();
    }
}

function loadTestData() {
    console.log(">>> Loading TEST DATA (Design Mode)");
    
    availableVariables = [
        {"tagName": "random1_virg:random1_virg"},
        {"tagName": "random1:random1"},
        {"tagName": "pippo:pippo"},
        {"tagName": "String:String"},
        {"tagName": "Random:Random"},
        {"tagName": "Random(y):Random(y)"},
        {"tagName": "Random(x):Random(x)"},
        {"tagName": "Intero:Intero"},
        {"tagName": "Dati_Grafico_Prova_Spostamento Attuale:Dati_Grafico_Prova_Spostamento Attuale"},
        {"tagName": "Dati_Grafico_Prova_Carico Attuale:Dati_Grafico_Prova_Carico Attuale"},
        {"tagName": "Motor1_Speed:Motor1_Speed"},
        {"tagName": "Motor1_Torque:Motor1_Torque"},
        {"tagName": "Tank1_Level:Tank1_Level"},
        {"tagName": "Tank1_Temperature:Tank1_Temperature"},
        {"tagName": "Pump1_Pressure:Pump1_Pressure"}
    ];
    
    console.log(">>> Loaded", availableVariables.length, "test variables");
    
    trendData = [];
    createTrendTable();
    updateStats();
    
    setTimeout(hideLoadingSpinner, 300);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeWebCC();
        setupAutocomplete();
    });
} else {
    initializeWebCC();
    setupAutocomplete();
}

console.log("=============================================");
console.log("  END OF CODE.JS v8.3.0");
console.log("=============================================");