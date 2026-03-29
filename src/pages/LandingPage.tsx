import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload, QrCode, ShieldCheck, FileCheck, Search, Lock, Eye,
  GraduationCap, UserCog, Users, ArrowRight, CheckCircle2, ClipboardCheck
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="py-6">
        <div className="container flex flex-col items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Elimu<br className="hidden" /> Vault
            </span>
          </div>
          {/* Nav Links */}
          <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Home</a>
            <a href="#about" className="hover:text-foreground transition-colors">About Us</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">Bursaries</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Access Bursaries Without Paperwork
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Streamline your application and secure your educational funding digitally, with full transparency and efficiency.
            </p>
          </div>

          {/* Three Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-14 max-w-4xl mx-auto">
            {[
              {
                icon: Upload,
                title: 'Upload Documents',
                desc: 'Securely submit your required documents directly from your device.',
              },
              {
                icon: ClipboardCheck,
                title: 'Get Education ID',
                desc: 'Instantly receive your unique digital Education ID for tracking.',
              },
              {
                icon: ShieldCheck,
                title: 'Approval Flow',
                desc: 'Track the status of your bursary application in real-time.',
              },
            ].map((item, i) => (
              <Card key={i} className="rounded-2xl border-2 border-border shadow-sm text-center hover:shadow-md transition-shadow">
                <CardContent className="p-8 space-y-4">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-amber-50 mx-auto">
                    <item.icon className="h-7 w-7 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-base">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mt-12">
            <Link to="/register" className="w-full max-w-md">
              <Button size="lg" className="w-full h-14 text-base font-semibold rounded-xl">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-t bg-card">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Three simple steps to secure your bursary funding.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-3xl mx-auto">
            {[
              { step: '01', icon: Upload, title: 'Upload Documents', desc: 'Submit your birth certificate, school IDs, fee structures, and other required documents securely.' },
              { step: '02', icon: ShieldCheck, title: 'Get Verified', desc: 'Your local chief and county administrators review and verify your documents through a transparent process.' },
              { step: '03', icon: QrCode, title: 'Apply Anywhere', desc: 'Use your unique Education ID and QR code to apply for bursaries at any institution.' },
            ].map((s, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/8 mx-auto">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary tracking-widest uppercase">{s.step}</div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 border-t">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Built for Trust & Transparency</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Every feature is designed to ensure accountability, prevent fraud, and accelerate funding.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileCheck, title: 'Document Verification', desc: 'Automated checks validate every document on upload — format, type, and content.' },
              { icon: Search, title: 'Fraud Detection', desc: 'Real-time flagging of suspicious uploads with full audit trail for reviewers.' },
              { icon: Lock, title: 'Secure Storage', desc: 'Private, encrypted file storage. Only authorized officials can access your documents.' },
              { icon: Eye, title: 'Admin Transparency', desc: 'Scoped dashboards ensure admins see only their jurisdiction — county, constituency, or ward.' },
            ].map((f, i) => (
              <Card key={i} className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Guide */}
      <section className="py-20 border-t bg-card">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">For Every Role</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Whether you're a student, chief, or administrator — Elimu Vault guides you every step of the way.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Students',
                steps: [
                  'Register and complete your profile',
                  'Create a student application',
                  'Upload required documents (PDF only)',
                  'Submit for chief review',
                  'Track status and receive your Education ID',
                ],
              },
              {
                icon: Users,
                title: 'Chiefs',
                steps: [
                  'Log in with your assigned credentials',
                  'View applications from your ward',
                  'Review documents and flag issues',
                  'Approve or reject with comments',
                  'Monitor flagged documents',
                ],
              },
              {
                icon: UserCog,
                title: 'Administrators',
                steps: [
                  'Accept invite from Super Admin',
                  'Complete geographic profile',
                  'Review chief-approved applications',
                  'Issue final verification and Education IDs',
                  'Manage bursary lifecycle and disbursements',
                ],
              },
            ].map((r, i) => (
              <Card key={i} className="rounded-2xl border shadow-sm">
                <CardContent className="p-6 space-y-5">
                  <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center">
                    <r.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{r.title}</h3>
                  <ol className="space-y-3">
                    {r.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <span className="shrink-0 h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[11px] font-semibold text-muted-foreground mt-0.5">
                          {j + 1}
                        </span>
                        <span className="text-muted-foreground leading-snug">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t">
        <div className="container">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Ready to Get Started?</h2>
            <p className="text-muted-foreground">
              Join thousands of students already using Elimu Vault to access bursary funding without the paperwork hassle.
            </p>
            <div className="flex justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="gap-2 h-12 px-6 rounded-xl">
                  Create Your Account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-12 px-6 rounded-xl">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Elimu Vault. Secure Financial Aid — Unlocking Futures.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
