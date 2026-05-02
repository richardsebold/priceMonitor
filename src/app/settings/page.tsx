import Sidebar from "@/components/sidebar"
import { getUser } from "@/actions/get-user"
import { SettingsTabs } from "./settings-tabs"

export default async function SettingsPage() {
  const userInfos = await getUser()

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Sidebar />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e preferências de e-mail.
        </p>
      </div>

      <SettingsTabs userInfos={userInfos} />
    </div>
  )
}
