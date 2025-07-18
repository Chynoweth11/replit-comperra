// ===================================================================
// COMPERRA SCRAPING SYSTEM - LOGGING SERVICE
// ===================================================================

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
    async log(entry: Omit<LogEntry, 'timestamp'>): Promise<void> {
        try { 
            // Console logging for now - Firebase logging optional
            console.log(`📝 Scraping Log: ${entry.status} - ${entry.message} - ${entry.url}`);
            if (entry.durationMs) {
                console.log(`⏱️  Duration: ${entry.durationMs}ms`);
            }
        } catch (error) { 
            console.error("🔥 Logging failed:", error); 
        }
    }
}

export const loggingService = new LoggingService();