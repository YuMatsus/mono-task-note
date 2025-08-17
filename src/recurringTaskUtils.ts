import { moment } from 'obsidian';

export interface RecurringTaskSettings {
    recurring_days_of_month?: number[];
    recurring_days_of_week?: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[];
    recurring_scheduled_times?: string[];
}

export interface NextRecurrence {
    due_date: string | null;
    scheduled_time: string | null; // Now stores HH:mm format
}

const DAYS_OF_WEEK_MAP: Record<string, number> = {
    'Sun': 0,
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Fri': 5,
    'Sat': 6
};

export function calculateNextRecurrence(
    settings: RecurringTaskSettings,
    currentDueDate: string | null,
    currentScheduledTime: string | null
): NextRecurrence {
    const { 
        recurring_days_of_month = [], 
        recurring_days_of_week = [], 
        recurring_scheduled_times = [] 
    } = settings;

    // Support time-only recurrence (no day constraints)
    const hasDateConstraints = recurring_days_of_month.length > 0 || recurring_days_of_week.length > 0;
    const hasTimeConstraints = recurring_scheduled_times.length > 0;

    // If no recurring settings are configured at all, return null values
    if (!hasDateConstraints && !hasTimeConstraints) {
        return { due_date: null, scheduled_time: null };
    }

    // Determine the base date for calculation
    let baseDate = moment();
    let currentTimeStr: string | null = null;
    
    if (currentDueDate) {
        baseDate = moment(currentDueDate);
    }
    
    // Extract time from scheduled_time if it exists
    if (currentScheduledTime) {
        // Handle both HH:mm format and datetime format
        if (currentScheduledTime.includes('T')) {
            // datetime format: extract time part
            currentTimeStr = moment(currentScheduledTime).format('HH:mm');
        } else if (currentScheduledTime.match(/^\d{2}:\d{2}$/)) {
            // Already in HH:mm format
            currentTimeStr = currentScheduledTime;
        }
    }

    // Check if we can use the same day for the next scheduled time
    let nextDate: moment.Moment | null = null;
    let nextScheduledTime: string | null = null;

    // If we have recurring times, check for next time on the same day
    if (hasTimeConstraints && currentTimeStr) {
        const sortedTimes = [...recurring_scheduled_times].sort();
        const todayDate = currentDueDate ? moment(currentDueDate) : moment();
        
        // Find the next time slot on the same day
        for (const time of sortedTimes) {
            if (time > currentTimeStr) {
                // Found a later time on the same day
                nextDate = todayDate;
                nextScheduledTime = time;
                break;
            }
        }
    }

    // If we didn't find a time on the same day, move to the next recurring day
    if (!nextDate) {
        if (hasDateConstraints) {
            // Find next date based on day constraints
            nextDate = findNextRecurringDate(
                baseDate,
                recurring_days_of_month,
                recurring_days_of_week,
                nextScheduledTime === null // Only skip to next day if we haven't found a time
            );
        } else if (hasTimeConstraints) {
            // Time-only recurrence: advance to tomorrow
            nextDate = baseDate.clone().add(1, 'day').startOf('day');
        }

        if (!nextDate) {
            return { due_date: null, scheduled_time: null };
        }

        // Set the first scheduled time for the new day
        if (hasTimeConstraints) {
            const sortedTimes = [...recurring_scheduled_times].sort();
            nextScheduledTime = sortedTimes[0];
        }
    }

    // Format due_date
    const nextDueDate = nextDate.format('YYYY-MM-DD');

    return {
        due_date: nextDueDate,
        scheduled_time: nextScheduledTime // Returns HH:mm format
    };
}

function findNextRecurringDate(
    baseDate: moment.Moment,
    daysOfMonth: number[],
    daysOfWeek: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[],
    skipToNextDay = true
): moment.Moment | null {
    const candidates: moment.Moment[] = [];

    // Start from the current date or next day based on skipToNextDay
    const startDate = skipToNextDay 
        ? baseDate.clone().add(1, 'day').startOf('day')
        : baseDate.clone().startOf('day');

    // Check next 365 days for potential matches
    for (let i = 0; i < 365; i++) {
        const checkDate = startDate.clone().add(i, 'days');
        
        // Check if it matches days of month
        if (daysOfMonth.length > 0) {
            const dayOfMonth = checkDate.date();
            if (daysOfMonth.includes(dayOfMonth)) {
                candidates.push(checkDate.clone());
            }
        }

        // Check if it matches days of week
        if (daysOfWeek.length > 0) {
            const dayOfWeek = checkDate.day();
            const matchesWeekday = daysOfWeek.some(day => 
                DAYS_OF_WEEK_MAP[day] === dayOfWeek
            );
            if (matchesWeekday) {
                candidates.push(checkDate.clone());
            }
        }
    }

    // If both conditions are specified, find dates that match either condition
    // Remove duplicates and sort
    const uniqueDates = Array.from(new Set(candidates.map(d => d.format('YYYY-MM-DD'))))
        .map(dateStr => moment(dateStr))
        .sort((a, b) => a.valueOf() - b.valueOf());

    return uniqueDates.length > 0 ? uniqueDates[0] : null;
}