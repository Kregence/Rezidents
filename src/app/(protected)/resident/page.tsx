import { getResidentContext } from '@/lib/resident/context'
import { getResidentPayments, getResidentEligibility } from '@/lib/resident/actions'
import { ProfileSummary } from '@/components/resident/ProfileSummary'
import { PaymentHistory } from '@/components/resident/PaymentHistory'
import { EligibilityStatus } from '@/components/resident/EligibilityStatus'

export const dynamic = 'force-dynamic'

export default async function ResidentPage() {
  const ctx = await getResidentContext()
  
  const [payments, eligibility] = await Promise.all([
    ctx.resident ? getResidentPayments(ctx.resident.id) : Promise.resolve([]),
    ctx.resident ? getResidentEligibility(ctx.resident.id) : Promise.resolve([])
  ])

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resident Portal</h1>
        <p className="text-gray-600">{ctx.street?.name || 'Loading...'}</p>
      </div>

      {ctx.resident ? (
        <>
          <ProfileSummary resident={ctx.resident} street={ctx.street} />
          <PaymentHistory payments={payments} />
          <EligibilityStatus eligibility={eligibility} />
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            No resident record found. Please contact your administrator.
          </p>
        </div>
      )}
    </div>
  )
}