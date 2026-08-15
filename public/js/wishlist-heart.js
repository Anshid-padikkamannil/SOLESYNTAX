  (function () {
    'use strict';

    // ---- Heart Burst Function ----
    function burstHearts(x, y) {
      const heartSymbols = ['♥', '❤', '💖', '💗', '💕', '💓', '❤️', '🧡', '💛', '💚', '💙', '💜'];
      const colors = ['#ff6b6b', '#ff4757', '#ff6348', '#ff7f50', '#e74c3c', '#ff5e62', '#ff3b3b'];

      for (let i = 0; i < 22; i++) {
        const el = document.createElement('span');
        el.className = 'heart-particle';
        el.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        el.style.color = colors[Math.floor(Math.random() * colors.length)];
        el.style.fontSize = (16 + Math.random() * 30) + 'px';
        el.style.left = x + 'px';
        el.style.top = y + 'px';

        const angle = Math.random() * 2 * Math.PI;
        const distance = 80 + Math.random() * 200;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 60;
        const rot = (Math.random() - 0.5) * 720;

        el.style.setProperty('--tx', tx + 'px');
        el.style.setProperty('--ty', ty + 'px');
        el.style.setProperty('--rot', rot + 'deg');
        el.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';

        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2000);
      }
    }

    // ---- Wishlist Toggle ----
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');

    wishlistBtns.forEach(btn => {
      btn.addEventListener('click', async function (e) {
        e.stopPropagation();
        e.preventDefault();

        const productId = this.dataset.product;
        const isAdded = this.classList.contains('added');

        // Determine endpoint and method
        const url = isAdded
          ? `/wishlist/remove-from-wishlist/${productId}`
          : `/wishlist/add-to-wishlist/${productId}`;

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });

          const data = await response.json();

          if (!response.ok) {
            alert(data.message || 'Unable to update wishlist');
            return;
          }

          // Toggle UI
          if (isAdded) {
            // Remove from wishlist
            this.classList.remove('added');
            this.textContent = '♡';
          } else {
            // Add to wishlist
            this.classList.add('added');
            this.textContent = '♥';
            // Burst hearts only on add
            const rect = this.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            burstHearts(cx, cy);
          }

          // Optional: show a toast message (you can replace alert with a better UI)
          // if you have a toast library, e.g. `toast.success(data.message)`

        } catch (err) {
          console.error('Wishlist error:', err);
          alert('Something went wrong. Please try again.');
        }
      });
    });

  })();