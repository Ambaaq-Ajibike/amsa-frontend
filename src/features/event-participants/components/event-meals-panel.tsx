import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { eventService } from '@/gateway/services'
import type { EventMealWithStats } from '@/gateway/types/api'
import { toast } from 'sonner'

function toLocalDateTime(value: string) {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function MealEditor({ eventId, meal }: { eventId: string; meal: EventMealWithStats }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(meal.name)
  const [startTime, setStartTime] = useState(toLocalDateTime(meal.startTime))
  const [endTime, setEndTime] = useState(toLocalDateTime(meal.endTime))
  const update = useMutation({
    mutationFn: () => eventService.updateEventMeal(eventId, meal.id, { name, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString() }),
    onSuccess: () => { toast.success('Meal updated'); void queryClient.invalidateQueries({ queryKey: ['event-meals', eventId] }) },
    onError: () => toast.error('Could not update meal'),
  })
  const remove = useMutation({
    mutationFn: () => eventService.deleteEventMeal(eventId, meal.id),
    onSuccess: () => { toast.success('Meal removed'); void queryClient.invalidateQueries({ queryKey: ['event-meals', eventId] }) },
    onError: () => toast.error('Could not remove meal'),
  })
  return (
    <form className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-end" onSubmit={(e) => { e.preventDefault(); update.mutate() }}>
      <label className="space-y-1 text-xs font-medium text-muted-foreground">Meal name<Input value={name} onChange={(e) => setName(e.target.value)} required /></label>
      <label className="space-y-1 text-xs font-medium text-muted-foreground">Starts<Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required /></label>
      <label className="space-y-1 text-xs font-medium text-muted-foreground">Ends<Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required /></label>
      <Button size="sm" type="submit" disabled={update.isPending}>{update.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Save</Button>
      <Button size="icon" type="button" variant="ghost" aria-label={`Delete ${meal.name}`} disabled={remove.isPending} onClick={() => { if (window.confirm(`Remove ${meal.name}?`)) remove.mutate() }}><Trash2 className="h-4 w-4" /></Button>
    </form>
  )
}

export function EventMealsPanel({ eventId, canManage = true }: { eventId: string; canManage?: boolean }) {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({ queryKey: ['event-meals', eventId], queryFn: () => eventService.getEventMeals(eventId), enabled: !!eventId })
  const generate = useMutation({
    mutationFn: () => eventService.generateEventMeals(eventId),
    onSuccess: () => { toast.success('Meal schedule created'); void queryClient.invalidateQueries({ queryKey: ['event-meals', eventId] }) },
    onError: () => toast.error('Could not create meals. Meals may already be configured.'),
  })
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div><CardTitle>Meal schedule</CardTitle><CardDescription>{data ? `${data.totalPresent} members marked present` : 'Manage meal times and collection totals'}</CardDescription></div>
        {canManage && data?.meals.length === 0 && <Button size="sm" onClick={() => generate.mutate()} disabled={generate.isPending}>{generate.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Generate meals</Button>}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading meals…</p>}
        {isError && <p role="alert" className="text-sm text-destructive">Could not load the meal schedule.</p>}
        {data?.meals.map((meal) => <div key={meal.id} className="space-y-2"><div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><span>{meal.collected} collected</span><span>{meal.remaining} remaining</span></div>{canManage ? <MealEditor eventId={eventId} meal={meal} /> : <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"><div><p className="font-medium">{meal.name}</p><p className="text-sm text-muted-foreground">{new Date(meal.startTime).toLocaleString()} – {new Date(meal.endTime).toLocaleTimeString()}</p></div><span className="rounded-full bg-muted px-3 py-1 text-sm">{meal.collected} / {meal.totalPresent} collected</span></div>}</div>)}
        {data && data.meals.length === 0 && <p className="text-sm text-muted-foreground">No meals configured yet.</p>}
      </CardContent>
    </Card>
  )
}
