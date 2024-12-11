import { LayoutUpdater } from "./_components/LayoutUpdater";
import { Code2, Database, Zap, Rocket, BarChart2, CuboidIcon as Cube, TestTube, Users } from 'lucide-react'
import cn from "classnames";

export default function HomePage() {
  const services = [
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
  ]

  return (
    <LayoutUpdater
      headerTitle='Dmitry Jum'
      headerSubtitle='Software Engineer | Web Developer'
      navLinks={[
        { href: '#intro', label: 'Introduction' },
        { href: '#services', label: 'My Services' },
        { href: '#companies', label: "My clients" },
        { href: '#testimonials', label: 'Testimonials' },
        { href: '#technologies', label: 'My Technologies' },
        { href: '#projects', label: 'Recent work' },
        { href: '/blog', label: 'Blog' },
      ]}
    >
      <div id="main">

        <section id="intro" className="main bg-opacity-30 bg-gray-800">
          <div className="spotlight">
            <div className="content">
              <header className="major">
                <h2>Building Modern Web Applications Tailored to Your Needs.</h2>
              </header>
              <p>I’m Dima, a full-stack developer with expertise in building scalable applications using modern tools like React.js,
                 Ruby on Rails, and TypeScript. Over the years, I’ve helped startups and established companies streamline their processes,
                  enhance user experiences, and scale their platforms efficiently.</p>
              <ul className="actions">
                <li><a href="/blog/posts/about-me" className="button">Learn More About Me</a></li>
              </ul>
            </div>
            <span className="image"><img src="stellar/images/intro_shot.jpg" alt="" /></span>
          </div>
        </section>

        <section id="services" className="main">
          <div className="container mx-auto px-4">
            <header className="text-center mb-16">
              <h2 className="text-4xl font-light text-white mb-4">My Services and Expertise</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto"></div>
            </header>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 max-w-7xl mx-auto">
              {services.map((service, index) => (
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
                <li><a href="generic.html" className="button">Get In Touch</a></li>
              </ul>
            </footer>
          </div>
        </section>

        <section id="companies" className="main special bg-opacity-30 bg-gray-800">
          <header className="major">
            <h2>Companies and clients I've worked for</h2>
            <p>Explore my journey through these amazing companies.</p>
          </header>
          <ul className="flex flex-wrap justify-center gap-8">
            {[
              { name: "Atlas Obscura", logo: '/stellar/images/companies/ao.png', link: "/blog/posts/atlas-obscura" },
              { name: "Invibox", logo: '/stellar/images/companies/invibox.png', link: "/blog/posts/invibox" },
              { name: "iVFqc", logo: '/stellar/images/companies/ivfqc.png', link: "/blog/posts/ivfqc" },
              { name: "Skillit", logo: '/stellar/images/companies/skillit.png', link: "/blog/posts/skillit" },
              { name: "XO Group", logo: '/stellar/images/companies/xogroup.jpeg', link: "/blog/posts/xogroup" },
              { name: "Alumnifire", logo: '/stellar/images/companies/alumnifire.png', link: "/blog/posts/alumnifire" },
            ].map((company, index) => (
              <li key={index} className="flex flex-col items-center">
                <a href={company.link} className="block transition-transform duration-300 hover:scale-110">
                  <img src={company.logo} alt={`${company.name} Logo`} className="w-42 h-24 mb-2" />
                </a>
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
            {[
              {
                name: "Trip Tate",
                role: "Co-Founder | Software Engineer at Alumnifire",
                testimonial: "Dmitry is a driven and inquisitive software engineer who is always looking to learn new things. Those traits displayed themselves in several ways as an engineer at Alumnifire. For example, on his own initiative, Dmitry wanted to improve his test writing and pushed us to increase our test coverage. Similarly, he encouraged us to take steps to provide smoother front-end javascript interactivity, and often went above and beyond the spec to provide a smoother UX. As a person, he's humble, thoughtful, and fun. As a small team and young company we didn't really have much in the way of office traditions, but Dmitry took it upon himself to personally purchase a cake for a fellow coworker on their birthday. He really tries to get to know those around him and takes a personal interest in them. I really enjoyed working with Dmitry",
                image: "/stellar/images/testimonials/trip_tate.jpeg",
              },
              {
                name: "Tyler Adams",
                role: "Director of Engineering at Bentobox",
                testimonial: `Dmitry is a passionate and adept developer that I am fortunate to have worked with.
  I worked with him over three months at an email startup, and everyday he came in with a positive,
  can-do attitude. He has an incredible technical ability-- he was able to quickly rewrite an SMTP server built on Node,
  despite having initially little experience with writing Node applications.
  That's the wonderful thing about Dmitry-- he has a hunger for learning and for writing clean, modular code.
  That drive is infectious, and I surely benefited from sitting next to him everyday.
  On top of all of this, Dmitry is an absolute pleasure to work with. He is friendly, and highly communicative when he senses there is a problem or if he needs advice.
  This is key in an Agile environment. The next team that Dmitry joins will have a top-notch developer and great team player.`,
                image: "/stellar/images/testimonials/tyler_adams.jpeg",
              },
              // Add more testimonials as needed
            ].map((testimonial, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 bg-opacity-30 bg-gray-800 rounded-lg shadow-lg">
                <img src={testimonial.image} alt={`${testimonial.name}`} className="w-16 h-16 rounded-full mb-4" />
                <h3 className="text-xl font-semibold text-white">{testimonial.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{testimonial.role}</p>
                <p className="text-lg text-gray-300">"{testimonial.testimonial}"</p>
              </div>
            ))}
          </div>
        </section>

        <section id="technologies" className="main special bg-opacity-30 bg-gray-800">
          <header className="major">
            <h2>Technologies I Work With</h2>
            <p>Front-end, Back-end, and Everything in Between</p>
          </header>

          <ul className="flex flex-wrap justify-center gap-8">
            {[
              { name: "AWS", logo: '/stellar/images/tech_logos/AWS.png' },
              { name: "CicrleCI", logo: '/stellar/images/tech_logos/CircleCI.png' },
              { name: "Docker", logo: '/stellar/images/tech_logos/Docker.png' },
              { name: "ExpressJS", logo: '/stellar/images/tech_logos/Express.png' },
              { name: "GraphQL", logo: '/stellar/images/tech_logos/GraphQL.png' },
              { name: "HTML", logo: '/stellar/images/tech_logos/HTML5.png' },
              { name: "JavaScript", logo: '/stellar/images/tech_logos/JavaScript.png' },
              { name: "MongoDB", logo: '/stellar/images/tech_logos/MongoDB.png' },
              { name: "NextJs", logo: '/stellar/images/tech_logos/Next.js.png' },
              { name: "NodeJS", logo: '/stellar/images/tech_logos/Node.js.png' },
              { name: "PostgresQL", logo: '/stellar/images/tech_logos/PostgresSQL.png' },
              { name: "Redis", logo: '/stellar/images/tech_logos/Redis.png' },
              { name: "ReactJS", logo: '/stellar/images/tech_logos/React.png' },
              { name: "RSpec", logo: '/stellar/images/tech_logos/RSpec.png' },
              { name: "Ruby on Rails", logo: '/stellar/images/tech_logos/Ruby on Rails.png' },
              { name: "Ruby", logo: '/stellar/images/tech_logos/Ruby.png' },
              { name: "Solidity", logo: '/stellar/images/tech_logos/Solidity.png' },
              { name: "Ethereum", logo: '/stellar/images/tech_logos/eth.webp' },
              { name: "Tailwind CSS", logo: '/stellar/images/tech_logos/Tailwind CSS.png' },
              { name: "TypeScript", logo: '/stellar/images/tech_logos/TypeScript.png' },
              { name: "WordPress", logo: '/stellar/images/tech_logos/WordPress.png' },
              
            ].map((tech, index) => (
              <li key={index} className="flex flex-col items-center">
                <img src={tech.logo} alt={`${tech.name} Logo`} className="w-42 h-24 mb-2 transition-transform duration-300 hover:scale-110" />
                <span className="text-white">{tech.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="projects" className="main special">
          <header className="major">
            <h2>Discover what I've been working on recently.</h2>
            <h3>Intelli Casino</h3>
          </header>

          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center w-full md:w-2/3 lg:w-1/2">
              <img
                src="/stellar/images/intelli-casino.png"
                alt="Intelli Casino Screenshot"
                className="rounded-lg shadow-lg mb-6 w-full"
              />
              <p className="text-center">
                Intelli Casino is a real-time quiz platform built with Next.js and GraphQL. It allows users to create, play, and bet on quiz games. The platform features real-time updates, enabling spectators to monitor live games, place bets on players or the casino, and even participate in quizzes. It's a blend of fun, challenge, and strategy!
              </p>
            </div>
          </div>
        </section>

      </div>
    </LayoutUpdater>
  )
}