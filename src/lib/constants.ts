export const EXAMPLE_PATH = "blog-starter";
export const CMS_NAME = "Markdown";
import { Code2, Database, Zap, Rocket, BarChart2, CuboidIcon as Cube, TestTube, Users } from 'lucide-react'
export const HOME_OG_IMAGE_URL =
  "https://og-image.vercel.app/Next.js%20Blog%20Starter%20Example.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg";

export const SERVICES = [
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

export const NAVLINKS = [
  { href: '#intro', label: 'Introduction' },
  { href: '#services', label: 'My Services' },
  { href: '#companies', label: "My clients" },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#technologies', label: 'My Technologies' },
  { href: '#projects', label: 'Recent work' },
  { href: '/blog', label: 'Blog' },
];

export const COMPANIES = [
  { name: "Atlas Obscura", logo: '/stellar/images/companies/ao.png', link: "/blog/posts/atlas-obscura" },
  { name: "Invibox", logo: '/stellar/images/companies/invibox.png', link: "/blog/posts/invibox" },
  { name: "iVFqc", logo: '/stellar/images/companies/ivfqc.png', link: "/blog/posts/ivfqc" },
  { name: "Skillit", logo: '/stellar/images/companies/skillit.png', link: "/blog/posts/skillit" },
  { name: "XO Group", logo: '/stellar/images/companies/xogroup.jpeg', link: "/blog/posts/xogroup" },
  { name: "Alumnifire", logo: '/stellar/images/companies/alumnifire.png', link: "/blog/posts/alumnifire" },
];

export const TESTIMONIALS = [
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
];

export const TECHNOLOGIES = [
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
];