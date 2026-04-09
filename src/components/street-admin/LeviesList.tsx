'use client'

interface Levy {
  id: string
  title: string
  description: string | null
  amount: number
  due_date: string | null
  is_active: boolean
  is_etag_eligible: boolean
  created_at: string
}

interface Props {
  levies: Levy[]
}

export function LeviesList({ levies }: Props) {
  if (levies.length === 0) {
    return <div className="text-gray-500 p-4">No levies created yet.</div>
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETAG</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {levies.map(levy => (
            <tr key={levy.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{levy.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatAmount(levy.amount)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {levy.due_date ? new Date(levy.due_date).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 text-xs rounded ${levy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {levy.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 text-xs rounded ${levy.is_etag_eligible ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {levy.is_etag_eligible ? 'Eligible' : 'Not Eligible'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}