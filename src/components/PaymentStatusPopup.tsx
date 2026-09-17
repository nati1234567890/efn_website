export type PaymentStatus =
  | "NONE"
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "REFUNDED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "NEEDS_REVIEW"
  | null;

interface PaymentStatusPopupProps {
  status: PaymentStatus;
  transactionRefId: string | null;
  data: any | null;
  onClose: () => void;
  onCancel: () => void;
}

export default function PaymentStatusPopup({
  status,
  transactionRefId,
  data,
  onClose,
  onCancel,
}: PaymentStatusPopupProps) {
  if (!status) return null;

  const isProcessing = [
    "NONE",
    "PENDING",
    "PROCESSING",
    "NEEDS_REVIEW",
  ].includes(status);
  const isSuccess = status === "COMPLETED";
  const isError = ["FAILED", "CANCELLED", "EXPIRED"].includes(status);
  const isWarning = ["REFUNDED"].includes(status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border relative overflow-hidden max-h-[90vh] overflow-y-auto ${
          isSuccess
            ? "border-green-300/60"
            : isError
              ? "border-red-300/60"
              : isWarning
                ? "border-yellow-300/60"
                : "border-amber-200/60"
        }`}
      >
        {/* Background Gradients */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none ${
            isSuccess
              ? "bg-gradient-to-br from-green-400/10 to-emerald-400/10"
              : isError
                ? "bg-gradient-to-br from-red-400/10 to-rose-400/10"
                : isWarning
                  ? "bg-gradient-to-br from-yellow-400/10 to-orange-400/10"
                  : "bg-gradient-to-br from-amber-400/10 to-rose-400/10"
          }`}
        />
        <div
          className={`absolute bottom-0 left-0 w-24 h-24 rounded-tr-full pointer-events-none ${
            isSuccess
              ? "bg-gradient-to-tr from-emerald-400/10 to-green-400/10"
              : isError
                ? "bg-gradient-to-tr from-rose-400/10 to-red-400/10"
                : isWarning
                  ? "bg-gradient-to-tr from-orange-400/10 to-yellow-400/10"
                  : "bg-gradient-to-tr from-orange-400/10 to-yellow-400/10"
          }`}
        />

        <div className="relative z-10 text-center">
          {/* Icons based on status */}
          <div className="flex justify-center mb-4">
            {isProcessing && (
              <svg
                className="animate-spin h-16 w-16 text-amber-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}
            {isSuccess && (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            {isError && (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
            {isWarning && (
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Titles & Descriptions */}
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
            {isProcessing && "Processing Payment"}
            {status === "COMPLETED" && "Payment Successful! 🎉"}
            {status === "FAILED" && "Payment Failed"}
            {status === "CANCELLED" && "Payment Cancelled"}
            {status === "EXPIRED" && "Session Expired"}
            {status === "REFUNDED" && "Payment Refunded"}
            {status === "NEEDS_REVIEW" && "Manual Review Required"}
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            {isProcessing &&
              "Please check your mobile phone and enter your pin to authorize the USSD push."}
            {status === "COMPLETED" &&
              "Your booking has been confirmed. Thank you for your purchase!"}
            {status === "FAILED" &&
              "Unfortunately, your payment could not be completed."}
            {status === "CANCELLED" && "The payment was cancelled."}
            {status === "EXPIRED" &&
              "The payment request timed out before completion."}
            {status === "REFUNDED" &&
              "The funds have been returned to your account."}
            {status === "NEEDS_REVIEW" &&
              "Your transaction was flagged and is awaiting manual verification."}
          </p>

          {/* Dynamic Content Details */}
          {isProcessing && (
            <div className="bg-blue-50 rounded-xl p-4 mb-4 text-left">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                USSD Instructions
              </p>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p>
                  Status: <span className="font-semibold">{status}</span>
                </p>
                {transactionRefId && (
                  <p className="text-xs text-slate-500 mt-2">
                    Reference: {transactionRefId}
                  </p>
                )}
              </div>
            </div>
          )}

          {data && !isProcessing && (
            <div
              className={`rounded-xl p-4 mb-6 text-left ${
                isSuccess
                  ? "bg-green-50"
                  : isError
                    ? "bg-red-50"
                    : "bg-yellow-50"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                  isSuccess
                    ? "text-green-700"
                    : isError
                      ? "text-red-700"
                      : "text-yellow-700"
                }`}
              >
                Transaction Details
              </p>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="text-slate-800">
                    {data.amount} {data.currencyCode || "ETB"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Transaction ID:</span>
                  <span className="text-slate-800 text-xs truncate max-w-[150px]">
                    {data.merchantTransactionId}
                  </span>
                </div>
                {data.transactionRefId && (
                  <div className="flex justify-between">
                    <span className="font-medium">Reference ID:</span>
                    <span className="text-slate-800 text-xs truncate max-w-[150px]">
                      {data.transactionRefId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-4">
            {isProcessing ? (
              <>
                <button
                  disabled
                  className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 opacity-60 cursor-not-allowed shadow-md"
                >
                  Waiting for confirmation...
                </button>
                <button
                  onClick={onCancel}
                  className="w-full py-3 rounded-xl font-semibold text-red-600 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                >
                  ❌ Cancel Payment
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg ${
                  isSuccess
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600"
                    : isError
                      ? "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600"
                }`}
              >
                {isError ? "Close" : "Done"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
