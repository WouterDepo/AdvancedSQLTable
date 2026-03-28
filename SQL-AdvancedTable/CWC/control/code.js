let ArrayData = [];
let columnStyle_ = null;
let tableData_ = null;

const TABLE_SELECTOR = "#example-table";
const DEFAULT_TABLE_HEIGHT = '87%';
const FILTER_ELEMENT_BASE_NAME = "filter-value";
const RESET_FILTER_ELEMENT_NAME = "filter-clear";

//Define variables for input elements
const fieldEl = document.getElementById("filter-field1");
const typeEl = document.getElementById("filter-type1");
const valueEl = document.getElementById("filter-value1");
const fieldEl2 = document.getElementById("filter-field2");
const typeEl2 = document.getElementById("filter-type2");
const valueEl2 = document.getElementById("filter-value2");
const tabuStyleEl = document.getElementById('tabulatorStyle');
const extFilterDiv = document.getElementById('divFilter');

////////////////////////////////////////////
// Initialize the custom control
WebCC.start(
	function (result) {
		if (result) {
			if (WebCC.isDesignMode) {
				ArrayData = JSON.parse("[{\"name\":\"code\",\"salary\":\"7\"},{\"name\":\"name2\",\"salary\":\"42\"}]");
				WebCC.Properties.ColumnStyleString = "[{\"title\":\"Name\", \"field\":\"name\", \"sorter\":\"string\", \"width\":150},{\"title\":\"Salary\", \"field\":\"salary\", \"sorter\":\"number\", \"hozAlign\":\"left\"}]";
				drawTable(true);
			}
			else {
				console.log('[CWC] 🚀 Connected successfully');
				
				// Set current values when CWC shows up
				changeTableStyle(WebCC.Properties.TableStyle);
				
				if (WebCC.Properties.ShowExtFilter) {
					extFilterDiv.style.display = '';
				} else {
					extFilterDiv.style.display = 'none';				
				}
				
				// Subscribe for future value changes
				WebCC.onPropertyChanged.subscribe(checkForDrawing);
			}
		}
		else {
			console.error('[CWC] ❌ Connection failed');
		}
	},
	// contract (same as manifest.json)
	{
		methods: {
			DrawTable: function(columnStyleString, tableDataString){
				console.log('[CWC] 📞 DrawTable method called');
				columnStyle_ = JSON.parse(columnStyleString);
				tableData_ = JSON.parse(tableDataString);
				drawTable(false);
				columnStyle_ = null;
				tableData_ = null;
			},
			SetFilter: function(filters){
				console.log('[CWC] 📞 SetFilter method called');
				const event = new CustomEvent('setFilter', {
					detail : filters,
				});
				document.dispatchEvent(event);
			},
			AddFilter: function(filters){
				console.log('[CWC] 📞 AddFilter method called');
				const event = new CustomEvent('addExtFilter', {
					detail : filters,
				});
				document.dispatchEvent(event);						
			},
			ClearFilter: function(){
				console.log('[CWC] 📞 ClearFilter method called');
				const event = new CustomEvent('resetFilter');
				document.dispatchEvent(event);						
			},
			Download: function(type, filename, option){
				console.log('[CWC] 📞 Download method called');
				const event = new CustomEvent('downloadTable', {
					detail : {
						dtype: type,
						dfilename: filename,
						doption: option
					}
				});
				document.dispatchEvent(event);						
			},
			ChangeStyle: function(style){
				console.log('[CWC] 📞 ChangeStyle method called');
				changeTableStyle(style);									
			},
			
			// ⬅️ ⬅️ ⬅️ NUOVO METODO: ClearTable ⬅️ ⬅️ ⬅️
			ClearTable: function(){
				console.log('[CWC] 📞 ClearTable method called');
				
				try {
					// ⬅️ Trova la tabella esistente
					let oldTable = Tabulator.findTable(TABLE_SELECTOR)[0];
					
					if (oldTable) {
						console.log('[CWC] 🗑️ Destroying existing Tabulator instance...');
						oldTable.destroy();
						console.log('[CWC] ✅ Table destroyed');
					} else {
						console.log('[CWC] ⚠️ No table found to destroy');
					}
					
					// ⬅️ Svuota i dati interni
					ArrayData = [];
					
					// ⬅️ Svuota il contenitore HTML
					const tableContainer = document.querySelector(TABLE_SELECTOR);
					if (tableContainer) {
						tableContainer.innerHTML = '';
						console.log('[CWC] ✅ Table container cleared');
					}
					
					console.log('[CWC] ✅ Table cleared successfully');
					
				} catch (e) {
					console.error('[CWC] ❌ Error in ClearTable:', e);
					console.error('[CWC] ❌ Stack:', e.stack);
				}
			}
		},
		events: ['CellEdited', 'Clicked'],
		properties: {
			TableDataString: " ",
			ColumnStyleString: " ",
			NrEdited: -1,
			RowDataEdited: "0",
			DefFilter: "0",
			ShowExtFilter: 1,
			TableStyle: "./dist/css/tabulator.min.css"					
		}
	},
	[],
	10000
);

