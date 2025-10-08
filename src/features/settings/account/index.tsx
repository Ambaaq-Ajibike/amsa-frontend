import ContentSection from '../components/content-section'
import { EventList } from './event-list'

export default function SettingsEvent() {
  return (
    <ContentSection
      title='Event'
      desc='Register for upcoming events.'
    >
      <EventList />
    </ContentSection>
  )
}
