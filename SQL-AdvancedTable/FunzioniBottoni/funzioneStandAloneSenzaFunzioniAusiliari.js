export async function Button_2_OnTapped(item, x, y, modifiers, trigger) {
//button stand-alone senza funzioni di support loadSQLTable

let conn = null;
    
    try {
        HMIRuntime.Trace('>>> □□ INIZIO Button_2_OnTapped');
        
        // 1️⃣ Leggi date dai DateTimePicker
        const startDate = Screen.Items("DatePicker_Start").ProcessValue;
        const endDate = Screen.Items("DatePicker_End").ProcessValue;
        
        // 2️⃣ Funzione per convertire timestamp in formato SQL
        function toSQL(timestamp) {
            const d = new Date(timestamp);
            const pad = (n) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        }
        
        // 3️⃣ Funzione per convertire data SQL in formato italiano
        function toItalian(sqlDate) {
            if (!sqlDate) return '';
            const match = sqlDate.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
            if (!match) return sqlDate;
            return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}:${match[6]}`;
        }
        
        // 4️⃣ Costruisci query
        const sqlStart = toSQL(startDate);
        const sqlEnd = toSQL(endDate);
        
        const query = `SELECT JobStart_DT, JobEnd_DT, PartNumber, SerNumber FROM Jobs WHERE JobStart_DT >= '${sqlStart}' AND JobEnd_DT <= '${sqlEnd}' ORDER BY JobStart_DT DESC`;
        
        HMIRuntime.Trace('>>> □□ Query: ' + query);
        
        // 5️⃣ Apri connessione
        const connectionString = "FILEDSN=C:\\Users\\Public\\prova_esea.dsn";
        conn = await HMIRuntime.Database.CreateConnection(connectionString);
        
        HMIRuntime.Trace('>>> □ Connesso al database');
        
        // 6️⃣ Esegui query
        const result = await conn.Execute(query);
        
        HMIRuntime.Trace('>>> □ Execute() completato');
        
        // 7️⃣ Estrai i dati
        const rows = [];
        
        if (result && result.Results) {
            HMIRuntime.Trace('>>> □□ Results trovato');
            
            for (let stmtKey in result.Results) {
                const stmt = result.Results[stmtKey];
                
                HMIRuntime.Trace('>>> □□ Statement ' + stmtKey);
                
                // Controlla errori (Errors è un oggetto!)
                if (stmt.Errors) {
                    const errorKeys = Object.keys(stmt.Errors);
                    
                    if (errorKeys.length > 0) {
                        const firstError = stmt.Errors[errorKeys[0]];
                        HMIRuntime.Trace('>>> □□ SQL State: ' + firstError.State);
                        
                        if (firstError.State !== "00000") {
                            HMIRuntime.Trace('>>> □ ERRORE SQL: ' + firstError.Message);
                            continue;
                        }
                    }
                }
                
                // Estrai righe (Rows è un oggetto!)
                if (stmt.Rows) {
                    const rowKeys = Object.keys(stmt.Rows);
                    HMIRuntime.Trace('>>> □□ Numero righe: ' + rowKeys.length);
                    
                    for (let rowKey in stmt.Rows) {
                        const row = stmt.Rows[rowKey];
                        
                        rows.push({
                            JobStart_DT: toItalian(row.JobStart_DT),
                            JobEnd_DT: toItalian(row.JobEnd_DT),
                            PartNumber: row.PartNumber || '',
                            SerNumber: row.SerNumber || ''
                        });
                    }
                }
            }
        }
        
        HMIRuntime.Trace('>>> □□ Righe totali estratte: ' + rows.length);
        
        if (rows.length > 0) {
            HMIRuntime.Trace('>>> □□ Prima riga: ' + JSON.stringify(rows[0]));
            
            // 8️⃣ Popola tabella tramite Properties
            const table = Screen.Items('Advanced Table CustomWebControl_1');
            
            const columns = [
                { title: 'Inizio', field: 'JobStart_DT', sorter: 'string', width: 180, hozAlign: 'left' },
                { title: 'Fine', field: 'JobEnd_DT', sorter: 'string', width: 180, hozAlign: 'left' },
                { title: 'Codice', field: 'PartNumber', sorter: 'string', width: 150, hozAlign: 'left' },
                { title: 'Seriale', field: 'SerNumber', sorter: 'string', width: 150, hozAlign: 'left' }
            ];
            
            // □ ACCESSO CORRETTO TRAMITE Properties
            table.Properties.ColumnStyleString = JSON.stringify(columns);
            table.Properties.TableDataString = JSON.stringify(rows);
            
            HMIRuntime.Trace('>>> □ Tabella aggiornata con ' + rows.length + ' righe!');
        } else {
            HMIRuntime.Trace('>>> □️ Nessuna riga trovata');
        }
        
    } catch (e) {
        HMIRuntime.Trace('>>> □ ERRORE: ' + e.message);
        
    } finally {
        if (conn) {
            try {
                conn.Close();
                HMIRuntime.Trace('>>> □□ Connessione chiusa');
            } catch (closeErr) {
                HMIRuntime.Trace('>>> □️ Errore chiusura');
            }
        }
        
        HMIRuntime.Trace('>>> □□ FINE');
    }
}