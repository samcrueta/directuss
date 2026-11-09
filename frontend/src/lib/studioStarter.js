export const STARTER_COMPONENT = {
  name: "Profile card",
  description: "A small profile card with a follow toggle.",
  html: `<main class="profile-shell">
  <article class="profile-card">
    <div class="avatar" aria-hidden="true">AL</div>
    <h1>Ada Lovelace</h1>
    <p class="role">Mathematician · First programmer</p>
    <p class="bio">Writing the first algorithm intended for a machine.</p>
    <button id="follow" type="button" aria-pressed="false">Follow</button>
  </article>
</main>`,
  css: `.profile-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background: radial-gradient(circle at top, #dbeafe, #eef2ff 55%, #f8fafc);
}

.profile-card {
  width: min(100%, 320px);
  padding: 32px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(30, 41, 59, 0.14);
  text-align: center;
}

.avatar {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

h1 {
  margin: 0 0 6px;
  font-size: 1.5rem;
}

.role {
  margin: 0 0 12px;
  color: #6b7280;
  font-size: 0.9rem;
}

.bio {
  margin: 0 0 22px;
  color: #374151;
  line-height: 1.6;
  font-size: 0.92rem;
}

button {
  border: 0;
  border-radius: 999px;
  padding: 10px 22px;
  background: #111827;
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}

button[aria-pressed="true"] {
  background: #10b981;
}`,
  js: `const button = document.getElementById('follow');

button.addEventListener('click', () => {
  const following = button.getAttribute('aria-pressed') === 'true';
  button.setAttribute('aria-pressed', String(!following));
  button.textContent = following ? 'Follow' : 'Following';
  console.log(following ? 'Unfollowed Ada' : 'Followed Ada');
});`
};
