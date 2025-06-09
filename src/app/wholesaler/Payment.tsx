import { FC, useState } from 'react'

type Payment = {
  id: string;
  date: string;
  amount: string;
  status: string;
  paymentMethod: string;
}

const generatePayments = (count: number): Payment[] => {
  const statuses = ['Completed', 'Pending', 'Failed']
  const methods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Bitcoin']
  const payments: Payment[] = []

  for (let i = 1; i <= count; i++) {
    const amount = (Math.random() * 600 + 600).toFixed(2) // Random payments between $600 and $1200
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const method = methods[Math.floor(Math.random() * methods.length)]

    payments.push({
      id: i.toString(),
      date: `2025-05-${(Math.floor(Math.random() * 30) + 1).toString().padStart(2, '0')}`,
      amount: `$${amount}`,
      status: status,
      paymentMethod: method,
    })
  }

  return payments
}

const PaymentLogPage: FC = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(false)

  const allPayments = generatePayments(600)
  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = payment.id.includes(search) || payment.amount.includes(search)
    const matchesStatus = statusFilter === 'All' || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Limit the displayed payments to 20
  const displayedPayments = filteredPayments.slice(0, 20)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-semibold text-gray-900 mb-6">Payment Log</h1>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                className="p-3 pl-10 border border-gray-300 rounded-lg w-60"
                placeholder="Search by ID or Amount"
                value={search}
                onChange={handleSearchChange}
              />
              <span className="absolute left-3 top-3 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 4a7 7 0 1014 0 7 7 0 00-14 0zM21 21l-6-6"
                  />
                </svg>
              </span>
            </div>
            <select
              className="p-3 border border-gray-300 rounded-lg"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto shadow-md rounded-lg bg-white">
          <table className="min-w-full table-auto">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Payment Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-all duration-300 ease-in-out">
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.amount}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PaymentLogPage
