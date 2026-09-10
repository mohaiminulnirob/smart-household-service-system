export function renderFooterInto(targetId = 'footer-dynamic') {
  const container =
    document.getElementById(targetId) ||
    document.getElementById('footer');

  if (!container) return;

  const year = new Date().getFullYear();

  const footer = document.createElement('footer');
  footer.className = 'footer';

  footer.innerHTML = `
    <div class="container">
      <div class="footer-brand">
        <div class="logo">
          <img src="/assets/images/fixmate-logo.png" alt="FixMate" class="logo-icon">
          <span>FixMate</span>
        </div>
        <p>Connecting you with verified professionals for all your home service needs.</p>
      </div>
      <div>
        <h4>Quick Links</h4>
        <ul>
          <li><a href="/index.html">Home</a></li>
          <li><a href="/pages/aboutUs.html">About Us</a></li>
          <li><a href="/pages/auth/register-user.html">Book a Service</a></li>
          <li><a href="/pages/auth/register-worker.html">Join as Worker</a></li>
        </ul>
      </div>
      <div>
        <h4>Services</h4>
        <ul>
          <li><a href="/pages/aboutUs.html#services">Plumbing</a></li>
          <li><a href="/pages/aboutUs.html#services">Electrical</a></li>
          <li><a href="/pages/aboutUs.html#services">Cleaning</a></li>
          <li><a href="/pages/aboutUs.html#services">Carpentry</a></li>
        </ul>
      </div>
      <div>
        <h4>Support</h4>
        <ul>
          <li><a href="/pages/auth/login.html">Sign In</a></li>
          <li><a href="/pages/auth/register-user.html">Create Account</a></li>
          <li><a href="/pages/aboutUs.html">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="container">
      <div class="footer-bottom">
        <span>&copy; ${year} FixMate. All rights reserved.</span>
        <span>Built with care for your home</span>
      </div>
    </div>
  `;

  container.innerHTML = '';
  container.appendChild(footer);
}

export default renderFooterInto;