////////////////////////////////////////////
// PROPERTY CHANGE HANDLER
////////////////////////////////////////////

/**
 * Handler for property changes - SIMPLIFIED VERSION
 * @param {Object} data - Properties that changed
 * @param {string} data.key - Property name
 * @param {string} data.value - Value
 */
function checkForDrawing(data){
	console.log('[CWC] ✨ Property changed:', data.key);
	console.log('[CWC]    New value length:', (data.value || '').length);
	
	// ⬅️ SEMPRE DESTROY + RICREA quando cambiano dati o colonne
	switch (data.key) {
		case "TableDataString":
			if (data.value) {
				console.log('[CWC] 🔄 TableDataString changed → FULL RESET');
				try {
					ArrayData = JSON.parse(data.value);
					console.log('[CWC] ✅ Data parsed:', ArrayData.length, 'rows');
					drawTable(true);
				} catch (e) {
					console.error('[CWC] ❌ Error parsing TableDataString:', e);
				}
			}
			break;
			
		case "ColumnStyleString":
			if (data.value) {
				console.log('[CWC] 🔄 ColumnStyleString changed → FULL RESET');
				drawTable(true);
			}
			break;
			
		case "TableStyle":
			console.log('[CWC] 🎨 TableStyle changed');
			changeTableStyle(data.value);
			break;
			
		case "ShowExtFilter":
			console.log('[CWC] 👁️ ShowExtFilter changed:', data.value);
			if (data.value == 0) {
				extFilterDiv.style.display = 'none';
			} else {
				extFilterDiv.style.display = '';
			}
			break;
	}
}

////////////////////////////////////////////
// DRAW TABLE - SIMPLIFIED VERSION
////////////////////////////////////////////

