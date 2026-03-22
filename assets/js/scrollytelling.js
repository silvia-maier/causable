document.addEventListener('DOMContentLoaded', function () {
  // Progressive enhancement: only animate if JS is available
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  // Mark all journey steps as hidden (they start visible in HTML for no-JS)
  var steps = document.querySelectorAll('.journey-step')
  steps.forEach(function (step) {
    step.classList.add('journey-step-hidden')
  })

  // IntersectionObserver to reveal steps on scroll
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('journey-step-hidden')
        entry.target.classList.add('journey-step-visible')
        observer.unobserve(entry.target)
      }
    })
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  })

  steps.forEach(function (step) {
    observer.observe(step)
  })

  // SVG path progressive reveal via clip-path
  // (Using clip-path instead of stroke-dashoffset so the dashed pattern stays intact)
  var pathContainer = document.querySelector('.journey-path-container')
  if (!pathContainer) return

  var journeySection = document.getElementById('journey')
  if (!journeySection) return

  // Start fully clipped (hidden from bottom)
  pathContainer.style.clipPath = 'inset(0 0 100% 0)'

  function updatePathProgress() {
    var rect = journeySection.getBoundingClientRect()
    var sectionTop = rect.top
    var sectionHeight = rect.height
    var windowHeight = window.innerHeight

    // Calculate how far through the journey section we've scrolled
    // The line lags behind scroll by ~35% of viewport height for a visible "drawing" effect
    // Progress = 0 when section first enters viewport
    // Progress = 1 when section bottom reaches viewport bottom
    var scrolled = windowHeight - sectionTop
    var lag = windowHeight * 0.35
    var revealAmount = Math.max(0, scrolled - lag)
    var progress = Math.min(1, revealAmount / (sectionHeight - lag))

    // Reveal from top to bottom
    var clipBottom = (1 - progress) * 100
    pathContainer.style.clipPath = 'inset(0 0 ' + clipBottom + '% 0)'
  }

  var ticking = false
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updatePathProgress()
        ticking = false
      })
      ticking = true
    }
  })

  // Initial call
  updatePathProgress()
})
