const User = require("../../models/User.model")

const textarea = document.querySelector('textarea[name="content"]');
const dropdown = document.querySelector('#user-dropdown');

textarea.addEventListener('input', async () => {
  const content = textarea.value;
  const atIndex = content.lastIndexOf('@');
  
  if (atIndex !== -1) {
    const searchTerm = content.slice(atIndex + 1);
    const response = await User.find()
    const users = await response.json();
    // clear previous dropdown options
    dropdown.innerHTML = '';
    // add new options
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.username;
      dropdown.appendChild(option);
    });
    // show dropdown
    dropdown.style.display = 'block';
  } else {
    // hide dropdown if no "@" symbol
    dropdown.style.display = 'none';
  }
});
