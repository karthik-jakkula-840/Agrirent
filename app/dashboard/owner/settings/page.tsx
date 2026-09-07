import { SettingsForm } from '@/app/dashboard/user/settings/settings-form'

export const metadata = {
  title: 'Settings | Owner Portal | AgriRent',
}

export default function OwnerSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-[24px] sm:text-[32px] font-black tracking-tight text-gray-950 leading-tight">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mt-1">
          Manage your security and dashboard preferences.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        <SettingsForm />
      </div>
    </div>
  )
}
