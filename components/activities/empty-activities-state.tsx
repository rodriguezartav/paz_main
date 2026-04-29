import { Calendar } from 'lucide-react'

interface EmptyActivitiesStateProps {
  period: 'today' | 'tomorrow' | 'later'
}

const messages = {
  today: 'No activities scheduled for today.',
  tomorrow: 'No activities scheduled for tomorrow.',
  later: 'No other activities scheduled this week.',
}

export function EmptyActivitiesState({ period }: EmptyActivitiesStateProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-6 text-muted-foreground">
      <Calendar className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm">{messages[period]}</p>
    </div>
  )
}
