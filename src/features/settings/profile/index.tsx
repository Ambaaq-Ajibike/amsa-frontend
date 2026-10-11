import ContentSection from '../components/content-section'
import ProfileForm from './profile-form'

export default function SettingsProfile() {
  return (
    <ContentSection
      title='Profile'
      desc='Update your contact and academic details.'
    >
      <div className='max-w-4xl'><ProfileForm /></div>
    </ContentSection>
  )
}
