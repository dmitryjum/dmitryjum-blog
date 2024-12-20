import { LayoutUpdater } from "./_components/LayoutUpdater";
import cn from "classnames";
import CollapsibleCard from "./_components/collapsible-card";
import { COMPANIES, TESTIMONIALS, TECHNOLOGIES } from "@/lib/constants";
import { Code2, Database, Zap, Rocket, BarChart2, CuboidIcon as Cube, TestTube, Users } from 'lucide-react'
import { getAllPosts } from "@/lib/api";
import  { HeroPost } from "./_components/hero-post";

export default function HomePage() {
  const lastPost = getAllPosts().slice(1)[0];
  const navBlogLink = lastPost ? '#blog' : '/blog'
  const NAVLINKS = [
    { href: '#intro', label: 'Introduction' },
    { href: '#services', label: 'My Services' },
    { href: '#companies', label: "My clients" },
    { href: '#technologies', label: 'My Technologies' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#projects', label: 'Recent work' },
    { href: navBlogLink, label: 'Blog' },
    { href: '#footer', label: 'Contact me' },
  ];

  const SERVICES = [
    {
      icon: Code2,
      title: "Custom Web Development",
      description: "From concept to deployment, I build scalable applications tailored to your business goals.",
      colorClass: "text-pink-400"
    },
    {
      icon: Database,
      title: "API Design & Integration",
      description: "Efficient and secure APIs to connect your systems and improve functionality.",
      colorClass: "text-purple-400"
    },
    {
      icon: Zap,
      title: "Real-Time Features",
      description: "Enhance user experiences with live updates and interactivity using modern frameworks.",
      colorClass: "text-yellow-400"
    },
    {
      icon: Rocket,
      title: "Fast Website Solutions",
      description: "Quick-to-deploy platforms like WordPress for businesses with tight timelines.",
      colorClass: "text-sky-400"
    },
    {
      icon: BarChart2,
      title: "Site Analytics Setup",
      description: "I set up and configure tools like Google Analytics, helping you make data-driven decisions to optimize your online presence.",
      colorClass: "text-green-400"
    },
    {
      icon: Cube,
      title: "Blockchain Development",
      description: "I bring expertise in blockchain platforms like Ethereum to create secure, transparent, and innovative solutions (dAPPs and smart contracts).",
      colorClass: "text-orange-400"
    },
    {
      icon: TestTube,
      title: "Automation Testing & TDD/BDD",
      description: "I implement Test-Driven Development (TDD) and Behavior-Driven Development (BDD) practices, along with automated testing suites, to catch issues early and maintain code integrity.",
      colorClass: "text-red-400"
    },
    {
      icon: Users,
      title: "Consulting & Programming Mentorship",
      description: "I offer consulting services to help you overcome technical challenges and provide mentorship to elevate your programming skills.",
      colorClass: "text-indigo-400"
    }
  ];

  return (
    <LayoutUpdater
      headerTitle='Dmitry Jum'
      headerSubtitle='Software Engineer | Web Developer'
      navLinks={NAVLINKS}
    >
      <div id="main">

        <section id="intro" className="main">
          <div className="spotlight">
            <div className="content">
              <header className="major">
                <h2>Building Modern Web Applications Tailored to Your Needs.</h2>
              </header>
              <p>I’m Dmitry, a full-stack developer with expertise in building scalable applications using modern tools like React.js,
                 Ruby on Rails, and TypeScript. Over the years, I’ve helped startups and established companies streamline their processes,
                  enhance user experiences, and scale their platforms efficiently.</p>
              <ul className="actions">
                <li><a href="/blog/posts/about-me" className="button">Learn More About Me</a></li>
                <li><a href="#footer" className="button">Reach out</a></li>
              </ul>
            </div>
            <span className="image"><img src="stellar/images/intro_shot.jpg" alt="" /></span>
          </div>
        </section>

        <section id="services" className="main bg-opacity-60 bg-gray-800">
          <div className="container mx-auto px-4">
            <header className="text-center mb-16">
              <h2 className="text-4xl font-light text-white mb-4">My Services and Expertise</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto"></div>
            </header>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 max-w-7xl mx-auto">
              {SERVICES.map((service, index) => (
                <li key={index} className="flex flex-col items-center text-center group">
                  <div className="relative mb-6 transition-transform duration-300 group-hover:scale-110">
                    <div className="w-28 h-28 rounded-full border-2 border-solid border-white flex items-center justify-center mb-4">
                      <div className="w-24 h-24 rounded-full border border-solid border-white flex items-center justify-center">
                        <service.icon className={cn("w-14 h-14 transition-all duration-300 group-hover:scale-125", service.colorClass)} />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">{service.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{service.description}</p>
                </li>
              ))}
            </ul>
            <footer className="major">
              <ul className="actions special">
                <li><a href="#footer" className="button">Get In Touch</a></li>
              </ul>
            </footer>
          </div>
        </section>

        <section id="companies" className="main special">
          <header className="major">
            <h2>Companies and clients I've worked for</h2>
            <p>Explore my journey through these amazing companies. Click the logo to learn more.</p>
          </header>
          <ul className="flex flex-wrap justify-center gap-8">
            {COMPANIES.map((company, index) => (
              <li key={index} className="flex flex-col items-center">
                <a href={company.link} className="block transition-transform duration-300 hover:scale-110">
                  <img src={company.logo} alt={`${company.name} Logo`} className="w-42 h-24" />
                  { company.name === "Invibox" && <span className="block align-center">{company.name}</span> }
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section id="technologies" className="main special bg-opacity-60 bg-gray-800">
          <header className="major">
            <h2>Technologies I Work With</h2>
            <p>Front-end, Back-end, and Everything in Between</p>
          </header>

          <ul className="flex flex-wrap justify-center gap-8">
            {TECHNOLOGIES.map((tech, index) => (
              <li key={index} className="flex flex-col items-center">
                <img src={tech.logo} alt={`${tech.name} Logo`} className="w-42 h-24 mb-2 transition-transform duration-300 hover:scale-110" />
                <span className="text-white">{tech.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="testimonials" className="main special">
          <header className="major">
            <h2>Testimonials</h2>
            <p>Hear what people have to say about working with me.</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <CollapsibleCard
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                testimonial={testimonial.testimonial}
                image={testimonial.image}
              />
            ))}
          </div>
        </section>

        <section id="projects" className="main special  bg-opacity-60 bg-gray-800">
          <header className="major">
            <h2>Discover what I've been working on recently.</h2>
            <a href="/blog/posts/intelli-casino"><h3>Intelli Casino</h3></a>
          </header>

          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center w-full md:w-2/3 lg:w-1/2">
              <a href="/blog/posts/intelli-casino">
                <img
                  src="/stellar/images/intelli-casino.png"
                  alt="Intelli Casino Screenshot"
                  className="rounded-lg shadow-lg mb-6 w-full"
                />
              </a>
              <p className="text-center">
                Intelli Casino is a real-time quiz platform built with Next.js and GraphQL. It allows users to create, play, and bet on quiz games. The platform features real-time updates, enabling spectators to monitor live games, place bets on players or the casino, and even participate in quizzes. It's a blend of fun, challenge, and strategy!
              </p>
            </div>
          </div>
          <footer className="special">
            <ul className="actions special">
              <li><a href="/blog/posts/intelli-casino" className="button primary">Learn more about it</a></li>
              <li><a href="https://intelli-casino.vercel.app" className="button">Visit the home page</a></li>
            </ul>
          </footer>
        </section>

        { lastPost && <section id="blog" className="main special">
          <header className="major">
            <h2>Check out my blog.</h2>
            <a href="/blog/posts/intelli-casino"><h3>My recent post</h3></a>
          </header>

          <div className="flex flex-wrap justify-center gap-8">
           <HeroPost title={lastPost.title} coverImage={lastPost.coverImage} date={lastPost.date} excerpt={lastPost.excerpt} slug={lastPost.slug} />
          </div>
          <a href="/blog" className="button primary mb-3">Read more articles</a>
        </section> }

      </div>
    </LayoutUpdater>
  )
}