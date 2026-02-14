// ===== Theme Toggle =====
const themeToggle = document.getElementById("themeToggle")
const body = document.body

// Default to dark mode (no 'light' class)
themeToggle.addEventListener("click", () => {
  body.classList.toggle("light")
  const isLight = body.classList.contains("light")
  localStorage.setItem("theme", isLight ? "light" : "dark")
})

// Check for saved theme preference
const savedTheme = localStorage.getItem("theme")
if (savedTheme === "light") {
  body.classList.add("light")
}

// ===== Mobile Menu Toggle =====
const burgerMenu = document.getElementById("burgerMenu")
const mobileMenu = document.getElementById("mobileMenu")

burgerMenu.addEventListener("click", () => {
  burgerMenu.classList.toggle("active")
  mobileMenu.classList.toggle("active")
})

// Close mobile menu when clicking a link
mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    burgerMenu.classList.remove("active")
    mobileMenu.classList.remove("active")
  })
})

// ===== Navbar Background on Scroll =====
const navbar = document.getElementById("navbar")

window.addEventListener("scroll", () => {
  if (window.scrollY > 20) {
    navbar.classList.add("scrolled")
  } else {
    navbar.classList.remove("scrolled")
  }
})

// ===== Scroll Animations =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible")
    }
  })
}, observerOptions)

document.querySelectorAll(".fade-in").forEach((element) => {
  observer.observe(element)
})

// ===== Statistics Counter Animation =====
const statNumbers = document.querySelectorAll(".stat-number")

const countUp = (element, target, suffix) => {
  let current = 0
  const duration = 2000
  const steps = 60
  const increment = target / steps

  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      element.textContent = target + suffix
      clearInterval(timer)
    } else {
      element.textContent = Math.floor(current) + suffix
    }
  }, duration / steps)
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = Number.parseInt(entry.target.getAttribute("data-target"))
        const suffix = entry.target.getAttribute("data-suffix") || ""
        countUp(entry.target, target, suffix)
        statsObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.5 },
)

statNumbers.forEach((stat) => {
  statsObserver.observe(stat)
})

// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      const headerOffset = 80
      const elementPosition = target.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  })
})

// ===== Hero Slider =====
const slides = document.querySelectorAll('.hero-slide')
const dots = document.querySelectorAll('.dot')
const prevBtn = document.querySelector('.slider-btn.prev')
const nextBtn = document.querySelector('.slider-btn.next')
let currentSlide = 0
let slideInterval

function goToSlide(index) {
  slides.forEach(s => s.classList.remove('active'))
  dots.forEach(d => d.classList.remove('active'))
  currentSlide = index
  if (currentSlide >= slides.length) currentSlide = 0
  if (currentSlide < 0) currentSlide = slides.length - 1
  slides[currentSlide].classList.add('active')
  dots[currentSlide].classList.add('active')
}

function startSlider() {
  slideInterval = setInterval(() => {
    goToSlide(currentSlide + 1)
  }, 5000)
}

function resetSlider() {
  clearInterval(slideInterval)
  startSlider()
}

if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetSlider() })
  nextBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetSlider() })
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    goToSlide(parseInt(dot.getAttribute('data-slide')))
    resetSlider()
  })
})

startSlider()

// ===== Modal Functions =====
function openModal(id) {
  const modal = document.getElementById(id)
  if (modal) {
    modal.classList.add('active')
    document.body.style.overflow = 'hidden'
  }
}

function closeModal(id) {
  const modal = document.getElementById(id)
  if (modal) {
    modal.classList.remove('active')
    document.body.style.overflow = ''
  }
}

// Close modal when clicking outside
document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active')
      document.body.style.overflow = ''
    }
  })
})

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
      modal.classList.remove('active')
      document.body.style.overflow = ''
    })
  }
})

// ===== Comment Section =====
const commentForm = document.getElementById('commentForm')
const userCommentsContainer = document.getElementById('userComments')

// Load saved comments from localStorage
let comments = JSON.parse(localStorage.getItem('omreyahComments') || '[]')
renderComments()

commentForm.addEventListener('submit', (e) => {
  e.preventDefault()
  
  const name = document.getElementById('commenterName').value.trim()
  const role = document.getElementById('commenterRole').value
  const text = document.getElementById('commentText').value.trim()
  
  if (!name || !text) return
  
  const comment = {
    name,
    role,
    text,
    date: new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
    initial: name.charAt(0)
  }
  
  comments.unshift(comment)
  localStorage.setItem('omreyahComments', JSON.stringify(comments))
  renderComments()
  
  // Reset form
  commentForm.reset()
  
  // Show success feedback
  const btn = commentForm.querySelector('.btn')
  const originalText = btn.innerHTML
  btn.innerHTML = 'تم الإرسال بنجاح!'
  btn.style.backgroundColor = '#16a34a'
  setTimeout(() => {
    btn.innerHTML = originalText
    btn.style.backgroundColor = ''
  }, 2000)
})

function renderComments() {
  const commentsHTML = comments.map(c => `
    <div class="comment-card">
      <div class="comment-header">
        <div class="comment-avatar">${c.initial}</div>
        <div class="comment-meta">
          <h5>${c.name} <span class="comment-role">${c.role}</span></h5>
          <span>${c.date}</span>
        </div>
      </div>
      <div class="comment-body">${c.text}</div>
    </div>
  `).join('')
  
  userCommentsContainer.innerHTML = `<h4>آراء الزوار (${comments.length})</h4>` + commentsHTML
  
  if (comments.length === 0) {
    userCommentsContainer.innerHTML = `<h4>آراء الزوار</h4><p style="text-align:center;color:var(--foreground-muted);">كن أول من يشاركنا رأيه!</p>`
  }
}
