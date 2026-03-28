//Global Definition Area
import * as SQLTableHelper from "SQLTableHelper";

export async function SearchJobs_OnTapped(item, x, y, modifiers, trigger) {
       try {
        const startDate = Screen.Items('DatePicker_Start').ProcessValue;
        const endDate = Screen.Items('DatePicker_End').ProcessValue;
        
        const sqlStart = SQLTableHelper.toSQL(startDate).substring(0, 10);
        const sqlEnd = SQLTableHelper.toSQL(endDate).substring(0, 10);
        
        const query = `SELECT JobStart_DT, JobEnd_DT, PartNumber, SerNumber FROM Jobs WHERE JobStart_DT >= "${sqlStart}" AND JobStart_DT <= "${sqlEnd}" ORDER BY JobStart_DT`;
        
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
            HMIRuntime.Trace('□ Trovati ' + result.rowCount + ' job');
        } else {
            HMIRuntime.Trace('□ Errore: ' + result.error);
        }
        
    } catch (e) {
        HMIRuntime.Trace('□ ERRORE SearchJobs: ' + e.toString());
    }
}