'use client';
import React, { useState } from 'react';
import Modal from './modal';
import ContactForm from './contact-form';

export function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <footer id="footer">
        <section>
          <h2>Let's Create Something Exceptional</h2>
          <p>With a decade of experience in full-stack development and a passion for emerging technologies, I bring both technical expertise and creative problem-solving to every project. Whether you need a scalable web application, smart contract implementation, or real-time platform, I'm ready to help turn your vision into reality.</p>
          <ul className="actions">
            <li><a href="/blog/posts/about-me" className="button">Learn more about me</a></li>
            {/* <li><a href="#" className="button primary" onClick={openModal}>Contact Me</a></li> */}
          </ul>
        </section>
        <section>
          <h2>Contact info</h2>
          <dl className="alt">
            <dt>Email</dt>
            <dd><a href="#">dmitryjum@gmail.com</a></dd>
          </dl>
          <ul className="icons">
            <li><a href="https://www.instagram.com/ddxfiler/" className="icon brands fa-instagram alt"><span className="label">Instagram</span></a></li>
            <li><a href="https://www.github.com/dmitryjum" className="icon brands fa-github alt"><span className="label">GitHub</span></a></li>
            <li><a href="https://www.linkedin.com/in/dmitryjum" className="icon brands fa-linkedin alt"><span className="label">Dribbble</span></a></li>
            <li><a href="/assets/DmitryJumResume.pdf" className="icon fa-file-pdf alt"><span className="label">My Resume</span></a></li>
          </ul>
        </section>
        <p className="copyright">&copy; Developed by Dmitry Jum. Built with Next.js. Design: <a href="https://html5up.net">HTML5 UP</a>.</p>
      </footer>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>Contact Me</h2>
        <ContactForm />
      </Modal>
    </>
  );
}

export default Footer;
