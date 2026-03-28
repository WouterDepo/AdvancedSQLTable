# Custom Web Controls (CWC) Development Guide

Guida allo sviluppo di Custom Web Controls per SIMATIC WinCC Unified.

---

## 📋 **INDICE**

1. [Introduzione](#introduzione)
2. [Cos'è un Custom Web Control](#cosè-un-custom-web-control)
3. [Requisiti](#requisiti)
4. [Struttura di un CWC](#struttura-di-un-cwc)
5. [Creazione Passo-Passo](#creazione-passo-passo)
6. [Manifest File](#manifest-file)
7. [Debugging](#debugging)
8. [Best Practices](#best-practices)
9. [Risorse e Riferimenti](#risorse-e-riferimenti)

---

## 🎯 **INTRODUZIONE**

I **Custom Web Controls (CWC)** permettono di estendere le funzionalità di WinCC Unified creando controlli personalizzati basati su tecnologie web standard (HTML5, CSS3, JavaScript).

### **Vantaggi dei CWC:**

- ✅ **Riutilizzabilità**: Crea una volta, usa ovunque
- ✅ **Tecnologie moderne**: HTML5, CSS3, JavaScript (ES6+)
- ✅ **Integrazione nativa**: Funzionano come controlli standard WinCC
- ✅ **Librerie esterne**: Supporto per librerie come Tabulator, Chart.js, etc.
- ✅ **API completa**: Eventi, proprietà, metodi personalizzati

---

## 🔍 **COS'È UN CUSTOM WEB CONTROL**

Un CWC è un componente web incapsulato che può essere:

- **Importato** in TIA Portal
- **Configurato** tramite proprietà
- **Utilizzato** nelle schermate WinCC Unified
- **Interagisce** con tag e script

### **Architettura:**

```
┌─────────────────────────────────────┐
│ TIA Portal (Engineering)            │
│ ┌───────────────────────────────┐   │
│ │ Custom Web Control (CWC)      │   │
│ │ ┌─────────────────────────┐   │   │
│ │ │ HTML + CSS + JS         │   │   │
│ │ │ (Librerie esterne)      │   │   │
│ │ └─────────────────────────┘   │   │
│ │ ↕ API                         │   │
│ │ ┌─────────────────────────┐   │   │
│ │ │ Properties | Events     │   │   │
│ │ │ Methods                 │   │   │
│ │ └─────────────────────────┘   │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
↓ Runtime
┌─────────────────────────────────────┐
│ WinCC Unified Runtime               │
│ (Panel / PC)                        │
└─────────────────────────────────────┘
```

---

## 📋 **REQUISITI**

### **Software:**

| Componente | Versione | Note |
|------------|----------|------|
| **TIA Portal** | V17 o superiore | Con WinCC Unified |
| **WinCC Unified Runtime** | V17+ | Panel o PC |
| **Editor di testo** | VS Code (consigliato) | Con estensioni JavaScript |
| **Browser** | Chrome/Edge | Per testing |

### **Conoscenze richieste:**

- ✅ HTML5 / CSS3
- ✅ JavaScript (ES6+)
- ✅ JSON
- ✅ Concetti base WinCC Unified

---

## 📁 **STRUTTURA DI UN CWC**
📦 MyCustomControl/
├── 📄 manifest.json # Definizione del controllo
├── 📂 control/
│ ├── 📄 index.html # Interfaccia utente
│ ├── 📄 main.js # Logica principale
│ └── 📄 styles.css # Stili
├── 📂 assets/
│ ├── 📄 icon.ico # Icona del controllo (32x32)
│ └── 📄 preview.png # Anteprima (opzionale)
├── 📂 libs/ # Librerie esterne (opzionale)
│ └── 📄 tabulator.min.js
└── 📄 README.md # Documentazione

---

## 🚀 **CREAZIONE PASSO-PASSO**

### **STEP 1: Crea la struttura delle cartelle**

```bash
mkdir MyCustomControl
cd MyCustomControl
mkdir control assets libs

### STEP 2: Crea il Manifest File
### Il manifest.json è il file di configurazione principale.

📄 manifest.json:
{
  "$schema": "./CWC_manifest_Schema.json",
  "mver": "1.2.0",
  "control": {
    "identity": {
      "name": "MyCustomControl",
      "version": "1.0.0",
      "displayname": "My Custom Control",
      "icon": "./assets/icon.ico",
      "type": "guid://YOUR-GUID-HERE",
      "start": "./control/index.html"
    },
    "metadata": {
      "author": "Your Name",
      "keywords": ["custom", "control", "wincc"]
    },
    "contracts": {
      "api": {
        "methods": {},
        "events": {
          "DataLoaded": {
            "arguments": {
              "data": {
                "type": "string",
                "description": "JSON data loaded"
              }
            },
            "description": "Fired when data is loaded"
          }
        },
        "properties": {
          "DataSource": {
            "type": "string",
            "default": "",
            "description": "Data source connection string"
          },
          "RefreshInterval": {
            "type": "number",
            "default": 1000,
            "description": "Refresh interval in milliseconds"
          }
        }
      }
    },
    "types": []
  }
}

🔑 Genera il GUID:
Usa questo tool online: https://guidgenerator.com/online-guid-generator.aspx

Esempio GUID:

guid://e97f9f16-af91-43dc-ae93-42c49786887d

### STEP 3: Crea l'icona
### L'icona deve essere 32x32 pixel in formato .ico.

🎨 Genera l'icona online:
Vai su: https://www.icoconverter.com/
Carica un'immagine PNG/JPG
Seleziona dimensione 32x32
Scarica il file .ico
Salvalo in assets/icon.ico

### STEP 4: Crea l'interfaccia HTML
📄 control/index.html:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Custom Control</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="container">
        <h2 id="title">Custom Control</h2>
        <div id="content">
            <!-- Il contenuto dinamico va qui -->
        </div>
    </div>
    
    <!-- Script principale -->
    <script src="main.js"></script>
</body>
</html>

### STEP 5: Crea gli stili CSS
📄 control/styles.css:
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f0f0f0;
    width: 100%;
    height: 100%;
}

#container {
    width: 100%;
    height: 100%;
    padding: 10px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
}

#title {
    color: #009999;
    font-size: 18px;
    margin-bottom: 10px;
    border-bottom: 2px solid #009999;
    padding-bottom: 5px;
}

#content {
    width: 100%;
    height: calc(100% - 40px);
    overflow: auto;
}

### STEP 6: Crea la logica JavaScript
📄 control/main.js:
/**
 * Custom Web Control - Main Logic
 */

(function() {
    'use strict';
    
    // Riferimenti DOM
    const container = document.getElementById('container');
    const content = document.getElementById('content');
    
    // Variabili globali
    let dataSource = '';
    let refreshInterval = 1000;
    let intervalId = null;
    
    /**
     * Inizializzazione del controllo
     */
    function init() {
        console.log('Custom Control initialized');
        
        // Registra i listener per le proprietà
        if (window.CWC && window.CWC.onPropertyChanged) {
            window.CWC.onPropertyChanged('DataSource', onDataSourceChanged);
            window.CWC.onPropertyChanged('RefreshInterval', onRefreshIntervalChanged);
        }
        
        // Carica i dati iniziali
        loadData();
    }
    
    /**
     * Gestisce il cambio della proprietà DataSource
     */
    function onDataSourceChanged(newValue) {
        console.log('DataSource changed:', newValue);
        dataSource = newValue;
        loadData();
    }
    
    /**
     * Gestisce il cambio della proprietà RefreshInterval
     */
    function onRefreshIntervalChanged(newValue) {
        console.log('RefreshInterval changed:', newValue);
        refreshInterval = newValue;
        
        // Riavvia il timer
        if (intervalId) {
            clearInterval(intervalId);
        }
        
        if (refreshInterval > 0) {
            intervalId = setInterval(loadData, refreshInterval);
        }
    }
    
    /**
     * Carica i dati
     */
    function loadData() {
        console.log('Loading data from:', dataSource);
        
        // Esempio: mostra i dati
        content.innerHTML = `
            <p>Data Source: ${dataSource}</p>
            <p>Refresh Interval: ${refreshInterval}ms</p>
            <p>Last Update: ${new Date().toLocaleString()}</p>
        `;
        
        // Emetti l'evento DataLoaded
        if (window.CWC && window.CWC.fireEvent) {
            window.CWC.fireEvent('DataLoaded', JSON.stringify({
                timestamp: new Date().toISOString(),
                source: dataSource
            }));
        }
    }
    
    // Inizializza quando il DOM è pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

### STEP 7: Importa in TIA Portal
Comprimi la cartella MyCustomControl in un file .zip
Copia e incolla nella cartella di TIA Portal:
    "C:\Program Files\Siemens\Automation\Portal Vxx\Data\Hmi\CustomControls"
Apri TIA Portal
Vai su Project tree → Controls
Click pulsante refresh → Aggiorna la biblioteca e le istanze nel progetto dei Custom Web Control



📄 MANIFEST FILE - DETTAGLI
Struttura completa:
{
  "$schema": "./CWC_manifest_Schema.json",
  "mver": "1.2.0",
  "control": {
    "identity": {
      "name": "UniqueControlName",
      "version": "1.0.0",
      "displayname": "Display Name",
      "icon": "./assets/icon.ico",
      "type": "guid://YOUR-GUID",
      "start": "./control/index.html"
    },
    "metadata": {
      "author": "Author Name",
      "keywords": ["keyword1", "keyword2"]
    },
    "contracts": {
      "api": {
        "methods": {
          "MethodName": {
            "arguments": {
              "param1": {
                "type": "string",
                "description": "Parameter description"
              }
            },
            "description": "Method description"
          }
        },
        "events": {
          "EventName": {
            "arguments": {
              "data": {
                "type": "string",
                "description": "Event data"
              }
            },
            "description": "Event description"
          }
        },
        "properties": {
          "PropertyName": {
            "type": "string|number|boolean",
            "default": "default_value",
            "description": "Property description"
          }
        }
      }
    },
    "types": []
  }
}

Tipo	Descrizione	Esempio
string	Stringa di testo	"Hello World"
number	Numero (int/float)	42, 3.14
boolean	Booleano	true, false
object	Oggetto JSON	{"key": "value"}
array	Array	[1, 2, 3]

### 🐛 DEBUGGING
1. Trace Viewer (Logging)
Usa HMIRuntime.Trace() per il logging:

// Nel tuo script WinCC
HMIRuntime.Trace('>>> Debug message: ' + variabile);

Visualizza i log:

Apri Trace Viewer
Percorso: C:\Program Files\Siemens\Automation\WinCCUnified\bin\TraceViewer.exe
Filtra per il tuo progetto
📚 Guida: Using Trace Viewer with WinCC Unified (ID: 109777593)

2. Breakpoint in JavaScript
Usa i breakpoint per il debug passo-passo:
// Inserisci un breakpoint
debugger;

// Il codice si fermerà qui se il debugger è attivo

Come attivare il debugger:

Apri WinCC Unified Runtime
Premi F12 per aprire DevTools
Vai nella tab Sources
Imposta breakpoint cliccando sul numero di riga
📚 Guida: Uso dei punti di arresto RT Unified

3. Style Checker (VS Code)
Usa ESLint per verificare la qualità del codice:

Installazione:
# Installa Node.js (se non già installato)
# Poi installa ESLint
npm install -g eslint

# Inizializza ESLint nel progetto
cd MyCustomControl
eslint --init

    
# Installa Node.js (se non già installato)
# Poi installa ESLint
npm install -g eslint

# Inizializza ESLint nel progetto
cd MyCustomControl
eslint --init
📚 Guida: Developing WinCC Unified JavaScript with VS Code (ID: 109801600)


4. Console Browser
Usa console.log() per debug rapido:
console.log('Valore variabile:', myVariable);
console.error('Errore:', error);
console.warn('Attenzione:', warning);
console.table(arrayData); // Mostra array come tabella


✅ BEST PRACTICES
1. Gestione Errori
try {
    // Codice che può generare errori
    let data = JSON.parse(jsonString);
} catch (error) {
    console.error('Errore parsing JSON:', error);
    HMIRuntime.Trace('>>> ERROR: ' + error.message);
}

2. Verifica Disponibilità API
// Verifica che l'API WinCC sia disponibile
if (typeof HMIRuntime !== 'undefined') {
    // Codice runtime
    HMIRuntime.Trace('Runtime mode');
} else {
    // Codice design mode (TIA Portal)
    console.log('Design mode - using test data');
}

3. Gestione Proprietà
// Listener per cambio proprietà
if (window.CWC && window.CWC.onPropertyChanged) {
    window.CWC.onPropertyChanged('MyProperty', function(newValue) {
        console.log('Property changed:', newValue);
        updateUI(newValue);
    });
}

4. Performance
// ❌ MALE: Aggiornamenti frequenti
setInterval(updateUI, 100); // Ogni 100ms

// ✅ BENE: Aggiornamenti ottimizzati
setInterval(updateUI, 1000); // Ogni 1 secondo

// ✅ MEGLIO: Aggiornamenti su richiesta
// Usa eventi invece di polling

5. Librerie Esterne
Esempio con Tabulator:
<!-- index.html -->
<script src="../libs/tabulator.min.js"></script>

// main.js
if (typeof Tabulator !== 'undefined') {
    let table = new Tabulator("#table-container", {
        data: tableData,
        columns: [
            {title: "Name", field: "name"},
            {title: "Value", field: "value"}
        ]
    });
} else {
    console.error('Tabulator library not loaded!');
}
📚 Librerie consigliate:

Tabulator: https://tabulator.info/
Chart.js: https://www.chartjs.org/
Moment.js: https://momentjs.com/

Risorsa	Link	Descrizione
Integrating Custom Web Controls	ID: 109779176	Guida completa all'integrazione CWC
Manuale CWC (IT)	            TIA Portal V21	Manuale programmazione CWC
Trace Viewer	                ID: 109777593	Debugging con Trace Viewer
Style Checker	                ID: 109801600	Verifica codice con VS Code
JavaScript Tips & Tricks	    ID: 109758536	Esempi scripting JavaScript
SQLite/MS SQL Usage	            ID: 109806573	Uso database in WinCC Unified
WinCC Unified Logging	        ID: 109782859	Configurazione logging

Tool	URL	Utilizzo
GUID Generator	guidgenerator.com	Genera GUID univoci
ICO Converter	icoconverter.com	Crea icone .ico
JSON Validator	jsonlint.com	Valida file JSON
RegEx Tester	regex101.com	Test espressioni regolari

Libreria	URL	Descrizione
Tabulator	tabulator.info	Tabelle interattive
Chart.js	chartjs.org	    Grafici e chart
Moment.js	momentjs.com	Gestione date/ore
Lodash	    lodash.com	    Utility functions
Axios	    axios-http.com	HTTP client

🎓 ESEMPI PRATICI di Javascript in WinCC Unified per interagire con i CWC
Esempio 1: Controllo con Timer
let counter = 0;

setInterval(function() {
    counter++;
    document.getElementById('counter').textContent = counter;
    
    // Emetti evento
    if (window.CWC && window.CWC.fireEvent) {
        window.CWC.fireEvent('CounterUpdated', counter.toString());
    }
}, 1000);

Esempio 2: Lettura Proprietà da WinCC
// Registra listener
if (window.CWC && window.CWC.onPropertyChanged) {
    window.CWC.onPropertyChanged('ConnectionString', function(newValue) {
        console.log('Connection string:', newValue);
        connectToDatabase(newValue);
    });
}

Esempio 3: Chiamata Database
async function loadDataFromDB(connectionString) {
    try {
        let conn = await HMIRuntime.Database.CreateConnection(connectionString);
        let query = "SELECT * FROM MyTable";
        let results = await conn.Execute(query);
        
        // Processa risultati
        processResults(results);
        
        conn.Close();
    } catch (error) {
        HMIRuntime.Trace('>>> DB Error: ' + error);
    }
}

🆘 TROUBLESHOOTING
Problema: Controllo non appare in Toolbox
Soluzione:

Verifica che il file .zip contenga la struttura corretta
Controlla che manifest.json sia valido (usa jsonlint.com)
Verifica che il GUID sia univoco
Riavvia TIA Portal
Problema: Errore "Property not found"
Soluzione:

Verifica che la proprietà sia definita in manifest.json
Controlla il tipo di dato (string, number, boolean)
Usa console.log() per verificare il valore
Problema: Eventi non vengono emessi
Soluzione:

Verifica che l'evento sia definito in manifest.json
Usa window.CWC.fireEvent() correttamente:
    
window.CWC.fireEvent('EventName', 'eventData');

Controlla la console browser per errori
Problema: Libreria esterna non carica
Soluzione:

Verifica il percorso del file:

    
<script src="../libs/library.min.js"></script>

Controlla che il file sia incluso nello .zip
Usa typeof LibraryName !== 'undefined' per verificare il caricamento

📝 CHECKLIST SVILUPPO CWC
Struttura cartelle creata correttamente
manifest.json completo e validato
GUID univoco generato
Icona .ico 32x32 creata
index.html con struttura base
main.js con logica principale
styles.css con stili personalizzati
Proprietà definite e testate
Eventi definiti e testati
Gestione errori implementata
Debugging con Trace Viewer
Test in Design Mode (TIA Portal)
Test in Runtime Mode (Panel/PC)
Documentazione README.md creata
File .zip creato per import
🤝 CONTRIBUTI
Per contribuire a questo progetto:

Fork del repository
Crea un branch per la tua feature (git checkout -b feature/AmazingFeature)
Commit delle modifiche (git commit -m 'Add AmazingFeature')
Push al branch (git push origin feature/AmazingFeature)
Apri una Pull Request
📄 LICENZA
MIT License - Vedi file LICENSE

👤 AUTORE
Wouter Depo

GitHub: @WouterDepo
Repository: https://github.com/WouterDepo/WinCC-Unified_Extended-Controls.git
🌟 PROGETTI CORRELATI
SQL-AdvancedTable - Tabella SQL avanzata
ExtendedTrendControl - Trend control con logging
📞 SUPPORTO
Per domande o problemi:

Consulta la documentazione ufficiale Siemens
Apri una Issue su GitHub
Contatta il supporto Siemens
Ultima modifica: 28 Marzo 2026
Versione: 1.0.0

