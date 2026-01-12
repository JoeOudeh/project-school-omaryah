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
