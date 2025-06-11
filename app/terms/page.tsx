export default function TermsOfService() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Terms of Service</h1>
      <p className="mb-4">
        Welcome to StockAlert. By accessing or using our service, you agree to be bound by these Terms of Service.
        Please read them carefully.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">1. Use of Service</h2>
      <p className="mb-4">
        You agree to use StockAlert only for lawful purposes and in accordance with these terms. Misuse of the
        service may result in account suspension or termination.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">2. Accounts</h2>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account credentials and all activities that
        occur under your account.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">3. Payments and Subscriptions</h2>
      <p className="mb-4">
        Certain features require a subscription. Payments are billed in advance on a recurring basis unless canceled.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">4. Termination</h2>
      <p className="mb-4">
        We reserve the right to suspend or terminate your access if you violate any part of these terms.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">5. Modifications</h2>
      <p className="mb-4">
        We may update these terms from time to time. Continued use of the service after changes constitutes acceptance.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">6. Contact</h2>
      <p className="mb-4">
        For questions regarding these terms, please email us at support@stockalert.com.
      </p>

      <p className="mt-8">Last updated: {new Date().toLocaleDateString()}</p>
    </main>
  );
}
