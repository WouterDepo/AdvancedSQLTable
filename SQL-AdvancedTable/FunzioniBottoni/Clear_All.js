//Global Definition Area
import * as SQLTableHelper from "SQLTableHelper";

export function Clear_All_OnTapped(item, x, y, modifiers, trigger) {
        try {
               
        const table = Screen.Items('Advanced Table CustomWebControl_1');
        
        if (!table) {
            HMIRuntime.Trace('>>> □ Tabella non trovata');
            return;
        }
        
        table.ClearTable();
        HMIRuntime.Trace('>>> □ Tabella svuotata');
        
    } catch (e) {
        HMIRuntime.Trace('>>> □ ERRORE ClearTable: ' + e.toString());
    }
}