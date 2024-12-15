import React from 'react';

const ContactForm: React.FC = () => {
  return (
    <form method="post" action="#">
      <div className="row gtr-uniform">
        <div className="col-6 col-12-xsmall">
          <input type="text" name="name" id="name" placeholder="Name" required />
        </div>
        <div className="col-6 col-12-xsmall">
          <input type="email" name="email" id="email" placeholder="Email" required />
        </div>
        <div className="col-12">
          <textarea name="message" id="message" placeholder="Enter your message" rows={6} required></textarea>
        </div>
        <div className="col-12">
          <ul className="actions">
            <li><input type="submit" value="Send Message" className="primary" /></li>
            <li><input type="reset" value="Reset" /></li>
          </ul>
        </div>
      </div>
    </form>
  )
}

export default ContactForm;