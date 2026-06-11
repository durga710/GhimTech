document.getElementById('waitlist-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const message = document.getElementById('response-message');
  
  if (!email) {
    message.style.color = 'yellow';
    message.textContent = 'Please enter a valid email.';
    return;
  }

  message.style.color = 'lime';
  message.textContent = 'Thank you for joining the GhimTech waitlist!';
  document.getElementById('waitlist-form').reset();
});