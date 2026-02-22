import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, MapPin, Linkedin, ChevronDown, ChevronUp, ExternalLink, Mail, Phone } from "lucide-react";
import InlineChat from "@/components/InlineChat";

interface PersonalInfo {
  name: string;
  title: string;
  linkedin: string;
  location: string;
  photo: string;
  email?: string;
  phone?: string;
}

interface About {
  title: string;
  introduction: string;
  highlights: string[];
  keyTechnologies: string[];
}

interface ProjectDetails {
  contextAndProblem?: string;
  constraintsAndRisks?: string;
  solutionAndArchitecture?: string;
  implementation?: string;
  implementationAndOperation?: string;
  evaluation?: string;
  impact?: string;
  keyLearnings?: string;
}

interface PortfolioItem {
  title: string;
  executiveSummary: string;
  image?: string;
  details: ProjectDetails;
}

interface ResumeItem {
  title: string;
  company: string;
  period: string;
  summary: string;
  details: string[];
}

interface Achievement {
  title: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface PortfolioData {
  personalInfo: PersonalInfo;
  about: About;
  portfolio: PortfolioItem[];
  achievements: Achievement[];
  education: Education[];
  resume: ResumeItem[];
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const [expanded, setExpanded] = useState(false);

  const detailSections = [
    { key: "contextAndProblem", label: "Context & Problem" },
    { key: "constraintsAndRisks", label: "Constraints & Risks" },
    { key: "solutionAndArchitecture", label: "Solution & Architecture" },
    { key: "implementation", label: "Implementation" },
    { key: "implementationAndOperation", label: "Implementation & Operation" },
    { key: "evaluation", label: "Evaluation" },
    { key: "impact", label: "Impact" },
    { key: "keyLearnings", label: "Key Learnings" },
  ] as const;

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden transition-all duration-200 hover:border-primary/40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-start justify-between gap-4 group"
        aria-expanded={expanded}
      >
        {/* Thumbnail: only shown when collapsed and image exists */}
        {item.image && !expanded && (
          <div className="flex-shrink-0">
            <img
              src={item.image}
              alt={item.title}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-contain border border-border bg-muted/40 p-1"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-foreground mb-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.executiveSummary}
          </p>
        </div>
        <div className="flex-shrink-0 mt-1 text-muted-foreground group-hover:text-primary transition-colors">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
          {/* Full image shown at top of expanded section */}
          {item.image && (
            <div className="rounded-lg overflow-hidden border border-border bg-muted/30">
              <img
                src={item.image}
                alt={item.title}
                className="w-full object-contain max-h-80"
              />
            </div>
          )}
          {detailSections.map(({ key, label }) => {
            const value = item.details[key as keyof ProjectDetails];
            if (!value) return null;
            return (
              <div key={key}>
                <h4 className="text-xs font-semibold text-primary tracking-wide mb-1.5">
                  {label}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AchievementCard({ item }: { item: Achievement }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden transition-all duration-200 hover:border-primary/40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-start justify-between gap-4 group"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-primary text-xs font-bold">★</span>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </h3>
          </div>
        </div>
        <div className="flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        </div>
      )}
    </div>
  );
}

function ResumeCard({ item }: { item: ResumeItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden transition-all duration-200 hover:border-primary/40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-start justify-between gap-4 group"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm font-medium text-primary">{item.company}</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {item.period}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
        </div>
        <div className="flex-shrink-0 mt-1 text-muted-foreground group-hover:text-primary transition-colors">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4">
          <ul className="space-y-2">
            {item.details.map((detail, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5 flex-shrink-0">▸</span>
                <span className="leading-relaxed">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"portfolio" | "resume">("portfolio");
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data.json")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Failed to load portfolio data.</div>
      </div>
    );
  }

  const { personalInfo, about, portfolio, achievements, education, resume } = data;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Profile info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
                <img
                  src="/profile.jpg"
                  alt={personalInfo.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 hidden sm:block">
                <p className="font-semibold text-sm leading-tight truncate">{personalInfo.name}</p>
                <p className="text-xs text-muted-foreground truncate">{personalInfo.title}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <Button
                variant={activeTab === "portfolio" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("portfolio")}
                className="text-xs"
              >
                Portfolio
              </Button>
              <Button
                variant={activeTab === "resume" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("resume")}
                className="text-xs"
              >
                Resume
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-xs ml-1"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={14} className="mr-1" /> : <Moon size={14} className="mr-1" />}
                <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="container py-8">

          {/* Portfolio Tab */}
          {activeTab === "portfolio" && (
            <div className="space-y-6">
              {/* Hero section */}
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pb-6 border-b border-border">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-primary/20 flex-shrink-0">
                  <img
                    src="/profile.jpg"
                    alt={personalInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                    {personalInfo.name}
                  </h1>
                  <p className="text-base text-primary font-medium mb-3">{personalInfo.title}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} />
                      {personalInfo.location}
                    </span>
                    <a
                      href={personalInfo.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Linkedin size={13} />
                      LinkedIn
                      <ExternalLink size={11} />
                    </a>
                    {personalInfo.email && (
                      <a
                        href={`mailto:${personalInfo.email}`}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        <Mail size={13} />
                        {personalInfo.email}
                      </a>
                    )}
                    {personalInfo.phone && (
                      <a
                        href={`tel:${personalInfo.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        <Phone size={13} />
                        {personalInfo.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Chat — below hero, above About Me */}
              <InlineChat ownerName={personalInfo.name} />

              {/* About section */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-lg font-semibold text-foreground mb-3">{about.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {about.introduction}
                </p>
                <div className="flex flex-wrap gap-2">
                  {about.keyTechnologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs font-normal">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Projects</h2>
                <div className="space-y-3">
                  {portfolio.map((item, i) => (
                    <PortfolioCard key={i} item={item} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resume Tab */}
          {activeTab === "resume" && (
            <div className="space-y-6">
              {/* AI Chat */}
              <InlineChat ownerName={personalInfo.name} />

              {/* About Me */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-lg font-semibold text-foreground mb-3">About Me</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {about.introduction}
                </p>
                <div className="space-y-1.5">
                  {about.highlights.map((h, i) => (
                    <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5 flex-shrink-0">▸</span>
                      <span className="leading-relaxed">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-base font-semibold text-foreground mb-3">Key Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {about.keyTechnologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs font-normal">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Experience</h2>
                <div className="space-y-3">
                  {resume.map((item, i) => (
                    <ResumeCard key={i} item={item} />
                  ))}
                </div>
              </div>

              {/* Key Achievements */}
              {achievements && achievements.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Key Achievements</h2>
                  <div className="space-y-3">
                    {achievements.map((item, i) => (
                      <AchievementCard key={i} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education && education.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h2 className="text-base font-semibold text-foreground mb-4">Education</h2>
                  <div className="space-y-3">
                    {education.map((item, i) => (
                      <div key={i} className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground leading-snug">{item.degree}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.institution}</p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0 mt-0.5">{item.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Linkedin size={14} />
                LinkedIn
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                {personalInfo.location}
              </span>
            </div>
            <p>© {new Date().getFullYear()} {personalInfo.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>


    </div>
  );
}
