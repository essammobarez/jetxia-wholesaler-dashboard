// pages/company-detail.tsx
import { NextPage } from "next";
import TextField from "@mui/material/TextField";

const CompanyDetailPage: NextPage = () => {
  return (
    <div className="min-h-screen -ml-56 -mt-10 bg-gray-50 py-10 px-4 flex flex-col items-center">
      {/* Company Detail Card */}
      <div className="relative w-full max-w-4xl">
        {/* Tab label */}
        <span className="absolute -top-3 left-6 bg-gray-100 text-gray-700 text-sm font-medium px-4 py-1 rounded-t-lg border border-gray-200 border-b-0">
          Company Detail
        </span>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm pt-6 px-8 pb-8 mt-2">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
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

            {/* Two-column rows */}
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
            <div className="text-right">
              <button
                type="submit"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-6 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Company Detail
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bank Accounts Card */}
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Bank accounts
          </h2>
          <button
            type="button"
            className="text-blue-600 border border-blue-600 hover:bg-blue-50 font-medium rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add account
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "No",
                  "Bank",
                  "Bank account",
                  "Currency",
                  "Default",
                  "Action",
                ].map((h) => (
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
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">1</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  Mashreq Bank
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  232423424232423424
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">USD</td>
                <td className="px-4 py-3 text-sm text-gray-900">Default</td>
                <td className="px-4 py-3 text-sm text-blue-600 hover:underline cursor-pointer">
                  Action
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;
