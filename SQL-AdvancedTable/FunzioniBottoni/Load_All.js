//Global Definition Area
import * as SQLTableHelper from "SQLTableHelper";

export async function Load_All_OnTapped(item, x, y, modifiers, trigger) {
try {
        const query = `SELECT JobStart_DT, JobEnd_DT, PartNumber, SerNumber FROM Jobs ORDER BY JobStart_DT DESC`;
        
        const columns = [
            { field: 'JobStart_DT', headerName: 'Inizio', width: 180, sorter: 'string', hozAlign: 'left' },
            { field: 'JobEnd_DT', headerName: 'Fine', width: 180, sorter: 'string', hozAlign: 'left' },
            { field: 'PartNumber', headerName: 'Codice Pezzo', width: 150, sorter: 'string', hozAlign: 'left' },
            { field: 'SerNumber', headerName: 'Numero Seriale', width: 150, sorter: 'string', hozAlign: 'left' }
        ];
        
        const result = await SQLTableHelper.loadSQLTable({
            query: query,
            columns: columns,
            tableElementId: 'Advanced Table CustomWebControl_1',
            options: {
                autoFormatDates: true,
                dateFormat: 'dd/MM/yyyy HH:mm:ss'
            }
        });
        
        if (result.success) {
            HMIRuntime.Trace('□ Caricati tutti i ' + result.rowCount + ' job');
        } else {
            HMIRuntime.Trace('□ Errore: ' + result.error);
        }
        
    } catch (e) {
        HMIRuntime.Trace('□ ERRORE Load_All: ' + e.toString());
    }
}