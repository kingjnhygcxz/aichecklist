import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addDays } from "date-fns";

interface PrintCalendarProps {
  currentDate: Date;
}

export function PrintCalendar({ currentDate }: PrintCalendarProps) {
  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = addDays(monthStart, -monthStart.getDay());
  const calendarEnd = addDays(monthEnd, 6 - monthEnd.getDay());
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Split into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="print-only">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        borderBottom: '2px solid #000',
        paddingBottom: '10px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: 'black', 
          fontSize: '26px', 
          margin: '0',
          flex: '1',
          fontWeight: 'bold'
        }}>
          {format(currentDate, "MMMM yyyy")}
        </h1>
      </div>

      {/* Calendar Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '2px',
        border: '2px solid #000',
        marginBottom: '15px'
      }}>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} style={{
            backgroundColor: '#f3f4f6',
            padding: '8px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '12px',
            border: '1px solid #d1d5db',
            color: 'black'
          }}>
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isCurrentDay = isToday(date);

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                style={{
                  minHeight: '120px',
                  padding: '10px',
                  border: '1px solid #333',
                  backgroundColor: isCurrentMonth ? 'white' : '#f9fafb',
                  color: 'black',
                  position: 'relative'
                }}
              >
                {/* Date number */}
                <div style={{
                  fontSize: '16px',
                  fontWeight: isCurrentDay ? 'bold' : 'normal',
                  color: isCurrentMonth ? 'black' : '#9ca3af'
                }}>
                  {format(date, 'd')}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center', 
        fontSize: '11px', 
        color: '#9ca3af',
        borderTop: '1px solid #d1d5db',
        paddingTop: '15px'
      }}>
        <div>AIChecklist.io - Printed on {format(new Date(), 'MMMM d, yyyy')}</div>
      </div>
    </div>
  );
}