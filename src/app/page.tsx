import { LayoutUpdater } from "./_components/LayoutUpdater";
import { Code2, Database, Zap, Rocket } from 'lucide-react'
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

        <section id="intro" className="main">
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
              <h2 className="text-4xl font-light text-white mb-4">My Services</h2>
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

        <section id="companies" className="main special">
          <header className="major">
            <h2>Companies I've Worked For</h2>
            <p>Explore my journey through these amazing companies.</p>
          </header>
          <ul className="flex flex-wrap justify-center gap-8">
            {[
              { name: "Company A", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-a" },
              { name: "Company B", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-b" },
              { name: "Company C", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-c" },
              { name: "Company D", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-d" },
              { name: "Company E", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-e" },
            ].map((company, index) => (
              <li key={index} className="flex flex-col items-center">
                <a href={company.link} className="block transition-transform duration-300 hover:scale-110">
                  <img src={company.logo} alt={`${company.name} Logo`} className="w-42 h-24 mb-2" />
                </a>
                <span className="text-white">{company.name}</span>
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
                name: "John Doe",
                role: "CEO at Company A",
                testimonial: "Working with you was a fantastic experience. Your expertise and dedication were evident in every project.",
                image: "/assets/blog/authors/joe.jpeg",
              },
              {
                name: "Jane Smith",
                role: "CTO at Company B",
                testimonial: "Your ability to solve complex problems and deliver high-quality results is unmatched.",
                image: "/assets/blog/authors/tim.jpeg",
              },
              {
                name: "Alice Johnson",
                role: "Product Manager at Company C",
                testimonial: "I appreciate your attention to detail and commitment to excellence. You truly go above and beyond.",
                image: "stellar/images/intro_shot.jpg",
              },
              // Add more testimonials as needed
            ].map((testimonial, index) => (
              <div key={index} className="border border-white flex flex-col items-center text-center p-6 bg-opacity-30 bg-gray-800 rounded-lg shadow-lg">
                <img src={testimonial.image} alt={`${testimonial.name}`} className="w-16 h-16 rounded-full mb-4" />
                <h3 className="text-xl font-semibold text-white">{testimonial.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{testimonial.role}</p>
                <p className="text-lg text-gray-300">"{testimonial.testimonial}"</p>
              </div>
            ))}
          </div>
        </section>

        <section id="technologies" className="main special">
          <header className="major">
            <h2>Technologies I Work With</h2>
            <p>Front-end, Back-end, and Everything in Between</p>
          </header>

          <ul className="flex flex-wrap justify-center gap-8">
            {[
              { name: "Company A", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-a" },
              { name: "Company B", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-b" },
              { name: "Company C", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-c" },
              { name: "Company D", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-d" },
              { name: "Company E", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-e" },
              { name: "Company C", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-c" },
              { name: "Company D", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-d" },
              { name: "Company E", logo: '/stellar/images/small_logo.png', link: "/blog/posts/company-e" },
            ].map((company, index) => (
              <li key={index} className="flex flex-col items-center">
                <a href={company.link} className="block transition-transform duration-300 hover:scale-110">
                  <img src={company.logo} alt={`${company.name} Logo`} className="w-42 h-24 mb-2" />
                </a>
                <span className="text-white">{company.name}</span>
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
            {/* Project: Intelli Casino */}
            <div className="flex flex-col items-center w-full md:w-2/3 lg:w-1/2">
              <img
                src="/stellar/images/intelli-casino.png"
                alt="Intelli Casino Screenshot"
                className="rounded-lg shadow-lg mb-6 w-full"
              />
              {/* <h3>Intelli Casino</h3> */}
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