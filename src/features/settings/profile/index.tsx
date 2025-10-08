import ContentSection from '../components/content-section'
import ProfileForm from './profile-form'

export default function SettingsProfile() {
  return (
    <ContentSection
      title='Profile'
      desc='This is your profile on AMSA portal. You can update your personal information here.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