function drawTable(triggeredByTag) {
	console.log('[CWC] 🎨 drawTable called, triggeredByTag:', triggeredByTag);
	
	// ⬅️ DESTROY della tabella esistente (SEMPRE, prima di tutto)
	let oldTable = Tabulator.findTable(TABLE_SELECTOR)[0];
	if (oldTable) {
		console.log('[CWC] 🗑️ Destroying existing Tabulator instance...');
		oldTable.destroy();
		console.log('[CWC] ✅ Table destroyed');
	}
	
	// ⬅️ Determina la fonte dei dati
	let tabledata, columnStyle;
	
	if (!triggeredByTag) {
		// Chiamata manuale via metodo DrawTable()
		tabledata = tableData_;
		columnStyle = columnStyle_;
		console.log('[CWC] 📊 Using manual data (from DrawTable method)');
	} else {
		// Chiamata automatica via onPropertyChanged
		tabledata = ArrayData;
		try {
			columnStyle = JSON.parse(WebCC.Properties.ColumnStyleString);
			console.log('[CWC] 📊 Using property data (from onPropertyChanged)');
		} catch (e) {
			console.error('[CWC] ❌ Error parsing ColumnStyleString:', e);
			return;
		}
	}
	
	console.log('[CWC] 📊 Data rows:', tabledata ? tabledata.length : 0);
	console.log('[CWC] 📊 Columns:', columnStyle ? columnStyle.length : 0);
	
	// ⬅️ Verifica se ci sono colonne
	if (!columnStyle || columnStyle.length === 0) {
		console.warn('[CWC] ⚠️ No columns defined, table cleared');
		return; // ⬅️ La tabella è già stata distrutta, quindi è vuota
	}
	
	// ⬅️ CREA una NUOVA istanza di Tabulator
	console.log('[CWC] 🆕 Creating new Tabulator instance...');
	
	const table = new Tabulator(TABLE_SELECTOR, {
		height: DEFAULT_TABLE_HEIGHT,
		data: tabledata,
		layout: "fitColumns",
		columns: columnStyle,
	});
	
	// ⬅️ Registra eventi custom
	const tableEvents = {
		'addExtFilter': (e, table) => {
			console.log('[CWC] 🔍 addExtFilter event');
			table.addFilter(e.detail.filters);
		},
		'downloadTable': (e, table) => {
			console.log('[CWC] 💾 downloadTable event');
			table.download(e.detail.dtype, e.detail.dfilename, e.detail.doption);
		},
		'replaceData': (e, table) => {
			console.log('[CWC] 🔄 replaceData event');
			table.replaceData(e.detail);
		},
		'resetFilter': (e, table) => {
			console.log('[CWC] 🔍 resetFilter event');
			table.clearFilter();
			table.setFilter(JSON.parse(WebCC.Properties.DefFilter));
		},
		'setFilter': (e, table) => {
			console.log('[CWC] 🔍 setFilter event');
			table.setFilter(e.detail.filters);
		}
	};
	
	registerTableEvents(table, tableEvents);
	
	// ⬅️ Event Listeners per la tabella
	table.on("tableBuilt", function() {
		console.log('[CWC] ✅ Table built successfully');
		handleTableBuilt.call(this);
	});
	
	table.on("cellEdited", function(cell) {
		console.log('[CWC] ✏️ Cell edited');
		handleCellEdited(cell);
	});
	
	table.on("cellClick", function(e, cell) {
		console.log('[CWC] 🖱️ Cell clicked');
		handleClickTap(e, cell);
	});
	
	table.on("cellTap", function(e, cell) {
		console.log('[CWC] 👆 Cell tapped');
		handleClickTap(e, cell);
	});
	
	table.on("dataLoaded", function(data) {
		console.log('[CWC] ✅ Data loaded:', data.length, 'rows');
	});
	
	table.on("renderComplete", function() {
		console.log('[CWC] ✅ Render complete, visible rows:', this.getDataCount());
	});
	
	console.log('[CWC] ✅ New Tabulator instance created');
}

////////////////////////////////////////////
// REGISTER TABLE EVENTS
////////////////////////////////////////////

function registerTableEvents(table, tableEvents) {
	Object.entries(tableEvents).forEach(([eventName, handler]) => {
		const eventHandler = (e) => handler(e, table);
		document.addEventListener(eventName, eventHandler);
		console.log('[CWC] 📌 Registered event:', eventName);
	});
}

////////////////////////////////////////////
// EVENT HANDLERS
////////////////////////////////////////////

function handleTableBuilt() {
	console.log('[CWC] 🔧 handleTableBuilt called');
	
	let filterObj = JSON.parse(WebCC.Properties.DefFilter);
	this.setFilter(filterObj);
	
	let columns = this.getColumns();
	let select = fieldEl;
	let select2 = fieldEl2;
	
	select.innerHTML = "";
	select2.innerHTML = "";
	
	let emptyOption = document.createElement("option");
	emptyOption.value = "";
	emptyOption.text = "...";
	select.appendChild(emptyOption);
	select2.appendChild(emptyOption.cloneNode(true));
	
	columns.forEach(function(column) {
		let def = column.getDefinition();
		let option = document.createElement("option");
		option.value = def.field; 
		option.text = def.title;
		select.appendChild(option);
		select2.appendChild(option.cloneNode(true));
	});
	
	select.selectedIndex = 0;
	select2.selectedIndex = 0;
	
	console.log('[CWC] ✅ Filter dropdowns populated');
}

