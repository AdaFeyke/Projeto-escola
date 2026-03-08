export type ActionResponse = {
    success: boolean;
    message: string;
    values?: Record<string, any>;
    timestamp?: number;
};

export const Action = {
    success: (message: string, values?: any): ActionResponse => ({
        success: true,
        message,
        values,
        timestamp: Date.now()
    }),
    error: (message: string, values?: any): ActionResponse => ({
        success: false,
        message,
        values,
        timestamp: Date.now()
    })
};