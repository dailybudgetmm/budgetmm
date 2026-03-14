export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8 animate-in fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-gradient">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: March 2026</p>
      </div>

      <div className="glass p-8 rounded-[2rem] space-y-6 text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
          <p>We collect information you provide directly when you register for an account, including your name, email address, and profile photo provided via Google authentication.</p>
          <p>We also collect transaction data you enter, including amounts, categories, currencies, and descriptions.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">2. How We Use Your Information</h2>
          <p>We use your information to provide, maintain, and improve My Daily Budget, including to:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Display your financial transactions and reports</li>
            <li>Personalize your experience</li>
            <li>Respond to your support messages</li>
            <li>Improve our services</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">3. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information. Authentication is handled through Google Firebase, which employs industry-standard security practices.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">4. Data Retention</h2>
          <p>We retain your data for as long as your account is active. You can request deletion of your account and associated data by contacting us.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please use our <a href="/contact" className="text-primary underline">Contact</a> page to reach us.</p>
        </section>
      </div>
    </div>
  );
}
