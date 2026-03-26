const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-lg font-bold mb-4">UniCare</h3>
          <p className="text-sm">
            Empowering university students with accessible, secure, and private mental health counseling.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-blue-400 transition-colors">Home</a></li>
            <li><a href="/about" className="hover:text-blue-400 transition-colors">About Us</a></li>
            <li><a href="/appointment/counsellors" className="hover:text-blue-400 transition-colors">Find a Counsellor</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <p className="text-sm">support@unicare.edu<br />1-800-UNICARE</p>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} UniCare Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
