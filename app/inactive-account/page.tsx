export default function InactiveAccountPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Account Inactive</h1>
        <p className="text-slate-600 mb-6">
          Your account is currently inactive. This may be due to non-payment or administrative action.
        </p>
        <p className="text-sm text-slate-500">
          Please contact the class administrator at <span className="font-medium text-indigo-600">admin@example.com</span> to resolve this issue.
        </p>
      </div>
    </div>
  );
}
