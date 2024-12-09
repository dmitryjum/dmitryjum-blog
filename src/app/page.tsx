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
        { href: '#second', label: 'Second Section' },
        { href: '#cta', label: 'Get Started' },
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

        <section id="second" className="main special">
          <header className="major">
            <h2>Ipsum consequat</h2>
            <p>Donec imperdiet consequat consequat. Suspendisse feugiat congue<br />
              posuere. Nulla massa urna, fermentum eget quam aliquet.</p>
          </header>
          <ul className="statistics">
            <li className="style1">
              <span className="icon solid fa-code-branch"></span>
              <strong>5,120</strong> Etiam
            </li>
            <li className="style2">
              <span className="icon fa-folder-open"></span>
              <strong>8,192</strong> Magna
            </li>
            <li className="style3">
              <span className="icon solid fa-signal"></span>
              <strong>2,048</strong> Tempus
            </li>
            <li className="style4">
              <span className="icon solid fa-laptop"></span>
              <strong>4,096</strong> Aliquam
            </li>
            <li className="style5">
              <span className="icon fa-gem"></span>
              <strong>1,024</strong> Nullam
            </li>
          </ul>
          <p className="content">Nam elementum nisl et mi a commodo porttitor. Morbi sit amet nisl eu arcu faucibus hendrerit vel a risus. Nam a orci mi, elementum ac arcu sit amet, fermentum pellentesque et purus. Integer maximus varius lorem, sed convallis diam accumsan sed. Etiam porttitor placerat sapien, sed eleifend a enim pulvinar faucibus semper quis ut arcu. Ut non nisl a mollis est efficitur vestibulum. Integer eget purus nec nulla mattis et accumsan ut magna libero. Morbi auctor iaculis porttitor. Sed ut magna ac risus et hendrerit scelerisque. Praesent eleifend lacus in lectus aliquam porta. Cras eu ornare dui curabitur lacinia.</p>
          <footer className="major">
            <ul className="actions special">
              <li><a href="generic.html" className="button">Learn More</a></li>
            </ul>
          </footer>
        </section>

        <section id="cta" className="main special">
          <header className="major">
            <h2>Congue imperdiet</h2>
            <p>Donec imperdiet consequat consequat. Suspendisse feugiat congue<br />
              posuere. Nulla massa urna, fermentum eget quam aliquet.</p>
          </header>
          <footer className="major">
            <ul className="actions special">
              <li><a href="generic.html" className="button primary">Get Started</a></li>
              <li><a href="generic.html" className="button">Learn More</a></li>
            </ul>
          </footer>
        </section>

      </div>
    </LayoutUpdater>
  )
}