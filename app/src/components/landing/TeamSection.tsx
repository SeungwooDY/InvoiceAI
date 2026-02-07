import { Linkedin, Twitter } from 'lucide-react';
interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  education: {
    university: string;
    degree: string;
    logo?: string;
  };
  previousCompanies: {
    name: string;
    role: string;
    logo?: string;
  }[];
  social?: {
    linkedin?: string;
    twitter?: string;
  };
}
const teamMembers: TeamMember[] = [{
  name: "Alex Chen",
  role: "CEO & Co-Founder",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  bio: "Former fintech executive with 15+ years building payment infrastructure at scale.",
  education: {
    university: "Stanford University",
    degree: "MBA, Finance",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stanford_Cardinal_logo.svg/200px-Stanford_Cardinal_logo.svg.png"
  },
  previousCompanies: [{
    name: "Stripe",
    role: "VP of Product"
  }, {
    name: "Goldman Sachs",
    role: "Director"
  }, {
    name: "McKinsey",
    role: "Consultant"
  }],
  social: {
    linkedin: "#",
    twitter: "#"
  }
}, {
  name: "Sarah Martinez",
  role: "CTO & Co-Founder",
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  bio: "Engineering leader who scaled systems processing billions in transactions.",
  education: {
    university: "MIT",
    degree: "MS, Computer Science",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png"
  },
  previousCompanies: [{
    name: "Google",
    role: "Staff Engineer"
  }, {
    name: "Plaid",
    role: "Engineering Lead"
  }, {
    name: "Square",
    role: "Senior Engineer"
  }],
  social: {
    linkedin: "#",
    twitter: "#"
  }
}, {
  name: "Michael Roberts",
  role: "CPO & Co-Founder",
  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  bio: "Product visionary focused on delightful B2B experiences that drive adoption.",
  education: {
    university: "Harvard Business School",
    degree: "MBA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_coat_of_arms.svg/200px-Harvard_University_coat_of_arms.svg.png"
  },
  previousCompanies: [{
    name: "Shopify",
    role: "Director of Product"
  }, {
    name: "Intuit",
    role: "Product Manager"
  }, {
    name: "Deloitte",
    role: "Strategy Consultant"
  }],
  social: {
    linkedin: "#",
    twitter: "#"
  }
}];
export function TeamSection() {
  return <section id="team" className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
            Our Team
          </span>
          <h2 className="text-4xl md:text-5xl font-bold gradient-text">
            Built by Builders at the University of Virginia
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We are first-year students at the University of Virginia focused on building practical, modern solutions from the ground up. We move fast, test aggressively, and design with today’s technology — not yesterday’s playbooks.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map(member => <div key={member.name} className="glass-card p-6 rounded-2xl group hover:border-primary/30 transition-all duration-300">
              {/* Profile Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <img src={member.image} alt={member.name} className="w-20 h-20 rounded-xl object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all" />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-success flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{member.name}</h3>
                  <p className="text-primary font-medium">{member.role}</p>
                  <div className="flex gap-2 mt-2">
                    {member.social?.linkedin && <a href={member.social.linkedin} className="p-1.5 rounded-lg bg-muted/50 hover:bg-primary/20 transition-colors" aria-label="LinkedIn">
                        <Linkedin className="w-4 h-4 text-muted-foreground" />
                      </a>}
                    {member.social?.twitter && <a href={member.social.twitter} className="p-1.5 rounded-lg bg-muted/50 hover:bg-primary/20 transition-colors" aria-label="Twitter">
                        <Twitter className="w-4 h-4 text-muted-foreground" />
                      </a>}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-muted-foreground text-sm mb-6">{member.bio}</p>

              {/* Education */}
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Education</h4>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-xs font-bold text-primary">
                    🎓
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.education.university}</p>
                    <p className="text-xs text-muted-foreground">{member.education.degree}</p>
                  </div>
                </div>
              </div>

              {/* Previous Companies */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Previous Experience</h4>
                <div className="space-y-2">
                  {member.previousCompanies.map((company, idx) => <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{company.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{company.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{company.role}</p>
                      </div>
                    </div>)}
                </div>
              </div>
            </div>)}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Interested in joining our mission to transform B2B payments?
          </p>
          <a href="#" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors border border-primary/20">
            View Open Positions
            <span>→</span>
          </a>
        </div>
      </div>
    </section>;
}