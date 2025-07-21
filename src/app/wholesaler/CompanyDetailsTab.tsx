// pages/company-detail.tsx
import { NextPage } from "next";
import TextField from "@mui/material/TextField";

// --- Dummy Data for Bank Accounts Table ---
// In a real app, this would come from an API
const bankAccounts = [
  {
    no: 1,
    bank: "Mashreq Bank",
    account: "232423424232423424",
    currency: "USD",
    default: true,
  },
  {
    no: 2,
    bank: "Emirates NBD",
    account: "987654321098765432",
    currency: "AED",
    default: false,
  },
];

const CompanyDetailPage: NextPage = () => {
  return (
    // RESPONSIVE: Adjusted padding, removed fixed negative top margin, and made negative left margin responsive
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:py-10 flex flex-col items-center md:-ml-56">
      
      {/* Company Detail Card */}
      <div className="relative w-full max-w-4xl">
        {/* RESPONSIVE: Adjusted position for smaller screens */}
        <span className="absolute -top-3 left-4 md:left-6 bg-gray-100 text-gray-700 text-sm font-medium px-4 py-1 rounded-t-lg border border-gray-200 border-b-0">
          Company Detail
        </span>
        {/* RESPONSIVE: Adjusted padding */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm pt-10 px-4 pb-6 sm:pt-6 sm:px-8 sm:pb-8 mt-2">
          {/* RESPONSIVE: Adjusted font size */}
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
            Company Detail
          </h2>
          <form className="space-y-6">
            {/* Full-width fields */}
            <div>
              <TextField
                fullWidth
                variant="outlined"
                label="Company Name"
                placeholder="Enter company name"
                InputLabelProps={{ shrink: true }}
              />
            </div>

            <div>
              <TextField
                fullWidth
                variant="outlined"
                label="Individual Fiscal Code"
                placeholder="Enter fiscal code"
                InputLabelProps={{ shrink: true }}
              />
            </div>

            <div>
              <TextField
                fullWidth
                variant="outlined"
                label="Address"
                placeholder="Enter address"
                InputLabelProps={{ shrink: true }}
              />
            </div>

            {/* Two-column rows - already responsive with `md:grid-cols-2` */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="VAD Registration Number"
                  placeholder="Enter registration number"
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <div>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Country"
                  placeholder="Enter country"
                  InputLabelProps={{ shrink: true }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextField
                  fullWidth
                  type="email"
                  variant="outlined"
                  label="Email"
                  placeholder="Enter email address"
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <div>
                <TextField
                  fullWidth
                  type="tel"
                  variant="outlined"
                  label="Phone Number"
                  placeholder="Enter phone number"
                  InputLabelProps={{ shrink: true }}
                />
              </div>
            </div>

            {/* More full-width fields */}
            <div>
              <TextField
                fullWidth
                variant="outlined"
                label="Fax"
                placeholder="Enter fax"
                InputLabelProps={{ shrink: true }}
              />
            </div>

            <div>
              <TextField
                fullWidth
                variant="outlined"
                label="Statistic Code"
                placeholder="Enter statistic code"
                InputLabelProps={{ shrink: true }}
              />
            </div>

            <div>
              <TextField
                fullWidth
                variant="outlined"
                label="Notes"
                placeholder="Write your note"
                multiline
                rows={3}
                InputLabelProps={{ shrink: true }}
              />
            </div>

            {/* Save button */}
            {/* RESPONSIVE: Aligns button to the right on desktop, but makes it full-width for easier tapping on mobile */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-6 py-2.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Company Detail
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bank Accounts Card */}
      {/* RESPONSIVE: Adjusted padding and margin-top */}
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mt-8 md:mt-10">
        {/* RESPONSIVE: Header stacks vertically on mobile and horizontally on larger screens */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Bank accounts
          </h2>
          <button
            type="button"
            // RESPONSIVE: Button is full-width on mobile
            className="w-full sm:w-auto text-blue-600 border border-blue-600 hover:bg-blue-50 font-medium rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add account
          </button>
        </div>

        {/* --- DESKTOP TABLE VIEW --- */}
        {/* RESPONSIVE: Table is hidden on mobile screens (`hidden`) and shown from `md` breakpoint up (`md:block`) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-left divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[ "No", "Bank", "Bank account", "Currency", "Default", "Action" ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-sm font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bankAccounts.map((account) => (
                <tr key={account.no}>
                  <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">{account.no}</td>
                  <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">{account.bank}</td>
                  <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">{account.account}</td>
                  <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">{account.currency}</td>
                  <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {account.default && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">Default</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-blue-600 hover:underline cursor-pointer whitespace-nowrap">
                    Edit
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE CARD VIEW --- */}
        {/* RESPONSIVE: This card list is shown only on mobile (`block`) and hidden from `md` up (`md:hidden`) */}
        <div className="block md:hidden space-y-4">
            {bankAccounts.map((account) => (
                <div key={account.no} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                    <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold text-gray-800">{account.bank}</p>
                        {account.default && (
                           <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">Default</span>
                        )}
                    </div>
                    <div className="text-sm text-gray-600">
                        <p>
                            <span className="font-medium text-gray-800">Account No:</span> {account.account}
                        </p>
                        <p>
                            <span className="font-medium text-gray-800">Currency:</span> {account.currency}
                        </p>
                    </div>
                     <div className="pt-2">
                        <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Edit Account</a>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;