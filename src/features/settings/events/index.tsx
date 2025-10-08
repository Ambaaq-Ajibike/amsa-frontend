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
      desc='View and manage all events and your event registrations.'
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-events">All Events</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-events" className="mt-6">
          <EventsList />
        </TabsContent>
        
        <TabsContent value="my-events" className="mt-6">
          <UserEventsView />
        </TabsContent>
      </Tabs>
    </ContentSection>
  )
}