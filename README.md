# 🚀 WinCC Unified - Advanced SQL Table

Custom Web Control (CWC) avanzato per WinCC Unified che integra Tabulator.js con database SQL (SQLite, MS SQL Server).

## ✨ Caratteristiche

- ✅ Visualizzazione dati SQL in tabelle interattive
- ✅ Filtri avanzati (data, codice pezzo, numero seriale)
- ✅ Formattazione automatica date e numeri
- ✅ Export dati (CSV, Excel, PDF)
- ✅ Ordinamento e ricerca integrati
- ✅ Supporto SQLite e MS SQL Server
- ✅ Gestione errori robusta

## 📦 Contenuto

### CWC - Advanced Table
- **Tabulator.js** integrato
- Metodi personalizzati (`DrawTable`, `ClearTable`, `SetFilter`, ecc.)
- Gestione eventi (`CellEdited`, `Clicked`)

### Script Library
- **SQLTableHelper.js**: Helper per caricamento dati SQL
- **Events.js**: Gestione eventi UI (ricerca, export, ecc.)

## 🛠️ Installazione

### 1. Importa il CWC in WinCC Unified

1. Apri **WinCC Unified Engineering**
2. Vai su **Project Tree** → **Controls**
3. Click destro → **Import Custom Web Control**
4. Seleziona la cartella `CWC/`

### 2. Importa gli Script

1. Copia `Scripts/SQLTableHelper.js` in una **Script Library**
2. Copia `Scripts/Events.js` negli **Screen Events**

### 3. Configura il Database

Modifica `SQLTableHelper.js` con la tua connection string:

```javascript
const DB_CONFIG = {
    sqlDSN: "FILEDSN=C:\\Users\\Public\\tuo_database.dsn",
    default: "sqlDSN"
};