import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload, QrCode, ShieldCheck, FileCheck, Search, Lock, Eye,
  GraduationCap, UserCog, Users, ArrowRight, CheckCircle2
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">EV</span>
            </div>
            <span className="font-semibold text-base tracking-tight">Elimu Vault</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Trusted by Government Institutions
                </div>
                <h1 className="text-4xl lg:text-[3.25rem] font-extrabold leading-[1.1] tracking-tight">
                  Access Bursaries
                  <br />
                  <span className="text-primary">Without Paperwork</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                  Upload your documents once, get verified, and apply for bursaries anywhere — all from a single secure platform.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  'Upload once, use everywhere — no repeated paperwork',
                  'Instant QR-based verification for any institution',
                  'Transparent tracking from submission to disbursement',
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{b}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/register">
                  <Button size="lg" className="gap-2 h-12 px-6 rounded-xl">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="h-12 px-6 rounded-xl">
                    Learn How It Works
                  </Button>
                </a>
              </div>
            </div>

            {/* Flow illustration */}
            <div className="hidden lg:block">
              <div className="space-y-4">
                {[
                  { icon: Upload, label: 'Upload Documents', desc: 'Birth certificate, fee structure, IDs...', step: '01' },
                  { icon: QrCode, label: 'Get Education ID', desc: 'Unique QR code for instant verification', step: '02' },
                  { icon: ShieldCheck, label: 'Approval Flow', desc: 'Chief → Admin → Verified & Funded', step: '03' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-5 p-6 bg-card rounded-2xl border shadow-sm animate-fade-in"
                    style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'backwards' }}
                  >
                    <div className="h-12 w-12 rounded-2xl bg-primary/8 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground/40">{item.step}</span>
                  </div>
                ))}
              </div>
            </div>
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
