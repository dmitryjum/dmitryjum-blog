import { LayoutUpdater } from "./_components/LayoutUpdater";
import cn from "classnames";
import CollapsibleCard from "./_components/collapsible-card";
import { NAVLINKS, SERVICES, COMPANIES, TESTIMONIALS, TECHNOLOGIES } from "@/lib/constants";

export default function HomePage() {
  return (
    <LayoutUpdater
      headerTitle='Dmitry Jum'
      headerSubtitle='Software Engineer | Web Developer'
      navLinks={NAVLINKS}
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
                <li><a href="#footer" className="button">Reach out</a></li>
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

        <section id="companies" className="main special bg-opacity-30 bg-gray-800">
          <header className="major">
            <h2>Companies and clients I've worked for</h2>
            <p>Explore my journey through these amazing companies. Click the logo to learn more.</p>
          </header>
          <ul className="flex flex-wrap justify-center gap-8">
            {COMPANIES.map((company, index) => (
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

        <section id="technologies" className="main special bg-opacity-30 bg-gray-800">
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

        <section id="projects" className="main special">
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

      </div>
    </LayoutUpdater>
  )
}