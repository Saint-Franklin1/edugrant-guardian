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
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-sm">EV</span>
            </div>
            <span className="font-heading font-bold text-lg">Elimu Vault</span>
          </div>
          <div className="flex items-center gap-3">
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
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <ShieldCheck className="h-4 w-4" />
                  Trusted by Government Institutions
                </div>
                <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1]">
                  Access Bursaries
                  <span className="text-primary"> Without </span>
                  Paperwork
                </h1>
                <p className="text-lg text-muted-foreground mt-4 max-w-lg">
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
                    <span className="text-sm text-foreground/80">{b}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline">
                    Learn How It Works
                  </Button>
                </a>
              </div>
            </div>

            {/* Animated illustration */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl -rotate-3" />
              <div className="relative space-y-4 p-8">
                {[
                  { icon: Upload, label: 'Upload Documents', desc: 'Birth certificate, fee structure, IDs...', color: 'bg-primary/10 text-primary' },
                  { icon: QrCode, label: 'Get Education ID', desc: 'Unique QR code for instant verification', color: 'bg-accent/10 text-accent' },
                  { icon: ShieldCheck, label: 'Approval Flow', desc: 'Chief → Admin → Verified & Funded', color: 'bg-info/10 text-info' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-5 bg-card rounded-xl border shadow-sm animate-fade-in"
                    style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'backwards' }}
                  >
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    {i < 2 && (
                      <ArrowRight className="h-5 w-5 text-muted-foreground/30 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-card border-y">
        <div className="container px-4">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Three simple steps to secure your bursary funding.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', icon: Upload, title: 'Upload Documents', desc: 'Submit your birth certificate, school IDs, fee structures, and other required documents securely.' },
              { step: '02', icon: ShieldCheck, title: 'Get Verified', desc: 'Your local chief and county administrators review and verify your documents through a transparent process.' },
              { step: '03', icon: QrCode, title: 'Apply Anywhere', desc: 'Use your unique Education ID and QR code to apply for bursaries at any institution — no more re-uploading.' },
            ].map((s, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mx-auto">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="text-xs font-heading font-bold text-primary tracking-widest">{s.step}</div>
                <h3 className="font-heading text-lg font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl font-bold">Built for Trust & Transparency</h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
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
              <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Guide */}
      <section className="py-20 bg-card border-y">
        <div className="container px-4">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl font-bold">For Every Role</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Whether you're a student, chief, or administrator — Elimu Vault guides you every step of the way.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: GraduationCap,
                title: 'Students',
                color: 'bg-primary/10 text-primary',
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
                color: 'bg-accent/10 text-accent',
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
                color: 'bg-info/10 text-info',
                steps: [
                  'Select your admin level after login',
                  'Complete geographic profile',
                  'Review chief-approved applications',
                  'Issue final verification and Education IDs',
                  'Manage bursary lifecycle and disbursements',
                ],
              },
            ].map((r, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="pt-6 space-y-5">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${r.color}`}>
                    <r.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{r.title}</h3>
                  <ol className="space-y-2.5">
                    {r.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm">
                        <span className="shrink-0 h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {j + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
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
      <section className="py-20">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="font-heading text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground">
              Join thousands of students already using Elimu Vault to access bursary funding without the paperwork hassle.
            </p>
            <div className="flex justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  Create Your Account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Elimu Vault. Secure Financial Aid — Unlocking Futures.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
