import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { FileText, CheckCircle2, Zap, Shield, Users, BarChart3, ArrowRight, Building2, Globe, Clock, Star } from 'lucide-react';
import { TeamSection } from '../components/landing/TeamSection';
const features = [{
  icon: FileText,
  title: 'Smart Invoice Processing',
  description: 'Automatically extract data from invoices with OCR technology. No more manual data entry.'
}, {
  icon: CheckCircle2,
  title: 'Approval Workflows',
  description: 'Customizable approval routing based on amount, department, or vendor. Never miss an approval.'
}, {
  icon: Zap,
  title: 'Real-time Sync',
  description: 'Instant synchronization with your accounting software. Keep your books always up to date.'
}, {
  icon: Shield,
  title: 'Bank-level Security',
  description: 'Enterprise-grade encryption and compliance. Your financial data is always protected.'
}, {
  icon: Users,
  title: 'Team Collaboration',
  description: 'Role-based access control and audit trails. Work together securely.'
}, {
  icon: BarChart3,
  title: 'Advanced Analytics',
  description: 'Powerful insights into your payables. Make data-driven financial decisions.'
}];
const stats = [{
  value: '50K+',
  label: 'Invoices Processed Monthly'
}, {
  value: '99.9%',
  label: 'Uptime Guarantee'
}, {
  value: '2,500+',
  label: 'Companies Trust Us'
}, {
  value: '75%',
  label: 'Time Saved on AP'
}];
const testimonials = [{
  quote: "PayFlow has transformed our accounts payable process. What used to take days now takes hours.",
  author: "Sarah Chen",
  role: "CFO",
  company: "TechStart Inc."
}, {
  quote: "The approval workflows alone have saved us countless hours and eliminated payment errors.",
  author: "Michael Roberts",
  role: "Finance Director",
  company: "Global Logistics Co."
}, {
  quote: "Finally, a payables solution that actually understands what finance teams need.",
  author: "Emily Watson",
  role: "Controller",
  company: "Innovate Labs"
}];
export default function Landing() {
  return <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-semibold text-foreground">PayFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#team" className="text-muted-foreground hover:text-foreground transition-colors">Our Team</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button className="liquid-glass-button">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Trusted by 2,500+ companies worldwide</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Automate Your
            <span className="gradient-text block">​Invoice Workflow </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Streamline invoice processing, approvals, and payments. 
            PayFlow helps finance teams save time, reduce errors, and gain visibility into their payables.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="liquid-glass-button text-lg px-8">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-border/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>)}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need to
              <span className="gradient-text"> Manage Payables</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete suite of tools designed for modern finance teams
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => <div key={index} className="glass-card p-8 group hover:border-primary/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How PayFlow <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes, not weeks
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="glass-card p-8 h-full">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Upload Invoices</h3>
                <p className="text-muted-foreground">
                  Upload invoices via email, drag & drop, or API. Our OCR extracts all key data automatically.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/50" />
            </div>
            <div className="relative">
              <div className="glass-card p-8 h-full">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Review & Approve</h3>
                <p className="text-muted-foreground">
                  Route invoices through customizable approval workflows. Approvers can act from anywhere.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/50" />
            </div>
            <div className="glass-card p-8 h-full">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Pay & Reconcile</h3>
              <p className="text-muted-foreground">
                Schedule payments and automatically reconcile with your bank. Full visibility, zero hassle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Loved by <span className="gradient-text">Finance Teams</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <div key={index} className="glass-card p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-primary text-primary" />)}
                </div>
                <p className="text-foreground text-lg mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-muted-foreground text-sm">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* Trust Section */}
      <section className="py-16 px-6 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-muted-foreground">Trusted by leading companies</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
            <Building2 className="w-12 h-12 text-muted-foreground" />
            <Globe className="w-12 h-12 text-muted-foreground" />
            <Clock className="w-12 h-12 text-muted-foreground" />
            <Shield className="w-12 h-12 text-muted-foreground" />
            <BarChart3 className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="orb orb-1" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Transform Your
            <span className="gradient-text block">Accounts Payable?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of finance teams who have streamlined their AP process with PayFlow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="liquid-glass-button text-lg px-8">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Contact Sales
            </Button>
          </div>
          <p className="text-muted-foreground mt-6 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-semibold text-foreground">PayFlow</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Modern accounts payable automation for growing businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 text-center text-muted-foreground text-sm">
            © 2026 PayFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>;
}