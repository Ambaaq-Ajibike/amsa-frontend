import { useState } from 'react'
import ContentSection from '../components/content-section'
import { UserEventsView } from '@/features/events/components/user-events-view'
import { EventsList } from './events-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsEvents() {
  const [activeTab, setActiveTab] = useState('all-events')

  return (
    <ContentSection
      title='Events'
      desc='Discover what is coming up and keep track of the events you have joined.'
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5">
        <TabsList className="grid h-11 w-full max-w-sm grid-cols-2 rounded-xl">
          <TabsTrigger value="all-events">All events</TabsTrigger>
          <TabsTrigger value="my-events">My registrations</TabsTrigger>
        </TabsList>
        <TabsContent value="all-events" className="mt-0"><EventsList /></TabsContent>
        <TabsContent value="my-events" className="mt-0"><UserEventsView /></TabsContent>
      </Tabs>
    </ContentSection>
  )
}
