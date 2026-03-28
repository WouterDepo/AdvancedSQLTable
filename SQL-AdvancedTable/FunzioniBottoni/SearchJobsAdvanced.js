//Global Definition Area
import * as SQLTableHelper from "SQLTableHelper";

export async function SearchJobsAdvanced_OnTapped(item, x, y, modifiers, trigger) {
      try {
        const startDate = Screen.Items('DatePicker_Start').ProcessValue;
        const endDate = Screen.Items('DatePicker_End').ProcessValue;
        const partNumber = Screen.Items('Input_PartNumber').Text || '';
        const serNumber = Screen.Items('Input_SerNumber').Text || '';
        
        const sqlStart = SQLTableHelper.toSQL(startDate).substring(0, 10);
        const sqlEnd = SQLTableHelper.toSQL(endDate).substring(0, 10);
        
        let query = `SELECT JobStart_DT, JobEnd_DT, PartNumber, SerNumber FROM Jobs WHERE JobStart_DT >= "${sqlStart}" AND JobStart_DT <= "${sqlEnd}"`;
        
        if (partNumber.trim() !== '') {
            query += ` AND PartNumber = "${partNumber.trim()}"`;
        }
        
        if (serNumber.trim() !== '') {
            query += ` AND SerNumber = "${serNumber.trim()}"`;
        }
        
        query += ` ORDER BY JobStart_DT`;
        
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
        HMIRuntime.Trace('□ ERRORE SearchJobsAdvanced: ' + e.toString());
    }
}