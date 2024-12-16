import React, { useState } from 'react';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setStatus('Message sent successfuly!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('Failed to send message.');
      }
    } catch (error) {
      console.error(error);
      setStatus('An error occured');
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setStatus('');
  };

  return (
    <form onSubmit={handleSubmit} onReset={handleReset}>
      <div className="row gtr-uniform">
        <div className="col-6 col-12-xsmall">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
        </div>
        <div className="col-6 col-12-xsmall">
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        </div>
        <div className="col-12">
          <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Enter your message" rows={6} required></textarea>
        </div>
        <div className="col-12">
          <ul className="actions">
            <li><input type="submit" value="Send Message" className="primary" /></li>
            <li><input type="reset" value="Reset" /></li>
          </ul>
        </div>
      </div>
      {status && <p>{status}</p>}
    </form>
  )
}

export default ContactForm;