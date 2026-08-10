(function () {
  "use strict";

  // Sidebar navigation
  const sidebarLinks = document.querySelectorAll("#accountSidebar .nav-link");
  const sections = document.querySelectorAll(".page-section");

  function showPage(pageId) {
    sections.forEach((s) => s.classList.remove("active"));
    const target = document.getElementById("page-" + pageId);
    if (target) target.classList.add("active");
    sidebarLinks.forEach((l) => l.classList.remove("active"));
    const activeLink = document.querySelector('#accountSidebar .nav-link[data-page="' + pageId + '"]');
    if (activeLink) activeLink.classList.add("active");
  }

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var page = this.dataset.page;
      if (page === "logout") {
        showPage("logout");
        return;
      }
      showPage(page);
    });
  });

  // View order details
  document.querySelectorAll(".view-order-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var orderId = this.dataset.order;
      const orderDetailId = document.getElementById("orderDetailId");
      if (orderDetailId) orderDetailId.textContent = " - " + orderId;
      showPage("order-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Back to orders
  const backToOrdersBtn = document.querySelector('#page-order-detail .btn-link[data-page="orders"]');
  if (backToOrdersBtn) {
    backToOrdersBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showPage("orders");
    });
  }

  // Edit profile toggle
  const editProfileBtn = document.getElementById("editProfileBtn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", function () {
      const display = document.querySelector(".profile-display");
      const edit = document.querySelector(".profile-edit");
      if (display && edit) {
        display.style.display = "none";
        edit.style.display = "block";
      }
    });
  }

  const cancelEditProfile = document.getElementById("cancelEditProfile");
  if (cancelEditProfile) {
    cancelEditProfile.addEventListener("click", function () {
      const display = document.querySelector(".profile-display");
      const edit = document.querySelector(".profile-edit");
      if (display && edit) {
        display.style.display = "block";
        edit.style.display = "none";
      }
    });
  }

  // const profileForm = document.getElementById("profileForm");
  // if (profileForm) {
  //   profileForm.addEventListener("submit", function (e) {
  //     e.preventDefault();
  //     alert("Profile updated successfully! (demo)");
  //     const display = document.querySelector(".profile-display");
  //     const edit = document.querySelector(".profile-edit");
  //     if (display && edit) {
  //       display.style.display = "block";
  //       edit.style.display = "none";
  //     }
  //   });
  // }

  // Address actions
  const addAddressBtn = document.getElementById("addAddressBtn");
  if (addAddressBtn) {
    addAddressBtn.addEventListener("click", function () {
      const form = document.getElementById("addAddressForm");
      if (form) form.style.display = form.style.display === "none" ? "block" : "none";
    });
  }

  const cancelAddAddress = document.getElementById("cancelAddAddress");
  if (cancelAddAddress) {
    cancelAddAddress.addEventListener("click", function () {
      const form = document.getElementById("addAddressForm");
      if (form) form.style.display = "none";
    });
  }

  document.querySelectorAll(".edit-address").forEach((btn) => {
    btn.addEventListener("click", function () {
      alert("Edit address: " + this.dataset.address + " (demo)");
    });
  });

  document.querySelectorAll(".delete-address").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (confirm("Delete this address?")) {
        const card = this.closest(".address-card");
        if (card) card.remove();
      }
    });
  });

  document.querySelectorAll(".set-default-address").forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".address-card");
      if (!card) return;
      document.querySelectorAll(".address-card").forEach((c) => {
        c.classList.remove("default");
        c.style.borderColor = "#e0e0e0";
        c.style.background = "#fff";
        const badge = c.querySelector(".bg-success");
        if (badge) badge.remove();
      });
      card.classList.add("default");
      card.style.borderColor = "#88c8bc";
      card.style.background = "#f8fffe";
      const badge = document.createElement("span");
      badge.className = "badge bg-success ms-2";
      badge.textContent = "Default";
      const flex = card.querySelector(".d-flex");
      if (flex) flex.appendChild(badge);
      alert("Default address updated!");
    });
  });

  // Wishlist actions
  document.querySelectorAll(".move-to-cart").forEach((btn) => {
    btn.addEventListener("click", function () {
      alert("Item moved to cart! (demo)");
      const item = this.closest(".wishlist-item");
      if (item) item.remove();
    });
  });

  document.querySelectorAll(".remove-wishlist").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (confirm("Remove from wishlist?")) {
        const item = this.closest(".wishlist-item");
        if (item) item.remove();
      }
    });
  });

  // Logout confirm
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to logout?")) {
        alert("Logging out... (redirect to home)");
        // window.location.href = '/users/logout';
      }
    });
  }

  // Close mobile menu on link click
  document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
    link.addEventListener("click", function () {
      const collapse = document.getElementById("mainNavbar");
      if (window.innerWidth < 992 && collapse) {
        const bsCollapse = bootstrap.Collapse.getInstance(collapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });
})();
