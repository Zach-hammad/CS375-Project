window.onload = function() {
    const nickname = localStorage.getItem('nickname');
    if (nickname) {
      document.getElementById('displayNickname').innerText = `Welcome, ${nickname}!`;
    } else {
        window.location.href = "/login.html";
    }
  }