function handleCellEdited(cell){
	console.log('[CWC] ✏️ handleCellEdited called');
	
	let dataRow = cell.getData();
	let rowData = Object.values(dataRow);
	
	WebCC.Events.fire('CellEdited', rowData);
	WebCC.Properties.NrEdited = rowData[0];
	WebCC.Properties.RowDataEdited = JSON.stringify(dataRow);
	
	console.log('[CWC] ✅ Cell edit event fired');
}

function handleClickTap(e, cell) {
	console.log('[CWC] 🖱️ handleClickTap called');
	
	let data = cell.getData();
	let rowData = Object.values(data);
	
	WebCC.Events.fire('Clicked', rowData);
	
	console.log('[CWC] ✅ Click event fired');
}

////////////////////////////////////////////
// EXTERNAL FILTERS
////////////////////////////////////////////

function updateFilter() {
	const createFilterObject = (field, type, valueElement) => ({
		field: field === "function" ? customFilter : field,
		type,
		value: convertValue(valueElement)
	});
	
	const toggleElements = (isDisabled, typeElement, valueElement) => {
		typeElement.disabled = isDisabled;
		valueElement.disabled = isDisabled;
	};
	
	const filterData = {
		filter1: {
			field: fieldEl.options[fieldEl.selectedIndex].value,
			type: typeEl.options[typeEl.selectedIndex].value,
			valueEl: valueEl
		},
		filter2: {
			field: fieldEl2.options[fieldEl2.selectedIndex].value,
			type: typeEl2.options[typeEl2.selectedIndex].value,
			valueEl: valueEl2
		}
	};
	
	toggleElements(
		filterData.filter1.field === "function",
		typeEl,
		valueEl
	);
	toggleElements(
		filterData.filter2.field === "function",
		typeEl2,
		valueEl2
	);
	
	const filters = [createFilterObject(
		filterData.filter1.field,
		filterData.filter1.type,
		filterData.filter1.valueEl
	)];
	
	if (filterData.filter1.field && filterData.filter2.field) {
		filters.push(createFilterObject(
			filterData.filter2.field,
			filterData.filter2.type,
			filterData.filter2.valueEl
		));
	}
	
	document.dispatchEvent(new CustomEvent('setFilter', { detail: { filters } }));
}

fieldEl.addEventListener("change", updateFilter);
typeEl.addEventListener("change", updateFilter);
valueEl.addEventListener("keyup", updateFilter);
fieldEl2.addEventListener("change", updateFilter);
typeEl2.addEventListener("change", updateFilter);
valueEl2.addEventListener("keyup", updateFilter);

document.getElementById(RESET_FILTER_ELEMENT_NAME).addEventListener("click", function(){
	fieldEl.value = "";
	typeEl.value = "=";
	valueEl.value = "";
	fieldEl2.value = "";
	typeEl2.value = "=";
	valueEl2.value = "";
	const event = new CustomEvent('resetFilter');
	document.dispatchEvent(event);
});

////////////////////////////////////////////
// HELPER FUNCTIONS
////////////////////////////////////////////

function convertValue(element) {
	const inputValue = element.value;    
	const isNumber = !isNaN(inputValue) && inputValue !== "";    
	if (isNumber) {
		return Number(inputValue);
	} else {
		return inputValue;
	}
}

function getDate(fieldnr) {
	let id = FILTER_ELEMENT_BASE_NAME + fieldnr.toString();
	document.getElementById(id).value = getLocalISOString();
}

function getLocalISOString(date = new Date()) {
	const timeZoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
	const localDate = new Date(date.getTime() - timeZoneOffsetMs);
	return localDate.toISOString().slice(0, 19);
}

async function checkCssFileExists(path) {
	try {
		const response = await fetch(path, {
			method: 'HEAD'
		});
		return response.ok;
	} catch (error) {
		console.error('[CWC] ❌ Error checking CSS file:', error);
		return false;
	}
}

function changeTableStyle(style) {
	console.log('[CWC] 🎨 changeTableStyle called:', style);
	
	if (style.endsWith('.css')) {
		checkCssFileExists(style)
			.then(exists => {
				if (exists) {
					tabuStyleEl.href = style;
					console.log('[CWC] ✅ Style changed to:', style);
				} else {
					console.warn('[CWC] ⚠️ CSS file not found:', style);
				}
			});						
	}
}