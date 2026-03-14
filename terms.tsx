export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8 animate-in fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-gradient">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">Last updated: March 2026</p>
      </div>

      <div className="glass p-8 rounded-[2rem] space-y-6 text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing and using My Daily Budget, you accept and agree to be bound by the terms and provisions of this agreement.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">2. Use of Service</h2>
          <p>My Daily Budget is a personal finance tracking tool. You agree to use it only for lawful purposes and in a way that does not infringe the rights of others.</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>You must provide accurate information when creating your account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You may not share your account credentials with others</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">3. Financial Data Disclaimer</h2>
          <p>My Daily Budget is a personal tracking tool only. We do not provide financial advice, and the information displayed is based solely on data you provide. We are not responsible for financial decisions made based on the app's output.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">4. Limitation of Liability</h2>
          <p>My Daily Budget is provided "as is" without any warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">5. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">6. Contact</h2>
          <p>For questions about these Terms, please <a href="/contact" className="text-primary underline">contact us</a>.</p>
        </section>
      </div>
    </div>
  );
}
