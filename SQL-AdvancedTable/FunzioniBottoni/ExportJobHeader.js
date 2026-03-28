//Global Definition Area
import * as SQLTableHelper from "SQLTableHelper";

export async function ExportJobHeader_OnTapped(item, x, y, modifiers, trigger) {
   try {
        const startDate = Screen.Items('DatePicker_Start').ProcessValue;
        const endDate = Screen.Items('DatePicker_End').ProcessValue;
        const partNumber = Screen.Items('Input_PartNumber').Text || '';
        const serNumber = Screen.Items('Input_SerNumber').Text || '';
        
        const sqlStart = SQLTableHelper.toSQL(startDate);
        const sqlEnd = SQLTableHelper.toSQL(endDate);
        
        let query = `SELECT ID, Oper_1, Oper_2, Oper_3, Oper_4, FyberType, FyberBatch, ResinType, ResinBatch FROM Jobs WHERE JobStart_DT >= "${sqlStart}" AND JobEnd_DT <= "${sqlEnd}"`;
        
        if (partNumber.trim() !== '') {
            query += ` AND PartNumber = "${partNumber.trim()}"`;
        }
        
        if (serNumber.trim() !== '') {
            query += ` AND SerNumber = "${serNumber.trim()}"`;
        }
        
        const columns = [
            { field: 'ID', headerName: 'ID', width: 80, sorter: 'number', hozAlign: 'center' },
            { field: 'Oper_1', headerName: 'Operatore 1', width: 120, sorter: 'string', hozAlign: 'left' },
            { field: 'Oper_2', headerName: 'Operatore 2', width: 120, sorter: 'string', hozAlign: 'left' },
            { field: 'Oper_3', headerName: 'Operatore 3', width: 120, sorter: 'string', hozAlign: 'left' },
            { field: 'Oper_4', headerName: 'Operatore 4', width: 120, sorter: 'string', hozAlign: 'left' },
            { field: 'FyberType', headerName: 'Tipo Fibra', width: 120, sorter: 'string', hozAlign: 'left' },
            { field: 'FyberBatch', headerName: 'Lotto Fibra', width: 120, sorter: 'string', hozAlign: 'left' },
            { field: 'ResinType', headerName: 'Tipo Resina', width: 120, sorter: 'string', hozAlign: 'left' },
            { field: 'ResinBatch', headerName: 'Lotto Resina', width: 120, sorter: 'string', hozAlign: 'left' }
        ];
        
        const result = await SQLTableHelper.loadSQLTable({
            query: query,
            columns: columns,
            tableElementId: 'Advanced Table CustomWebControl_1',
            options: {
                autoFormatDates: false,
                autoFormatNumbers: false
            }
        });
        
        if (result.success) {
            HMIRuntime.Trace('□ Caricate ' + result.rowCount + ' intestazioni job');
        } else {
            HMIRuntime.Trace('□ Errore: ' + result.error);
        }
        
    } catch (e) {
        HMIRuntime.Trace('□ ERRORE ExportJobHeader: ' + e.toString());
    }
}