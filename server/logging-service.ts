// ===================================================================
// COMPERRA SCRAPING SYSTEM - LOGGING SERVICE
// ===================================================================
import { db } from './firebase-init.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export enum LogStatus { 
    Success = 'SUCCESS', 
    Failure = 'FAILURE', 
    Cached = 'CACHED' 
}

export interface LogEntry { 
    url: string; 
    status: LogStatus; 
    message: string; 
    durationMs?: number; 
    timestamp: any; 
}

class LoggingService {
    private logsCollection = collection(db, 'scraping-logs');
    
    async log(entry: Omit<LogEntry, 'timestamp'>): Promise<void> {
        try { 
            await addDoc(this.logsCollection, { 
                ...entry, 
                timestamp: serverTimestamp() 
            }); 
        } catch (error) { 
            console.error("🔥 Firestore logging failed:", error); 
        }
    }
}

export const loggingService = new LoggingService();