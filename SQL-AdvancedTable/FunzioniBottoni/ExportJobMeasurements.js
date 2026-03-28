//Global Definition Area
import * as SQLTableHelper from "SQLTableHelper";

export async function ExportJobMeasurements_OnTapped(item, x, y, modifiers, trigger) {
      try {
        const jobID = Screen.Items('TextBox_JobID').Text || '';
        
        if (jobID.trim() === '') {
            HMIRuntime.Trace('□️ JobID non specificato');
            return;
        }
        
        const query = `SELECT DT_Evento, DancerPressure_SP, DancerPressure_PV, FiberConsumed, RollTemperature_1, RollTemperature_2, TankTemperature_1, TankTemperature_2, RoomTemperature, TankLevel FROM Measurements WHERE JobID = ${jobID}`;
        
        const columns = [
            { field: 'DT_Evento', headerName: 'Data/Ora', width: 180, sorter: 'string', hozAlign: 'left' },
            { field: 'DancerPressure_SP', headerName: 'Dancer SP', width: 100, sorter: 'number', hozAlign: 'right' },
            { field: 'DancerPressure_PV', headerName: 'Dancer PV', width: 100, sorter: 'number', hozAlign: 'right' },
            { field: 'FiberConsumed', headerName: 'Fibra Consumata', width: 120, sorter: 'number', hozAlign: 'right' },
            { field: 'RollTemperature_1', headerName: 'Temp Rullo 1', width: 110, sorter: 'number', hozAlign: 'right' },
            { field: 'RollTemperature_2', headerName: 'Temp Rullo 2', width: 110, sorter: 'number', hozAlign: 'right' },
            { field: 'TankTemperature_1', headerName: 'Temp Serbatoio 1', width: 130, sorter: 'number', hozAlign: 'right' },
            { field: 'TankTemperature_2', headerName: 'Temp Serbatoio 2', width: 130, sorter: 'number', hozAlign: 'right' },
            { field: 'RoomTemperature', headerName: 'Temp Ambiente', width: 110, sorter: 'number', hozAlign: 'right' },
            { field: 'TankLevel', headerName: 'Livello', width: 100, sorter: 'number', hozAlign: 'right' }
        ];
        
        const result = await SQLTableHelper.loadSQLTable({
            query: query,
            columns: columns,
            tableElementId: 'Advanced Table CustomWebControl_1',
            options: {
                autoFormatDates: true,
                autoFormatNumbers: true,
                numberDecimals: 2,
                dateFormat: 'dd/MM/yyyy HH:mm:ss'
            }
        });
        
        if (result.success) {
            HMIRuntime.Trace('□ Caricate ' + result.rowCount + ' misurazioni per JobID ' + jobID);
        } else {
            HMIRuntime.Trace('□ Errore: ' + result.error);
        }
        
    } catch (e) {
        HMIRuntime.Trace('□ ERRORE ExportJobMeasurements: ' + e.toString());
    }
}